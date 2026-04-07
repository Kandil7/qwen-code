---
description: Comprehensive security audit. Scan for vulnerabilities, secrets leakage, and OWASP Top 10 issues.
agents: ["security-compliance-engineer", "ecc-security-scan"]
---

# Security Scan Command

**Activates:** `ecc-security-scan` skill

## Usage
```
/security-scan - Audit entire codebase
/security-scan - Check src/api/ for vulnerabilities
```

## What Gets Scanned

### 🔐 Secrets Detection (Critical)
- API keys (AWS, Stripe, Twilio, etc.)
- Database passwords
- JWT secrets
- OAuth client secrets
- SSH private keys
- Cloud credentials

**Patterns detected:**
```
api_key = "sk_live_..."
password = "..."
AWS_ACCESS_KEY_ID = "AKIA..."
-----BEGIN RSA PRIVATE KEY-----
```

### 💉 Injection Vulnerabilities

**SQL Injection:**
```javascript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Secure
const query = 'SELECT * FROM users WHERE id = ?';
```

**Command Injection:**
```javascript
// ❌ Vulnerable
exec(`cat ${userFile}`);

// ✅ Secure
execFile('cat', [sanitizedPath]);
```

**XSS:**
```jsx
// ❌ Vulnerable
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ Secure  
<div>{sanitize(userInput)}</div>
```

### 🔑 Authentication & Authorization
- Password hashing (bcrypt/argon2, NOT md5)
- Rate limiting on login
- Session management
- JWT validation
- RBAC implementation

### 🛡️ Data Protection
- Encryption at rest
- TLS/HTTPS everywhere
- No sensitive data in logs
- PII handling compliance
- Secure file upload validation

### 📦 Dependency Security
- Known vulnerable packages
- Outdated dependencies
- Missing lock files

### 🔒 Security Headers
- Content-Security-Policy
- X-Frame-Options
- Strict-Transport-Security
- X-Content-Type-Options

## Scan Output Format

```markdown
## Security Scan Report

**Date:** 2026-03-23
**Scope:** src/
**Risk Level:** HIGH

### 🔴 Critical Findings

| ID | Vulnerability | Location | Recommendation |
|----|---------------|----------|----------------|
| S001 | Hardcoded API Key | config.js:15 | Move to .env |
| S002 | SQL Injection | api/users.js:42 | Use parameters |

### 🟠 High Priority Findings

| ID | Vulnerability | Location | Recommendation |
|----|---------------|----------|----------------|
| S003 | Missing Rate Limit | api/login.js | Add express-rate-limit |

### Summary
- Critical: 2
- High: 1
- Medium: 3
- Low: 5

### ⚠️ Immediate Actions Required
1. Rotate exposed API key in config.js
2. Fix SQL injection before any deploy
```

## OWASP Top 10 Reference

Always checks for:
1. Injection
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities (XXE)
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting (XSS)
8. Insecure Deserialization
9. Vulnerable Components
10. Insufficient Logging

## Remediation Priority

1. **CRITICAL** - Fix IMMEDIATELY, rotate secrets
2. **HIGH** - Fix before next release
3. **MEDIUM** - Fix within sprint
4. **LOW** - Add to security backlog

## When to Use

✅ Before any production deploy
✅ After adding authentication
✅ When handling sensitive data
✅ Before open-sourcing code
✅ After dependency updates

❌ During initial prototyping (use before merge)

## Related Commands
- `/code-review` - Quality + security review
- `/verify` - Pre-commit checks
- `/tdd` - Secure implementation from start
