#!/usr/bin/env node
/**
 * Dependency audit script - checks for outdated packages and security advisories
 * Usage: node .qwen/scripts/dependency-audit.js [--fix] [--json] [--vulnerable-only]
 * 
 * Options:
 *   --fix             Show commands to fix issues
 *   --json            Output JSON format
 *   --vulnerable-only Show only vulnerable packages
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
let fix = false;
let outputJson = false;
let vulnerableOnly = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fix' || args[i] === '-f') {
    fix = true;
  } else if (args[i] === '--json' || args[i] === '-j') {
    outputJson = true;
  } else if (args[i] === '--vulnerable-only' || args[i] === '-v') {
    vulnerableOnly = true;
  }
}

function getPackageManager() {
  const lockFiles = {
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
    'package-lock.json': 'npm'
  };
  
  for (const [file, manager] of Object.entries(lockFiles)) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      return manager;
    }
  }
  
  return 'npm';
}

function runNpmAudit() {
  try {
    const output = execSync('npm audit --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(output);
  } catch (e) {
    // npm audit returns non-zero for vulnerabilities
    if (e.stdout) {
      try {
        return JSON.parse(e.stdout);
      } catch (e2) {
        return { vulnerabilities: {} };
      }
    }
    return { vulnerabilities: {} };
  }
}

function runNpmOutdated() {
  try {
    const output = execSync('npm outdated --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(output);
  } catch (e) {
    return {};
  }
}

function runNpmList() {
  try {
    const output = execSync('npm ls --all --json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(output);
  } catch (e) {
    if (e.stdout) {
      try {
        return JSON.parse(e.stdout);
      } catch (e2) {
        return { dependencies: {} };
      }
    }
    return { dependencies: {} };
  }
}

function analyzeVulnerabilities(auditData) {
  const vulns = auditData.vulnerabilities || {};
  const results = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    total: 0
  };
  
  for (const [name, info] of Object.entries(vulns)) {
    const severity = info.severity || 'low';
    results[severity === 'critical' ? 'critical' : 
            severity === 'high' ? 'high' : 
            severity === 'medium' ? 'medium' : 'low'].push({
      name,
      severity,
      via: info.via || [],
      effects: info.effects || []
    });
    results.total++;
  }
  
  return results;
}

function analyzeOutdated(outdatedData) {
  const results = [];
  
  for (const [name, info] of Object.entries(outdatedData)) {
    results.push({
      name,
      current: info.current,
      wanted: info.wanted,
      latest: info.latest,
      type: info.type,
      severity: info.type === 'major' ? 'high' : info.type === 'minor' ? 'medium' : 'low'
    });
  }
  
  return results;
}

function analyzeDependencies(depsData) {
  const results = [];
  
  function flatten(deps, prefix = '') {
    for (const [name, info] of Object.entries(deps || {})) {
      const fullName = prefix ? prefix + '/' + name : name;
      results.push({
        name: fullName,
        version: info.version || 'unknown',
        resolved: info.resolved || 'unknown',
        dev: info.dev || false
      });
      
      if (info.dependencies) {
        flatten(info.dependencies, fullName);
      }
    }
  }
  
  flatten(depsData.dependencies);
  
  return results;
}

function main() {
  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No package.json found in current directory');
    process.exit(1);
  }
  
  const packageManager = getPackageManager();
  console.log('\n📦 Dependency Audit');
  console.log('   Package manager: ' + packageManager);
  console.log('='.repeat(50));
  
  // Run audits
  const auditData = runNpmAudit();
  const outdatedData = runNpmOutdated();
  const depsData = runNpmList();
  
  const vulnerabilities = analyzeVulnerabilities(auditData);
  const outdated = analyzeOutdated(outdatedData);
  const allDeps = analyzeDependencies(depsData);
  
  if (outputJson) {
    console.log(JSON.stringify({
      vulnerabilities,
      outdated,
      totalDependencies: allDeps.length
    }, null, 2));
    process.exit(vulnerabilities.total > 0 ? 1 : 0);
  }
  
  // Print vulnerabilities
  console.log('\n🔴 Vulnerabilities\n');
  
  if (vulnerabilities.total === 0) {
    console.log('   ✅ No vulnerabilities found');
  } else {
    console.log(`   Total: ${vulnerabilities.total} vulnerabilities\n`);
    
    if (vulnerabilities.critical.length > 0) {
      console.log('   🔴 Critical (' + vulnerabilities.critical.length + '):');
      for (const v of vulnerabilities.critical.slice(0, 5)) {
        console.log(`      - ${v.name}`);
      }
      if (vulnerabilities.critical.length > 5) {
        console.log(`      ... and ${vulnerabilities.critical.length - 5} more`);
      }
    }
    
    if (vulnerabilities.high.length > 0) {
      console.log('\n   🟠 High (' + vulnerabilities.high.length + '):');
      for (const v of vulnerabilities.high.slice(0, 5)) {
        console.log(`      - ${v.name}`);
      }
    }
    
    if (vulnerabilities.medium.length > 0) {
      console.log('\n   🟡 Medium (' + vulnerabilities.medium.length + '):');
      for (const v of vulnerabilities.medium.slice(0, 3)) {
        console.log(`      - ${v.name}`);
      }
    }
  }
  
  // Print outdated
  console.log('\n\n📅 Outdated Packages\n');
  
  if (outdated.length === 0) {
    console.log('   ✅ All packages up to date');
  } else {
    console.log('   Total: ' + outdated.length + ' outdated\n');
    
    const major = outdated.filter(o => o.type === 'major');
    const minor = outdated.filter(o => o.type === 'minor');
    const patch = outdated.filter(o => o.type === 'patch');
    
    if (major.length > 0) {
      console.log('   ⚠️  Major updates (' + major.length + '):');
      for (const o of major.slice(0, 5)) {
        console.log(`      - ${o.name}: ${o.current} → ${o.latest}`);
      }
    }
    
    if (minor.length > 0) {
      console.log('\n   📝 Minor updates (' + minor.length + '):');
      for (const o of minor.slice(0, 3)) {
        console.log(`      - ${o.name}: ${o.current} → ${o.latest}`);
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary\n');
  console.log('   Total dependencies: ' + allDeps.length);
  console.log('   Vulnerabilities: ' + vulnerabilities.total);
  console.log('   Outdated: ' + outdated.length);
  
  // Recommendations
  if (vulnerabilities.total > 0 || outdated.length > 0) {
    console.log('\n💡 Recommendations:\n');
    
    if (vulnerabilities.total > 0) {
      console.log('   Fix vulnerabilities:');
      console.log('      npm audit fix');
      console.log('      # or for breaking changes:');
      console.log('      npm audit fix --force\n');
    }
    
    if (outdated.length > 0) {
      console.log('   Update packages:');
      console.log('      npm update');
      console.log('      # or update specific:');
      console.log('      npm install <package>@latest\n');
    }
  }
  
  // Exit code
  if (vulnerabilities.total > 0) {
    console.log('\n❌ Security vulnerabilities found!\n');
    process.exit(1);
  } else if (outdated.length > 0 && !vulnerableOnly) {
    console.log('\n⚠️  Outdated packages found.\n');
    process.exit(0);
  } else {
    console.log('\n✅ All dependencies healthy!\n');
    process.exit(0);
  }
}

main();
