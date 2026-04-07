---
name: ai-review
description: Multi-model cross-checking and AI-on-AI review workflow. Generate code with one approach, review with another for quality, security, and correctness.
origin: Custom
version: "1.0.0"
---

# AI-on-AI Review Workflow

## Overview

This workflow implements the "model musical chairs" pattern: generate code with one approach, then spawn a separate review to critique, refactor, and validate. This catches hallucinations, security issues, and suboptimal patterns that a single pass might miss.

## When to Use

- After writing complex logic (> 30 lines)
- Before merging any security-sensitive code
- When the AI output feels uncertain or overly complex
- As a quality gate in CI/CD pipelines

---

## Phase 1: Generation

Generate the code using your primary agent/command:

```bash
# Example: Generate a scraper
/scrape "Extract product prices from https://shop.example.com"

# Or: Generate a feature
@software-engineer "Build user authentication with JWT"
```

**Save the output** for comparison in Phase 2.

---

## Phase 2: Cross-Review

Spawn a **different agent** to review the output:

```bash
# Code review
@code-reviewer "Review this authentication code for security and best practices"

# Security review
@security-compliance-engineer "Audit this code for vulnerabilities, secret leaks, injection risks"

# Architecture review
@tech-lead-ai-engineer "Review this architecture. What are the trade-offs? What would you do differently?"
```

### Review Prompt Template

```
Review the following code for:

1. **Correctness**: Does it do what it claims? Any bugs?
2. **Security**: Any vulnerabilities? Injection, XSS, auth bypass?
3. **Performance**: Any obvious bottlenecks? N+1 queries? Memory leaks?
4. **Maintainability**: Is it readable? Testable? Well-structured?
5. **Edge Cases**: What inputs/scenarios would break this?

Code:
[insert code here]
```

---

## Phase 3: Automated Quality Gates

Run automated checks in parallel with the AI review:

```bash
# Linting
npm run lint     # or ruff check, pylint, etc.

# Type checking
npx tsc --noEmit  # or mypy, pyright

# Security scan
npm audit         # or safety scan for Python

# Test coverage
npm test -- --coverage
```

---

## Phase 4: Reconciliation

Compare the AI review findings with automated check results:

| Finding | AI Review | Automated Check | Action |
|---------|-----------|-----------------|--------|
| Issue 1 | ✅ Found | ✅ Caught by ESLint | Fix |
| Issue 2 | ✅ Found | ❌ Not caught | Fix |
| Issue 3 | ❌ Missed | ✅ Caught by type checker | Fix |

**Fix all findings** using the original generation agent:

```bash
@software-engineer "Fix these issues: [list of findings from review]"
```

---

## Phase 5: Verification

Re-run the review on the fixed code:

```bash
@code-reviewer "Re-review the fixed version"
npm run lint && npm test
```

**Iterate until**:
- ✅ 0 critical security findings
- ✅ 0 lint/type errors
- ✅ ≥ 80% test coverage
- ✅ AI reviewer approves

---

## Quick Reference: Review Agent Selection

| Code Type | Primary Reviewer | Secondary Reviewer |
|-----------|-----------------|-------------------|
| Auth/Security | `@security-compliance-engineer` | `@code-reviewer` |
| AI/ML | `@ai-evaluation-engineer` | `@full-stack-ai-engineer` |
| API | `@api-engineer` | `@code-reviewer` |
| Frontend | `@frontend-engineer` | `@accessibility-specialist` |
| Infrastructure | `@dev-ops-platform-engineer` | `@sre-reliability-engineer` |
| Data Pipeline | `@data-engineer` | `@data-governance-engineer` |
| Scraper | `@web-scraper-engineer` | `@security-compliance-engineer` |

---

## Anti-Patterns to Watch For

### In Generation
- ❌ Overly complex solutions (> 100 lines for a single function)
- ❌ Hardcoded secrets, API keys, credentials
- ❌ Missing error handling
- ❌ No input validation
- ❌ SQL string concatenation (injection risk)

### In Review
- ❌ Rubber-stamp approval without deep analysis
- ❌ Missing security perspective
- ❌ Ignoring edge cases
- ❌ Not suggesting concrete improvements

---

**Related Skills**: `scrapling-workflow`, `firecrawl-workflow`, `scrapy-workflow`
**Related Commands**: `/code-review`, `/security-scan`, `/verify`
