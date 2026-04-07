---
name: harness-engineering
description: Production AI system framework based on 2026 Harness Engineering best practices. Implements Pull Risk Forward, Safeguard Generated Code, Refactor to Expand AI-Ready Surface, and Level 3 Production Framework patterns.
origin: Research-Based (Anthropic 2026 Agentic Coding Trends, CodeScene, NXCode)
version: "1.0.0"
---

# Harness Engineering Framework

## Overview

Harness engineering is the 2026 evolution beyond vibe coding — where engineers orchestrate AI agents that plan, write, test, and ship code under human direction. The core thesis: **models are commodities; the harness is the competitive moat**.

**Three Pillars:**
1. **Context Engineering** — Repository-local, machine-readable docs, API contracts, observability
2. **Architectural Constraints** — Mechanically enforce good code via dependency layering, linters, CI
3. **Entropy Management** — Scheduled cleanup agents that fix doc drift, violations, dead dependencies

---

## Pillar 1: Pull Risk Forward

**Principle:** Assess code health BEFORE assigning AI tasks. Low-quality code increases AI failure rates and token burn.

### Code Health Thresholds

| Score | Status | AI Action |
|-------|--------|-----------|
| ≥ 9.5 | Excellent | Full AI autonomy |
| 8.0-9.5 | Good | AI with caution, extra review |
| 6.0-8.0 | Fair | Refactor first, then AI |
| < 6.0 | Poor | DO NOT use AI — refactor manually first |

### Pre-Task Checklist

Before any AI work on a file/module:
- [ ] Code health score ≥ 8.0 (run: `python .qwen/scripts/code-health-check.js`)
- [ ] Tests exist and pass (run: `npm test` / `pytest`)
- [ ] No active TODO/FIXM/HACK comments in target area
- [ ] Function length < 50 lines, file length < 800 lines
- [ ] Nesting depth ≤ 4 levels

### Run Health Check

```bash
# Quick scan
node .qwen/scripts/validate-setup.js

# Full entropy scan
python .qwen/skills/entropy-manager.py scan --dir .

# Code health pre-check
node .qwen/scripts/code-health-check.js
```

---

## Pillar 2: Safeguard Generated Code

**Principle:** AI code quality reflects historical training data. Implement automated 3-tier checks.

### Three-Tier MCP Safeguards

| Tier | Trigger | Check | Tool |
|------|---------|-------|------|
| **1. Snippet** | Per code generation | `code_health_review` | AI reviewer agent |
| **2. Pre-Commit** | Before commit | `pre_commit_code_health_safeguard` | Hooks (auto-lint.js, security-check.js) |
| **3. PR Pre-Flight** | Before merge | `analyze_change_set` | Code reviewer + security scan |

### Automated Quality Gates

```
Code Generated → Auto-lint → Tests → Security Scan → Code Review → Merge
      ↓              ↓          ↓         ↓             ↓
  [Fail?]      [Auto-fix]  [Fix loop]  [Block]    [Human review]
```

### Anti-Pattern: Test Deletion/Weakening

AI agents may delete failing tests or use excessive mocking to bypass checks. Prevent this with:
- Coverage as regression signal (not vanity metric)
- Enforce high-coverage PR gates
- Track coverage delta (not absolute) per PR

---

## Pillar 3: Refactor to Expand AI-Ready Surface

**Principle:** Large/complex legacy functions cause fragile AI changes. Systematically reduce complexity.

### Workflow: Review → Plan → Refactor → Re-Measure

```
1. Review: Run entropy scan on target module
2. Plan: Identify functions > 50 lines, nesting > 4, dead code
3. Refactor: Break monolithic functions into smaller units
4. Re-Measure: Verify code health score improved
```

### AI-Ready Surface Expansion

```
Before:                          After:
┌──────────────────────┐        ┌──────┐ ┌──────┐ ┌──────┐
│ Monolithic 200-line  │   →    │ 40ln │ │ 35ln │ │ 25ln │
│ function, depth 6    │        │ d=3  │ │ d=2  │ │ d=2  │
└──────────────────────┘        └──────┘ └──────┘ └──────┘
AI: Fragile changes             AI: Safe, targeted changes
```

---

## Level 3 Production Framework

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Human (Architect/Specifier)               │
│  - Defines goals, constraints, specs                        │
│  - Reviews PRs with agent-specific checklists               │
│  - Iterates harness (AGENTS.md, constraints, tools)         │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Harness Layer                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ AGENTS.md    │ │ Constraints  │ │ Hooks        │        │
│  │ (rules,      │ │ (linters,    │ │ (pre/post    │        │
│  │  sequencing) │ │  type-check) │ │  tool exec)  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Agent Layer                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Scraper  │ │ Builder  │ │ Reviewer │ │ Tester   │       │
│  │ Agent    │ │ Agent    │ │ Agent    │ │ Agent    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Observability Layer                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Entropy      │ │ Code Health  │ │ Agent Perf   │        │
│  │ Manager      │ │ Dashboard    │ │ Dashboard    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Agent-Specific PR Review Checklists

**For Code Review Agent:**
- [ ] No over-abstraction (simple solutions preferred)
- [ ] No redundant error handling (framework handles it)
- [ ] No documentation drift (docstrings match code)
- [ ] Functions < 50 lines, nesting ≤ 4
- [ ] No hardcoded secrets or config

**For Security Review Agent:**
- [ ] All inputs validated
- [ ] Parameterized queries only (no string concat SQL)
- [ ] No secret exposure in logs/errors
- [ ] Rate limiting on public endpoints
- [ ] Auth/authorization verified

**For Test Review Agent:**
- [ ] No deleted tests
- [ ] No excessive mocking that bypasses behavioral checks
- [ ] Coverage delta ≥ 0 (no regression)
- [ ] Edge cases covered (null, empty, boundary)

---

## Entropy Management

### Scheduled Cleanup Cadence

| Frequency | Action | Tool |
|-----------|--------|------|
| Per commit | Auto-lint, security scan | Hooks (auto-lint.js, security-check.js) |
| Per PR | Code review, coverage check | @code-reviewer, verify-coverage.js |
| Weekly | Dead code scan, doc drift scan | `entropy-manager.py scan` |
| Monthly | Full entropy report, refactor plan | `entropy-manager.py report --output report.json` |

### Entropy Types Detected

| Type | Detection | Fix |
|------|-----------|-----|
| Dead code | Unused imports, empty functions | Remove |
| Doc drift | TODO/FIXME/HACK comments | Address or remove |
| Constraint violations | Files > 800 lines, nesting > 4 | Refactor |
| Dead dependencies | Installed but unused packages | Remove from requirements |
| Test weakening | Deleted tests, excessive mocking | Restore tests |

---

## Human-in-the-Loop Practices

### Direction Over Execution

Humans act as **architects and specifiers**, not implementers:
- **Before AI**: Define WHAT (spec.md), HOW (plan.md), task breakdown (tasks.md)
- **During AI**: Monitor agent progress via audit log, intervene only on stuck/looping agents
- **After AI**: Review with agent-specific checklists, merge if all gates pass

### Escalation Policies

Trigger human involvement when:
- Agent runs > 3 retries on same task (stuck loop)
- Code health drops below 6.0 after AI changes
- Security scan finds critical issues in AI-generated code
- Coverage regresses by > 5%

### Continuous Harness Iteration

The harness evolves through:
1. **Analyze** agent behavior patterns from audit logs
2. **Update** AGENTS.md rules based on recurring failure modes
3. **Adjust** constraints (add linters, tighten hooks)
4. **Measure** AI-readiness score improvement over time

---

## Anti-Patterns to Avoid

| Anti-Pattern | Symptom | Prevention |
|-------------|---------|------------|
| **AI Self-Harm Mode** | Agents modify spaghetti code → fragile output | Pull Risk Forward — refactor first |
| **Complexity Reshuffling** | Agents polish/rearrange without real improvement | Measure code health before/after |
| **Opportunistic Tool Usage** | Inconsistent MCP tool invocation | AGENTS.md sequencing rules |
| **Test Deletion** | Agents delete failing tests to pass CI | Coverage regression gate |
| **Coverage Gaming** | Vanity metric coverage | Track coverage delta, not absolute |
| **Manual Verification** | Human bottleneck at AI speed | E2E automation + CI gates |
| **Speed-Only Focus** | Velocity over health | Code health dashboard mandatory |

---

## Quick Start

```bash
# 1. Assess current code health
node .qwen/scripts/code-health-check.js

# 2. Scan for entropy
python .qwen/skills/entropy-manager.py scan --dir .

# 3. Fix issues
python .qwen/skills/entropy-manager.py scan --dir . --fix

# 4. Verify setup
node .qwen/scripts/validate-setup.js

# 5. Start AI work with harness in place
/plan "Feature description"
```

---

**Research Sources:**
- Anthropic 2026 Agentic Coding Trends Report
- CodeScene: Agentic AI Coding Best Practice Patterns
- NXCode: Harness Engineering Complete Guide
- Simon Willison: What is Agentic Engineering?

---

**Related Skills:** `ai-review`, `scrapling-workflow`, `scrapy-workflow`, `firecrawl-workflow`
**Related Scripts:** `code-health-check.js`, `entropy-manager.py`, `validate-setup.js`
