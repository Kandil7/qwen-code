---
name: ecc-e2e-testing
description: End-to-end testing with Playwright. Test critical user flows, browser automation, and cross-browser compatibility.
color: Cyan
---

# E2E Testing with Playwright

This skill provides comprehensive end-to-end testing patterns using Playwright.

## When to Use

- Testing critical user journeys
- Regression testing before releases
- Cross-browser compatibility testing
- Accessibility (a11y) compliance
- Performance testing user flows

## Test Structure

### Basic Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('user can login successfully', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message'))
      .toContainText('Invalid credentials');
  });
});
```

### Page Object Model

```typescript
// tests/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Test Fixtures

```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
    
    // Teardown: Logout after test
    await page.click('button:has-text("Logout")');
  },
});

export { expect } from '@playwright/test';
```

## Test File Organization

```
tests/
├── e2e/
│   ├── auth.spec.ts           # Authentication flows
│   ├── checkout.spec.ts       # Purchase flows
│   ├── search.spec.ts         # Search functionality
│   └── admin.spec.ts          # Admin operations
├── pages/
│   ├── LoginPage.ts           # Page object
│   ├── DashboardPage.ts       # Page object
│   └── CheckoutPage.ts        # Page object
├── fixtures/
│   ├── auth.ts                # Auth fixture
│   └── database.ts            # DB fixture
└── utils/
    ├── test-data.ts           # Test data generators
    └── helpers.ts             # Test helpers
```

## Critical User Flows to Test

### 1. Authentication Flow

```typescript
test.describe('Authentication', () => {
  test('complete registration flow', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    // Verify email confirmation sent
    await expect(page.locator('.success-message'))
      .toContainText('Check your email');
  });

  test('password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

### 2. E-Commerce Flow

```typescript
test.describe('Checkout Flow', () => {
  test('complete purchase', async ({ page }) => {
    // Search for product
    await page.goto('/');
    await page.fill('input[placeholder="Search"]', 'laptop');
    await page.click('button[type="submit"]');
    
    // Add to cart
    await page.click('[data-testid="product-card"]:first-child button');
    await expect(page.locator('[data-testid="cart-count"]'))
      .toContainText('1');
    
    // Checkout
    await page.click('[data-testid="checkout-button"]');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="zip"]', '12345');
    
    // Payment
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="expiry"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    await page.click('button:has-text("Pay")');
    
    // Verify order confirmation
    await expect(page).toHaveURL(/\/order-confirmation/);
    await expect(page.locator('[data-testid="order-number"]'))
      .toBeVisible();
  });
});
```

### 3. Search and Filter

```typescript
test.describe('Search and Filter', () => {
  test('search returns relevant results', async ({ page }) => {
    await page.goto('/products');
    await page.fill('input[placeholder="Search"]', 'wireless headphones');
    await page.waitForTimeout(500); // Debounce
    
    const results = page.locator('[data-testid="product-card"]');
    await expect(results).toHaveCount(5);
    
    // Verify all results contain search term
    for (const card of await results.all()) {
      const text = await card.textContent();
      expect(text.toLowerCase()).toContain('wireless');
    }
  });

  test('filter by price range', async ({ page }) => {
    await page.goto('/products');
    await page.fill('input[name="minPrice"]', '50');
    await page.fill('input[name="maxPrice"]', '200');
    await page.click('button:has-text("Apply")');
    
    const prices = page.locator('[data-testid="price"]');
    for (const price of await prices.all()) {
      const value = parseFloat(await price.textContent().replace('$', ''));
      expect(value).toBeGreaterThanOrEqual(50);
      expect(value).toBeLessThanOrEqual(200);
    }
  });
});
```

## Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('login form should be accessible', async ({ page }) => {
  await page.goto('/login');
  
  // Check labels
  await expect(page.locator('label[for="email"]')).toBeVisible();
  await expect(page.locator('label[for="password"]')).toBeVisible();
  
  // Check keyboard navigation
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="email"]')).toBeFocused();
  
  await page.keyboard.press('Tab');
  await expect(page.locator('input[name="password"]')).toBeFocused();
  
  // Check error messages are announced
  await page.click('button[type="submit"]');
  await expect(page.locator('[role="alert"]')).toBeVisible();
});
```

## Visual Regression Testing

```typescript
test('homepage should match snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});

test('product page should match snapshot', async ({ page }) => {
  await page.goto('/products/123');
  await expect(page.locator('.product-details'))
    .toHaveScreenshot('product-details.png');
});
```

## API Testing

```typescript
import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  test('GET /api/users returns users', async ({ request }) => {
    const response = await request.get('/api/users');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users.data)).toBeTruthy();
  });

  test('POST /api/users creates user', async ({ request }) => {
    const response = await request.post('/api/users', {
      data: {
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    
    expect(response.status()).toBe(201);
    
    const user = await response.json();
    expect(user.data.name).toBe('Test User');
  });
});
```

## Performance Testing

```typescript
test('homepage should load within 2 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2000);
});

test('should not have memory leaks', async ({ page }) => {
  await page.goto('/');
  
  // Navigate multiple times
  for (let i = 0; i < 5; i++) {
    await page.click('a:has-text("Products")');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Home")');
    await page.waitForLoadState('networkidle');
  }
  
  // Check for detached elements
  const detachedElements = await page.evaluate(() => {
    return document.querySelectorAll('*').length;
  });
  
  expect(detachedElements).toBeLessThan(1000);
});
```

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
});
```

## Best Practices

1. **Use semantic selectors** - `data-testid` over CSS classes
2. **Wait for network idle** - `waitForLoadState('networkidle')`
3. **Test real user flows** - Not implementation details
4. **Keep tests independent** - No shared state between tests
5. **Use Page Objects** - DRY and maintainable
6. **Add proper assertions** - Verify what matters
7. **Run in parallel** - Faster CI/CD
8. **Screenshot on failure** - Debug easier

## Success Metrics

- All critical user flows covered
- Cross-browser tests passing
- Accessibility violations = 0
- Test execution < 10 minutes
- Flaky tests = 0
