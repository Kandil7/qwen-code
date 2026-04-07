#!/usr/bin/env node
/**
 * Harness Engineering - Code Health Pre-Check
 * 
 * Based on 2026 Agentic Engineering best practices:
 * - "Pull Risk Forward": Assess code health BEFORE AI work
 * - Low-quality code increases AI failure rates and token burn
 * - Maintain baseline Code Health >= 9.5 before assigning AI tasks
 * 
 * This hook runs before code generation to assess AI-readiness.
 * Returns warning if code health is below threshold.
 * 
 * Usage: Hook receives context via stdin as JSON.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HEALTH_THRESHOLDS = {
  excellent: 9.5,  // AI-ready
  good: 8.0,       // AI-capable with caution
  fair: 6.0,       // Refactor before AI
  poor: 4.0        // High risk - do not use AI
};

function analyzeFileHealth(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
  
  const lines = content.split('\n');
  const lineCount = lines.length;
  
  // Calculate complexity metrics
  let maxNesting = 0;
  let currentNesting = 0;
  let functionCount = 0;
  let largeFunctions = 0;
  let comments = 0;
  let blankLines = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (!trimmed) { blankLines++; continue; }
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) { comments++; continue; }
    
    // Count nesting
    const opens = (line.match(/{/g) || []).length;
    const closes = (line.match(/}/g) || []).length;
    currentNesting += opens - closes;
    maxNesting = Math.max(maxNesting, currentNesting);
    
    // Count functions
    if (/^(function|def |async def |class |const \w+ = \()/m.test(trimmed)) {
      functionCount++;
    }
  }
  
  // Score calculation (simplified code health score)
  let score = 10.0;
  
  // Penalize for large files
  if (lineCount > 800) score -= 2.0;
  else if (lineCount > 500) score -= 1.0;
  else if (lineCount > 300) score -= 0.5;
  
  // Penalize for deep nesting
  if (maxNesting > 6) score -= 2.0;
  else if (maxNesting > 4) score -= 1.0;
  
  // Penalize for low comment ratio
  const commentRatio = comments / Math.max(lineCount, 1);
  if (commentRatio < 0.05) score -= 0.5;
  
  // Penalize for low blank line ratio (indicates dense code)
  const blankRatio = blankLines / Math.max(lineCount, 1);
  if (blankRatio < 0.1) score -= 0.5;
  
  return {
    file: filePath,
    lineCount,
    maxNesting,
    functionCount,
    commentRatio: (commentRatio * 100).toFixed(1),
    score: Math.max(0, Math.min(10, score))
  };
}

function scanDirectory(dirPath, extensions = ['.py', '.js', '.ts']) {
  const results = [];
  
  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__pycache__') {
          walk(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          const health = analyzeFileHealth(fullPath);
          if (health) results.push(health);
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }
  
  walk(dirPath);
  return results;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let input = '';
  
  for await (const line of rl) {
    input += line;
  }
  
  // Scan current project
  const scanDir = process.cwd();
  const results = scanDirectory(scanDir);
  
  if (results.length === 0) {
    process.exit(0);
    return;
  }
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const unhealthyFiles = results.filter(r => r.score < HEALTH_THRESHOLDS.fair);
  const criticalFiles = results.filter(r => r.score < HEALTH_THRESHOLDS.poor);
  
  let message = '';
  let severity = 'allow';
  
  if (avgScore >= HEALTH_THRESHOLDS.excellent) {
    message = `[CODE HEALTH] Excellent (${avgScore.toFixed(1)}/10). AI-ready codebase.`;
  } else if (avgScore >= HEALTH_THRESHOLDS.good) {
    message = `[CODE HEALTH] Good (${avgScore.toFixed(1)}/10). AI-capable with caution.`;
    severity = 'warn';
  } else if (avgScore >= HEALTH_THRESHOLDS.fair) {
    message = `[CODE HEALTH] Fair (${avgScore.toFixed(1)}/10). Consider refactoring before AI work.`;
    severity = 'warn';
  } else {
    message = `[CODE HEALTH] Poor (${avgScore.toFixed(1)}/10). HIGH RISK - Refactor first!`;
    severity = 'block';
  }
  
  if (unhealthyFiles.length > 0) {
    message += `\nUnhealthy files (${unhealthyFiles.length}):`;
    unhealthyFiles.slice(0, 5).forEach(f => {
      message += `\n  - ${f.file} (score: ${f.score.toFixed(1)}, lines: ${f.lineCount}, nesting: ${f.maxNesting})`;
    });
  }
  
  if (criticalFiles.length > 0) {
    message += `\n\n⚠ Critical files needing immediate refactoring (${criticalFiles.length})`;
  }
  
  const output = {
    decision: severity === 'block' ? 'block' : 'allow',
    hookSpecificOutput: {
      additionalContext: message
    }
  };
  
  console.log(JSON.stringify(output));
  
  if (severity === 'block') {
    process.exit(2);
  } else if (severity === 'warn') {
    console.error(message);
  }
  
  process.exit(0);
}

main().catch(() => process.exit(0));
