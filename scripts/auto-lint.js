#!/usr/bin/env node
/**
 * Auto-Lint Hook - PostToolUse for write_file/edit
 * 
 * Automatically runs linting/type-checking on written files.
 * Provides instant quality feedback after code generation.
 * 
 * Usage: Hook receives tool context via stdin as JSON.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const LINT_COMMANDS = {
  // Python files
  '.py': [
    { cmd: 'python -m py_compile "{file}"', name: 'Python syntax check', fallback: true },
    { cmd: 'ruff check "{file}" 2>/dev/null || true', name: 'Ruff lint', optional: true },
  ],
  // TypeScript/JavaScript files
  '.ts': [
    { cmd: 'npx tsc --noEmit "{file}" 2>/dev/null || true', name: 'TypeScript check', optional: true },
    { cmd: 'npx eslint "{file}" 2>/dev/null || true', name: 'ESLint', optional: true },
  ],
  '.js': [
    { cmd: 'npx eslint "{file}" 2>/dev/null || true', name: 'ESLint', optional: true },
    { cmd: 'node -c "{file}" 2>&1 || true', name: 'Node syntax check', fallback: true },
  ],
  // JSON files
  '.json': [
    { cmd: 'node -e "JSON.parse(require(\'fs\').readFileSync(\'{file}\',\'utf8\'))" 2>&1 || true', name: 'JSON validation', fallback: true },
  ],
  // YAML files
  '.yaml': [
    { cmd: 'npx yaml "{file}" 2>/dev/null || true', name: 'YAML validation', optional: true },
  ],
  '.yml': [
    { cmd: 'npx yaml "{file}" 2>/dev/null || true', name: 'YAML validation', optional: true },
  ],
};

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let input = '';
  
  for await (const line of rl) {
    input += line;
  }
  
  let context;
  try {
    context = JSON.parse(input);
  } catch (e) {
    process.exit(0);
    return;
  }
  
  // Extract file path from tool context
  const filePath = context.toolInput?.file_path || context.file_path || context.toolInput?.path;
  
  if (!filePath) {
    process.exit(0);
    return;
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const lintCmds = LINT_COMMANDS[ext];
  
  if (!lintCmds || lintCmds.length === 0) {
    process.exit(0);
    return;
  }
  
  const results = [];
  let hasErrors = false;
  
  for (const lint of lintCmds) {
    const cmd = lint.cmd.replace(/{file}/g, filePath);
    
    try {
      const output = execSync(cmd, { 
        encoding: 'utf8', 
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      results.push({ tool: lint.name, status: 'pass', output: output.trim().slice(0, 500) });
    } catch (error) {
      const output = (error.stdout || error.stderr || '').trim().slice(0, 500);
      if (output && !lint.optional) {
        hasErrors = true;
        results.push({ tool: lint.name, status: 'fail', output });
      } else if (lint.optional) {
        results.push({ tool: lint.name, status: 'skipped', reason: 'not installed' });
      } else {
        results.push({ tool: lint.name, status: 'fail', output });
      }
    }
  }
  
  if (hasErrors) {
    const output = {
      decision: 'warn',
      hookSpecificOutput: {
        additionalContext: `[LINT ERRORS] ${path.basename(filePath)}: ${results.filter(r => r.status === 'fail').map(r => `${r.tool}: ${r.output.slice(0, 100)}`).join(' | ')}`
      }
    };
    console.log(JSON.stringify(output));
  }
  
  process.exit(0);
}

main().catch(() => process.exit(0));
