#!/usr/bin/env node

/**
 * SDD Workflow Orchestrator
 * 
 * Orchestrates the complete Spec-Driven Development workflow:
 * specify → plan → tasks → implement
 * 
 * Usage: node .qwen/scripts/sdd-workflow.js [command] [project]
 * 
 * Commands:
 *   init       - Initialize new SDD project
 *   status     - Show workflow status
 *   next       - Advance to next phase
 *   validate   - Validate current phase
 *   dashboard  - Open task dashboard
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

const log = {
    info: (msg) => console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${msg}`),
    success: (msg) => console.log(`${COLORS.green}[PASS]${COLORS.reset} ${msg}`),
    warning: (msg) => console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${msg}`),
    error: (msg) => console.log(`${COLORS.red}[FAIL]${COLORS.reset} ${msg}`),
    step: (msg) => console.log(`${COLORS.magenta}[STEP]${COLORS.reset} ${msg}`),
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

function ensureSddDirs(projectRoot) {
    const dirs = ['specs', 'plans', 'tasks'];
    for (const dir of dirs) {
        const dirPath = path.join(projectRoot, '.qwen', dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

function getPhaseStatus(projectRoot, projectName, phase) {
    const phaseMap = {
        specify: { file: 'specs', suffix: 'spec.md' },
        plan: { file: 'plans', suffix: 'plan.md' },
        tasks: { file: 'tasks', suffix: 'tasks.md' },
        implement: { file: 'tasks', suffix: 'tasks.md' }
    };
    
    const config = phaseMap[phase];
    if (!config) return 'unknown';
    
    const filePath = path.join(projectRoot, '.qwen', config.file, `${projectName}-${config.suffix}`);
    
    if (!fs.existsSync(filePath)) {
        return 'not_started';
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes('APPROVED') || content.includes('✅')) {
        return 'completed';
    }
    if (content.includes('DRAFT') || content.includes('IN_REVIEW')) {
        return 'in_progress';
    }
    if (content.includes('DONE') || content.includes('Done')) {
        return 'completed';
    }
    
    return 'started';
}

function getWorkflowStatus(projectRoot, projectName) {
    const phases = ['specify', 'plan', 'tasks', 'implement'];
    const status = {};
    
    let lastCompletedPhase = -1;
    
    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const phaseStatus = getPhaseStatus(projectRoot, projectName, phase);
        status[phase] = phaseStatus;
        
        if (phaseStatus === 'completed') {
            lastCompletedPhase = i;
        }
    }
    
    return {
        phases: status,
        currentPhase: phases[lastCompletedPhase + 1] || phases[0],
        nextPhase: phases[lastCompletedPhase + 1],
        completedPhases: lastCompletedPhase + 1,
        totalPhases: phases.length
    };
}

function displayWorkflowStatus(projectRoot, projectName) {
    const status = getWorkflowStatus(projectRoot, projectName);
    
    console.log(`\n${COLORS.cyan}${COLORS.bright}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}║          SDD WORKFLOW STATUS: ${projectName.toUpperCase().padEnd(35)}║${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    console.log(`${COLORS.yellow}Phase Progress:${COLORS.reset}\n`);
    
    const phaseLabels = {
        specify: '1. SPECIFY',
        plan: '2. PLAN',
        tasks: '3. TASKS',
        implement: '4. IMPLEMENT'
    };
    
    const statusIcons = {
        not_started: { icon: '⏳', color: COLORS.gray, label: 'NOT STARTED' },
        started: { icon: '🔄', color: COLORS.yellow, label: 'STARTED' },
        in_progress: { icon: '🔄', color: COLORS.yellow, label: 'IN PROGRESS' },
        completed: { icon: '✅', color: COLORS.green, label: 'COMPLETED' }
    };
    
    for (const [phase, phaseStatus] of Object.entries(status.phases)) {
        const { icon, color, label } = statusIcons[phaseStatus];
        const phaseLabel = phaseLabels[phase];
        console.log(`  ${phaseLabel} ${icon} ${color}${label}${COLORS.reset}`);
    }

    console.log(`\n${COLORS.yellow}Progress:${COLORS.reset} ${status.completedPhases}/${status.totalPhases} phases complete`);

    // Progress bar
    const barWidth = 30;
    const filled = Math.round((status.completedPhases / status.totalPhases) * barWidth);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    console.log(`  [${bar}] ${Math.round((status.completedPhases / status.totalPhases) * 100)}%\n`);

    // Next action
    console.log(`${COLORS.yellow}Next Actions:${COLORS.reset}\n`);
    
    if (status.nextPhase) {
        const commands = {
            specify: `/specify "${projectName}"`,
            plan: `/sdd-plan "${projectName}"`,
            tasks: `/tasks "${projectName}"`,
            implement: `/implement "${projectName}"`
        };
        
        console.log(`  ${COLORS.cyan}${commands[status.nextPhase]}${COLORS.reset}`);
        
        const descriptions = {
            specify: 'Define WHAT and WHY',
            plan: 'Define technical approach (HOW)',
            tasks: 'Break into actionable tasks',
            implement: 'Implement task by task'
        };
        
        console.log(`  ${COLORS.gray}${descriptions[status.nextPhase]}${COLORS.reset}\n`);
    }

    // Quick links
    console.log(`${COLORS.yellow}Utilities:${COLORS.reset}\n`);
    console.log(`  ${COLORS.cyan}node .qwen/scripts/sdd-status.js ${projectName}${COLORS.reset}`);
    console.log(`  ${COLORS.gray}View detailed phase status${COLORS.reset}\n`);
    
    console.log(`  ${COLORS.cyan}node .qwen/scripts/task-dashboard.js ${projectName}${COLORS.reset}`);
    console.log(`  ${COLORS.gray}Open task tracking dashboard${COLORS.reset}\n`);
    
    console.log(`  ${COLORS.cyan}node .qwen/scripts/validate-sdd-phase.js all ${projectName}${COLORS.reset}`);
    console.log(`  ${COLORS.gray}Validate all SDD phases${COLORS.reset}\n`);
}

function initProject(projectRoot, projectName) {
    ensureSddDirs(projectRoot);
    
    const specPath = path.join(projectRoot, '.qwen', 'specs', `${projectName}-spec.md`);
    const planPath = path.join(projectRoot, '.qwen', 'plans', `${projectName}-plan.md`);
    const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
    
    // Check if project already exists
    if (fs.existsSync(specPath) || fs.existsSync(planPath) || fs.existsSync(tasksPath)) {
        log.warning(`Project "${projectName}" already exists.`);
        displayWorkflowStatus(projectRoot, projectName);
        return;
    }
    
    log.success(`Initialized SDD project: ${projectName}`);
    log.info(`\nDirectory structure created:`);
    log.info(`  .qwen/specs/${projectName}-spec.md`);
    log.info(`  .qwen/plans/${projectName}-plan.md`);
    log.info(`  .qwen/tasks/${projectName}-tasks.md`);
    
    log.info(`\n${COLORS.yellow}Next step:${COLORS.reset}`);
    log.info(`  ${COLORS.cyan}/specify "${projectName}"${COLORS.reset}`);
    log.info(`  ${COLORS.gray}Define WHAT and WHY${COLORS.reset}`);
}

function advanceToNextPhase(projectRoot, projectName) {
    const status = getWorkflowStatus(projectRoot, projectName);
    
    if (!status.nextPhase) {
        log.success('All phases completed! 🎉');
        log.info('Project ready for deployment.');
        return;
    }
    
    const commands = {
        specify: `/specify "${projectName}"`,
        plan: `/sdd-plan "${projectName}"`,
        tasks: `/tasks "${projectName}"`,
        implement: `/implement "${projectName}"`
    };
    
    log.info(`Current phase: ${status.currentPhase}`);
    log.info(`Next phase: ${status.nextPhase}\n`);
    
    console.log(`${COLORS.cyan}Run this command:${COLORS.reset}`);
    console.log(`  ${COLORS.bright}${commands[status.nextPhase]}${COLORS.reset}\n`);
    
    const descriptions = {
        specify: 'Define the problem, user personas, success criteria',
        plan: 'Design the technical architecture and approach',
        tasks: 'Break the plan into actionable implementation tasks',
        implement: 'Execute tasks with TDD workflow'
    };
    
    console.log(`${COLORS.gray}${descriptions[status.nextPhase]}${COLORS.reset}\n`);
}

function validateCurrentPhase(projectRoot, projectName) {
    const status = getWorkflowStatus(projectRoot, projectName);
    
    log.info(`Validating current phase: ${status.currentPhase}\n`);
    
    const { execSync } = require('child_process');
    
    try {
        execSync(`node .qwen/scripts/validate-sdd-phase.js ${status.currentPhase} ${projectName}`, {
            cwd: projectRoot,
            stdio: 'inherit'
        });
    } catch (e) {
        // Validation script exits with non-zero on failure
    }
}

function openDashboard(projectRoot, projectName) {
    const { spawn } = require('child_process');
    
    log.info(`Opening task dashboard for "${projectName}"...\n`);
    
    const child = spawn('node', ['.qwen/scripts/task-dashboard.js', projectName], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true
    });
    
    child.on('close', (code) => {
        process.exit(code);
    });
}

function listProjects(projectRoot) {
    const specsDir = path.join(projectRoot, '.qwen', 'specs');
    
    if (!fs.existsSync(specsDir)) {
        log.info('No SDD projects found.');
        log.info('Initialize a new project: node .qwen/scripts/sdd-workflow.js init [project-name]');
        return;
    }
    
    const specFiles = fs.readdirSync(specsDir).filter(f => f.endsWith('-spec.md'));
    const projects = specFiles.map(f => f.replace('-spec.md', ''));
    
    if (projects.length === 0) {
        log.info('No SDD projects found.');
        return;
    }
    
    console.log(`\n${COLORS.cyan}${COLORS.bright}SDD Projects:${COLORS.reset}\n`);
    
    for (const project of projects) {
        const status = getWorkflowStatus(projectRoot, project);
        const completedCount = Object.values(status.phases).filter(s => s === 'completed').length;
        const bar = '█'.repeat(completedCount) + '░'.repeat(4 - completedCount);
        
        console.log(`  ${COLORS.bright}${project}${COLORS.reset}`);
        console.log(`    [${bar}] ${completedCount}/4 phases`);
    }
    
    console.log(`\n${COLORS.gray}View project: node .qwen/scripts/sdd-workflow.js status [project-name]${COLORS.reset}\n`);
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'status';
const projectName = args[1];

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    log.error('Could not find project root with .qwen directory');
    process.exit(1);
}

switch (command) {
    case 'init':
        if (!projectName) {
            log.error('Project name required: node .qwen/scripts/sdd-workflow.js init [project-name]');
            process.exit(1);
        }
        initProject(projectRoot, projectName);
        break;
        
    case 'status':
        if (!projectName) {
            listProjects(projectRoot);
        } else {
            displayWorkflowStatus(projectRoot, projectName);
        }
        break;
        
    case 'next':
        if (!projectName) {
            log.error('Project name required: node .qwen/scripts/sdd-workflow.js next [project-name]');
            process.exit(1);
        }
        advanceToNextPhase(projectRoot, projectName);
        break;
        
    case 'validate':
        if (!projectName) {
            log.error('Project name required: node .qwen/scripts/sdd-workflow.js validate [project-name]');
            process.exit(1);
        }
        validateCurrentPhase(projectRoot, projectName);
        break;
        
    case 'dashboard':
        if (!projectName) {
            log.error('Project name required: node .qwen/scripts/sdd-workflow.js dashboard [project-name]');
            process.exit(1);
        }
        openDashboard(projectRoot, projectName);
        break;
        
    case 'help':
    default:
        console.log(`
SDD Workflow Orchestrator

Usage: node .qwen/scripts/sdd-workflow.js [command] [project]

Commands:
  init       Initialize new SDD project
  status     Show workflow status (default)
  next       Show next phase to advance to
  validate   Validate current phase
  dashboard  Open task tracking dashboard

Examples:
  node .qwen/scripts/sdd-workflow.js init my-project
  node .qwen/scripts/sdd-workflow.js status
  node .qwen/scripts/sdd-workflow.js status my-project
  node .qwen/scripts/sdd-workflow.js next my-project
  node .qwen/scripts/sdd-workflow.js validate my-project
  node .qwen/scripts/sdd-workflow.js dashboard my-project
`);
        break;
}
