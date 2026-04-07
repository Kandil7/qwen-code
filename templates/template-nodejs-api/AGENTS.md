# Project Agent Instructions

This file provides project-specific instructions for AI agents working in this **Node.js/TypeScript API** codebase.

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
Architecture: REST API with Express
Language: TypeScript 5.x
Database: PostgreSQL with Prisma ORM
Testing: Jest + Supertest
Linting: ESLint + Prettier
```

## Agent Selection Guide

| Task Type | Use This Agent |
|-----------|---------------|
| Complex multi-component feature | `tech-lead-orchestrator` |
| API endpoint development | `fullstack-ai-engineer` + `/tdd` |
| Database schema changes | `architect` (plan first) |
| Code quality review | `code-reviewer` + `ecc-code-review` |
| Security audit | `security-compliance-engineer` + `ecc-security-scan` |
| E2E tests | `e2e-runner` |
| Refactoring | `refactor-cleaner` |

## Core Principles

1. **Type Safety** - No `any` types, strict TypeScript
2. **Test-Driven** - Write tests first, 80%+ coverage
3. **Security-First** - Validate all inputs, no hardcoded secrets
4. **Error Handling** - Always handle errors, user-friendly messages
5. **Documentation** - JSDoc for public APIs

## TypeScript Rules

```typescript
// ✅ Good: Typed, explicit
async function getUser(id: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

// ❌ Bad: Avoid any
async function getUser(id: any): Promise<any> { ... }
```

## API Standards

### Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-23T12:00:00Z",
    "requestId": "req_abc123"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

### Status Codes

- `200` - Success (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (Validation)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security Checklist (Before Any Commit)

- [ ] No hardcoded secrets (use `process.env`)
- [ ] All inputs validated (Zod schemas)
- [ ] SQL uses Prisma (parameterized)
- [ ] Rate limiting on auth endpoints
- [ ] CORS configured properly
- [ ] Helmet middleware enabled

## Testing Requirements

**Coverage Target:** ≥ 80%

```typescript
// Unit test example
describe('UserService', () => {
  describe('getUser', () => {
    it('returns user when found', async () => {
      mockRepo.findById.mockResolvedValue(testUser);
      
      const user = await service.getUser('123');
      
      expect(user).toEqual(testUser);
    });

    it('throws NotFoundError when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      
      await expect(service.getUser('999'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
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
├── controllers/     # Request handlers
├── services/        # Business logic
├── repositories/    # Data access
├── models/          # TypeScript types
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── utils/           # Utilities
└── errors/          # Custom error classes
```

## When to Use Agents Proactively

| Situation | Agent to Use |
|-----------|-------------|
| Starting complex feature | `tech-lead-orchestrator` (plan first) |
| Just wrote code | `code-reviewer` (immediate review) |
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
