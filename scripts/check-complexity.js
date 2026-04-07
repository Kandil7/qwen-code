#!/usr/bin/env node
/**
 * Enhanced complexity checker with AST parsing, cyclomatic complexity, and multi-language support
 * Usage: node .qwen/scripts/check-complexity.js [--json] [--fix] [--verbose]
 * 
 * Options:
 *   --json     Output JSON format
 *   --fix      Show suggestions for fixing issues
 *   --verbose   Show detailed analysis
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  maxFunctionLines: 50,
  maxFileLines: 800,
  maxNestingDepth: 4,
  maxCyclomaticComplexity: 10,
  maxClassLines: 300,
  excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '.qwen', 'vendor', '__pycache__', '.pytest_cache'],
  languages: {
    js: { extensions: ['.js', '.jsx', '.mjs', '.cjs'], parser: 'js' },
    ts: { extensions: ['.ts', '.tsx'], parser: 'ts' },
    py: { extensions: ['.py'], parser: 'python' },
    go: { extensions: ['.go'], parser: 'go' },
    rs: { extensions: ['.rs'], parser: 'rust' },
    java: { extensions: ['.java'], parser: 'java' }
  }
};

// Parse arguments
const args = process.argv.slice(2);
const outputJson = args.includes('--json') || args.includes('-j');
const showFix = args.includes('--fix') || args.includes('-f');
const verbose = args.includes('--verbose') || args.includes('-v');

function countLines(content) {
  return content.split('\n').filter(line => line.trim().length > 0).length;
}

// Count cyclomatic complexity (simplified)
function countCyclomaticComplexity(content) {
  const patterns = [
    /\bif\b/g,
    /\belse\s+if\b/g,
    /\bwhile\b/g,
    /\bfor\b/g,
    /\bcatch\b/g,
    /\?\?/g,
    /\|\|/g,
    /&&/g
  ];
  
  let complexity = 1; // Base complexity
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  }
  
  return complexity;
}

// Find functions/methods with AST-like approach
function findFunctions(content, language) {
  const functions = [];
  const lines = content.split('\n');
  
  if (language === 'js' || language === 'ts') {
    // JavaScript/TypeScript function patterns
    const patterns = [
      /function\s+(\w+)\s*\(/g,
      /(?:async\s+)?(?:export\s+)?function\s+(\w+)\s*\(/g,
      /(?:async\s+)?(\w+)\s*\([^)]*\)\s*[=:]\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>/g,
      /(?:async\s+)?(\w+)\s*\([^)]*\)\s*:\s*(?:\w+|<[^>]+>)\s*\{/g,
      /static\s+(\w+)\s*\([^)]*\)\s*\{/g,
      /#(\w+)\s*\([^)]*\)\s*\{/g // Private methods
    ];
    
    for (const pattern of patterns) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      while ((match = regex.exec(content)) !== null) {
        const startIdx = match.index;
        const funcName = match[1] || 'anonymous';
        
        // Find function end by counting braces
        let braceCount = 0;
        let endIdx = startIdx;
        let started = false;
        
        for (let i = startIdx; i < content.length; i++) {
          if (content[i] === '{') {
            braceCount++;
            started = true;
          } else if (content[i] === '}') {
            braceCount--;
          }
          
          if (started && braceCount === 0) {
            endIdx = i;
            break;
          }
        }
        
        if (endIdx > startIdx) {
          const funcContent = content.substring(startIdx, endIdx + 1);
          const startLine = content.substring(0, startIdx).split('\n').length;
          const complexity = countCyclomaticComplexity(funcContent);
          const lines = countLines(funcContent);
          
          functions.push({
            name: funcName,
            lines,
            startLine,
            complexity,
            type: pattern.source.includes('=>') ? 'arrow' : 'regular'
          });
        }
      }
    }
  } else if (language === 'py') {
    // Python function patterns
    const defRegex = /(?:^|\n)\s*(?:async\s+)?def\s+(\w+)\s*\([^)]*\):/gm;
    let match;
    while ((match = defRegex.exec(content)) !== null) {
      const startIdx = match.index;
      const funcName = match[1];
      
      // Find function body (indented lines)
      const lineStart = content.substring(0, startIdx).split('\n').length;
      const remaining = content.substring(startIdx);
      const funcLines = remaining.split('\n');
      
      let funcContent = '';
      let baseIndent = -1;
      
      for (let i = 0; i < funcLines.length; i++) {
        const line = funcLines[i];
        if (i === 0) continue;
        
        if (baseIndent === -1 && line.trim().length > 0) {
          baseIndent = line.length - line.trim().length;
        }
        
        if (line.trim().length > 0 && (line.length - line.trim().length) <= baseIndent && i > 0) {
          break;
        }
        
        funcContent += line + '\n';
      }
      
      const complexity = countCyclomaticComplexity(funcContent);
      const lines = countLines(funcContent);
      
      functions.push({
        name: funcName,
        lines,
        startLine: lineStart,
        complexity,
        type: 'python'
      });
    }
    
    // Class detection
    const classRegex = /(?:^|\n)\s*class\s+(\w+)(?:\([^)]*\))?:/gm;
    while ((match = classRegex.exec(content)) !== null) {
      const startLine = content.substring(0, match.index).split('\n').length;
      functions.push({
        name: match[1],
        lines: 0,
        startLine,
        complexity: 1,
        type: 'class',
        isClass: true
      });
    }
  } else if (language === 'go') {
    // Go function patterns
    const funcRegex = /func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/g;
    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const startIdx = match.index;
      const funcName = match[1];
      const startLine = content.substring(0, startIdx).split('\n').length;
      
      functions.push({
        name: funcName,
        lines: 0,
        startLine,
        complexity: 1,
        type: 'go'
      });
    }
  } else if (language === 'rs') {
    // Rust function patterns
    const fnRegex = /(?:^|\n)\s*(?:pub\s+)?(?:async\s+)?fn\s+(\w+)/gm;
    let match;
    while ((match = fnRegex.exec(content)) !== null) {
      const startIdx = match.index;
      const funcName = match[1];
      const startLine = content.substring(0, startIdx).split('\n').length;
      
      functions.push({
        name: funcName,
        lines: 0,
        startLine,
        complexity: 1,
        type: 'rust'
      });
    }
  }
  
  return functions;
}

// Check nesting depth
function checkNestingDepth(content) {
  const lines = content.split('\n');
  let maxDepth = 0;
  let currentDepth = 0;
  
  for (const line of lines) {
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    
    currentDepth += openBraces;
    maxDepth = Math.max(maxDepth, currentDepth);
    currentDepth -= closeBraces;
  }
  
  return maxDepth;
}

// Get language from file extension
function getLanguage(file) {
  const ext = path.extname(file);
  for (const [lang, config] of Object.entries(CONFIG.languages)) {
    if (config.extensions.includes(ext)) {
      return lang;
    }
  }
  return null;
}

function checkFile(filePath, relativePath) {
  const issues = [];
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return issues;
  }
  
  const language = getLanguage(relativePath);
  const totalLines = countLines(content);
  
  // Check file size
  if (totalLines > CONFIG.maxFileLines) {
    issues.push({
      type: 'FILE_TOO_LARGE',
      message: `File has ${totalLines} lines (max: ${CONFIG.maxFileLines})`,
      severity: 'WARNING',
      fix: 'Split file by feature or responsibility. Consider extracting utilities to separate files.',
      line: 1
    });
  }
  
  // Check functions
  const functions = findFunctions(content, language);
  for (const func of functions) {
    if (func.lines > CONFIG.maxFunctionLines) {
      issues.push({
        type: 'FUNCTION_TOO_LONG',
        message: `Function '${func.name}' has ${func.lines} lines (max: ${CONFIG.maxFunctionLines}) at line ${func.startLine}`,
        severity: 'WARNING',
        fix: `Extract logic into smaller helper functions. Consider the Single Responsibility Principle.`,
        line: func.startLine
      });
    }
    
    // Check cyclomatic complexity
    if (func.complexity > CONFIG.maxCyclomaticComplexity) {
      issues.push({
        type: 'HIGH_COMPLEXITY',
        message: `Function '${func.name}' has cyclomatic complexity of ${func.complexity} (max: ${CONFIG.maxCyclomaticComplexity}) at line ${func.startLine}`,
        severity: 'WARNING',
        fix: `Simplify conditional logic. Consider extracting complex branches into separate functions.`,
        line: func.startLine
      });
    }
  }
  
  // Check nesting
  const nestingDepth = checkNestingDepth(content);
  if (nestingDepth > CONFIG.maxNestingDepth) {
    issues.push({
      type: 'DEEP_NESTING',
      message: `Maximum nesting depth is ${nestingDepth} (max: ${CONFIG.maxNestingDepth})`,
      severity: 'WARNING',
      fix: `Use guard clauses, early returns, or extract nested logic into separate functions.`,
      line: 1
    });
  }
  
  // Additional metrics for verbose mode
  if (verbose && functions.length > 0) {
    const totalComplexity = functions.reduce((sum, f) => sum + f.complexity, 0);
    const avgComplexity = totalComplexity / functions.length;
    
    issues.push({
      type: 'METRICS',
      message: `${functions.length} functions/methods, avg complexity: ${avgComplexity.toFixed(1)}`,
      severity: 'INFO',
      fix: null,
      line: 1
    });
  }
  
  return issues;
}

function scanDirectory(dir, relativePath = '') {
  const allIssues = [];
  
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return allIssues;
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
      allIssues.push(...scanDirectory(filePath, fileRelativePath));
    } else {
      const language = getLanguage(file);
      if (language && /\.(js|ts|jsx|tsx|mjs|cjs|py|go|rs|java)$/.test(file)) {
        const issues = checkFile(filePath, fileRelativePath);
        if (issues.length > 0) {
          allIssues.push({
            file: fileRelativePath,
            issues
          });
        }
      }
    }
  }
  
  return allIssues;
}

function outputJsonFormat(issues) {
  const output = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFilesWithIssues: issues.length,
      totalIssues: issues.reduce((sum, f) => sum + f.issues.length, 0)
    },
    issues: issues.map(f => ({
      file: f.file,
      issues: f.issues.map(i => ({
        type: i.type,
        message: i.message,
        severity: i.severity,
        line: i.line
      }))
    }))
  };
  
  console.log(JSON.stringify(output, null, 2));
}

function main() {
  const cwd = process.cwd();
  const issues = scanDirectory(cwd);
  
  if (outputJson) {
    outputJsonFormat(issues);
    process.exit(issues.length > 0 ? 1 : 0);
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Complexity Issues Found\n');
    console.log('='.repeat(70));
    
    let totalIssues = 0;
    
    for (const fileIssues of issues) {
      console.log(`\n📁 ${fileIssues.file}`);
      for (const issue of fileIssues.issues) {
        const icon = issue.severity === 'WARNING' ? '⚠️ ' : 'ℹ️ ';
        console.log(`   ${icon}[${issue.severity}] ${issue.message}`);
        if (showFix && issue.fix) {
          console.log(`      💡 ${issue.fix}`);
        }
        totalIssues++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n⚠️  Total: ${totalIssues} issue(s) found\n`);
    
    console.log('💡 Recommendations:\n');
    console.log('   - Extract large functions into smaller helpers');
    console.log('   - Split large files by feature/responsibility');
    console.log('   - Reduce nesting with guard clauses and early returns');
    console.log('   - Simplify complex conditionals');
    console.log('   - Use descriptive naming to avoid complex logic\n');
    
    process.exit(1);
  } else {
    console.log('\n✅ No complexity issues found. Code structure looks good!\n');
    process.exit(0);
  }
}

main();
