---
name: ecc-api-design
description: REST and GraphQL API design patterns. Create consistent, well-documented, and maintainable APIs.
origin: ECC
---

# API Design Patterns

This skill provides comprehensive API design patterns for REST and GraphQL architectures.

## When to Use

- Designing new API endpoints
- Refactoring existing APIs
- Creating API documentation
- API versioning decisions
- Integration planning

---

## REST API Design

### Resource Naming

```typescript
// ✅ Good: Nouns, plural, lowercase
GET    /api/users
POST   /api/users
GET    /api/users/123
PUT    /api/users/123
DELETE /api/users/123

// ✅ Good: Nested resources
GET /api/users/123/orders
POST /api/users/123/orders

// ❌ Bad: Verbs in paths
GET /api/getUsers
POST /api/createUser

// ❌ Bad: Singular
GET /api/user
```

### HTTP Methods

| Method | Purpose | Idempotent | Body |
|--------|---------|------------|------|
| GET | Retrieve resource | Yes | No |
| POST | Create resource | No | Yes |
| PUT | Replace resource | Yes | Yes |
| PATCH | Update resource | No | Yes |
| DELETE | Remove resource | Yes | No |

### Response Format

```typescript
// Success Response (200 OK)
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "error": null,
  "meta": {
    "timestamp": "2026-03-23T12:00:00Z",
    "requestId": "req_abc123"
  }
}

// Error Response (4xx/5xx)
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-23T12:00:00Z",
    "requestId": "req_abc123"
  }
}

// Collection Response
{
  "success": true,
  "data": [
    { "id": "1", "name": "User 1" },
    { "id": "2", "name": "User 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 OK | Success | GET, PUT, PATCH |
| 201 Created | Resource created | POST |
| 204 No Content | Success, no body | DELETE |
| 400 Bad Request | Invalid input | Validation errors |
| 401 Unauthorized | Not authenticated | Missing/invalid token |
| 403 Forbidden | Not authorized | Insufficient permissions |
| 404 Not Found | Resource missing | Invalid ID |
| 409 Conflict | Resource conflict | Duplicate, version |
| 422 Unprocessable | Validation failed | Semantic errors |
| 429 Too Many Requests | Rate limited | Exceeded limit |
| 500 Internal Server Error | Server error | Unexpected failure |

### Query Parameters

```typescript
// Filtering
GET /api/users?status=active&role=admin

// Sorting
GET /api/users?sort=createdAt&order=desc

// Pagination
GET /api/users?page=1&limit=20

// Field selection
GET /api/users?fields=id,name,email

// Combined
GET /api/users?status=active&sort=name&order=asc&page=1&limit=10&fields=id,name
```

### Validation

```typescript
// Request validation middleware
import { z } from 'zod';

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*\d)/),
    role: z.enum(['user', 'admin']).optional()
  })
});

// Usage in route
app.post('/api/users', validate(createUserSchema), async (req, res) => {
  const { name, email, password } = req.body;
  // ...
});

// Validation error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "invalid_string"
      },
      {
        "field": "password",
        "message": "Must contain uppercase and number",
        "code": "invalid_string"
      }
    ]
  }
}
```

### Error Handling

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any[]
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(details: any[]) {
    super('VALIDATION_ERROR', 'Validation failed', 400, details);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
  }
  
  // Unknown error
  logger.error('Unhandled error', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
});
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts'
    }
  }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
```

---

## GraphQL API Design

### Schema Design

```graphql
# User type
type User {
  id: ID!
  name: String!
  email: String!
  role: UserRole!
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  USER
  ADMIN
}

# Query type
type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
  me: User
}

# Input types
input UserFilter {
  status: UserStatus
  role: UserRole
  search: String
}

input PaginationInput {
  page: Int = 1
  limit: Int = 20
}

# Connection for pagination
type UserConnection {
  nodes: [User!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPrevPage: Boolean!
  currentPage: Int!
  totalPages: Int!
}

# Mutation type
type Mutation {
  createUser(input: CreateUserInput!): UserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UserPayload!
  deleteUser(id: ID!): DeletePayload!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
  role: UserRole
}

input UpdateUserInput {
  name: String
  email: String
  role: UserRole
}

# Payload types
type UserPayload {
  success: Boolean!
  user: User
  errors: [Error!]
}

type DeletePayload {
  success: Boolean!
  message: String
  errors: [Error!]
}

type Error {
  field: String
  message: String!
  code: String!
}
```

### Resolver Pattern

```typescript
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User, { nullable: true })
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.userService.findById(id);
  }

  @Query(() => UserConnection)
  async users(
    @Args('filter', { type: () => UserFilter, nullable: true }) filter: UserFilter,
    @Args('pagination', { type: () => PaginationInput, defaultValue: { page: 1, limit: 20 } })
    pagination: PaginationInput
  ): Promise<UserConnection> {
    return this.userService.findAll(filter, pagination);
  }

  @Mutation(() => UserPayload)
  async createUser(
    @Args('input') input: CreateUserInput
  ): Promise<UserPayload> {
    try {
      const user = await this.userService.create(input);
      return { success: true, user };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          errors: error.details.map(d => ({
            field: d.field,
            message: d.message,
            code: d.code
          }))
        };
      }
      throw error;
    }
  }
}
```

---

## API Documentation

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: User management API

paths:
  /api/users:
    get:
      summary: List users
      tags: [Users]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
        '401':
          description: Unauthorized
        '429':
          description: Rate limited

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: [user, admin]
    
    UserList:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pagination:
          $ref: '#/components/schemas/Pagination'
```

---

## Best Practices

### Versioning

```typescript
// URL versioning (recommended)
GET /api/v1/users
GET /api/v2/users

// Header versioning
GET /api/users
Accept-Version: 2

// Deprecation strategy
// 1. Announce deprecation
// 2. Support both versions for 6 months
// 3. Add deprecation header
// 4. Remove old version
```

### Security

```typescript
// Authentication middleware
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new UnauthorizedError('Missing authentication token');
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid authentication token');
  }
}

// Authorization check
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
}

// Usage
app.get('/api/admin/users', 
  authMiddleware, 
  requireRole('admin'), 
  listUsersHandler
);
```

### Testing APIs

```typescript
import request from 'supertest';

describe('GET /api/users', () => {
  it('returns list of users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('returns 401 without token', async () => {
    await request(app)
      .get('/api/users')
      .expect(401);
  });

  it('paginates results', async () => {
    const response = await request(app)
      .get('/api/users?page=1&limit=10')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);
    
    expect(response.body.data.length).toBeLessThanOrEqual(10);
    expect(response.body.pagination).toBeDefined();
  });
});
```

## Success Metrics

- API response time < 200ms (p95)
- Error rate < 0.1%
- Documentation coverage 100%
- Test coverage > 80%
- API versioning strategy defined

## Related Skills

- `skill: ecc-tdd-workflow` - Test-driven API development
- `skill: ecc-security-scan` - API security review
- `skill: ecc-e2e-testing` - API integration tests
