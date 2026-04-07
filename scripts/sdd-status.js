#!/usr/bin/env node

/**
 * SDD Status Dashboard
 * 
 * Displays the current status of all SDD projects in a visual dashboard.
 * 
 * Usage: node .qwen/scripts/sdd-status.js [project]
 * 
 * Examples:
 *   node .qwen/scripts/sdd-status.js              # Show all projects
 *   node .qwen/scripts/sdd-status.js my-project   # Show specific project
 */

const fs = require('fs');
const path = require('path');

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

function getStatusIcon(status) {
    const icons = {
        'done': '✅',
        'in-progress': '🔄',
        'pending': '⏳',
        'blocked': '🟡',
        'missing': '❌'
    };
    return icons[status] || status;
}

function getPhaseStatus(projectRoot, phase, projectName) {
    const filePath = path.join(projectRoot, '.qwen', phase, `${projectName}-${phase === 'specify' ? 'spec' : phase === 'tasks' ? 'tasks' : phase + '-plan'}.md`);
    
    if (!fs.existsSync(filePath)) {
        return 'missing';
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for approval status
    if (content.includes('APPROVED')) {
        return 'done';
    }
    
    // Check for in-progress markers
    if (content.includes('IN_REVIEW') || content.includes('🔄') || content.includes('In Progress')) {
        return 'in-progress';
    }
    
    if (content.includes('DRAFT')) {
        return 'in-progress';
    }

    return 'pending';
}

function getTasksProgress(projectRoot, projectName) {
    const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
    
    if (!fs.existsSync(tasksPath)) {
        return { total: 0, done: 0, inProgress: 0, pending: 0 };
    }

    const content = fs.readFileSync(tasksPath, 'utf-8');
    
    // Count task statuses
    const doneMatches = content.match(/✅\s*Done/gi) || [];
    const inProgressMatches = content.match(/🔄\s*In Progress/gi) || [];
    const pendingMatches = content.match(/⏳\s*Pending/gi) || [];
    const blockedMatches = content.match(/🟡\s*Blocked/gi) || [];
    
    // Also check table format
    const tableDone = (content.match(/\|\s*T-\d+\s*\|\s*✅/g) || []).length;
    const tableInProgress = (content.match(/\|\s*T-\d+\s*\|\s*🔄/g) || []).length;
    const tablePending = (content.match(/\|\s*T-\d+\s*\|\s*⏳/g) || []).length;
    
    const done = Math.max(doneMatches.length, tableDone);
    const inProgress = Math.max(inProgressMatches.length, tableInProgress);
    const pending = Math.max(pendingMatches.length, tablePending);
    const total = done + inProgress + pending;

    return { total, done, inProgress, pending };
}

function getProgressBar(done, total) {
    const width = 20;
    const filled = Math.round((done / total) * width);
    const empty = width - filled;
    const percentage = Math.round((done / total) * 100);
    
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
}

function displayProjectStatus(projectRoot, projectName) {
    const phases = ['specify', 'plan', 'tasks', 'implement'];
    const phaseNames = {
        'specify': 'SPECIFY',
        'plan': 'PLAN',
        'tasks': 'TASKS',
        'implement': 'IMPLEMENT'
    };

    console.log(`\n${COLORS.cyan}${COLORS.bright}═══════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}  SDD Project: ${projectName}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);

    // Phase status
    console.log(`${COLORS.yellow}Phase Status:${COLORS.reset}\n`);
    
    let currentPhaseIndex = 0;
    let allPreviousDone = true;

    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const status = getPhaseStatus(projectRoot, phase, projectName);
        const icon = getStatusIcon(status);
        const phaseNum = i + 1;

        let line = `  ${phaseNum}. ${phaseNames[phase]}`;
        
        // Pad to align
        while (line.length < 25) {
            line += ' ';
        }

        if (status === 'done') {
            console.log(`${COLORS.green}${line} ${icon} ${status.toUpperCase()}${COLORS.reset}`);
            allPreviousDone = true;
            currentPhaseIndex = phaseNum;
        } else if (status === 'in-progress') {
            console.log(`${COLORS.yellow}${line} ${icon} ${status.toUpperCase()}${COLORS.reset}`);
            currentPhaseIndex = phaseNum;
        } else if (status === 'missing') {
            if (allPreviousDone || i === 0) {
                console.log(`${COLORS.gray}${line} ${icon} NOT STARTED${COLORS.reset}`);
            } else {
                console.log(`${COLORS.gray}${line} ${icon} BLOCKED${COLORS.reset}`);
            }
        } else {
            console.log(`${COLORS.gray}${line} ${icon} PENDING${COLORS.reset}`);
        }
    }

    // Task progress
    const tasksProgress = getTasksProgress(projectRoot, projectName);
    if (tasksProgress.total > 0) {
        console.log(`\n${COLORS.yellow}Task Progress:${COLORS.reset}\n`);
        console.log(`  Total Tasks:     ${tasksProgress.total}`);
        console.log(`  ✅ Completed:    ${tasksProgress.done}`);
        console.log(`  🔄 In Progress:  ${tasksProgress.inProgress}`);
        console.log(`  ⏳ Pending:      ${tasksProgress.pending}`);
        
        if (tasksProgress.total > 0) {
            const bar = getProgressBar(tasksProgress.done, tasksProgress.total);
            console.log(`\n  [${bar}]`);
        }
    }

    // File locations
    console.log(`\n${COLORS.yellow}Artifacts:${COLORS.reset}\n`);
    
    const artifacts = [
        { name: 'Specification', path: `.qwen/specs/${projectName}-spec.md` },
        { name: 'Technical Plan', path: `.qwen/plans/${projectName}-plan.md` },
        { name: 'Tasks', path: `.qwen/tasks/${projectName}-tasks.md` }
    ];

    for (const artifact of artifacts) {
        const fullPath = path.join(projectRoot, artifact.path);
        const exists = fs.existsSync(fullPath);
        const icon = exists ? '📄' : '❌';
        console.log(`  ${icon} ${artifact.name}: ${artifact.path}`);
    }

    // Next action
    console.log(`\n${COLORS.yellow}Next Action:${COLORS.reset}\n`);
    
    if (currentPhaseIndex === 0) {
        console.log(`  ${COLORS.cyan}/specify "${projectName}"${COLORS.reset}`);
        console.log(`  ${COLORS.gray}Start by defining WHAT and WHY${COLORS.reset}`);
    } else if (currentPhaseIndex === 1) {
        console.log(`  ${COLORS.cyan}/sdd-plan "${projectName}"${COLORS.reset}`);
        console.log(`  ${COLORS.gray}Define technical approach (HOW)${COLORS.reset}`);
    } else if (currentPhaseIndex === 2) {
        console.log(`  ${COLORS.cyan}/tasks "${projectName}"${COLORS.reset}`);
        console.log(`  ${COLORS.gray}Break plan into actionable tasks${COLORS.reset}`);
    } else if (currentPhaseIndex === 3) {
        console.log(`  ${COLORS.cyan}/implement "${projectName} --task T-001"${COLORS.reset}`);
        console.log(`  ${COLORS.gray}Start implementing tasks${COLORS.reset}`);
    } else {
        console.log(`  ${COLORS.green}All phases complete!${COLORS.reset}`);
        console.log(`  ${COLORS.gray}Project ready for deployment${COLORS.reset}`);
    }

    console.log(`\n${COLORS.cyan}${COLORS.bright}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);
}

function listAllProjects(projectRoot) {
    const specsDir = path.join(projectRoot, '.qwen', 'specs');
    
    if (!fs.existsSync(specsDir)) {
        console.log('\nNo SDD projects found. Start with /specify "Project Name"\n');
        return;
    }

    const specFiles = fs.readdirSync(specsDir).filter(f => f.endsWith('-spec.md'));
    
    if (specFiles.length === 0) {
        console.log('\nNo SDD projects found. Start with /specify "Project Name"\n');
        return;
    }

    console.log(`\n${COLORS.cyan}${COLORS.bright}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}║           SDD Projects Dashboard                          ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    const projects = specFiles.map(f => f.replace('-spec.md', ''));
    
    console.log(`Found ${projects.length} project(s):\n`);
    
    for (const project of projects) {
        const specifyStatus = getPhaseStatus(projectRoot, 'specify', project);
        const planStatus = getPhaseStatus(projectRoot, 'plan', project);
        const tasksStatus = getPhaseStatus(projectRoot, 'tasks', project);
        const tasksProgress = getTasksProgress(projectRoot, project);
        
        const statusLine = [
            specifyStatus === 'done' ? '✅' : specifyStatus === 'in-progress' ? '🔄' : '⏳',
            planStatus === 'done' ? '✅' : planStatus === 'in-progress' ? '🔄' : '⏳',
            tasksStatus === 'done' ? '✅' : tasksStatus === 'in-progress' ? '🔄' : '⏳',
        ].join(' → ');

        const progress = tasksProgress.total > 0 
            ? `${tasksProgress.done}/${tasksProgress.total} tasks`
            : 'No tasks yet';

        console.log(`  ${COLORS.bright}${project}${COLORS.reset}`);
        console.log(`    Phases: ${statusLine}`);
        console.log(`    Progress: ${progress}`);
        console.log();
    }

    console.log(`${COLORS.gray}  Use: node .qwen/scripts/sdd-status.js [project-name] for details${COLORS.reset}\n`);
}

// Main
const args = process.argv.slice(2);
const projectName = args[0];

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    console.log(`${COLORS.red}[ERROR]${COLORS.reset} Could not find project root with .qwen directory`);
    process.exit(1);
}

if (projectName) {
    displayProjectStatus(projectRoot, projectName);
} else {
    listAllProjects(projectRoot);
}
