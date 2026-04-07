---
description: Troubleshoot and fix build errors, dependency issues, and compilation failures.
agents: ["dev-ops-platform-engineer", "ecc-build-fix"]
---

# Build Fix Command

**Activates:** `ecc-build-fix` skill

## Usage
```
/build-fix - npm install failing
/build-fix - TypeScript compilation errors
/build-fix - Maven build failing
```

## Troubleshooting Process

### 1. CAPTURE - Get Full Error
- Complete error with stack trace
- Build tool (npm, maven, gradle, cargo)
- Environment (OS, versions)
- Fresh clone or existing project

### 2. ANALYZE - Categorize Error

#### Dependency Issues
- Missing packages
- Version conflicts
- Peer dependency problems
- Lock file corruption

**Quick Fix:**
```bash
# Node.js
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Python
rm -rf .venv __pycache__
pip cache purge
pip install -r requirements.txt

# Java
mvn clean
mvn dependency:purge-local-repository
mvn install -U
```

#### Configuration Issues
- Missing environment variables
- Incorrect tsconfig
- Wrong build paths
- Missing babel/webpack config

#### Code Issues
- TypeScript errors
- Syntax errors
- Import/export mismatches
- Circular dependencies

#### Environment Issues
- Wrong runtime version
- Missing system deps
- PATH problems
- Permission issues

### 3. FIX - Apply Targeted Solution
- Start with simplest fix
- Change one thing at a time
- Verify after each change

### 4. VERIFY - Confirm Build Passes
- Run full build
- Run tests
- Check for warnings

## Common Error Patterns

### TypeScript Errors

```
Cannot find module 'xyz'
→ Check import path, install dependency

Property 'abc' does not exist on type 'XYZ'
→ Check type definition, fix interface

Type 'X' is not assignable to type 'Y'
→ Check type compatibility
```

### Node.js Errors

```
Cannot find module
→ npm install, check package.json

Unexpected token
→ Check syntax, Babel config

ENOENT: no such file
→ Check file paths
```

### Python Errors

```
ModuleNotFoundError
→ pip install, check virtualenv

ImportError: cannot import name
→ Check circular imports

SyntaxError
→ Check Python version
```

### Java/Maven Errors

```
Cannot resolve dependency
→ Check groupId/artifactId/version

Compilation failure
→ Check imports, fix syntax

Plugin resolution failed
→ Check plugin versions
```

## Output Format

```markdown
## Build Error Analysis

### Error Summary
[Description of the failure]

### Root Cause
[Identified cause]

### Solution Steps

1. [First action]
2. [Second action]

### Commands to Run

```bash
[Exact commands]
```

### Verification

After applying fix:
- [ ] Build passes: `[command]`
- [ ] Tests pass: `[command]`
- [ ] No new warnings

### Prevention

To prevent recurrence:
- [CI/CD check, documentation, process]
```

## Quick Reference

### Clean Reinstall (Try First)

```bash
# Node.js
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Python
rm -rf .venv __pycache__
pip cache purge
pip install -r requirements.txt

# Java  
mvn clean dependency:purge-local-repository install -U
```

### Cache Clear

```bash
npm cache clean --force
pip cache purge
mvn dependency:purge-local-repository
```

### Lock File Reset

```bash
rm package-lock.json yarn.lock
npm install
```

## When to Use

✅ Build suddenly fails
✅ After pulling changes
✅ After dependency updates
✅ Fresh clone issues
✅ CI/CD build failures

❌ Test failures (use `/tdd`)
❌ Runtime errors (debug instead)

## Related Commands
- `/tdd` - Fix with regression test
- `/verify` - Post-fix verification
- `/code-review` - Review the fix
