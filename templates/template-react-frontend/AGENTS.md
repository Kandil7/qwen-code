# Project Agent Instructions

This file provides project-specific instructions for AI agents working in this **React/Next.js Frontend** codebase.

## Quick Start

**To start working on a task, use these commands:**

```
/plan "Your feature description"     # Plan complex features
/tdd "Your task description"         # Test-driven development
/code-review                         # Review code changes
/e2e "User flow to test"             # Create E2E tests
/verify                              # Pre-commit checks
```

## Project Overview

```
Framework: Next.js 14 (App Router)
Language: TypeScript 5.x
Styling: Tailwind CSS
State: React Context + Zustand
Testing: Jest + React Testing Library + Playwright
```

## Agent Selection Guide

| Task Type | Use This Agent |
|-----------|---------------|
| New page/component | `frontend-engineer` + `/tdd` |
| Complex UI feature | `tech-lead-orchestrator` |
| Accessibility audit | `e2e-runner` (a11y tests) |
| Code quality review | `code-reviewer` |
| Performance optimization | `performance-optimizer` |
| Component refactoring | `refactor-cleaner` |

## Core Principles

1. **Component Composition** - Small, reusable components
2. **Type Safety** - Strict TypeScript, no `any`
3. **Accessibility** - WCAG 2.1 AA compliance
4. **Performance** - Core Web Vitals optimized
5. **Testing** - Component tests + E2E flows

## React Patterns

### Component Structure

```typescript
// ✅ Good: Typed props, clear structure
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps) {
  return (
    <div className={cn('p-4 border rounded', className)}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {onEdit && (
        <button onClick={() => onEdit(user)}>
          Edit
        </button>
      )}
    </div>
  );
}
```

### Hooks

```typescript
// ✅ Good: Custom hook with proper types
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [storedValue, setValue];
}
```

## Testing Requirements

**Coverage Target:** ≥ 80%

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com'
  };

  it('renders user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when button clicked', () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Edit'));
    
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('user can login and view dashboard', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[name="email"]', 'user@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('h1'))
    .toContainText('Welcome');
});
```

## Accessibility Checklist

- [ ] Semantic HTML (h1-h6, nav, main, footer)
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Error messages announced to screen readers

## Styling Standards

### Tailwind CSS

```typescript
// ✅ Good: Use cn utility for conditional classes
import { cn } from '@/lib/utils';

function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
      {...props}
    />
  );
}
```

## File Organization

```
src/
├── app/             # Next.js App Router pages
├── components/
│   ├── ui/          # Base UI components
│   ├── forms/       # Form components
│   └── layout/      # Layout components
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── stores/          # Zustand stores
├── types/           # TypeScript types
└── styles/          # Global styles
```

## Performance Guidelines

### Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

### Optimization Techniques

```typescript
// ✅ Lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false
});

// ✅ Image optimization
import Image from 'next/image';
<Image src="/hero.jpg" alt="Hero" fill priority />

// ✅ Memoization
const MemoizedList = React.memo(function List({ items }) {
  return items.map(item => <ListItem key={item.id} {...item} />);
});
```

## When to Use Agents Proactively

| Situation | Agent to Use |
|-----------|-------------|
| New page/component | `frontend-engineer` + `/tdd` |
| Complex UI feature | `tech-lead-orchestrator` |
| Accessibility issues | `e2e-runner` (a11y tests) |
| Performance issues | `performance-optimizer` |
| Component cleanup | `refactor-cleaner` |

## Success Metrics

| Metric | Target |
|--------|--------|
| Test Coverage | ≥ 80% |
| Lighthouse Score | ≥ 90 |
| Accessibility Score | ≥ 95 |
| Bundle Size | < 200KB initial |

---

**Note:** This project uses ECC (Everything Claude Code) patterns.
See `.qwen/ECC-INTEGRATION.md` for full command reference.
