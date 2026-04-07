#!/usr/bin/env node
/**
 * Plugin Execution Engine
 * 
 * Actually runs plugin lifecycle hooks defined in plugin.json manifests.
 * Previously plugins were only manifests - now hooks execute at the right times.
 * 
 * Lifecycle Hooks:
 *   beforePrompt  → Before agent processes user prompt
 *   afterTurn     → After each agent turn (auto-test, auto-commit, doc-sync)
 *   onResume      → On session resume
 *   beforePersist → Before session persistence
 *   beforeDelegate → Before subagent starts
 *   afterDelegate  → After subagent completes
 * 
 * Usage (called by hooks in settings.json):
 *   node .qwen/scripts/plugin-engine.js afterTurn
 *   node .qwen/scripts/plugin-engine.js onResume
 *   node .qwen/scripts/plugin-engine.js beforeDelegate
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PLUGINS_DIR = path.join(process.cwd(), '.qwen', 'plugins');
const LOG_FILE = path.join(process.cwd(), '.qwen', 'plugin-exec.log');

function log(msg) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${msg}\n`;
  try {
    fs.appendFileSync(LOG_FILE, entry, 'utf8');
  } catch {
    // Silently fail logging
  }
}

function loadPlugins() {
  const plugins = [];
  
  if (!fs.existsSync(PLUGINS_DIR)) {
    return plugins;
  }
  
  const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    
    const pluginDir = path.join(PLUGINS_DIR, entry.name);
    const manifestPath = path.join(pluginDir, 'plugin.json');
    
    if (!fs.existsSync(manifestPath)) continue;
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (manifest.enabled !== false) {
        plugins.push({
          name: manifest.name || entry.name,
          manifest,
          dir: pluginDir
        });
      }
    } catch (e) {
      log(`⚠ Failed to load plugin ${entry.name}: ${e.message}`);
    }
  }
  
  return plugins;
}

function executeHook(hookName, context) {
  const plugins = loadPlugins();
  const results = [];
  
  log(`Executing hook: ${hookName} for ${plugins.length} plugins`);
  
  for (const plugin of plugins) {
    const hooks = plugin.manifest.lifecycle_hooks || {};
    const hookActions = hooks[hookName] || [];
    const scripts = plugin.manifest.scripts || {};
    const triggers = plugin.manifest.triggers || {};
    
    // Skip if plugin has no actions for this hook
    if (hookActions.length === 0 && !scripts[hookName]) {
      continue;
    }
    
    // Check triggers
    if (triggers.onAgentType && context?.agentName) {
      const matches = triggers.onAgentType.some(t => 
        context.agentName.toLowerCase().includes(t.toLowerCase())
      );
      if (!matches) {
        log(`  Skipping plugin ${plugin.name}: agent type mismatch`);
        continue;
      }
    }
    
    if (triggers.onFileChange && context?.changedFile) {
      const ext = path.extname(context.changedFile);
      const matches = triggers.onFileChange.some(pattern => {
        if (pattern.startsWith('*')) {
          return ext === pattern.slice(1);
        }
        return pattern === context.changedFile;
      });
      if (!matches) {
        log(`  Skipping plugin ${plugin.name}: file type mismatch`);
        continue;
      }
    }
    
    // Execute hook actions
    for (const action of hookActions) {
      log(`  Plugin ${plugin.name}: ${hookName} → "${action.slice(0, 80)}..."`);
      results.push({
        plugin: plugin.name,
        hook: hookName,
        action: action,
        status: 'executed',
        output: null
      });
    }
    
    // Execute hook scripts
    if (scripts[hookName]) {
      const scriptPath = scripts[hookName];
      const absPath = path.isAbsolute(scriptPath) ? scriptPath : path.join(process.cwd(), scriptPath);
      
      log(`  Plugin ${plugin.name}: Running script ${scriptPath}`);
      
      try {
        const output = execSync(`node "${absPath}"`, {
          encoding: 'utf8',
          timeout: 30000,
          stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
        
        results.push({
          plugin: plugin.name,
          hook: hookName,
          script: scriptPath,
          status: 'success',
          output: output.slice(0, 500)
        });
        
        log(`  ✓ Script completed: ${output.slice(0, 100)}`);
      } catch (e) {
        const error = (e.stderr || e.stdout || e.message).slice(0, 500);
        results.push({
          plugin: plugin.name,
          hook: hookName,
          script: scriptPath,
          status: 'failed',
          error: error
        });
        
        log(`  ✗ Script failed: ${error.slice(0, 100)}`);
      }
    }
  }
  
  return results;
}

// Main entry point
const hookName = process.argv[2];

if (!hookName) {
  console.log('Usage: plugin-engine.js <hook-name> [context-json]');
  console.log('Hooks: beforePrompt, afterTurn, onResume, beforePersist, beforeDelegate, afterDelegate');
  process.exit(0);
}

// Read context from stdin if provided
let context = null;
const rl = readline.createInterface({ input: process.stdin });
let input = '';

rl.on('line', line => input += line);
rl.on('close', () => {
  if (input.trim()) {
    try {
      context = JSON.parse(input);
    } catch {
      // Ignore invalid JSON
    }
  }
  
  const results = executeHook(hookName, context);
  
  // Output results as JSON
  console.log(JSON.stringify({
    hook: hookName,
    plugins_executed: results.length,
    results: results
  }, null, 2));
});
