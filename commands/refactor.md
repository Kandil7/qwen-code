---
description: Clean up code, remove dead code, improve naming, and reduce duplication.
agents: ["code-reviewer", "software-engineer"]
---

# Refactor Command

**Activates:** Code cleanup and improvement workflow

## Usage
```
/refactor - Clean up auth module
/refactor - Remove dead code from src/
/refactor - Improve naming in utils.ts
```

## What Gets Improved

### Code Cleanup
- [ ] Remove unused variables/functions
- [ ] Remove console.log statements
- [ ] Remove commented-out code
- [ ] Remove TODO/FIXME without tickets

### Naming Improvements
- [ ] Clear function names (verb + noun)
- [ ] Descriptive variable names
- [ ] Consistent naming conventions
- [ ] Boolean names (isLoading, hasError)

### Structure Improvements
- [ ] Extract large functions (< 50 lines)
- [ ] Split large files (< 800 lines)
- [ ] Reduce nesting (< 4 levels)
- [ ] Remove duplication (DRY)

### SOLID Principles
- [ ] Single Responsibility
- [ ] Open/Closed
- [ ] Liskov Substitution
- [ ] Interface Segregation
- [ ] Dependency Inversion

## Output Format

```markdown
## Refactoring Plan

### Files to Modify
| File | Issue | Action |
|------|-------|--------|
| auth.ts | Function too long (120 lines) | Extract helpers |
| utils.ts | Dead code | Remove unused |

### Changes

#### 1. Extract Function (auth.ts)
**Before:**
```typescript
function authenticateUser(...) {
  // 120 lines of code
}
```

**After:**
```typescript
function authenticateUser(...) {
  validateCredentials(credentials);
  const token = generateToken(user);
  await updateLastLogin(user);
  return token;
}
```

#### 2. Remove Dead Code (utils.ts)
- Remove `unusedHelper()` - not called
- Remove `legacyFormat()` - replaced
- Remove `OLD_CONSTANT` - unused

### Verification
- [ ] All tests pass
- [ ] No behavior changes
- [ ] Code coverage maintained
```

## Refactoring Patterns

### Extract Method
```typescript
// Before
function processOrder(order) {
  // Validate order items
  if (!order.items || order.items.length === 0) {
    throw new Error('Empty order');
  }
  // Calculate total
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.quantity;
  }
  // Apply discount
  if (order.coupon) {
    total *= 0.9;
  }
  // ... 50 more lines
}

// After
function processOrder(order) {
  validateOrderItems(order.items);
  const subtotal = calculateSubtotal(order.items);
  const total = applyDiscount(subtotal, order.coupon);
  // ... rest is clearer
}
```

### Replace Magic Numbers
```typescript
// Before
if (users.length > 100) { ... }
setTimeout(callback, 30000);

// After
const MAX_USERS = 100;
const TIMEOUT_MS = 30000;

if (users.length > MAX_USERS) { ... }
setTimeout(callback, TIMEOUT_MS);
```

### Simplify Conditionals
```typescript
// Before
if (user.isActive) {
  if (user.hasPermission) {
    if (user.isVerified) {
      return true;
    }
  }
}
return false;

// After
return user.isActive && user.hasPermission && user.isVerified;
```

## When to Use

✅ After completing a feature
✅ Technical debt sprints
✅ Before major refactors
✅ Code health improvements

❌ During active development (finish first)
❌ When tests are failing (fix first)

## Related Commands
- `/code-review` - Review refactored code
- `/verify` - Ensure tests still pass
- `/plan` - Plan large refactors
