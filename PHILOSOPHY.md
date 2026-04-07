# Design Principles

**Based on:** [ultraworkers/claw-code PHILOSOPHY.md](https://github.com/ultraworkers/claw-code/blob/main/PHILOSOPHY.md)  
**Applies to:** All Qwen Code AI engineering work, agent development, and system design decisions.

---

## Core Tenet

**Humans set direction; agents perform the labor.**

The primary human role is architect, specifier, and reviewer — not implementer. Humans decide WHAT to build and WHY through strategic thinking, product taste, and conviction. Agents handle HOW through specialized expertise, parallel execution, and automated quality gates.

---

## Principle 1: Direction/Execution Split

**The constraint is not coding speed. It is architectural clarity, task decomposition, and product judgment.**

- Humans provide clear specs, constraints, and success criteria
- Agents execute with their specialized tools and knowledge
- Humans review output against requirements, not implementation details
- This split makes humans 10-100x more productive than writing code themselves

**Anti-pattern:** Humans micromanaging every line of generated code  
**Pattern:** Humans writing clear specs, agents implementing, humans reviewing outcomes

---

## Principle 2: Context Decoupling

**Push monitoring, notifications, and observability OUTSIDE agent context windows.**

Agents should focus on their specific task. System-level concerns (audit trails, progress tracking, health monitoring) run in parallel hooks, not within the agent's conversation context.

- Agent context = task requirements, relevant code, constraints
- System context = audit logs, metrics, alerts, dashboards
- Never burden an agent with "log what you're doing" — hooks do this automatically

**Anti-pattern:** Adding "please log your actions" to every agent prompt  
**Pattern:** Dedicated hooks (agent-log.js, audit-trail.json) run independently

---

## Principle 3: Automated Loops

**Planning → Execution → Review → Retry is fully automated. Humans intervene only on critical failures.**

Every agent invocation includes automated quality gates:
- Code health pre-check (Pull Risk Forward)
- Post-generation linting and type checking
- Security scanning before any commit
- Coverage regression detection
- Automated retry on transient failures

**Anti-pattern:** Manually running tests after every agent output  
**Pattern:** Hooks automatically run tests, report results, trigger retries

---

## Principle 4: Bottleneck Shift

**The bottleneck has shifted from typing speed to:**
1. **Architectural clarity** — Can agents understand the system structure?
2. **Task decomposition** — Are tasks small enough for specialized agents?
3. **Quality gates** — Do automated checks catch agent errors?
4. **Product taste** — Are we building the RIGHT thing?

Investment in these areas yields multiplicative returns. Investment in "faster agents" yields diminishing returns.

---

## Principle 5: Artifact vs System

**The generated codebase is a byproduct. The true product is the coordination system that produces it.**

- AGENTS.md, hooks, policies, and skills are the intellectual property
- Generated code is evidence that the system works
- A well-tuned harness can produce any codebase; a single codebase cannot reproduce the harness

**Anti-pattern:** Optimizing for lines of code generated  
**Pattern:** Optimizing for agent success rate, code health improvement, review pass rate

---

## Principle 6: Pull Risk Forward

**Assess code health BEFORE assigning AI tasks. Low-quality code guarantees AI failures and token waste.**

- Code health < 6.0: DO NOT use AI — refactor manually first
- Code health 6.0-8.0: Refactor target areas before AI work
- Code health 8.0+: AI-capable with appropriate review
- Code health 9.5+: Full AI autonomy

**Anti-pattern:** Letting agents modify spaghetti code → fragile output  
**Pattern:** Run code-health-check.js before any agent work

---

## Principle 7: Safeguard Generated Code

**AI output quality reflects training data quality. Continuous automated verification is mandatory.**

Three-tier protection:
1. **Per-snippet:** Code health review during generation
2. **Pre-commit:** Linting, type checking, security scanning via hooks
3. **Pre-merge:** Comprehensive review with agent-specific checklists

**Anti-pattern:** Trusting AI output without verification  
**Pattern:** Automated gates catch 95% of issues before human review

---

## Principle 8: Expand AI-Ready Surface

**Systematically reduce code complexity to expand the safe operational zone for agents.**

- Functions > 50 lines → refactor before AI work
- Files > 800 lines → split before AI work
- Nesting > 4 levels → flatten before AI work
- Dead code → remove before AI work

Each refactoring investment permanently improves future AI effectiveness.

---

## What We Are NOT Doing

- ❌ **Not treating the repository as just generated files** — The coordination system (agents, hooks, policies) is the real asset
- ❌ **Not requiring humans to micromanage every step** — Automated loops handle the cycle
- ❌ **Not using raw coding output as the primary metric** — Success rate, quality, and health matter
- ❌ **Not removing the need for human thinking** — We make clear thinking MORE valuable
- ❌ **Not relying on terminal micromanagement** — Async, spec-driven, review-based workflow

---

## Operational Model

```
Human (Architect)
  ↓ "Build user authentication with JWT"
Orchestrator (tech-lead-ai-engineer)
  ↓ Coordinates specialized agents
  ├→ @web-scraper-engineer (if scraping needed)
  ├→ @software-engineer (implementation)
  ├→ @test-engineer (testing)
  ├→ @security-compliance-engineer (audit)
  └→ @code-reviewer (quality review)
  ↓
Automated Quality Gates (hooks)
  ├→ Code health pre-check
  ├→ Post-generation linting
  ├→ Security scanning
  └→ Coverage regression check
  ↓
Human (Reviewer)
  ↓ "Approved" or "Fix: [specific issues]"
Agent (Self-correction loop)
  ↓
Merge
```

---

**Living Document** — Update as principles evolve. Every principle was earned through experience, not theorized.
