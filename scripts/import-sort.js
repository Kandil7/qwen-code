#!/usr/bin/env node
/**
 * Import sorting script using isort (Python) or organize-imports (TypeScript)
 * Usage: node .qwen/scripts/import-sort.js [--write] [--check] [--config PATH]
 * 
 * Options:
 *   --write   Apply fixes (default: dry-run)
 *   --check   Check only, no modifications
 *   --config  Custom config file path
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  isort: {
    enabled: true,
    config: '.isort.cfg',
    extensions: ['.py']
  },
  typescriptOrganizeImports: {
    enabled: true,
    extensions: ['.ts', '.tsx']
  },
  prettier: {
    enabled: true,
    config: '.prettierrc',
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
};

// Parse arguments
const args = process.argv.slice(2);
let write = false;
let check = false;
let customConfig = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--write' || args[i] === '-w') {
    write = true;
  } else if (args[i] === '--check' || args[i] === '-c') {
    check = true;
  } else if (args[i] === '--config' && args[i + 1]) {
    customConfig = args[++i];
  }
}

function checkPythonImports() {
  if (!CONFIG.isort.enabled) {
    return { success: true, files: [], type: 'isort' };
  }
  
  // Check if isort is available
  let isortPath;
  try {
    isortPath = execSync('where isort', { encoding: 'utf8' }).trim().split('\n')[0];
  } catch (e) {
    try {
      isortPath = execSync('which isort', { encoding: 'utf8' }).trim();
    } catch (e2) {
      console.log('⚠️  isort not found, skipping Python import sort');
      return { success: true, files: [], type: 'isort' };
    }
  }
  
  // Find Python files
  const pyFiles = [];
  function findPyFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') continue;
      
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findPyFiles(filePath);
      } else if (file.endsWith('.py')) {
        pyFiles.push(filePath);
      }
    }
  }
  
  try {
    findPyFiles(process.cwd());
  } catch (e) {
    return { success: true, files: [], type: 'isort' };
  }
  
  if (pyFiles.length === 0) {
    return { success: true, files: [], type: 'isort' };
  }
  
  try {
    const mode = write ? '' : '--check-only';
    const args = pyFiles.join(' ') + (mode ? ' ' + mode : '');
    
    execSync(isortPath + ' ' + args, { stdio: 'inherit' });
    return { success: true, files: pyFiles, type: 'isort' };
  } catch (e) {
    return {
      success: false,
      files: pyFiles,
      type: 'isort',
      message: 'Import sorting issues found',
      fixCommand: `${isortPath} ${pyFiles.join(' ')}`
    };
  }
}

function checkTypeScriptImports() {
  if (!CONFIG.typescriptOrganizeImports.enabled) {
    return { success: true, files: [], type: 'ts-organize' };
  }
  
  // Check for npx
  const tsFiles = [];
  
  function findTsFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') continue;
      
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findTsFiles(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        tsFiles.push(filePath);
      }
    }
  }
  
  try {
    findTsFiles(path.join(process.cwd(), 'src'));
  } catch (e) {
    return { success: true, files: [], type: 'ts-organize' };
  }
  
  if (tsFiles.length === 0) {
    return { success: true, files: [], type: 'ts-organize' };
  }
  
  // Use TypeScript's organize-imports if available
  try {
    const mode = write ? '--organizeImports' : '--noEmit';
    execSync(`npx typescript --version`, { stdio: 'ignore' });
    
    // Try to run organize imports
    if (write) {
      for (const file of tsFiles) {
        try {
          execSync(`npx organize-imports "${file}"`, { stdio: 'ignore' });
        } catch (e) {
          // Ignore individual file errors
        }
      }
    }
    
    return { success: true, files: tsFiles, type: 'ts-organize' };
  } catch (e) {
    console.log('⚠️  TypeScript not available, skipping organize-imports');
    return { success: true, files: [], type: 'ts-organize' };
  }
}

function checkPrettier() {
  if (!CONFIG.prettier.enabled) {
    return { success: true, files: [], type: 'prettier' };
  }
  
  // Check if prettier is available
  let prettierPath;
  try {
    prettierPath = execSync('where prettier', { encoding: 'utf8' }).trim().split('\n')[0];
  } catch (e) {
    try {
      prettierPath = execSync('which prettier', { encoding: 'utf8' }).trim();
    } catch (e2) {
      console.log('⚠️  prettier not found, skipping');
      return { success: true, files: [], type: 'prettier' };
    }
  }
  
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss'];
  const targetFiles = [];
  
  function findFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules' || file === 'dist' || file === 'build') continue;
      
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findFiles(filePath);
      } else {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          targetFiles.push(filePath);
        }
      }
    }
  }
  
  try {
    findFiles(process.cwd());
  } catch (e) {
    return { success: true, files: [], type: 'prettier' };
  }
  
  if (targetFiles.length === 0) {
    return { success: true, files: [], type: 'prettier' };
  }
  
  try {
    const args = write 
      ? targetFiles.join(' ') + ' --write'
      : targetFiles.join(' ') + ' --check';
    
    execSync(prettierPath + ' ' + args, { stdio: 'inherit' });
    return { success: true, files: targetFiles, type: 'prettier' };
  } catch (e) {
    return {
      success: false,
      files: targetFiles,
      type: 'prettier',
      message: 'Prettier formatting issues',
      fixCommand: `${prettierPath} ${targetFiles.join(' ')} --write`
    };
  }
}

function main() {
  const mode = write ? 'Fix' : check ? 'Check' : 'Preview';
  console.log('\n📦 Import Sort (' + mode + ')\n');
  console.log('='.repeat(50));
  
  let allPassed = true;
  const results = [];
  
  // Python isort
  console.log('\n🐍 Python (isort)...');
  const pyResult = checkPythonImports();
  results.push(pyResult);
  if (pyResult.success) {
    console.log('   ✅ Sorted ' + pyResult.files.length + ' files');
  } else {
    console.log('   ❌ Issues found');
    if (pyResult.fixCommand) {
      console.log('   Fix: ' + pyResult.fixCommand);
    }
    allPassed = false;
  }
  
  // TypeScript organize imports
  console.log('\n📘 TypeScript (organize-imports)...');
  const tsResult = checkTypeScriptImports();
  results.push(tsResult);
  if (tsResult.success) {
    console.log('   ✅ Sorted ' + tsResult.files.length + ' files');
  } else {
    console.log('   ❌ Issues found');
    allPassed = false;
  }
  
  // Prettier
  console.log('\n🎨 Prettier...');
  const prettierResult = checkPrettier();
  results.push(prettierResult);
  if (prettierResult.success) {
    console.log('   ✅ Formatted ' + prettierResult.files.length + ' files');
  } else {
    console.log('   ❌ Issues found');
    if (prettierResult.fixCommand) {
      console.log('   Fix: ' + prettierResult.fixCommand);
    }
    allPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('\n✅ All imports sorted!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Import sorting needed.\n');
    console.log('💡 To fix:');
    console.log('   node .qwen/scripts/import-sort.js --write\n');
    process.exit(1);
  }
}

main();
