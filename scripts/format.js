#!/usr/bin/env node

/**
 * Code Formatter
 * 
 * Runs Prettier and/or other formatters on project code.
 * Supports auto-fix and various output formats.
 * 
 * Usage: node .qwen/scripts/format.js [options]
 * 
 * Options:
 *   --check     Check if files need formatting (no changes)
 *   --write     Write formatted files (default with --fix)
 *   --verbose   Show all files processed
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

function detectFormatters(projectRoot) {
    const formatters = [];
    
    if (fs.existsSync(path.join(projectRoot, 'package.json'))) {
        const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
        if (pkg.devDependencies?.prettier || pkg.dependencies?.prettier) {
            formatters.push('prettier');
        }
        if (pkg.devDependencies?.python?.['black'] || pkg.devDependencies?.python?.['yapf']) {
            formatters.push('python');
        }
    }
    
    // Check for config files
    if (fs.existsSync(path.join(projectRoot, '.prettierrc'))) formatters.push('prettier');
    if (fs.existsSync(path.join(projectRoot, 'prettier.config.js'))) formatters.push('prettier');
    if (fs.existsSync(path.join(projectRoot, 'pyproject.toml'))) formatters.push('python');
    
    return formatters;
}

function runPrettier(projectRoot, args) {
    console.log(`${COLORS.cyan}[FORMATTER]${COLORS.reset} Prettier\n`);
    
    const prettierArgs = [
        'npx', 'prettier',
        'src/**/*.{js,jsx,ts,tsx,json,css,html,md,yml,yaml}',
        ...args
    ].filter(Boolean);
    
    try {
        execSync(prettierArgs.join(' '), {
            cwd: projectRoot,
            stdio: 'inherit'
        });
    } catch (error) {
        // Prettier might exit with errors on check mode
    }
}

function runPythonFormatter(projectRoot, args) {
    console.log(`${COLORS.cyan}[FORMATTER]${COLORS.reset} Python (black/yapf)\n`);
    
    // Try black first
    try {
        execSync('npx black .', {
            cwd: projectRoot,
            stdio: 'inherit'
        });
    } catch {
        // Try yapf as fallback
        try {
            execSync('npx yapf -i .', {
                cwd: projectRoot,
                stdio: 'inherit'
            });
        } catch {
            console.log(`${COLORS.yellow}[WARN]${COLORS.reset} No Python formatter found`);
        }
    }
}

function initPrettierConfig(projectRoot) {
    const configPath = path.join(projectRoot, '.prettierrc');
    
    if (fs.existsSync(configPath)) {
        console.log(`${COLORS.yellow}[INFO]${COLORS.reset} Prettier config already exists`);
        return;
    }
    
    const config = {
        semi: true,
        singleQuote: true,
        trailingComma: 'none',
        tabWidth: 4,
        useTabs: false,
        printWidth: 120,
        bracketSpacing: true,
        arrowParens: 'always',
        endOfLine: 'lf'
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`${COLORS.green}[CREATED]${COLORS.reset} ${configPath}`);
    
    // Create .prettierignore
    const ignorePath = path.join(projectRoot, '.prettierignore');
    if (!fs.existsSync(ignorePath)) {
        const ignoreContent = `node_modules/
dist/
build/
coverage/
*.log
.env
`;
        fs.writeFileSync(ignorePath, ignoreContent);
        console.log(`${COLORS.green}[CREATED]${COLORS.reset} ${ignorePath}`);
    }
}

function showHelp() {
    console.log(`
Code Formatter

Usage: node .qwen/scripts/format.js [options]

Options:
  --init       Create Prettier config
  --check      Check if files need formatting (no changes)
  --write      Write formatted files (default)
  --verbose    Show all files processed

Examples:
  node .qwen/scripts/format.js
  node .qwen/scripts/format.js --check
  node .qwen/scripts/format.js --init
`);
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    console.log(`${COLORS.red}[ERROR]${COLORS.reset} Could not find project root`);
    process.exit(1);
}

if (args.includes('--init')) {
    initPrettierConfig(projectRoot);
    process.exit(0);
}

const formatters = detectFormatters(projectRoot);

if (formatters.length === 0) {
    console.log(`${COLORS.yellow}[INFO]${COLORS.reset} No formatters detected. Run --init to set up Prettier.`);
    initPrettierConfig(projectRoot);
}

const options = [];
if (args.includes('--check')) {
    options.push('--check');
} else if (args.includes('--write') || args.includes('--fix')) {
    options.push('--write');
}

if (args.includes('--verbose')) {
    options.push('--verbose');
}

for (const formatter of formatters) {
    switch (formatter) {
        case 'prettier':
            runPrettier(projectRoot, options);
            break;
        case 'python':
            runPythonFormatter(projectRoot, options);
            break;
    }
}

if (formatters.length > 0) {
    console.log(`\n${COLORS.green}[DONE]${COLORS.reset} Formatting complete`);
} else {
    console.log(`\n${COLORS.yellow}[WARN]${COLORS.reset} No formatters configured`);
}
