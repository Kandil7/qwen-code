# TypeScript Coding Rules

ECC-adapted TypeScript-specific coding standards for Qwen Code.

## Core Principles

1. **Type Safety First** - Use TypeScript types, avoid `any`
2. **Strict Mode** - Enable all strict compiler options
3. **Interface over Type** - Prefer interfaces for object shapes
4. **Immutability** - Use `readonly` and `const` by default
5. **Explicit Returns** - Always specify return types

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## Type Definitions

### Interfaces vs Types

```typescript
// ✅ Prefer interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Use types for unions and primitives
type UserRole = 'user' | 'admin' | 'guest';
type UserId = string;

// ✅ Combine both when needed
interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

type CreateUserDTO = Omit<User, 'id'>;
type UpdateUserDTO = Partial<CreateUserDTO>;
```

### Avoid `any`

```typescript
// ❌ Bad: Loses type safety
function process(data: any) {
  return data.value;
}

// ✅ Good: Use unknown with type guard
function process(data: unknown) {
  if (isObject(data) && 'value' in data) {
    return data.value;
  }
  throw new Error('Invalid data');
}

// ✅ Better: Use proper type
interface Data {
  value: string;
}
function process(data: Data) {
  return data.value;
}
```

### Type Guards

```typescript
// Type predicate
function isUser(data: unknown): data is User {
  return (
    isObject(data) &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.email === 'string'
  );
}

// Usage
if (isUser(user)) {
  // user is typed as User here
  console.log(user.name);
}
```

---

## Functions

### Return Types

```typescript
// ✅ Always specify return type
function getUser(id: string): User {
  // ...
}

async function fetchUser(id: string): Promise<User> {
  // ...
}

// ✅ Use void for procedures
function logMessage(message: string): void {
  console.log(message);
}
```

### Function Overloads

```typescript
// Overload signatures
function createUser(name: string): User;
function createUser(name: string, email: string): User;
function createUser(name: string, age: number): AdminUser;

// Implementation
function createUser(name: string, emailOrAge?: string | number): User | AdminUser {
  if (typeof emailOrAge === 'string') {
    return { id: generateId(), name, email: emailOrAge };
  }
  if (typeof emailOrAge === 'number') {
    return { id: generateId(), name, age: emailOrAge, permissions: [] };
  }
  return { id: generateId(), name };
}
```

### Optional Parameters

```typescript
// ✅ Use optional parameters
function greet(name: string, greeting?: string): string {
  return `${greeting ?? 'Hello'}, ${name}!`;
}

// ✅ Use default values
function greet(name: string, greeting: string = 'Hello'): string {
  return `${greeting}, ${name}!`;
}

// ❌ Avoid: Undefined as default
function greet(name: string, greeting: string | undefined = undefined): string {
  // Harder to reason about
}
```

---

## Classes

```typescript
// ✅ Good class structure
class UserService {
  constructor(private readonly repository: UserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async create(data: CreateUserDTO): Promise<User> {
    this.validateCreate(data);
    return this.repository.create(data);
  }

  private validateCreate(data: CreateUserDTO): void {
    if (!data.email.includes('@')) {
      throw new ValidationError('Invalid email');
    }
  }
}
```

---

## Error Handling

### Custom Errors

```typescript
class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public readonly details: string[] = []) {
    super('VALIDATION_ERROR', 400, message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', 401, message);
  }
}
```

### Try-Catch with Type Narrowing

```typescript
try {
  const user = await userService.findById(id);
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle not found
  } else if (error instanceof ValidationError) {
    // Handle validation
  } else {
    // Handle unknown error
    logger.error('Unexpected error', error);
    throw new AppError('INTERNAL_ERROR', 500, 'An error occurred');
  }
}
```

---

## Generics

### Generic Functions

```typescript
// ✅ Reusable generic function
function first<T>(array: T[]): T | undefined {
  return array[0];
}

// ✅ Constrained generics
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Usage
const name = getProperty(user, 'name'); // Typed as string
```

### Generic Classes

```typescript
class Repository<T extends { id: string }> {
  private items = new Map<string, T>();

  async findById(id: string): Promise<T | undefined> {
    return this.items.get(id);
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const newItem = { ...item, id: generateId() } as T;
    this.items.set(newItem.id, newItem);
    return newItem;
  }
}
```

---

## Async/Await

### Promise Handling

```typescript
// ✅ Use async/await
async function getUserData(id: string): Promise<UserData> {
  const user = await userRepository.findById(id);
  const posts = await postRepository.findByUserId(id);
  return { user, posts };
}

// ✅ Parallel execution when possible
async function getUserData(id: string): Promise<UserData> {
  const [user, posts] = await Promise.all([
    userRepository.findById(id),
    postRepository.findByUserId(id)
  ]);
  return { user, posts };
}

// ✅ Handle errors
async function safeFetch<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}
```

---

## Best Practices

### Naming Conventions

```typescript
// Interfaces: PascalCase
interface User { }

// Types: PascalCase
type UserRole = 'user' | 'admin';

// Variables: camelCase
const userName = 'John';

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Classes: PascalCase
class UserService { }

// Private members: prefix with #
class User {
  #password: string;
}
```

### File Organization

```typescript
// One interface/type per file for shared types
// src/types/user.ts
export interface User {
  id: string;
  name: string;
}

// src/types/index.ts
export * from './user';
export * from './post';
export * from './common';
```

### Imports

```typescript
// ✅ Named imports for tree-shaking
import { UserService } from './services/UserService';
import { ValidationError } from './errors';

// ✅ Default imports for modules
import express from 'express';
import React from 'react';

// ❌ Avoid namespace imports
import * as utils from './utils'; // Harder to trace
```

---

## ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/strict-boolean-expressions": "warn"
  }
}
```

---

## Testing

### Type Testing

```typescript
import { expectType, TypeEqual } from 'tsd';

// Test type equality
expectType<TypeEqual<typeof result, User>>(true);

// Test function signature
function test(fn: (x: string) => number) {
  expectType<(x: string) => number>(fn);
}
```

### Mocking

```typescript
// Mock with proper types
const mockRepository: jest.Mocked<UserRepository> = {
  findById: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
  create: jest.fn().mockResolvedValue({ id: '1', name: 'Test' })
};
```

---

## Related Rules

- `rules/common/coding-style.md` - General coding standards
- `rules/common/security.md` - Security guidelines
- `rules/common/testing.md` - Testing requirements
