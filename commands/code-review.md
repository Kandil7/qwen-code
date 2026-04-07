---
description: Comprehensive security and code quality review. Check for vulnerabilities, code smells, and best practices.
agents: ["code-reviewer", "security-compliance-engineer", "ecc-code-review"]
---

# Code Review Command

**Activates:** `ecc-code-review` + `ecc-security-scan` skills

## Usage
```
/code-review - Review changes in src/auth/
/code-review - Review my last commit
```

## What Gets Checked

### 🔴 Security (Critical - Blocker)
- [ ] Hardcoded secrets (API keys, passwords)
- [ ] SQL injection (string concat in queries)
- [ ] XSS (unescaped user input)
- [ ] Missing input validation
- [ ] Authentication gaps
- [ ] Authorization bypass risks

### 🟠 Code Quality (High Priority)
- [ ] Functions > 50 lines
- [ ] Files > 800 lines
- [ ] Nesting > 4 levels
- [ ] Missing error handling
- [ ] console.log statements
- [ ] TODO/FIXME without tickets

### 🟡 Best Practices (Medium)
- [ ] Mutation patterns (use immutable)
- [ ] Missing tests
- [ ] Accessibility issues
- [ ] Documentation gaps

## Output Format

```markdown
## Review Summary
[Brief overview]

### 🔴 Critical Issues (Must Fix)
| File | Line | Issue | Fix |
|------|------|-------|-----|
| auth.ts | 42 | SQL injection | Use parameterized query |

### 🟠 High Priority
| File | Line | Issue | Fix |
|------|------|-------|-----|
| user.ts | 88 | Function too long | Extract helper functions |

### 🟡 Suggestions
- Consider using const instead of let
- Add JSDoc for public API

### ✅ Positive Feedback
- Good test coverage
- Clear variable naming

## Verdict: APPROVE WITH CHANGES
```

## Severity Levels

| Level | Action |
|-------|--------|
| 🔴 CRITICAL | Block merge, fix immediately |
| 🟠 HIGH | Fix before merge |
| 🟡 MEDIUM | Fix in next sprint |
| 🟢 LOW | Backlog improvement |

## Common Security Issues

```javascript
// ❌ VULNERABLE: SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ SECURE: Parameterized
const query = 'SELECT * FROM users WHERE id = ?';
const params = [userId];

// ❌ VULNERABLE: XSS
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ SECURE: Escaped
<div>{userInput}</div>

// ❌ VULNERABLE: Hardcoded Secret
const API_KEY = "sk_live_abc123";

// ✅ SECURE: Environment Variable
const API_KEY = process.env.STRIPE_KEY;
```

## When to Use

✅ After completing a feature
✅ Before creating PR
✅ When fixing bugs
✅ After refactoring

❌ During initial drafting (use `/tdd` first)

## Related Commands
- `/tdd` - Implement with tests first
- `/security-scan` - Deep security audit
- `/verify` - Pre-commit verification
