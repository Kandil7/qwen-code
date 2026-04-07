# Spec-Driven Development: Plan Phase

**Command:** `/sdd-plan`
**Agents:** `orchestrator-tech-lead`, `architect`, `tech-lead-ai-engineer`

```
Usage: /sdd-plan "Build a production RAG chatbot for customer support"
```

**Prerequisite:** Specification must be approved (run `/specify` first)

---

## Phase 2: Plan

This phase defines **HOW** you will build what was specified.

The Plan phase translates business requirements (from the Spec) into technical implementation details.

---

## Output Artifacts

The technical plan includes:

1. **Architecture Overview**
   - System architecture diagram
   - Component breakdown
   - Data flow diagrams

2. **Technology Stack**
   - Languages, frameworks, libraries
   - Database choices
   - Infrastructure decisions
   - Justification for each choice

3. **API Design**
   - Endpoint definitions
   - Request/response schemas
   - Authentication mechanisms

4. **Data Models**
   - Entity definitions
   - Relationships
   - Database schema

5. **Integration Points**
   - External services
   - Internal systems
   - Third-party APIs

6. **Security Architecture**
   - Authentication flow
   - Authorization model
   - Data protection strategy

7. **Testing Strategy**
   - Unit testing approach
   - Integration testing approach
   - E2E testing approach
   - Test coverage targets

8. **Deployment Architecture**
   - Environment setup (dev, staging, prod)
   - CI/CD pipeline design
   - Rollback strategy

---

## Plan Template

```markdown
# Technical Plan: [Project Name]

**Linked Spec:** [.qwen/specs/[spec-name]-spec.md](../specs/[spec-name]-spec.md)

## 1. Architecture Overview

### System Diagram
```
[Architecture diagram - can be ASCII or mermaid]
```

### Component Breakdown
| Component | Responsibility | Technology |
|-----------|---------------|------------|
| [Name] | [What it does] | [Tech stack] |

### Data Flow
```
[Data flow diagram]
```

## 2. Technology Stack

### Backend
| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Language | [e.g., Python] | [3.11+] | [Why] |
| Framework | [e.g., FastAPI] | [0.100+] | [Why] |

### Frontend
| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| Framework | [e.g., React] | [18+] | [Why] |
| UI Library | [e.g., Material-UI] | [5+] | [Why] |

### Database
| Type | Technology | Version | Justification |
|------|------------|---------|---------------|
| Primary | [e.g., PostgreSQL] | [15] | [Why] |
| Cache | [e.g., Redis] | [7] | [Why] |

### Infrastructure
| Service | Technology | Version | Justification |
|---------|------------|---------|---------------|
| Hosting | [e.g., AWS] | [-] | [Why] |
| Container | [e.g., Docker] | [24] | [Why] |
| Orchestration | [e.g., K8s] | [1.28] | [Why] |

## 3. API Design

### Endpoints

#### [Endpoint Name]
```
POST /api/v1/[resource]
```

**Request:**
```json
{
  "field": "type"
}
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

**Errors:**
| Code | Message | Meaning |
|------|---------|---------|
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal error |

## 4. Data Models

### [Entity Name]
```
[Entity diagram or schema definition]
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | String | Yes | Entity name |

### Relationships
```
[ERD or relationship diagram]
```

## 5. Integration Points

### External Services
| Service | Purpose | Authentication | Rate Limits |
|---------|---------|----------------|-------------|
| [e.g., Stripe] | Payments | API Key | 1000/hr |

### Internal Systems
| System | Purpose | Integration Method |
|--------|---------|-------------------|
| [System] | [Purpose] | [REST/gRPC/Queue] |

## 6. Security Architecture

### Authentication Flow
```
[Authentication sequence diagram]
```

### Authorization Model
| Role | Permissions |
|------|-------------|
| Admin | Full access |
| User | Own resources |

### Data Protection
- Encryption at rest: [Algorithm]
- Encryption in transit: TLS 1.3
- PII handling: [Strategy]

## 7. Testing Strategy

### Unit Testing
- Framework: [e.g., Jest, pytest]
- Coverage target: ≥ 80%
- Critical paths: 100%

### Integration Testing
- Approach: [Contract testing, API testing]
- Tools: [e.g., Supertest, requests]

### E2E Testing
- Framework: [e.g., Playwright, Cypress]
- Critical flows: [List]

## 8. Deployment Architecture

### Environments
| Environment | Purpose | Update Frequency |
|-------------|---------|-----------------|
| Dev | Development | On every commit |
| Staging | Pre-prod testing | On PR merge |
| Production | Live traffic | On release |

### CI/CD Pipeline
```
[Pipeline flow diagram]
```

### Rollback Strategy
- Automated rollback on: [Conditions]
- Manual rollback procedure: [Steps]

## 9. Risks & Mitigations

| Technical Risk | Impact | Probability | Mitigation |
|----------------|--------|-------------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Strategy] |

## 10. Open Technical Decisions

| Decision | Options | Owner | Due Date |
|----------|---------|-------|----------|
| [Decision] | [Option A vs B] | [Name] | [Date] |

---

**Status:** DRAFT | IN_REVIEW | APPROVED
**Last Updated:** [Date]
**Technical Approvers:** [Names]
```

---

## Process Flow

```
┌─────────────────────────────────────────────────────────┐
│  PLAN PHASE                                             │
│                                                         │
│  1. Design system architecture                          │
│  2. Select technology stack                             │
│  3. Design APIs and data models                         │
│  4. Plan integrations                                   │
│  5. Design security architecture                        │
│  6. Define testing strategy                             │
│  7. Plan deployment architecture                        │
│                                                         │
│  ↓ VALIDATION GATE                                      │
│  ☐ Architecture supports all spec requirements          │
│  ☐ Technology choices are justified                     │
│  ☐ APIs are well-designed                               │
│  ☐ Security is baked in                                 │
│  ☐ Testing strategy is comprehensive                    │
│  ☐ Deployment plan is clear                             │
│                                                         │
│  ✅ APPROVED → Move to TASKS phase                      │
│  ❌ REJECTED → Revise technical plan                    │
└─────────────────────────────────────────────────────────┘
```

---

## When to Use `/sdd-plan`

### ✅ Use When:
- Specification is approved
- Ready to design technical solution
- Need architecture review before coding
- Multi-team coordination required

### ❌ Don't Use When:
- Specification is not yet approved
- Simple bug fix (no plan needed)
- Exploratory prototype

---

## Validation Checklist

Before moving to the Tasks phase, verify:

- [ ] Architecture supports all spec requirements
- [ ] Technology choices align with constraints
- [ ] API designs are RESTful/GraphQL best practices
- [ ] Data models are normalized and efficient
- [ ] Security architecture covers authN/Z
- [ ] Testing strategy covers all layers
- [ ] Deployment plan includes rollback
- [ ] All open decisions have owners

---

## Example Usage

### Example 1: New Project

```
/sdd-plan "Build a production RAG chatbot for customer support"
```

**Expected Output:**
- Technical plan in `plans/rag-chatbot-plan.md`
- Architecture: React + Node.js + FastAPI + PostgreSQL + Pinecone
- API design for chat, search, feedback
- Security: OAuth2, RBAC, data encryption

### Example 2: Feature Addition

```
/sdd-plan "Add OAuth2 authentication to existing API"
```

**Expected Output:**
- Plan in `plans/oauth2-auth-plan.md`
- Integration with existing user model
- Token management strategy
- Migration plan from legacy auth

---

## Integration with Other Commands

```bash
# 1. Specification (already done)
/specify "Build user dashboard with analytics"

# 2. Technical plan (current phase)
/sdd-plan "Build user dashboard with analytics"

# 3. Break into tasks (next phase)
/tasks "Build user dashboard with analytics"

# 4. Implement (final phase)
/implement "Build user dashboard with analytics"
```

---

## Plan Storage

Technical plans are stored in:
```
<project-root>/
└── .qwen/
    └── plans/
        ├── [project-name]-plan.md
        ├── [feature-name]-plan.md
        └── ...
```

Each plan links to its parent specification.

---

## Next Phase: Tasks

Once the technical plan is approved, proceed to:

```
/tasks "[Project Name]"
```

This breaks the plan into small, actionable tasks for implementation.

---

**Version:** SDD 1.0 for Qwen Code
**Based on:** GitHub Spec Kit methodology
**Adapted for:** Qwen Code agent ecosystem
