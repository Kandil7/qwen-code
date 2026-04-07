---
name: parallel-execution
description: Parallel subagent execution patterns for Qwen Code. Leverage concurrent Task tool calls for independent operations, maximizing throughput for multi-agent workflows.
origin: Research-Based (Qwen Code Task Tool Documentation, 2026)
version: "1.0.0"
---

# Parallel Subagent Execution

## Overview

Qwen Code supports **parallel subagent execution** by calling the `Task` tool multiple times in a single message/response. This allows independent tasks to run simultaneously rather than sequentially, significantly reducing total wall-clock time.

**Key Principle:** Subagents are **stateless** — each invocation is independent with no memory of previous executions. Prompts must contain ALL necessary context.

---

## When to Use Parallel Execution

### ✅ Use Parallel When:
- Multiple **independent** tasks (no data dependency between them)
- Complex multi-step operations requiring **specialized expertise**
- Heavy resource usage that benefits from concurrency
- Tasks that would otherwise run sequentially (e.g., review 5 files)

### ❌ Don't Use Parallel When:
- Simple, single-step operations (use direct tools: Read, Edit, Grep)
- Tasks requiring **interactive back-and-forth** communication
- Tasks with **data dependencies** (output of A needed for input of B)

---

## Pattern 1: Parallel Code Review + Testing

**Scenario:** Review code AND run tests simultaneously.

```
# Single message with parallel task calls:

Task 1: @code-reviewer
  description: "Code review"
  prompt: "Review changes in src/api/ for correctness, security, and best practices"
  subagent_type: code-reviewer

Task 2: @test-engineer  
  description: "Run tests"
  prompt: "Run full test suite for src/api/ and report failures"
  subagent_type: test-engineer
```

**Time Savings:** Sequential = review_time + test_time → Parallel = max(review_time, test_time)

---

## Pattern 2: Multi-File Parallel Review

**Scenario:** Review 5 changed files in parallel.

```
# Single message with 5 parallel task calls:

Task 1: @code-reviewer
  description: "Review auth.py"
  prompt: "Review C:\Users\amazon\project\src\auth.py for security vulnerabilities, injection risks, and auth bypass"
  subagent_type: code-reviewer

Task 2: @code-reviewer
  description: "Review api.py"
  prompt: "Review C:\Users\amazon\project\src\api.py for input validation, rate limiting, and error handling"
  subagent_type: code-reviewer

Task 3: @security-compliance-engineer
  description: "Security audit"
  prompt: "Audit C:\Users\amazon\project\src\ for hardcoded secrets, SQL injection, XSS vulnerabilities"
  subagent_type: security-compliance-engineer

Task 4: @test-engineer
  description: "Test coverage"
  prompt: "Check test coverage for src/auth.py and src/api.py. Report gaps"
  subagent_type: test-engineer

Task 5: @performance-optimizer
  description: "Performance review"
  prompt: "Analyze src/api.py for N+1 queries, memory leaks, and bottlenecks"
  subagent_type: performance-optimizer
```

**Time Savings:** 5 sequential reviews → 1 parallel batch (5x faster)

---

## Pattern 3: Parallel Scraper Development

**Scenario:** Build scraper for 3 different websites simultaneously.

```
# Single message with 3 parallel task calls:

Task 1: @web-scraper-engineer
  description: "Scrape shop site"
  prompt: "Build scraper for https://shop-a.com/products. Extract name, price, image_url, description. Save to data/shop_a.json. Use Scrapling Fetcher with 2s delay"
  subagent_type: web-scraper-engineer

Task 2: @web-scraper-engineer
  description: "Scrape blog"
  prompt: "Build scraper for https://blog-b.com/articles. Extract title, author, content, published_date. Save to data/blog_b.json. Use Firecrawl crawl endpoint with limit=100"
  subagent_type: web-scraper-engineer

Task 3: @web-scraper-engineer
  description: "Scrape docs"
  prompt: "Build scraper for https://docs-c.com/api. Extract endpoint, method, description, parameters. Save to data/docs_c.json. Use Scrapy CrawlSpider with rules"
  subagent_type: web-scraper-engineer
```

---

## Pattern 4: Parallel Data Pipeline Build

**Scenario:** Build complete data pipeline (scraper → validator → storage → API) in parallel.

```
# Phase 1: Parallel component development

Task 1: @web-scraper-engineer
  description: "Build scraper"
  prompt: "Create scraper module at scrapers/products.py for https://shop.com. Use adaptive parsing, retry logic, 2s delay"
  subagent_type: web-scraper-engineer

Task 2: @data-engineer
  description: "Build validator"
  prompt: "Create validation pipeline at pipelines/validator.py using Pydantic. Schema: Product(name:str, price:float>0, url:str). Drop invalid items"
  subagent_type: data-engineer

Task 3: @api-engineer
  description: "Build API"
  prompt: "Create REST API at api/products.py with GET /products, GET /products/{id}, POST /products. Use FastAPI"
  subagent_type: api-engineer

Task 4: @dev-ops-platform-engineer
  description: "Build Docker"
  prompt: "Create Dockerfile and docker-compose.yml for the pipeline. Include scraper, validator, API services"
  subagent_type: dev-ops-platform-engineer

# Phase 2: Integration (sequential, depends on Phase 1 outputs)
# After all 4 tasks complete → integration task wires them together
```

---

## Pattern 5: Parallel Entropy Cleanup

**Scenario:** Run all entropy scans in parallel.

```
# Single message with parallel task calls:

Task 1: @code-reviewer
  description: "Dead code scan"
  prompt: "Scan project for unused imports, empty functions, unreachable code. Report findings"
  subagent_type: code-reviewer

Task 2: @documentation-writer
  description: "Doc drift scan"
  prompt: "Find outdated TODO/FIXME/HACK comments, outdated docstrings, mismatched documentation"
  subagent_type: documentation-writer

Task 3: @security-compliance-engineer
  description: "Security scan"
  prompt: "Scan for hardcoded secrets, SQL injection, XSS, auth bypass, exposed config"
  subagent_type: security-compliance-engineer

Task 4: @performance-optimizer
  description: "Performance audit"
  prompt: "Find N+1 queries, memory leaks, slow operations, unoptimized algorithms"
  subagent_type: performance-optimizer
```

---

## Critical: Comprehensive Prompt Design

Since subagents are **stateless** and only communicate once (at the end), prompts MUST contain:

### ✅ Good Prompt (Self-Contained)
```
Review C:\Users\amazon\project\src\auth.py for:
1. Security: JWT token validation, refresh token handling, session management
2. Input validation: All user inputs sanitized
3. Error handling: No sensitive data in error messages
4. Best practices: Functions < 50 lines, nesting ≤ 4

File content context: [include relevant imports, function signatures, key logic]
```

### ❌ Bad Prompt (Missing Context)
```
Review auth.py
```

---

## Execution Monitoring

Parallel tasks provide **real-time progress updates**:
- Individual task status (running, completed, failed)
- Tool call visibility per subagent
- Error reporting per subagent

### Monitoring Dashboard

```
Parallel Batch: 5 tasks
  ✓ Task 1 (Code review): Completed in 45s
  ⟳ Task 2 (Tests): Running (3 of 12 files tested)
  ⟳ Task 3 (Security): Running (scanning 8 files)
  ⟳ Task 4 (Coverage): Running (analyzing test suite)
  ✓ Task 5 (Performance): Completed in 62s
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| **Dependent parallel tasks** | Task B needs output from Task A | Make sequential instead |
| **Vague prompts** | Stateless agents lack context | Include ALL context in prompt |
| **Too many parallel tasks** | Resource contention, token limits | Batch size 3-5 optimal |
| **Interactive tasks** | No back-and-forth possible | Use direct tools instead |
| **Simple tasks** | Overhead > benefit | Use Read/Edit/Grep directly |

---

## Integration with Harness Engineering

Parallel execution works best within the Harness Engineering framework:

```
1. Pull Risk Forward → Run code-health-check BEFORE parallel batch
2. Parallel tasks → Execute independent reviews/tests/scans
3. Safeguard Generated Code → Aggregate results, apply quality gates
4. Entropy Management → Schedule parallel cleanup scans
```

---

**Related Skills:** `harness-engineering`, `ai-review`
**Related Scripts:** `code-health-check.js`, `entropy-manager.py`, `validate-setup.js`
