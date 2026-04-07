# Spec-Driven Development: Specify Phase

**Command:** `/specify`
**Agents:** `orchestrator-tech-lead`, `product-engineer`, `documentation-writer`

```
Usage: /specify "Build a production RAG chatbot for customer support"
```

---

## What is Spec-Driven Development?

Instead of coding first and documenting later, you start with a **specification** that serves as a contract for how your code should behave. This becomes the source of truth that AI tools use to generate, test, and validate code.

**Core Principle:** Separate stable "what" from flexible "how"

---

## Phase 1: Specify

This phase defines **WHAT** you're building and **WHY** - not how.

### Output Artifacts

The specification includes:

1. **Problem Statement**
   - What problem are we solving?
   - Who has this problem?
   - Why is it important?

2. **User Journeys**
   - Primary user personas
   - Step-by-step user flows
   - Expected outcomes per flow

3. **Success Criteria**
   - Measurable outcomes (KPIs)
   - Acceptance criteria per feature
   - Non-functional requirements (performance, security)

4. **Scope Boundaries**
   - In-scope features
   - Out-of-scope (explicitly)
   - Future considerations

5. **Constraints**
   - Technical constraints (must use X, cannot use Y)
   - Business constraints (timeline, budget)
   - Compliance requirements (GDPR, HIPAA, etc.)

---

## Specification Template

```markdown
# Specification: [Project Name]

## 1. Problem Statement
[Clear description of the problem and why it matters]

## 2. User Personas
| Persona | Description | Goals |
|---------|-------------|-------|
| [Name] | [Description] | [Goals] |

## 3. User Journeys

### Journey 1: [Name]
**Actor:** [Persona]
**Trigger:** [What starts this journey]
**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Outcome:** [Successful completion state]

### Journey 2: [Name]
...

## 4. Success Criteria

### Functional Requirements
| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-001 | [Requirement] | Must/May/Should | [Criteria] |

### Non-Functional Requirements
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Performance | < 200ms response time |
| NFR-002 | Availability | 99.9% uptime |
| NFR-003 | Security | OAuth2, RBAC |

## 5. Scope

### In Scope (v1.0)
- [Feature 1]
- [Feature 2]

### Out of Scope
- [Feature X] - Future consideration
- [Feature Y] - Explicitly not building

## 6. Constraints

### Technical
- Must integrate with [existing system]
- Cannot use [restricted technology]
- Must support [browser/platform]

### Business
- Timeline: [Date]
- Budget: [If applicable]

### Compliance
- [GDPR / HIPAA / SOC2 / etc.]

## 7. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Strategy] |

## 8. Open Questions
- [Question 1] - Owner: [Name] - Due: [Date]
- [Question 2] - Owner: [Name] - Due: [Date]

---

**Status:** DRAFT | IN_REVIEW | APPROVED
**Last Updated:** [Date]
**Approvers:** [Names]
```

---

## Process Flow

```
┌─────────────────────────────────────────────────────────┐
│  SPECIFY PHASE                                          │
│                                                         │
│  1. Define problem statement                            │
│  2. Identify user personas                              │
│  3. Map user journeys                                   │
│  4. Define success criteria                             │
│  5. Set scope boundaries                                │
│  6. Document constraints                                │
│                                                         │
│  ↓ VALIDATION GATE                                      │
│  ☐ Problem is clear                                     │
│  ☐ Users are identified                                 │
│  ☐ Success is measurable                                │
│  ☐ Scope is bounded                                     │
│  ☐ Constraints are documented                           │
│                                                         │
│  ✅ APPROVED → Move to PLAN phase                       │
│  ❌ REJECTED → Revise specification                     │
└─────────────────────────────────────────────────────────┘
```

---

## When to Use `/specify`

### ✅ Use When:
- Starting a greenfield project
- Adding major feature to existing system
- Modernizing legacy system
- Multi-team initiative requiring alignment
- Compliance-critical development

### ❌ Don't Use When:
- Simple bug fix
- Minor UI tweak
- Emergency hotfix
- Quick prototype/experiment

---

## Validation Checklist

Before moving to the Plan phase, verify:

- [ ] Problem statement is clear and specific
- [ ] All user personas are identified
- [ ] User journeys cover primary use cases
- [ ] Success criteria are measurable
- [ ] Scope boundaries are explicit
- [ ] Technical constraints are documented
- [ ] Compliance requirements are listed
- [ ] Risks have mitigation strategies
- [ ] Open questions have owners

---

## Example Usage

### Example 1: New Project

```
/specify "Build a production RAG chatbot for customer support"
```

**Expected Output:**
- Specification document in `specs/rag-chatbot-spec.md`
- User journeys for customer and support agent
- Success metrics (resolution rate, response time)
- Constraints (must use existing knowledge base)

### Example 2: Feature Addition

```
/specify "Add OAuth2 authentication to existing API"
```

**Expected Output:**
- Specification in `specs/oauth2-auth-spec.md`
- User journeys for login, token refresh, logout
- Security requirements (token expiry, scopes)
- Integration points with existing auth

### Example 3: Legacy Modernization

```
/specify "Migrate monolithic payment service to microservices"
```

**Expected Output:**
- Specification in `specs/payment-migration-spec.md`
- Current state vs. target state architecture
- Risk mitigation (rollback strategy)
- Compliance requirements (PCI-DSS)

---

## Integration with Other Commands

```bash
# 1. Start with specification
/specify "Build user dashboard with analytics"

# 2. After spec approval, create technical plan
/sdd-plan "Build user dashboard with analytics"

# 3. Break into tasks
/tasks "Build user dashboard with analytics"

# 4. Implement task by task
/implement "Build user dashboard with analytics"
```

---

## Spec Storage

Specifications are stored in:
```
<project-root>/
└── .qwen/
    └── specs/
        ├── [project-name]-spec.md
        ├── [feature-name]-spec.md
        └── ...
```

Each spec is version-controlled and serves as the source of truth.

---

## Next Phase: Plan

Once the specification is approved, proceed to:

```
/sdd-plan "[Project Name]"
```

This creates the technical implementation plan based on the specification.

---

**Version:** SDD 1.0 for Qwen Code
**Based on:** GitHub Spec Kit methodology
**Adapted for:** Qwen Code agent ecosystem
