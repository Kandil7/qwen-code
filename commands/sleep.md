---
description: Pause execution for a specified duration. Useful for rate limiting, waiting for external processes, or adding delays between API calls.
agents: ["software-engineer", "web-scraper-engineer"]
---

# /sleep - Pause Execution

## Usage

```
/sleep 5        # Pause for 5 seconds
/sleep 30s      # Pause for 30 seconds
/sleep 2m       # Pause for 2 minutes
/sleep 1h       # Pause for 1 hour
```

## What Happens

1. **Parse Duration** — Convert time string to milliseconds
2. **Wait** — Pause for the specified duration
3. **Resume** — Continue with next operation

## Use Cases

### Rate Limiting

```
# Wait between API calls to avoid rate limits
/sleep 3

# Wait between scraping requests
/scrape "Extract from https://example.com/page1"
/sleep 2
/scrape "Extract from https://example.com/page2"
```

### Waiting for External Processes

```
# Wait for deployment to complete
/deploy my-service
/sleep 30
/doctor  # Verify deployment is healthy
```

### Scheduled Delays

```
# Wait before next batch of work
/sleep 5m

# Wait for business hours to start scraping
/sleep 8h
```

## Duration Formats

| Format | Example | Meaning |
|--------|---------|---------|
| Number | `5` | 5 seconds |
| Seconds | `30s` | 30 seconds |
| Minutes | `2m` | 2 minutes |
| Hours | `1h` | 1 hour |

## Implementation

```python
import time

def sleep(duration_str):
    """Parse duration string and sleep."""
    duration_str = duration_str.strip().lower()
    
    if duration_str.endswith('h'):
        seconds = float(duration_str[:-1]) * 3600
    elif duration_str.endswith('m'):
        seconds = float(duration_str[:-1]) * 60
    elif duration_str.endswith('s'):
        seconds = float(duration_str[:-1])
    else:
        seconds = float(duration_str)
    
    print(f"⏳ Sleeping for {seconds}s...")
    time.sleep(seconds)
    print(f"✓ Resumed after {seconds}s")
```

## Policy Limits

Per policy.json, sleep duration is limited to prevent abuse:

| Limit | Value |
|-------|-------|
| Maximum sleep | 24 hours |
| Maximum in automated loops | 5 minutes |

## Related Commands

- `/scrape` — Add delays between scraping requests
- `/doctor` — Verify system state after waiting
- `/verify` — Check status after pause
