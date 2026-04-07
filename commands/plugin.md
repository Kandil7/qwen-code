---
description: Manage plugins: list, install, enable, disable, uninstall. Controls lifecycle hook plugins that run after agent turns.
agents: ["dev-ops-platform-engineer"]
---

# /plugin - Plugin Management

## Usage

```
/plugin list
/plugin enable auto-test
/plugin disable doc-sync
/plugin status
/plugin info auto-test
```

## What Happens

1. **List** — Show all available plugins with status
2. **Enable** — Activate a plugin (set enabled: true in plugin.json)
3. **Disable** — Deactivate a plugin (set enabled: false)
4. **Status** — Show execution logs and recent activity
5. **Info** — Show plugin details, hooks, triggers

## Available Plugins

| Plugin | Status | Lifecycle Hook | Description |
|--------|--------|----------------|-------------|
| `auto-test` | ✅ Enabled | afterTurn | Run tests after every code generation |
| `commit-every-task` | ✅ Enabled | afterTurn | Auto-commit after each completed task |
| `doc-sync` | ✅ Enabled | afterTurn | Flag outdated documentation after code changes |

## Plugin Directory

All plugins live in `.qwen/plugins/`:

```
.qwen/plugins/
├── README.md              # Plugin system documentation
├── plugin-template.json   # Manifest template
├── auto-test/
│   └── plugin.json        # Auto-test plugin
├── commit-every-task/
│   └── plugin.json        # Auto-commit plugin
└── doc-sync/
    └── plugin.json        # Doc sync plugin
```

## Creating a Plugin

1. Create directory: `.qwen/plugins/my-plugin/`
2. Create `plugin.json` manifest (copy from plugin-template.json)
3. Define lifecycle hooks (beforePrompt, afterTurn, onResume, etc.)
4. Enable: plugin is enabled by default unless `"enabled": false`

## Plugin Execution

Plugins are executed by the plugin engine hook script:

```bash
# Execute afterTurn hooks for all enabled plugins
node .qwen/scripts/plugin-engine.js afterTurn

# Execute with context
echo '{"agentName": "software-engineer", "changedFile": "src/auth.py"}' | \
  node .qwen/scripts/plugin-engine.js afterTurn
```

## Related Commands

- `/scrape`, `/firecrawl`, `/scraping` — Scraping commands
- `/doctor` — System health check
- `/verify` — Pre-commit checks
