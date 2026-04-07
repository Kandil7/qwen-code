# How to Actually Use ECC (Everything Claude Code)

Practical, real-world usage guide based on 10+ months of daily use.

---

## 🎯 The Core Idea

ECC is a **performance optimization system for AI coding agents**. It provides:

1. **Agents** - Specialized sub-agents for different tasks
2. **Skills** - Reusable workflow definitions
3. **Commands** - Slash shortcuts to execute skills
4. **Hooks** - Automatic triggers on events
5. **Rules** - Always-follow guidelines
6. **MCPs** - External service connections

---

## 🚀 Daily Workflow (What I Actually Use)

### Morning: Start a Feature

```bash
# 1. Plan the feature
/plan "Add user authentication with OAuth2"

# Claude creates a detailed plan, then WAITS for confirmation
# Review the plan, then type "yes" or "modify: change X to Y"

# 2. Implement with TDD (after confirming plan)
/tdd "Implement login endpoint"

# Claude writes tests FIRST (RED phase)
# You review, then it implements (GREEN phase)
# Then refactors (IMPROVE phase)
# Finally verifies 80%+ coverage (VERIFY phase)
```

### Mid-Day: Code Review

```bash
# After implementing a feature
/code-review

# Gets a detailed report:
# - Security issues (CRITICAL blocks merge)
# - Code quality issues
# - Best practice suggestions
# - Verdict: APPROVE / APPROVE WITH CHANGES / REQUEST CHANGES
```

### Before Commit: Verification

```bash
# Run the verification loop
/verify

# Checks:
# ✅ No console.log statements
# ✅ No hardcoded secrets
# ✅ Tests passing
# ✅ Coverage >= 80%
# ✅ Functions < 50 lines
# ✅ Files < 800 lines

# Or run scripts directly:
node .qwen/scripts/find-debug-statements.js
node .qwen/scripts/security-scan.js
node .qwen/scripts/verify-coverage.js
```

### Pre-Production: Security Audit

```bash
# Full security scan
/security-scan

# Checks OWASP Top 10:
# - SQL injection
# - XSS vulnerabilities
# - Hardcoded secrets
# - Authentication gaps
# - Rate limiting
```

---

## 📋 Command Cheat Sheet (The 20% You Use 80%)

### Core Commands (Daily)

| Command | When | Example |
|---------|------|---------|
| `/plan` | Starting anything complex | `/plan "Add password reset"` |
| `/tdd` | Writing code | `/tdd "Create user service"` |
| `/code-review` | Before commit | `/code-review` |
| `/verify` | Pre-commit | `/verify` |
| `/build-fix` | Build broken | `/build-fix` |

### Weekly Commands

| Command | When | Example |
|---------|------|---------|
| `/security-scan` | Before deploy | `/security-scan` |
| `/e2e` | Critical flows | `/e2e "Checkout flow"` |
| `/refactor` | Code cleanup | `/refactor "Clean auth module"` |
| `/docs` | Need API docs | `/docs "Research Stripe API"` |

### Rare but Useful

| Command | When | Example |
|---------|------|---------|
| `/checkpoint` | Save state | `/checkpoint` |
| `/learn` | Extract patterns | `/learn` |
| `/eval` | Evaluate criteria | `/eval` |
| `/test-coverage` | Coverage gaps | `/test-coverage` |

---

## 🤖 Agent Usage (When to Delegate)

### Automatically Delegated (No Prompt Needed)

The main agent should proactively use these:

| Situation | Agent Used |
|-----------|------------|
| Complex feature request | `planner` |
| Code just written | `code-reviewer` |
| Bug fix or new feature | `tdd-guide` |
| Architecture decision | `architect` |
| Security-sensitive code | `security-reviewer` |
| Build fails | `build-error-resolver` |
| E2E tests needed | `e2e-runner` |
| Dead code cleanup | `refactor-cleaner` |

### Manually Triggered (Via Commands)

| Command | Agent |
|---------|-------|
| `/plan` | `planner` |
| `/tdd` | `tdd-guide` |
| `/code-review` | `code-reviewer` + `security-reviewer` |
| `/build-fix` | `build-error-resolver` |
| `/e2e` | `e2e-runner` |

---

## 🧠 Skills (Workflow Definitions)

### Core Skills You'll Use

| Skill | File | Purpose |
|-------|------|---------|
| `tdd-workflow` | `skills/tdd-workflow/` | Test-driven development |
| `security-review` | `skills/security-review/` | Security checklist |
| `coding-standards` | `skills/coding-standards/` | Universal standards |
| `backend-patterns` | `skills/backend-patterns/` | API, DB, caching |
| `frontend-patterns` | `skills/frontend-patterns/` | React, Next.js |
| `e2e-testing` | `skills/e2e-testing/` | Playwright patterns |
| `api-design` | `skills/api-design/` | REST design patterns |
| `verification-loop` | `skills/verification-loop/` | Pre-commit checks |

### How Skills Work

Skills are markdown files that define workflows. They're triggered by:

1. **Commands** - `/tdd` triggers `tdd-workflow` skill
2. **Agent delegation** - `tdd-guide` agent uses `tdd-workflow` skill
3. **Manual reference** - `skill: tdd-workflow` in prompts

---

## 🔗 Hooks (Automatic Triggers)

### Hook Types

| Hook | Fires When | Example Use |
|------|------------|-------------|
| `PreToolUse` | Before tool executes | Validate before shell command |
| `PostToolUse` | After tool finishes | Format output, add feedback |
| `UserPromptSubmit` | When you send message | Add context, reminders |
| `Stop` | When Claude finishes | Save session, summarize |
| `PreCompact` | Before context compaction | Save important context |

### Example: tmux Reminder Hook

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && command matches \"(npm|pnpm|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux' >&2; fi"
        }
      ]
    }
  ]
}
```

### Creating Hooks

Use the `hookify` plugin to create hooks conversationally:

```bash
/hookify "Remind me to run tests before committing"
```

---

## 📁 File Organization

### ECC Structure

```
everything-claude-code/
├── agents/           # 28 specialized sub-agents
├── skills/           # 119 workflow skills
├── commands/         # 60 slash commands
├── hooks/            # Trigger automations
├── rules/            # Always-follow guidelines
├── mcp-configs/      # 14 MCP server configs
└── scripts/          # Node.js utilities
```

### Installed Structure (Qwen Code)

```
~/.qwen/
├── agents/           # Agent definitions
├── skills/           # Workflow skills
├── commands/         # Command definitions
├── scripts/          # Utility scripts
├── rules/            # Language rules
└── templates/        # Project templates
```

### Project Root

```
project-root/
├── AGENTS.md         # Project-specific agent instructions
├── src/
├── tests/
└── .qwen/            # Project-specific Qwen config
```

---

## 🎯 Real-World Scenarios

### Scenario 1: New Feature from Scratch

```bash
# Step 1: Plan
/plan "Add user profile page with avatar upload"

# Review plan:
# - Database schema changes
# - API endpoints needed
# - Frontend components
# - Security considerations

# Type "yes" to confirm

# Step 2: Database (TDD)
/tdd "Create user_profiles table migration"

# Step 3: Backend API (TDD)
/tdd "Create GET /api/users/:id/profile"
/tdd "Create PUT /api/users/:id/profile"
/tdd "Create POST /api/users/:id/avatar"

# Step 4: Frontend (TDD)
/tdd "Create ProfilePage component"
/tdd "Create AvatarUpload component"

# Step 5: Review
/code-review

# Step 6: Security
/security-scan

# Step 7: Verify
/verify

# Step 8: Commit
git commit -m "feat: add user profile with avatar upload"
```

### Scenario 2: Bug Fix

```bash
# Step 1: Reproduce and understand
# Describe the bug to Claude

# Step 2: Write regression test (TDD)
/tdd "Fix: Login fails with valid credentials"

# Claude writes test that reproduces the bug (RED)
# Then implements fix (GREEN)
# Then refactors (IMPROVE)

# Step 3: Review
/code-review

# Step 4: Verify
/verify

# Step 5: Commit
git commit -m "fix: resolve login authentication race condition"
```

### Scenario 3: Code Cleanup

```bash
# Step 1: Refactor
/refactor "Clean up user service - extract validation logic"

# Step 2: Check complexity
node .qwen/scripts/check-complexity.js

# Step 3: Review
/code-review

# Step 4: Verify tests still pass
/verify

# Step 5: Commit
git commit -m "refactor: extract user validation logic"
```

### Scenario 4: Pre-Release Audit

```bash
# Step 1: Security scan
/security-scan

# Fix any CRITICAL or HIGH issues

# Step 2: E2E tests for critical flows
/e2e "Test login flow"
/e2e "Test checkout flow"
/e2e "Test password reset flow"

# Step 3: Coverage check
node .qwen/scripts/verify-coverage.js

# Step 4: Review summary
node .qwen/scripts/review-summary.js

# Step 5: Final verification
/verify
```

---

## ⚡ Power User Tips

### 1. Chain Commands

```bash
# After implementing a feature:
/code-review && /security-scan && /verify
```

### 2. Use tmux for Long Operations

```bash
tmux new -s dev
# Now Claude can run long commands and you can detach/reattach
```

### 3. Parallel Workflows with Git Worktrees

```bash
# Main work
git worktree add ../feature-a feature-a

# Parallel work
git worktree add ../feature-b feature-b

# Run separate Claude instances in each
```

### 4. Model Selection

```bash
# For most tasks (cost-effective)
/model sonnet

# For complex architecture (deep reasoning)
/model opus
```

### 5. Context Management

```bash
# Between unrelated tasks
/clear

# At logical breakpoints
/compact

# Check context usage
/statusline
```

### 6. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Delete entire line |
| `!` | Quick bash prefix |
| `@` | Search files |
| `/` | Slash commands |
| `Shift+Enter` | Multi-line input |
| `Tab` | Toggle thinking display |
| `Esc Esc` | Interrupt Claude |

---

## 🔧 Configuration

### Token Optimization (settings.json)

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "50"
  }
}
```

| Setting | Default | Recommended | Savings |
|---------|---------|-------------|---------|
| `model` | opus | sonnet | ~60% cost |
| `MAX_THINKING_TOKENS` | 31999 | 10000 | ~70% thinking |
| `CLAUDE_AUTOCOMPACT_PCT` | 95 | 50 | Earlier compact |

### MCP Management

```bash
# Check enabled MCPs
/mcp

# Rule: Keep under 10 MCPs enabled
# Each MCP reduces context window by ~2k tokens
```

---

## 📊 Quality Standards (Always Enforced)

### Code Quality

| Metric | Target |
|--------|--------|
| Function length | < 50 lines |
| File length | < 800 lines |
| Nesting depth | < 4 levels |
| Duplication | Minimal (DRY) |

### Testing

| Metric | Target |
|--------|--------|
| Coverage | ≥ 80% |
| Test types | Unit + Integration + E2E |
| Edge cases | Null, empty, boundary |

### Security

| Check | Required |
|-------|----------|
| No hardcoded secrets | ✅ |
| Input validation | ✅ |
| SQL parameterized | ✅ |
| XSS prevention | ✅ |
| Auth checks | ✅ |

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Read `QUICKSTART.md`
- [ ] Use `/plan` for any feature
- [ ] Use `/tdd` for all coding
- [ ] Run `/verify` before commits

### Week 2: Quality
- [ ] Use `/code-review` after coding
- [ ] Run `/security-scan` before merge
- [ ] Read `ECC-INTEGRATION.md`
- [ ] Create project `AGENTS.md`

### Week 3: Advanced
- [ ] Read `COMMANDS-REFERENCE.md`
- [ ] Use `/e2e` for critical flows
- [ ] Run utility scripts
- [ ] Customize workflows

### Week 4: Mastery
- [ ] Read `CONTRIBUTING.md`
- [ ] Create custom skills
- [ ] Add custom commands
- [ ] Contribute back

---

## 📚 Documentation Index

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `QUICKSTART.md` | 5-minute intro |
| `COMMANDS-REFERENCE.md` | All commands explained |
| `ECC-INTEGRATION.md` | Full integration guide |
| `IMPROVEMENT-PLAN.md` | Roadmap |
| `CONTRIBUTING.md` | How to contribute |
| `CHANGELOG.md` | Version history |

---

**Remember:** The goal is not to use every feature, but to use the right features consistently. Start with `/plan`, `/tdd`, `/code-review`, and `/verify`. Add more as needed.
