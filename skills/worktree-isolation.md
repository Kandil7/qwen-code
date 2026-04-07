---
name: worktree-isolation
description: Git worktree management for agent task isolation. Each parallel agent gets its own branch and working directory, preventing cross-contamination.
origin: Claw Code Agent (worktree_runtime.py pattern)
version: "1.0.0"
---

# Worktree Isolation

## Overview

When running multiple agents in parallel (or even sequentially for safety), each agent should work in an **isolated Git worktree**. This prevents:
- File conflicts between parallel agents
- Contamination of the main working directory
- Lost work when agents make destructive changes
- Merge conflicts from overlapping edits

Based on [Claw Code Agent's worktree_runtime.py](https://github.com/HarnessLab/claw-code-agent) pattern.

---

## When to Use Worktrees

| Scenario | Use Worktree? | Why |
|----------|--------------|-----|
| Single agent, single task | Optional | Safety net |
| Multiple parallel agents | **Required** | Prevent file conflicts |
| Experimental/refactoring work | **Required** | Easy rollback |
| Production hotfix while developing feature | **Required** | No context switching |
| AI-generated code review | No | Read-only, no changes |

---

## Workflow

### Step 1: Create Worktrees for Each Agent

```bash
# Main branch stays clean
git checkout main

# Create isolated worktrees for each task
git worktree add ../wt-database origin/main -b feature/database-schema
git worktree add ../wt-frontend origin/main -b feature/frontend-ui
git worktree add ../wt-api origin/main -b feature/api-endpoints
```

### Step 2: Dispatch Agents to Their Worktrees

```
Task 1 (database-engineer):
  Working directory: C:\Users\amazon\..\wt-database
  Branch: feature/database-schema
  Prompt: "Build database schema in this isolated worktree"

Task 2 (frontend-engineer):
  Working directory: C:\Users\amazon\..\wt-frontend
  Branch: feature/frontend-ui
  Prompt: "Build frontend components in this isolated worktree"

Task 3 (api-engineer):
  Working directory: C:\Users\amazon\..\wt-api
  Branch: feature/api-endpoints
  Prompt: "Build API endpoints in this isolated worktree"
```

### Step 3: Merge Results

```bash
# After all agents complete
git merge feature/database-schema
git merge feature/frontend-ui
git merge feature/api-endpoints

# Clean up worktrees
git worktree remove ../wt-database
git worktree remove ../wt-frontend
git worktree remove ../wt-api
```

---

## Using the Worktree Manager Script

```bash
# Create worktrees for a multi-agent task
node .qwen/scripts/worktree-manager.js create \
  --tasks database,frontend,api \
  --base-branch main

# List active worktrees
node .qwen/scripts/worktree-manager.js list

# Enter a specific worktree
node .qwen/scripts/worktree-manager.js enter wt-database

# Cleanup all worktrees after merge
node .qwen/scripts/worktree-manager.js cleanup
```

---

## Worktree + Parallel Execution Pattern

```
1. Create worktrees (sequential): 3 worktrees in ~5 seconds
2. Dispatch agents (parallel): 3 agents run simultaneously in isolation
3. Wait for completion
4. Merge branches (sequential): 3 merges
5. Cleanup worktrees
```

### Time Comparison

| Approach | Wall Clock Time | Risk |
|----------|----------------|------|
| Sequential (no worktrees) | T1 + T2 + T3 | File conflicts |
| Parallel (no worktrees) | max(T1, T2, T3) | File conflicts ❌ |
| Parallel + worktrees | max(T1, T2, T3) + ~5s | **Safe** ✅ |

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| **No worktrees for parallel** | Agents overwrite each other's files | Always use worktrees |
| **Too many worktrees** | Disk space, memory usage | Limit to 5 concurrent worktrees |
| **Not cleaning up** | Stale worktrees waste disk | Cleanup after merge |
| **Forgetting to merge** | Work is lost in abandoned branches | Merge before cleanup |

---

**Related Skills:** `parallel-execution`, `delegation-orchestrator`
**Based on:** Claw Code Agent `worktree_runtime.py`
