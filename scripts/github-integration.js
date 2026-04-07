#!/usr/bin/env node

/**
 * GitHub Integration Script
 * 
 * Provides GitHub integration via gh CLI.
 * Creates issues, PRs, manages labels, and more.
 * 
 * Usage: node .qwen/scripts/github-integration.js [command] [args...]
 * 
 * Commands:
 *   create-issue    Create a new issue
 *   list-issues     List open issues
 *   create-pr       Create a pull request
 *   list-prs        List open PRs
 *   add-label       Add label to issue/PR
 *   close-issue     Close an issue
 *   release         Create a release
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

function log(msg, color = 'reset') {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function exec(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) {
        return e.stdout || e.stderr;
    }
}

function findProjectRoot(startDir) {
    let current = startDir;
    while (current !== path.parse(current).root) {
        if (fs.existsSync(path.join(current, '.git'))) {
            return current;
        }
        current = path.dirname(current);
    }
    return null;
}

function getRepoInfo(projectRoot) {
    const remote = exec('git remote get-url origin').trim();
    const match = remote.match(/github\.com[/:]([\w-]+)\/([\w-]+?)(?:\.git)?$/);
    
    if (!match) {
        throw new Error('Could not determine GitHub repository');
    }
    
    return {
        owner: match[1],
        repo: match[2],
    };
}

function createIssue(params) {
    const { title, body, labels, assignees } = params;
    
    if (!title) {
        throw new Error('Title is required');
    }
    
    let cmd = `gh issue create --title "${title}"`;
    
    if (body) {
        const bodyFile = path.join(process.cwd(), '.tmp_issue_body.md');
        fs.writeFileSync(bodyFile, body);
        cmd += ` --body-file "${bodyFile}"`;
    }
    
    if (labels) {
        cmd += ` --label "${labels.join(',')}"`;
    }
    
    if (assignees) {
        cmd += ` --assignee "${assignees.join(',')}"`;
    }
    
    const result = exec(cmd);
    log(`Created issue: ${result.trim()}`, 'green');
    return result;
}

function listIssues(params) {
    const { state = 'open', limit = 10 } = params;
    
    const result = exec(`gh issue list --state ${state} --limit ${limit}`);
    const lines = result.trim().split('\n').filter(Boolean);
    
    if (lines.length === 0) {
        log('No issues found', 'yellow');
        return [];
    }
    
    return lines.map(line => {
        const parts = line.split('\t');
        return {
            number: parts[0],
            title: parts[1],
            labels: parts[2],
            assignee: parts[3],
        };
    });
}

function createPR(params) {
    const { title, body, base = 'main', head, draft = false } = params;
    
    if (!title) {
        throw new Error('Title is required');
    }
    
    let cmd = `gh pr create --title "${title}" --base ${base}`;
    
    if (body) {
        const bodyFile = path.join(process.cwd(), '.tmp_pr_body.md');
        fs.writeFileSync(bodyFile, body);
        cmd += ` --body-file "${bodyFile}"`;
    }
    
    if (head) {
        cmd += ` --head ${head}`;
    }
    
    if (draft) {
        cmd += ` --draft`;
    }
    
    const result = exec(cmd);
    log(`Created PR: ${result.trim()}`, 'green');
    return result;
}

function listPRs(params) {
    const { state = 'open', limit = 10 } = params;
    
    const result = exec(`gh pr list --state ${state} --limit ${limit}`);
    const lines = result.trim().split('\n').filter(Boolean);
    
    if (lines.length === 0) {
        log('No PRs found', 'yellow');
        return [];
    }
    
    return lines.map(line => {
        const parts = line.split('\t');
        return {
            number: parts[0],
            title: parts[1],
            labels: parts[2],
            branch: parts[3],
        };
    });
}

function addLabel(params) {
    const { label, issue, pr } = params;
    
    if (!label) {
        throw new Error('Label is required');
    }
    
    let cmd;
    if (issue) {
        cmd = `gh issue edit ${issue} --add-label "${label}"`;
    } else if (pr) {
        cmd = `gh pr edit ${pr} --add-label "${label}"`;
    } else {
        throw new Error('Issue or PR number required');
    }
    
    exec(cmd);
    log(`Added label "${label}"`, 'green');
    return { success: true };
}

function closeIssue(params) {
    const { issue } = params;
    
    if (!issue) {
        throw new Error('Issue number required');
    }
    
    exec(`gh issue close ${issue}`);
    log(`Closed issue #${issue}`, 'green');
    return { success: true };
}

function createRelease(params) {
    const { tag, title, notes, draft = false, prerelease = false } = params;
    
    if (!tag) {
        throw new Error('Tag is required');
    }
    
    let cmd = `gh release create ${tag}`;
    
    if (title) {
        cmd += ` --title "${title}"`;
    }
    
    if (notes) {
        const notesFile = path.join(process.cwd(), '.tmp_release_notes.md');
        fs.writeFileSync(notesFile, notes);
        cmd += ` --notes-file "${notesFile}"`;
    }
    
    if (draft) {
        cmd += ` --draft`;
    }
    
    if (prerelease) {
        cmd += ` --prerelease`;
    }
    
    const result = exec(cmd);
    log(`Created release: ${result.trim()}`, 'green');
    return result;
}

function showHelp() {
    console.log(`
GitHub Integration

Usage: node .qwen/scripts/github-integration.js [command] [args...]

Commands:
  create-issue    Create a new issue
  list-issues    List open issues
  create-pr      Create a pull request
  list-prs       List open PRs
  add-label      Add label to issue/PR
  close-issue    Close an issue
  release        Create a release

Examples:
  node .qwen/scripts/github-integration.js create-issue --title "Bug: Login fails" --body "Steps to reproduce..."
  node .qwen/scripts/github-integration.js list-issues
  node .qwen/scripts/github-integration.js create-pr --title "Feature: Add auth" --base main
  node .qwen/scripts/github-integration.js add-label --issue 1 --label "bug"
  node .qwen/scripts/github-integration.js release --tag v1.0.0 --title "Version 1.0"
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help') {
    showHelp();
    process.exit(0);
}

const projectRoot = findProjectRoot(process.cwd());

if (!projectRoot) {
    log('Not in a git repository', 'red');
    process.exit(1);
}

try {
    const repo = getRepoInfo(projectRoot);
    log(`Repository: ${repo.owner}/${repo.repo}`, 'cyan');
    
    switch (command) {
        case 'create-issue':
            const issueTitle = args.find(a => a.startsWith('--title='))?.split('=')[1] || args[1];
            const issueBody = args.find(a => a.startsWith('--body='))?.split('=')[1];
            createIssue({ title: issueTitle, body: issueBody });
            break;
            
        case 'list-issues':
            const issues = listIssues({});
            console.log(JSON.stringify(issues, null, 2));
            break;
            
        case 'create-pr':
            const prTitle = args.find(a => a.startsWith('--title='))?.split('=')[1];
            const prBody = args.find(a => a.startsWith('--body='))?.split('=')[1];
            createPR({ title: prTitle, body: prBody });
            break;
            
        case 'list-prs':
            const prs = listPRs({});
            console.log(JSON.stringify(prs, null, 2));
            break;
            
        case 'add-label':
            const label = args.find(a => a.startsWith('--label='))?.split('=')[1];
            const issueNum = args.find(a => a.startsWith('--issue='))?.split('=')[1];
            const prNum = args.find(a => a.startsWith('--pr='))?.split('=')[1];
            addLabel({ label, issue: issueNum, pr: prNum });
            break;
            
        case 'close-issue':
            const closeNum = args.find(a => a.startsWith('--issue='))?.split('=')[1];
            closeIssue({ issue: closeNum });
            break;
            
        case 'release':
            const tag = args.find(a => a.startsWith('--tag='))?.split('=')[1];
            const relTitle = args.find(a => a.startsWith('--title='))?.split('=')[1];
            createRelease({ tag: tag, title: relTitle });
            break;
            
        default:
            log(`Unknown command: ${command}`, 'red');
            showHelp();
            process.exit(1);
    }
} catch (e) {
    log(e.message, 'red');
    process.exit(1);
}
