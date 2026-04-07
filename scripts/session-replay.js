#!/usr/bin/env node
/**
 * Session Replay System
 * 
 * Reads the file journal and replays what happened during a session.
 * Shows timeline of file operations, agent invocations, and decisions.
 * 
 * Usage:
 *   node .qwen/scripts/session-replay.js
 *   node .qwen/scripts/session-replay.js --session session-2026-04-07
 *   node .qwen/scripts/session-replay.js --output timeline.md
 *   node .qwen/scripts/session-replay.js --format json
 */

const fs = require('fs');
const path = require('path');

const JOURNAL_FILE = path.join(process.cwd(), '.qwen', 'file-journal.json');
const AUDIT_FILE = path.join(process.cwd(), '.qwen', 'audit-trail.json');
const SESSIONS_DIR = path.join(process.cwd(), '.qwen', 'session-summaries');

function loadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function loadSessions() {
  if (!fs.existsSync(SESSIONS_DIR)) return [];
  return fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f,
      content: fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf8'),
      timestamp: f
    }));
}

function replay(args) {
  const journal = loadJSON(JOURNAL_FILE);
  const audit = loadJSON(AUDIT_FILE);
  const sessions = loadSessions();
  
  const targetSession = args.session;
  const format = args.format || 'text';
  const outputFile = args.output;
  
  // Build timeline
  const timeline = [];
  
  // Add journal entries
  for (const entry of journal) {
    timeline.push({
      timestamp: entry.timestamp || 'unknown',
      type: 'file_operation',
      operation: entry.operation,
      file: entry.file,
      details: entry.details || '',
      session: entry.session
    });
  }
  
  // Add audit entries
  for (const entry of audit) {
    timeline.push({
      timestamp: entry.timestamp || 'unknown',
      type: 'tool_call',
      tool: entry.tool,
      agent: entry.agent,
      decision: entry.decision,
      reason: entry.reason || '',
      session: entry.session
    });
  }
  
  // Sort by timestamp
  timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  
  // Filter by session if specified
  const events = targetSession
    ? timeline.filter(e => e.session === targetSession)
    : timeline;
  
  // Format output
  if (format === 'json') {
    const output = JSON.stringify({ timeline: events, summary: getSummary(events) }, null, 2);
    if (outputFile) {
      fs.writeFileSync(outputFile, output, 'utf8');
      console.log(`Replay saved to: ${outputFile}`);
    } else {
      console.log(output);
    }
    return;
  }
  
  // Text/Markdown format
  const lines = [];
  lines.push('# Session Replay\n');
  lines.push(`Total events: ${events.length}`);
  lines.push(`Time range: ${events[0]?.timestamp || 'N/A'} → ${events[events.length - 1]?.timestamp || 'N/A'}\n`);
  
  // Group by type
  const fileOps = events.filter(e => e.type === 'file_operation');
  const toolCalls = events.filter(e => e.type === 'tool_call');
  
  lines.push('## File Operations\n');
  if (fileOps.length === 0) {
    lines.push('No file operations recorded.\n');
  } else {
    lines.push('| Time | Operation | File | Details |');
    lines.push('|------|-----------|------|---------|');
    for (const op of fileOps.slice(-50)) { // Last 50
      lines.push(`| ${op.timestamp} | ${op.operation} | \`${op.file}\` | ${op.details} |`);
    }
    if (fileOps.length > 50) {
      lines.push(`\n... and ${fileOps.length - 50} more operations`);
    }
  }
  
  lines.push('\n## Tool Calls\n');
  if (toolCalls.length === 0) {
    lines.push('No tool calls recorded.\n');
  } else {
    lines.push('| Time | Tool | Agent | Decision | Reason |');
    lines.push('|------|------|-------|----------|--------|');
    for (const call of toolCalls.slice(-50)) { // Last 50
      lines.push(`| ${call.timestamp} | ${call.tool} | ${call.agent || '-'} | ${call.decision} | ${call.reason} |`);
    }
    if (toolCalls.length > 50) {
      lines.push(`\n... and ${toolCalls.length - 50} more tool calls`);
    }
  }
  
  lines.push('\n## Sessions\n');
  if (sessions.length === 0) {
    lines.push('No session summaries found.\n');
  } else {
    for (const session of sessions.slice(-10)) { // Last 10
      lines.push(`### ${session.name}`);
      lines.push(session.content.slice(0, 500));
      lines.push('\n---\n');
    }
  }
  
  lines.push('\n## Summary\n');
  lines.push(getSummary(events));
  
  const output = lines.join('\n');
  
  if (outputFile) {
    fs.writeFileSync(outputFile, output, 'utf8');
    console.log(`Replay saved to: ${outputFile}`);
  } else {
    console.log(output);
  }
}

function getSummary(events) {
  const fileOps = events.filter(e => e.type === 'file_operation');
  const toolCalls = events.filter(e => e.type === 'tool_call');
  
  const blockedCalls = toolCalls.filter(c => c.decision === 'blocked');
  const warnedCalls = toolCalls.filter(c => c.decision === 'warned');
  
  return `
- File operations: ${fileOps.length}
- Tool calls: ${toolCalls.length}
- Blocked tool calls: ${blockedCalls.length}
- Warned tool calls: ${warnedCalls.length}
- Unique files modified: ${new Set(fileOps.map(e => e.file)).size}
- Unique tools used: ${new Set(toolCalls.map(e => e.tool)).size}
- Unique agents invoked: ${new Set(toolCalls.map(e => e.agent)).size}
`;
}

// Simple argument parser
function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args[key] = argv[++i];
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

replay(parseArgs(process.argv));
