# 🔧 Complete Tool Registry

**Last Updated**: April 7, 2026  
**Total Agents**: 53 | **Total Commands**: 8 | **Total Skills**: 20 | **MCP Servers**: 13 | **Hooks**: 8 | **Scripts**: 30 | **Plugins**: 3 | **Workflows**: 5 | **Tests**: 16 (10 parity + 5 workflow + 1 output validation)

---

## 📋 Quick Reference

### Need to... | Use This
|-----------|-----------|
| Run health diagnostics | `/doctor` |
| Scrape a webpage adaptively | `/scrape "Extract X from URL"` |
| Research using AI extraction | `/firecrawl "Find X on the web"` |
| Crawl a website at scale | `/scraping "Build crawler for URL"` |
| Generate code from a paper | `/paper2code "Paper title"` |
| Plan a feature | `/plan "Feature description"` |
| Write tests first | `/tdd "Feature description"` |
| Review code | `/code-review` |
| Scan for security issues | `/security-scan` |
| Check context/stats | `/stats` |
| Save important facts | `/memory add "fact"` |
| Free up token budget | `/compress` |
| Export session | `/export` |

---

## 🤖 Agents (53 Total)

### Primary Agent (1)

| Agent | Description | Invocation |
|-------|-------------|------------|
| `@orchestrator-tech-lead` | Technical leader, coordinates all 52 subagents | Direct or auto-routed |

### AI Core & LLM Operations (13)

| Agent | Description | Best For |
|-------|-------------|----------|
| `@full-stack-ai-engineer` | End-to-end AI systems (RAG, LLM, agents) | RAG, LLM integration, embeddings |
| `@llm-ops-engineer` | LLM lifecycle, multi-provider, cost | Multi-provider setup, fallbacks |
| `@rag-optimization-engineer` | RAG retrieval tuning | Poor recall, chunking, reranking |
| `@vector-db-engineer` | Vector databases, indexing | Vector DB selection, HNSW/IVF |
| `@embedding-engineer` | Embedding models, fine-tuning | Model selection, batch processing |
| `@agent-systems-engineer` | AI agent architecture | Tool registries, memory, planning |
| `@ai-evaluation-engineer` | LLM quality, hallucination detection | Eval harness, RAGAs, golden sets |
| `@ai-safety-engineer` | AI safety, content moderation | Guardrails, jailbreak prevention |
| `@prompt-engineer` | Prompt optimization | Structured outputs, token budgeting |
| `@search-engineer` | Hybrid search, ranking | BM25 + semantic, query understanding |
| `@ai-research-eval-engineer` | AI benchmarks, synthetic data | Evaluation metrics, model comparison |
| `@ai-product-analyst` | AI metrics, engagement analysis | Cost per user, engagement tracking |
| `@firecrawl-engineer` | AI-powered scraping, MCP | Natural language extraction, research |

### Data Engineering & ML (10)

| Agent | Description | Best For |
|-------|-------------|----------|
| `@data-engineer` | Data pipelines, ETL, ingestion | Multi-source, dedup, incremental sync |
| `@data-scientist` | Data analysis, ML models | Statistical analysis, predictive modeling |
| `@data-governance-engineer` | Data governance, GDPR/CCPA | Lineage tracking, data catalog |
| `@data-privacy-engineer` | Privacy engineering, PII | Anonymization, consent management |
| `@feature-store-engineer` | Feature stores | Online/offline features |
| `@database-engineer` | Schema design, query optimization | Relational databases, migrations |
| `@mlops-engineer` | ML training, deployment | Training pipelines, drift detection |
| `@model-versioning-engineer` | Model registry, A/B testing | Canary deployments, rollback |
| `@web-scraper-engineer` | Scrapling, adaptive parsing | Anti-bot bypass, data extraction |
| `@scrapy-engineer` | Scrapy, async pipelines | Production crawling, distributed |

### Platform & Infrastructure (5)

| Agent | Description | Best For |
|-------|-------------|----------|
| `@dev-ops-platform-engineer` | Kubernetes, CI/CD, Docker | Platform engineering, Helm |
| `@observability-engineer` | OpenTelemetry, tracing, metrics | Dashboards, alerting, RED/USE |
| `@sre-reliability-engineer` | SLOs, runbooks, load testing | Incident response, reliability |
| `@infrastructure-security-engineer` | IAM, network security, secrets | Container hardening, secrets mgmt |
| `@security-compliance-engineer` | Threat modeling, compliance | Security audits, SOC 2, HIPAA |

### Application Development (7)

| Agent | Description | Best For |
|-------|-------------|----------|
| `@software-engineer` | Backend APIs, business logic | General development |
| `@api-engineer` | REST/GraphQL, OpenAPI | API design, versioning |
| `@frontend-engineer` | React/Vue/Next.js, a11y | Components, responsive design |
| `@developer-experience-engineer` | SDKs, API docs, portals | Developer tooling |
| `@qa-automation-engineer` | Test automation, CI/CD | Quality gates, integration tests |
| `@test-engineer` | Test strategy, unit/E2E | Test design, coverage |
| `@code-reviewer` | Code review, best practices | Quality review, security checks |

### Integrations & Conversational (5)

| Agent | Description | Best For |
|-------|-------------|----------|
| `@integration-engineer` | Third-party APIs (CRM, ERP) | External service integration |
| `@webhook-integration-engineer` | Webhooks, event systems | Event-driven architecture |
| `@chatbot-architect` | Chatbot architecture | Session management, multi-channel |
| `@conversation-designer` | Dialogue flows, UX | Persona design, error handling |
| `@ai-customer-support-engineer` | Support automation | Ticket classification, auto-response |

### Product, Growth & Cost (5)

| Agent | Description | Best For |
|-------|-------------|----------|
| `@product-engineer` | PRDs, UX, success metrics | Product requirements, AI vs rules |
| `@growth-engineer` | Analytics, lifecycle, PLG | Acquisition, activation, retention |
| `@a-b-testing-engineer` | A/B test design, statistics | Experimentation infrastructure |
| `@finops-engineer` | Cost optimization, billing | Unit economics, cost controls |
| `@knowledge-base-engineer` | Knowledge management, RAG docs | Doc optimization for AI |

### Specialized Roles (6)

| Agent | Description | Best For |
|-------|-------------|----------|
| `@accessibility-specialist` | WCAG, screen readers | Accessibility compliance |
| `@i18n-specialist` | Internationalization, RTL | Localization, multi-language |
| `@performance-optimizer` | Performance tuning | Bottleneck analysis, optimization |
| `@dependency-manager` | Dependency updates | Security patches, upgrades |
| `@migration-specialist` | Database migrations | Version upgrades |
| `@documentation-writer` | Technical documentation | README, guides, API docs |

---

## ⚡ Commands (4 Scraping + Core)

### Scraping Commands

| Command | Description | Agent(s) Routed |
|---------|-------------|-----------------|
| `/scrape "Extract X from URL"` | Scrapling adaptive parsing | `@web-scraper-engineer`, `@data-engineer` |
| `/firecrawl "Find X"` | Firecrawl AI extraction | `@firecrawl-engineer`, `@full-stack-ai-engineer` |
| `/scraping "Build crawler"` | Scrapy production crawling | `@scrapy-engineer`, `@data-engineer` |

### Core Commands

| Command | Description |
|---------|-------------|
| `/plan "Feature"` | Create implementation plan |
| `/tdd "Feature"` | Test-driven development |
| `/code-review` | Code quality review |
| `/security-scan` | Security vulnerability scan |
| `/build-fix` | Build troubleshooting |
| `/e2e` | E2E test creation |
| `/refactor` | Code cleanup |
| `/verify` | Pre-commit checks |
| `/docs` | Documentation research |
| `/paper2code "Paper"` | Generate code from ML papers |
| `/specify "Build X"` | Define WHAT and WHY |
| `/sdd-plan "Build X"` | Define HOW (technical) |
| `/tasks "Build X"` | Break into actionable tasks |
| `/implement "Build X --task T-001"` | Implement task by task |

---

## 🛠️ Skills (16 Total)

### Scraping Skills

| Skill | Type | Purpose |
|-------|------|---------|
| `scrapling-workflow` | Workflow | Scrapling implementation guide (6 phases) |
| `firecrawl-workflow` | Workflow | Firecrawl endpoints, async polling, schemas |
| `scrapy-workflow` | Workflow | Scrapy spiders, middleware, pipelines, deploy |
| `scraping-framework-selector` | Guide | Decision matrix: which framework when |
| `scrapling.py` | Executable | CLI: init, fetch, crawl, test, status |
| `scrapling.skill.json` | Manifest | Scrapling tool metadata |
| `firecrawl.py` | Executable | CLI: init, scrape, crawl, agent, search, map |
| `firecrawl.skill.json` | Manifest | Firecrawl tool metadata |
| `scrapy.py` | Executable | CLI: init, spider, run, test, status |
| `scrapy.skill.json` | Manifest | Scrapy tool metadata |
| `scrapling_monitoring.py` | Monitoring | Metrics, drift detection, alerts (Scrapling) |
| `scraping_monitoring_extra.py` | Monitoring | Firecrawl API + Scrapy crawl metrics |
| `scraping_data_quality.py` | Quality | Unified validation across all 3 frameworks |
| `scraping_unified_dashboard.json` | Dashboard | Grafana dashboard for all 3 frameworks |

### AI Engineering Skills

| Skill | Type | Purpose |
|-------|------|---------|
| `harness-engineering` | Framework | Pull Risk Forward, Safeguard Generated Code, Level 3 Production |
| `parallel-execution` | Pattern | Concurrent subagent execution, 5 orchestration patterns |
| `delegation-orchestrator` | Pattern | Topological agent delegation with lineage tracking |
| `context-management` | Guide | Auto-snipping, reactive compaction, memory preservation |
| `worktree-isolation` | Guide | Git worktree management for parallel agent isolation |
| `workflow-registry` | Registry | Reusable workflow patterns with execution history |
| `entropy-manager.py` | Tool | Dead code, doc drift, constraint violations, dependency audit |
| `ai-review` | Workflow | Multi-model cross-checking, AI-on-AI review |

---

## 🔌 Plugins (3 Available)

| Plugin | Purpose | Lifecycle Hook |
|--------|---------|----------------|
| `auto-test` | Run tests after every code generation | `afterTurn` |
| `commit-every-task` | Auto-commit after each completed task | `afterTurn` |
| `doc-sync` | Flag outdated documentation after code changes | `afterTurn` |

---

## 📋 Policy Runtime

| Component | Purpose |
|-----------|---------|
| `policy.json` | Declarative policy: tool access, budgets, file paths, env vars, trust |
| `policy-enforcer.js` | Hook that enforces policies before tool execution |
| `audit-trail.json` | Immutable log of all tool calls with decisions |

---

## 🔌 MCP Servers (13 Configured)

| Server | Status | Purpose | Tools Provided |
|--------|--------|---------|----------------|
| **context7** | ✅ Enabled | Live library docs | `resolve-library-id`, `get-library-docs` |
| **playwright** | ✅ Enabled | Browser automation | `navigate`, `click`, `type`, `screenshot`, `evaluate` |
| **sequential-thinking** | ✅ Enabled | Structured reasoning | `sequentialthinking` |
| **filesystem** | ✅ Enabled | File access beyond cwd | `read_file`, `write_file`, `list_directory` |
| **brave-search** | ⏸️ Disabled | Web search | `brave_web_search`, `brave_news_search` |
| **firecrawl** | ⏸️ Disabled | AI scraping | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_crawl`, `firecrawl_agent` |
| **github** | ⏸️ Disabled | GitHub integration | `create_issue`, `create_pr`, `list_repos`, `get_file_contents` |
| **sentry** | ⏸️ Disabled | Error monitoring | `list_errors`, `get_stack_trace`, `get_breadcrumbs`, `correlate_release` |
| **docker** | ⏸️ Disabled | Container management | `list_containers`, `get_logs`, `exec`, `list_images` |
| **postgres** | ⏸️ Disabled | Database queries | `query`, `list_tables`, `describe_table`, `schema_inspect` |
| **linear** | ⏸️ Disabled | Issue tracking | `create_issue`, `update_issue`, `search_issues`, `list_cycles` |
| **sonarcloud** | ⏸️ Disabled | Code quality | `get_quality_gate`, `list_violations`, `get_coverage`, `get_security_hotspots` |

### Enabling Disabled MCP Servers

1. Set environment variable (if required):
   ```bash
   set BRAVE_API_KEY=your-key
   set FIRECRAWL_API_KEY=your-key
   set GITHUB_TOKEN=your-token
   set SENTRY_AUTH_TOKEN=your-token
   set DATABASE_URL=postgresql://...
   set LINEAR_API_KEY=your-key
   set SONAR_TOKEN=your-token
   ```

2. Edit `.qwen/settings.json` and set `"disabled": false` for the server

3. Restart Qwen Code

---

## 🪝 Lifecycle Hooks (7 Configured)

| Event | Trigger | Hook Script | Purpose |
|-------|---------|-------------|---------|
| `PreToolUse` | Before bash command | `security-check.js` | Block dangerous commands (rm -rf, sudo, etc.) |
| `PostToolUse` | After write_file/edit | `auto-lint.js` | Auto-lint written files (Python/TS/JS/JSON) |
| `PostToolUseFailure` | After tool failure | `error-analyzer.js` | Categorize errors, suggest fixes |
| `PreCompact` | Before compression | `pre-compact-memory.js` | Remind to save decisions to memory |
| `SessionEnd` | Session ends | `session-summary.js` | Generate session summary report |
| `SubagentStart` | Agent invoked | `agent-log.js` | Log which agent is doing what (audit trail) |
| `UserPromptSubmit` | Before AI processes prompt | `code-health-check.js` | Assess code health before AI work (Pull Risk Forward) |

### Hook Output Schema

Hooks receive JSON via stdin and return JSON via stdout:
```json
{
  "decision": "allow|block|warn",
  "hookSpecificOutput": {
    "permissionDecision": "allow|deny",
    "permissionDecisionReason": "Reason string",
    "additionalContext": "Context to inject"
  }
}
```

Exit codes: `0` = success, `1` = non-blocking warning, `2` = blocking error

---

## 📜 Utility Scripts (22 Total)

### Existing Scripts

| Script | Purpose |
|--------|---------|
| `verify-coverage.js` | Check test coverage meets threshold |
| `find-debug-statements.js` | Find console.log/debugger statements |
| `security-scan.js` | Scan for hardcoded secrets |
| `check-complexity.js` | Check code complexity metrics |
| `review-summary.js` | Generate change summary for review |
| `dead-code.js` | Find unused imports, dead code |
| `dependency-audit.js` | Audit dependencies for issues |
| `import-sort.js` | Verify imports are sorted |
| `pre-commit.js` | Pre-commit hook runner |
| `type-check.js` | Run type checking |
| `sdd-status.js` | Check SDD phase status |
| `validate-sdd-phase.js` | Validate SDD phase completion |
| `config.json` | Script configuration |
| `README.md` | Scripts documentation |

### New Hook Scripts

| Script | Event | Purpose |
|--------|-------|---------|
| `security-check.js` | PreToolUse (bash) | Block dangerous commands |
| `auto-lint.js` | PostToolUse (write/edit) | Auto-lint written files |
| `error-analyzer.js` | PostToolUseFailure | Categorize errors, suggest fixes |
| `pre-compact-memory.js` | PreCompact | Remind to save to memory |
| `session-summary.js` | SessionEnd | Generate session summary |
| `agent-log.js` | SubagentStart | Log agent invocations |
| `code-health-check.js` | UserPromptSubmit | Assess code health before AI work (Pull Risk Forward) |
| `policy-enforcer.js` | PreToolUse | Enforce declarative policy (tools, budgets, paths, env vars) |
| `worktree-manager.js` | Manual | Create/manage/cleanup git worktrees for agent isolation |

---

## 📁 File Locations

| Component | Path |
|-----------|------|
| **Agents** | `C:\Users\amazon\.qwen\agents\` |
| **Skills** | `C:\Users\amazon\.qwen\skills\` |
| **Commands** | `C:\Users\amazon\.qwen\commands\` |
| **Scripts** | `C:\Users\amazon\.qwen\scripts\` |
| **Templates** | `C:\Users\amazon\.qwen\templates\` |
| **Settings** | `C:\Users\amazon\.qwen\settings.json` |
| **Global Memory** | `C:\Users\amazon\.qwen\memory-global.md` |
| **Project Memory** | `C:\Users\amazon\.qwen\memory-project.md` |
| **Session Summaries** | `C:\Users\amazon\.qwen\session-summaries\` |
| **Agent Audit Log** | `C:\Users\amazon\.qwen\agent-audit.log` |
| **Policy File** | `C:\Users\amazon\.qwen\policy.json` |
| **PARITY.md** | `C:\Users\amazon\.qwen\PARITY.md` |
| **PHILOSOPHY.md** | `C:\Users\amazon\.qwen\PHILOSOPHY.md` |
| **Containerfile** | `C:\Users\amazon\.qwen\Containerfile` |
| **Container Docs** | `C:\Users\amazon\.qwen\docs\container-usage.md` |
| **Audit Trail** | `C:\Users\amazon\.qwen\audit-trail.json` |
| **File Journal** | `C:\Users\amazon\.qwen\file-journal.json` |
| **Workflow History** | `C:\Users\amazon\.qwen\workflow-history.json` |
| **Parity Tests** | `C:\Users\amazon\.qwen\tests\parity-runner.js` |
| **Plugins** | `C:\Users\amazon\.qwen\plugins\` |
| **Workflows** | `C:\Users\amazon\.qwen\workflows\` |
| **Tools Registry** | `C:\Users\amazon\.qwen\TOOLS.md` |
| **DevEx Guide** | `C:\Users\amazon\.qwen\DEVX.md` |
| **Source (Kandil)** | `K:\skills\` |

---

## 🔄 Orchestration Patterns

### Pattern 1: Complex Project
```
@orchestrator-tech-lead coordinates:
  Phase 1: Requirements → Architecture → Task breakdown
  Phase 2-N: Specialized agents per task
  Final: Code review → Security scan → Deployment
```

### Pattern 2: Single Task
```
@agent-name "Specific task description"
→ Direct execution → Self-review → Done
```

### Pattern 3: Web Scraping Pipeline
```
1. @web-scraper-engineer → Build scraper (/scrape)
2. @data-engineer → Build ingestion pipeline
3. @data-governance-engineer → Compliance review
4. @api-engineer → Expose data via API (optional)
5. @dev-ops-platform-engineer → Deploy with Docker
6. @observability-engineer → Add monitoring
```

### Pattern 4: AI-on-AI Review
```
1. Generate: @software-engineer "Build X"
2. Review: @code-reviewer "Review this"
3. Security: @security-compliance-engineer "Audit this"
4. Fix: @software-engineer "Fix [list of issues]"
5. Verify: @code-reviewer "Re-review"
```

### Pattern 5: Spec-Driven Development
```
/specify → /sdd-plan → /tasks → /implement (task by task)
```

---

## 📊 Quality Standards

| Metric | Target |
|--------|--------|
| Test Coverage | ≥ 80% |
| Function Size | < 50 lines |
| File Size | < 800 lines |
| Nesting Depth | ≤ 4 levels |
| Security Issues (Critical) | 0 |
| Lint/Type Errors | 0 |

---

## 🚀 Quick Start Checklist

- [ ] Read `memory-global.md` for environment setup
- [ ] Read `memory-project.md` for project context
- [ ] Check available agents: `@orchestrator-tech-lead` for planning
- [ ] Choose the right scraping command for your task
- [ ] Enable MCP servers you need (context7, playwright enabled by default)
- [ ] Hooks are active (security check, auto-lint, error analysis)
- [ ] Use `/memory add` to persist important decisions
- [ ] Run `/compress` when context gets large
- [ ] Use `/stats` to monitor token usage

---

**Total**: 53 Agents | 5 Commands | 20 Skills | 13 MCP Servers | 8 Hooks | 24 Scripts | 3 Plugins | 5 Workflows | 10 Parity Tests
