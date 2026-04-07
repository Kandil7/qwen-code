#!/usr/bin/env node

/**
 * SDD Auto-Task Generator
 * 
 * Automatically generates task breakdowns from specs and plans using AI analysis.
 * Parses specification and technical plan to extract actionable tasks.
 * 
 * Usage: node .qwen/scripts/auto-task-generator.js [project]
 * 
 * Examples:
 *   node .qwen/scripts/auto-task-generator.js my-project    # Generate tasks from existing spec/plan
 *   node .qwen/scripts/auto-task-generator.js my-project  # With AI analysis
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

/**
 * Task patterns by category - helps identify tasks from spec/plan content
 */
const TASK_PATTERNS = {
    // Foundation tasks
    foundation: {
        keywords: ['setup', 'initialize', 'config', 'install', 'dependencies', 'project structure'],
        tasks: [
            { pattern: /project structure/i, task: 'Set up project structure', agent: 'software-engineer', effort: 'S' },
            { pattern: /config.*database|db.*config/i, task: 'Configure database connection', agent: 'database-engineer', effort: 'S' },
            { pattern: /config.*environment|\.env/i, task: 'Configure environment variables', agent: 'software-engineer', effort: 'S' },
            { pattern: /dependencies|package\.json/i, task: 'Install and configure dependencies', agent: 'software-engineer', effort: 'S' },
        ]
    },
    // Data layer
    data: {
        keywords: ['model', 'schema', 'database', 'migration', 'entity'],
        tasks: [
            { pattern: /user.*model|create.*user.*model/i, task: 'Create user data model', agent: 'database-engineer', effort: 'M' },
            { pattern: /data.*migration|migration/i, task: 'Create database migrations', agent: 'database-engineer', effort: 'M' },
            { pattern: /repository|data.*access/i, task: 'Implement data repository', agent: 'database-engineer', effort: 'M' },
        ]
    },
    // API layer
    api: {
        keywords: ['endpoint', 'api', 'route', 'request', 'response', 'crud'],
        tasks: [
            { pattern: /api.*endpoint|endpoint/i, task: 'Implement API endpoints', agent: 'api-engineer', effort: 'M' },
            { pattern: /crud|create.*read.*update.*delete/i, task: 'Implement CRUD operations', agent: 'api-engineer', effort: 'M' },
            { pattern: /validation|request.*body/i, task: 'Add request validation', agent: 'api-engineer', effort: 'S' },
            { pattern: /error.*handling|error.*response/i, task: 'Implement error handling', agent: 'api-engineer', effort: 'S' },
        ]
    },
    // Business logic
    business: {
        keywords: ['service', 'business logic', 'domain', 'use case'],
        tasks: [
            { pattern: /service.*layer|business.*logic/i, task: 'Implement service layer', agent: 'software-engineer', effort: 'M' },
            { pattern: /authentication|auth|login/i, task: 'Implement authentication', agent: 'software-engineer', effort: 'L' },
            { pattern: /authorization|permission|access.*control/i, task: 'Implement authorization', agent: 'security-compliance-engineer', effort: 'M' },
        ]
    },
    // AI/ML
    ai: {
        keywords: ['llm', 'rag', 'embedding', 'ai', 'chat', 'vector'],
        tasks: [
            { pattern: /rag|retrieval.*augmented/i, task: 'Implement RAG pipeline', agent: 'full-stack-ai-engineer', effort: 'L' },
            { pattern: /embedding|vector.*search/i, task: 'Implement embedding generation', agent: 'embedding-engineer', effort: 'M' },
            { pattern: /chat.*api|conversation/i, task: 'Implement chat API', agent: 'api-engineer', effort: 'M' },
            { pattern: /prompt/i, task: 'Design and implement prompts', agent: 'prompt-engineer', effort: 'M' },
            { pattern: /vector.*database/i, task: 'Set up vector database', agent: 'vector-db-engineer', effort: 'M' },
        ]
    },
    // Frontend
    frontend: {
        keywords: ['ui', 'component', 'page', 'view', 'frontend', 'react'],
        tasks: [
            { pattern: /component|ui.*element/i, task: 'Build UI components', agent: 'frontend-engineer', effort: 'M' },
            { pattern: /page.*layout|layout/i, task: 'Implement page layouts', agent: 'frontend-engineer', effort: 'M' },
            { pattern: /state.*management|state/i, task: 'Implement state management', agent: 'frontend-engineer', effort: 'M' },
        ]
    },
    // Security
    security: {
        keywords: ['security', 'auth', 'encryption', 'sanitize', 'guardrail'],
        tasks: [
            { pattern: /security.*audit|security.*check/i, task: 'Perform security audit', agent: 'security-compliance-engineer', effort: 'S' },
            { pattern: /input.*sanitiz|xss|csrf/i, task: 'Implement input sanitization', agent: 'security-compliance-engineer', effort: 'M' },
            { pattern: /rate.*limit/i, task: 'Add rate limiting', agent: 'security-compliance-engineer', effort: 'S' },
        ]
    },
    // Testing
    testing: {
        keywords: ['test', 'unit', 'integration', 'e2e', 'coverage'],
        tasks: [
            { pattern: /unit.*test/i, task: 'Write unit tests', agent: 'qa-automation-engineer', effort: 'M' },
            { pattern: /integration.*test/i, task: 'Write integration tests', agent: 'qa-automation-engineer', effort: 'M' },
            { pattern: /e2e|end.*to.*end/i, task: 'Write E2E tests', agent: 'qa-automation-engineer', effort: 'L' },
        ]
    },
    // DevOps
    devops: {
        keywords: ['deploy', 'docker', 'ci/cd', 'pipeline', 'infrastructure'],
        tasks: [
            { pattern: /docker|container/i, task: 'Set up Docker configuration', agent: 'dev-ops-platform-engineer', effort: 'M' },
            { pattern: /ci.*cd|pipeline/i, task: 'Set up CI/CD pipeline', agent: 'dev-ops-platform-engineer', effort: 'M' },
            { pattern: /monitoring|observability|logging/i, task: 'Set up monitoring and logging', agent: 'observability-engineer', effort: 'M' },
        ]
    },
    // Documentation
    docs: {
        keywords: ['document', 'readme', 'api.*doc', 'guide'],
        tasks: [
            { pattern: /readme|documentation/i, task: 'Write README and documentation', agent: 'documentation-writer', effort: 'S' },
            { pattern: /api.*doc|swagger|openapi/i, task: 'Generate API documentation', agent: 'documentation-writer', effort: 'S' },
        ]
    }
};

/**
 * Extract tasks from specification and plan content
 */
function extractTasksFromContent(specContent, planContent) {
    const allContent = (specContent || '') + '\n' + (planContent || '');
    const extractedTasks = [];
    const seenTasks = new Set();

    // Process each category
    for (const [category, config] of Object.entries(TASK_PATTERNS)) {
        // Check if content matches category keywords
        const matchesKeywords = config.keywords.some(kw => 
            allContent.toLowerCase().includes(kw.toLowerCase())
        );

        if (matchesKeywords) {
            for (const taskConfig of config.tasks) {
                if (taskConfig.pattern.test(allContent) && !seenTasks.has(taskConfig.task)) {
                    seenTasks.add(taskConfig.task);
                    extractedTasks.push({
                        id: `T-${String(extractedTasks.length + 1).padStart(3, '0')}`,
                        task: taskConfig.task,
                        agent: taskConfig.agent,
                        effort: taskConfig.effort,
                        category: category,
                        dependencies: []
                    });
                }
            }
        }
    }

    // Also extract explicit feature requests from content
    const featurePatterns = [
        /(?:feature|functionality|capability):\s*([^\n]+)/gi,
        /-?\s*\*\s*\[\s*\]\s*([^\n]+)/g,
        /(?:implement|build|create|add)\s+([^\n\.]+?)(?:\.|,|$)/gi
    ];

    for (const pattern of featurePatterns) {
        let match;
        while ((match = pattern.exec(allContent)) !== null) {
            const feature = match[1].trim();
            if (feature.length > 10 && feature.length < 100 && !seenTasks.has(feature)) {
                seenTasks.add(feature);
                extractedTasks.push({
                    id: `T-${String(extractedTasks.length + 1).padStart(3, '0')}`,
                    task: feature,
                    agent: 'software-engineer',
                    effort: 'M',
                    category: 'extracted',
                    dependencies: []
                });
            }
        }
    }

    return extractedTasks;
}

/**
 * Assign tasks to phases based on dependencies and category
 */
function assignPhases(tasks) {
    const phaseMap = {
        foundation: 1,
        data: 1,
        api: 2,
        business: 2,
        ai: 2,
        frontend: 2,
        security: 2,
        testing: 3,
        devops: 3,
        docs: 3,
        extracted: 2
    };

    // Build dependency graph
    const taskMap = new Map();
    tasks.forEach(t => taskMap.set(t.id, t));

    // Tasks in earlier phases are dependencies for later phases
    tasks.forEach((task, index) => {
        const phase = phaseMap[t.category] || 2;
        
        // Tasks from earlier phases are dependencies
        tasks.forEach((depTask, depIndex) => {
            const depPhase = phaseMap[depTask.category] || 2;
            if (depPhase < phase && index !== depIndex) {
                if (!task.dependencies.includes(depTask.id)) {
                    task.dependencies.push(depTask.id);
                }
            }
        });
    });

    return tasks.map(t => ({
        ...t,
        phase: phaseMap[t.category] || 2
    }));
}

/**
 * Generate task breakdown markdown
 */
function generateTasksMarkdown(projectName, specPath, planPath) {
    const specContent = fs.existsSync(specPath) ? fs.readFileSync(specPath, 'utf-8') : '';
    const planContent = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf-8') : '';

    // Extract and process tasks
    let tasks = extractTasksFromContent(specContent, planContent);
    
    // Add essential tasks if none found
    if (tasks.length === 0) {
        log.warning('No specific tasks found. Adding essential tasks...');
        tasks = [
            { id: 'T-001', task: 'Set up project structure', agent: 'software-engineer', effort: 'S', category: 'foundation', dependencies: [], phase: 1 },
            { id: 'T-002', task: 'Configure database connection', agent: 'database-engineer', effort: 'S', category: 'data', dependencies: ['T-001'], phase: 1 },
            { id: 'T-003', task: 'Implement core business logic', agent: 'software-engineer', effort: 'M', category: 'business', dependencies: ['T-002'], phase: 2 },
            { id: 'T-004', task: 'Implement API endpoints', agent: 'api-engineer', effort: 'M', category: 'api', dependencies: ['T-003'], phase: 2 },
            { id: 'T-005', task: 'Write unit tests', agent: 'qa-automation-engineer', effort: 'M', category: 'testing', dependencies: ['T-004'], phase: 3 },
            { id: 'T-006', task: 'Set up CI/CD pipeline', agent: 'dev-ops-platform-engineer', effort: 'M', category: 'devops', dependencies: ['T-005'], phase: 3 },
        ];
    } else {
        tasks = assignPhases(tasks);
    }

    // Group by phase
    const phases = {
        1: tasks.filter(t => t.phase === 1),
        2: tasks.filter(t => t.phase === 2),
        3: tasks.filter(t => t.phase === 3)
    };

    // Generate markdown
    const now = new Date().toISOString().split('T')[0];
    let md = `# Tasks: ${projectName}

**Generated:** ${now}
**Source:** [.qwen/specs/${projectName}-spec.md](../specs/${projectName}-spec.md)
**Source:** [.qwen/plans/${projectName}-plan.md](../plans/${projectName}-plan.md)

## Task Summary

| ID | Task | Phase | Effort | Dependencies | Agent |
|----|------|-------|--------|--------------|-------|
${tasks.map(t => `| ${t.id} | ${t.task} | ${t.phase} | ${t.effort} | ${t.dependencies.join(', ') || '-'} | @${t.agent} |`).join('\n')}

## Task Definitions

`;

    for (const [phaseNum, phaseTasks] of Object.entries(phases)) {
        md += `### Phase ${phaseNum}: ${phaseNum === '1' ? 'Foundation' : phaseNum === '2' ? 'Core Features' : 'Polish & Deployment'}\n\n`;

        for (const task of phaseTasks) {
            md += `#### ${task.id}: ${task.task}
**Description:** ${task.task}

**Acceptance Criteria:**
- [ ] Implementation complete
- [ ] Tests written and passing
- [ ] Code reviewed

**Agent:** @${task.agent}
**Effort:** ${task.effort} (${task.effort === 'S' ? '< 30 min' : task.effort === 'M' ? '30-60 min' : task.effort === 'L' ? '1-2 hours' : '2+ hours'})
**Dependencies:** ${task.dependencies.join(', ') || 'None'}
**Category:** ${task.category}

---

`;
        }
    }

    // Dependency graph
    md += `## Dependency Graph

\`\`\n`;
    tasks.forEach(t => {
        if (t.dependencies.length > 0) {
            md += `${t.id} → ${t.dependencies.join(', ')}\n`;
        }
    });
    md += `\`\`\n\n`;

    // Critical path (longest chain)
    const criticalPath = [];
    let currentPhase = 1;
    for (const phaseTasks of Object.values(phases)) {
        if (phaseTasks.length > 0) {
            criticalPath.push(phaseTasks[0].id);
        }
    }
    md += `## Critical Path

\`\`\n${criticalPath.join(' → ')}\n\`\`\n\n**Total Tasks:** ${tasks.length}
**Estimated Total Effort:** ${tasks.reduce((acc, t) => acc + (t.effort === 'S' ? 0.5 : t.effort === 'M' ? 1 : t.effort === 'L' ? 2 : 4), 0)} hours

## Task Status Tracking

| ID | Status | Started | Completed | Notes |
|----|--------|---------|-----------|-------|
${tasks.map(t => `| ${t.id} | ⏳ Pending | - | - | |`).join('\n')}

## Definition of Done (Per Task)

- [ ] Code implemented per plan
- [ ] Unit tests written and passing
- [ ] Integration tests if applicable
- [ ] Code reviewed (\`/code-review\`)
- [ ] Security checked (\`/security-scan\`)
- [ ] Pre-commit verification (\`/verify\`)
- [ ] Committed with conventional commit message

---

**Status:** DRAFT
**Auto-Generated:** true
**Last Updated:** ${now}
`;

    return md;
}

/**
 * Generate next task from current progress
 */
function generateNextTaskPrompt(projectRoot, projectName) {
    const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
    
    if (!fs.existsSync(tasksPath)) {
        log.error('Tasks file not found. Run /tasks first.');
        return null;
    }

    const content = fs.readFileSync(tasksPath, 'utf-8');
    
    // Find next pending task
    const pendingMatch = content.match(/\| (T-\d+) \| ⏳ Pending \|/);
    if (!pendingMatch) {
        log.success('All tasks completed!');
        return null;
    }

    const taskId = pendingMatch[1];
    const taskSection = content.match(new RegExp(`#### ${taskId}: ([^\\n]+)`));
    
    return {
        taskId,
        taskName: taskSection ? taskSection[1] : 'Unknown task',
        command: `/implement "${projectName} --task ${taskId}"`
    };
}

// Main
const args = process.argv.slice(2);
const projectName = args[0];
const mode = args[1] || 'generate'; // generate, next, status

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    log.error('Could not find project root with .qwen directory');
    process.exit(1);
}

if (!projectName) {
    console.log(`
SDD Auto-Task Generator

Usage: node .qwen/scripts/auto-task-generator.js [project] [mode]

Modes:
  generate  - Generate tasks from spec/plan (default)
  next      - Show next pending task to implement
  status    - Show task completion status

Examples:
  node .qwen/scripts/auto-task-generator.js my-project generate
  node .qwen/scripts/auto-task-generator.js my-project next
  node .qwen/scripts/auto-task-generator.js my-project status
`);
    process.exit(1);
}

log.info(`Project: ${projectName}`);
log.info(`Mode: ${mode}\n`);

switch (mode) {
    case 'generate':
        const specPath = path.join(projectRoot, '.qwen', 'specs', `${projectName}-spec.md`);
        const planPath = path.join(projectRoot, '.qwen', 'plans', `${projectName}-plan.md`);
        const tasksPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);

        // Ensure tasks directory exists
        const tasksDir = path.join(projectRoot, '.qwen', 'tasks');
        if (!fs.existsSync(tasksDir)) {
            fs.mkdirSync(tasksDir, { recursive: true });
        }

        log.step('Generating task breakdown...');
        const tasksMd = generateTasksMarkdown(projectName, specPath, planPath);
        
        fs.writeFileSync(tasksPath, tasksMd);
        log.success(`Tasks saved to: ${tasksPath}`);

        // Count tasks
        const taskCount = (tasksMd.match(/T-\d+/g) || []).length;
        log.info(`Generated ${taskCount} tasks`);
        
        // Show phase distribution
        const phase1Count = (tasksMd.match(/\| T-\d+ \|.*\| 1 \|/g) || []).length;
        const phase2Count = (tasksMd.match(/\|\s*T-\d+\s*\|.*\|\s*2\s*\|/g) || []).length;
        const phase3Count = (tasksMd.match(/\|\s*T-\d+\s*\|.*\|\s*3\s*\|/g) || []).length;
        
        log.info(`Phase 1 (Foundation): ${phase1Count} tasks`);
        log.info(`Phase 2 (Core Features): ${phase2Count} tasks`);
        log.info(`Phase 3 (Polish): ${phase3Count} tasks`);
        break;

    case 'next':
        const nextTask = generateNextTaskPrompt(projectRoot, projectName);
        if (nextTask) {
            console.log(`\n${COLORS.cyan}Next Task:${COLORS.reset}`);
            console.log(`  ${COLORS.yellow}${nextTask.taskId}:${COLORS.reset} ${nextTask.taskName}`);
            console.log(`\n${COLORS.cyan}Command:${COLORS.reset}`);
            console.log(`  ${nextTask.command}\n`);
        }
        break;

    case 'status':
        const statusPath = path.join(projectRoot, '.qwen', 'tasks', `${projectName}-tasks.md`);
        if (!fs.existsSync(statusPath)) {
            log.error('Tasks file not found. Run with generate mode first.');
            process.exit(1);
        }

        const statusContent = fs.readFileSync(statusPath, 'utf-8');
        const doneMatch = statusContent.match(/\| T-\d+ \| ✅/g) || [];
        const inProgressMatch = statusContent.match(/\| T-\d+ \| 🔄/g) || [];
        const pendingMatch = statusContent.match(/\| T-\d+ \| ⏳/g) || [];

        console.log(`\n${COLORS.cyan}Task Status:${COLORS.reset}`);
        console.log(`  ${COLORS.green}Completed:${COLORS.reset} ${doneMatch.length}`);
        console.log(`  ${COLORS.yellow}In Progress:${COLORS.reset} ${inProgressMatch.length}`);
        console.log(`  ${COLORS.gray}Pending:${COLORS.reset} ${pendingMatch.length}`);
        
        const total = doneMatch.length + inProgressMatch.length + pendingMatch.length;
        if (total > 0) {
            const progress = Math.round((doneMatch.length / total) * 100);
            const bar = '█'.repeat(Math.round(progress / 5)) + '░'.repeat(20 - Math.round(progress / 5));
            console.log(`\n  [${bar}] ${progress}%`);
        }
        console.log();
        break;

    default:
        log.error(`Unknown mode: ${mode}`);
        process.exit(1);
}
