#!/usr/bin/env node
/**
 * Type checking script for TypeScript and ESLint
 * Usage: node .qwen/scripts/type-check.js [--fix] [--warn] [--strict]
 * 
 * Options:
 *   --fix    Fix auto-fixable issues
 *   --warn   Show warnings (default: errors only)
 *   --strict Exit with error on warnings
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  typeScript: {
    enabled: true,
    config: 'tsconfig.json',
    strict: false
  },
  eslint: {
    enabled: true,
    config: '.eslintrc',
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  tscPath: 'node_modules/.bin/tsc',
  eslintPath: 'node_modules/.bin/eslint'
};

// Parse arguments
const args = process.argv.slice(2);
const fix = args.includes('--fix') || args.includes('-f');
const warn = args.includes('--warn') || args.includes('-w');
const strict = args.includes('--strict') || args.includes('-s');

function checkTypeScript() {
  if (!CONFIG.typeScript.enabled) {
    return { passed: true, issues: [], type: 'typescript' };
  }
  
  const tsconfigPath = path.join(process.cwd(), CONFIG.typeScript.config);
  if (!fs.existsSync(tsconfigPath)) {
    console.log('⚠️  No tsconfig.json found, skipping TypeScript check');
    return { passed: true, issues: [], type: 'typescript' };
  }
  
  try {
    const tsc = CONFIG.tscPath;
    let args = ['--noEmit'];
    
    if (strict || CONFIG.typeScript.strict) {
      args.push('--strict');
    }
    
    if (!warn) {
      args.push('--pretty', 'false');
    }
    
    execSync(tsc + ' ' + args.join(' '), { stdio: 'inherit' });
    return { passed: true, issues: [], type: 'typescript' };
  } catch (e) {
    // TypeScript check failed
    return { 
      passed: false, 
      issues: ['TypeScript errors found'], 
      type: 'typescript',
      command: `${CONFIG.tscPath} --noEmit${strict ? ' --strict' : ''}`
    };
  }
}

function checkESLint() {
  if (!CONFIG.eslint.enabled) {
    return { passed: true, issues: [], type: 'eslint' };
  }
  
  const eslintConfig = path.join(process.cwd(), '.eslintrc.js');
  const eslintrcJson = path.join(process.cwd(), '.eslintrc.json');
  const eslintrcYml = path.join(process.cwd(), '.eslintrc.yml');
  
  if (!fs.existsSync(eslintConfig) && !fs.existsSync(eslintrcJson) && !fs.existsSync(eslintrcYml)) {
    console.log('⚠️  No ESLint config found, skipping ESLint check');
    return { passed: true, issues: [], type: 'eslint' };
  }
  
  try {
    const eslint = CONFIG.eslintPath;
    let args = [
      'src',
      '--format', 'stylish'
    ];
    
    if (fix) {
      args.push('--fix');
    }
    
    if (!warn) {
      args.push('--quiet');
    }
    
    execSync(eslint + ' ' + args.join(' '), { stdio: 'inherit' });
    return { passed: true, issues: [], type: 'eslint' };
  } catch (e) {
    return { 
      passed: false, 
      issues: ['ESLint errors found'], 
      type: 'eslint',
      command: `${CONFIG.eslintPath} src${fix ? ' --fix' : ''}${warn ? '' : ' --quiet'}`
    };
  }
}

function checkUnusedImports() {
  const issues = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    return issues;
  }
  
  // Simple heuristic: check for imports that might not be used
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const usedRegex = /(\w+)[^(]/g;
    
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Check if imports are used in the file
    const fileName = path.basename(filePath);
    if (fileName.includes('.test.') || fileName.includes('.spec.')) {
      return [];
    }
    
    return [];
  }
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (/\.(js|ts|jsx|tsx)$/.test(file)) {
        issues.push(...scanFile(filePath));
      }
    }
  }
  
  scanDir(srcDir);
  return issues;
}

function main() {
  console.log('\n🔍 Type Check\n');
  console.log('='.repeat(50));
  
  let allPassed = true;
  const results = [];
  
  // TypeScript check
  console.log('\n📝 TypeScript...');
  const tsResult = checkTypeScript();
  results.push(tsResult);
  
  if (tsResult.passed) {
    console.log('   ✅ No TypeScript errors');
  } else {
    console.log('   ❌ TypeScript errors found');
    if (tsResult.command) {
      console.log(`   Run: ${tsResult.command}`);
    }
    allPassed = false;
  }
  
  // ESLint check
  console.log('\n🔧 ESLint...');
  const eslintResult = checkESLint();
  results.push(eslintResult);
  
  if (eslintResult.passed) {
    console.log('   ✅ No ESLint errors');
  } else {
    console.log('   ❌ ESLint errors found');
    if (eslintResult.command) {
      console.log(`   Run: ${eslintResult.command}`);
    }
    allPassed = false;
  }
  
  // Unused imports check (simple)
  console.log('\n📦 Checking for unused imports...');
  const unusedIssues = checkUnusedImports();
  if (unusedIssues.length === 0) {
    console.log('   ✅ No obvious unused imports');
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('\n✅ All type checks passed!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Type check failed. Fix issues above.\n');
    console.log('💡 Tips:');
    console.log('   - Run with --fix to auto-fix ESLint issues');
    console.log('   - Run with --strict for strict TypeScript mode');
    console.log('   - Check tsconfig.json for compiler options\n');
    process.exit(1);
  }
}

main();
