#!/usr/bin/env node
/**
 * Error Analyzer Hook - PostToolUseFailure
 * 
 * Analyzes tool failures and provides structured context for the AI.
 * Helps the AI understand what went wrong and how to fix it.
 * 
 * Usage: Hook receives failure context via stdin as JSON.
 */

const readline = require('readline');

const ERROR_PATTERNS = [
  {
    pattern: /command not found|ENOENT|no such file/i,
    suggestion: 'The command or file does not exist. Check the path and ensure the tool is installed.',
    category: 'missing_dependency'
  },
  {
    pattern: /permission denied|EACCES/i,
    suggestion: 'Permission denied. Check file permissions or try running with appropriate privileges.',
    category: 'permission_error'
  },
  {
    pattern: /timeout|ETIMEDOUT|timed out/i,
    suggestion: 'Operation timed out. Consider increasing timeout or checking network connectivity.',
    category: 'timeout'
  },
  {
    pattern: /connection refused|ECONNREFUSED|network/i,
    suggestion: 'Network connection failed. Check if the service is running and accessible.',
    category: 'network_error'
  },
  {
    pattern: /syntax error|parse error|invalid/i,
    suggestion: 'Syntax or parsing error. Review the command syntax and fix any issues.',
    category: 'syntax_error'
  },
  {
    pattern: /module not found|import error|cannot find module/i,
    suggestion: 'Missing module/package. Install it with pip install / npm install first.',
    category: 'missing_module'
  },
  {
    pattern: /port.*in use|EADDRINUSE/i,
    suggestion: 'Port already in use. Choose a different port or stop the existing process.',
    category: 'port_conflict'
  },
  {
    pattern: /out of memory|ENOMEM|heap/i,
    suggestion: 'Out of memory. Reduce resource usage or increase available memory.',
    category: 'memory_error'
  },
  {
    pattern: /exit code 1|exited with code/i,
    suggestion: 'Command exited with error. Review the error output for specifics.',
    category: 'command_failure'
  },
];

function categorizeError(errorOutput) {
  for (const rule of ERROR_PATTERNS) {
    if (rule.pattern.test(errorOutput)) {
      return rule;
    }
  }
  return {
    suggestion: 'Review the error output and fix the issue.',
    category: 'unknown'
  };
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let input = '';
  
  for await (const line of rl) {
    input += line;
  }
  
  let context;
  try {
    context = JSON.parse(input);
  } catch (e) {
    process.exit(0);
    return;
  }
  
  const errorOutput = context.toolOutput?.error || context.error || context.toolOutput?.stderr || '';
  
  if (!errorOutput || typeof errorOutput !== 'string') {
    process.exit(0);
    return;
  }
  
  const analysis = categorizeError(errorOutput);
  
  const output = {
    decision: 'allow',
    hookSpecificOutput: {
      additionalContext: `[ERROR ANALYSIS] Category: ${analysis.category}\nSuggestion: ${analysis.suggestion}\nOriginal error: ${errorOutput.slice(0, 300)}`
    }
  };
  
  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch(() => process.exit(0));
