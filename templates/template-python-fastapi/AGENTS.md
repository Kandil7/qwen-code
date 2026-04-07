# Project Agent Instructions

This file provides project-specific instructions for AI agents working in this **Python/FastAPI Backend** codebase.

## Quick Start

**To start working on a task, use these commands:**

```
/plan "Your feature description"     # Plan complex features
/tdd "Your task description"         # Test-driven development
/code-review                         # Review code changes
/security-scan                       # Security audit
/build-fix                           # Fix build errors
/verify                              # Pre-commit checks
```

## Project Overview

```
Framework: FastAPI
Language: Python 3.11+
Database: PostgreSQL with SQLAlchemy ORM
Testing: Pytest + HTTPX
Linting: Ruff + Black + MyPy
```

## Agent Selection Guide

| Task Type | Use This Agent |
|-----------|---------------|
| API endpoint development | `fullstack-ai-engineer` + `/tdd` |
| Database schema changes | `architect` (plan first) |
| Code quality review | `code-reviewer` + `ecc-code-review` |
| Security audit | `security-compliance-engineer` |
| Data pipeline | `data-engineer-knowledge-ingestion` |
| Refactoring | `refactor-cleaner` |

## Core Principles

1. **Type Hints** - Full type annotations (PEP 484)
2. **Test-Driven** - Write tests first, 80%+ coverage
3. **Security-First** - Validate all inputs, no hardcoded secrets
4. **Async First** - Use async/await for I/O operations
5. **Documentation** - Docstrings for all public APIs

## Python Standards

### Type Hints

```python
# ✅ Good: Full type annotations
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

async def get_user(user_id: str) -> Optional[User]:
    """Fetch user by ID."""
    return await db.users.find_one({"id": user_id})

# ❌ Bad: Missing types
def get_user(user_id):
    return db.users.find_one({"id": user_id})
```

### Error Handling

```python
from fastapi import HTTPException, status

async def get_user(user_id: str) -> User:
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
```

## API Standards

### Response Models

```python
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    
    class Config:
        from_attributes = True

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str) -> UserResponse:
    user = await get_user(user_id)
    return UserResponse.model_validate(user)
```

### Status Codes

- `200` - Success (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (Validation)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Security Checklist (Before Any Commit)

- [ ] No hardcoded secrets (use `os.environ` or `pydantic-settings`)
- [ ] All inputs validated (Pydantic models)
- [ ] SQL uses ORM (parameterized)
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured properly
- [ ] Password hashing (bcrypt)

## Testing Requirements

**Coverage Target:** ≥ 80%

### Pytest Tests

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_user(client: AsyncClient, test_user: User):
    response = await client.get(f"/api/users/{test_user.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["name"] == test_user.name

@pytest.mark.asyncio
async def test_get_user_not_found(client: AsyncClient):
    response = await client.get("/api/users/nonexistent")
    
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
```

### Fixtures

```python
# conftest.py
import pytest
from httpx import AsyncClient
from app.main import app
from app.db import get_db

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def test_user(db):
    user = User(name="Test", email="test@example.com")
    await db.users.insert_one(user)
    yield user
    await db.users.delete_one({"_id": user.id})
```

## Development Workflow

```
1. PLAN → /plan "Add user profile endpoint"
2. TDD  → /tdd "Implement GET /api/users/:id/profile"
3. REVIEW → /code-review
4. SECURITY → /security-scan
5. VERIFY → /verify
6. COMMIT → Conventional commits
```

## Git Commit Format

```
feat: add user profile endpoint
fix: resolve authentication bug
docs: update API documentation
test: add user service tests
refactor: extract validation logic
chore: update dependencies
```

## File Organization

```
src/
├── api/
│   ├── routes/        # API routes
│   ├── deps/          # Dependencies
│   └── schemas/       # Pydantic schemas
├── core/              # Core utilities
├── db/                # Database configuration
├── models/            # SQLAlchemy models
├── services/          # Business logic
└── tests/             # Test files
```

## When to Use Agents Proactively

| Situation | Agent to Use |
|-----------|-------------|
| Starting complex feature | `tech-lead-orchestrator` (plan first) |
| New API endpoint | `ecc-tdd-workflow` (TDD mandatory) |
| Database changes | `architect` (design review) |
| Security-sensitive | `security-compliance-engineer` |
| Build failure | `/build-fix` command |

## Success Metrics

| Metric | Target |
|--------|--------|
| Test Coverage | ≥ 80% |
| Security Issues (Critical) | 0 |
| Build Success Rate | ≥ 95% |
| API Response Time (p95) | < 200ms |

---

**Note:** This project uses ECC (Everything Claude Code) patterns.
See `.qwen/ECC-INTEGRATION.md` for full command reference.
