"""
code-review-graph Skill for Qwen Code

Provides commands for code review, blast-radius analysis, and codebase understanding
using the code-review-graph MCP server.

Usage:
    /code-review-graph build      - Build or update the code graph
    /code-review-graph review     - Review changes since last commit
    /code-review-graph blast      - Analyze impact of changes
    /code-review-graph search     - Semantic search in codebase
    /code-review-graph status     - Show graph statistics
    /code-review-graph visualize  - Generate HTML visualization
"""

import subprocess
import sys
import json
import os
from pathlib import Path


def check_code_review_graph_installed():
    """Check if code-review-graph is installed."""
    try:
        result = subprocess.run(
            ["code-review-graph", "--version"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def get_graph_directory():
    """Get the code-review-graph directory for current project."""
    cwd = os.getcwd()
    return os.path.join(cwd, ".code-review-graph")


def ensure_graph_initialized():
    """Ensure the code graph is initialized for the current project."""
    graph_dir = get_graph_directory()
    if not os.path.exists(graph_dir):
        print("📦 Code graph not found. Initializing...")
        result = subprocess.run(
            ["code-review-graph", "init"],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode != 0:
            print(f"❌ Failed to initialize: {result.stderr}")
            return False
        print("✅ Code graph initialized successfully!")
    return True


def cmd_build(args):
    """Build or update the code graph."""
    print("🔨 Building code review graph...")
    
    force = "--force" in args
    
    cmd = ["code-review-graph", "build"]
    if force:
        cmd.append("--force")
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    
    if result.returncode == 0:
        print("✅ Code graph built successfully!")
        if result.stdout:
            print(result.stdout)
    else:
        print(f"❌ Build failed: {result.stderr}")
        sys.exit(1)


def cmd_review(args):
    """Review changes since last commit."""
    print("🔍 Analyzing changes for review...")
    
    if not ensure_graph_initialized():
        sys.exit(1)
    
    cmd = ["code-review-graph", "review"]
    if len(args) > 0:
        cmd.extend(args)
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode == 0:
        print("📋 Code Review Report:")
        print("=" * 50)
        print(result.stdout)
    else:
        print(f"❌ Review failed: {result.stderr}")
        sys.exit(1)


def cmd_blast(args):
    """Analyze blast radius of changes."""
    print("💥 Analyzing blast radius...")
    
    if not ensure_graph_initialized():
        sys.exit(1)
    
    if len(args) == 0:
        print("Usage: /code-review-graph blast <file_or_function>")
        print("Example: /code-review-graph blast src/auth.py")
        print("Example: /code-review-graph blast UserService.authenticate")
        sys.exit(1)
    
    target = args[0]
    cmd = ["code-review-graph", "blast-radius", target]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode == 0:
        print("🎯 Blast Radius Analysis:")
        print("=" * 50)
        print(result.stdout)
    else:
        print(f"❌ Analysis failed: {result.stderr}")
        sys.exit(1)


def cmd_search(args):
    """Semantic search in codebase."""
    print("🔎 Searching codebase...")
    
    if not ensure_graph_initialized():
        sys.exit(1)
    
    if len(args) == 0:
        print("Usage: /code-review-graph search <query>")
        print("Example: /code-review-graph search authentication middleware")
        sys.exit(1)
    
    query = " ".join(args)
    cmd = ["code-review-graph", "search", query]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    
    if result.returncode == 0:
        print(f"📊 Search Results for: '{query}'")
        print("=" * 50)
        print(result.stdout)
    else:
        print(f"❌ Search failed: {result.stderr}")
        sys.exit(1)


def cmd_status(args):
    """Show graph statistics."""
    print("📊 Code Graph Status:")
    
    graph_dir = get_graph_directory()
    if not os.path.exists(graph_dir):
        print("⚠️  No code graph found. Run '/code-review-graph build' first.")
        sys.exit(0)
    
    cmd = ["code-review-graph", "status"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    
    if result.returncode == 0:
        print("=" * 50)
        print(result.stdout)
    else:
        print(f"❌ Status check failed: {result.stderr}")
        sys.exit(1)


def cmd_visualize(args):
    """Generate HTML visualization."""
    print("🎨 Generating graph visualization...")
    
    if not ensure_graph_initialized():
        sys.exit(1)
    
    cmd = ["code-review-graph", "visualize"]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    
    if result.returncode == 0:
        output_file = "graph.html"
        if result.stdout:
            for line in result.stdout.split("\n"):
                if "saved" in line.lower() and ".html" in line.lower():
                    output_file = line.split()[-1]
                    break
        
        print(f"✅ Visualization saved to: {output_file}")
        print("Open it in your browser to explore the code graph interactively.")
    else:
        print(f"❌ Visualization failed: {result.stderr}")
        sys.exit(1)


def cmd_help(args):
    """Show help information."""
    help_text = """
📚 code-review-graph Commands
═══════════════════════════════════════════════════

/code-review-graph build      - Build or update the code graph
/code-review-graph review     - Review changes since last commit
/code-review-graph blast      - Analyze impact of changes (blast radius)
/code-review-graph search     - Semantic search in codebase
/code-review-graph status     - Show graph statistics
/code-review-graph visualize  - Generate HTML visualization
/code-review-graph help       - Show this help message

Examples:
  /code-review-graph build --force
  /code-review-graph review
  /code-review-graph blast src/auth.py
  /code-review-graph search authentication middleware
  /code-review-graph status

Requirements:
  - Python 3.10+
  - code-review-graph package (pip install code-review-graph)
  - Initialized graph in project directory
"""
    print(help_text)


def main(command, args):
    """Main entry point for the skill."""
    
    # Check if code-review-graph is installed
    if command != "help" and not check_code_review_graph_installed():
        print("❌ code-review-graph is not installed!")
        print("\n📦 Install it with:")
        print("   pip install code-review-graph")
        print("\nOr run the setup script:")
        print("   C:\\Users\\amazon\\.qwen\\setup-code-review-graph.ps1")
        sys.exit(1)
    
    commands = {
        "build": cmd_build,
        "review": cmd_review,
        "blast": cmd_blast,
        "search": cmd_search,
        "status": cmd_status,
        "visualize": cmd_visualize,
        "help": cmd_help,
    }
    
    if command in commands:
        commands[command](args)
    else:
        print(f"❌ Unknown command: {command}")
        print("Run '/code-review-graph help' for available commands.")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        cmd_help([])
        sys.exit(0)
    
    command = sys.argv[1]
    args = sys.argv[2:]
    main(command, args)
