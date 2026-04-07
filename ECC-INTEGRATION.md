# Everything Claude Code (ECC) Integration for Qwen Code

This document describes how to use ECC-style workflows, agents, and commands within Qwen Code.

## Overview

ECC provides 28 specialized agents, 119+ skills, and 60+ commands for AI-assisted development. This integration adapts ECC patterns for Qwen Code's agent system.

### Quick Start

**New to ECC?** Start with [`QUICKSTART.md`](./QUICKSTART.md) for a 5-minute introduction.

**Want to improve?** See [`IMPROVEMENT-PLAN.md`](./IMPROVEMENT-PLAN.md) for what to add next.

---

## Available Agents (Qwen Code Native)

Qwen Code already has ECC-style agents in `.qwen\agents\`. Key agents include:

| Agent | ECC Equivalent | Use For |
|-------|---------------|---------|
| `tech-lead-orchestrator` | planner + architect | Complex multi-component projects |
| `devops-platform-engineer` | devops-agent | CI/CD, Docker, Kubernetes |
| `fullstack-ai-engineer` | fullstack-dev | End-to-end AI features |
| `product-engineer-ai` | product-planner | UX patterns, PRDs, metrics |
| `data-engineer-knowledge-ingestion` | data-pipeline | ETL, knowledge pipelines |
| `code-reviewer` | code-reviewer | Code quality reviews |
| `security-compliance-engineer` | security-reviewer | Security audits |
| `sre-reliability-engineer` | reliability-agent | SLOs, monitoring, on-call |
| `mlops-engineer` | ml-pipeline | ML model deployment |
| `performance-optimizer` | perf-optimizer | Performance tuning |

---

## ECC-Style Commands (Text Shortcuts)

Qwen Code doesn't have native slash commands like Claude Code, but you can use these **text shortcuts** at the start of your prompt:

### Core Commands

| Type This | What It Does |
|-----------|--------------|
| `/plan "feature"` | Launch tech-lead-orchestrator to plan the feature |
| `/tdd` | Start test-driven development workflow |
| `/code-review` | Review recent code changes |
| `/security-scan` | Security audit of codebase |
| `/build-fix` | Debug and fix build errors |
| `/e2e` | Design end-to-end test strategy |
| `/docs` | Research and document APIs |
| `/refactor` | Clean up dead code, improve structure |
| `/architect` | System design review |
| `/deploy` | DevOps deployment planning |

### Language-Specific Commands

| Command | Language |
|---------|----------|
| `/ts-review` | TypeScript |
| `/py-review` | Python |
| `/go-review` | Go |
| `/rust-review` | Rust |
| `/java-review` | Java/Spring |
| `/cpp-review` | C++ |

### Workflow Commands

| Command | Purpose |
|---------|---------|
| `/loop-start` | Start autonomous loop execution |
| `/quality-gate` | Run quality checks before merge |
| `/test-coverage` | Analyze test coverage gaps |
| `/perf-check` | Performance audit |
| `/api-design` | API contract review |

---

## How to Use Commands

**Example 1: Plan a Feature**
```
/plan "Add user authentication with OAuth2"
```
→ Qwen Code will use the tech-lead-orchestrator agent to create a detailed implementation plan.

**Example 2: TDD Workflow**
```
/tdd - Implement a user registration API with email validation
```
→ Qwen Code will write tests first, then implementation, following TDD principles.

**Example 3: Code Review**
```
/code-review - Review the changes in src/auth/
```
→ Qwen Code will analyze code quality, security, and maintainability.

**Example 4: Security Scan**
```
/security-scan - Audit the entire codebase for vulnerabilities
```
→ Qwen Code will check for OWASP Top 10, secrets leakage, injection risks.

---

## ECC Rules Adapted for Qwen Code

ECC's rules from `.claude\rules\` are adapted as Qwen Code agent instructions:

### Core Principles (Always Applied)

1. **Agent-First** — Delegate to specialized agents for domain tasks
2. **Test-Driven** — Write tests before implementation (80%+ coverage)
3. **Security-First** — Validate all inputs, never hardcode secrets
4. **Immutability** — Create new objects, never mutate existing ones
5. **Plan Before Execute** — Plan complex features before coding

### Security Checklist (Before Any Commit)

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on endpoints
- [ ] Error messages don't leak sensitive data

### Code Quality Standards

- Functions < 50 lines, files < 800 lines
- No deep nesting (>4 levels)
- Proper error handling
- Clear, readable identifiers
- High cohesion, low coupling

---

## Workflow Skills

### TDD Workflow (Mandatory for Features)

```
1. RED: Write failing test first
2. GREEN: Write minimal implementation to pass
3. IMPROVE: Refactor with confidence
4. VERIFY: Check coverage >= 80%
```

### Code Review Workflow

```
1. Analyze code structure and logic
2. Check security vulnerabilities
3. Review test coverage
4. Assess performance implications
5. Verify documentation
6. Provide actionable feedback
```

### Build Troubleshooting

```
1. Capture full error output
2. Identify root cause (dependency, config, code)
3. Apply targeted fix
4. Verify build passes
5. Add regression test if applicable
```

---

## Project-Level Instructions

For project-specific agent behavior, create an `AGENTS.md` file in your project root:

```markdown
# Project Agent Instructions

## Architecture
- Backend: Node.js/Express
- Frontend: React/TypeScript
- Database: PostgreSQL

## Agent Preferences
- Use tech-lead-orchestrator for all feature planning
- Always run security-reviewer before merge
- TDD is mandatory for new features

## Custom Commands
- `/api-gen` - Generate OpenAPI specs
- `/db-migrate` - Run database migrations
```

Qwen Code will read this file and adapt agent behavior accordingly.

---

## Memory & Context Management

### What to Save to Memory

- **Personal context**: Your debugging notes, preferences, temporary state
- **Project knowledge**: Architecture decisions, API changes, runbooks

### Context Budget

- Keep prompts under 80% of context window for complex tasks
- Use strategic compaction for long conversations
- Offload reference material to project docs

---

## Multi-Agent Orchestration

For complex tasks, Qwen Code can coordinate multiple agents:

```
User: "Build a user authentication system"

Orchestration:
1. tech-lead-orchestrator → Creates plan, identifies components
2. fullstack-ai-engineer → Implements backend API
3. frontend-engineer → Builds login UI
4. security-compliance-engineer → Audits for vulnerabilities
5. qa-automation-engineer → Writes integration tests
6. tech-lead-orchestrator → Final review and approval
```

---

## Success Metrics

Track these metrics for ECC-style development:

| Metric | Target |
|--------|--------|
| Test Coverage | ≥ 80% |
| Security Issues (Critical) | 0 |
| Build Success Rate | ≥ 95% |
| Code Review Pass Rate | ≥ 90% |
| Deployment Success Rate | ≥ 99% |

---

## Quick Reference Card

```
/plan          → Plan features
/tdd           → Test-driven development
/code-review   → Review code
/security-scan → Security audit
/build-fix     → Fix build errors
/e2e           → E2E test strategy
/docs          → Research documentation
/refactor      → Code cleanup
/architect     → System design
/deploy        → Deployment planning

Agents:
tech-lead-orchestrator  → Complex project coordination
devops-platform-engineer → CI/CD, Docker, K8s
fullstack-ai-engineer   → End-to-end AI features
security-compliance-engineer → Security audits
product-engineer-ai     → UX, PRDs, metrics
```

---

## Migration from Claude Code

If you're migrating from Claude Code:

1. **Agents**: Qwen Code has equivalent agents in `.qwen\agents\`
2. **Rules**: ECC rules are adapted as agent instructions (this file)
3. **Commands**: Use text shortcuts (`/plan`, `/tdd`, etc.) at prompt start
4. **Skills**: Workflows are embedded in agent instructions
5. **Hooks**: Qwen Code uses project-level `AGENTS.md` for customization

---

**Version:** ECC 1.9.0 adapted for Qwen Code
**Last Updated:** 2026-03-23
