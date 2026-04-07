#!/usr/bin/env node

/**
 * Git Hooks Manager
 * 
 * Manages git hooks for the project (pre-commit, pre-push, etc.)
 * Can install, remove, or list hooks.
 * 
 * Usage: node .qwen/scripts/git-hooks.js [command]
 * 
 * Commands:
 *   install    Install git hooks
 *   remove     Remove git hooks
 *   list       List installed hooks
 *   update     Update existing hooks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
    bright: '\x1b[1m',
};

const HOOKS = {
    'pre-commit': {
        name: 'Pre-commit Hook',
        description: 'Runs before each commit',
        script: `#!/bin/sh
# Pre-commit quality gates
node .qwen/scripts/pre-commit.js
exit $?`
    },
    'pre-push': {
        name: 'Pre-push Hook',
        description: 'Runs before each push',
        script: `#!/bin/sh
# Run tests before push
echo "Running pre-push checks..."
npm test || exit 1
exit 0`
    },
    'commit-msg': {
        name: 'Commit Message Hook',
        description: 'Validates commit messages',
        script: `#!/bin/sh
# Validate commit message format
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|test|chore|ci|perf|build)(\(.+\))?: (.+)"
if ! echo "$commit_msg" | grep -qE "$pattern"; then
    echo "Invalid commit message format."
    echo "Expected: type(scope): description"
    echo "Types: feat, fix, docs, style, refactor, test, chore, ci, perf, build"
    exit 1
fi
exit 0`
    }
};

function findProjectRoot(startDir) {
    let current = startDir;
    while (current !== path.parse(current).root) {
        if (fs.existsSync(path.join(current, '.qwen'))) {
            return current;
        }
        current = path.dirname(current);
    }
    return null;
}

function getHooksDir(projectRoot) {
    return path.join(projectRoot, '.git', 'hooks');
}

function installHook(hookName, force = false) {
    const hooksDir = getHooksDir(projectRoot);
    const hookPath = path.join(hooksDir, hookName);
    
    if (!fs.existsSync(hooksDir)) {
        console.log(`${COLORS.red}[ERROR]${COLORS.reset} Git hooks directory not found. Initialize git first: git init`);
        return false;
    }
    
    if (fs.existsSync(hookPath) && !force) {
        console.log(`${COLORS.yellow}[SKIP]${COLORS.reset} ${hookName} already exists. Use --force to overwrite.`);
        return false;
    }
    
    const hook = HOOKS[hookName];
    if (!hook) {
        console.log(`${COLORS.red}[ERROR]${COLORS.reset} Unknown hook: ${hookName}`);
        console.log(`Available hooks: ${Object.keys(HOOKS).join(', ')}`);
        return false;
    }
    
    fs.writeFileSync(hookPath, hook.script);
    fs.chmodSync(hookPath, '755');
    
    console.log(`${COLORS.green}[INSTALLED]${COLORS.reset} ${hookName}: ${hook.description}`);
    return true;
}

function removeHook(hookName) {
    const hooksDir = getHooksDir(projectRoot);
    const hookPath = path.join(hooksDir, hookName);
    
    if (!fs.existsSync(hookPath)) {
        console.log(`${COLORS.yellow}[NOT FOUND]${COLORS.reset} ${hookName} not installed`);
        return false;
    }
    
    fs.unlinkSync(hookPath);
    console.log(`${COLORS.green}[REMOVED]${COLORS.reset} ${hookName}`);
    return true;
}

function listHooks() {
    const hooksDir = getHooksDir(projectRoot);
    
    if (!fs.existsSync(hooksDir)) {
        console.log(`${COLORS.yellow}[INFO]${COLORS.reset} No git repository found`);
        return;
    }
    
    const installedHooks = fs.readdirSync(hooksDir).filter(f => !f.endsWith('.sample'));
    
    console.log(`\n${COLORS.cyan}${COLORS.bright}Installed Git Hooks:${COLORS.reset}\n`);
    
    if (installedHooks.length === 0) {
        console.log(`${COLORS.gray}No custom hooks installed${COLORS.reset}`);
        console.log(`${COLORS.cyan}Run: node .qwen/scripts/git-hooks.js install${COLORS.reset}\n`);
        return;
    }
    
    for (const hook of installedHooks) {
        const hookInfo = HOOKS[hook];
        if (hookInfo) {
            console.log(`  ${COLORS.green}✓${COLORS.reset} ${hook}`);
            console.log(`    ${COLORS.gray}${hookInfo.description}${COLORS.reset}`);
        } else {
            console.log(`  ${COLORS.yellow}?${COLORS.reset} ${hook} (custom)`);
        }
    }
    
    console.log(`\n${COLORS.gray}Available hooks: ${Object.keys(HOOKS).join(', ')}${COLORS.reset}\n`);
}

function installAllHooks(force = false) {
    console.log(`${COLORS.cyan}[INSTALL]${COLORS.reset} Installing all git hooks...\n`);
    
    let installed = 0;
    for (const hookName of Object.keys(HOOKS)) {
        if (installHook(hookName, force)) {
            installed++;
        }
    }
    
    console.log(`\n${COLORS.green}[DONE]${COLORS.reset} Installed ${installed} hook(s)`);
}

function showHelp() {
    console.log(`
Git Hooks Manager

Usage: node .qwen/scripts/git-hooks.js [command] [options]

Commands:
  install [hook]    Install git hooks (all or specific)
  remove [hook]     Remove git hooks
  list              List installed hooks
  update            Update existing hooks

Options:
  --force           Overwrite existing hooks

Available Hooks:
  pre-commit        Runs quality gates before commit
  pre-push          Runs tests before push
  commit-msg        Validates commit message format

Examples:
  node .qwen/scripts/git-hooks.js install
  node .qwen/scripts/git-hooks.js install pre-commit
  node .qwen/scripts/git-hooks.js list
  node .qwen/scripts/git-hooks.js remove pre-commit
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];
const force = args.includes('--force');

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    console.log(`${COLORS.red}[ERROR]${COLORS.reset} Could not find project root`);
    process.exit(1);
}

switch (command) {
    case 'install':
        if (args[1]) {
            installHook(args[1], force);
        } else {
            installAllHooks(force);
        }
        break;
        
    case 'remove':
        if (args[1]) {
            removeHook(args[1]);
        } else {
            console.log(`${COLORS.yellow}[INFO]${COLORS.reset} Specify hook to remove`);
        }
        break;
        
    case 'list':
        listHooks();
        break;
        
    case 'update':
        installAllHooks(true);
        break;
        
    case 'help':
    default:
        showHelp();
        break;
}
