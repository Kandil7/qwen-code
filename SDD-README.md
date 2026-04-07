# Spec-Driven Development (SDD) for Qwen Code

**Version:** 1.0  
**Based on:** GitHub Spec Kit methodology  
**Adapted for:** Qwen Code agent ecosystem

---

## Quick Start

```bash
# 1. Define WHAT and WHY (Specification)
/specify "Build a production RAG chatbot for customer support"

# 2. Define HOW (Technical Plan)
/sdd-plan "Build a production RAG chatbot for customer support"

# 3. Break into tasks
/tasks "Build a production RAG chatbot for customer support"

# 4. Implement task by task
/implement "Build RAG chatbot --task T-001"
/implement "Build RAG chatbot --task T-002"
```

---

## What is Spec-Driven Development?

Instead of coding first and documenting later, you start with a **specification** that serves as a contract for how your code should behave. This becomes the source of truth that AI tools use to generate, test, and validate code.

**Core Principle:** Separate stable "what" from flexible "how"

---

## The 4 Phases

### Phase 1: Specify (WHAT & WHY)

**Command:** `/specify "[Project Name]"`

**Purpose:** Define what you're building and why - not how.

**Output:** `.qwen/specs/[project]-spec.md`

**Includes:**
- Problem statement
- User personas
- User journeys
- Success criteria (functional & non-functional)
- Scope boundaries (in/out)
- Constraints (technical, business, compliance)
- Risks & mitigations

**Validation Gate:**
- ✅ Problem is clear
- ✅ Users are identified
- ✅ Success is measurable
- ✅ Scope is bounded
- ✅ Constraints documented

---

### Phase 2: Plan (HOW)

**Command:** `/sdd-plan "[Project Name]"`

**Prerequisite:** Specification approved

**Purpose:** Define technical approach - how you'll build it.

**Output:** `.qwen/plans/[project]-plan.md`

**Includes:**
- Architecture overview with diagrams
- Technology stack with justification
- API design (endpoints, schemas)
- Data models (entities, relationships)
- Integration points (external/internal)
- Security architecture (authN/Z, data protection)
- Testing strategy (unit, integration, E2E)
- Deployment architecture (CI/CD, environments)

**Validation Gate:**
- ✅ Architecture supports all spec requirements
- ✅ Technology choices justified
- ✅ APIs well-designed
- ✅ Security baked in
- ✅ Testing strategy comprehensive

---

### Phase 3: Tasks (BREAKDOWN)

**Command:** `/tasks "[Project Name]"`

**Prerequisite:** Technical plan approved

**Purpose:** Break plan into small, actionable, reviewable tasks.

**Output:** `.qwen/tasks/[project]-tasks.md`

**Includes:**
- Task list with IDs (T-001, T-002, etc.)
- Effort estimates (S/M/L/XL)
- Dependencies mapped
- Critical path identified
- Agent assignments
- Implementation order (Phase 1, 2, 3)

**Task Criteria:**
- **Atomic:** Can be completed in one session
- **Testable:** Has clear acceptance criteria
- **Independent:** Minimal dependencies
- **Verifiable:** Clear definition of done

**Validation Gate:**
- ✅ All tasks are atomic
- ✅ All tasks have acceptance criteria
- ✅ Dependencies mapped
- ✅ Critical path identified

---

### Phase 4: Implement (CODE)

**Command:** `/implement "[Project] --task T-001"`

**Prerequisite:** Tasks defined

**Purpose:** Implement task by task using TDD.

**Workflow per Task:**
1. **RED** - Write failing test
2. **GREEN** - Implement minimal code to pass
3. **BLUE** - Refactor with confidence
4. **VERIFY** - Run all checks before commit

**Quality Gates:**
- `/code-review` - No critical issues
- `/security-scan` - No vulnerabilities
- `/verify` - All checks pass
- Coverage ≥ 80%

**Output:**
- Working code in `src/`
- Tests in `tests/`
- Commits with conventional commit messages
- Updated task status

---

## Agent Coordination

### Phase 1: Specify
```
@orchestrator-tech-lead + @product-engineer + @documentation-writer
```

### Phase 2: Plan
```
@orchestrator-tech-lead + @architect + @tech-lead-ai-engineer
```

### Phase 3: Tasks
```
@orchestrator-tech-lead + @product-engineer + @software-engineer
```

### Phase 4: Implement
```
@orchestrator-tech-lead + [specialized agent per task]
```

**Specialized Agent Assignment:**
| Task Type | Agent |
|-----------|-------|
| Database | @database-engineer |
| API | @api-engineer |
| Frontend | @frontend-engineer |
| AI/ML | @full-stack-ai-engineer + @embedding-engineer + @vector-db-engineer |
| Security | @security-compliance-engineer |
| DevOps | @dev-ops-platform-engineer |
| Tests | @test-engineer + @qa-automation-engineer |

---

## File Structure

```
project-root/
├── .qwen/
│   ├── specs/              # Specifications (Phase 1)
│   │   └── [project]-spec.md
│   ├── plans/              # Technical plans (Phase 2)
│   │   └── [project]-plan.md
│   ├── tasks/              # Task definitions (Phase 3)
│   │   └── [project]-tasks.md
│   └── commands/           # SDD commands
│       ├── specify.md
│       ├── sdd-plan.md
│       ├── tasks.md
│       └── implement.md
├── src/                    # Source code (Phase 4)
└── tests/                  # Tests (Phase 4)
```

---

## Utility Scripts

### Validate SDD Phase

```bash
# Validate specific phase
node .qwen/scripts/validate-sdd-phase.js specify my-project
node .qwen/scripts/validate-sdd-phase.js plan my-project
node .qwen/scripts/validate-sdd-phase.js tasks my-project
node .qwen/scripts/validate-sdd-phase.js implement my-project

# Validate all phases
node .qwen/scripts/validate-sdd-phase.js all my-project
```

### SDD Status Dashboard

```bash
# Show all projects
node .qwen/scripts/sdd-status.js

# Show specific project
node .qwen/scripts/sdd-status.js my-project
```

---

## When to Use SDD

### ✅ Use SDD When:

- **Greenfield projects** - Ensures AI builds your actual intent
- **Major feature additions** - Encodes architectural constraints
- **Legacy modernization** - Capture business logic before rebuild
- **Multi-team initiatives** - Shared understanding required
- **Compliance-critical** - Requirements must be explicit

### ❌ Don't Use SDD When:

- **Simple bug fixes** - Just use `/tdd`
- **Minor UI tweaks** - Direct implementation is faster
- **Emergency hotfixes** - No time for documentation
- **Quick prototypes** - Exploratory work doesn't need specs

---

## Example: RAG Chatbot

### Phase 1: Specify

```bash
/specify "Build a production RAG chatbot for customer support"
```

**Output:** `.qwen/specs/rag-chatbot-spec.md`

**Contents:**
- Problem: Customers wait too long for support responses
- Users: Customers (self-service), Support agents (escalation)
- Journeys: Ask question → Get answer → Escalate if needed
- Success: 80% resolution rate, < 2s response time
- Scope: Chat interface, knowledge base search, escalation
- Constraints: Must use existing knowledge base, GDPR compliant

---

### Phase 2: Plan

```bash
/sdd-plan "Build a production RAG chatbot for customer support"
```

**Output:** `.qwen/plans/rag-chatbot-plan.md`

**Contents:**
- Architecture: React + Node.js + FastAPI + PostgreSQL + Pinecone
- API: POST /chat, GET /history, POST /feedback
- Data: User, Message, Conversation, Feedback entities
- Security: OAuth2, RBAC, data encryption
- Testing: Jest (unit), Supertest (integration), Playwright (E2E)
- Deployment: Docker + Kubernetes on AWS

---

### Phase 3: Tasks

```bash
/tasks "Build a production RAG chatbot for customer support"
```

**Output:** `.qwen/tasks/rag-chatbot-tasks.md`

**Sample Tasks:**
```
Phase 1: Foundation
T-001: Set up project structure (S) @software-engineer
T-002: Configure database connection (S) @database-engineer
T-003: Create user model (S) @software-engineer

Phase 2: Core Features
T-010: Implement document ingestion API (M) @api-engineer
T-011: Implement embedding generation (M) @embedding-engineer
T-012: Implement vector search (M) @vector-db-engineer
T-013: Implement chat API (M) @api-engineer

Phase 3: Polish
T-020: Add rate limiting (S) @security-compliance-engineer
T-021: Add monitoring (M) @observability-engineer
T-022: Write documentation (M) @documentation-writer
```

---

### Phase 4: Implement

```bash
/implement "Build RAG chatbot --task T-001"
/implement "Build RAG chatbot --task T-002"
/implement "Build RAG chatbot --task T-003"
...
```

**Per Task:**
1. Read task definition
2. Implement with TDD (`/tdd`)
3. Code review (`/code-review`)
4. Security scan (`/security-scan`)
5. Pre-commit verification (`/verify`)
6. Commit
7. Update task status

---

## Progress Tracking

### Task Status Symbols

| Symbol | Meaning |
|--------|---------|
| ⏳ | Pending - Not started |
| 🔄 | In Progress - Currently working |
| 🟡 | Blocked - Waiting on something |
| ✅ | Done - Completed and verified |

### Definition of Done (Per Task)

- [ ] Code implemented per plan
- [ ] Unit tests written and passing
- [ ] Integration tests if applicable
- [ ] Code reviewed (`/code-review`)
- [ ] Security checked (`/security-scan`)
- [ ] Pre-commit verification (`/verify`)
- [ ] Committed with conventional commit
- [ ] Task status updated

### Definition of Done (Project)

- [ ] All tasks marked as Done
- [ ] All tests passing
- [ ] Coverage ≥ 80%
- [ ] No critical security issues
- [ ] Documentation complete
- [ ] E2E tests for critical flows passing

---

## Templates

SDD templates are available in `.qwen/templates/sdd/`:

- `spec-template.md` - Specification template
- `plan-template.md` - Technical plan template
- `tasks-template.md` - Task breakdown template

Use these as starting points for new projects.

---

## Best Practices

### Specification

- Focus on **WHAT** and **WHY**, not HOW
- Make success criteria **measurable**
- Be explicit about what's **out of scope**
- Identify **risks early** with mitigations

### Technical Plan

- Justify **technology choices**
- Design for **security from the start**
- Plan for **observability** (logging, metrics, tracing)
- Include **rollback strategy**

### Tasks

- Keep tasks **atomic** (< 2 hours each)
- Define **clear acceptance criteria**
- Map **dependencies explicitly**
- Identify **critical path**

### Implementation

- **TDD is mandatory** - Red → Green → Blue
- **Quality gates** - Never skip code review
- **Commit often** - One commit per task
- **Update status** - Keep tasks file current

---

## Troubleshooting

### "I don't know where to start"

Start with `/specify`. Even if you're not sure about all details, writing down the problem statement clarifies thinking.

### "The spec is too vague"

Go back to `/specify` and add more detail. Vague specs lead to wrong implementations.

### "Tasks are too big"

Split XL tasks into smaller tasks. A task should be completable in one session.

### "I'm blocked on a task"

Mark it as 🟡 Blocked, document the blocker, and move to the next available task.

### "Do I need all 4 phases?"

For complex projects: yes. For simple features, you might combine Specify + Plan, or skip detailed tasks.

---

## Comparison with Other Approaches

| Approach | Plan First? | Tests First? | Docs First? | Best For |
|----------|-------------|--------------|-------------|----------|
| **SDD** | ✅ | ✅ | ✅ | Complex projects |
| **TDD Only** | ❌ | ✅ | ❌ | Simple features |
| **Traditional** | ❌ | ❌ | ❌ | Legacy codebases |
| **Prototype** | ❌ | ❌ | ❌ | Exploration |

---

## Resources

- **GitHub Spec Kit:** Original methodology
- **`.qwen/commands/specify.md`**: Full specify command docs
- **`.qwen/commands/sdd-plan.md`**: Full plan command docs
- **`.qwen/commands/tasks.md`**: Full tasks command docs
- **`.qwen/commands/implement.md`**: Full implement command docs

---

**Last Updated:** March 30, 2026
**Status:** ✅ Production Ready
