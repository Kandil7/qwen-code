---
description: Research and document APIs, libraries, and best practices.
agents: ["documentation-writer", "knowledge-base-engineer"]
---

# Docs Command

**Activates:** Documentation research and creation workflow

## Usage
```
/docs - Research Stripe payment API
/docs - Document the auth module
/docs - Find best practices for Redis caching
```

## What Gets Created

### API Documentation
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Error codes and handling
- Usage examples

### Code Documentation
- JSDoc/TSDoc comments
- Function descriptions
- Parameter explanations
- Return value documentation
- Usage examples

### Best Practices
- Implementation patterns
- Common pitfalls
- Performance tips
- Security considerations

## Output Format

```markdown
## API Documentation: Stripe Payments

### Create Payment Intent

**Endpoint:** `POST /v1/payment_intents`

**Authentication:** Bearer token (secret key)

**Request:**
```json
{
  "amount": 2000,
  "currency": "usd",
  "payment_method_types": ["card"],
  "metadata": {
    "order_id": "12345"
  }
}
```

**Response:**
```json
{
  "id": "pi_1234567890",
  "status": "requires_payment_method",
  "client_secret": "pi_1234567890_secret_abcdef",
  ...
}
```

**Error Codes:**
| Code | Meaning | Fix |
|------|---------|-----|
| card_declined | Card was declined | Ask for different card |
| insufficient_funds | Not enough balance | Contact customer |
| expired_card | Card expired | Update card details |

**Example:**
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  payment_method_types: ['card'],
});
```
```

### JSDoc Example

```typescript
/**
 * Creates a new user account with email verification.
 * 
 * @param email - User's email address (must be valid format)
 * @param password - User's password (min 8 chars, 1 uppercase, 1 number)
 * @param name - User's display name
 * @returns Promise resolving to created user object
 * @throws {ValidationError} If email format is invalid
 * @throws {DuplicateError} If email already exists
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123!',
 *   name: 'John Doe'
 * });
 * ```
 */
async function createUser({ email, password, name }) {
  // Implementation
}
```

## Documentation Standards

### Functions
- What it does (one line)
- Parameters with types
- Return value
- Exceptions thrown
- Usage example

### Classes
- Purpose
- Constructor parameters
- Public methods
- Properties
- Usage example

### APIs
- Endpoint URL
- HTTP method
- Authentication
- Request schema
- Response schema
- Error codes
- Example request/response

## When to Use

✅ Starting with new library/API
✅ After implementing features
✅ Before team handoff
✅ Open source projects

❌ During initial prototyping
❌ Personal scripts

## Related Commands
- `/plan` - Plan documentation structure
- `/code-review` - Review documentation
- `/security-scan` - Document security considerations
