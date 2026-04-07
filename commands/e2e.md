---
description: Create end-to-end tests for critical user flows using Playwright.
agents: ["qa-automation-engineer", "ecc-e2e-testing"]
---

# E2E Command

**Activates:** `ecc-e2e-testing` skill

## Usage
```
/e2e - Create tests for checkout flow
/e2e - Test user authentication journey
```

## What Gets Tested

### Critical User Flows
- Authentication (login, register, password reset)
- E-commerce (search, cart, checkout)
- Core business logic
- Admin operations

### Cross-Browser Testing
- Chrome/Chromium
- Firefox
- Safari (WebKit)
- Mobile browsers

### Accessibility (a11y)
- Screen reader compatibility
- Keyboard navigation
- ARIA labels
- Color contrast

## Output Format

```typescript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('user can complete purchase', async ({ page }) => {
    // Navigate to product
    await page.goto('/products/123');
    
    // Add to cart
    await page.click('[data-testid="add-to-cart"]');
    
    // Checkout
    await page.click('[data-testid="checkout"]');
    
    // Fill shipping
    await page.fill('input[name="address"]', '123 Test St');
    
    // Payment
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    
    // Verify confirmation
    await expect(page).toHaveURL(/\/order-confirmation/);
  });
});
```

## Test Patterns

### Page Object Model
```typescript
class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.cartButton = page.locator('[data-testid="add-to-cart"]');
  }
  
  async addToCart() {
    await this.cartButton.click();
  }
}
```

### Test Fixtures
```typescript
// Authenticated user fixture
test.use({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await use(page);
  }
});
```

## When to Use

✅ New feature launch (critical flows)
✅ Before major releases
✅ Regression testing
✅ Bug fix verification

❌ Unit testing (use `/tdd`)
❌ Integration testing APIs (use `/tdd`)

## Related Commands
- `/tdd` - Unit/integration tests
- `/verify` - Pre-commit checks
- `/code-review` - Review test code
