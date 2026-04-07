---
name: workflow-registry
description: Reusable workflow patterns with execution history tracking. Manifest-backed workflows for common multi-agent pipelines.
origin: Claw Code Agent (workflow_runtime.py pattern)
version: "1.0.0"
---

# Workflow Registry

## Overview

A **workflow** is a predefined sequence of agent tasks that accomplish a common goal. Instead of re-describing the same pipeline every time, workflows are registered in a manifest and can be invoked by name. Each execution is recorded in the workflow history.

Based on [Claw Code Agent's workflow_runtime.py](https://github.com/HarnessLab/claw-code-agent) pattern.

---

## Available Workflows

### 1. `scrape-pipeline` — End-to-End Web Scraping

```
Goal: Build a production scraping pipeline
Steps:
  1. @web-scraper-engineer → Build scraper
  2. @data-engineer → Build validation + storage
  3. @data-governance-engineer → Compliance review
  4. @observability-engineer → Add monitoring
  5. @dev-ops-platform-engineer → Deploy

Usage: "Run scrape-pipeline for https://shop.example.com"
```

### 2. `feature-pipeline` — Feature Development

```
Goal: Build a new feature from spec to deployment
Steps:
  1. /specify → Define requirements
  2. /sdd-plan → Technical design
  3. /tasks → Break into tasks
  4. @software-engineer → Implement
  5. @test-engineer → Test
  6. @code-reviewer → Review
  7. @security-compliance-engineer → Security audit

Usage: "Run feature-pipeline for 'add user authentication'"
```

### 3. `review-pipeline` — Code Review + Fix Loop

```
Goal: Review code, find issues, auto-fix
Steps:
  1. @code-reviewer → Review for quality
  2. @security-compliance-engineer → Security audit
  3. @performance-optimizer → Performance review
  4. Aggregate findings
  5. @software-engineer → Fix all issues
  6. @test-engineer → Verify fixes

Usage: "Run review-pipeline on recent changes"
```

### 4. `refactor-pipeline` — Safe Refactoring

```
Goal: Refactor code without breaking functionality
Steps:
  1. @code-reviewer → Identify code health issues
  2. python entropy-manager.py scan → Dead code, doc drift
  3. node code-health-check.js → Baseline score
  4. @software-engineer → Refactor (pull risk forward)
  5. @test-engineer → Verify no regression
  6. node code-health-check.js → Improvement score

Usage: "Run refactor-pipeline on src/auth/"
```

### 5. `deploy-pipeline` — Production Deployment

```
Goal: Deploy application to production safely
Steps:
  1. @test-engineer → Full test suite
  2. @security-compliance-engineer → Security scan
  3. @dev-ops-platform-engineer → Build + deploy
  4. @observability-engineer → Verify health checks
  5. @sre-reliability-engineer → Monitor for 15 min

Usage: "Run deploy-pipeline for v2.3.0"
```

---

## Workflow Manifest Format

```yaml
# .qwen/workflows/scrape-pipeline.yaml
name: scrape-pipeline
version: "1.0.0"
description: "End-to-end web scraping pipeline"
category: data-engineering

steps:
  - id: S1
    agent: web-scraper-engineer
    description: "Build scraper for {target_url}"
    depends_on: []

  - id: S2
    agent: data-engineer
    description: "Build validation + storage pipeline"
    depends_on: [S1]

  - id: S3
    agent: data-governance-engineer
    description: "Compliance review for {target_url}"
    depends_on: [S2]

  - id: S4
    agent: observability-engineer
    description: "Add monitoring and alerting"
    depends_on: [S2]

  - id: S5
    agent: dev-ops-platform-engineer
    description: "Deploy with Docker"
    depends_on: [S3, S4]

parameters:
  - name: target_url
    description: "URL to scrape"
    required: true
    type: string

  - name: output_format
    description: "Output format (json/csv)"
    required: false
    type: string
    default: "json"
```

---

## Workflow Execution History

Each workflow execution is recorded in `.qwen/workflow-history.json`:

```json
{
  "executions": [
    {
      "workflow": "scrape-pipeline",
      "timestamp": "2026-04-07T14:30:00Z",
      "parameters": { "target_url": "https://shop.example.com" },
      "status": "completed",
      "duration_seconds": 420,
      "steps_completed": 5,
      "steps_total": 5,
      "agent_invocations": 5,
      "output_files": ["data/products.json", "config/settings.yaml"]
    }
  ]
}
```

---

## Running a Workflow

```bash
# By name (AI agent handles execution)
"Run scrape-pipeline for https://shop.example.com"
"Run feature-pipeline for 'add user authentication'"

# View available workflows
node .qwen/scripts/workflow-manager.js list

# View execution history
node .qwen/scripts/workflow-manager.js history

# View history filtered by workflow
node .qwen/scripts/workflow-manager.js history --workflow scrape-pipeline
```

---

## Creating Custom Workflows

1. Create `.qwen/workflows/my-workflow.yaml` with the manifest format above
2. Document the workflow steps and parameters
3. Invoke by name: "Run my-workflow with param=value"

---

**Related Skills:** `delegation-orchestrator`, `parallel-execution`, `harness-engineering`
**Based on:** Claw Code Agent `workflow_runtime.py`
