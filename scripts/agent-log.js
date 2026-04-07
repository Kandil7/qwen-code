#!/usr/bin/env node
/**
 * Agent Log Hook - SubagentStart
 * 
 * Logs which agent is being invoked and for what purpose.
 * Provides audit trail for multi-agent workflows.
 * 
 * Usage: Hook receives agent context via stdin as JSON.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(process.cwd(), '.qwen', 'agent-audit.log');

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
  
  const agentName = context.agentName || context.toolInput?.subagent_type || 'unknown';
  const description = context.toolInput?.description || context.toolInput?.prompt?.slice(0, 100) || 'no description';
  const timestamp = new Date().toISOString();
  
  const logEntry = `[${timestamp}] Agent: ${agentName} | Task: ${description}\n`;
  
  // Append to audit log
  try {
    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
  } catch {
    // Silently fail if log file cannot be written
  }
  
  const output = {
    decision: 'allow',
    hookSpecificOutput: {
      additionalContext: `[AGENT LOG] Invoking: ${agentName} | ${description.slice(0, 80)}...`
    }
  };
  
  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch(() => process.exit(0));
