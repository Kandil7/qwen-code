---
name: ecc-verification-loop
description: Pre-commit verification checklist. Automated quality gates to ensure code meets standards before committing.
origin: ECC
---

# Verification Loop

This skill provides automated pre-commit quality verification to catch issues before they reach version control.

## When to Activate

- Before every commit
- After completing a feature
- Before creating a pull request
- When switching tasks
- Before end of day (clean workspace)

## Verification Categories

### 1. Code Quality Checks

#### Automated Scans
```bash
# Find debug statements
node .qwen/scripts/find-debug-statements.js

# Run linter
npm run lint

# Check formatting
npm run format:check
```

#### Manual Review
- [ ] No console.log/debug statements
- [ ] No TODO/FIXME without ticket reference
- [ ] Functions < 50 lines
- [ ] Files < 800 lines
- [ ] Nesting < 4 levels
- [ ] Clear variable/function names
- [ ] No code duplication (DRY)
- [ ] Proper error handling

### 2. Testing Checks

#### Automated
```bash
# Run tests with coverage
npm test -- --coverage

# Verify coverage threshold
node .qwen/scripts/verify-coverage.js
```

#### Manual Review
- [ ] Tests added/updated for changes
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] Edge cases covered
- [ ] Error paths tested
- [ ] No skipped tests

### 3. Security Checks

#### Automated
```bash
# Scan for hardcoded secrets
node .qwen/scripts/security-scan.js

# Check for vulnerable dependencies
npm audit
```

#### Manual Review
- [ ] No hardcoded secrets (API keys, passwords)
- [ ] All user inputs validated
- [ ] SQL uses parameterized queries
- [ ] XSS prevention (escaped output)
- [ ] Authentication checks in place
- [ ] Authorization verified
- [ ] Error messages don't leak data

### 4. Documentation Checks

#### Manual Review
- [ ] Complex logic has comments (WHY, not WHAT)
- [ ] Public APIs have JSDoc/TSDoc
- [ ] README updated if needed
- [ ] CHANGELOG updated for user-facing changes
- [ ] API documentation updated

### 5. Git Hygiene

#### Manual Review
- [ ] Commit message follows convention
- [ ] Branch name is descriptive
- [ ] No sensitive files staged
- [ ] .gitignore is complete
- [ ] .env files not staged

## Verification Workflow

### Quick Verification (5 minutes)

```bash
# 1. Debug statements
node .qwen/scripts/find-debug-statements.js

# 2. Security scan
node .qwen/scripts/security-scan.js

# 3. Tests
npm test

# 4. Lint
npm run lint
```

### Full Verification (15 minutes)

```bash
# 1. All quick checks
node .qwen/scripts/find-debug-statements.js
node .qwen/scripts/security-scan.js

# 2. Tests with coverage
npm test -- --coverage
node .qwen/scripts/verify-coverage.js

# 3. Build verification
npm run build

# 4. Lint and format
npm run lint
npm run format:check

# 5. Review changed files
git diff --name-only
```

## Output Format

```markdown
## Verification Report

**Date:** 2026-03-23
**Branch:** feature/user-auth
**Changes:** 5 files modified

### ✅ Code Quality
- [✓] No debug statements
- [✓] Linting passes
- [✓] Formatting correct
- [⚠] 1 function > 50 lines (src/auth.ts:45)

### ✅ Testing
- [✓] All tests passing (24/24)
- [✓] Coverage: 87% (target: 80%)
- [✓] Edge cases covered

### ✅ Security
- [✓] No hardcoded secrets
- [✓] Input validation present
- [✓] SQL parameterized

### ✅ Documentation
- [✓] Complex logic commented
- [✓] Public APIs documented

### Issues Found

| Severity | Issue | Location | Action |
|----------|-------|----------|--------|
| MEDIUM | Function too long | src/auth.ts:45 | Extract helpers |

### Verdict: READY TO COMMIT (with minor cleanup)

### Recommended Commit Message
```
feat: add user authentication with JWT

- Implement login/logout endpoints
- Add JWT token generation and validation
- Include rate limiting on auth endpoints
- Add comprehensive test coverage
```
```

## Pre-Commit Hook Integration

### package.json
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run verify"
    }
  },
  "scripts": {
    "verify": "npm run lint && npm test && node .qwen/scripts/verify-coverage.js"
  }
}
```

### .husky/pre-commit
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit verification..."

# Debug statements
node .qwen/scripts/find-debug-statements.js
if [ $? -ne 0 ]; then
  echo "❌ Debug statements found. Remove before committing."
  exit 1
fi

# Security scan
node .qwen/scripts/security-scan.js
if [ $? -ne 0 ]; then
  echo "❌ Potential secrets found. Remove before committing."
  exit 1
fi

# Lint
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting failed. Fix errors before committing."
  exit 1
fi

# Tests
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Fix before committing."
  exit 1
fi

echo "✅ All checks passed!"
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Quality Gate

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Debug statement check
        run: node .qwen/scripts/find-debug-statements.js
      
      - name: Security scan
        run: node .qwen/scripts/security-scan.js
      
      - name: Lint
        run: npm run lint
      
      - name: Test with coverage
        run: npm test -- --coverage
      
      - name: Verify coverage
        run: node .qwen/scripts/verify-coverage.js
      
      - name: Build
        run: npm run build
```

## Common Issues & Fixes

### Debug Statements Found
```bash
# Find and remove
node .qwen/scripts/find-debug-statements.js

# Common patterns to remove
console.log('debug', data);
console.error('error', err);
debugger; // Remove breakpoint
```

### Coverage Below Threshold
```bash
# Identify uncovered files
npm test -- --coverage --coverageReporters=text

# Add tests for:
# - Edge cases (null, empty, max)
# - Error paths
# - Happy path scenarios
```

### Secrets Detected
```bash
# Find secrets
node .qwen/scripts/security-scan.js

# Fix by:
# 1. Remove hardcoded value
# 2. Add to .env.example
# 3. Use process.env.VARIABLE_NAME
# 4. Rotate exposed credential
```

### Function Too Long
```typescript
// Before: 120 lines
async function processOrder(order) { ... }

// After: Extract helpers
async function processOrder(order) {
  validateOrder(order);
  const total = await calculateTotal(order);
  return await saveOrder(order, total);
}
```

## Quality Gates

| Gate | Threshold | Action if Failed |
|------|-----------|------------------|
| Debug statements | 0 | Block commit |
| Security issues (critical) | 0 | Block commit |
| Test coverage | ≥ 80% | Block commit |
| Tests passing | 100% | Block commit |
| Linting errors | 0 | Block commit |
| Function length | < 50 lines | Warning |
| File length | < 800 lines | Warning |
| Nesting depth | < 4 levels | Warning |

## Best Practices

1. **Automate everything** - Scripts over manual checks
2. **Fail fast** - Catch issues early
3. **Clear feedback** - Specific error messages
4. **Reasonable thresholds** - 80% coverage, not 100%
5. **Team agreement** - Everyone follows same standards
6. **Continuous improvement** - Add checks as issues arise

## Success Metrics

- Pre-commit verification takes < 2 minutes
- Critical issues caught before merge
- Code review feedback reduced
- Production bugs reduced
- Team velocity improved

## Related Skills

- `skill: ecc-code-review` - Deeper code review
- `skill: ecc-security-scan` - Security verification
- `skill: ecc-tdd-workflow` - Test-driven development
