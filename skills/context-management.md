---
name: context-management
description: Tokenizer-aware context accounting, auto-snipping, and reactive compaction. Prevents token limit exhaustion and context degradation.
origin: Claw Code Agent (agent_context.py pattern)
version: "1.0.0"
---

# Context Management

## Overview

AI conversations consume tokens from a finite context window. Without management, long sessions approach context limits, causing slowdowns, degraded quality, and eventual failure. This skill implements **tokenizer-aware context accounting** with **auto-snipping** and **reactive compaction** based on [Claw Code Agent's agent_context.py](https://github.com/HarnessLab/claw-code-agent) pattern.

---

## Context Budget

| Metric | Threshold | Action |
|--------|-----------|--------|
| Context usage < 60% | Normal | Continue normally |
| Context usage 60-80% | Warning | `/memory add` key facts, prepare for compression |
| Context usage > 80% | Critical | Run `/compress` immediately |
| API returns `prompt-too-long` | Error | Reactive compaction → retry |

---

## Auto-Snipping

When context approaches the threshold, older messages are automatically dropped to make room for new ones.

### Snipping Priority (drop order)

1. **Early pleasantries** (greetings, thank-yous)
2. **Tool outputs** (long file contents, command outputs)
3. **Older conversation turns** (summarized before dropping)
4. **Tool calls** (kept if critical to understanding current state)
5. **System prompt** (never dropped)
6. **Memory** (never dropped — loaded at session start)

### Snipping Rules

```
Context < 60%   → No snipping
Context 60-80%  → Summarize older turns, keep recent
Context > 80%   → Drop summarized older turns, keep last 3 turns
```

### Triggering Snipping

```bash
# Manual trigger
/compress

# Auto-trigger (hook: pre-compact-memory.js)
# The hook checks context utilization and reminds the agent to /memory add
# before running /compress, preventing information loss.
```

---

## Reactive Compaction

If the model API returns a `prompt-too-long` error, the system automatically:

1. **Identifies** the largest context components (usually tool outputs)
2. **Summarizes** them (replaces full output with summary)
3. **Retries** the request with the compacted context

### Example

```
Before compaction (context too large):
  - Full test output (500 lines)
  - Full file contents (800 lines)
  - 15 conversation turns

After compaction:
  - Test output summary: "3 passed, 2 failed (see test_output.log)"
  - File summary: "auth.py: 120 lines, 5 functions"
  - Conversation summary: "Phase 1: Schema built. Phase 2: API in progress."
  - Last 3 conversation turns (full detail)
```

---

## Memory Preservation Strategy

Before any context loss event (`/compress` or auto-snipping):

```
1. Review recent conversation for key decisions
2. Run: /memory add "Decision: chose JWT over sessions because X"
3. Run: /memory add "Architecture: auth.py handles login, api.py handles CRUD"
4. Run: /memory add "Open: still need to implement password hashing"
5. THEN run: /compress
```

The `pre-compact-memory.js` hook automates step 5 by reminding the agent to do steps 1-4.

---

## Context Accounting

Track where tokens are being spent:

```
Context Budget Breakdown:
  System prompt:      2,000 tokens (5%)
  Memory (global):    1,500 tokens (4%)
  Memory (project):     800 tokens (2%)
  Recent conversation: 8,000 tokens (20%)
  Tool outputs:       15,000 tokens (38%)  ← Largest consumer
  File contents:       8,000 tokens (20%)
  Tool calls:          2,000 tokens (5%)
  Agent prompts:       2,500 tokens (6%)
  ──────────────────────────────────────
  Total:              39,800 tokens (100%)
  Context window:     200,000 tokens
  Usage:              20%
```

### Optimization Tips

| Strategy | Savings |
|----------|---------|
| Summarize tool outputs | 50-80% reduction |
| Drop early pleasantries | 1-2% reduction |
| Use file summaries instead of full contents | 60-90% reduction |
| Compress conversation history | 40-60% reduction |

---

## Integration with Qwen Code Hooks

| Hook | Role in Context Management |
|------|--------------------------|
| `pre-compact-memory.js` | Reminds agent to save facts before compression |
| `session-summary.js` | Generates compressed summary at session end |
| `agent-log.js` | Tracks agent invocations (low-token audit) |

---

## Anti-Patterns

| Anti-Pattern | Symptom | Prevention |
|-------------|---------|------------|
| **Never compressing** | Slowdowns, degraded output quality | Monitor `/stats`, compress at 80% |
| **Compressing too early** | Lost important context | Wait until 60-80% warning zone |
| **Not saving to memory** | Lost decisions after compression | Always `/memory add` before `/compress` |
| **Large tool outputs** | Token budget exhaustion | Request summarized outputs |
| **No context accounting** | Surprise token limit hits | Check `/stats` periodically |

---

**Related Skills:** `harness-engineering`, `parallel-execution`
**Based on:** Claw Code Agent `agent_context.py` auto-snipping + reactive compaction
