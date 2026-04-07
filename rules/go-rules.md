# Go Coding Rules

ECC-adapted Go-specific coding standards for Qwen Code.

## Core Principles

1. **Simplicity** - Keep it simple, stupid (KISS)
2. **Readability** - Code is read more than written
3. **Explicit Errors** - Handle errors explicitly
4. **Composition** - Prefer composition over inheritance
5. **Concurrency** - Use goroutines and channels

---

## Configuration

### go.mod

```go
module github.com/yourorg/yourproject

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4
)
```

### .golangci.yml

```yaml
run:
  timeout: 5m
  tests: true

linters:
  enable:
    - gofmt
    - govet
    - errcheck
    - staticcheck
    - unused
    - gosimple
    - structcheck
    - varcheck
    - ineffassign
    - typecheck
    - gosec

linters-settings:
  govet:
    check-shadowing: true
  gosec:
    severity: medium
  gocyclo:
    min-complexity: 15

issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - errcheck
```

---

## Code Style

### Formatting

```bash
# Always use gofmt
gofmt -w .

# Or use goimports (includes import management)
goimports -w .
```

### Naming Conventions

```go
// ✅ Good: Clear, concise names
type User struct {
    ID    string
    Name  string
    Email string
}

func NewUserService(repo UserRepository) *UserService { ... }

func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) { ... }

// ❌ Bad: Too verbose
type UserDataStructure struct { ... }
func GetUserDataByID(ctx context.Context, userID string) (*UserDataStructure, error) { ... }
```

### Exported vs Unexported

```go
// Exported (public): starts with uppercase
type User struct { ... }
func NewUser() *User { ... }

// Unexported (private): starts with lowercase
type userDTO struct { ... }
func validateUser(u *User) error { ... }
```

---

## Error Handling

### Explicit Error Handling

```go
// ✅ Good: Check errors immediately
result, err := doSomething()
if err != nil {
    return nil, fmt.Errorf("do something: %w", err)
}

// ❌ Bad: Ignore errors
result, _ := doSomething() // Don't do this
```

### Error Wrapping

```go
import "errors"

var ErrUserNotFound = errors.New("user not found")

func GetUser(id string) (*User, error) {
    user, err := repo.Find(id)
    if err != nil {
        return nil, fmt.Errorf("get user: %w", err)
    }
    if user == nil {
        return nil, ErrUserNotFound
    }
    return user, nil
}

// Check specific error
user, err := GetUser("123")
if errors.Is(err, ErrUserNotFound) {
    // Handle not found
}
```

### Custom Error Types

```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
}

func (e *ValidationError) Unwrap() error {
    return errors.New("validation failed")
}

// Usage
if err := validate(user); err != nil {
    var ve *ValidationError
    if errors.As(err, &ve) {
        // Handle validation error
    }
}
```

### Defer for Cleanup

```go
func ProcessFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close() // Always close
    
    // Process file
    ...
}
```

---

## Functions

### Multiple Return Values

```go
// ✅ Good: Return value and error
func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// Usage
result, err := Divide(10, 2)
if err != nil {
    log.Fatal(err)
}
```

### Named Return Values

```go
// ✅ Use for clarity when multiple returns
func createUser(name, email string) (user *User, err error) {
    user = &User{
        Name:  name,
        Email: email,
    }
    
    if err = validate(user); err != nil {
        return nil, err
    }
    
    return user, nil
}
```

### Variadic Functions

```go
func sum(numbers ...int) int {
    total := 0
    for _, n := range numbers {
        total += n
    }
    return total
}

// Usage
result := sum(1, 2, 3, 4, 5)
nums := []int{1, 2, 3}
result = sum(nums...) // Unpack slice
```

---

## Structs and Interfaces

### Struct Design

```go
// ✅ Good: Small, focused structs
type User struct {
    ID        string
    Name      string
    Email     string
    CreatedAt time.Time
}

// ✅ Use pointers for mutable state
type UserService struct {
    repo UserRepository
    cache *sync.Map
}

// ✅ Embed for composition
type AdminUser struct {
    User        // Embedded
    Permissions []string
}
```

### Interface Design

```go
// ✅ Good: Small, focused interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// ✅ Combine interfaces
type ReadWriter interface {
    Reader
    Writer
}

// ❌ Bad: Large interfaces
type DataStore interface {
    Create(ctx context.Context, id string, data []byte) error
    Get(ctx context.Context, id string) ([]byte, error)
    Update(ctx context.Context, id string, data []byte) error
    Delete(ctx context.Context, id string) error
    List(ctx context.Context, prefix string) ([]string, error)
    // ... 20 more methods
}
```

### Interface Satisfaction

```go
// Ensure type implements interface at compile time
var _ io.Reader = (*MyReader)(nil)

type MyReader struct { ... }

func (r *MyReader) Read(p []byte) (int, error) {
    // Implementation
}
```

---

## Concurrency

### Goroutines

```go
// ✅ Use goroutines for concurrent work
func ProcessItems(items []Item) []Result {
    results := make([]Result, len(items))
    var wg sync.WaitGroup
    
    for i, item := range items {
        wg.Add(1)
        go func(idx int, it Item) {
            defer wg.Done()
            results[idx] = processItem(it)
        }(i, item)
    }
    
    wg.Wait()
    return results
}
```

### Channels

```go
// ✅ Buffered channels for batching
func worker(jobs <-chan Job, results chan<- Result) {
    for job := range jobs {
        results <- processJob(job)
    }
}

func main() {
    jobs := make(chan Job, 100)
    results := make(chan Result, 100)
    
    // Start workers
    for w := 1; w <= 3; w++ {
        go worker(jobs, results)
    }
    
    // Send jobs
    for j := 1; j <= 10; j++ {
        jobs <- Job{ID: j}
    }
    close(jobs)
    
    // Collect results
    for r := 1; r <= 10; r++ {
        <-results
    }
}
```

### Select Statement

```go
func WithTimeout(ctx context.Context, duration time.Duration) error {
    select {
    case result := <-doWork():
        return result
    case <-time.After(duration):
        return errors.New("timeout")
    case <-ctx.Done():
        return ctx.Err()
    }
}
```

### Mutex for Shared State

```go
type Cache struct {
    mu    sync.RWMutex
    items map[string]string
}

func (c *Cache) Get(key string) (string, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    val, ok := c.items[key]
    return val, ok
}

func (c *Cache) Set(key, value string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.items[key] = value
}
```

---

## Testing

### Table-Driven Tests

```go
func TestDivide(t *testing.T) {
    tests := []struct {
        name    string
        a       float64
        b       float64
        want    float64
        wantErr bool
    }{
        {"normal", 10, 2, 5, false},
        {"division by zero", 10, 0, 0, true},
        {"negative", -10, 2, -5, false},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Divide(tt.a, tt.b)
            if (err != nil) != tt.wantErr {
                t.Errorf("Divide() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if got != tt.want {
                t.Errorf("Divide() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

### Mocking

```go
// Mock repository
type MockUserRepository struct {
    FindByIDFunc func(id string) (*User, error)
}

func (m *MockUserRepository) FindByID(id string) (*User, error) {
    return m.FindByIDFunc(id)
}

// Test with mock
func TestGetUser(t *testing.T) {
    mockRepo := &MockUserRepository{
        FindByIDFunc: func(id string) (*User, error) {
            return &User{ID: id, Name: "Test"}, nil
        },
    }
    
    service := NewUserService(mockRepo)
    user, err := service.GetUser("123")
    
    if err != nil {
        t.Fatal(err)
    }
    if user.Name != "Test" {
        t.Errorf("expected Test, got %s", user.Name)
    }
}
```

### Test Helpers

```go
// test_helper.go
func NewTestUser(t *testing.T) *User {
    t.Helper()
    return &User{
        ID:    "test-" + uuid.New().String(),
        Name:  "Test User",
        Email: "test@example.com",
    }
}

func AssertEqual(t *testing.T, expected, actual interface{}) {
    t.Helper()
    if expected != actual {
        t.Errorf("expected %v, got %v", expected, actual)
    }
}
```

---

## Context

### Context Usage

```go
func ProcessWithTimeout(ctx context.Context, duration time.Duration) error {
    ctx, cancel := context.WithTimeout(ctx, duration)
    defer cancel()
    
    return doWork(ctx)
}

func doWork(ctx context.Context) error {
    select {
    case <-ctx.Done():
        return ctx.Err()
    case result := <-heavyComputation():
        return result
    }
}
```

### Context Propagation

```go
func (s *Service) Handler(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    
    user, err := s.GetUser(ctx, r.URL.Query().Get("id"))
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(user)
}
```

---

## Best Practices

### Project Structure

```
project/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
│   └── models/
├── tests/
├── go.mod
└── go.sum
```

### Dependency Injection

```go
// ✅ Good: Explicit dependencies
type UserService struct {
    repo UserRepository
    cache Cache
}

func NewUserService(repo UserRepository, cache Cache) *UserService {
    return &UserService{
        repo: repo,
        cache: cache,
    }
}
```

### Logging

```go
import "log/slog"

var logger = slog.Default()

func Handler(w http.ResponseWriter, r *http.Request) {
    logger.Info("request received",
        "method", r.Method,
        "path", r.URL.Path,
        "remote_addr", r.RemoteAddr,
    )
    
    // ...
}
```

---

## Related Rules

- `rules/common/coding-style.md` - General coding standards
- `rules/common/security.md` - Security guidelines
- `rules/common/testing.md` - Testing requirements
