#!/usr/bin/env node

/**
 * Interactive Command Runner
 * 
 * Interactive menu to run common commands easily.
 * Provides a menu-driven interface for Qwen Code workflows.
 * 
 * Usage: node .qwen/scripts/interactive.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
    bright: '\x1b[1m',
};

const MENU = {
    main: {
        title: 'Qwen Code Commands',
        items: [
            { id: 'sdd', name: 'SDD Workflow', description: 'Spec-Driven Development' },
            { id: 'quality', name: 'Quality Checks', description: 'Lint, format, security' },
            { id: 'test', name: 'Testing', description: 'Run tests' },
            { id: 'git', name: 'Git', description: 'Commit, push, PR' },
            { id: 'project', name: 'Project', description: 'Setup or analyze' },
            { id: 'custom', name: 'Custom Command', description: 'Run any command' },
            { id: 'quit', name: 'Quit', description: 'Exit' },
        ]
    },
    sdd: {
        title: 'SDD Workflow',
        items: [
            { id: 'specify', name: 'Specify', description: 'Define WHAT and WHY' },
            { id: 'plan', name: 'Plan', description: 'Define technical approach' },
            { id: 'tasks', name: 'Tasks', description: 'Break into tasks' },
            { id: 'implement', name: 'Implement', description: 'Execute tasks' },
            { id: 'status', name: 'Status', description: 'View all statuses' },
            { id: 'dashboard', name: 'Dashboard', description: 'Task tracking' },
            { id: 'back', name: 'Back', description: 'Return to main menu' },
        ]
    },
    quality: {
        title: 'Quality Checks',
        items: [
            { id: 'all', name: 'All Checks', description: 'Run pre-commit' },
            { id: 'lint', name: 'Lint', description: 'Run ESLint' },
            { id: 'format', name: 'Format', description: 'Run Prettier' },
            { id: 'security', name: 'Security', description: 'Scan for secrets' },
            { id: 'coverage', name: 'Coverage', description: 'Test coverage' },
            { id: 'complexity', name: 'Complexity', description: 'Check complexity' },
            { id: 'back', name: 'Back', description: 'Return to main menu' },
        ]
    },
    test: {
        title: 'Testing',
        items: [
            { id: 'run', name: 'Run Tests', description: 'npm test' },
            { id: 'watch', name: 'Watch Mode', description: 'Test watch mode' },
            { id: 'coverage', name: 'With Coverage', description: 'Test with coverage' },
            { id: 'e2e', name: 'E2E Tests', description: 'Run E2E tests' },
            { id: 'back', name: 'Back', description: 'Return to main menu' },
        ]
    },
    git: {
        title: 'Git',
        items: [
            { id: 'status', name: 'Status', description: 'git status' },
            { id: 'add', name: 'Stage All', description: 'git add .' },
            { id: 'commit', name: 'Commit', description: 'git commit' },
            { id: 'push', name: 'Push', description: 'git push' },
            { id: 'pr', name: 'Create PR', description: 'Create pull request' },
            { id: 'back', name: 'Back', description: 'Return to main menu' },
        ]
    },
    project: {
        title: 'Project',
        items: [
            { id: 'setup', name: 'Setup Wizard', description: 'Create new project' },
            { id: 'analyze', name: 'Analyze', description: 'Code analysis' },
            { id: 'deps', name: 'Dependencies', description: 'Check dependencies' },
            { id: 'back', name: 'Back', description: 'Return to main menu' },
        ]
    }
};

const COMMANDS = {
    specify: '/specify',
    plan: '/sdd-plan',
    tasks: '/tasks',
    implement: '/implement',
    status: 'node .qwen/scripts/sdd-workflow.js status',
    dashboard: 'node .qwen/scripts/task-dashboard.js',
    all: 'node .qwen/scripts/pre-commit.js',
    lint: 'node .qwen/scripts/lint.js',
    format: 'node .qwen/scripts/format.js --write',
    security: 'node .qwen/scripts/security-scan.js',
    coverage: 'node .qwen/scripts/verify-coverage.js',
    complexity: 'node .qwen/scripts/check-complexity.js',
    'run': 'npm test',
    watch: 'npm test -- --watch',
    'coverage': 'npm test -- --coverage',
    e2e: 'npx playwright test',
    status: 'git status',
    add: 'git add .',
    commit: 'node .qwen/scripts/pre-commit.js && git commit -m ""',
    push: 'git push',
    pr: 'gh pr create',
    setup: 'node .qwen/scripts/setup-wizard.js',
    analyze: 'node .qwen/scripts/check-complexity.js',
    deps: 'node .qwen/scripts/dependency-audit.js',
};

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

function question(rl, prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function showMenu(menuId) {
    const menu = MENU[menuId];
    if (!menu) return;
    
    console.clear();
    log(`\n=== ${menu.title} ===`, 'cyan');
    console.log();
    
    for (const item of menu.items) {
        const color = item.id === 'back' || item.id === 'quit' ? 'gray' : 'white';
        log(`  ${item.id === 'back' ? 'b' : item.id === 'quit' ? 'q' : item.id}. ${item.name}`, color);
        log(`     ${item.description}`, 'gray');
    }
    
    console.log();
}

async function runMenu(menuId = 'main') {
    const menu = MENU[menuId];
    if (!menu) return;
    
    showMenu(menuId);
    
    const rl = createInterface();
    const validIds = menu.items.map(i => i.id === 'back' ? 'b' : i.id === 'quit' ? 'q' : i.id);
    
    let choice = '';
    while (!validIds.includes(choice)) {
        choice = await question(rl, '\n> ');
        choice = choice.trim().toLowerCase();
    }
    
    // Handle special cases
    if (choice === 'q' || choice === 'quit') {
        log('Goodbye!', 'cyan');
        rl.close();
        process.exit(0);
    }
    
    if (choice === 'b' || choice === 'back') {
        rl.close();
        return runMenu('main');
    }
    
    // Find the selected item
    const selected = menu.items.find(i => 
        (i.id === 'back' && choice === 'b') || 
        (i.id === 'quit' && choice === 'q') ||
        i.id === choice
    );
    
    if (!selected) {
        rl.close();
        return;
    }
    
    // Handle submenus
    if (['sdd', 'quality', 'test', 'git', 'project'].includes(selected.id)) {
        rl.close();
        return runMenu(selected.id);
    }
    
    // Execute command
    const command = COMMANDS[selected.id];
    
    if (command) {
        if (command.startsWith('/')) {
            log(`\nRun this command in Qwen Code:`, 'cyan');
            log(command, 'bright');
            log('\nPress Enter to continue...', 'gray');
            await question(rl, '');
        } else {
            log(`\nRunning: ${command}`, 'cyan');
            rl.close();
            
            const { execSync } = require('child_process');
            try {
                execSync(command, { stdio: 'inherit', shell: true });
            } catch (error) {
                log(`Command failed: ${error.message}`, 'red');
            }
            
            const rl2 = createInterface();
            log('\nPress Enter to continue...', 'gray');
            await question(rl2, '');
            rl2.close();
        }
    }
    
    return runMenu(menuId);
}

function showHelp() {
    console.log(`
Interactive Command Runner

Usage: node .qwen/scripts/interactive.js

A menu-driven interface for common Qwen Code commands.
Provides easy access to:
- SDD Workflow
- Quality checks (lint, format, security)
- Testing
- Git operations
- Project setup

Examples:
  node .qwen/scripts/interactive.js
`);
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

runMenu().catch(console.error);