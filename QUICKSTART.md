# ECC for Qwen Code - Quick Start Guide

Get started with Everything Claude Code (ECC) workflows in Qwen Code in 5 minutes.

---

## 🚀 5-Minute Setup

### Step 1: Know Your Commands

ECC provides text shortcuts you type at the start of any prompt:

| Command | Use When |
|---------|----------|
| `/plan` | Starting a new feature |
| `/tdd` | Writing code with tests first |
| `/code-review` | Reviewing code before commit |
| `/security-scan` | Auditing for vulnerabilities |
| `/build-fix` | Fixing build errors |
| `/verify` | Pre-commit quality checks |

### Step 2: Try Your First Command

```
/plan "Add user authentication with email and password"
```

Qwen Code will create a detailed implementation plan and **wait for your confirmation** before writing any code.

### Step 3: Implement with TDD

```
/tdd "Implement login API with rate limiting"
```

Follows the TDD cycle:
- 🔴 **RED** - Write failing test first
- 🟢 **GREEN** - Implement minimal code to pass
- 🔵 **IMPROVE** - Refactor with confidence
- ✅ **VERIFY** - Check 80%+ coverage

### Step 4: Review Before Commit

```
/code-review
```

Checks for:
- 🔴 Security issues (blockers)
- 🟠 Code quality problems
- 🟡 Best practice violations

### Step 5: Security Scan

```
/security-scan
```

Scans for:
- Hardcoded secrets
- SQL injection risks
- XSS vulnerabilities
- OWASP Top 10 issues

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `.qwen/ECC-INTEGRATION.md` | Full integration guide |
| `.qwen/IMPROVEMENT-PLAN.md` | What to add next |
| `.qwen/HOOKS-SYSTEM.md` | Automation patterns |
| `.qwen/commands/*.md` | Command definitions (6 files) |
| `.qwen/skills/*.md` | Workflow skills (6 files) |
| `.qwen/scripts/*.js` | Utility scripts (3 files) |
| `AGENTS.md` | Project-level instructions |

---

## 🎯 Common Workflows

### New Feature
```
1. /plan "Add password reset functionality"
   → Review plan, type "yes" to confirm

2. /tdd "Implement reset token generation"
   → Tests written first, then implementation

3. /code-review
   → Fix any issues found

4. /security-scan
   → Ensure no vulnerabilities

5. /verify
   → Pre-commit checks pass

6. Commit with message: "feat: add password reset"
```

### Bug Fix
```
1. /tdd "Fix: Login fails with valid credentials"
   → Write regression test first
   → Fix the bug
   → Verify test passes

2. /code-review
   → Ensure fix doesn't break anything

3. /verify
   → Pre-commit checks

4. Commit: "fix: resolve login authentication issue"
```

### Code Health
```
1. /refactor "Clean up user service"
   → Improve naming
   → Extract large functions
   → Remove duplication

2. /code-review
   → Verify improvements

3. /verify
   → Ensure tests still pass

4. Commit: "refactor: improve user service maintainability"
```

---

## 🛠️ Utility Scripts

Run these scripts directly for automated checks:

### Check Test Coverage
```bash
node .qwen/scripts/verify-coverage.js
```

### Find Debug Statements
```bash
node .qwen/scripts/find-debug-statements.js
```

### Security Scan for Secrets
```bash
node .qwen/scripts/security-scan.js
```

---

## 📊 Quality Standards

### Code Quality
- Functions < 50 lines
- Files < 800 lines
- Nesting < 4 levels
- No console.log in production code

### Testing
- Coverage ≥ 80%
- All tests passing
- Edge cases covered
- Error paths tested

### Security
- No hardcoded secrets
- All inputs validated
- SQL uses parameters
- Authentication verified

---

## 🎓 Learning Path

### Day 1: Basics
- Try `/plan` for a small feature
- Use `/tdd` for implementation
- Run `/code-review` before commit

### Day 2: Security
- Run `/security-scan` on your codebase
- Fix any critical issues found
- Use `/verify` for pre-commit checks

### Day 3: Advanced
- Read `ECC-INTEGRATION.md` for full details
- Create project-specific `AGENTS.md`
- Add custom workflows to `.qwen/skills/`

---

## 📚 Reference

### Full Documentation
- **ECC-INTEGRATION.md** - Complete command reference
- **IMPROVEMENT-PLAN.md** - What to add next
- **HOOKS-SYSTEM.md** - Automation patterns

### ECC Original
- Location: `C:\Users\amazon\everything-claude-code`
- Commands: `.claude\commands\` (60 files)
- Skills: `.claude\skills\` (46 directories)
- Agents: `.claude\agents\` (28 files)

---

## 💡 Tips

1. **Start with `/plan`** for anything complex
2. **Always use `/tdd`** for new features
3. **Run `/verify`** before every commit
4. **Security scan** before any merge
5. **Code review** after implementation

---

## ❓ Troubleshooting

### Commands not working?
Make sure you're typing `/command` at the **start** of your prompt.

### Want more commands?
See `.qwen/commands/` for all available commands.

### Need custom workflows?
Create new skills in `.qwen/skills/` directory.

### Agents not responding?
Check that your request is clear and specific.

---

**Ready to start?** Type `/plan "your next feature"` and let Qwen Code help you build better software! 🚀
