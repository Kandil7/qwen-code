#!/usr/bin/env node
/**
 * Security Check Hook - PreToolUse for bash commands
 * 
 * Analyzes bash commands for dangerous patterns before execution.
 * Returns exit code 0 (allow), 1 (warn), or 2 (block).
 * 
 * Usage: Hook receives command context via stdin as JSON.
 */

const readline = require('readline');

const DANGEROUS_PATTERNS = [
  // Destructive filesystem operations
  { pattern: /rm\s+(-rf?|--recursive)\s/i, severity: 'block', reason: 'Destructive rm -rf detected' },
  { pattern: /del\s+\/[fqs]\s/i, severity: 'block', reason: 'Destructive Windows del detected' },
  { pattern: /rmdir\s+\/s\s/i, severity: 'block', reason: 'Destructive rmdir /s detected' },
  
  // Privilege escalation
  { pattern: /\bsudo\b/, severity: 'warn', reason: 'sudo command - verify this is intentional' },
  { pattern: /runas\s/i, severity: 'warn', reason: 'Windows runas - privilege escalation' },
  
  // Network exfiltration risks
  { pattern: /curl\s+.*\|\s*(bash|sh|powershell)/i, severity: 'block', reason: 'Piping remote script to shell' },
  { pattern: /wget\s+.*\|\s*(bash|sh|powershell)/i, severity: 'block', reason: 'Piping remote script to shell' },
  { pattern: /nc\s+-[el]/i, severity: 'block', reason: 'Netcat listener - possible backdoor' },
  { pattern: /ncat\s+-[el]/i, severity: 'block', reason: 'Ncat listener - possible backdoor' },
  { pattern: /socat\s/i, severity: 'warn', reason: 'socat - verify purpose' },
  
  // Environment/secret exposure
  { pattern: /printenv|env\s/i, severity: 'warn', reason: 'Environment variable dump - may expose secrets' },
  { pattern: /\$PATH\s*=/, severity: 'warn', reason: 'PATH modification - verify this is safe' },
  { pattern: /chmod\s+[0-7]*7[0-7][0-7]\b/, severity: 'warn', reason: 'Making file world-executable' },
  { pattern: /chmod\s+777/i, severity: 'block', reason: 'chmod 777 - world-readable/writable/executable' },
  
  // Process manipulation
  { pattern: /kill\s+-9\s/i, severity: 'warn', reason: 'SIGKILL - forceful process termination' },
  { pattern: /taskkill\s+\/F/i, severity: 'warn', reason: 'Forceful Windows process termination' },
  
  // System modification
  { pattern: /reg\s+(add|delete)\s/i, severity: 'warn', reason: 'Windows registry modification' },
  { pattern: /sc\s+config\s/i, severity: 'warn', reason: 'Windows service configuration change' },
  { pattern: /schtasks\s+\/create/i, severity: 'warn', reason: 'Windows scheduled task creation' },
  
  // Crypto miners (common attack pattern)
  { pattern: /xmrig|xmr-stak|coinhive/i, severity: 'block', reason: 'Possible cryptocurrency miner' },
];

const SAFE_COMMANDS = ['ls', 'dir', 'cd', 'pwd', 'echo', 'cat', 'type', 'head', 'tail', 'grep', 'find', 'which', 'where', 'git status', 'git log', 'git diff', 'npm run', 'python -m', 'pytest', 'node --version', 'python --version'];

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
    // If input is not valid JSON, allow command through
    process.exit(0);
    return;
  }
  
  const command = context.toolInput?.command || context.command || input;
  
  if (!command || typeof command !== 'string') {
    process.exit(0);
    return;
  }
  
  // Check for safe commands
  const trimmedCommand = command.trim().toLowerCase();
  for (const safe of SAFE_COMMANDS) {
    if (trimmedCommand.startsWith(safe.toLowerCase())) {
      process.exit(0);
      return;
    }
  }
  
  // Check dangerous patterns
  let highestSeverity = 'allow';
  let reasons = [];
  
  for (const rule of DANGEROUS_PATTERNS) {
    if (rule.pattern.test(command)) {
      if (rule.severity === 'block') {
        highestSeverity = 'block';
        reasons.push(rule.reason);
      } else if (rule.severity === 'warn' && highestSeverity !== 'block') {
        highestSeverity = 'warn';
        reasons.push(rule.reason);
      }
    }
  }
  
  if (highestSeverity === 'block') {
    const output = {
      decision: 'block',
      hookSpecificOutput: {
        permissionDecision: 'deny',
        permissionDecisionReason: reasons.join('; ')
      }
    };
    console.error(`[SECURITY BLOCK] ${reasons.join('; ')}`);
    console.log(JSON.stringify(output));
    process.exit(2);
  } else if (highestSeverity === 'warn') {
    const output = {
      decision: 'warn',
      hookSpecificOutput: {
        additionalContext: `[SECURITY WARNING] ${reasons.join('; ')} - Please verify this is intentional.`
      }
    };
    console.error(`[SECURITY WARN] ${reasons.join('; ')}`);
    console.log(JSON.stringify(output));
    process.exit(0);
  } else {
    process.exit(0);
  }
}

main().catch(() => process.exit(0));
