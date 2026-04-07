# Spec-Driven Development: Implement Phase

**Command:** `/implement`
**Agents:** `orchestrator-tech-lead`, `full-stack-ai-engineer`, `software-engineer`, + specialized agents per task

```
Usage: /implement "Build a production RAG chatbot --task T-001"
```

**Prerequisite:** Tasks must be defined (run `/tasks` first)

---

## Phase 4: Implement

This is where code gets written **task by task** using Test-Driven Development.

Each task is implemented following this workflow:
1. **RED** - Write failing test
2. **GREEN** - Implement minimal code to pass
3. **BLUE** - Refactor with confidence
4. **VERIFY** - Run all checks before commit

---

## Implementation Workflow

### Per-Task Flow

```
┌─────────────────────────────────────────────────────────┐
│  IMPLEMENT PHASE (Per Task)                             │
│                                                         │
│  1. Read task definition & acceptance criteria          │
│  2. Invoke specialized agent for the task               │
│  3. Implement with TDD (/tdd)                           │
│     - RED: Write failing test                           │
│     - GREEN: Make test pass                             │
│     - BLUE: Refactor                                    │
│  4. Review code (/code-review)                          │
│  5. Security scan if applicable (/security-scan)        │
│  6. Pre-commit verification (/verify)                   │
│  7. Commit with conventional commit                     │
│  8. Update task status                                  │
│                                                         │
│  ↓ TASK COMPLETE                                        │
│  Move to next task in dependency order                  │
└─────────────────────────────────────────────────────────┘
```

---

## Command Usage

### Implement Specific Task

```bash
/implement "Build RAG chatbot --task T-001"
```

This will:
1. Read task T-001 from `.qwen/tasks/rag-chatbot-tasks.md`
2. Invoke the assigned agent
3. Implement with TDD
4. Run all verification checks
5. Update task status

### Implement All Remaining Tasks

```bash
/implement "Build RAG chatbot"
```

This will:
1. Read all pending tasks
2. Implement in dependency order
3. Pause between tasks for review
4. Track progress in task file

### Implement with Specific Agent

```bash
/implement "Build RAG chatbot --task T-011 --agent @embedding-engineer"
```

Override the default agent for specialized tasks.

---

## Agent Assignment by Task Type

| Task Type | Primary Agent | Supporting Agents |
|-----------|---------------|-------------------|
| Database schema | @database-engineer | @software-engineer |
| API endpoints | @api-engineer | @software-engineer |
| Frontend UI | @frontend-engineer | @accessibility-specialist |
| AI/ML features | @full-stack-ai-engineer | @embedding-engineer, @vector-db-engineer |
| Authentication | @security-compliance-engineer | @software-engineer |
| DevOps/CI/CD | @dev-ops-platform-engineer | @observability-engineer |
| Documentation | @documentation-writer | - |
| Tests | @test-engineer | @qa-automation-engineer |

---

## Implementation Template

For each task, the implementation follows this pattern:

```markdown
## Task T-001: [Task Name]

### Implementation Log

**Started:** [Date/Time]
**Agent:** @software-engineer
**Status:** IN_PROGRESS

### Step 1: Understand Requirements

**Task Definition:**
> [Copy from tasks file]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

### Step 2: TDD Implementation

#### RED Phase
```bash
# Create test file
tests/unit/test_[module].py

# Write failing test
def test_[scenario]():
    assert [expected_behavior]
```

#### GREEN Phase
```bash
# Implement minimal code
src/[module]/[file].py

# Run test - should pass
pytest tests/unit/test_[module].py
```

#### BLUE Phase
```bash
# Refactor for clarity
# Extract functions, improve naming
# Run tests - still passing
```

### Step 3: Code Review

```bash
/code-review
```

**Review Results:**
- [ ] No critical issues
- [ ] No security issues
- [ ] Code quality passes

### Step 4: Security Scan (if applicable)

```bash
/security-scan
```

**Security Results:**
- [ ] No hardcoded secrets
- [ ] Input validation in place
- [ ] SQL injection protected

### Step 5: Pre-Commit Verification

```bash
/verify
node .qwen/scripts/find-debug-statements.js
node .qwen/scripts/security-scan.js
```

**Verification Results:**
- [ ] No debug statements
- [ ] No secrets detected
- [ ] Tests passing
- [ ] Coverage ≥ 80%

### Step 6: Commit

```bash
git add .
git commit -m "feat: [conventional commit message]"
```

### Step 7: Update Task Status

Update `.qwen/tasks/[project]-tasks.md`:

| ID | Status | Started | Completed | Notes |
|----|--------|---------|-----------|-------|
| T-001 | ✅ Done | 2026-03-30 | 2026-03-30 | Implemented per spec |

---

**Completed:** [Date/Time]
**Duration:** [X] hours
**Files Changed:** [List]
```

---

## Implementation Order

Follow the dependency graph from the tasks file:

```
Example Order for RAG Chatbot:

Phase 1: Foundation (Week 1)
├── T-001: Project setup
├── T-002: Database configuration
├── T-003: User model
├── T-004: Logging infrastructure

Phase 2: Core Features (Week 2-3)
├── T-010: Document ingestion API
├── T-011: Embedding generation
├── T-012: Vector search
├── T-013: Chat API
├── T-014: Message history

Phase 3: Polish (Week 4)
├── T-020: Rate limiting
├── T-021: Monitoring
├── T-022: Documentation
├── T-023: Performance tuning
```

---

## Quality Gates

Every task must pass these gates before commit:

### Gate 1: Code Review

```bash
/code-review
```

**Must pass:**
- No critical security issues
- No major code quality issues
- Function size < 50 lines
- File size < 800 lines
- Nesting < 4 levels

### Gate 2: Security Scan

```bash
/security-scan
```

**Must pass:**
- No hardcoded secrets
- Input validation present
- SQL uses parameterized queries
- Authentication checks in place

### Gate 3: Pre-Commit Verification

```bash
/verify
```

**Must pass:**
- All tests passing
- Coverage ≥ 80%
- No debug statements
- No console.log (except errors)

### Gate 4: Coverage Check

```bash
node .qwen/scripts/verify-coverage.js
```

**Must pass:**
- Statements ≥ 80%
- Branches ≥ 80%
- Functions ≥ 80%
- Lines ≥ 80%

---

## Handling Blockers

If a task is blocked:

1. **Document the blocker** in task file
2. **Create mitigation task** if needed
3. **Move to next available task** in dependency graph
4. **Escalate** if blocker requires external resolution

```markdown
### Blocker Log

| Date | Blocker | Impact | Resolution | Status |
|------|---------|--------|------------|--------|
| Date | [Issue] | Blocks T-005 | [Action] | Open/Resolved |
```

---

## Progress Tracking

### Daily Standup Format

```markdown
## Daily Progress - [Date]

**Yesterday:**
- T-001: ✅ Completed project setup
- T-002: ✅ Completed database config

**Today:**
- T-003: 🔄 In progress - user model
- T-004: ⏳ Pending

**Blockers:**
- None

**Quality Metrics:**
- Tests passing: 15/15
- Coverage: 85%
- Code reviews: 2/2 approved
```

### Burndown Chart

Track task completion:

```
Tasks Remaining:
├── Phase 1: ████░░░░ 6/8 done
├── Phase 2: ██░░░░░░ 2/10 done
└── Phase 3: ░░░░░░░░ 0/5 done

Total: 8/23 (35%) complete
```

---

## Example Implementation Session

```bash
# Start implementation
/implement "Build RAG chatbot --task T-001"

# Agent reads task definition
# Agent invokes @software-engineer

# TDD Workflow
/tdd "Set up project structure with src/ and tests/ directories"

# After implementation
/code-review
/security-scan
/verify

# Commit
git commit -m "chore: initialize project structure"

# Update task status
# Mark T-001 as done in tasks file

# Move to next task
/implement "Build RAG chatbot --task T-002"
```

---

## Integration with Other Commands

```bash
# Full SDD workflow
/specify "Build RAG chatbot"
/sdd-plan "Build RAG chatbot"
/tasks "Build RAG chatbot"

# Implementation
/implement "Build RAG chatbot --task T-001"
/implement "Build RAG chatbot --task T-002"
...

# Between tasks
/code-review    # After each task
/security-scan  # After sensitive tasks
/verify         # Before every commit

# After all tasks
/e2e            # Create E2E tests for critical flows
/docs           # Generate documentation
```

---

## Implementation Storage

Implementation artifacts stored in:
```
<project-root>/
├── .qwen/
│   ├── specs/           # Specifications
│   ├── plans/           # Technical plans
│   ├── tasks/           # Task definitions + status
│   └── implementations/ # Implementation logs (optional)
│       └── [task-id]-log.md
├── src/                 # Source code
└── tests/               # Tests
```

---

## Post-Implementation

After all tasks are complete:

### 1. Full Code Review

```bash
/code-review - Review entire project
```

### 2. Security Audit

```bash
/security-scan - Full audit
```

### 3. E2E Testing

```bash
/e2e - Test all critical flows
```

### 4. Documentation

```bash
/docs - Generate final documentation
```

### 5. Performance Check

```bash
# Run performance tests
# Check latency, throughput
```

### 6. Deployment Readiness

```bash
/verify - Full verification
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Task Completion Rate | 100% |
| Test Coverage | ≥ 80% |
| Code Review Pass Rate | ≥ 90% |
| Security Issues (Critical) | 0 |
| Build Success Rate | ≥ 95% |

---

**Version:** SDD 1.0 for Qwen Code
**Based on:** GitHub Spec Kit methodology
**Adapted for:** Qwen Code agent ecosystem
