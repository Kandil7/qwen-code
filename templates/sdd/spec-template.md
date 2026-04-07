---
description: Spec-driven development template. Define WHAT to build, WHY, and success criteria before any implementation.
agents: ["orchestrator-tech-lead", "product-engineer"]
---

# Spec Template

## Overview
<!-- One-paragraph description of what we're building and why -->

## Goals
<!-- What success looks like, measurable outcomes -->
- [ ] Goal 1
- [ ] Goal 2

## Non-Goals
<!-- Explicitly out of scope items to prevent scope creep -->
- Non-goal 1
- Non-goal 2

## User Stories / Use Cases
<!-- Who uses this and how -->
1. As a [user], I want to [action] so that [outcome]
2. As a [user], I want to [action] so that [outcome]

## Data Model
<!-- Key entities, relationships, schemas -->
```
Entity1:
  - field1: type (description)
  - field2: type (description)

Entity2:
  - field1: type (description)
  - relationship: Entity1 (description)
```

## API / Interface Design
<!-- Key endpoints, function signatures, or contracts -->
```
GET /resource      → List resources
POST /resource     → Create resource
GET /resource/{id} → Get resource by ID
```

## Architecture
<!-- High-level system design, component diagram -->
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│    API      │────▶│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Constraints
<!-- Technical, business, or regulatory limitations -->
- Constraint 1
- Constraint 2

## Testing Strategy
<!-- What to test, coverage targets, edge cases -->
- Unit tests for: 
- Integration tests for:
- Edge cases:
- Coverage target: ≥ 80%

## Success Criteria
<!-- Measurable acceptance criteria -->
- [ ] Criterion 1 (measurable)
- [ ] Criterion 2 (measurable)
- [ ] All tests pass with ≥ 80% coverage
- [ ] Security scan shows 0 critical issues

## Open Questions
<!-- Unresolved items requiring clarification -->
- [ ] Question 1
- [ ] Question 2

## Related Work
<!-- Links to related projects, prior art, research -->
- 

---

**Next Step**: Feed this spec to `/sdd-plan` to generate the technical implementation plan.
