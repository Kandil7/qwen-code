---
description: Run pre-commit verification checks. Ensure code quality before committing.
agents: ["code-reviewer", "qa-automation-engineer"]
skills: ["ecc-verification-loop"]
---

# Verify Command

**Activates:** Pre-commit quality verification

## Usage
```
/verify - Check my changes before commit
/verify - Run full quality checklist
```

## Verification Checklist

### 1. Code Quality ✅

- [ ] No console.log/debug statements
- [ ] No TODO/FIXME without ticket reference
- [ ] Functions < 50 lines
- [ ] Files < 800 lines  
- [ ] Nesting < 4 levels
- [ ] Clear variable/function names
- [ ] No code duplication

### 2. Testing ✅

- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Coverage >= 80%
- [ ] Edge cases covered
- [ ] Error paths tested

### 3. Security ✅

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL uses parameters
- [ ] XSS prevention
- [ ] Error messages safe

### 4. Documentation ✅

- [ ] Complex logic commented
- [ ] Public APIs documented
- [ ] Commit message ready

## Output Format

```markdown
## Verification Report

### ✅ Code Quality
- [Status for each check]

### ✅ Testing
- Tests: PASS/FAIL
- Coverage: XX% (target: 80%)

### ✅ Security
- [Security checklist status]

### Issues Found

| Severity | Issue | Location | Fix Required |
|----------|-------|----------|--------------|
| HIGH | console.log found | src/auth.ts:45 | Remove statement |
| MEDIUM | Function too long | src/utils.ts:12 | Extract helpers |

### Verdict: READY TO COMMIT / NEEDS FIXES
```

## Quick Checks

### Find Debug Statements
```bash
# Run this to find console.log
node .qwen/scripts/find-debug-statements.js
```

### Check Coverage
```bash
# Run this to verify coverage
node .qwen/scripts/verify-coverage.js
```

## When to Use

✅ Before every commit
✅ After completing a feature
✅ Before creating PR
✅ When switching tasks

❌ During initial drafting
❌ Mid-implementation

## Related Commands
- `/code-review` - Deeper review
- `/security-scan` - Security audit
- `/tdd` - Implementation with tests
