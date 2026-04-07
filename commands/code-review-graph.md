---
description: Build and query knowledge graphs for code analysis, impact tracking, and safe refactoring using code-review-graph.
agents: ["code-review-graph-engineer"]
---

# Code-Review-Graph Command

**Activates:** `code-review-graph-engineer` agent

## Usage
```
/code-review-graph install                      # Install and configure
/code-review-graph build                        # Build knowledge graph
/code-review-graph status                       # Check graph health
/code-review-graph detect-changes               # Analyze change impact
/code-review-graph visualize                    # Generate D3.js graph
/code-review-graph wiki                         # Generate documentation
/code-review-graph update                       # Incremental update
/code-review-graph watch                        # Auto-update on file changes
/code-review-graph serve                        # Start MCP server
```

## ⚠️ Important

This command will **WAIT** for your explicit confirmation before building or modifying graphs.

## What Happens

### Install
1. **Install Package**: `pip install code-review-graph`
2. **Detect Platform**: Auto-detects AI coding assistants
3. **Configure MCP**: Writes `.mcp.json` for tool integration
4. **Generate Skills**: Creates skill markdown files
5. **Install Hooks**: Sets up git hooks for automatic updates

### Build
1. **Parse Codebase**: Tree-sitter AST extraction (19 languages)
2. **Build Graph**: SQLite database with nodes and edges
3. **Create FTS5 Index**: Full-text search index
4. **Track Git**: Records branch, SHA, timestamp
5. **Report Stats**: File count, languages, node/edge counts

### Detect Changes
1. **Git Diff**: Identifies changed files (HEAD~1 by default)
2. **BFS Traversal**: Traces callers, callees, imports (depth=2)
3. **Risk Scoring**: Computes 0.0-1.0 risk per change
4. **Flow Analysis**: Identifies affected execution paths
5. **Test Coverage**: Checks for test gaps
6. **Review Priorities**: Top-10 review recommendations

### Visualize
1. **Generate D3.js**: Interactive HTML graph
2. **Color Coding**: By language, community, or risk
3. **Serve Option**: Optional localhost:8765 server

### Wiki
1. **Community Detection**: Leiden algorithm for code modules
2. **Generate Pages**: Architecture, communities, dependencies
3. **Markdown Output**: Human-readable documentation

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--platform` | auto-detected | AI platform (claude, cursor, windsurf, etc.) |
| `--base` | HEAD~1 | Git commit for change comparison |
| `--max-depth` | 2 | BFS traversal depth |
| `--serve` | false | Serve visualization on localhost:8765 |
| `--force` | false | Force regeneration |
| `--brief` | false | Summary-only output |

## Graph Structure

```
.code-review-graph/
├── graph.db                    # SQLite database
│   ├── nodes                   # Functions, classes, files, types
│   ├── edges                   # CALLS, IMPORTS, INHERITS, etc.
│   ├── metadata                # Build info, git tracking
│   └── nodes_fts               # Full-text search index
├── visualization.html          # D3.js interactive graph
└── wiki/                       # Generated documentation
```

## Supported Languages (19 + Notebooks)

Python, TypeScript/TSX, JavaScript, Vue, Go, Rust, Java, C#, Ruby, Kotlin, Swift, PHP, Scala, Solidity, C/C++, Dart, R, Perl, Lua, Jupyter Notebooks

## MCP Tools (22 Available)

Once installed, Qwen Code gets access to:

### Core
- `build_or_update_graph_tool` - Build/update graph
- `get_impact_radius_tool` - Blast radius analysis
- `query_graph_tool` - 8 query patterns
- `get_review_context_tool` - Review context
- `list_graph_stats_tool` - Graph statistics

### Search
- `semantic_search_nodes_tool` - Hybrid search
- `embed_graph_tool` - Vector embeddings
- `find_large_functions_tool` - Find oversized code

### Flows
- `list_flows_tool` - Execution flows
- `get_flow_tool` - Detailed flow
- `get_affected_flows_tool` - Affected flows

### Architecture
- `list_communities_tool` - Code communities
- `get_community_tool` - Community details
- `get_architecture_overview_tool` - Architecture overview

### Changes
- `detect_changes_tool` - Risk-scored analysis
- `get_review_context_tool` - Review context

### Refactoring
- `refactor_tool` - Rename preview, dead code
- `apply_refactor_tool` - Apply refactoring

### Documentation
- `generate_wiki_tool` - Generate wiki
- `get_wiki_page_tool` - Get wiki page
- `get_docs_section_tool` - Get docs

### Multi-Repo
- `list_repos_tool` - List repos
- `cross_repo_search_tool` - Cross-repo search

## Examples

### Initial Setup
```
/code-review-graph install
```

### Build Graph
```
/code-review-graph build
```

### Check Status
```
/code-review-graph status
```

### Analyze Changes
```
/code-review-graph detect-changes
```

### Visualize Graph
```
/code-review-graph visualize
/code-review-graph visualize --serve    # Serve on localhost:8765
```

### Generate Documentation
```
/code-review-graph wiki
```

### Incremental Update
```
/code-review-graph update
```

### Watch Mode (Auto-Update)
```
/code-review-graph watch
```

## Performance

| Metric | Value |
|--------|-------|
| Initial build | ~10s (500 files) |
| Incremental update | <2 seconds |
| Token reduction | 8.2x average |
| Impact recall | 100% |
| Max nodes (impact) | 500 |

## Cost Benefits

- **Token Savings**: 8.2x average reduction (only relevant context sent)
- **Speed**: Incremental updates in <2 seconds
- **Accuracy**: 100% recall on impact analysis
- **Local**: Zero cloud dependency, no API costs

## Prerequisites

```bash
# Install package
pip install code-review-graph

# Or with optional features
pip install code-review-graph[embeddings]     # Vector embeddings
pip install code-review-graph[all]            # All features

# Or use uv (recommended)
uvx code-review-graph install
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No graph found | Run `/code-review-graph build` first |
| Stale graph warning | Run `/code-review-graph update` |
| Parse failures | Check file encoding, add to .code-review-graphignore |
| MCP not connecting | Verify `.mcp.json` config, restart Qwen Code |
| Large repo slow | Use incremental update, not full build |
| Missing languages | Ensure tree-sitter-language-pack installed |

## Integration with Other Agents

| Task | Agent |
|------|-------|
| Build graph | @code-review-graph-engineer |
| Review code | @code-reviewer (uses graph context) |
| Refactor safely | @refactor-cleaner (uses blast radius) |
| Architecture design | @architect (uses communities) |
| Security review | @security-compliance-engineer (uses risk scores) |

## See Also
- Agent: `@code-review-graph-engineer`
- Repository: `C:\Users\amazon\code-review-graph-repo`
- GitHub: https://github.com/tirth8205/code-review-graph
- Docs: `C:\Users\amazon\code-review-graph-repo\docs\`
