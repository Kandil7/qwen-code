#!/usr/bin/env node
/**
 * Mock Parity Test Runner
 * 
 * Based on ultraworkers/claw-code mock_parity_harness.rs pattern.
 * Executes scripted test scenarios against Qwen Code tools and hooks
 * to verify deterministic behavioral parity.
 * 
 * Usage:
 *   node .qwen/tests/parity-runner.js
 *   node .qwen/tests/parity-runner.js --scenario read_file_roundtrip
 *   node .qwen/tests/parity-runner.js --verbose
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCENARIOS_FILE = path.join(__dirname, 'mock-parity', 'scenarios.json');
const QWEN_DIR = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

function log(msg, type = 'info') {
  const colors = {
    pass: '\x1b[32m',  // green
    fail: '\x1b[31m',  // red
    warn: '\x1b[33m',  // yellow
    info: '\x1b[36m',  // cyan
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${msg}${colors.reset}`);
}

function loadScenarios() {
  try {
    return JSON.parse(fs.readFileSync(SCENARIOS_FILE, 'utf8'));
  } catch (e) {
    log(`✗ Failed to load scenarios: ${e.message}`, 'fail');
    process.exit(1);
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function runScenario(scenario, verbose) {
  let result = {
    id: scenario.id,
    description: scenario.description,
    type: scenario.type,
    status: 'unknown',
    details: '',
    duration_ms: 0
  };

  const start = Date.now();

  try {
    switch (scenario.type) {
      case 'tool_execution':
        result = runToolScenario(scenario, result);
        break;
      case 'agent_validation':
        result = runAgentScenario(scenario, result);
        break;
      case 'policy_test':
        result = runPolicyScenario(scenario, result);
        break;
      case 'security_test':
        result = runSecurityScenario(scenario, result);
        break;
      case 'file_validation':
        result = runFileValidationScenario(scenario, result);
        break;
      case 'hook_validation':
        result = runHookValidationScenario(scenario, result);
        break;
      default:
        result.status = 'skipped';
        result.details = `Unknown scenario type: ${scenario.type}`;
        skipped++;
        return result;
    }
  } catch (e) {
    result.status = 'failed';
    result.details = e.message;
  }

  result.duration_ms = Date.now() - start;

  // Policy tests use 'blocked'/'allowed' status instead of 'success'
  const isSuccess = result.status === 'success' || 
    (scenario.type === 'policy_test' && ['blocked', 'allowed'].includes(result.status)) ||
    (scenario.type === 'security_test' && result.status === 'blocked');

  if (isSuccess) {
    passed++;
    log(`  ✓ ${scenario.id} (${result.duration_ms}ms)`, 'pass');
  } else if (result.status === 'skipped') {
    skipped++;
    log(`  ⚠ ${scenario.id}: ${result.details}`, 'warn');
  } else {
    failed++;
    log(`  ✗ ${scenario.id}: ${result.details}`, 'fail');
  }

  if (verbose && result.details) {
    log(`    Details: ${result.details}`, 'info');
  }

  // Cleanup if scenario created temp files
  if (scenario.cleanup && scenario.input?.file_path) {
    try {
      if (fileExists(scenario.input.file_path)) {
        fs.unlinkSync(scenario.input.file_path);
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  return result;
}

function runToolScenario(scenario, result) {
  const input = scenario.input;
  const expected = scenario.expected;

  switch (scenario.tool) {
    case 'read_file':
      if (!fileExists(input.file_path)) {
        result.status = 'failed';
        result.details = `File not found: ${input.file_path}`;
        return result;
      }
      const content = readFile(input.file_path);
      if (!content) {
        result.status = 'failed';
        result.details = 'Could not read file';
        return result;
      }
      if (expected.output_contains) {
        const allFound = expected.output_contains.every(s => content.includes(s));
        if (!allFound) {
          result.status = 'failed';
          result.details = `Expected strings not found in file content`;
          return result;
        }
      }
      result.status = 'success';
      result.details = `Read ${content.length} bytes`;
      break;

    case 'write_file':
      try {
        fs.writeFileSync(input.file_path, input.content, 'utf8');
        if (!fileExists(input.file_path)) {
          result.status = 'failed';
          result.details = 'File was not created';
          return result;
        }
        const written = readFile(input.file_path);
        if (expected.file_content && written !== expected.file_content) {
          result.status = 'failed';
          result.details = `Content mismatch: expected "${expected.file_content}", got "${written}"`;
          return result;
        }
        result.status = 'success';
        result.details = `Wrote ${input.content.length} bytes`;
      } catch (e) {
        result.status = 'failed';
        result.details = `Write failed: ${e.message}`;
      }
      break;

    case 'grep_search':
      try {
        const output = execSync(
          `findstr /C:"${input.pattern}" "${path.join(QWEN_DIR, 'AGENTS.md')}" 2>nul || echo ""`,
          { encoding: 'utf8' }
        ).trim();
        const matches = output ? output.split('\n').filter(l => l.trim()) : [];
        if (expected.matches_count_gte && matches.length < expected.matches_count_gte) {
          result.status = 'failed';
          result.details = `Expected >= ${expected.matches_count_gte} matches, got ${matches.length}`;
          return result;
        }
        result.status = 'success';
        result.details = `Found ${matches.length} matches`;
      } catch {
        result.status = 'failed';
        result.details = 'grep search failed';
      }
      break;

    case 'glob':
      try {
        const { globSync } = require('glob');
        const pattern = path.join(input.path, input.pattern);
        const files = globSync(pattern) || [];
        if (expected.files_count_gte && files.length < expected.files_count_gte) {
          result.status = 'failed';
          result.details = `Expected >= ${expected.files_count_gte} files, got ${files.length}`;
          return result;
        }
        if (expected.files_include) {
          const fileNames = files.map(f => path.basename(f));
          const missing = expected.files_include.filter(f => !fileNames.includes(f));
          if (missing.length > 0) {
            result.status = 'failed';
            result.details = `Missing files: ${missing.join(', ')}`;
            return result;
          }
        }
        result.status = 'success';
        result.details = `Found ${files.length} files`;
      } catch (e) {
        // Fallback: manual check
        try {
          const dir = input.path;
          if (fileExists(dir)) {
            const files = fs.readdirSync(dir).filter(f => f.endsWith(input.pattern.slice(1)));
            result.status = 'success';
            result.details = `Found ${files.length} files (manual check)`;
          } else {
            result.status = 'failed';
            result.details = `Directory not found: ${dir}`;
          }
        } catch {
          result.status = 'failed';
          result.details = `Glob failed: ${e.message}`;
        }
      }
      break;

    default:
      result.status = 'skipped';
      result.details = `Unsupported tool: ${scenario.tool}`;
  }

  return result;
}

function runAgentScenario(scenario, result) {
  const agentFile = path.join(QWEN_DIR, 'agents', `${scenario.agent}.md`);
  
  if (!fileExists(agentFile)) {
    result.status = 'failed';
    result.details = `Agent file not found: ${agentFile}`;
    return result;
  }

  const content = readFile(agentFile);
  const expected = scenario.expected;

  if (expected.has_frontmatter && !content.includes('---\nname:')) {
    result.status = 'failed';
    result.details = 'Missing frontmatter';
    return result;
  }

  if (expected.has_boundaries && !content.includes('## Boundaries')) {
    result.status = 'failed';
    result.details = 'Missing boundaries section';
    return result;
  }

  if (expected.has_success_metrics && !content.includes('Success Metrics')) {
    result.status = 'failed';
    result.details = 'Missing success metrics section';
    return result;
  }

  result.status = 'success';
  result.details = `Agent valid (${content.length} bytes)`;
  return result;
}

function runPolicyScenario(scenario, result) {
  const policyFile = path.join(QWEN_DIR, 'policy.json');
  
  if (!fileExists(policyFile)) {
    result.status = 'failed';
    result.details = 'Policy file not found';
    return result;
  }

  try {
    const policy = JSON.parse(readFile(policyFile));
    
    if (scenario.test_type === 'blocked_path') {
      const inputPath = scenario.input.file_path;
      if (policy.file_policies?.blocked_paths) {
        const isBlocked = policy.file_policies.blocked_paths.some(bp => inputPath.startsWith(bp));
        if (isBlocked) {
          result.status = 'blocked';
          result.details = `Blocked path: ${inputPath}`;
          return result;
        }
      }
      result.status = 'failed';
      result.details = `Path should be blocked but wasn't: ${inputPath}`;
    } else if (scenario.test_type === 'allowed_path') {
      const inputPath = scenario.input.file_path;
      if (policy.file_policies?.blocked_paths) {
        const isBlocked = policy.file_policies.blocked_paths.some(bp => inputPath.startsWith(bp));
        if (!isBlocked) {
          result.status = 'allowed';
          result.details = `Allowed path: ${inputPath}`;
          return result;
        }
      }
      result.status = 'failed';
      result.details = `Path should be allowed but was blocked: ${inputPath}`;
    }
  } catch (e) {
    result.status = 'failed';
    result.details = `Policy check failed: ${e.message}`;
  }

  return result;
}

function runSecurityScenario(scenario, result) {
  const securityScript = path.join(QWEN_DIR, 'scripts', 'security-check.js');
  
  if (!fileExists(securityScript)) {
    result.status = 'failed';
    result.details = 'Security check script not found';
    return result;
  }

  try {
    // Simulate hook input - properly escape JSON for Windows
    const inputJson = JSON.stringify({
      toolName: 'bash',
      toolInput: { command: scenario.input.command }
    });
    
    // Write to temp file to avoid quoting issues
    const tmpFile = path.join(__dirname, 'mock-parity', 'tmp-input.json');
    fs.writeFileSync(tmpFile, inputJson, 'utf8');
    
    let output = '';
    try {
      output = execSync(`type "${tmpFile}" | node "${securityScript}" 2>&1`, {
        encoding: 'utf8',
        timeout: 5000
      }).trim();
    } catch (e) {
      // Security check exits with code 2 when blocking - that's expected
      output = (e.stdout || e.stderr || '').trim();
    }

    // Cleanup
    try { fs.unlinkSync(tmpFile); } catch {}

    if (scenario.test_type === 'blocked_command') {
      if (output.includes('SECURITY BLOCK') || output.includes('permissionDecision":"deny"')) {
        result.status = 'blocked';
        result.details = `Dangerous command blocked: ${scenario.input.command}`;
      } else {
        result.status = 'failed';
        result.details = `Command should be blocked: ${scenario.input.command}. Output: ${output.slice(0, 200)}`;
      }
    }
  } catch (e) {
    result.status = 'failed';
    result.details = `Security check failed: ${e.message}`;
  }

  return result;
}

function runFileValidationScenario(scenario, result) {
  const expected = scenario.expected;
  
  if (!scenario.files || scenario.files.length === 0) {
    result.status = 'failed';
    result.details = 'No files specified';
    return result;
  }

  const allExist = scenario.files.every(f => fileExists(f));
  if (!allExist) {
    const missing = scenario.files.filter(f => !fileExists(f));
    result.status = 'failed';
    result.details = `Missing files: ${missing.join(', ')}`;
    return result;
  }

  const allNonEmpty = scenario.files.every(f => {
    try {
      return fs.statSync(f).size > 0;
    } catch {
      return false;
    }
  });
  if (!allNonEmpty) {
    result.status = 'failed';
    result.details = 'Some files are empty';
    return result;
  }

  if (expected.min_lines) {
    const shortFiles = scenario.files.filter(f => {
      const content = readFile(f);
      return content && content.split('\n').length < expected.min_lines;
    });
    if (shortFiles.length > 0) {
      result.status = 'failed';
      result.details = `Files shorter than ${expected.min_lines} lines: ${shortFiles.join(', ')}`;
      return result;
    }
  }

  result.status = 'success';
  result.details = `All ${scenario.files.length} files valid`;
  return result;
}

function runHookValidationScenario(scenario, result) {
  const expected = scenario.expected;
  const scriptsDir = path.join(QWEN_DIR, 'scripts');

  if (!scenario.hooks || scenario.hooks.length === 0) {
    result.status = 'failed';
    result.details = 'No hooks specified';
    return result;
  }

  const allExist = scenario.hooks.every(h => fileExists(path.join(scriptsDir, h)));
  if (!allExist) {
    const missing = scenario.hooks.filter(h => !fileExists(path.join(scriptsDir, h)));
    result.status = 'failed';
    result.details = `Missing hook scripts: ${missing.join(', ')}`;
    return result;
  }

  // Validate JavaScript syntax
  const allValid = scenario.hooks.every(h => {
    try {
      const scriptPath = path.join(scriptsDir, h);
      execSync(`node -c "${scriptPath}" 2>&1`, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  });

  if (!allValid) {
    const invalid = scenario.hooks.filter(h => {
      try {
        execSync(`node -c "${path.join(scriptsDir, h)}" 2>&1`, { timeout: 3000 });
        return false;
      } catch {
        return true;
      }
    });
    result.status = 'failed';
    result.details = `Invalid JS syntax: ${invalid.join(', ')}`;
    return result;
  }

  result.status = 'success';
  result.details = `All ${scenario.hooks.length} hook scripts valid`;
  return result;
}

// Main
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const specificScenario = args.find(a => a.startsWith('--scenario='))?.split('=')[1];

log('\n🧪 Mock Parity Test Runner\n');

const scenariosData = loadScenarios();
const scenarios = specificScenario
  ? scenariosData.scenarios.filter(s => s.id === specificScenario)
  : scenariosData.scenarios;

if (scenarios.length === 0) {
  log(`No scenarios found matching "${specificScenario}"`, 'warn');
  process.exit(1);
}

log(`Running ${scenarios.length} scenarios...\n`);

for (const scenario of scenarios) {
  const result = runScenario(scenario, verbose);
  results.push(result);
}

log('\n' + '='.repeat(50));
log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

if (failed > 0) {
  log('Failed scenarios:', 'fail');
  results.filter(r => r.status === 'failed').forEach(r => {
    log(`  - ${r.id}: ${r.details}`, 'fail');
  });
  process.exit(1);
} else {
  log('All parity checks passed!', 'pass');
  process.exit(0);
}
