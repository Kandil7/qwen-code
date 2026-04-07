# Tasks: [Project Name]

**Linked Spec:** [.qwen/specs/[spec-name]-spec.md](../specs/[spec-name]-spec.md)
**Linked Plan:** [.qwen/plans/[plan-name]-plan.md](../plans/[plan-name]-plan.md)

---

## Task Summary

| ID | Task | Phase | Effort | Dependencies | Status | Agent |
|----|------|-------|--------|--------------|--------|-------|
| T-001 | [Task name] | 1 | S/M/L/XL | - | ⏳ Pending | @agent |
| T-002 | [Task name] | 1 | S/M/L/XL | T-001 | ⏳ Pending | @agent |
| T-003 | [Task name] | 1 | S/M/L/XL | T-001 | ⏳ Pending | @agent |
| T-010 | [Task name] | 2 | S/M/L/XL | T-002, T-003 | ⏳ Pending | @agent |
| T-020 | [Task name] | 3 | S/M/L/XL | T-010 | ⏳ Pending | @agent |

**Effort Legend:**
- **S** - Small (< 30 min)
- **M** - Medium (30-60 min)
- **L** - Large (1-2 hours)
- **XL** - Extra Large (2+ hours, consider splitting)

**Status Legend:**
- ⏳ Pending - Not started
- 🔄 In Progress - Currently working
- 🟡 Blocked - Waiting on something
- ✅ Done - Completed and verified

---

## Task Definitions

### Phase 1: Foundation

#### T-001: [Task Name]

**Description:**
[Clear description of what this task accomplishes]

**Acceptance Criteria:**
- [ ] [Criterion 1 - specific, testable]
- [ ] [Criterion 2 - specific, testable]
- [ ] [Criterion 3 - specific, testable]

**Files to Create/Modify:**
```
src/
├── module/
│   ├── file.ts
│   └── file.test.ts
tests/
└── unit/
    └── test_file.ts
```

**Agent:** @software-engineer
**Effort:** Small (< 1 hour)
**Dependencies:** None

**Implementation Notes:**
- [Specific guidance]
- [Patterns to follow]
- [Gotchas to avoid]

**Testing Requirements:**
- Unit tests for [functions]
- Integration tests if [condition]

---

#### T-002: [Task Name]

**Description:**
...

---

### Phase 2: Core Features

#### T-010: [Task Name]

**Description:**
...

---

### Phase 3: Polish & Edge Cases

#### T-020: [Task Name]

**Description:**
...

---

## Dependency Graph

```
                    ┌─────────┐
                    │  T-001  │
                    │ Project │
                    │  Setup  │
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
       ┌─────────┐ ┌─────────┐ ┌─────────┐
       │  T-002  │ │  T-003  │ │  T-004  │
       │Database │ │  User   │ │Logging  │
       │  Config │ │  Model  │ │  Infra  │
       └────┬────┘ └────┬────┘ └────┬────┘
            │            │            │
            └────────────┼────────────┘
                         │
                         ▼
                    ┌─────────┐
                    │  T-010  │
                    │   API   │
                    │Endpoint │
                    └────┬────┘
                         │
                         ▼
                    ┌─────────┐
                    │  T-020  │
                    │ Polish  │
                    └─────────┘
```

---

## Critical Path

```
T-001 → T-002 → T-010 → T-020
```

**Critical Tasks:** 4
**Total Tasks:** 23
**Critical Path Effort:** ~3 hours
**Total Project Effort:** ~15 hours

---

## Task Status Tracking

| ID | Status | Started | Completed | Duration | Notes |
|----|--------|---------|-----------|----------|-------|
| T-001 | ✅ Done | 2026-03-30 09:00 | 2026-03-30 09:45 | 45 min | Completed ahead of estimate |
| T-002 | 🔄 In Progress | 2026-03-30 10:00 | - | - | Working on schema |
| T-003 | ⏳ Pending | - | - | - | Blocked by T-002 |
| T-004 | ⏳ Pending | - | - | - | - |
| T-010 | ⏳ Pending | - | - | - | - |

---

## Implementation Log

### T-001: [Task Name]

**Started:** 2026-03-30 09:00
**Completed:** 2026-03-30 09:45
**Agent:** @software-engineer

**Implementation Steps:**
1. Created project structure
2. Configured TypeScript
3. Set up test framework
4. Added linting rules

**Tests Written:**
- 5 unit tests for utilities
- 2 integration tests

**Code Review:** ✅ Passed
**Security Scan:** ✅ Not applicable
**Verification:** ✅ Passed

**Commit:** `chore: initialize project structure (#1)`

**Notes:** Completed faster than expected. TypeScript config required extra attention for strict mode.

---

### T-002: [Task Name]

**Started:** 2026-03-30 10:00
**Status:** In Progress

**Current Step:** [What's being worked on]

---

## Blockers

| ID | Task | Blocker | Impact | Resolution | Status |
|----|------|---------|--------|------------|--------|
| B-001 | T-003 | Waiting for T-002 | Delays T-003 | Complete T-002 first | Open |

---

## Definition of Done (Per Task)

Every task must complete this checklist:

- [ ] Code implemented per plan
- [ ] Unit tests written and passing
- [ ] Integration tests if applicable
- [ ] Code reviewed (`/code-review`)
- [ ] Security checked (`/security-scan`) if applicable
- [ ] Pre-commit verification (`/verify`)
- [ ] Committed with conventional commit message
- [ ] Task status updated in this file

---

## Definition of Done (Project)

All tasks complete when:

- [ ] All tasks marked as Done
- [ ] All tests passing
- [ ] Coverage ≥ 80%
- [ ] No critical security issues
- [ ] Documentation complete
- [ ] E2E tests for critical flows passing
- [ ] Deployment successful

---

## Progress Summary

```
Phase 1: Foundation
├── T-001: ✅ Done
├── T-002: 🔄 In Progress
├── T-003: ⏳ Pending
└── T-004: ⏳ Pending
    Progress: ████░░░░ 1/4 (25%)

Phase 2: Core Features
├── T-010: ⏳ Pending
├── T-011: ⏳ Pending
├── T-012: ⏳ Pending
└── T-013: ⏳ Pending
    Progress: ░░░░░░░░ 0/4 (0%)

Phase 3: Polish
├── T-020: ⏳ Pending
├── T-021: ⏳ Pending
└── T-022: ⏳ Pending
    Progress: ░░░░░░░░ 0/3 (0%)

Total: ████░░░░░░░░░░░░░░░░ 1/11 (9%)
```

---

**Document Control:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | [Date] | [Name] | Initial task breakdown |
| 1.0 | [Date] | [Name] | Approved for implementation |

---

**Status:** READY | IN_PROGRESS | COMPLETE
**Created:** [Date]
**Last Updated:** [Date]
**Next Review:** [Daily standup / Task completion]
