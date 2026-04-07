---
name: delegation-orchestrator
description: Dependency-aware parallel agent delegation based on Claw Code Agent's topological batching pattern. Schedules subagents based on task dependencies for maximum throughput.
origin: Claw Code Agent (Agent Manager pattern)
version: "1.0.0"
---

# Delegation Orchestrator

## Overview

When delegating to multiple subagents, the order matters. Some tasks depend on others' output (sequential), while others are fully independent (parallel). This skill implements **topological batching**: analyze task dependencies, batch independent tasks for parallel execution, and sequence dependent tasks.

Based on [Claw Code Agent's agent_manager.py](https://github.com/HarnessLab/claw-code-agent) nested delegation pattern.

---

## How It Works

### Step 1: Define Tasks with Dependencies

```yaml
tasks:
  - id: T1
    description: "Build database schema"
    agent: database-engineer
    depends_on: []

  - id: T2
    description: "Build API endpoints"
    agent: api-engineer
    depends_on: [T1]  # Needs schema to exist

  - id: T3
    description: "Build frontend UI"
    agent: frontend-engineer
    depends_on: []  # Independent of T1 and T2

  - id: T4
    description: "Write integration tests"
    agent: test-engineer
    depends_on: [T1, T2, T3]  # Needs everything to exist
```

### Step 2: Topological Sort → Batches

```
Batch 1 (PARALLEL): T1 (schema) + T3 (frontend)
  → No dependencies, run simultaneously

Batch 2 (SEQUENTIAL): T2 (API)
  → Depends on T1, waits for Batch 1

Batch 3 (SEQUENTIAL): T4 (tests)
  → Depends on T1, T2, T3, waits for Batch 2
```

### Step 3: Execute

```
Launch Batch 1 (parallel):
  Task(T1): @database-engineer "Build database schema for users, posts, comments"
  Task(T3): @frontend-engineer "Build React UI components for user and post views"

Wait for Batch 1 → Both complete

Launch Batch 2:
  Task(T2): @api-engineer "Build REST API endpoints using the schema from T1"

Wait for Batch 2 → Complete

Launch Batch 3:
  Task(T4): @test-engineer "Write integration tests for the full system"

Wait for Batch 3 → Complete

Total time: T1/T3(max) + T2 + T4
Sequential time: T1 + T2 + T3 + T4
Speedup: ~2x for this example
```

---

## Agent Lineage Tracking

Every delegated task creates a parent-child relationship that should be tracked:

```
Parent: @orchestrator-tech-lead
  ├── Child 1: @database-engineer (T1: Build schema)
  │   ├── Output: schema.sql, models.py
  │   └── Session: saved to .qwen/sessions/T1-session.json
  ├── Child 2: @frontend-engineer (T3: Build UI)
  │   ├── Output: components/User.tsx, components/Post.tsx
  │   └── Session: saved to .qwen/sessions/T3-session.json
  ├── Child 3: @api-engineer (T2: Build API)
  │   ├── Output: api/users.py, api/posts.py
  │   └── Session: saved to .qwen/sessions/T2-session.json
  └── Child 4: @test-engineer (T4: Write tests)
      ├── Output: tests/integration/test_api.py
      └── Session: saved to .qwen/sessions/T4-session.json
```

### Lineage Format

```json
{
  "parent_agent": "orchestrator-tech-lead",
  "session_id": "session-2026-04-07-001",
  "children": [
    {
      "task_id": "T1",
      "agent": "database-engineer",
      "description": "Build database schema",
      "depends_on": [],
      "batch": 1,
      "status": "completed",
      "output_files": ["schema.sql", "models.py"],
      "session_file": ".qwen/sessions/T1-session.json"
    }
  ]
}
```

---

## Context Propagation

Child agents receive **full context** from the parent:

```
Parent prompt: "Build a blog system with users, posts, comments"

Child T1 prompt (database-engineer):
"""
Context: We are building a blog system with users, posts, comments.
Overall goal: Create a full-stack blog platform.

Your specific task: Build the database schema.
Requirements:
- Users table (id, username, email, created_at)
- Posts table (id, user_id, title, content, created_at)
- Comments table (id, post_id, user_id, body, created_at)
- Foreign keys between tables

You are working alongside:
- Frontend engineer (building React UI)
- API engineer (building REST endpoints)

Constraints: Use PostgreSQL, follow naming conventions from AGENTS.md.
"""
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| **Blind parallelism** | Launching dependent tasks in parallel → failures | Use topological sort |
| **Missing context** | Child agents don't know the overall goal | Include full context in prompt |
| **No lineage tracking** | Can't trace who produced what | Track parent-child relationships |
| **Too many parallel** | Resource contention, token exhaustion | Batch size 3-5 max |
| **Lost child sessions** | Can't resume or debug child failures | Save child sessions independently |

---

## Integration with Parallel Execution Skill

This skill extends the `parallel-execution` skill by adding:
1. **Dependency analysis** — automatic topological sorting
2. **Lineage tracking** — parent-child relationship log
3. **Context propagation** — structured context injection to children
4. **Session independence** — each child has its own resumable session

---

**Related Skills:** `parallel-execution`, `harness-engineering`
**Based on:** Claw Code Agent `agent_manager.py` topological batching
