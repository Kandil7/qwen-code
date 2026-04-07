#!/usr/bin/env node

/**
 * Project Setup Wizard
 * 
 * Interactive wizard to set up new projects with Qwen Code.
 * Creates project structure, configuration, and initializes SDD workflow.
 * 
 * Usage: node .qwen/scripts/setup-wizard.js [options]
 * 
 * Options:
 *   --name     Project name
 *   --type    Project type (node, python, react, etc.)
 *   --template Use template
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

const PROJECT_TYPES = [
    { id: 'node-api', name: 'Node.js API', description: 'Express/Fastify REST API', files: 10 },
    { id: 'react', name: 'React Frontend', description: 'React + Vite app', files: 15 },
    { id: 'nextjs', name: 'Next.js Fullstack', description: 'Next.js app router', files: 15 },
    { id: 'python', name: 'Python API', description: 'FastAPI REST API', files: 8 },
    { id: 'python-cli', name: 'Python CLI', description: 'Python CLI tool', files: 5 },
    { id: 'lib', name: 'Library/SDK', description: 'Reusable library', files: 8 },
    { id: 'blank', name: 'Blank', description: 'Empty project', files: 3 },
];

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

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        log(`Created: ${dirPath}`, 'cyan');
    }
}

function createProjectStructure(projectName, projectType) {
    const root = path.join(process.cwd(), projectName);
    
    log(`\nCreating project structure for "${projectName}"...`, 'cyan');
    
    // Create directories
    ensureDir(root);
    ensureDir(path.join(root, 'src'));
    ensureDir(path.join(root, 'tests'));
    ensureDir(path.join(root, 'docs'));
    ensureDir(path.join(root, '.qwen'));
    ensureDir(path.join(root, '.qwen', 'specs'));
    ensureDir(path.join(root, '.qwen', 'plans'));
    ensureDir(path.join(root, '.qwen', 'tasks'));
    
    // Create key files based on type
    const files = [];
    
    switch (projectType) {
        case 'node-api':
            files.push(
                { path: 'package.json', content: getNodeApiPackageJson(projectName) },
                { path: 'src/index.js', content: '// Express app\nconst app = require("express")();\n\napp.get("/health", (req, res) => {\n  res.json({ status: "ok" });\n});\n\nmodule.exports = app;\n' },
                { path: 'src/routes.js', content: '// Routes\nmodule.exports = (app) => {\n  // Add routes here\n};\n' },
                { path: 'tests/app.test.js', content: '// Tests\nconst request = require("supertest");\nconst app = require("../src/index");\n\ndescribe("API", () => {\n  test("health check", async () => {\n    const res = await request(app).get("/health");\n    expect(res.status).toBe(200);\n  });\n});\n' }
            );
            break;
            
        case 'react':
            files.push(
                { path: 'package.json', content: getReactPackageJson(projectName) },
                { path: 'src/App.jsx', content: '// App\nexport default function App() {\n  return <div>Hello World</div>;\n}\n' },
                { path: 'src/main.jsx', content: '// Main entry\nimport React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")).render(<App />);\n' },
                { path: 'index.html', content: '<!DOCTYPE html>\n<html><body><div id="root"></div></body></html>\n' }
            );
            break;
            
        case 'python':
            files.push(
                { path: 'requirements.txt', content: 'fastapi\nuvicorn\npydantic\n' },
                { path: 'main.py', content: '# FastAPI app\nfrom fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/health")\ndef health():\n    return {"status": "ok"}\n' },
                { path: 'tests/test_main.py', content: '# Tests\nfrom fastapi.testclient import TestClient\nfrom main import app\n\nclient = TestClient(app)\n\ndef test_health():\n    res = client.get("/health")\n    assert res.status_code == 200\n' }
            );
            break;
            
        case 'blank':
            files.push(
                { path: 'README.md', content: `# ${projectName}\n\n` },
                { path: '.gitignore', content: 'node_modules/\ndist/\n.env\n' }
            );
            break;
            
        default:
            files.push(
                { path: 'README.md', content: `# ${projectName}\n\n` },
                { path: '.gitignore', content: 'node_modules/\ndist/\n.env\n' }
            );
    }
    
    // Write files
    for (const file of files) {
        const filePath = path.join(root, file.path);
        ensureDir(path.dirname(filePath));
        fs.writeFileSync(filePath, file.content);
        log(`Created: ${file.path}`, 'green');
    }
    
    // Create common files
    const commonFiles = [
        { path: '.gitignore', content: 'node_modules/\ndist/\nbuild/\n.env\n*.log\ncoverage/\n.DS_Store\n' },
        { path: 'README.md', content: `# ${projectName}\n\nProject setup complete.\n` },
        { path: '.qwen/config.json', content: JSON.stringify({ name: projectName, type: projectType, version: '1.0.0' }, null, 2) },
    ];
    
    for (const file of commonFiles) {
        const filePath = path.join(root, file.path);
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, file.content);
            log(`Created: ${file.path}`, 'green');
        }
    }
    
    return root;
}

function getNodeApiPackageJson(name) {
    return JSON.stringify({
        name: name,
        version: '1.0.0',
        main: 'src/index.js',
        scripts: {
            start: 'node src/index.js',
            dev: 'nodemon src/index.js',
            test: 'jest',
            lint: 'eslint src/',
            format: 'prettier --write src/'
        },
        dependencies: {
            express: '^4.18.2'
        },
        devDependencies: {
            jest: '^29.7.0',
            supertest: '^6.3.3',
            nodemon: '^3.0.0',
            eslint: '^8.55.0',
            prettier: '^3.1.0'
        }
    }, null, 2);
}

function getReactPackageJson(name) {
    return JSON.stringify({
        name: name,
        version: '1.0.0',
        type: 'module',
        scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
            test: 'vitest',
            lint: 'eslint src/'
        },
        dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0'
        },
        devDependencies: {
            '@vitejs/plugin-react': '^4.2.0',
            vite: '^5.0.0',
            vitest: '^1.0.0',
            eslint: '^8.55.0'
        }
    }, null, 2);
}

async function runWizard() {
    const rl = createInterface();
    
    log('\n=== Project Setup Wizard ===', 'cyan');
    log('Press Ctrl+C to cancel anytime\n', 'gray');
    
    // Get project name
    let projectName = '';
    while (!projectName || projectName.trim() === '') {
        projectName = await question(rl, 'Project name: ');
        projectName = projectName.trim();
        if (!projectName) {
            log('Please enter a project name', 'yellow');
        }
    }
    
    // Check if directory exists
    if (fs.existsSync(projectName)) {
        log(`Directory "${projectName}" already exists!`, 'red');
        rl.close();
        process.exit(1);
    }
    
    // Show project types
    log('\nSelect project type:', 'cyan');
    for (let i = 0; i < PROJECT_TYPES.length; i++) {
        const type = PROJECT_TYPES[i];
        log(`  ${i + 1}. ${type.name} - ${type.description}`, 'gray');
    }
    
    // Get project type
    let typeIndex = -1;
    while (typeIndex < 0 || typeIndex >= PROJECT_TYPES.length) {
        const answer = await question(rl, '\nType [1-7]: ');
        typeIndex = parseInt(answer) - 1;
    }
    
    const projectType = PROJECT_TYPES[typeIndex];
    log(`\nSelected: ${projectType.name}`, 'green');
    
    // Confirm
    const confirm = await question(rl, `\nCreate project "${projectName}" (${projectType.name})? [y/n]: `);
    if (confirm.toLowerCase() !== 'y') {
        log('Cancelled', 'yellow');
        rl.close();
        process.exit(0);
    }
    
    // Create project
    const projectRoot = createProjectStructure(projectName, projectType.id);
    
    log(`\n✅ Project created: ${projectRoot}`, 'green');
    log('\nNext steps:', 'cyan');
    log(`  cd ${projectName}`, 'gray');
    log(`  npm install`, 'gray');
    log(`  /specify "${projectName}"`, 'gray');
    
    rl.close();
}

function showHelp() {
    console.log(`
Project Setup Wizard

Usage: node .qwen/scripts/setup-wizard.js [options]

Options:
  --name     Project name
  --type    Project type (node-api, react, python, lib, blank)
  --template Use template

Interactive Mode:
  node .qwen/scripts/setup-wizard.js

Examples:
  node .qwen/scripts/setup-wizard.js
  node .qwen/scripts/setup-wizard.js --name my-project --type node-api
`);
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
}

// Check for CLI arguments
const nameIndex = args.indexOf('--name');
const typeIndex = args.indexOf('--type');

if (nameIndex !== -1 && args[nameIndex + 1]) {
    const projectName = args[nameIndex + 1];
    const projectType = typeIndex !== -1 ? args[typeIndex + 1] : 'blank';
    
    if (fs.existsSync(projectName)) {
        log(`Directory "${projectName}" already exists!`, 'red');
        process.exit(1);
    }
    
    createProjectStructure(projectName, projectType);
    log(`\n✅ Project created: ${projectName}`, 'green');
} else {
    runWizard().catch(console.error);
}