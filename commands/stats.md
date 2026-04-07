---
description: View token usage, API costs, tool call statistics, and session performance metrics. Integrates with token-tracker.py for per-session accounting.
agents: ["observability-engineer", "finops-engineer"]
---

# /stats - Token Usage & Performance Statistics

## Usage

```
/stats
/stats --verbose
/stats --session <session-id>
/stats --cost
/stats --json
```

## What Happens

1. **Token Tracking** — Reports input/output token usage from token-tracker.py
2. **Cost Analysis** — Shows API costs per provider, per model
3. **Tool Call Stats** — Reports tool call count, rate, latency (avg/p95)
4. **Budget Usage** — Shows budget utilization vs policy.json limits
5. **Session Performance** — Duration, calls/minute, success rate

## Output Format

```
📊 Session Statistics
=====================

Session: session-2026-04-07-14-30-00
Duration: 1800s (30 minutes)

Tokens:
  Input:  45,230 tokens
  Output: 12,450 tokens
  Total:  57,680 tokens

Cost:
  Total:  $0.1234
  API Calls: 2
  Model: claude-sonnet-4-20250514

Tool Calls:
  Total: 156 calls
  Rate:  5.2 calls/minute
  Avg Latency: 245ms
  P95 Latency: 890ms

Top Tools:
  read_file:    45 calls (28.8%)
  write_file:   23 calls (14.7%)
  grep_search:  18 calls (11.5%)
  bash:         15 calls (9.6%)
  edit_file:    12 calls (7.7%)

Budget Usage:
  Tokens: 29% of 200,000 limit
  Cost:   12% of $10.00 limit
  API Calls: 2% of 100/hour limit
  Status: ✅ Within budget
```

## Token Tracking Integration

The `/stats` command integrates with `token-tracker.py`:

```python
# In session:
from token_tracker import get_tracker

tracker = get_tracker("current-session")
tracker.record_tool_call("read_file", tokens=150, latency_ms=45)
tracker.record_api_call("anthropic", input_tokens=5000, output_tokens=2000)

# View stats:
print(tracker.summary)
tracker.save()
```

## Budget Enforcement

Policy limits are defined in `.qwen/policy.json`:

```json
{
  "budget_policies": {
    "max_tokens_per_session": 200000,
    "max_cost_usd_per_session": 10.0,
    "max_api_calls_per_hour": 100,
    "max_tool_calls_per_turn": 20,
    "max_concurrent_agents": 5,
    "warning_threshold_percent": 80
  }
}
```

When usage exceeds 80% of any limit, warnings are shown.
When usage exceeds 100%, the session should be halted.

## Cost Models

Approximate costs per 1M tokens:

| Model | Input | Output |
|-------|-------|--------|
| claude-sonnet-4 | $3.00 | $15.00 |
| claude-opus-4 | $15.00 | $75.00 |
| gpt-4o | $2.50 | $10.00 |
| qwen-coder | $0.50 | $2.00 |

## Related Commands

- `/doctor` — System health diagnostics
- `/compress` — Free up token budget
- `/memory add` — Preserve facts before compression
- `/verify` — Pre-commit checks
