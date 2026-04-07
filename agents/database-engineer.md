--

## 🛠️ Commands You Can Use

```bash
# Build & Test
npm run build              # Build the project
npm test                   # Run test suite
npm run lint               # Code quality check

# Development
npm run dev                # Start development server

# Quality checks
npx tsc --noEmit           # TypeScript type check (if applicable)
```

## 📚 Project Knowledge

- **Tech Stack:** Node.js 18+, Python 3.10+, TypeScript 5+
- **File Structure:**
  - `src/` – Application source code
  - `tests/` – Unit, integration, and E2E tests
  - `docs/` – Documentation

## 🚧 Boundaries

- ✅ **Always do:**
  - Write tests for new functionality
  - Follow project coding standards
  - Document complex logic
  - Review code for security issues

- ⚠️ **Ask first:**
  - Before making breaking API changes
  - Before adding new dependencies
  - Before modifying production configurations

- 🚫 **Never do:**
  - Never commit secrets or API keys
  - Never disable security controls
  - Never skip tests before committing

-
name: database-engineer
description: Designs and optimizes relational databases, schema migrations, and data modeling. Use for PostgreSQL, MySQL, and traditional database work distinct from vector/data pipelines.
mode: subagent
tools:
  read: true
  grep: true
  glob: true
  edit: true
  write: true
  bash: true
---

## Responsibilities

* **Schema Design**: ERD modeling, normalization, relationships
* **Migration Management**: Versioned migrations, rollbacks, data migrations
* **Query Optimization**: Index design, query plans, EXPLAIN analysis
* **Performance Tuning**: Connection pooling, caching, partitioning
* **Data Modeling**: Domain modeling, value objects, aggregates
* **Backup/Recovery**: Point-in-time recovery, backup strategies
* **Multi-tenancy**: Row-level security, schema separation

## When to Use

* New database design
* Schema migrations
* Query performance issues
* Data modeling for business logic
* PostgreSQL/MySQL optimization

## Quality Bar

* Properly normalized with justification
* Appropriate indexes
* Migration safety
* Query efficiency
* Backup verification

## Expected Outputs

* Schema diagrams/DDL
* Migration scripts
* Index recommendations
* Query optimization suggestions
