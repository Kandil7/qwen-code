# Opencode Quality Suite

Enhanced developer workflow scripts for Qwen Code / Opencode projects.

## Overview

This suite provides 10 scripts for comprehensive code quality checks:

| # | Script | Purpose |
|---|--------|---------|
| 1 | `verify-coverage.js` | Test coverage verification with trends & HTML reports |
| 2 | `security-scan.js` | 25+ secret pattern detection with severity scoring |
| 3 | `check-complexity.js` | Cyclomatic complexity & multi-language support |
| 4 | `find-debug-statements.js` | Debug code detection with auto-fix |
| 5 | `review-summary.js` | PR description & reviewer suggestions |
| 6 | `type-check.js` | TypeScript & ESLint integration |
| 7 | `import-sort.js` | Import sorting for Python/TypeScript |
| 8 | `dead-code.js` | Unused code detection |
| 9 | `dependency-audit.js` | Security advisories & outdated packages |
| 10 | `pre-commit.js` | Unified pre-commit hook |

## Quick Start

```bash
# Run all checks
node .qwen/scripts/pre-commit.js

# Run specific check
node .qwen/scripts/security-scan.js

# Run with auto-fix
node .qwen/scripts/find-debug-statements.js --auto-fix
```

## Individual Scripts

### 1. verify-coverage.js

Verifies test coverage meets threshold (default 80%).

```bash
# Basic check
node .qwen/scripts/verify-coverage.js

# Show trends
node .qwen/scripts/verify-coverage.js --trend

# Per-file breakdown
node .qwen/scripts/verify-coverage.js --details

# Generate HTML report
node .qwen/scripts/verify-coverage.js --html
```

**Features:**
- Coverage threshold checking
- Trend analysis (last 5 runs)
- Per-file breakdown
- HTML report generation

---

### 2. security-scan.js

Detects hardcoded secrets in codebase.

```bash
# Scan for secrets
node .qwen/scripts/security-scan.js

# Show remediation hints
node .qwen/scripts/security-scan.js --auto-fix

# Only show critical issues
node .qwen/scripts/security-scan.js --severity CRITICAL
```

**Detected Patterns (25+):**
- AWS keys & secrets
- GitHub tokens
- Stripe API keys
- Database connection strings
- JWT secrets
- Azure/Google/Slack tokens
- And more...

---

### 3. check-complexity.js

Analyzes code complexity.

```bash
# Check complexity
node .qwen/scripts/check-complexity.js

# JSON output
node .qwen/scripts/check-complexity.js --json

# Show fix suggestions
node .qwen/scripts/check-complexity.js --fix
```

**Checks:**
- Function length (max 50 lines)
- File size (max 800 lines)
- Cyclomatic complexity (max 10)
- Nesting depth (max 4)
- Multi-language: JS, TS, Python, Go, Rust

---

### 4. find-debug-statements.js

Finds debug code (console.log, print, etc.).

```bash
# Find debug statements
node .qwen/scripts/find-debug-statements.js

# Auto-fix (remove them)
node .qwen/scripts/find-debug-statements.js --auto-fix

# Preview without changes
node .qwen/scripts/find-debug-statements.js --dry-run
```

---

### 5. review-summary.js

Generates code review summary from git diff.

```bash
# Show summary
node .qwen/scripts/review-summary.js

# Generate PR description
node .qwen/scripts/review-summary.js --pr

# Markdown output
node .qwen/scripts/review-summary.js --markdown
```

---

### 6. type-check.js

TypeScript and ESLint integration.

```bash
# Run type check
node .qwen/scripts/type-check.js

# Auto-fix ESLint issues
node .qwen/scripts/type-check.js --fix

# Strict mode
node .qwen/scripts/type-check.js --strict
```

---

### 7. import-sort.js

Sorts imports for Python and TypeScript.

```bash
# Preview changes
node .qwen/scripts/import-sort.js

# Apply fixes
node .qwen/scripts/import-sort.js --write

# Check only
node .qwen/scripts/import-sort.js --check
```

---

### 8. dead-code.js

Detects unused code.

```bash
# Find dead code
node .qwen/scripts/dead-code.js

# JSON output
node .qwen/scripts/dead-code.js --json

# With verbose details
node .qwen/scripts/dead-code.js --verbose
```

---

### 9. dependency-audit.js

Checks for vulnerabilities and outdated packages.

```bash
# Full audit
node .qwen/scripts/dependency-audit.js

# Show fix commands
node .qwen/scripts/dependency-audit.js --fix

# Only vulnerable packages
node .qwen/scripts/dependency-audit.js --vulnerable-only
```

---

### 10. pre-commit.js

Unified pre-commit hook combining all checks.

```bash
# Run all checks
node .qwen/scripts/pre-commit.js

# Only staged files
node .qwen/scripts/pre-commit.js --staged

# Parallel execution
node .qwen/scripts/pre-commit.js --parallel

# Verbose output
node .qwen/scripts/pre-commit.js --verbose
```

**Environment Variables to Skip Checks:**
```bash
SKIP_PRE_COMMIT=1     # Skip all checks
SKIP_SECURITY=1       # Skip security scan
SKIP_DEBUG=1          # Skip debug statement check
SKIP_TYPES=1          # Skip type check
SKIP_COVERAGE=1       # Skip coverage check
SKIP_COMPLEXITY=1     # Skip complexity check
SKIP_AUDIT=1         # Skip dependency audit
```

---

## Configuration

All scripts share configuration from `.qwen/scripts/config.json`:

```json
{
  "coverage": {
    "threshold": 80,
    "failOnTrend": true,
    "trendHistory": 5
  },
  "security": {
    "patterns": "extended",
    "severityThreshold": "HIGH"
  },
  "complexity": {
    "maxFunctionLines": 50,
    "maxFileLines": 800,
    "maxNesting": 4
  },
  "preCommit": {
    "enabled": true,
    "checks": ["security", "debugStatements", "typeCheck", "coverage"],
    "parallel": true
  }
}
```

---

## Package.json Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "verify": "node .qwen/scripts/pre-commit.js",
    "verify:fast": "node .qwen/scripts/security-scan.js && node .qwen/scripts/find-debug-statements.js",
    "coverage:trend": "node .qwen/scripts/verify-coverage.js --trend",
    "review": "node .qwen/scripts/review-summary.js"
  }
}
```

---

## Git Hooks

### Install as pre-commit hook:

```bash
# Create .git/hooks/pre-commit
echo 'node .qwen/scripts/pre-commit.js' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Or use Husky:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "node .qwen/scripts/pre-commit.js"
    }
  }
}
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | One or more checks failed |
| 2 | Script error |

---

## Requirements

- Node.js 14+
- Git (for review-summary.js)
- Optional: TypeScript, ESLint, isort, prettier

---

## License

MIT
