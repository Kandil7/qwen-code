# Plugin System

Based on [Claw Code Agent's plugin runtime](https://github.com/HarnessLab/claw-code-agent) pattern.

## Overview

Plugins extend Qwen Code's behavior by injecting lifecycle hooks into the agent loop. Each plugin is a directory with a `plugin.json` manifest that defines hooks, virtual tools, and tool aliases.

## Lifecycle Hooks

| Hook | Trigger | Use Case |
|------|---------|----------|
| `beforePrompt` | Before agent processes user prompt | Inject guidance, add context |
| `afterTurn` | After each agent turn | Auto-test, auto-commit, doc sync |
| `onResume` | On session resume | Reapply state, replay journal |
| `beforePersist` | Before session persistence | Save custom state |
| `beforeDelegate` | Before subagent starts | Inject guidance for child |
| `afterDelegate` | After subagent completes | Process child results |

## Plugin Structure

```
plugins/my-plugin/
├── plugin.json       # Manifest with hooks, virtualTools, toolAliases
├── README.md         # Plugin documentation
└── scripts/          # Optional helper scripts
```

## Available Plugins

| Plugin | Status | Description |
|--------|--------|-------------|
| `auto-test` | Available | Run tests after every code generation |
| `commit-every-task` | Available | Auto-commit after each completed task |
| `doc-sync` | Available | Update documentation after code changes |

## Creating a Plugin

1. Create directory: `plugins/my-plugin/`
2. Create `plugin.json` manifest (see template below)
3. Document in `README.md`
4. Enable by ensuring the plugin directory exists

## Plugin Manifest Format

See `plugin-template.json` for the complete schema.
