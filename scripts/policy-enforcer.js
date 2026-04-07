#!/usr/bin/env node
/**
 * Policy Enforcer Hook - PreToolUse
 * 
 * Based on Claw Code Agent's hook_policy.py pattern.
 * Reads .qwen/policy.json and enforces tool policies, budget limits,
 * file access controls, and environment variable restrictions.
 * 
 * Returns exit code 0 (allow), 1 (warn), or 2 (block).
 * 
 * Usage: Hook receives tool context via stdin as JSON.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const POLICY_FILE = path.join(process.cwd(), '.qwen', 'policy.json');
const AUDIT_TRAIL = path.join(process.cwd(), '.qwen', 'audit-trail.json');

let policy = null;

function loadPolicy() {
  if (policy) return policy;
  
  try {
    policy = JSON.parse(fs.readFileSync(POLICY_FILE, 'utf8'));
  } catch (e) {
    // No policy file = allow all (default mode)
    return null;
  }
  
  return policy;
}

function logAudit(event) {
  try {
    let trail = [];
    if (fs.existsSync(AUDIT_TRAIL)) {
      trail = JSON.parse(fs.readFileSync(AUDIT_TRAIL, 'utf8'));
    }
    trail.push({
      timestamp: new Date().toISOString(),
      ...event
    });
    // Keep last 1000 entries
    if (trail.length > 1000) trail = trail.slice(-1000);
    fs.writeFileSync(AUDIT_TRAIL, JSON.stringify(trail, null, 2), 'utf8');
  } catch {
    // Silently fail audit logging
  }
}

function checkToolPolicy(context) {
  const p = loadPolicy();
  if (!p || !p.tool_policies) return { decision: 'allow' };
  
  const toolName = context.toolName || '';
  const toolInput = context.toolInput || {};
  
  // Check blocked tool patterns
  if (p.tool_policies.blocked_tools) {
    for (const rule of p.tool_policies.blocked_tools) {
      if (toolName.toLowerCase().includes(rule.tool.toLowerCase())) {
        const input = JSON.stringify(toolInput);
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(input)) {
          return {
            decision: 'block',
            reason: `Policy violation: ${rule.reason}`,
            rule: rule
          };
        }
      }
    }
  }
  
  // Check agent-specific tool restrictions
  if (p.tool_policies.agent_restrictions && context.agentName) {
    const agentPolicy = p.tool_policies.agent_restrictions[context.agentName];
    if (agentPolicy) {
      if (agentPolicy.blocked_tools && agentPolicy.blocked_tools.includes(toolName)) {
        return {
          decision: 'block',
          reason: `Agent ${context.agentName} is not allowed to use ${toolName}`,
          rule: { tool: toolName, agent: context.agentName }
        };
      }
    }
  }
  
  return { decision: 'allow' };
}

function checkFilePolicy(context) {
  const p = loadPolicy();
  if (!p || !p.file_policies) return { decision: 'allow' };
  
  const toolName = context.toolName || '';
  const toolInput = context.toolInput || {};
  
  if (!['write_file', 'edit_file', 'read_file'].includes(toolName)) {
    return { decision: 'allow' };
  }
  
  const filePath = toolInput.file_path || toolInput.path || '';
  if (!filePath) return { decision: 'allow' };
  
  const absPath = path.resolve(filePath);
  
  // Check blocked paths
  if (p.file_policies.blocked_paths) {
    for (const blocked of p.file_policies.blocked_paths) {
      if (absPath.startsWith(blocked)) {
        return {
          decision: 'block',
          reason: `Blocked path: ${blocked}`
        };
      }
    }
  }
  
  // Check read-only directories (for write/edit)
  if (['write_file', 'edit_file'].includes(toolName)) {
    if (p.file_policies.read_only_directories) {
      for (const readOnly of p.file_policies.read_only_directories) {
        const absReadOnly = path.resolve(readOnly);
        if (absPath.startsWith(absReadOnly)) {
          return {
            decision: 'block',
            reason: `Read-only directory: ${readOnly}`
          };
        }
      }
    }
  }
  
  return { decision: 'allow' };
}

function checkEnvPolicy(context) {
  const p = loadPolicy();
  if (!p || !p.environment_policies) return { decision: 'allow' };
  
  const toolName = context.toolName || '';
  const toolInput = context.toolInput || {};
  
  if (toolName !== 'bash') return { decision: 'allow' };
  
  const command = toolInput.command || '';
  
  // Check for blocked environment variable access
  if (p.environment_policies.blocked_variables) {
    for (const blocked of p.environment_policies.blocked_variables) {
      if (command.includes(blocked) || command.includes(blocked.toLowerCase())) {
        return {
          decision: 'block',
          reason: `Blocked environment variable: ${blocked}`
        };
      }
    }
  }
  
  return { decision: 'allow' };
}

function checkBudgetPolicy() {
  const p = loadPolicy();
  if (!p || !p.budget_policies) return { decision: 'allow' };
  
  // This is a soft check - in production you'd track actual usage
  // For now, just log a warning if we're above threshold
  const threshold = p.budget_policies.warning_threshold_percent || 80;
  
  return { decision: 'allow' };
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
  
  // Run all policy checks
  const checks = [
    checkToolPolicy(context),
    checkFilePolicy(context),
    checkEnvPolicy(context),
    checkBudgetPolicy()
  ];
  
  // Find the most restrictive decision
  const blockResult = checks.find(c => c.decision === 'block');
  const warnResult = checks.find(c => c.decision === 'warn');
  
  // Log audit event
  logAudit({
    tool: context.toolName,
    agent: context.agentName,
    decision: blockResult ? 'blocked' : warnResult ? 'warned' : 'allowed',
    reason: blockResult?.reason || warnResult?.reason || null
  });
  
  if (blockResult) {
    const output = {
      decision: 'block',
      hookSpecificOutput: {
        permissionDecision: 'deny',
        permissionDecisionReason: `[POLICY BLOCK] ${blockResult.reason}`
      }
    };
    console.error(`[POLICY] BLOCKED: ${blockResult.reason}`);
    console.log(JSON.stringify(output));
    process.exit(2);
  }
  
  if (warnResult) {
    const output = {
      decision: 'warn',
      hookSpecificOutput: {
        additionalContext: `[POLICY WARNING] ${warnResult.reason}`
      }
    };
    console.error(`[POLICY] WARNING: ${warnResult.reason}`);
    console.log(JSON.stringify(output));
  }
  
  process.exit(0);
}

main().catch(() => process.exit(0));
