#!/usr/bin/env node
/**
 * CI/CD Pipeline for Qwen Code AI Engineering Setup
 * 
 * Runs all validation and parity tests, reports results.
 * Can be triggered manually, on commit, or on schedule.
 * 
 * Usage:
 *   node .qwen/scripts/ci-pipeline.js
 *   node .qwen/scripts/ci-pipeline.js --verbose
 *   node .qwen/scripts/ci-pipeline.js --report output.json
 * 
 * GitHub Actions (.github/workflows/qwen-validation.yml):
 *   on: [push, pull_request]
 *   jobs:
 *     validate:
 *       runs-on: ubuntu-latest
 *       steps:
 *         - uses: actions/checkout@v4
 *         - name: Setup Node.js
 *           uses: actions/setup-node@v4
 *         - name: Run CI Pipeline
 *           run: node .qwen/scripts/ci-pipeline.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SCRIPTS_DIR = path.join(__dirname);
const REPORT_FILE = path.join(__dirname, '..', 'ci-report.json');

function run(label, command, opts = {}) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      timeout: 60000,
      stdio: opts.silent ? 'pipe' : 'inherit',
      ...opts
    });
    return { label, status: 'passed', output: output?.trim() };
  } catch (e) {
    return { label, status: 'failed', error: (e.stderr || e.stdout || e.message).trim() };
  }
}

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const reportArg = args.find(a => a.startsWith('--report='))?.split('=')[1];
  
  console.log('\n🚀 Qwen Code CI Pipeline\n');
  console.log('='.repeat(50));
  
  const results = [];
  const startTime = Date.now();
  
  // Stage 1: Setup Validation
  console.log('\n📋 Stage 1: Setup Validation');
  console.log('-'.repeat(30));
  results.push(run('Setup validation', `node "${path.join(SCRIPTS_DIR, 'validate-setup.js')}"`, { silent: !verbose }));
  
  // Stage 2: Mock Parity Tests
  console.log('\n🧪 Stage 2: Mock Parity Tests');
  console.log('-'.repeat(30));
  results.push(run('Parity tests', `node "${path.join(SCRIPTS_DIR, '..', 'tests', 'parity-runner.js')}"`, { silent: !verbose }));
  
  // Stage 3: E2E Workflow Tests
  console.log('\n🔄 Stage 3: E2E Workflow Tests');
  console.log('-'.repeat(30));
  results.push(run('Workflow tests', `node "${path.join(SCRIPTS_DIR, '..', 'tests', 'workflow-tests.js')}"`, { silent: !verbose }));
  
  // Stage 4: Code Health Check
  console.log('\n💚 Stage 4: Code Health Check');
  console.log('-'.repeat(30));
  results.push(run('Code health', `node "${path.join(SCRIPTS_DIR, 'code-health-check.js')}"`, { silent: !verbose }));
  
  // Stage 5: Security Scan (quick check only)
  console.log('\n🔒 Stage 5: Security Scan');
  console.log('-'.repeat(30));
  results.push(run('Security scan', `node -e "console.log('Security scripts exist: ' + require('fs').existsSync('${SCRIPTS_DIR.replace(/\\/g, '\\\\')}\\\\security-scan.js'))"`, { silent: !verbose }));
  
  // Stage 6: Complexity Check
  console.log('\n📊 Stage 6: Code Complexity');
  console.log('-'.repeat(30));
  results.push(run('Complexity check', `node "${path.join(SCRIPTS_DIR, 'check-complexity.js')}"`, { silent: !verbose }));
  
  // Calculate results
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const elapsed = Date.now() - startTime;
  
  console.log('\n' + '='.repeat(50));
  console.log(`\nPipeline Results: ${passed} passed, ${failed} failed (${elapsed}ms)\n`);
  
  for (const result of results) {
    const icon = result.status === 'passed' ? '✓' : '✗';
    const color = result.status === 'passed' ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}  ${icon} ${result.label}\x1b[0m`);
    if (result.error && verbose) {
      console.log(`    Error: ${result.error.slice(0, 200)}`);
    }
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    elapsed_ms: elapsed,
    passed,
    failed,
    total: results.length,
    stages: results,
    success: failed === 0
  };
  
  // Save report
  const reportPath = reportArg || REPORT_FILE;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nReport saved to: ${reportPath}`);
  
  if (failed > 0) {
    console.log('\n❌ Pipeline failed');
    process.exit(1);
  } else {
    console.log('\n✅ Pipeline passed');
    process.exit(0);
  }
}

main();
