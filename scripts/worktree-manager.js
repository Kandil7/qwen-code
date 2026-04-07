#!/usr/bin/env node
/**
 * Worktree Manager - Git worktree automation for agent isolation
 * 
 * Based on Claw Code Agent's worktree_runtime.py pattern.
 * Creates, manages, and cleans up Git worktrees for parallel agent execution.
 * 
 * Usage:
 *   node worktree-manager.js create --tasks db,frontend,api --base-branch main
 *   node worktree-manager.js list
 *   node worktree-manager.js enter wt-db
 *   node worktree-manager.js cleanup
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = path.resolve(process.cwd(), '..');

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', ...opts }).trim();
  } catch (e) {
    if (opts.ignoreError) return '';
    console.error(`Error: ${e.stderr || e.message}`);
    process.exit(1);
  }
}

function createWorktrees(args) {
  const tasks = args.tasks.split(',').map(t => t.trim());
  const baseBranch = args['base-branch'] || 'main';
  
  console.log(`Creating ${tasks.length} worktrees from ${baseBranch}...\n`);
  
  // Verify base branch exists
  run(`git rev-parse --verify ${baseBranch}`);
  
  const worktrees = [];
  
  for (const task of tasks) {
    const branchName = `agent/${task}`;
    const wtPath = path.join(BASE_DIR, `wt-${task}`);
    
    // Check if worktree already exists
    if (fs.existsSync(wtPath)) {
      console.log(`  ⚠ Worktree wt-${task} already exists, skipping`);
      continue;
    }
    
    // Check if branch already exists
    const branchExists = run(`git branch --list ${branchName}`, { ignoreError: true });
    
    if (branchExists) {
      console.log(`  ⚠ Branch ${branchName} already exists, skipping`);
      continue;
    }
    
    // Create worktree + branch
    run(`git worktree add "${wtPath}" -b ${branchName} ${baseBranch}`);
    console.log(`  ✓ Created wt-${task} → branch: ${branchName} at ${wtPath}`);
    worktrees.push({ task, branch: branchName, path: wtPath });
  }
  
  console.log(`\n${worktrees.length}/${tasks.length} worktrees created.`);
  console.log('\nNext: Dispatch agents to their respective worktrees.');
}

function listWorktrees() {
  const output = run('git worktree list');
  const lines = output.split('\n');
  
  if (lines.length === 0 || (lines.length === 1 && lines[0].includes(process.cwd()))) {
    console.log('No worktrees found.');
    return;
  }
  
  console.log('Active worktrees:\n');
  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts[0] !== process.cwd()) {
      console.log(`  ${parts[0]} → ${parts[1]} (${parts[2]})`);
    }
  }
}

function enterWorktree(args) {
  const task = args.enter;
  const wtPath = path.join(BASE_DIR, `wt-${task}`);
  
  if (!fs.existsSync(wtPath)) {
    console.error(`Worktree wt-${task} not found at ${wtPath}`);
    process.exit(1);
  }
  
  console.log(`\nTo enter worktree wt-${task}:`);
  console.log(`  cd "${wtPath}"`);
  console.log(`  Current branch: ${run(`git -C "${wtPath}" branch --show-current`)}`);
}

function cleanup(args) {
  const output = run('git worktree list');
  const lines = output.split('\n');
  let removed = 0;
  
  console.log('Cleaning up worktrees...\n');
  
  for (const line of lines) {
    const parts = line.split(/\s+/);
    const wtPath = parts[0];
    const branch = parts[1];
    
    // Skip main working directory
    if (wtPath === process.cwd()) continue;
    
    // Only clean agent worktrees
    if (!wtPath.includes('wt-')) continue;
    
    // Check for uncommitted changes
    const hasChanges = run(`git -C "${wtPath}" status --porcelain`, { ignoreError: true });
    
    if (hasChanges && !args.force) {
      console.log(`  ⚠ ${wtPath} has uncommitted changes. Use --force to remove.`);
      continue;
    }
    
    // Merge branch first if requested
    if (args.merge) {
      console.log(`  Merging ${branch} into current branch...`);
      run(`git merge ${branch}`, { ignoreError: true });
    }
    
    // Remove worktree + branch
    run(`git worktree remove "${wtPath}"`, { ignoreError: true });
    run(`git branch -D ${branch}`, { ignoreError: true });
    console.log(`  ✓ Removed ${wtPath} (${branch})`);
    removed++;
  }
  
  console.log(`\n${removed} worktrees cleaned up.`);
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
    } else if (!args.command) {
      args.command = argv[i];
    }
  }
  return args;
}

const args = parseArgs(process.argv);

switch (args.command) {
  case 'create':
    if (!args.tasks) {
      console.error('Usage: worktree-manager.js create --tasks db,frontend,api [--base-branch main]');
      process.exit(1);
    }
    createWorktrees(args);
    break;
  case 'list':
    listWorktrees();
    break;
  case 'enter':
    if (!args.enter) {
      console.error('Usage: worktree-manager.js enter <task-name>');
      process.exit(1);
    }
    enterWorktree(args);
    break;
  case 'cleanup':
    cleanup(args);
    break;
  default:
    console.log(`
Worktree Manager - Git worktree automation for agent isolation

Usage:
  create   --tasks t1,t2,t3 [--base-branch main]   Create worktrees
  list                                              List active worktrees
  enter    <task-name>                              Enter a worktree
  cleanup  [--force] [--merge]                      Remove worktrees

Examples:
  node worktree-manager.js create --tasks database,frontend,api
  node worktree-manager.js list
  node worktree-manager.js cleanup --merge
`);
}
