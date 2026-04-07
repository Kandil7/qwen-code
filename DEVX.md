# Developer Experience Guide

## Approval Modes

Qwen Code supports four approval modes that control how cautiously the AI operates.

### Mode Comparison

| Mode | Safety | Speed | Best For |
|------|--------|-------|----------|
| `plan` | Maximum | Slowest | Code review, architecture planning, sensitive repos |
| `default` | Balanced | Normal | General development (recommended default) |
| `auto-edit` | Moderate | Fast | Refactoring, code generation, trusted projects |
| `yolo` | Minimal | Fastest | Trusted environments, automation scripts, throwaway code |

### Quick Switch

- **Press `Shift+Tab`** to cycle through approval modes without typing
- **Type `/`** then `Tab` for fuzzy command completion
- **Use `↑/↓`** for command history navigation

### When to Use Each

```
plan        → Reviewing production code, security-sensitive changes
default     → Day-to-day development, balanced safety/speed
auto-edit   → Bulk refactoring, generated code, test writing
yolo        → Personal scripts, prototypes, already-reviewed code
```

---

## Context Management

### The Problem
AI conversations consume tokens. Long sessions approach context limits, causing slowdowns and degraded quality.

### The Solution: `/compress` + `/memory`

```
1. When context gets large → Run: /compress
   This summarizes older messages, freeing token budget.

2. Before compressing → Run: /memory add "Key decision: chose JWT over sessions because..."
   This preserves critical facts that would otherwise be lost.

3. After compressing → Continue working normally.
   Memory is loaded at session start, preserving context.
```

### Context Budget Guidelines

| Metric | Guideline |
|--------|-----------|
| Keep prompts under | 80% of context window |
| Compress when lag starts | Don't wait for hard limits |
| Save before compress | Always `/memory add` first |
| Compression is lossy | Summaries omit details |

---

## Session Management

### Commands

| Command | Purpose |
|---------|---------|
| `/clear` | Start fresh session (clears conversation) |
| `/resume` | Continue a previous session |
| `/compress` | Summarize older messages to free tokens |
| `/memory add "fact"` | Persist a fact globally or per-project |
| `/export` | Save session to markdown/HTML/JSON/JSONL |
| `/stats` | View token usage, message count, context stats |

### Session Export Formats

| Format | Use For |
|--------|---------|
| Markdown | Reading, sharing, documentation |
| HTML | Rich viewing, presentations |
| JSON | Programmatic processing, knowledge bases |
| JSONL | Streaming, large session analysis |

### Best Practices

1. **Export important sessions** → `/export format:json` for knowledge retention
2. **Save architecture decisions** → `/memory add "We chose X because Y"`
3. **Compress proactively** → Don't wait for slowdowns
4. **Use descriptive prompts** → Clear prompts produce better outputs
5. **Commit after each task** → Use commits as "save points"

---

## Productivity Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift+Tab` | Cycle approval modes |
| `Tab` after `/` | Fuzzy command completion |
| `↑/↓` | Command history navigation |
| `/help` | Show all available commands |
| `/stats` | Quick context/token stats |

---

## Workflow Patterns

### 1. Plan → Implement → Review
```
/plan "Feature description"        # Create implementation plan
# Review and adjust plan
# Agent implements per plan
@code-reviewer "Review the changes" # Immediate quality check
```

### 2. Test-Driven Development
```
/tdd "Feature description"         # Write tests first
# Agent writes failing tests
# Agent implements to pass tests
npm test                           # Verify all pass
```

### 3. Spec-Driven Development
```
/specify "Build X"                 # Define what and why
/sdd-plan "Build X"                # Define how (technical)
/tasks "Build X"                   # Break into tasks
/implement "Build X --task T-001"  # Implement task by task
```

### 4. AI-on-AI Review
```
# Phase 1: Generate
@software-engineer "Build X"

# Phase 2: Cross-review
@code-reviewer "Review this code"
@security-compliance-engineer "Audit for vulnerabilities"

# Phase 3: Fix
@software-engineer "Fix these issues: [list]"

# Phase 4: Verify
@code-reviewer "Re-review the fixed version"
```

### 5. Context Preservation
```
# Before long session
/memory add "Project uses Python 3.10+, FastAPI, PostgreSQL"

# When context gets large
/compress

# Continue working with memory intact
```

---

**Related**: [TOOLS.md](TOOLS.md) for complete tool catalog
**Related**: [AGENTS.md](AGENTS.md) for agent configuration
