# Qwen Code Hooks System (ECC-Inspired)

This document describes how to implement hook-like automation in Qwen Code, adapted from ECC's hook system.

## Overview

ECC (Everything Claude Code) has 8+ hook events with 20+ Node.js scripts for automation. Qwen Code doesn't have native hooks, but you can achieve similar automation through:

1. **Project-level AGENTS.md** - Persistent instructions for all sessions
2. **Skill files** - Reusable workflow definitions in `.qwen/skills/`
3. **Agent files** - Specialized agent instructions in `.qwen/agents/`
4. **Manual triggers** - Text commands at prompt start

---

## ECC Hooks → Qwen Code Equivalents

### ECC Hook Events and Qwen Code Adaptations

| ECC Hook Event | Qwen Code Adaptation |
|---------------|---------------------|
| `PostToolUse` | Add to AGENTS.md: "After any file edit, verify syntax" |
| `PreCommit` | Add to AGENTS.md: "Before describing commits, run checklist" |
| `SessionStart` | AGENTS.md is auto-read at session start |
| `BeforeShellExecute` | Add to AGENTS.md: "Before suggesting shell commands, warn about risks" |
| `AfterFileEdit` | Add to skill: "After implementing, run linter check" |
| `PreResponse` | Built into agent instructions |

---

## Implementing Hook-Like Behavior

### Method 1: AGENTS.md Global Instructions

Add persistent rules to your project's `AGENTS.md`:

```markdown
## Automated Checks (Hook-Like Behavior)

### After Any File Edit
- Verify syntax is valid
- Check for console.log/debug statements (remove if found)
- Ensure imports are organized
- Run linter mentally

### Before Describing Commits
- [ ] All tests pass
- [ ] No console.log statements
- [ ] Code follows style guide
- [ ] Security checklist reviewed
- [ ] Commit message follows conventional commits

### Before Suggesting Shell Commands
- Warn about destructive operations (rm, drop, delete)
- Verify command is cross-platform or note OS specificity
- Suggest dry-run option if available
```

### Method 2: Skill-Based Workflows

Create skills that include automated checks:

```markdown
---
name: verified-implementation
description: Implementation with built-in verification checks
---

# Verified Implementation Workflow

After writing any code:

1. SYNTAX CHECK
   - Verify all brackets/parentheses are balanced
   - Check for TypeScript/Python syntax errors
   - Ensure imports are correct

2. QUALITY CHECK
   - No console.log/debug statements
   - Error handling at boundaries
   - Input validation present

3. SECURITY CHECK
   - No hardcoded secrets
   - User inputs validated
   - SQL uses parameters

4. TEST CHECK
   - Tests would cover this logic
   - Edge cases considered
```

### Method 3: Checklist Skills

Create checklist skills for pre-commit verification:

```markdown
---
name: pre-commit-checklist
description: Automated pre-commit verification
---

## Pre-Commit Checklist

Before finalizing any code change:

### Code Quality
- [ ] Functions < 50 lines
- [ ] Files < 800 lines
- [ ] Nesting < 4 levels
- [ ] Clear variable names
- [ ] No code duplication

### Testing
- [ ] Unit tests added/updated
- [ ] Edge cases covered
- [ ] Coverage >= 80%

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL parameterized
- [ ] Error messages safe

### Documentation
- [ ] Complex logic commented
- [ ] Public APIs documented
- [ ] Changes described clearly
```

---

## Custom Hook Scripts (Advanced)

For advanced users, create Node.js scripts in your project:

### Example: `.hooks/after-edit.js`

```javascript
#!/usr/bin/env node
// Run this script after any significant code edit

const fs = require('fs');
const path = require('path');

// Check for console.log statements
function checkDebugStatements(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      checkDebugStatements(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('console.log')) {
        console.warn(`⚠️  Debug statement found: ${filePath}`);
      }
    }
  }
}

checkDebugStatements('./src');
```

Then add to AGENTS.md:
```markdown
After significant edits, run: `node .hooks/after-edit.js`
```

---

## Trigger Commands

Use these at the start of prompts to trigger hook-like behavior:

| Command | Triggers |
|---------|----------|
| `/verify` | Run full verification checklist |
| `/pre-commit` | Pre-commit checks |
| `/lint` | Mental lint check |
| `/security-check` | Security verification |
| `/test-check` | Test coverage review |
| `/format-check` | Code style verification |

---

## Session Persistence

Qwen Code sessions are stateless. To maintain "hook" behavior across sessions:

1. **Keep AGENTS.md updated** - Read at every session start
2. **Use skill files** - Reference skills in prompts
3. **Project documentation** - Store workflows in docs/

---

## Example: Full Hook Workflow

### Scenario: After editing authentication code

**User Prompt:**
```
/verify - I just updated the login handler in src/auth/login.ts
```

**Agent Response:**
```
Running verification checks on src/auth/login.ts:

✅ SYNTAX CHECK - TypeScript valid
⚠️  QUALITY CHECK - Found console.log at line 45 (remove before commit)
✅ SECURITY CHECK - Password hashing uses bcrypt, inputs validated
⚠️  TEST CHECK - No tests for new error case (line 38-42)

Recommended actions:
1. Remove console.log statement
2. Add test for invalid email format case
3. Run full test suite before commit
```

---

## Summary

| ECC Feature | Qwen Code Solution |
|-------------|-------------------|
| Hook events | AGENTS.md instructions |
| Hook scripts | Custom Node.js in .hooks/ |
| Automated checks | Skill-based workflows |
| Trigger commands | Text shortcuts (/verify, /lint) |
| Persistence | Project-level AGENTS.md |

While Qwen Code doesn't have native hooks, the combination of AGENTS.md, skills, and trigger commands provides similar automation capabilities.
