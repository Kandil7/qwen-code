#!/usr/bin/env node
/**
 * Enhanced debug statement finder with auto-fix and multi-language support
 * Usage: node .qwen/scripts/find-debug-statements.js [--auto-fix] [--dry-run] [--exclude PATTERN]
 * 
 * Options:
 *   --auto-fix   Remove debug statements from files
 *   --dry-run    Preview changes without applying
 *   --exclude    Exclude patterns from config
 */

const fs = require('fs');
const path = require('path');

// Enhanced debug patterns
const DEBUG_PATTERNS = [
  // JavaScript/Node.js
  { name: 'console.log', pattern: /console\.log\(/g, languages: ['js', 'ts', 'jsx', 'tsx'] },
  { name: 'console.debug', pattern: /console\.debug\(/g, languages: ['js', 'ts', 'jsx', 'tsx'] },
  { name: 'console.info', pattern: /console\.info\(/g, languages: ['js', 'ts', 'jsx', 'tsx'] },
  { name: 'console.warn', pattern: /console\.warn\(/g, languages: ['js', 'ts', 'jsx', 'tsx'] },
  { name: 'console.error', pattern: /console\.error\(/g, languages: ['js', 'ts', 'jsx', 'tsx'] },
  { name: 'console.trace', pattern: /console\.trace\(/g, languages: ['js', 'ts', 'jsx', 'tsx'] },
  { name: 'debugger', pattern: /debugger;/g, languages: ['js', 'ts', 'jsx', 'tsx'] },
  { name: 'alert', pattern: /\balert\(/g, languages: ['js', 'jsx'] },
  
  // Python
  { name: 'print()', pattern: /print\([^)]*\)/g, languages: ['py'] },
  { name: 'pprint()', pattern: /pprint\([^)]*\)/g, languages: ['py'] },
  { name: 'logger.debug', pattern: /logger\.debug\(/g, languages: ['py'] },
  { name: 'logger.info', pattern: /logger\.info\(/g, languages: ['py'] },
  { name: 'import pdb', pattern: /^import pdb$/gm, languages: ['py'] },
  { name: 'pdb.set_trace', pattern: /pdb\.set_trace\(\)/g, languages: ['py'] },
  { name: 'breakpoint()', pattern: /breakpoint\(\)/g, languages: ['py'] },
  
  // Ruby
  { name: 'puts', pattern: /\bputs\b[^}]*$/gm, languages: ['rb'] },
  { name: 'pp', pattern: /\bpp\s+/.source, languages: ['rb'] },
  { name: 'byebug', pattern: /byebug/g, languages: ['rb'] },
  
  // Go
  { name: 'fmt.Print', pattern: /fmt\.Print(f)?\(/g, languages: ['go'] },
  { name: 'log.Print', pattern: /log\.Print(f)?\(/g, languages: ['go'] },
  
  // Rust
  { name: 'println!', pattern: /println!\(/g, languages: ['rs'] },
  { name: 'eprintln!', pattern: /eprintln!\(/g, languages: ['rs'] },
  { name: 'dbg!', pattern: /dbg!\(/g, languages: ['rs'] },
  
  // Java
  { name: 'System.out.print', pattern: /System\.(out|err)\.(print|println)\(/g, languages: ['java'] },
  { name: 'Log.d', pattern: /Log\.[dvie]\(/g, languages: ['java'] },
  
  // PHP
  { name: 'var_dump', pattern: /var_dump\(/g, languages: ['php'] },
  { name: 'print_r', pattern: /print_r\(/g, languages: ['php'] },
  { name: 'dd()', pattern: /dd\(/g, languages: ['php'] },
  
  // General
  { name: 'TODO comment', pattern: /\/\/\s*TODO|\bTODO\b/gi, languages: ['all'], isComment: true },
  { name: 'FIXME comment', pattern: /\/\/\s*FIXME|\bFIXME\b/gi, languages: ['all'], isComment: true },
  { name: 'XXX comment', pattern: /\/\/\s*XXX|\bXXX\b/gi, languages: ['all'], isComment: true },
  { name: 'HACK comment', pattern: /\/\/\s*HACK|\bHACK\b/gi, languages: ['all'], isComment: true }
];

// Configuration
const CONFIG = {
  excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '.qwen', 'vendor', '__pycache__'],
  excludeFiles: ['.test.js', '.spec.js', '.test.ts', '.spec.ts', 'test-*.js', '*-test.js'],
  excludePatterns: []
};

// Parse arguments
const args = process.argv.slice(2);
let autoFix = false;
let dryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--auto-fix' || args[i] === '-f') {
    autoFix = true;
  } else if (args[i] === '--dry-run' || args[i] === '-n') {
    dryRun = true;
  } else if (args[i] === '--exclude' && args[i + 1]) {
    CONFIG.excludePatterns.push(args[++i]);
  }
}

// Get language from file
function getLanguage(file) {
  const ext = path.extname(file).toLowerCase();
  const langMap = {
    '.js': 'js', '.jsx': 'js', '.mjs': 'js', '.cjs': 'js',
    '.ts': 'ts', '.tsx': 'ts',
    '.py': 'py',
    '.rb': 'rb',
    '.go': 'go',
    '.rs': 'rs',
    '.java': 'java',
    '.php': 'php'
  };
  return langMap[ext] || null;
}

function shouldScan(filePath) {
  const fileName = path.basename(filePath);
  
  // Check exclude files
  for (const pattern of CONFIG.excludePatterns) {
    if (filePath.includes(pattern)) return false;
  }
  
  return true;
}

function findDebugStatements(content, language) {
  const findings = [];
  const lines = content.split('\n');
  
  for (const { name, pattern, languages, isComment } of DEBUG_PATTERNS) {
    // Check language support
    if (!languages.includes('all') && !languages.includes(language)) {
      continue;
    }
    
    const regex = new RegExp(pattern.source, pattern.flags || 'g');
    let match;
    let lineNumbers = [];
    
    // Find matches with line numbers
    for (let i = 0; i < lines.length; i++) {
      const lineRegex = new RegExp(pattern.source, pattern.flags || 'g');
      if (lineRegex.test(lines[i])) {
        lineNumbers.push(i + 1);
        lineRegex.lastIndex = 0;
      }
    }
    
    // Only count if not in comments (for TODO/FIXME)
    if (isComment) {
      const filteredLines = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const regex = new RegExp(pattern.source, pattern.flags || 'g');
        if (regex.test(line)) {
          // Check if it's actually a comment
          const trimmed = line.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            filteredLines.push(i + 1);
          }
        }
      }
      lineNumbers = filteredLines;
    }
    
    if (lineNumbers.length > 0) {
      findings.push({
        type: name,
        lines: lineNumbers,
        isComment
      });
    }
  }
  
  return findings;
}

function removeDebugStatements(content, language, findings) {
  let result = content;
  
  for (const finding of findings) {
    const lines = result.split('\n');
    const linesToRemove = new Set(finding.lines);
    
    if (finding.isComment) {
      // Remove comment lines
      const newLines = [];
      for (let i = 0; i < lines.length; i++) {
        if (!linesToRemove.has(i + 1)) {
          newLines.push(lines[i]);
        }
      }
      result = newLines.join('\n');
    } else {
      // Remove debug statements (line by line)
      const newLines = [];
      for (let i = 0; i < lines.length; i++) {
        const lineNum = i + 1;
        if (linesToRemove.has(lineNum)) {
          // Check if it's a standalone debug line or part of a larger statement
          const line = lines[i].trim();
          if (line.match(/^(console\.\w+\(|print\(|pprint\(|puts |fmt\.Print|println!|System\.out)/)) {
            continue; // Skip this line
          }
        }
        newLines.push(lines[i]);
      }
      result = newLines.join('\n');
    }
  }
  
  // Clean up empty lines
  result = result.replace(/\n\n\n/g, '\n\n');
  
  return result;
}

function scanFile(filePath, relativePath) {
  const findings = [];
  
  if (!shouldScan(filePath)) {
    return findings;
  }
  
  const language = getLanguage(relativePath);
  if (!language) {
    return findings;
  }
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return findings;
  }
  
  const debugFindings = findDebugStatements(content, language);
  
  if (debugFindings.length > 0) {
    findings.push({
      file: relativePath,
      language,
      findings: debugFindings
    });
  }
  
  return findings;
}

function scanDirectory(dir, relativePath = '') {
  const allFindings = [];
  
  let files;
  try {
    files = fs.readFileSync(dir);
  } catch (e) {
    return allFindings;
  }
  
  files = fs.readdirSync(dir);
  
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
    } else if (/\.(js|ts|jsx|tsx|mjs|cjs|py|rb|go|rs|java|php)$/.test(file)) {
      allFindings.push(...scanFile(filePath, fileRelativePath));
    }
  }
  
  return allFindings;
}

function printFindings(findings, autoFix, dryRun) {
  if (findings.length === 0) {
    console.log('\n✅ No debug statements found. Code is clean!\n');
    return;
  }
  
  console.log('\n⚠️  Debug Statements Found\n');
  console.log('='.repeat(60));
  
  let totalStatements = 0;
  
  for (const fileFinding of findings) {
    console.log(`\n📁 ${fileFinding.file} (${fileFinding.language})`);
    
    for (const finding of fileFinding.findings) {
      const icon = finding.isComment ? '📝' : '🔍';
      console.log(`   ${icon} ${finding.type}: ${finding.lines.join(', ')}`);
      totalStatements += finding.lines.length;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n❌ Total: ${totalStatements} debug statement(s) in ${findings.length} file(s)\n`);
  
  if (autoFix && !dryRun) {
    console.log('🛠️  Auto-fix applied!\n');
    process.exit(0);
  } else if (autoFix && dryRun) {
    console.log('🔍 Dry run - no changes made. Use without --dry-run to apply.\n');
    process.exit(1);
  } else {
    console.log('💡 Tips:');
    console.log('   - Remove debug statements before committing');
    console.log('   - Run with --auto-fix to remove automatically');
    console.log('   - Run with --dry-run to preview changes\n');
    process.exit(1);
  }
}

function main() {
  const cwd = process.cwd();
  const findings = scanDirectory(cwd);
  
  if (autoFix && !dryRun) {
    // Apply fixes
    for (const fileFinding of findings) {
      const filePath = path.join(cwd, fileFinding.file);
      let content = fs.readFileSync(filePath, 'utf8');
      content = removeDebugStatements(content, fileFinding.language, fileFinding.findings);
      fs.writeFileSync(filePath, content);
    }
  }
  
  printFindings(findings, autoFix, dryRun);
}

main();
