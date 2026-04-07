#!/usr/bin/env node
/**
 * Setup Validation Script for Qwen Code AI Engineering Setup
 * 
 * Verifies all components are properly installed and configured.
 * Run: node .qwen/scripts/validate-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = path.join(process.cwd(), '.qwen');

let passed = 0;
let failed = 0;
let warnings = 0;

function check(name, fn) {
  try {
    const result = fn();
    if (result === true || result === undefined) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ⚠ ${name}: ${result}`);
      warnings++;
    }
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`);
    failed++;
  }
}

function exists(filePath) {
  const fullPath = path.join(BASE, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File missing: ${filePath}`);
  }
  const stat = fs.statSync(fullPath);
  if (stat.size === 0) {
    throw new Error(`File empty: ${filePath}`);
  }
  return true;
}

console.log('\n🔧 Qwen Code AI Engineering Setup Validation\n');

// 1. Core Config
console.log('📋 Core Configuration:');
check('settings.json exists', () => exists('settings.json'));
check('settings.json has MCP servers', () => {
  const settings = JSON.parse(fs.readFileSync(path.join(BASE, 'settings.json'), 'utf8'));
  const mcpCount = Object.keys(settings.mcpServers || {}).length;
  return mcpCount > 0 ? `${mcpCount} MCP servers configured` : 'No MCP servers';
});
check('settings.json has hooks', () => {
  const settings = JSON.parse(fs.readFileSync(path.join(BASE, 'settings.json'), 'utf8'));
  const hookCount = Object.keys(settings.hooks || {}).length;
  return hookCount > 0 ? `${hookCount} hook events configured` : 'No hooks';
});

// 2. Memory Files
console.log('\n🧠 Memory & Context:');
check('memory-global.md exists', () => exists('memory-global.md'));
check('memory-project.md exists', () => exists('memory-project.md'));

// 3. Hook Scripts
console.log('\n🪝 Hook Scripts:');
const hookScripts = [
  'scripts/security-check.js',
  'scripts/auto-lint.js',
  'scripts/error-analyzer.js',
  'scripts/pre-compact-memory.js',
  'scripts/session-summary.js',
  'scripts/agent-log.js'
];
hookScripts.forEach(script => {
  check(`${path.basename(script)}`, () => exists(script));
});

// 4. Scraping Commands
console.log('\n⚡ Scraping Commands:');
check('commands/scrape.md', () => exists('commands/scrape.md'));
check('commands/firecrawl.md', () => exists('commands/firecrawl.md'));
check('commands/scraping.md', () => exists('commands/scraping.md'));

// 5. Scraping Agents
console.log('\n🤖 Scraping Agents:');
check('agents/web-scraper-engineer.md', () => exists('agents/web-scraper-engineer.md'));
check('agents/firecrawl-engineer.md', () => exists('agents/firecrawl-engineer.md'));
check('agents/scrapy-engineer.md', () => exists('agents/scrapy-engineer.md'));

// 6. Scraping Skills
console.log('\n🛠️ Scraping Skills:');
const scrapingSkills = [
  'skills/scrapling.py',
  'skills/scrapling.skill.json',
  'skills/scrapling-workflow.md',
  'skills/firecrawl.py',
  'skills/firecrawl.skill.json',
  'skills/firecrawl-workflow.md',
  'skills/scrapy.py',
  'skills/scrapy.skill.json',
  'skills/scrapy-workflow.md',
  'skills/scrapling_monitoring.py',
  'skills/scraping_monitoring_extra.py',
  'skills/scraping_data_quality.py',
  'skills/scraping_unified_dashboard.json',
  'skills/scraping-framework-selector.md',
  'skills/ai-review.md'
];
scrapingSkills.forEach(skill => {
  check(`${path.basename(skill)}`, () => exists(skill));
});

// 7. Documentation
console.log('\n📚 Documentation:');
check('TOOLS.md', () => exists('TOOLS.md'));
check('DEVX.md', () => exists('DEVX.md'));

// 8. Python Dependencies
console.log('\n🐍 Python Dependencies:');
check('scrapling', () => {
  try {
    execSync('python -c "import scrapling"', { stdio: 'pipe' });
    return 'installed';
  } catch { return 'not installed (optional)'; }
});
check('scrapy', () => {
  try {
    execSync('python -c "import scrapy"', { stdio: 'pipe' });
    return 'installed';
  } catch { return 'not installed (optional)'; }
});
check('firecrawl-py', () => {
  try {
    execSync('python -c "import firecrawl"', { stdio: 'pipe' });
    return 'installed';
  } catch { return 'not installed (optional)'; }
});
check('pydantic', () => {
  try {
    execSync('python -c "import pydantic"', { stdio: 'pipe' });
    return 'installed';
  } catch { return 'not installed'; }
});

// 9. Node.js Dependencies (for MCP servers)
console.log('\n📦 Node.js / MCP:');
check('node.js available', () => {
  execSync('node --version', { stdio: 'pipe' });
  return 'available';
});
check('npx available', () => {
  execSync('npx --version', { stdio: 'pipe' });
  return 'available';
});

// 10. Agent Count
console.log('\n🤖 Agent Registry:');
const agentsDir = path.join(BASE, 'agents');
const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'INDEX.txt');
check(`Agent files: ${agentFiles.length}`, () => agentFiles.length >= 50 ? true : `Only ${agentFiles.length} agents`);

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\nResults: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);

if (failed > 0) {
  console.log('⚠️  Some checks failed. Review the output above.');
  process.exit(1);
} else if (warnings > 0) {
  console.log('✅ All critical checks passed. Some optional components are not installed.');
  process.exit(0);
} else {
  console.log('✅ All checks passed! Setup is complete.');
  process.exit(0);
}
