#!/usr/bin/env node

/**
 * SDD Phase Validator
 * 
 * Validates that SDD phases are completed in order and meet quality gates.
 * 
 * Usage: node .qwen/scripts/validate-sdd-phase.js [phase] [project]
 * 
 * Examples:
 *   node .qwen/scripts/validate-sdd-phase.js specify my-project
 *   node .qwen/scripts/validate-sdd-phase.js plan my-project
 *   node .qwen/scripts/validate-sdd-phase.js tasks my-project
 *   node .qwen/scripts/validate-sdd-phase.js implement my-project
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
};

const log = {
    info: (msg) => console.log(`${COLORS.cyan}[INFO]${COLORS.reset} ${msg}`),
    success: (msg) => console.log(`${COLORS.green}[PASS]${COLORS.reset} ${msg}`),
    warning: (msg) => console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${msg}`),
    error: (msg) => console.log(`${COLORS.red}[FAIL]${COLORS.reset} ${msg}`),
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

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        log.success(`${description} exists: ${filePath}`);
        return true;
    } else {
        log.error(`${description} missing: ${filePath}`);
        return false;
    }
}

function checkFileContent(filePath, requiredSections, phase) {
    if (!fs.existsSync(filePath)) {
        return false;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let allPresent = true;

    for (const section of requiredSections) {
        if (content.toLowerCase().includes(section.toLowerCase())) {
            log.success(`Section "${section}" present in ${path.basename(filePath)}`);
        } else {
            log.error(`Section "${section}" missing in ${path.basename(filePath)}`);
            allPresent = false;
        }
    }

    return allPresent;
}

function validateSpecifyPhase(projectRoot, projectName) {
    log.info('=== Validating SPECIFY Phase ===\n');
    
    const specPath = path.join(projectRoot, '.qwen', 'specs', `${projectName}-spec.md`);
    const requiredSections = [
        'problem statement',
        'user personas',
        'user journeys',
        'success criteria',
        'scope',
        'constraints',
        'risks'
    ];

    const exists = checkFileExists(specPath, 'Specification');
    if (!exists) {
        log.error('Specification file not found. Run /specify first.');
        return false;
    }

    const hasSections = checkFileContent(specPath, requiredSections, 'specify');
    
    // Check for approval status
    const content = fs.readFileSync(specPath, 'utf-8');
    if (content.includes('APPROVED')) {
        log.success('Specification is marked as APPROVED');
    } else {
        log.warning('Specification is not yet APPROVED (still in DRAFT or IN_REVIEW)');
    }

    return exists && hasSections;
}

function validatePlanPhase(projectRoot, projectName) {
    log.info('=== Validating PLAN Phase ===\n');
    
    const planPath = path.join(projectRoot, '.qwen', 'plans', `${projectName}-plan.md`);
    const specPath = path.join(projectRoot, '.qwen', 'specs', `${projectName}-spec.md`);
    
    const requiredSections = [
        'architecture',
        'technology stack',
        'api design',
        'data models',
        'security',
        'testing strategy',
        'deployment'
    ];

    // Check spec exists first
    if (!checkFileExists(specPath, 'Specification (prerequisite)')) {
        log.error('Cannot validate plan without specification. Run /specify first.');
        return false;
    }

    const exists = checkFileExists(planPath, 'Technical Plan');
    if (!exists) {
        log.error('Technical plan not found. Run /sdd-plan first.');
        return false;
    }

    const hasSections = checkFileContent(planPath, requiredSections, 'plan');
    
    // Check for linked spec
    const content = fs.readFileSync(planPath, 'utf-8');
    if (content.includes('Linked Spec') || content.includes('spec.md')) {
        log.success('Plan links to specification');
    } else {
        log.warning('Plan should link to specification');
    }

    return exists && hasSections;
}

function validateTasksPhase(projectRoot, projectName) {
    log.info('=== Validating TASKS Phase ===\n');
    
    const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
    const planPath = path.join(projectRoot, '.qwen', 'plans', `${projectName}-plan.md`);
    
    const requiredSections = [
        'task summary',
        'task definitions',
        'phase 1',
        'acceptance criteria',
        'dependencies',
        'definition of done'
    ];

    // Check plan exists first
    if (!checkFileExists(planPath, 'Technical Plan (prerequisite)')) {
        log.error('Cannot validate tasks without plan. Run /sdd-plan first.');
        return false;
    }

    const exists = checkFileExists(tasksPath, 'Tasks Document');
    if (!exists) {
        log.error('Tasks document not found. Run /tasks first.');
        return false;
    }

    const hasSections = checkFileContent(tasksPath, requiredSections, 'tasks');
    
    // Check for task IDs
    const content = fs.readFileSync(tasksPath, 'utf-8');
    const taskIds = content.match(/T-\d+/g);
    if (taskIds && taskIds.length > 0) {
        log.success(`Found ${taskIds.length} tasks defined (${taskIds[0]} to ${taskIds[taskIds.length - 1]})`);
    } else {
        log.error('No task IDs (T-001, T-002, etc.) found');
        return false;
    }

    // Check for dependency graph
    if (content.includes('Dependency') || content.includes('→') || content.includes('┌')) {
        log.success('Dependency graph present');
    } else {
        log.warning('Dependency graph missing');
    }

    return exists && hasSections;
}

function validateImplementPhase(projectRoot, projectName, taskId) {
    log.info('=== Validating IMPLEMENT Phase ===\n');
    
    const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
    
    if (!fs.existsSync(tasksPath)) {
        log.error('Tasks document not found. Run /tasks first.');
        return false;
    }

    const content = fs.readFileSync(tasksPath, 'utf-8');
    
    // Check if task exists
    if (taskId) {
        if (content.includes(taskId)) {
            log.success(`Task ${taskId} found in tasks document`);
        } else {
            log.error(`Task ${taskId} not found in tasks document`);
            return false;
        }

        // Check task status
        const taskMatch = content.match(new RegExp(`${taskId}.*?(✅|🔄|⏳|🟡)`));
        if (taskMatch) {
            const status = taskMatch[1];
            const statusMap = { '✅': 'Done', '🔄': 'In Progress', '⏳': 'Pending', '🟡': 'Blocked' };
            log.info(`Task ${taskId} status: ${statusMap[status] || status}`);
        }
    }

    // Check for implementation log
    if (content.includes('Implementation Log') || content.includes('**Started:**')) {
        log.success('Implementation log present');
    }

    return true;
}

function validateAllPhases(projectRoot, projectName) {
    log.info(`=== Full SDD Validation for "${projectName}" ===\n`);
    
    const results = {
        specify: validateSpecifyPhase(projectRoot, projectName),
        plan: validatePlanPhase(projectRoot, projectName),
        tasks: validateTasksPhase(projectRoot, projectName),
        implement: validateImplementPhase(projectRoot, projectName, null)
    };

    log.info('\n=== Summary ===\n');
    
    Object.entries(results).forEach(([phase, passed]) => {
        const icon = passed ? '✅' : '❌';
        log.info(`${icon} ${phase.toUpperCase()}: ${passed ? 'PASS' : 'INCOMPLETE'}`);
    });

    const allPassed = Object.values(results).every(r => r);
    
    if (allPassed) {
        log.success('\n🎉 All SDD phases validated successfully!');
    } else {
        log.error('\n⚠️  Some phases are incomplete. Complete each phase before proceeding.');
    }

    return allPassed;
}

// Main
const args = process.argv.slice(2);
const phase = args[0];
const projectName = args[1];
const taskId = args.find(arg => arg.startsWith('T-'));

if (!phase || !projectName) {
    console.log(`
Usage: node .qwen/scripts/validate-sdd-phase.js [phase] [project] [task]

Phases:
  specify   - Validate specification exists and has required sections
  plan      - Validate technical plan exists and links to spec
  tasks     - Validate tasks are defined with dependencies
  implement - Validate task implementation progress
  all       - Validate all phases

Examples:
  node .qwen/scripts/validate-sdd-phase.js specify my-project
  node .qwen/scripts/validate-sdd-phase.js plan my-project
  node .qwen/scripts/validate-sdd-phase.js tasks my-project
  node .qwen/scripts/validate-sdd-phase.js implement my-project T-001
  node .qwen/scripts/validate-sdd-phase.js all my-project
`);
    process.exit(1);
}

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    log.error('Could not find project root with .qwen directory');
    process.exit(1);
}

log.info(`Project root: ${projectRoot}`);
log.info(`Project name: ${projectName}\n`);

let success = false;

switch (phase.toLowerCase()) {
    case 'specify':
        success = validateSpecifyPhase(projectRoot, projectName);
        break;
    case 'plan':
        success = validatePlanPhase(projectRoot, projectName);
        break;
    case 'tasks':
        success = validateTasksPhase(projectRoot, projectName);
        break;
    case 'implement':
        success = validateImplementPhase(projectRoot, projectName, taskId);
        break;
    case 'all':
        success = validateAllPhases(projectRoot, projectName);
        break;
    default:
        log.error(`Unknown phase: ${phase}`);
        console.log('Valid phases: specify, plan, tasks, implement, all');
        process.exit(1);
}

process.exit(success ? 0 : 1);
