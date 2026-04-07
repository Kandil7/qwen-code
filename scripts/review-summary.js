#!/usr/bin/env node
/**
 * Enhanced review summary generator with PR description, reviewer suggestions, and breaking changes
 * Usage: node .qwen/scripts/review-summary.js [git-ref] [--pr] [--markdown]
 * 
 * Options:
 *   --pr         Generate PR description template
 *   --markdown   Output in Markdown format
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
const gitRef = args.find(a => !a.startsWith('--')) || 'HEAD';
const generatePr = args.includes('--pr') || args.includes('-p');
const markdown = args.includes('--markdown') || args.includes('-m');

function getChangedFiles(ref) {
  try {
    const output = execSync(`git diff --name-only ${ref}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output.trim().split('\n').filter(f => f.length > 0);
  } catch (e) {
    console.error('Error: Not a git repository or no changes');
    process.exit(1);
  }
}

function getFileStats(file) {
  try {
    const output = execSync(`git diff --numstat HEAD ${file}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const [added, deleted] = output.trim().split('\t');
    return {
      added: parseInt(added) || 0,
      deleted: parseInt(deleted) || 0
    };
  } catch (e) {
    return { added: 0, deleted: 0 };
  }
}

function getFileContent(file, ref) {
  try {
    const output = execSync(`git show ${ref}:${file}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output;
  } catch (e) {
    return null;
  }
}

function analyzeFile(file) {
  const ext = path.extname(file).toLowerCase();
  const analysis = {
    isTest: file.includes('.test.') || file.includes('.spec.') || file.includes('test/') || file.includes('__tests__'),
    isConfig: /\.(json|yaml|yml|toml|config)$/.test(ext),
    isDocumentation: /\.(md|mdx|rst)$/.test(ext),
    isSource: /\.(js|ts|jsx|tsx|py|go|rs|java|c|cpp|h|hpp)$/.test(ext),
    isStyles: /\.(css|scss|sass|less)$/.test(ext),
    isBuild: file.includes('Dockerfile') || file.includes('build/') || file.includes('dist/')
  };
  
  analysis.category = analysis.isTest ? 'test' :
    analysis.isConfig ? 'config' :
    analysis.isDocumentation ? 'docs' :
    analysis.isStyles ? 'styles' :
    analysis.isBuild ? 'build' :
    analysis.isSource ? 'source' : 'other';
  
  return analysis;
}

function detectBreakingChanges(files) {
  const breakingPatterns = [
    { pattern: /remove.*export|delete.*export/i, type: 'Removed export' },
    { pattern: /change.*type.*signature|alter.*interface/i, type: 'Type change' },
    { pattern: /drop.*table|drop.*column/i, type: 'Database migration' },
    { pattern: /remove.*parameter|change.*parameter/i, type: 'Parameter change' }
  ];
  
  const breaking = [];
  
  for (const file of files) {
    if (/\.(ts|js|py|go)$/.test(file)) {
      const content = getFileContent(file, gitRef + '^');
      const newContent = getFileContent(file, gitRef);
      
      if (content && newContent) {
        // Simple heuristic: check for deleted lines with function definitions
        const diff = execSync(`git diff ${gitRef}^ ${gitRef} -- ${file}`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore']
        });
        
        if (diff.includes('-export') || diff.includes('-function') || diff.includes('-class')) {
          breaking.push({ file, type: 'Potential breaking change detected' });
        }
      }
    }
  }
  
  return breaking;
}

function suggestReviewers(files) {
  const reviewers = new Set();
  const fileOwners = {
    'api': ['@backend-team'],
    'services': ['@backend-team'],
    'components': ['@frontend-team'],
    'utils': ['@backend-team'],
    'hooks': ['@frontend-team'],
    'db': ['@database-team'],
    'migrations': ['@database-team'],
    'config': ['@devops-team'],
    'docker': ['@devops-team'],
    'k8s': ['@devops-team'],
    'test': ['@qa-team'],
    '__tests__': ['@qa-team'],
    'spec': ['@qa-team']
  };
  
  for (const file of files) {
    const lowerFile = file.toLowerCase();
    for (const [keyword, owner] of Object.entries(fileOwners)) {
      if (lowerFile.includes(keyword)) {
        reviewers.add(owner);
      }
    }
  }
  
  return Array.from(reviewers);
}

function generateSummary(files) {
  const stats = {
    total: files.length,
    source: 0,
    test: 0,
    docs: 0,
    config: 0,
    styles: 0,
    build: 0,
    other: 0,
    totalAdded: 0,
    totalDeleted: 0,
    files: []
  };
  
  for (const file of files) {
    const fileStats = getFileStats(file);
    const analysis = analyzeFile(file);
    
    stats.totalAdded += fileStats.added;
    stats.totalDeleted += fileStats.deleted;
    
    stats[analysis.category]++;
    
    stats.files.push({
      path: file,
      ...fileStats,
      category: analysis.category
    });
  }
  
  // Detect breaking changes
  stats.breaking = detectBreakingChanges(files);
  stats.suggestedReviewers = suggestReviewers(files);
  
  return stats;
}

function printSummary(stats) {
  console.log('\n📊 Code Review Summary\n');
  console.log('='.repeat(60));
  
  console.log(`\n📁 Files Changed: ${stats.total}`);
  console.log(`   +${stats.totalAdded} lines added`);
  console.log(`   -${stats.totalDeleted} lines deleted`);
  console.log(`   Net: +${stats.totalAdded - stats.totalDeleted} lines`);
  
  console.log('\n📂 By Category:');
  console.log(`   Source:     ${stats.source} files`);
  console.log(`   Tests:      ${stats.test} files`);
  console.log(`   Docs:       ${stats.docs} files`);
  console.log(`   Config:     ${stats.config} files`);
  console.log(`   Styles:     ${stats.styles} files`);
  console.log(`   Build:      ${stats.build} files`);
  console.log(`   Other:      ${stats.other} files`);
  
  console.log('\n' + '='.repeat(60));
  
  // Group by category
  const byCategory = stats.files.reduce((acc, f) => {
    acc[f.category] = acc[f.category] || [];
    acc[f.category].push(f);
    return acc;
  }, {});
  
  if (byCategory.source?.length > 0) {
    console.log('\n📝 Source Files:');
    for (const f of byCategory.source) {
      console.log(`   ${f.path} (+${f.added}/-${f.deleted})`);
    }
  }
  
  if (byCategory.test?.length > 0) {
    console.log('\n🧪 Test Files:');
    for (const f of byCategory.test) {
      console.log(`   ${f.path} (+${f.added}/-${f.deleted})`);
    }
  }
  
  if (byCategory.docs?.length > 0) {
    console.log('\n📚 Documentation:');
    for (const f of byCategory.docs) {
      console.log(`   ${f.path} (+${f.added}/-${f.deleted})`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Breaking changes
  if (stats.breaking.length > 0) {
    console.log('\n⚠️  Potential Breaking Changes:');
    for (const b of stats.breaking) {
      console.log(`   - ${b.file}: ${b.type}`);
    }
  }
  
  // Reviewer suggestions
  if (stats.suggestedReviewers.length > 0) {
    console.log('\n👀 Suggested Reviewers:');
    for (const r of stats.suggestedReviewers) {
      console.log(`   ${r}`);
    }
  }
  
  // Review checklist
  console.log('\n✅ Review Checklist:\n');
  console.log('   [ ] All new code has tests');
  console.log('   [ ] No debug statements (console.log, debugger)');
  console.log('   [ ] No hardcoded secrets');
  console.log('   [ ] Error handling in place');
  console.log('   [ ] Documentation updated');
  console.log('   [ ] Commit message follows convention');
  
  console.log('\n💎 Run these checks:\n');
  console.log('   node .qwen/scripts/find-debug-statements.js');
  console.log('   node .qwen/scripts/security-scan.js');
  console.log('   node .qwen/scripts/verify-coverage.js\n');
}

function generatePrDescription(stats) {
  const sections = [];
  
  // Summary
  sections.push('## Summary\n');
  sections.push(`Changed ${stats.total} files (+${stats.totalAdded}/-${stats.totalDeleted} lines)\n`);
  
  // Type of change
  let changeType = 'Bug fix';
  if (stats.docs > stats.source * 0.5) changeType = 'Documentation';
  else if (stats.config > stats.source) changeType = 'Configuration';
  else if (stats.source > 0) changeType = 'Feature';
  
  sections.push(`**Type:** ${changeType}\n`);
  
  // Description
  sections.push('## Description\n');
  sections.push('[Describe your changes here]\n');
  
  // Changes by category
  sections.push('## Changes\n');
  if (stats.source > 0) sections.push(`- Source code: ${stats.source} files`);
  if (stats.test > 0) sections.push(`- Tests: ${stats.test} files`);
  if (stats.docs > 0) sections.push(`- Documentation: ${stats.docs} files`);
  if (stats.config > 0) sections.push(`- Configuration: ${stats.config} files\n`);
  
  // Breaking changes
  if (stats.breaking.length > 0) {
    sections.push('## Breaking Changes\n');
    sections.push('⚠️ This PR contains potential breaking changes:\n');
    for (const b of stats.breaking) {
      sections.push(`- ${b.file}: ${b.type}`);
    }
    sections.push('');
  }
  
  // Testing
  sections.push('## Testing\n');
  sections.push('- [ ] Unit tests added/updated');
  sections.push('- [ ] Integration tests passing');
  sections.push('- [ ] Manual testing performed\n');
  
  // Checklist
  sections.push('## Checklist\n');
  sections.push('- [ ] Code follows project conventions');
  sections.push('- [ ] No debug statements');
  sections.push('- [ ] No hardcoded secrets');
  sections.push('- [ ] Documentation updated');
  sections.push('- [ ] Tests passing\n');
  
  // Reviewers
  if (stats.suggestedReviewers.length > 0) {
    sections.push('## Reviewers\n');
    sections.push(stats.suggestedReviewers.join(', '));
  }
  
  return sections.join('\n');
}

function printMarkdown(stats) {
  const sections = [];
  
  sections.push('# Code Review Summary\n');
  sections.push(`**Date:** ${new Date().toLocaleDateString()}`);
  sections.push(`**Branch:** ${gitRef}\n`);
  
  sections.push('## Overview\n');
  sections.push(`| Metric | Value |`);
  sections.push(`|--------|-------|`);
  sections.push(`| Files Changed | ${stats.total} |`);
  sections.push(`| Lines Added | +${stats.totalAdded} |`);
  sections.push(`| Lines Deleted | -${stats.totalDeleted} |`);
  sections.push(`| Net Change | ${stats.totalAdded - stats.totalDeleted} |\n`);
  
  sections.push('## Files by Category\n');
  sections.push(`| Category | Files |`);
  sections.push(`|---------|-------|`);
  sections.push(`| Source | ${stats.source} |`);
  sections.push(`| Tests | ${stats.test} |`);
  sections.push(`| Docs | ${stats.docs} |`);
  sections.push(`| Config | ${stats.config} |\n`);
  
  sections.push('## Changed Files\n');
  for (const f of stats.files) {
    sections.push(`- ${f.path} (+${f.added}/-${f.deleted})`);
  }
  
  return sections.join('\n');
}

function main() {
  const changedFiles = getChangedFiles(gitRef);
  
  if (changedFiles.length === 0) {
    console.log('\n✅ No changed files found.\n');
    process.exit(0);
  }
  
  const stats = generateSummary(changedFiles);
  
  if (generatePr) {
    console.log(generatePrDescription(stats));
  } else if (markdown) {
    console.log(printMarkdown(stats));
  } else {
    printSummary(stats);
  }
}

main();
