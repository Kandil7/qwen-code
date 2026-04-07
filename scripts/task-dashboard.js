#!/usr/bin/env node

/**
 * Task Tracking Dashboard
 * 
 * Visual dashboard for tracking task progress across SDD projects.
 * Provides real-time status, progress bars, and next actions.
 * 
 * Usage: node .qwen/scripts/task-dashboard.js [project]
 * 
 * Examples:
 *   node .qwen/scripts/task-dashboard.js              # Show all projects
 *   node .qwen/scripts/task-dashboard.js my-project   # Show specific project
 *   node .qwen/scripts/task-dashboard.js --watch       # Watch mode (live updates)
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
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
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

function getTaskCounts(content) {
    const done = (content.match(/\| T-\d+ \| ✅/g) || []).length;
    const inProgress = (content.match(/\| T-\d+ \| 🔄/g) || []).length;
    const pending = (content.match(/\| T-\d+ \| ⏳/g) || []).length;
    const blocked = (content.match(/\| T-\d+ \| 🟡/g) || []).length;
    return { done, inProgress, pending, blocked, total: done + inProgress + pending + blocked };
}

function getProgressBar(done, total, width = 20) {
    if (total === 0) return '░'.repeat(width) + ' 0%';
    const filled = Math.round((done / total) * width);
    const empty = width - filled;
    const percentage = Math.round((done / total) * 100);
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
}

function getPhaseFromTaskId(taskId) {
    const num = parseInt(taskId.split('-')[1]);
    if (num <= 10) return 1;
    if (num <= 20) return 2;
    return 3;
}

function getProjectTasks(projectRoot, projectName) {
    const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
    
    if (!fs.existsSync(tasksPath)) {
        return null;
    }

    const content = fs.readFileSync(tasksPath, 'utf-8');
    const counts = getTaskCounts(content);
    
    // Get task details
    const taskDetails = [];
    const taskRegex = /\| (T-\d+) \| ([✅🔄⏳🟡]) \| ([^\|]+) \| ([^\|]+) \| ([^\|]+) \|/g;
    let match;
    
    while ((match = taskRegex.exec(content)) !== null) {
        taskDetails.push({
            id: match[1],
            status: match[2],
            started: match[3].trim(),
            completed: match[4].trim(),
            notes: match[5].trim()
        });
    }

    // Get next pending task
    const nextPending = taskDetails.find(t => t.status === '⏳');
    
    // Get current in-progress task
    const currentTask = taskDetails.find(t => t.status === '🔄');

    return {
        path: tasksPath,
        counts,
        taskDetails,
        nextPending,
        currentTask,
        lastUpdated: fs.statSync(tasksPath).mtime
    };
}

function displayProjectDashboard(projectRoot, projectName) {
    const project = getProjectTasks(projectRoot, projectName);
    
    if (!project) {
        console.log(`${COLORS.red}[ERROR]${COLORS.reset} No tasks found for "${projectName}"`);
        console.log(`${COLORS.gray}Run /tasks "${projectName}" first${COLORS.reset}`);
        return;
    }

    const { counts, nextPending, currentTask } = project;

    // Header
    console.log(`\n${COLORS.cyan}${COLORS.bright}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}║          TASK TRACKING DASHBOARD: ${projectName.toUpperCase().padEnd(36)}║${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    // Progress summary
    console.log(`${COLORS.yellow}Progress:${COLORS.reset}\n`);
    
    const bar = getProgressBar(counts.done, counts.total);
    console.log(`  [${bar}] ${counts.done}/${counts.total} tasks`);
    
    console.log(`\n  ${COLORS.green}✅ Completed:${COLORS.reset} ${counts.done}`);
    console.log(`  ${COLORS.yellow}🔄 In Progress:${COLORS.reset} ${counts.inProgress}`);
    console.log(`  ${COLORS.gray}⏳ Pending:${COLORS.reset} ${counts.pending}`);
    if (counts.blocked > 0) {
        console.log(`  ${COLORS.red}🟡 Blocked:${COLORS.reset} ${counts.blocked}`);
    }

    // Current task
    if (currentTask) {
        console.log(`\n${COLORS.yellow}Currently Working On:${COLORS.reset}\n`);
        console.log(`  ${COLORS.cyan}${currentTask.id}${COLORS.reset}`);
    }

    // Next task
    if (nextPending) {
        console.log(`\n${COLORS.yellow}Up Next:${COLORS.reset}\n`);
        console.log(`  ${COLORS.bright}${nextPending.id}${COLORS.reset}`);
    }

    // Quick actions
    console.log(`\n${COLORS.yellow}Quick Actions:${COLORS.reset}\n`);
    
    if (nextPending) {
        const phase = getPhaseFromTaskId(nextPending.id);
        console.log(`  ${COLORS.cyan}/implement "${projectName} --task ${nextPending.id}"${COLORS.reset}`);
        console.log(`  ${COLORS.gray}Start next task (Phase ${phase})${COLORS.reset}\n`);
    }
    
    console.log(`  ${COLORS.cyan}/tdd "${projectName} - task ${nextPending?.id || 'T-001'}"${COLORS.reset}`);
    console.log(`  ${COLORS.gray}Continue with TDD workflow${COLORS.reset}\n`);

    console.log(`  ${COLORS.cyan}node .qwen/scripts/sdd-status.js ${projectName}${COLORS.reset}`);
    console.log(`  ${COLORS.gray}View full SDD status${COLORS.reset}\n`);

    // Task list
    if (project.taskDetails.length > 0) {
        console.log(`${COLORS.yellow}All Tasks:${COLORS.reset}\n`);
        
        // Group by status
        const doneTasks = project.taskDetails.filter(t => t.status === '✅');
        const inProgressTasks = project.taskDetails.filter(t => t.status === '🔄');
        const pendingTasks = project.taskDetails.filter(t => t.status === '⏳');
        
        if (doneTasks.length > 0) {
            console.log(`  ${COLORS.green}Completed:${COLORS.reset} ${doneTasks.map(t => t.id).join(', ')}`);
        }
        if (inProgressTasks.length > 0) {
            console.log(`  ${COLORS.yellow}In Progress:${COLORS.reset} ${inProgressTasks.map(t => t.id).join(', ')}`);
        }
        if (pendingTasks.length > 0) {
            console.log(`  ${COLORS.gray}Pending:${COLORS.reset} ${pendingTasks.slice(0, 10).map(t => t.id).join(', ')}${pendingTasks.length > 10 ? '...' : ''}`);
        }
    }

    console.log(`\n${COLORS.gray}Last updated: ${project.lastUpdated.toLocaleString()}${COLORS.reset}\n`);
}

function displayAllProjects(projectRoot) {
    const specsDir = path.join(projectRoot, '.qwen', 'specs');
    const tasksDir = path.join(projectRoot, '.qwen', 'tasks');
    
    if (!fs.existsSync(specsDir)) {
        console.log(`\n${COLORS.yellow}[INFO]${COLORS.reset} No SDD projects found. Start with /specify "Project Name"\n`);
        return;
    }

    const specFiles = fs.readdirSync(specsDir).filter(f => f.endsWith('-spec.md'));
    const projects = specFiles.map(f => f.replace('-spec.md', ''));

    if (projects.length === 0) {
        console.log(`\n${COLORS.yellow}[INFO]${COLORS.reset} No SDD projects found. Start with /specify "Project Name"\n`);
        return;
    }

    console.log(`\n${COLORS.cyan}${COLORS.bright}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}║              SDD PROJECTS OVERVIEW                      ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    for (const projectName of projects) {
        const project = getProjectTasks(projectRoot, projectName);
        
        if (!project) {
            console.log(`  ${COLORS.bright}${projectName}${COLORS.reset}`);
            console.log(`    ${COLORS.gray}Tasks not generated yet${COLORS.reset}`);
            console.log(`    ${COLORS.cyan}Run: /tasks "${projectName}"${COLORS.reset}\n`);
            continue;
        }

        const { counts } = project;
        const bar = getProgressBar(counts.done, counts.total, 15);
        const statusIcon = counts.done === counts.total && counts.total > 0 
            ? `${COLORS.green}✅` 
            : counts.inProgress > 0 
                ? `${COLORS.yellow}🔄` 
                : `${COLORS.gray}⏳`;

        console.log(`  ${statusIcon} ${COLORS.bright}${projectName}${COLORS.reset}`);
        console.log(`      [${bar}] ${counts.done}/${counts.total}`);
        
        if (counts.blocked > 0) {
            console.log(`      ${COLORS.red}🟡 Blocked: ${counts.blocked}${COLORS.reset}`);
        }
        console.log();
    }

    console.log(`${COLORS.gray}View specific project: node .qwen/scripts/task-dashboard.js [project-name]${COLORS.reset}\n`);
}

// Main
const args = process.argv.slice(2);
const projectName = args[0];
const watchMode = args.includes('--watch');

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    console.log(`${COLORS.red}[ERROR]${COLORS.reset} Could not find project root with .qwen directory`);
    process.exit(1);
}

if (watchMode) {
    // Watch mode - refresh every 5 seconds
    console.log(`${COLORS.cyan}[WATCH]${COLORS.reset} Watching for changes... (Ctrl+C to stop)\n`);
    
    if (projectName) {
        const display = () => displayProjectDashboard(projectRoot, projectName);
        display();
        
        const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
        let lastMtime = fs.existsSync(tasksPath) ? fs.statSync(tasksPath).mtime : null;
        
        setInterval(() => {
            if (fs.existsSync(tasksPath)) {
                const newMtime = fs.statSync(tasksPath).mtime;
                if (newMtime > lastMtime) {
                    lastMtime = newMtime;
                    console.clear();
                    display();
                }
            }
        }, 5000);
    } else {
        const display = () => displayAllProjects(projectRoot);
        display();
        
        setInterval(() => {
            console.clear();
            display();
        }, 10000);
    }
} else {
    if (projectName) {
        displayProjectDashboard(projectRoot, projectName);
    } else {
        displayAllProjects(projectRoot);
    }
}
