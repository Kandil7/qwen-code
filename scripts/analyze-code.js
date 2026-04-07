#!/usr/bin/env node

/**
 * Code Analysis Tool
 * 
 * Analyzes code structure and generates insights.
 * Provides code metrics, patterns, and architecture.
 * 
 * Usage: node .qwen/scripts/analyze-code.js [options]
 * 
 * Options:
 *   --metrics    Show code metrics
 *   --patterns  Detect patterns
 *   --deps     Show dependencies
 *   --structure Show project structure
 *   --all      Full analysis (default)
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

function getFiles(dir, extensions) {
    const files = [];
    
    function walk(currentDir, depth = 0) {
        if (depth > 5) return;
        
        try {
            const entries = fs.readdirSync(currentDir);
            
            for (const entry of entries) {
                if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist' || entry === 'build') {
                    continue;
                }
                
                const fullPath = path.join(currentDir, entry);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    walk(fullPath, depth + 1);
                } else if (stat.isFile()) {
                    const ext = path.extname(entry);
                    if (!extensions || extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (e) {
            // Skip inaccessible directories
        }
    }
    
    walk(dir);
    return files;
}

function countLines(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        return {
            total: lines.length,
            code: lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('/*')).length,
            comments: lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*')).length,
            blank: lines.filter(l => !l.trim()).length,
        };
    } catch (e) {
        return { total: 0, code: 0, comments: 0, blank: 0 };
    }
}

function detectLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const langMap = {
        '.js': 'JavaScript',
        '.jsx': 'JavaScript (React)',
        '.ts': 'TypeScript',
        '.tsx': 'TypeScript (React)',
        '.py': 'Python',
        '.java': 'Java',
        '.go': 'Go',
        '.rs': 'Rust',
        '.rb': 'Ruby',
        '.php': 'PHP',
        '.cs': 'C#',
        '.cpp': 'C++',
        '.c': 'C',
        '.md': 'Markdown',
        '.json': 'JSON',
        '.yaml': 'YAML',
        '.yml': 'YAML',
    };
    return langMap[ext] || ext;
}

function showMetrics(projectRoot) {
    console.log(`\n${COLORS.cyan}${COLORS.bright}Code Metrics:${COLORS.reset}\n`);
    
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rs', '.rb', '.php', '.cs', '.cpp', '.c', '.md', '.json'];
    const files = getFiles(path.join(projectRoot, 'src') || projectRoot, extensions);
    
    let totalLines = 0;
    let totalCode = 0;
    let totalComments = 0;
    let totalBlank = 0;
    const byLanguage = {};
    
    for (const file of files) {
        const lines = countLines(file);
        totalLines += lines.total;
        totalCode += lines.code;
        totalComments += lines.comments;
        totalBlank += lines.blank;
        
        const lang = detectLanguage(file);
        if (!byLanguage[lang]) {
            byLanguage[lang] = { files: 0, lines: 0 };
        }
        byLanguage[lang].files++;
        byLanguage[lang].lines += lines.total;
    }
    
    console.log(`  Total Files: ${files.length}`);
    console.log(`  Total Lines: ${totalLines}`);
    console.log(`  Code: ${totalCode} (${Math.round(totalCode / totalLines * 100)}%)`);
    console.log(`  Comments: ${totalComments} (${Math.round(totalComments / totalLines * 100)}%)`);
    console.log(`  Blank: ${totalBlank} (${Math.round(totalBlank / totalLines * 100)}%)\n`);
    
    console.log(`  ${COLORS.yellow}By Language:${COLORS.reset}`);
    for (const [lang, data] of Object.entries(byLanguage)) {
        console.log(`    ${lang}: ${data.files} files, ${data.lines} lines`);
    }
}

function showStructure(projectRoot) {
    console.log(`\n${COLORS.cyan}${COLORS.bright}Project Structure:${COLORS.reset}\n`);
    
    function tree(dir, prefix = '', depth = 0) {
        if (depth > 3) return;
        
        try {
            const entries = fs.readdirSync(dir).filter(e => 
                !e.startsWith('.') && 
                e !== 'node_modules' && 
                e !== 'dist' && 
                e !== 'build' &&
                e !== '.git'
            ).sort();
            
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                const fullPath = path.join(dir, entry);
                const stat = fs.statSync(fullPath);
                const isLast = i === entries.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                
                if (stat.isDirectory()) {
                    console.log(`${prefix}${connector}${COLORS.cyan}${entry}${COLORS.reset}`);
                    tree(fullPath, prefix + (isLast ? '    ' : '│   '), depth + 1);
                } else {
                    const ext = path.extname(entry);
                    let color = 'gray';
                    if (['.js', '.ts'].includes(ext)) color = 'yellow';
                    if (['.json', '.yaml'].includes(ext)) color = 'blue';
                    if (['.md'].includes(ext)) color = 'green';
                    console.log(`${prefix}${connector}${COLORS[color]}${entry}${COLORS.reset}`);
                }
            }
        } catch (e) {
            // Skip
        }
    }
    
    tree(projectRoot);
}

function showPatterns(projectRoot) {
    console.log(`\n${COLORS.cyan}${COLORS.bright}Detected Patterns:${COLORS.reset}\n`);
    
    const patterns = [];
    const packageJson = path.join(projectRoot, 'package.json');
    const requirements = path.join(projectRoot, 'requirements.txt');
    const pyproject = path.join(projectRoot, 'pyproject.toml');
    
    if (fs.existsSync(packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        if (deps.express || deps.fastify) patterns.push('Express/Fastify API');
        if (deps.react) patterns.push('React');
        if (deps.vue) patterns.push('Vue');
        if (deps.angular) patterns.push('Angular');
        if (deps.next) patterns.push('Next.js');
        if (deps.nestjs) patterns.push('NestJS');
        if (deps.typeorm || deps.sequelize || deps.prisma) patterns.push('ORM');
        if (deps.mongoose) patterns.push('MongoDB');
        if (deps.jest) patterns.push('Jest');
        if (deps.vitest) patterns.push('Vitest');
        if (deps.playwright) patterns.push('Playwright');
    }
    
    if (fs.existsSync(requirements) || fs.existsSync(pyproject)) {
        patterns.push('Python');
        if (fs.existsSync(requirements)) {
            const req = fs.readFileSync(requirements, 'utf-8');
            if (req.includes('fastapi')) patterns.push('FastAPI');
            if (req.includes('django')) patterns.push('Django');
            if (req.includes('flask')) patterns.push('Flask');
            if (req.includes('pytest')) patterns.push('pytest');
        }
    }
    
    if (patterns.length === 0) {
        console.log(`  ${COLORS.gray}No specific patterns detected${COLORS.reset}`);
    } else {
        for (const pattern of patterns) {
            console.log(`  ${COLORS.green}✓${COLORS.reset} ${pattern}`);
        }
    }
}

function showDeps(projectRoot) {
    console.log(`\n${COLORS.cyan}${COLORS.bright}Dependencies:${COLORS.reset}\n`);
    
    const packageJson = path.join(projectRoot, 'package.json');
    const requirements = path.join(projectRoot, 'requirements.txt');
    
    if (fs.existsSync(packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        
        console.log(`  ${COLORS.yellow}Dependencies:${COLORS.reset}`);
        for (const [name, version] of Object.entries(deps)) {
            console.log(`    ${name}: ${version}`);
        }
    } else if (fs.existsSync(requirements)) {
        const req = fs.readFileSync(requirements, 'utf-8');
        console.log(`  ${COLORS.yellow}Python Dependencies:${COLORS.reset}`);
        console.log(req);
    } else {
        console.log(`  ${COLORS.gray}No dependencies file found${COLORS.reset}`);
    }
}

function showFullAnalysis(projectRoot) {
    console.log(`\n${COLORS.cyan}${COLORS.bright}╔═══════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}║        Code Analysis               ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}${COLORS.bright}╚═══════════════════════════════════════╝${COLORS.reset}\n`);
    
    showMetrics(projectRoot);
    console.log();
    showPatterns(projectRoot);
    console.log();
    showStructure(projectRoot);
    console.log();
    showDeps(projectRoot);
}

function showHelp() {
    console.log(`
Code Analysis Tool

Usage: node .qwen/scripts/analyze-code.js [options]

Options:
  --metrics    Show code metrics
  --patterns  Detect patterns
  --deps      Show dependencies
  --structure Show project structure
  --all       Full analysis (default)

Examples:
  node .qwen/scripts/analyze-code.js
  node .qwen/scripts/analyze-code.js --metrics
  node .qwen/scripts/analyze-code.js --patterns
`);
}

// Main
const args = process.argv.slice(2);
const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    console.log(`${COLORS.red}[ERROR]${COLORS.reset} Could not find project root`);
    process.exit(1);
}

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

if (args.includes('--metrics')) {
    showMetrics(projectRoot);
} else if (args.includes('--patterns')) {
    showPatterns(projectRoot);
} else if (args.includes('--structure')) {
    showStructure(projectRoot);
} else if (args.includes('--deps')) {
    showDeps(projectRoot);
} else {
    showFullAnalysis(projectRoot);
}