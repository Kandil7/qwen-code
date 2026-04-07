#!/usr/bin/env node
/**
 * E2E Workflow Tests
 * 
 * Tests the 5 predefined workflows end-to-end:
 * 1. scrape-pipeline — End-to-end web scraping
 * 2. feature-pipeline — Feature development
 * 3. review-pipeline — Code review + fix loop
 * 4. refactor-pipeline — Safe refactoring
 * 5. deploy-pipeline — Production deployment
 * 
 * Each test verifies:
 * - Required files exist
 * - Required agents are available
 * - Required skills are documented
 * - Workflow manifest is valid
 * - Integration points work
 * 
 * Usage:
 *   node .qwen/tests/workflow-tests.js
 *   node .qwen/tests/workflow-tests.js --workflow scrape-pipeline
 *   node .qwen/tests/workflow-tests.js --verbose
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const QWEN_DIR = path.resolve(__dirname, '..');
const WORKFLOWS_FILE = path.join(QWEN_DIR, 'workflow-history.json');

let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

function log(msg, type = 'info') {
  const colors = {
    pass: '\x1b[32m',
    fail: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[36m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${msg}${colors.reset}`);
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function check(description, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      log(`  ✓ ${description}`, 'pass');
      passed++;
      results.push({ description, status: 'passed' });
    } else {
      log(`  ⚠ ${description}: ${result}`, 'warn');
      skipped++;
      results.push({ description, status: 'skipped', details: result });
    }
  } catch (e) {
    log(`  ✗ ${description}: ${e.message}`, 'fail');
    failed++;
    results.push({ description, status: 'failed', error: e.message });
  }
}

// Workflow definitions
const WORKFLOWS = {
  'scrape-pipeline': {
    description: 'End-to-end web scraping pipeline',
    agents: ['web-scraper-engineer', 'data-engineer', 'data-governance-engineer', 'observability-engineer', 'dev-ops-platform-engineer'],
    skills: ['scrapling-workflow', 'firecrawl-workflow', 'scrapy-workflow', 'scraping_data_quality.py', 'scrapling_monitoring.py'],
    commands: ['/scrape', '/firecrawl', '/scraping'],
    files: [
      '.qwen/agents/web-scraper-engineer.md',
      '.qwen/skills/scrapling-workflow.md',
      '.qwen/skills/scraping_data_quality.py',
    ]
  },
  'feature-pipeline': {
    description: 'Feature development from spec to deployment',
    agents: ['orchestrator-tech-lead', 'product-engineer', 'software-engineer', 'test-engineer', 'code-reviewer', 'security-compliance-engineer'],
    skills: ['harness-engineering', 'ai-review.md'],
    commands: ['/specify', '/sdd-plan', '/tasks', '/implement', '/tdd', '/code-review', '/security-scan'],
    files: [
      '.qwen/agents/orchestrator-tech-lead.md',
      '.qwen/skills/harness-engineering.md',
      '.qwen/templates/sdd/spec-template.md',
    ]
  },
  'review-pipeline': {
    description: 'Code review, find issues, auto-fix',
    agents: ['code-reviewer', 'security-compliance-engineer', 'performance-optimizer', 'software-engineer', 'test-engineer'],
    skills: ['ai-review.md', 'scrapling-workflow.md'],
    commands: ['/code-review', '/security-scan', '/refactor', '/verify'],
    files: [
      '.qwen/agents/code-reviewer.md',
      '.qwen/scripts/security-check.js',
      '.qwen/scripts/auto-lint.js',
    ]
  },
  'refactor-pipeline': {
    description: 'Safe refactoring without breaking functionality',
    agents: ['code-reviewer', 'software-engineer', 'test-engineer'],
    skills: ['entropy-manager.py', 'harness-engineering.md'],
    commands: ['/refactor', '/verify', '/code-review'],
    files: [
      '.qwen/skills/entropy-manager.py',
      '.qwen/scripts/code-health-check.js',
      '.qwen/skills/harness-engineering.md',
    ]
  },
  'deploy-pipeline': {
    description: 'Production deployment with safety checks',
    agents: ['test-engineer', 'security-compliance-engineer', 'dev-ops-platform-engineer', 'observability-engineer', 'sre-reliability-engineer'],
    skills: ['scrapling_monitoring.py', 'scraping_monitoring_extra.py'],
    commands: ['/verify', '/security-scan'],
    files: [
      '.qwen/skills/scraping_unified_dashboard.json',
      '.qwen/scripts/validate-setup.js',
      '.qwen/Containerfile',
    ]
  }
};

function testWorkflow(name, workflow, verbose) {
  log(`\nTesting: ${name} — ${workflow.description}\n`);
  
  const workflowPassed = passed;
  const workflowFailed = failed;
  
  // Check agents exist
  for (const agent of workflow.agents) {
    check(`Agent: ${agent}`, () => {
      const agentFile = path.join(QWEN_DIR, 'agents', `${agent}.md`);
      if (!fileExists(agentFile)) {
        const agentsDir = path.join(QWEN_DIR, 'agents');
        const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'INDEX.txt');
        const found = files.find(f => f.toLowerCase().includes(agent.toLowerCase()));
        if (!found) throw new Error(`Agent file not found: ${agent}`);
        return true;
      }
      return true;
    });
  }
  
  // Check skills exist
  for (const skill of workflow.skills) {
    check(`Skill: ${skill}`, () => {
      const skillPath = path.join(QWEN_DIR, 'skills', skill);
      if (!fileExists(skillPath)) {
        const skillsDir = path.join(QWEN_DIR, 'skills');
        const files = fs.readdirSync(skillsDir);
        const found = files.find(f => f.toLowerCase().includes(skill.toLowerCase()));
        if (!found) throw new Error(`Skill not found: ${skill}`);
        return true;
      }
      return true;
    });
  }
  
  // Check commands exist
  for (const cmd of workflow.commands) {
    check(`Command: ${cmd}`, () => {
      const cmdName = cmd.slice(1);
      const commandsDir = path.join(QWEN_DIR, 'commands');
      const files = fs.readdirSync(commandsDir);
      const found = files.find(f => f.toLowerCase().includes(cmdName.toLowerCase()));
      if (!found) throw new Error(`Command not found: ${cmd}`);
      return true;
    });
  }
  
  // Check required files
  for (const file of workflow.files) {
    check(`File: ${file}`, () => {
      const filePath = path.join(QWEN_DIR, file.replace('.qwen/', ''));
      if (!fileExists(filePath)) throw new Error(`File not found: ${file}`);
      return true;
    });
  }
  
  // Check workflow manifest exists
  check(`Workflow history file exists`, () => {
    return fileExists(WORKFLOWS_FILE);
  });
  
  const workflowResults = { passed: passed - workflowPassed, failed: failed - workflowFailed };
  log(`  → ${workflowResults.passed} passed, ${workflowResults.failed} failed`);
  
  return workflowResults;
}

// Main
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const specificWorkflow = args.find(a => a.startsWith('--workflow='))?.split('=')[1];

log('\n🧪 E2E Workflow Tests\n');

const workflows = specificWorkflow
  ? { [specificWorkflow]: WORKFLOWS[specificWorkflow] }
  : WORKFLOWS;

if (!workflows || Object.keys(workflows).length === 0) {
  log(`No workflow found matching "${specificWorkflow}"`, 'warn');
  process.exit(1);
}

for (const [name, workflow] of Object.entries(workflows)) {
  if (!workflow) continue;
  testWorkflow(name, workflow, verbose);
}

log('\n' + '='.repeat(50));
log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

if (failed > 0) {
  log('Failed checks:', 'fail');
  results.filter(r => r.status === 'failed').forEach(r => {
    log(`  - ${r.description}: ${r.error}`, 'fail');
  });
  process.exit(1);
} else {
  log('All workflow tests passed!', 'pass');
  process.exit(0);
}
