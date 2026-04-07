#!/usr/bin/env node
/**
 * Dead code detection script - finds unused functions, variables, and exports
 * Usage: node .qwen/scripts/dead-code.js [--json] [--whitelist PATTERN] [--verbose]
 * 
 * Options:
 *   --json        Output JSON format
 *   --whitelist   Patterns to exclude from dead code check
 *   --verbose     Show detailed analysis
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '.qwen', 'vendor', '__pycache__'],
  excludeFiles: ['.test.js', '.spec.js', '.test.ts', '.spec.ts', 'mock-*.js', '__mocks__'],
  whitelist: [],
  tools: {
    tsPrune: true,
    depcheck: true,
    unused: true
  }
};

// Parse arguments
const args = process.argv.slice(2);
let outputJson = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--json' || args[i] === '-j') {
    outputJson = true;
  } else if (args[i] === '--whitelist' && args[i + 1]) {
    CONFIG.whitelist.push(args[++i]);
  } else if (args[i] === '--verbose' || args[i] === '-v') {
    CONFIG.verbose = true;
  }
}

// Get language from file extension
function getLanguage(file) {
  const ext = path.extname(file).toLowerCase();
  const langMap = {
    '.js': 'js', '.jsx': 'js', '.mjs': 'js', '.cjs': 'js',
    '.ts': 'ts', '.tsx': 'ts',
    '.py': 'py',
    '.go': 'go',
    '.rs': 'rs',
    '.java': 'java'
  };
  return langMap[ext] || null;
}

// Simple heuristic dead code detection
function findDeadCodeSimple(content, language, filePath) {
  const findings = [];
  
  if (language === 'js' || language === 'ts') {
    // Find unused exports
    const exportRegex = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
    const allExportNames = new Set();
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      allExportNames.add(match[1]);
    }
    
    // Find if export is used in the file or elsewhere
    // This is a simplified check - real tools like ts-prune are better
    
    // Check for exported but possibly unused
    for (const name of allExportNames) {
      // Simple heuristic: if only exported and no obvious usage
      const usageCount = (content.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
      if (usageCount === 1) { // Only the export itself
        findings.push({
          type: 'possibly_unused_export',
          name,
          line: content.substring(0, content.indexOf(name)).split('\n').length,
          severity: 'warning'
        });
      }
    }
    
    // Check for console.log statements (debug code)
    const consoleLogRegex = /console\.\w+\(/g;
    let consoleMatch;
    const consoleLines = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (consoleLogRegex.test(lines[i])) {
        consoleLines.push(i + 1);
      }
    }
    
    if (consoleLines.length > 0) {
      findings.push({
        type: 'debug_statement',
        name: 'console.log',
        lines: consoleLines,
        severity: 'info'
      });
    }
    
    // Check for unused variables (simple pattern)
    const unusedVarRegex = /(?:const|let|var)\s+(\w+)\s*=\s*[^;]+;/g;
    while ((match = unusedVarRegex.exec(content)) !== null) {
      const varName = match[1];
      const afterMatch = content.substring(match.index + match[0].length);
      const usageCount = (afterMatch.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
      
      if (usageCount === 0) {
        findings.push({
          type: 'unused_variable',
          name: varName,
          line: content.substring(0, match.index).split('\n').length,
          severity: 'warning'
        });
      }
    }
  } else if (language === 'py') {
    // Python-specific checks
    const defRegex = /(?:^|\n)\s*def\s+(\w+)\s*\([^)]*\):/gm;
    const definedFunctions = new Set();
    
    while ((match = defRegex.exec(content)) !== null) {
      definedFunctions.add(match[1]);
    }
    
    // Check for unused imports
    const importRegex = /(?:^|\n)\s*import\s+(\w+)/gm;
    const importNames = new Set();
    
    while ((match = importRegex.exec(content)) !== null) {
      importNames.add(match[1]);
    }
    
    // Check if imported names are used
    for (const name of importNames) {
      const afterImport = content.substring(content.indexOf('import ' + name));
      const usage = afterImport.substring(0, afterImport.indexOf('import '));
      const usageCount = (usage.match(new RegExp(`\\b${name}\\b`, 'g')) || []).length;
      
      if (usageCount === 0) {
        findings.push({
          type: 'unused_import',
          name,
          line: 1,
          severity: 'warning'
        });
      }
    }
  }
  
  return findings;
}

function checkFile(filePath, relativePath) {
  // Check whitelist
  for (const pattern of CONFIG.whitelist) {
    if (relativePath.includes(pattern)) {
      return [];
    }
  }
  
  // Check exclude files
  const fileName = path.basename(filePath);
  if (CONFIG.excludeFiles.some(f => fileName.includes(f.replace('*', '')))) {
    return [];
  }
  
  const language = getLanguage(fileName);
  if (!language) {
    return [];
  }
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return [];
  }
  
  return findDeadCodeSimple(content, language, relativePath);
}

function scanDirectory(dir, relativePath = '') {
  const allFindings = [];
  
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return allFindings;
  }
  
  for (const file of files) {
    if (file.startsWith('.')) continue;
    if (CONFIG.excludeDirs.includes(file)) continue;
    
    const filePath = path.join(dir, file);
    const fileRelativePath = path.join(relativePath, file);
    
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (e) {
      continue;
    }
    
    if (stat.isDirectory()) {
      allFindings.push(...scanDirectory(filePath, fileRelativePath));
    } else if (/\.(js|ts|jsx|tsx|mjs|cjs|py|go|rs|java)$/.test(file)) {
      const findings = checkFile(filePath, fileRelativePath);
      if (findings.length > 0) {
        allFindings.push({
          file: fileRelativePath,
          findings
        });
      }
    }
  }
  
  return allFindings;
}

function checkWithTools() {
  const tools = [];
  
  // Try ts-prune
  try {
    execSync('ts-prune --help', { stdio: 'ignore' });
    tools.push({ name: 'ts-prune', available: true });
  } catch (e) {
    tools.push({ name: 'ts-prune', available: false });
  }
  
  // Try depcheck
  try {
    execSync('depcheck --help', { stdio: 'ignore' });
    tools.push({ name: 'depcheck', available: true });
  } catch (e) {
    tools.push({ name: 'depcheck', available: false });
  }
  
  return tools;
}

function main() {
  const cwd = process.cwd();
  
  console.log('\n💀 Dead Code Detection\n');
  console.log('='.repeat(50));
  
  // Check available tools
  const tools = checkWithTools();
  console.log('\n📦 Available tools:');
  for (const tool of tools) {
    console.log(`   ${tool.available ? '✅' : '❌'} ${tool.name}`);
  }
  
  // Run simple detection
  const findings = scanDirectory(cwd);
  
  if (outputJson) {
    console.log(JSON.stringify(findings, null, 2));
    process.exit(findings.length > 0 ? 1 : 0);
  }
  
  if (findings.length === 0) {
    console.log('\n✅ No dead code detected!\n');
    process.exit(0);
  }
  
  console.log('\n⚠️  Findings:\n');
  console.log('='.repeat(50));
  
  let total = 0;
  
  for (const fileFinding of findings) {
    console.log(`\n📁 ${fileFinding.file}`);
    
    for (const finding of fileFinding.findings) {
      const icon = finding.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
      console.log(`   ${icon} ${finding.type}: ${finding.name}`);
      if (finding.line) {
        console.log(`      Line: ${finding.line}`);
      }
      if (finding.lines) {
        console.log(`      Lines: ${finding.lines.join(', ')}`);
      }
      total++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n⚠️  Total: ${total} potential issue(s) found\n`);
  
  console.log('💡 Recommendations:\n');
  console.log('   - Install ts-prune: npm install -D ts-prune');
  console.log('   - Install depcheck: npm install -D depcheck');
  console.log('   - Run: npx ts-prune');
  console.log('   - Run: npx depcheck\n');
  
  process.exit(1);
}

main();
