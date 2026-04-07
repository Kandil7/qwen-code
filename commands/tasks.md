# Spec-Driven Development: Tasks Phase

**Command:** `/tasks`
**Agents:** `orchestrator-tech-lead`, `product-engineer`, `software-engineer`

```
Usage: /tasks "Build a production RAG chatbot for customer support"
```

**Prerequisite:** Technical plan must be approved (run `/sdd-plan` first)

---

## Phase 3: Tasks

This phase breaks the technical plan into **small, actionable, reviewable tasks**.

Each task should be:
- **Atomic**: Can be completed in one session
- **Testable**: Has clear acceptance criteria
- **Independent**: Minimal dependencies on other tasks
- **Verifiable**: Clear definition of done

---

## Output Artifacts

The tasks breakdown includes:

1. **Task List**
   - Ordered by dependency
   - Estimated effort per task
   - Assigned agent/specialty

2. **Task Definitions**
   - Clear description
   - Acceptance criteria
   - Related files/paths

3. **Dependency Graph**
   - Which tasks block others
   - Critical path identification

4. **Implementation Order**
   - Phase 1: Foundation
   - Phase 2: Core features
   - Phase 3: Polish & edge cases

---

## Tasks Template

```markdown
# Tasks: [Project Name]

**Linked Spec:** [.qwen/specs/[spec-name]-spec.md](../specs/[spec-name]-spec.md)
**Linked Plan:** [.qwen/plans/[plan-name]-plan.md](../plans/[plan-name]-plan.md)

## Task Summary

| ID | Task | Phase | Effort | Dependencies | Agent |
|----|------|-------|--------|--------------|-------|
| T-001 | [Task name] | 1 | S/M/L/XL | - | @agent |

## Task Definitions

### Phase 1: Foundation

#### T-001: [Task Name]
**Description:** [What this task accomplishes]

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Files to Create/Modify:**
```
src/
├── module/
│   ├── file.ts
│   └── file.test.ts
```

**Agent:** @software-engineer
**Effort:** Small (< 1 hour)
**Dependencies:** None

**Implementation Notes:**
- [Specific guidance]
- [Patterns to follow]
- [Gotchas to avoid]

---

#### T-002: [Task Name]
...

### Phase 2: Core Features

#### T-010: [Task Name]
...

### Phase 3: Polish & Edge Cases

#### T-020: [Task Name]
...

## Dependency Graph

```
T-001 → T-002 → T-005 → T-010
   ↓      ↓
   T-003 → T-007
   ↓
   T-004
```

## Critical Path

```
T-001 → T-002 → T-005 → T-010 → T-015 → T-020
```

**Total Critical Tasks:** 6
**Estimated Critical Path Effort:** [X] hours

## Task Status Tracking

| ID | Status | Started | Completed | Notes |
|----|--------|---------|-----------|-------|
| T-001 | ✅ Done | Date | Date | [Notes] |
| T-002 | 🔄 In Progress | Date | - | [Notes] |
| T-003 | ⏳ Pending | - | - | [Notes] |

## Definition of Done (Per Task)

- [ ] Code implemented per plan
- [ ] Unit tests written and passing
- [ ] Integration tests if applicable
- [ ] Code reviewed (`/code-review`)
- [ ] Security checked (`/security-scan`)
- [ ] Pre-commit verification (`/verify`)
- [ ] Committed with conventional commit message

---

**Status:** READY | IN_PROGRESS | COMPLETE
**Last Updated:** [Date]
```

---

## Task Breakdown Strategy

### Layered Approach

Break tasks by architectural layer:

```
Phase 1: Foundation
├── Database schema & migrations
├── Core data models
├── Base utilities
└── Configuration setup

Phase 2: Core Features
├── API endpoints (CRUD)
├── Business logic services
├── Authentication/Authorization
└── External integrations

Phase 3: Polish & Edge Cases
├── Error handling
├── Logging & monitoring
├── Performance optimization
└── Documentation
```

### Effort Estimation

| Size | Duration | Description |
|------|----------|-------------|
| **S** | < 30 min | Simple change, single file |
| **M** | 30-60 min | Moderate change, 2-3 files |
| **L** | 1-2 hours | Complex change, multiple files |
| **XL** | 2+ hours | Split into smaller tasks |

---

## Process Flow

```
┌─────────────────────────────────────────────────────────┐
│  TASKS PHASE                                            │
│                                                         │
│  1. Review specification and plan                       │
│  2. Identify all required tasks                         │
│  3. Estimate effort per task                            │
│  4. Map dependencies                                    │
│  5. Order by implementation sequence                    │
│  6. Assign agents to tasks                              │
│                                                         │
│  ↓ VALIDATION GATE                                      │
│  ☐ All tasks are atomic                                 │
│  ☐ All tasks have acceptance criteria                   │
│  ☐ Dependencies are mapped                              │
│  ☐ Critical path is identified                          │
│  ☐ Total effort is estimated                            │
│                                                         │
│  ✅ APPROVED → Move to IMPLEMENT phase                  │
│  ❌ REJECTED → Refine task breakdown                    │
└─────────────────────────────────────────────────────────┘
```

---

## When to Use `/tasks`

### ✅ Use When:
- Technical plan is approved
- Ready to start implementation
- Need clear implementation roadmap
- Multi-session project

### ❌ Don't Use When:
- Plan is not approved
- Simple bug fix (just use `/tdd`)
- Single-task change

---

## Validation Checklist

Before moving to the Implement phase, verify:

- [ ] All tasks are atomic and actionable
- [ ] Each task has clear acceptance criteria
- [ ] Dependencies are correctly mapped
- [ ] Critical path is identified
- [ ] Effort estimates are realistic
- [ ] Task order makes logical sense
- [ ] Each task can be verified independently

---

## Example Usage

### Example 1: New Project

```
/tasks "Build a production RAG chatbot for customer support"
```

**Expected Output:**
- Tasks in `tasks/rag-chatbot-tasks.md`
- 20-30 tasks across 3 phases
- Clear dependency graph
- Critical path identified

**Sample Tasks:**
```
Phase 1: Foundation
T-001: Set up project structure (S) @software-engineer
T-002: Configure database connection (S) @database-engineer
T-003: Create user model (S) @software-engineer
T-004: Set up logging infrastructure (S) @devops-platform-engineer

Phase 2: Core Features
T-010: Implement document ingestion API (M) @api-engineer
T-011: Implement embedding generation (M) @embedding-engineer
T-012: Implement vector search (M) @vector-db-engineer
T-013: Implement chat API (M) @api-engineer

Phase 3: Polish
T-020: Add rate limiting (S) @security-compliance-engineer
T-021: Add monitoring dashboards (M) @observability-engineer
T-022: Write API documentation (M) @documentation-writer
```

---

## Integration with Other Commands

```bash
# 1. Specification (already done)
/specify "Build user dashboard with analytics"

# 2. Technical plan (already done)
/sdd-plan "Build user dashboard with analytics"

# 3. Task breakdown (current phase)
/tasks "Build user dashboard with analytics"

# 4. Implement task by task (next phase)
/implement "Build user dashboard with analytics --task T-001"
```

---

## Task Storage

Task definitions are stored in:
```
<project-root>/
└── .qwen/
    └── tasks/
        ├── [project-name]-tasks.md
        ├── [feature-name]-tasks.md
        └── ...
```

Task status is tracked in the same file.

---

## Next Phase: Implement

Once tasks are defined, proceed to implementation:

```bash
# Implement specific task
/implement "Build user dashboard --task T-001"

# Or implement all remaining tasks
/implement "Build user dashboard"
```

Each task is implemented with TDD:
1. Write test first
2. Implement to pass test
3. Refactor
4. Verify and commit

---

## Task Implementation Workflow

For each task:

```bash
# 1. Mark task as in-progress
# Update tasks/[project]-tasks.md

# 2. Implement with TDD
/tdd "[Task description from T-001]"

# 3. Review code
/code-review

# 4. Security check (if applicable)
/security-scan

# 5. Pre-commit verification
/verify

# 6. Commit
git commit -m "feat: [conventional commit message]"

# 7. Mark task as done
# Update tasks/[project]-tasks.md
```

---

**Version:** SDD 1.0 for Qwen Code
**Based on:** GitHub Spec Kit methodology
**Adapted for:** Qwen Code agent ecosystem
