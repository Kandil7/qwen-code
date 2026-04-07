# code-review-graph Quick Reference

## 🚀 Quick Start

```powershell
# 1. Install (if not already done)
pip install code-review-graph

# 2. Initialize in your project
cd C:\path\to\project
/code-review-graph build
```

## 📋 Skill Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/code-review-graph build` | Build/update code graph | `/code-review-graph build --force` |
| `/code-review-graph review` | Review changes since last commit | `/code-review-graph review` |
| `/code-review-graph blast` | Analyze impact of changes | `/code-review-graph blast src/auth.py` |
| `/code-review-graph search` | Semantic search codebase | `/code-review-graph search auth middleware` |
| `/code-review-graph status` | Show graph statistics | `/code-review-graph status` |
| `/code-review-graph visualize` | Generate HTML graph | `/code-review-graph visualize` |
| `/code-review-graph help` | Show help | `/code-review-graph help` |

## 💬 MCP Server Usage

```
@code-review-graph Review this PR for issues
@code-review-graph What's the blast radius of changing UserService?
@code-review-graph Find all usages of DatabaseConnection
```

## 🎯 Common Workflows

### Code Review Workflow
```
1. /code-review-graph build
2. Make your changes
3. /code-review-graph review
4. Address any issues found
```

### Impact Analysis Workflow
```
1. /code-review-graph blast src/payment.py
2. Review affected files
3. Update dependent code
4. /code-review-graph review
```

### Code Discovery Workflow
```
1. /code-review-graph search authentication
2. /code-review-graph blast <found_file>
3. Review call graph
```

## 📊 Files Created

| File | Purpose |
|------|---------|
| `C:\Users\amazon\.qwen\skills\code-review-graph.py` | Skill implementation |
| `C:\Users\amazon\.qwen\skills\code-review-graph.skill.json` | Skill configuration |
| `C:\Users\amazon\.qwen\mcp.json` | MCP server config |
| `C:\Users\amazon\.qwen\code-review-graph-setup.md` | Full documentation |

## 🔧 Troubleshooting

**Skill not working?**
```powershell
# Check installation
pip show code-review-graph

# Test CLI directly
code-review-graph --help

# Reinstall if needed
pip install --upgrade code-review-graph
```

**Graph not building?**
```powershell
# Check for .code-review-graph directory
ls .code-review-graph

# Force rebuild
/code-review-graph build --force
```

## 📈 Benefits

- ✅ **8.2x token reduction** on average
- ✅ **Perfect recall** on impact analysis
- ✅ **<2 second** incremental updates
- ✅ **18+ languages** supported

---

**Version:** 1.0.0 | **Last Updated:** March 31, 2026
