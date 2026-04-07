---
description: Start test-driven development workflow. Write tests first, achieve 80%+ coverage.
agents: ["orchestrator-tech-lead", "ecc-tdd-workflow"]
---

# TDD Command

**Activates:** `ecc-tdd-workflow` skill

## Usage
```
/tdd - Implement user registration with email validation
```

## What Happens

1. **RED** - Write failing test first
2. **GREEN** - Implement minimal code to pass  
3. **IMPROVE** - Refactor with confidence
4. **VERIFY** - Check coverage >= 80%

## Test Types Required

| Type | Coverage | When |
|------|----------|------|
| Unit | Always | All functions |
| Integration | Always | APIs, databases |
| E2E | Critical flows | User journeys |

## Example Session

```
User: /tdd - Add function to calculate compound interest

Agent: 🔴 RED PHASE

Writing failing test first:
```python
def test_compound_interest_basic():
    result = compound_interest(1000, 0.05, 10)
    assert abs(result - 1628.89) < 0.01

def test_compound_interest_zero_rate():
    result = compound_interest(1000, 0, 10)
    assert result == 1000
```

Running tests... ❌ FAIL (function doesn't exist)

🟢 GREEN PHASE

Implementing minimal code...

[Implementation provided]

Running tests... ✅ PASS

🔵 IMPROVE PHASE

Refactoring for clarity and performance...

✅ VERIFY PHASE

Coverage: 95% ✅
All tests passing ✅
```

## Related Commands
- `/plan` - Plan before implementing
- `/code-review` - Review after implementing
- `/security-scan` - Security check before commit
- `/test-coverage` - Verify coverage gaps
