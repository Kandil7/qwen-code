# ECC Commands Reference

Complete reference for all ECC-style commands in Qwen Code.

---

## Spec-Driven Development (SDD) Commands

For complex projects, use the 4-phase SDD workflow to separate "what" from "how".

### `/specify` - Define What & Why

**File:** `.qwen/commands/specify.md`
**Agents:** `orchestrator-tech-lead`, `product-engineer`, `documentation-writer`

```
Usage: /specify "Build a production RAG chatbot for customer support"
```

**What it does:**
1. Defines the problem statement
2. Identifies user personas
3. Maps user journeys
4. Sets success criteria (functional & non-functional)
5. Establishes scope boundaries
6. Documents constraints (technical, business, compliance)

**Output:**
- Specification document in `.qwen/specs/[project]-spec.md`
- User journeys with happy paths and edge cases
- Measurable success criteria
- Clear scope (in/out)
- Risk register with mitigations

**When to use:**
- ✅ Greenfield projects
- ✅ Major feature additions
- ✅ Legacy modernization
- ✅ Multi-team initiatives
- ❌ Simple bug fixes

---

### `/sdd-plan` - Technical Planning

**File:** `.qwen/commands/sdd-plan.md`
**Agents:** `orchestrator-tech-lead`, `architect`, `tech-lead-ai-engineer`

```
Usage: /sdd-plan "Build a production RAG chatbot for customer support"
```

**Prerequisite:** `/specify` must be completed first

**What it does:**
1. Designs system architecture
2. Selects technology stack with justification
3. Designs APIs and data models
4. Plans integrations (external/internal)
5. Defines security architecture
6. Creates testing strategy
7. Plans deployment architecture

**Output:**
- Technical plan in `.qwen/plans/[project]-plan.md`
- Architecture diagrams
- API endpoint definitions
- Database schemas
- Security flow diagrams
- CI/CD pipeline design

**When to use:**
- ✅ After specification is approved
- ✅ Before any coding begins
- ✅ Architecture review needed
- ❌ Specification not ready

---

### `/tasks` - Task Breakdown

**File:** `.qwen/commands/tasks.md`
**Agents:** `orchestrator-tech-lead`, `product-engineer`, `software-engineer`

```
Usage: /tasks "Build a production RAG chatbot for customer support"
```

**Prerequisite:** `/sdd-plan` must be completed first

**What it does:**
1. Breaks plan into atomic tasks
2. Estimates effort per task (S/M/L/XL)
3. Maps task dependencies
4. Identifies critical path
5. Assigns agents to tasks
6. Creates implementation order

**Output:**
- Task list in `.qwen/tasks/[project]-tasks.md`
- Dependency graph
- Critical path identification
- Task status tracking table
- Definition of Done checklist

**When to use:**
- ✅ Technical plan approved
- ✅ Ready to start implementation
- ✅ Need clear roadmap
- ❌ Plan not approved

---

### `/implement` - Guided Implementation

**File:** `.qwen/commands/implement.md`
**Agents:** `orchestrator-tech-lead`, `[specialized agent per task]`

```
Usage: /implement "Build RAG chatbot --task T-001"
```

**Prerequisite:** `/tasks` must be completed first

**What it does:**
1. Reads task definition and acceptance criteria
2. Invokes specialized agent for the task
3. Implements with TDD (RED → GREEN → BLUE)
4. Runs code review
5. Runs security scan (if applicable)
6. Pre-commit verification
7. Commits with conventional commit
8. Updates task status

**Quality Gates:**
- `/code-review` - No critical issues
- `/security-scan` - No vulnerabilities
- `/verify` - All checks pass
- Coverage ≥ 80%

**When to use:**
- ✅ Tasks are defined
- ✅ Ready to code
- ✅ Task-by-task implementation
- ❌ Tasks not defined

---

## SDD Workflow Example

```bash
# Phase 1: Specify (WHAT & WHY)
/specify "Build user dashboard with analytics"
# Output: .qwen/specs/dashboard-spec.md

# Phase 2: Plan (HOW)
/sdd-plan "Build user dashboard with analytics"
# Output: .qwen/plans/dashboard-plan.md

# Phase 3: Tasks (BREAKDOWN)
/tasks "Build user dashboard with analytics"
# Output: .qwen/tasks/dashboard-tasks.md

# Phase 4: Implement (CODE)
/implement "Build dashboard --task T-001"  # Project setup
/implement "Build dashboard --task T-002"  # Database config
/implement "Build dashboard --task T-003"  # API endpoints
...
```

---

## Core Commands

### `/plan` - Implementation Planning

**File:** `.qwen/commands/plan.md`
**Agents:** `tech-lead-orchestrator`, `ecc-plan`

```
Usage: /plan "Add user authentication with OAuth2"
```

**What it does:**
1. Restates requirements for clarity
2. Identifies risks and blockers
3. Creates phased implementation plan
4. **Waits for your confirmation** before coding

**Output:**
- Architecture changes with file paths
- Step-by-step implementation phases
- Testing strategy
- Risk mitigation plan

**When to use:**
- ✅ New feature development
- ✅ Architectural changes
- ✅ Complex refactoring
- ❌ Simple bug fixes

---

### `/tdd` - Test-Driven Development

**File:** `.qwen/commands/tdd.md`  
**Agents:** `tech-lead-orchestrator`, `ecc-tdd-workflow`

```
Usage: /tdd "Implement user registration API"
```

**What it does:**
1. 🔴 **RED** - Writes failing test first
2. 🟢 **GREEN** - Implements minimal code to pass
3. 🔵 **IMPROVE** - Refactors with confidence
4. ✅ **VERIFY** - Checks 80%+ coverage

**Test types created:**
- Unit tests (functions, utilities)
- Integration tests (APIs, databases)
- Edge cases (null, empty, boundary)

**When to use:**
- ✅ New features (MANDATORY)
- ✅ Bug fixes (regression test first)
- ✅ Refactoring (add tests if missing)
- ❌ Prototyping/exploration

---

### `/code-review` - Code Quality Review

**File:** `.qwen/commands/code-review.md`  
**Agents:** `code-reviewer`, `security-compliance-engineer`

```
Usage: /code-review - Review changes in src/auth/
```

**What it checks:**

| Category | Checks |
|----------|--------|
| 🔴 Security | Hardcoded secrets, SQL injection, XSS, auth |
| 🟠 Quality | Function size, file size, nesting, duplication |
| 🟡 Best Practices | Error handling, naming, documentation |

**Output format:**
```markdown
## Review Summary

### 🔴 Critical Issues
| File | Line | Issue | Fix |

### 🟠 High Priority
| File | Line | Issue | Fix |

### Verdict: APPROVE WITH CHANGES
```

**When to use:**
- ✅ After completing a feature
- ✅ Before creating PR
- ✅ After refactoring
- ❌ During initial drafting

---

### `/security-scan` - Security Audit

**File:** `.qwen/commands/security-scan.md`  
**Agents:** `security-compliance-engineer`, `ecc-security-scan`

```
Usage: /security-scan - Audit entire codebase
```

**What it scans:**
- 🔐 Secrets detection (API keys, passwords)
- 💉 Injection vulnerabilities (SQL, XSS, command)
- 🔑 Authentication/authorization gaps
- 🛡️ Data protection issues
- 📦 Dependency vulnerabilities
- 🔒 Missing security headers

**OWASP Top 10 coverage:**
1. Injection
2. Broken Authentication
3. Sensitive Data Exposure
4. XML External Entities
5. Broken Access Control
6. Security Misconfiguration
7. Cross-Site Scripting
8. Insecure Deserialization
9. Vulnerable Components
10. Insufficient Logging

**When to use:**
- ✅ Before production deploy
- ✅ After adding authentication
- ✅ Before open-sourcing code
- ✅ After dependency updates

---

### `/build-fix` - Build Troubleshooting

**File:** `.qwen/commands/build-fix.md`  
**Agents:** `devops-platform-engineer`, `ecc-build-fix`

```
Usage: /build-fix - npm install failing
```

**Process:**
1. **CAPTURE** - Get full error output
2. **ANALYZE** - Categorize error type
3. **FIX** - Apply targeted solution
4. **VERIFY** - Confirm build passes

**Common fixes:**
- Dependency issues (clean reinstall)
- Configuration problems (tsconfig, etc.)
- Code errors (type errors, syntax)
- Environment issues (version mismatch)

**When to use:**
- ✅ Build suddenly fails
- ✅ After pulling changes
- ✅ Fresh clone issues
- ✅ CI/CD build failures

---

### `/e2e` - End-to-End Testing

**File:** `.qwen/commands/e2e.md`  
**Agents:** `qa-automation-engineer`, `e2e-runner`

```
Usage: /e2e - Create tests for checkout flow
```

**What it creates:**
- Playwright test suites
- Page Object Model patterns
- Test fixtures
- Cross-browser tests
- Accessibility tests

**Critical flows to test:**
- Authentication (login, register, reset)
- E-commerce (search, cart, checkout)
- Core business logic
- Admin operations

**When to use:**
- ✅ New feature launch
- ✅ Before major releases
- ✅ Regression testing
- ❌ Unit testing (use `/tdd`)

---

### `/refactor` - Code Cleanup

**File:** `.qwen/commands/refactor.md`  
**Agents:** `code-reviewer`, `refactor-cleaner`

```
Usage: /refactor - Clean up auth module
```

**What it improves:**
- Remove dead code (unused functions, imports)
- Improve naming (clear, descriptive)
- Extract large functions (< 50 lines)
- Reduce duplication (DRY)
- Reduce nesting (< 4 levels)
- Remove console.log/debugger

**Refactoring patterns:**
- Extract Method
- Extract Class
- Replace Magic Number with Constant
- Simplify Conditionals
- Remove Middle Man

**When to use:**
- ✅ After completing a feature
- ✅ Technical debt sprints
- ✅ Before major refactors
- ❌ During active development

---

### `/verify` - Pre-Commit Checks

**File:** `.qwen/commands/verify.md`  
**Agents:** `code-reviewer`, `qa-automation-engineer`

```
Usage: /verify - Check my changes before commit
```

**Verification checklist:**

| Category | Checks |
|----------|--------|
| Code Quality | No debug statements, function size, naming |
| Testing | Tests added, all passing, coverage ≥ 80% |
| Security | No secrets, input validation, SQL safe |
| Documentation | Comments, JSDoc, README updated |

**Output:**
```markdown
## Verification Report

### ✅ Code Quality
### ✅ Testing
### ✅ Security
### Verdict: READY TO COMMIT
```

**When to use:**
- ✅ Before EVERY commit
- ✅ After completing a feature
- ✅ Before creating PR
- ✅ End of day (clean workspace)

---

### `/docs` - Documentation

**File:** `.qwen/commands/docs.md`  
**Agents:** `docs-lookup`, `documentation-writer`

```
Usage: /docs - Research Stripe payment API
```

**What it creates:**
- API documentation (endpoints, schemas)
- Code documentation (JSDoc, examples)
- Best practices guides
- Integration guides

**Documentation standards:**
- What it does (one line)
- Parameters with types
- Return value
- Exceptions thrown
- Usage example

**When to use:**
- ✅ Starting with new library
- ✅ After implementing features
- ✅ Before team handoff
- ❌ During prototyping

---

## Utility Scripts

### `verify-coverage.js`

```bash
node .qwen/scripts/verify-coverage.js
```

Checks test coverage meets 80% threshold.

**Checks:**
- Statements coverage
- Branches coverage
- Functions coverage
- Lines coverage

---

### `find-debug-statements.js`

```bash
node .qwen/scripts/find-debug-statements.js
```

Finds debug statements in codebase.

**Detects:**
- `console.log()`
- `console.debug()`
- `console.info()`
- `debugger;`
- `alert()`

---

### `security-scan.js`

```bash
node .qwen/scripts/security-scan.js
```

Scans for hardcoded secrets.

**Detects:**
- AWS Access Keys
- GitHub Tokens
- Stripe API Keys
- Generic API Keys
- Password assignments
- Private keys
- JWT secrets
- Database URLs with passwords

---

### `check-complexity.js`

```bash
node .qwen/scripts/check-complexity.js
```

Checks code complexity metrics.

**Checks:**
- Function length (< 50 lines)
- File length (< 800 lines)
- Nesting depth (< 4 levels)

---

### `review-summary.js`

```bash
node .qwen/scripts/review-summary.js
```

Generates summary of changed files for code review.

**Output:**
- Files changed count
- Lines added/deleted
- Files by category (source, test, docs, config)
- Review checklist

---

## Workflow Examples

### New Feature Workflow

```bash
# 1. Plan the feature
/plan "Add password reset functionality"

# 2. Implement with TDD
/tdd "Implement reset token generation"
/tdd "Implement reset email sending"

# 3. Review code
/code-review

# 4. Security check
/security-scan

# 5. Pre-commit verification
/verify
node .qwen/scripts/find-debug-statements.js
node .qwen/scripts/security-scan.js

# 6. Commit
git commit -m "feat: add password reset functionality"
```

### Bug Fix Workflow

```bash
# 1. Write regression test first
/tdd "Fix: Login fails with valid credentials"

# 2. Review fix
/code-review

# 3. Verify
/verify

# 4. Commit
git commit -m "fix: resolve login authentication issue"
```

### Code Health Workflow

```bash
# 1. Refactor
/refactor "Clean up user service"

# 2. Check complexity
node .qwen/scripts/check-complexity.js

# 3. Review
/code-review

# 4. Verify tests still pass
/verify

# 5. Commit
git commit -m "refactor: improve user service maintainability"
```

### Pre-Release Workflow

```bash
# 1. Full security audit
/security-scan

# 2. E2E tests for critical flows
/e2e - Test checkout flow
/e2e - Test authentication flow

# 3. Code review of all changes
/code-review

# 4. Coverage verification
node .qwen/scripts/verify-coverage.js

# 5. Review summary
node .qwen/scripts/review-summary.js
```

---

## Command Quick Reference Card

### SDD Commands (Spec-Driven Development)

```
┌─────────────────┬────────────────────────────────────────────────────┐
│ Command         │ Use When                                           │
├─────────────────┼────────────────────────────────────────────────────┤
│ /specify        │ Starting new project - define WHAT & WHY           │
│ /sdd-plan       │ After spec - define HOW (technical approach)       │
│ /tasks          │ After plan - break into actionable tasks           │
│ /implement      │ After tasks - implement task by task with TDD      │
└─────────────────┴────────────────────────────────────────────────────┘
```

### Core Commands

```
┌─────────────────┬────────────────────────────────────┐
│ Command         │ Use When                           │
├─────────────────┼────────────────────────────────────┤
│ /plan           │ Starting new feature               │
│ /tdd            │ Writing code (tests first)         │
│ /code-review    │ Reviewing before commit            │
│ /security-scan  │ Auditing for vulnerabilities       │
│ /build-fix      │ Fixing build errors                │
│ /e2e            │ Creating E2E tests                 │
│ /refactor       │ Cleaning up code                   │
│ /verify         │ Pre-commit checks                  │
│ /docs           │ Researching/writing docs           │
└─────────────────┴────────────────────────────────────┘
```

Scripts:
┌──────────────────────────────┬──────────────────────────┐
│ Script                       │ Purpose                  │
├──────────────────────────────┼──────────────────────────┤
│ verify-coverage.js           │ Check coverage ≥ 80%     │
│ find-debug-statements.js     │ Find console.log         │
│ security-scan.js             │ Find hardcoded secrets   │
│ check-complexity.js          │ Check code structure     │
│ review-summary.js            │ Git diff summary         │
└──────────────────────────────┴──────────────────────────┘
```

---

**Version:** ECC 1.9.0 for Qwen Code
**Last Updated:** 2026-03-30
**SDD Integration:** ✅ Spec-Driven Development workflow enabled
