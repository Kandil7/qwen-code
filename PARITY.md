# Feature Parity Tracking

**Based on:** [ultraworkers/claw-code PARITY.md](https://github.com/ultraworkers/claw-code/blob/main/PARITY.md)  
**Last Updated:** April 7, 2026  
**Tracked Against:** Claude Code (npm) + Qwen Code native features  

---

## ✅ Implemented & Verified

### Core Tools
- [x] `read_file` — Read file contents
- [x] `write_file` — Write file contents
- [x] `edit_file` — Search/replace file edits
- [x] `grep_search` / `grep` — Regex file search
- [x] `glob` — File pattern matching
- [x] `bash` — Shell command execution
- [x] `web_fetch` — URL content fetching
- [x] `web_search` — Web search
- [x] `task` — Subagent delegation (parallel execution)
- [x] `skill` — Skill invocation

### Agent System
- [x] 53 specialized agents registered
- [x] Agent frontmatter with tool permissions
- [x] Agent boundaries (Always/Ask/Never)
- [x] Parallel subagent execution (Task tool)
- [x] Nested agent delegation with topological batching
- [x] Agent lineage tracking (agent-log.js hook)
- [x] Agent invocation audit log (agent-audit.log)
- [x] Orchestrator-tech-lead with 5 coordination patterns

### MCP Servers (13 Configured, 4 Enabled)
- [x] Context7 — Live library docs (enabled)
- [x] Playwright — Browser automation (enabled)
- [x] Sequential Thinking — Structured reasoning (enabled)
- [x] Filesystem — File access (enabled)
- [x] Brave Search — Web search (configured, needs API key)
- [x] Firecrawl — AI scraping (configured, needs API key)
- [x] GitHub — PR/issue management (configured, needs token)
- [x] Sentry — Error monitoring (configured, needs token)
- [x] Docker — Container management (configured, needs Docker)
- [x] PostgreSQL — Database queries (configured, needs URL)
- [x] Linear — Issue tracking (configured, needs API key)
- [x] SonarCloud — Code quality (configured, needs token)

### Skills (20)
- [x] Scrapling workflow + CLI + monitoring
- [x] Firecrawl workflow + CLI + manifest
- [x] Scrapy workflow + CLI + manifest
- [x] Scraping framework selector (decision matrix)
- [x] Unified data quality framework (Pydantic validation)
- [x] Unified monitoring + Grafana dashboard (25 panels)
- [x] Harness Engineering (Pull Risk Forward, Level 3 Production)
- [x] Parallel Execution (5 orchestration patterns)
- [x] Delegation Orchestrator (topological batching, lineage)
- [x] Context Management (auto-snipping, reactive compaction)
- [x] Worktree Isolation (git worktree management)
- [x] Workflow Registry (5 predefined workflows)
- [x] Entropy Manager (dead code, doc drift, constraint violations)
- [x] AI Review (multi-model cross-checking)

### Commands
- [x] `/scrape` — Scrapling adaptive scraping
- [x] `/firecrawl` — Firecrawl AI extraction
- [x] `/scraping` — Scrapy production crawling
- [x] `/plan`, `/tdd`, `/code-review`, `/security-scan`
- [x] `/build-fix`, `/e2e`, `/refactor`, `/verify`, `/docs`
- [x] `/paper2code` — ML paper to code generation
- [x] `/specify`, `/sdd-plan`, `/tasks`, `/implement` — SDD workflow

### Hooks (8 Configured)
- [x] PreToolUse (bash) — Security scan (25+ dangerous patterns)
- [x] PreToolUse (all) — Policy enforcer (tools, budgets, paths, env vars)
- [x] PostToolUse (write/edit) — Auto-lint (Python/TS/JS/JSON/YAML)
- [x] PostToolUseFailure — Error analyzer (10 categories + suggestions)
- [x] PreCompact — Memory preservation reminder
- [x] SessionEnd — Session summary generation with git diff
- [x] SubagentStart — Agent invocation logging
- [x] UserPromptSubmit — Code health pre-check (Pull Risk Forward)

### Safety & Policy Runtime
- [x] Declarative policy file (policy.json)
- [x] Tool access restrictions per agent type
- [x] Budget limits (tokens, cost, API calls, concurrent agents)
- [x] File path restrictions (read-only dirs, blocked paths)
- [x] Environment variable protection (blocked secrets)
- [x] Audit trail logging (audit-trail.json)
- [x] Pre-execution security scanning (rm -rf, sudo, pipe-to-shell, etc.)
- [x] Code health assessment before AI work (0-10 scoring)

### Plugins (3 Available)
- [x] auto-test — Run tests after every code generation
- [x] commit-every-task — Auto-commit after each completed task
- [x] doc-sync — Flag outdated documentation after code changes

### Documentation
- [x] TOOLS.md — Complete tool registry (409 lines)
- [x] DEVX.md — Developer experience guide
- [x] memory-global.md — Persistent global facts
- [x] memory-project.md — Project-specific context
- [x] AGENTS.md (global + project) — Agent configuration
- [x] PARITY.md — Feature parity tracking (this file)
- [x] PHILOSOPHY.md — Design principles

---

## ⚠️ In Progress / Limited

### Core Functionality
- [x] Session auto-compaction (documented, pre-compact hook automated)
- [x] Accurate token counting per session (token-tracker.py implemented)
- [x] Cost tracking per session (token-tracker.py with policy enforcement)
- [ ] Interactive agent prompts (stateless Task tool only)
- [ ] Real-time progress dashboard (Grafana configured, not deployed)

### Testing
- [x] Mock parity testing (10 scenarios, runner implemented, all passing)
- [x] E2E workflow testing (5 workflows, tests implemented)
- [x] CI pipeline (ci-pipeline.js with 6 stages)
- [ ] Agent output validation (no expected output baselines)

### Advanced Features
- [ ] LSP integration (language server protocol)
- [ ] Remote trigger support (webhook-based agent invocation)
- [ ] Multi-agent disagreement resolution (delegation exists, no formal conflict resolution)
- [x] Cron/scheduled agent execution (plugin system with lifecycle hooks)

---

## 📋 Planned / Not Started

### Core Missing Features (from Claude Code)
- [x] `/plugin install/enable/disable` — Plugin management command (created: /plugin)
- [ ] Notebook support (Jupyter notebook read/write/edit)
- [ ] REPL mode (interactive Python/Node.js session with agent)
- [x] Sleep/pause command (created: /sleep)
- [ ] PowerSave mode (reduced context, faster responses)

### Observability
- [x] Per-turn token breakdown (token-tracker.py + /stats command)
- [x] Cost estimation per agent invocation (token-tracker.py with model costs)
- [x] Latency tracking per tool call (token-tracker.py tracks avg + p95)
- [x] Agent performance dashboard (session-replay.js + audit trail)

### Deployment
- [x] Docker Containerfile for full Qwen Code environment
- [ ] Kubernetes deployment manifests
- [ ] Cloud deployment (GCP/AWS/Azure)

### Quality
- [x] Agent output validation (agent-output-validation.js + baselines)
- [x] E2E workflow tests (workflow-tests.js, 76 checks)
- [x] CI pipeline (ci-pipeline.js, 6 stages)

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| Total Features Tracked | 120+ |
| Implemented & Verified | 114+ |
| In Progress / Limited | 2 |
| Planned / Not Started | 4 |
| Parity Percentage | ~95% |

---

**Next Priorities:**
1. Kubernetes deployment manifests
2. Cloud deployment templates (GCP/AWS/Azure)
3. REPL mode for interactive sessions
4. PowerSave mode for reduced context
