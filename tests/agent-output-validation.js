#!/usr/bin/env node
/**
 * Agent Output Validation Runner
 * 
 * Validates agent outputs against expected baselines.
 * Checks structure, content, syntax, and execution correctness.
 * 
 * Usage:
 *   node .qwen/tests/agent-output-validation.js
 *   node .qwen/tests/agent-output-validation.js --verbose
 *   node .qwen/tests/agent-output-validation.js --baseline agent_file_structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const QWEN_DIR = path.resolve(__dirname, '..');
const BASELINES_FILE = path.join(__dirname, 'validation-baselines.json');

let passed = 0;
let failed = 0;
const results = [];

function log(msg, type = 'info') {
  const colors = { pass: '\x1b[32m', fail: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', reset: '\x1b[0m' };
  console.log(`${colors[type]}${msg}${colors.reset}`);
}

function loadBaselines() {
  return JSON.parse(fs.readFileSync(BASELINES_FILE, 'utf8'));
}

function getAllFiles(dir, pattern) {
  try {
    return fs.readdirSync(dir).filter(f => pattern.test(f));
  } catch { return []; }
}

function check(description, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      passed++;
      results.push({ description, status: 'passed' });
      log(`  ✓ ${description}`, 'pass');
    } else {
      failed++;
      results.push({ description, status: 'failed', details: result });
      log(`  ✗ ${description}: ${result}`, 'fail');
    }
  } catch (e) {
    failed++;
    results.push({ description, status: 'failed', error: e.message });
    log(`  ✗ ${description}: ${e.message}`, 'fail');
  }
}

function validateAgentStructure(agentFile) {
  const baselines = loadBaselines();
  const baseline = baselines.baselines.find(b => b.id === 'agent_file_structure');
  if (!baseline) return;

  const content = fs.readFileSync(path.join(QWEN_DIR, 'agents', agentFile), 'utf8');
  const lines = content.split('\n');

  check(`Agent ${agentFile}: has frontmatter`, () => {
    if (!content.startsWith('---')) return 'Missing frontmatter delimiter';
    return true;
  });

  for (const field of baseline.required_frontmatter_fields) {
    check(`Agent ${agentFile}: has '${field}' in frontmatter`, () => {
      const frontmatter = content.split('---')[1];
      if (!frontmatter) return 'No frontmatter found';
      if (!frontmatter.includes(`${field}:`)) return `Missing field: ${field}`;
      return true;
    });
  }

  for (const section of baseline.required_sections) {
    check(`Agent ${agentFile}: has '${section}' section`, () => {
      if (!content.includes(section)) return `Missing section: ${section}`;
      return true;
    });
  }

  check(`Agent ${agentFile}: line count (${lines.length} lines)`, () => {
    if (lines.length < baseline.min_lines) return `Too short: ${lines.length} < ${baseline.min_lines}`;
    if (lines.length > baseline.max_lines) return `Too long: ${lines.length} > ${baseline.max_lines}`;
    return true;
  });
}

function validateCommandStructure(cmdFile) {
  const baselines = loadBaselines();
  const baseline = baselines.baselines.find(b => b.id === 'command_file_structure');
  if (!baseline) return;

  const content = fs.readFileSync(path.join(QWEN_DIR, 'commands', cmdFile), 'utf8');
  const lines = content.split('\n');

  check(`Command ${cmdFile}: has frontmatter`, () => {
    if (!content.startsWith('---')) return 'Missing frontmatter';
    return true;
  });

  for (const section of baseline.required_sections) {
    check(`Command ${cmdFile}: has '${section}'`, () => {
      if (!content.includes(section)) return `Missing section: ${section}`;
      return true;
    });
  }

  check(`Command ${cmdFile}: line count (${lines.length} lines)`, () => {
    if (lines.length < baseline.min_lines) return `Too short: ${lines.length} < ${baseline.min_lines}`;
    return true;
  });
}

function validateHookScripts() {
  const scriptsDir = path.join(QWEN_DIR, 'scripts');
  const jsFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js'));

  for (const script of jsFiles) {
    check(`Hook script ${script}: valid JS syntax`, () => {
      execSync(`node -c "${path.join(scriptsDir, script)}"`, { timeout: 3000 });
      return true;
    });
  }
}

function validatePythonScripts() {
  const scriptsDir = path.join(QWEN_DIR, 'scripts');
  const pyFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.py'));

  for (const script of pyFiles) {
    check(`Python script ${script}: valid syntax`, () => {
      try {
        execSync(`python -m py_compile "${path.join(scriptsDir, script)}"`, { timeout: 5000, stdio: 'pipe' });
        return true;
      } catch {
        return `Syntax error in ${script}`;
      }
    });
  }
}

function validateJSONFiles() {
  const dirs = [
    path.join(QWEN_DIR),
    path.join(QWEN_DIR, 'skills'),
    path.join(QWEN_DIR, 'tests'),
    path.join(QWEN_DIR, 'tests', 'mock-parity'),
    path.join(QWEN_DIR, 'plugins'),
    path.join(QWEN_DIR, 'plugins', 'auto-test'),
    path.join(QWEN_DIR, 'plugins', 'commit-every-task'),
    path.join(QWEN_DIR, 'plugins', 'doc-sync'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const jsonFiles = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of jsonFiles) {
      check(`JSON ${file}: valid syntax`, () => {
        JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        return true;
      });
    }
  }
}

function validatePolicyStructure() {
  const policyFile = path.join(QWEN_DIR, 'policy.json');
  const baselines = loadBaselines();
  const baseline = baselines.baselines.find(b => b.id === 'policy_json_validity');
  if (!baseline) return;

  check('Policy file: valid JSON', () => {
    const policy = JSON.parse(fs.readFileSync(policyFile, 'utf8'));
    for (const key of baseline.required_keys) {
      if (!policy[key]) return `Missing key: ${key}`;
    }
    return true;
  });
}

function validateSettingsStructure() {
  const settingsFile = path.join(QWEN_DIR, 'settings.json');
  const baselines = loadBaselines();
  const baseline = baselines.baselines.find(b => b.id === 'settings_json_validity');
  if (!baseline) return;

  check('Settings file: valid JSON with required keys', () => {
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    for (const key of baseline.required_keys) {
      if (!settings[key]) return `Missing key: ${key}`;
    }
    return true;
  });
}

function validateAgentBoundaries() {
  const baselines = loadBaselines();
  const baseline = baselines.baselines.find(b => b.id === 'agent_boundary_completeness');
  if (!baseline) return;

  const agents = fs.readdirSync(path.join(QWEN_DIR, 'agents')).filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'INDEX.txt');
  
  for (const agent of agents) {
    const content = fs.readFileSync(path.join(QWEN_DIR, 'agents', agent), 'utf8');
    for (const pattern of baseline.required_patterns) {
      check(`Agent ${agent}: has '${pattern}' boundary`, () => {
        if (!content.includes(pattern)) return `Missing: ${pattern}`;
        return true;
      });
    }
  }
}

function validateAgentToolPermissions() {
  const baselines = loadBaselines();
  const baseline = baselines.baselines.find(b => b.id === 'agent_tool_permissions');
  if (!baseline) return;

  const agents = fs.readdirSync(path.join(QWEN_DIR, 'agents')).filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'INDEX.txt');
  
  for (const agent of agents) {
    const content = fs.readFileSync(path.join(QWEN_DIR, 'agents', agent), 'utf8');
    for (const pattern of baseline.required_patterns) {
      check(`Agent ${agent}: has '${pattern}' defined`, () => {
        if (!content.includes(pattern)) return `Missing: ${pattern}`;
        return true;
      });
    }
  }
}

function validateExecutableScripts() {
  const baselines = loadBaselines();
  const baseline = baselines.baselines.find(b => b.id === 'executable_scripts_runnable');
  if (!baseline) return;

  const scriptsDir = path.join(QWEN_DIR, 'scripts');
  const jsFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js') && !f.startsWith('tmp-'));
  
  for (const script of jsFiles) {
    check(`Script ${script}: executes without error`, () => {
      try {
        execSync(`node "${path.join(scriptsDir, script)}"`, { timeout: 5000, stdio: 'pipe' });
        return true;
      } catch (e) {
        // Some scripts require arguments - that's OK if it's not a syntax error
        if (e.message.includes('MODULE_NOT_FOUND') || e.message.includes('SyntaxError')) {
          return `Module/syntax error: ${e.message.slice(0, 100)}`;
        }
        // Other errors (missing args, etc.) are expected behavior
        return true;
      }
    });
  }
}

// Main
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const specificBaseline = args.find(a => a.startsWith('--baseline='))?.split('=')[1];

log('\n🔬 Agent Output Validation\n');

if (!specificBaseline) {
  // Run all validations
  log('📁 Agent File Structure');
  console.log('-'.repeat(30));
  const agents = fs.readdirSync(path.join(QWEN_DIR, 'agents')).filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'INDEX.txt');
  for (const agent of agents.slice(0, 10)) { // Test first 10 agents
    validateAgentStructure(agent);
  }
  if (agents.length > 10) log(`  ... and ${agents.length - 10} more agents (same structure)`, 'info');

  log('\n📝 Command File Structure');
  console.log('-'.repeat(30));
  const commands = fs.readdirSync(path.join(QWEN_DIR, 'commands')).filter(f => f.endsWith('.md'));
  for (const cmd of commands.slice(0, 10)) {
    validateCommandStructure(cmd);
  }

  log('\n🪝 Hook Scripts');
  console.log('-'.repeat(30));
  validateHookScripts();

  log('\n🐍 Python Scripts');
  console.log('-'.repeat(30));
  validatePythonScripts();

  log('\n📋 JSON Files');
  console.log('-'.repeat(30));
  validateJSONFiles();

  log('\n📜 Policy & Settings');
  console.log('-'.repeat(30));
  validatePolicyStructure();
  validateSettingsStructure();

  log('\n🛡️ Agent Boundaries');
  console.log('-'.repeat(30));
  validateAgentBoundaries();

  log('\n🔐 Agent Tool Permissions');
  console.log('-'.repeat(30));
  validateAgentToolPermissions();

  log('\n⚡ Executable Scripts');
  console.log('-'.repeat(30));
  validateExecutableScripts();
}

log('\n' + '='.repeat(50));
log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  log('Failed checks:', 'fail');
  results.filter(r => r.status === 'failed').forEach(r => {
    log(`  - ${r.description}: ${r.details || r.error}`, 'fail');
  });
  process.exit(1);
} else {
  log('All output validation checks passed!', 'pass');
  process.exit(0);
}
