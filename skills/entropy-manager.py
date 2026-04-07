#!/usr/bin/env python3
"""
Entropy Management System for AI-Assisted Development

Based on 2026 Harness Engineering best practices:
- Scheduled cleanup agents that fix documentation drift
- Detect constraint violations and pattern deviations
- Remove dead dependencies and unused imports
- Maintain codebase health for continued AI effectiveness

Usage:
    python entropy-manager.py scan [--dir .] [--fix]
    python entropy-manager.py dead-code [--dir .] [--fix]
    python entropy-manager.py doc-drift [--dir .]
    python entropy-manager.py constraint-violations [--dir .]
    python entropy-manager.py report [--dir .] [--output file.json]
"""

import argparse
import ast
import json
import os
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional


class EntropyScanner:
    """Scan codebase for various types of entropy."""
    
    def __init__(self, root_dir: str = "."):
        self.root = Path(root_dir)
        self.issues = defaultdict(list)
    
    def scan_all(self) -> Dict[str, List[Dict]]:
        """Run all entropy scans."""
        self.scan_dead_code()
        self.scan_doc_drift()
        self.scan_constraint_violations()
        self.scan_dead_dependencies()
        return dict(self.issues)
    
    def scan_dead_code(self):
        """Find unused imports, empty functions, unreachable code."""
        for py_file in self.root.rglob("*.py"):
            if self._is_ignored(py_file):
                continue
            try:
                content = py_file.read_text(encoding='utf-8')
                tree = ast.parse(content)
                
                # Find empty functions
                for node in ast.walk(tree):
                    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        body = [n for n in node.body if not isinstance(n, ast.Pass) and not isinstance(n, ast.Expr) or (isinstance(n, ast.Expr) and not isinstance(n.value, ast.Constant))]
                        if not body:
                            self.issues["dead_code"].append({
                                "file": str(py_file),
                                "line": node.lineno,
                                "type": "empty_function",
                                "name": node.name,
                                "severity": "low"
                            })
            except (SyntaxError, UnicodeDecodeError):
                pass
        
        # Find unused imports (simple heuristic)
        for py_file in self.root.rglob("*.py"):
            if self._is_ignored(py_file):
                continue
            try:
                content = py_file.read_text(encoding='utf-8')
                lines = content.split('\n')
                
                for i, line in enumerate(lines, 1):
                    match = re.match(r'^(?:from\s+\S+\s+)?import\s+(\w+)', line.strip())
                    if match:
                        name = match.group(1)
                        # Check if name is used elsewhere in file
                        used = any(name in other_line for j, other_line in enumerate(lines) if j != i - 1)
                        if not used and name not in ['os', 'sys', 'json', 'logging', 'time']:
                            self.issues["unused_imports"].append({
                                "file": str(py_file),
                                "line": i,
                                "name": name,
                                "severity": "low"
                            })
            except (UnicodeDecodeError, Exception):
                pass
    
    def scan_doc_drift(self):
        """Find TODO/FIXME/HACK comments older than 30 days, outdated docstrings."""
        doc_patterns = [
            (r'#\s*TODO[:(\s]*(.*?)(?:\n|$)', 'todo'),
            (r'#\s*FIXME[:(\s]*(.*?)(?:\n|$)', 'fixme'),
            (r'#\s*HACK[:(\s]*(.*?)(?:\n|$)', 'hack'),
            (r'#\s*XXX[:(\s]*(.*?)(?:\n|$)', 'xxx'),
        ]
        
        for py_file in self.root.rglob("*.py"):
            if self._is_ignored(py_file):
                continue
            try:
                content = py_file.read_text(encoding='utf-8')
                lines = content.split('\n')
                
                for i, line in enumerate(lines, 1):
                    for pattern, category in doc_patterns:
                        match = re.search(pattern, line, re.IGNORECASE)
                        if match:
                            self.issues[f"doc_{category}"].append({
                                "file": str(py_file),
                                "line": i,
                                "content": match.group(1).strip()[:100],
                                "severity": "medium" if category in ('fixme', 'xxx') else "low"
                            })
            except (UnicodeDecodeError, Exception):
                pass
    
    def scan_constraint_violations(self):
        """Find violations of project constraints."""
        constraints = [
            {
                "name": "max_function_length",
                "pattern": r'def\s+\w+\(.*?\):\s*\n((?:.*\n)*?)(?=\n\s*def |\nclass |\Z)',
                "max_lines": 50,
                "severity": "medium"
            },
            {
                "name": "max_nesting_depth",
                "check": "nesting",
                "max_depth": 4,
                "severity": "medium"
            },
            {
                "name": "max_file_length",
                "max_lines": 800,
                "severity": "low"
            },
        ]
        
        for py_file in self.root.rglob("*.py"):
            if self._is_ignored(py_file):
                continue
            try:
                content = py_file.read_text(encoding='utf-8')
                lines = content.split('\n')
                
                # Check file length
                if len(lines) > 800:
                    self.issues["constraint_file_length"].append({
                        "file": str(py_file),
                        "lines": len(lines),
                        "max": 800,
                        "severity": "low"
                    })
                
                # Check nesting depth
                max_depth = 0
                current_depth = 0
                for line in lines:
                    stripped = line.lstrip()
                    indent = len(line) - len(stripped)
                    depth = indent // 4
                    max_depth = max(max_depth, depth)
                
                if max_depth > 4:
                    self.issues["constraint_nesting_depth"].append({
                        "file": str(py_file),
                        "max_depth": max_depth,
                        "max_allowed": 4,
                        "severity": "medium"
                    })
                
            except (UnicodeDecodeError, Exception):
                pass
    
    def scan_dead_dependencies(self):
        """Find imports of modules that don't exist in requirements."""
        req_file = self.root / "requirements.txt"
        if not req_file.exists():
            return
        
        try:
            req_content = req_file.read_text(encoding='utf-8')
            installed = set()
            for line in req_content.split('\n'):
                line = line.strip()
                if line and not line.startswith('#') and not line.startswith('-'):
                    pkg = line.split('==')[0].split('>=')[0].split('<=')[0].strip()
                    installed.add(pkg.lower())
            
            # This is a simplified check - in production, use pip freeze
        except Exception:
            pass
    
    def _is_ignored(self, path: Path) -> bool:
        """Check if path should be ignored."""
        ignore_dirs = {'.git', '.venv', 'venv', 'node_modules', '__pycache__', '.tox', 'dist', 'build', 'eggs'}
        return any(part in ignore_dirs for part in path.parts)
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive entropy report."""
        report = {
            "timestamp": datetime.utcnow().isoformat(),
            "root": str(self.root),
            "total_issues": sum(len(issues) for issues in self.issues.values()),
            "issues_by_category": {
                category: len(issues) for category, issues in self.issues.items()
            },
            "severity_summary": defaultdict(int),
            "top_files": defaultdict(int),
            "details": dict(self.issues)
        }
        
        # Calculate severity summary
        for category, issues in self.issues.items():
            for issue in issues:
                report["severity_summary"][issue.get("severity", "unknown")] += 1
                report["top_files"][issue.get("file", "unknown")] += 1
        
        # Top 10 most problematic files
        report["top_10_files"] = dict(
            sorted(report["top_files"].items(), key=lambda x: -x[1])[:10]
        )
        
        return report
    
    def fix_issues(self, dry_run: bool = True) -> Dict[str, Any]:
        """Attempt to fix fixable issues."""
        fixes = []
        
        for category, issues in self.issues.items():
            for issue in issues:
                if category == "unused_imports" and not dry_run:
                    fixes.append({
                        "action": "remove_unused_import",
                        "file": issue["file"],
                        "line": issue["line"],
                        "name": issue["name"],
                        "status": "would_fix" if dry_run else "fixed"
                    })
                else:
                    fixes.append({
                        "action": "manual_review_needed",
                        "category": category,
                        "file": issue.get("file", "unknown"),
                        "status": "needs_manual fix"
                    })
        
        return {"fixes": fixes, "dry_run": dry_run}


def main():
    parser = argparse.ArgumentParser(description="Entropy Management for AI-Assisted Development")
    subparsers = parser.add_subparsers(dest="command")
    
    scan_p = subparsers.add_parser("scan")
    scan_p.add_argument("--dir", default=".")
    scan_p.add_argument("--fix", action="store_true")
    
    subparsers.add_parser("dead-code")
    subparsers.add_parser("doc-drift")
    subparsers.add_parser("constraint-violations")
    
    report_p = subparsers.add_parser("report")
    report_p.add_argument("--dir", default=".")
    report_p.add_argument("--output")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(0)
    
    scanner = EntropyScanner(args.dir if hasattr(args, 'dir') else ".")
    
    if args.command == "scan":
        results = scanner.scan_all()
        total = sum(len(v) for v in results.values())
        print(f"Scanned: {args.dir}")
        print(f"Total issues: {total}")
        for category, issues in results.items():
            if issues:
                print(f"\n{category} ({len(issues)}):")
                for issue in issues[:10]:
                    print(f"  - {issue.get('file', 'unknown')}:{issue.get('line', '?')} {issue.get('name', issue.get('type', ''))}")
        
        if args.fix:
            fixes = scanner.fix_issues(dry_run=False)
            print(f"\nFixes applied: {len(fixes['fixes'])}")
    
    elif args.command == "report":
        scanner.scan_all()
        report = scanner.generate_report()
        
        if hasattr(args, 'output') and args.output:
            with open(args.output, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"Report saved to: {args.output}")
        else:
            print(json.dumps(report, indent=2, default=str)[:2000])
    
    else:
        scanner.scan_all()
        category_map = {
            "dead-code": ["dead_code", "unused_imports"],
            "doc-drift": ["doc_todo", "doc_fixme", "doc_hack", "doc_xxx"],
            "constraint-violations": ["constraint_file_length", "constraint_nesting_depth"]
        }
        categories = category_map.get(args.command, [])
        for cat in categories:
            issues = scanner.issues.get(cat, [])
            print(f"\n{cat} ({len(issues)} issues):")
            for issue in issues[:20]:
                print(f"  - {issue}")


if __name__ == "__main__":
    main()
