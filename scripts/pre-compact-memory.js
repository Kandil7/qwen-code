#!/usr/bin/env node
/**
 * Pre-Compact Memory Hook
 * 
 * Saves key decisions and facts to memory before context compression.
 * Prevents loss of important information during conversation compaction.
 * 
 * Usage: Hook receives session context via stdin as JSON.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(process.cwd(), '.qwen', 'memory-project.md');

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let input = '';
  
  for await (const line of rl) {
    input += line;
  }
  
  // Extract recent conversation summary
  let context;
  try {
    context = JSON.parse(input);
  } catch (e) {
    process.exit(0);
    return;
  }
  
  // This hook runs before compression - we output a reminder
  // The actual memory saving is done by the AI agent itself
  // via the /memory add command, triggered by the hook output
  
  const output = {
    decision: 'allow',
    hookSpecificOutput: {
      additionalContext: '[PRE-COMPACT REMINDER] Before compression, save important decisions, architecture choices, and key facts using /memory add. Critical information will be lost otherwise.'
    }
  };
  
  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch(() => process.exit(0));
