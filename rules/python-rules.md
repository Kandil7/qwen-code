# Python Coding Rules

ECC-adapted Python-specific coding standards for Qwen Code.

## Core Principles

1. **Follow PEP 8** - Python style guide
2. **Type Hints** - Use type annotations (PEP 484)
3. **Explicit is Better** - Follow Zen of Python
4. **Immutability** - Use tuples, frozen dataclasses
5. **Error Handling** - EAFP over LBYL

---

## Configuration

### pyproject.toml

```toml
[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'

[tool.isort]
profile = "black"
line_length = 100

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --cov=src --cov-report=term-missing"
```

---

## Type Hints

### Basic Types

```python
# ✅ Good: Type annotations
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

# ✅ Good: Complex types
from typing import List, Dict, Optional, Union

def process_users(
    users: List[Dict[str, str]],
    limit: Optional[int] = None
) -> Union[List[Dict[str, str]], Dict[str, str]]:
    if limit:
        return users[:limit]
    return users[0] if users else {}
```

### Modern Type Hints (Python 3.10+)

```python
# ✅ Use built-in generics (Python 3.9+)
def process(items: list[str]) -> dict[str, int]:
    return {item: i for i, item in enumerate(items)}

# ✅ Use union operator (Python 3.10+)
def get_value(key: str) -> str | None:
    return data.get(key)

# ✅ Use type alias
UserId = str
UserData = dict[str, str | int]

def get_user(user_id: UserId) -> UserData | None:
    ...
```

### Type Guards

```python
from typing import TypeGuard

def is_user(data: object) -> TypeGuard[User]:
    return (
        isinstance(data, dict)
        and "id" in data
        and "name" in data
        and isinstance(data["id"], str)
    )

# Usage
if is_user(data):
    # data is typed as User here
    print(data["name"])
```

### Avoid `Any`

```python
# ❌ Bad: Loses type safety
def process(data: Any) -> Any:
    return data.value

# ✅ Good: Use proper types
def process(data: UserData) -> str:
    return data.name

# ✅ Better: Use TypeVar for generics
from typing import TypeVar

T = TypeVar('T')

def first(items: list[T]) -> T | None:
    return items[0] if items else None
```

---

## Classes

### Dataclasses

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass(frozen=True)  # Immutable
class User:
    id: str
    name: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    tags: list[str] = field(default_factory=list)
    
    def __post_init__(self):
        if not self.email or '@' not in self.email:
            raise ValueError("Invalid email")

# Usage
user = User(id="1", name="John", email="john@example.com")
```

### Abstract Base Classes

```python
from abc import ABC, abstractmethod

class Repository(ABC):
    @abstractmethod
    def find_by_id(self, id: str) -> object | None:
        pass
    
    @abstractmethod
    def save(self, obj: object) -> None:
        pass
    
    @abstractmethod
    def delete(self, id: str) -> bool:
        pass

class UserRepository(Repository):
    def __init__(self, db: Database):
        self.db = db
    
    def find_by_id(self, id: str) -> User | None:
        ...
    
    def save(self, user: User) -> None:
        ...
    
    def delete(self, id: str) -> bool:
        ...
```

---

## Error Handling

### Custom Exceptions

```python
class AppError(Exception):
    """Base exception for application."""
    def __init__(self, message: str, code: str = "APP_ERROR"):
        super().__init__(message)
        self.code = code
        self.message = message

class ValidationError(AppError):
    def __init__(self, message: str, details: list[str] | None = None):
        super().__init__(message, "VALIDATION_ERROR")
        self.details = details or []

class NotFoundError(AppError):
    def __init__(self, resource: str):
        super().__init__(f"{resource} not found", "NOT_FOUND")

class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, "UNAUTHORIZED")
```

### EAFP Pattern

```python
# ✅ Pythonic: EAFP (Easier to Ask Forgiveness than Permission)
try:
    value = data["key"]
except KeyError:
    value = default_value

# ❌ Less Pythonic: LBYL (Look Before You Leap)
if "key" in data:
    value = data["key"]
else:
    value = default_value
```

### Context Managers

```python
from contextlib import contextmanager

@contextmanager
def database_transaction(db: Database):
    """Context manager for database transactions."""
    try:
        db.begin()
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise

# Usage
with database_transaction(db) as tx:
    tx.execute("INSERT INTO users ...")
```

---

## Functions

### Function Signatures

```python
# ✅ Good: Clear signatures with defaults
def create_user(
    name: str,
    email: str,
    password: str,
    role: str = "user",
    active: bool = True
) -> User:
    ...

# ✅ Use * for keyword-only args
def create_user(
    name: str,
    email: str,
    *,
    password: str,
    role: str = "user"
) -> User:
    ...

# ✅ Use **kwargs sparingly
def create_resource(
    name: str,
    type: str,
    **attributes: Any
) -> Resource:
    ...
```

### Decorators

```python
from functools import wraps
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec('P')
R = TypeVar('R')

def retry(max_attempts: int = 3):
    def decorator(func: Callable[P, R]) -> Callable[P, R]:
        @wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
            raise last_exception
        return wrapper
    return decorator

@retry(max_attempts=3)
def fetch_data(url: str) -> dict:
    ...
```

---

## Async/Await

### Async Functions

```python
import asyncio
import aiohttp

async def fetch_user(session: aiohttp.ClientSession, user_id: str) -> dict:
    async with session.get(f"/api/users/{user_id}") as response:
        response.raise_for_status()
        return await response.json()

async def fetch_users(user_ids: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_user(session, uid) for uid in user_ids]
        return await asyncio.gather(*tasks)

# Usage
users = asyncio.run(fetch_users(["1", "2", "3"]))
```

### Async Context Managers

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_connection(pool: ConnectionPool):
    conn = await pool.acquire()
    try:
        yield conn
    finally:
        await pool.release(conn)

# Usage
async with get_connection(pool) as conn:
    await conn.execute("SELECT * FROM users")
```

---

## Testing

### Pytest Patterns

```python
import pytest
from unittest.mock import Mock, AsyncMock

@pytest.fixture
def mock_repository() -> Mock:
    repo = Mock()
    repo.find_by_id.return_value = User(id="1", name="Test")
    return repo

@pytest.fixture
def async_mock_repository() -> AsyncMock:
    repo = AsyncMock()
    repo.find_by_id.return_value = User(id="1", name="Test")
    return repo

def test_user_creation(mock_repository: Mock):
    service = UserService(mock_repository)
    user = service.get_user("1")
    assert user.name == "Test"

@pytest.mark.asyncio
async def test_async_user_creation(async_mock_repository: AsyncMock):
    service = UserService(async_mock_repository)
    user = await service.get_user("1")
    assert user.name == "Test"
```

### Parametrized Tests

```python
@pytest.mark.parametrize(
    "email,expected",
    [
        ("valid@example.com", True),
        ("invalid", False),
        ("no-at-sign.com", False),
        ("spaces @invalid.com", False),
    ]
)
def test_email_validation(email: str, expected: bool):
    assert is_valid_email(email) == expected
```

---

## Best Practices

### Naming Conventions

```python
# Modules: lowercase, underscores
# my_module.py

# Classes: PascalCase
class UserService:
    ...

# Functions: snake_case
def get_user_name():
    ...

# Variables: snake_case
user_name = "John"

# Constants: UPPER_SNAKE_CASE
MAX_RETRY_COUNT = 3

# Private: leading underscore
_internal_value = 42

# Name mangling: double underscore
class User:
    __password: str  # Mangled to _User__password
```

### Imports

```python
# Standard library first
import os
import sys
from pathlib import Path

# Third-party packages
import requests
from flask import Flask

# Local imports
from .models import User
from .services import UserService

# Type imports (Python 3.11+)
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .models import User  # Only for type checking
```

### Documentation

```python
def create_user(
    name: str,
    email: str,
    password: str,
    role: str = "user"
) -> User:
    """
    Create a new user account.
    
    Args:
        name: User's display name
        email: User's email address (must be unique)
        password: User's password (min 8 characters)
        role: User role, defaults to "user"
    
    Returns:
        Created User object
    
    Raises:
        ValidationError: If email format is invalid
        DuplicateError: If email already exists
    
    Example:
        >>> user = create_user("John", "john@example.com", "SecurePass123!")
        >>> user.name
        'John'
    """
    ...
```

---

## Related Rules

- `rules/common/coding-style.md` - General coding standards
- `rules/common/security.md` - Security guidelines
- `rules/common/testing.md` - Testing requirements
