# code-review-graph MCP Server & Skill Setup

## Overview

**code-review-graph** is an MCP (Model Context Protocol) server and Qwen Code skill that builds a knowledge graph of your codebase to enable AI-powered code reviews with significantly reduced token usage.

### Key Benefits

- **8.2x average token reduction** on code reviews
- **Semantic search** across your entire codebase
- **Blast-radius analysis** for understanding change impact
- **Impact analysis** for proposed modifications
- **Support for 18+ programming languages**

### How It Works

code-review-graph creates a structured knowledge graph of your codebase that includes:
- Function and class definitions
- Import/dependency relationships
- Call graphs
- Type information
- File structure metadata

This graph allows the AI to understand your codebase context without loading entire files, dramatically reducing token consumption.

---

## Installation

### Prerequisites

- **Python 3.10+** (check with `python --version`)
- **pip** (Python package manager)
- **Qwen Code** with MCP support

### Quick Setup

Run the PowerShell setup script:

```powershell
# From any directory
C:\Users\amazon\.qwen\setup-code-review-graph.ps1

# Or navigate to .qwen first
cd C:\Users\amazon\.qwen
.\setup-code-review-graph.ps1
```

### Manual Installation

If you prefer manual installation:

```powershell
# 1. Install the package
python -m pip install code-review-graph

# 2. Verify installation
python -m pip show code-review-graph

# 3. Check CLI is working
python -m code_review_graph --help
```

---

## Configuration

The MCP server is configured in `C:\Users\amazon\.qwen\mcp.json`:

```json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "code-review-graph",
      "args": ["serve"],
      "transport": "stdio",
      "disabled": false
    }
  }
}
```

**Note:** The MCP server uses the `code-review-graph` command which should be available after installation. If the command is not on PATH, Qwen Code may need the full path to the Python executable.

This configuration:
- Uses **stdio transport** for communication
- Runs `code-review-graph serve` to start the server
- Is enabled by default (`disabled: false`)

---

## Usage in Qwen Code

### Using the Skill Commands

The code-review-graph skill provides dedicated commands for code review workflows:

```
/code-review-graph build      - Build or update the code graph
/code-review-graph review     - Review changes since last commit
/code-review-graph blast      - Analyze impact of changes (blast radius)
/code-review-graph search     - Semantic search in codebase
/code-review-graph status     - Show graph statistics
/code-review-graph visualize  - Generate HTML visualization
/code-review-graph help       - Show help information
```

**Examples:**

```
/code-review-graph build
/code-review-graph review
/code-review-graph blast src/auth.py
/code-review-graph search authentication middleware
/code-review-graph status
```

### Using the MCP Server

You can also interact with code-review-graph through the MCP server by mentioning it:

```
@code-review-graph What functions call the UserService class?
@code-review-graph Show me the blast radius of changing PaymentService
```

### Initializing a Project Graph

Before using code-review-graph, initialize it in your project directory:

```powershell
# Navigate to your project
cd C:\path\to\your\project

# Initialize the graph
python -m code_review_graph init

# Build the graph (optional, init usually does this)
python -m code_review_graph build
```

### Using in Qwen Code Conversations

Once the graph is initialized, you can reference it in your conversations:

```
@code-review-graph Review this pull request for potential issues

@code-review-graph What functions call the UserService class?

@code-review-graph Show me the blast radius of changing the PaymentProcessor interface
```

### Available MCP Tools

The code-review-graph MCP server provides these tools:

| Tool | Description |
|------|-------------|
| `semantic_search` | Search codebase by natural language query |
| `find_symbol` | Find definitions of classes, functions, variables |
| `find_references` | Find all references to a symbol |
| `get_call_graph` | Get callers/callees for a function |
| `get_import_graph` | Get import dependencies |
| `blast_radius` | Analyze impact of changes |
| `get_file_content` | Retrieve file content with context |

### Example Workflows

#### Code Review

```
@code-review-graph I'm about to modify the authenticate() method in auth.py.
What's the blast radius of this change?
```

#### Understanding Code

```
@code-review-graph Find all usages of the DatabaseConnection class
and show me the call graph for the connect() method.
```

#### Impact Analysis

```
@code-review-graph If I change the signature of processPayment() in PaymentService,
which other files will need to be updated?
```

---

## Supported Languages

code-review-graph supports 18+ languages including:

- Python
- JavaScript/TypeScript
- Java
- Go
- Rust
- C/C++
- C#
- Ruby
- PHP
- Swift
- Kotlin
- Scala
- And more...

---

## Troubleshooting

### MCP Server Not Starting

1. **Check Python is in PATH:**
   ```powershell
   python --version
   ```

2. **Verify code-review-graph is installed:**
   ```powershell
   python -m pip show code-review-graph
   ```

3. **Check MCP configuration:**
   ```powershell
   type C:\Users\amazon\.qwen\mcp.json
   ```

4. **Restart Qwen Code** to reload MCP servers

5. **Try using full Python path in mcp.json:**
   ```json
   {
     "mcpServers": {
       "code-review-graph": {
         "command": "python",
         "args": ["-m", "code_review_graph", "serve"],
         "transport": "stdio"
       }
     }
   }
   ```

### Graph Not Building

1. **Ensure you're in a valid project directory**
2. **Check for syntax errors** in your codebase
3. **Try rebuilding:**
   ```powershell
   python -m code_review_graph build --force
   ```

### High Memory Usage

For large codebases, consider:
- Excluding vendor/node_modules directories
- Using language-specific filters
- Building incremental graphs

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `python -m code_review_graph init` | Initialize graph for current project |
| `python -m code_review_graph build` | Build or update the code graph |
| `python -m code_review_graph query <query>` | Query the knowledge graph |
| `python -m code_review_graph serve` | Start MCP server (used by Qwen Code) |
| `python -m code_review_graph status` | Show graph status and statistics |
| `python -m code_review_graph clean` | Remove the graph and start fresh |
| `python -m code_review_graph watch` | Watch for changes and auto-update |
| `python -m code_review_graph visualize` | Generate interactive HTML graph visualization |

---

## Configuration Options

You can customize code-review-graph with a `.code-review-graph.json` file in your project root:

```json
{
  "languages": ["python", "typescript", "javascript"],
  "exclude": [
    "node_modules",
    "venv",
    ".git",
    "dist",
    "build"
  ],
  "maxFileSize": 1048576,
  "includeTests": true
}
```

---

## Resources

- **GitHub:** https://github.com/code-review-graph/code-review-graph
- **PyPI:** https://pypi.org/project/code-review-graph/
- **Documentation:** https://code-review-graph.dev/docs

---

**Last Updated:** March 31, 2026
**Version:** 1.0.0
