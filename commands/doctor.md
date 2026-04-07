---
description: Comprehensive system health diagnostics. Tests MCP connectivity, hook execution, agent invocation, tool functionality, policy enforcement, and dependency availability.
agents: ["dev-ops-platform-engineer", "observability-engineer"]
---

# /doctor - System Health Diagnostics

## Usage

```
/doctor
/doctor --verbose
/doctor --quick
```

## What Happens

1. **Check MCP Servers** — Test connectivity to each configured MCP server
2. **Check Hooks** — Verify all hook scripts exist and are executable
3. **Check Agents** — Verify agent files, count, and registration
4. **Check Tools** — Test basic tool functionality (read/write/search)
5. **Check Policies** — Verify policy file and enforcement
6. **Check Dependencies** — Python packages, Node.js modules, system tools
7. **Check System** — Disk space, memory, network, Git
8. **Generate Report** — Summary with pass/fail/warning per check

## Health Check Categories

### Critical (Must Pass)
- [ ] All hook scripts exist and are valid JavaScript
- [ ] Policy file exists and is valid JSON
- [ ] Core agents files exist
- [ ] Core commands files exist
- [ ] Core skills files exist
- [ ] Node.js is available
- [ ] Python 3.10+ is available

### Important (Should Pass)
- [ ] MCP servers are reachable (enabled ones)
- [ ] Git is available and working directory is a repo
- [ ] Policy enforcer hook is configured
- [ ] Code health check hook is configured
- [ ] Audit trail file exists and is writable
- [ ] Session summaries directory exists

### Optional (Nice to Have)
- [ ] Scrapling is installed
- [ ] Scrapy is installed
- [ ] Firecrawl is installed
- [ ] Pydantic is installed
- [ ] Docker is available
- [ ] Sufficient disk space (> 1GB free)

## Output Format

```
🔧 Qwen Code Health Diagnostics
================================

✅ CRITICAL (7/7 passed)
  ✓ Hook scripts (8/8 valid)
  ✓ Policy file (valid JSON)
  ✓ Agent files (56 present)
  ✓ Command files (20 present)
  ✓ Skill files (20 present)
  ✓ Node.js (v20.x available)
  ✓ Python (3.11 available)

⚠️  IMPORTANT (5/6 passed)
  ✓ MCP: context7 (reachable)
  ✓ MCP: playwright (reachable)
  ✗ MCP: firecrawl (connection failed)
  ✓ MCP: filesystem (reachable)
  ✓ Git (working directory)
  ✓ Audit trail (writable)

ℹ️  OPTIONAL (4/7 available)
  ✗ scrapling (not installed)
  ✗ scrapy (not installed)
  ✗ firecrawl-py (not installed)
  ✓ pydantic (installed)
  ✗ docker (not available)
  ✓ disk space (50GB free)
  ✓ network (connected)

================================
Summary: 16/20 checks passed (80%)
Critical: 7/7 ✅
Important: 5/6 ⚠️
Optional: 4/7 ℹ️

Issues to address:
  - MCP firecrawl: Check FIRECRAWL_API_KEY is set
  - scrapling/scrapy/firecrawl-py: pip install if needed
  - docker: Install Docker Desktop for container isolation
```

## Running Diagnostics

```bash
# Quick check (critical only)
node .qwen/scripts/validate-setup.js

# Full diagnostics
/doctor

# Verbose (show all individual checks)
/doctor --verbose
```

## Related Commands

- `/stats` — Token usage and context statistics
- `/verify` — Pre-commit checks
- `/security-scan` — Security vulnerability scan
