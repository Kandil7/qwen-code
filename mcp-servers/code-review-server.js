#!/usr/bin/env node

/**
 * Code Review MCP Server
 * 
 * Provides code review tools integrated with the code-review-graph.
 * Supports blast-radius analysis, impact assessment, and review workflows.
 * 
 * Tools:
 *   - analyze_code: Analyze code structure
 *   - get_impact: Get impact analysis
 *   - find_related: Find related code
 *   - get_dependencies: Get dependency graph
 *   - suggest_refactors: Suggest improvements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const GRAPH_DIR = path.join(PROJECT_ROOT, '.qwen', 'code-graph');

class CodeReviewServer {
    constructor() {
        this.name = 'code-review';
    }

    analyzeCode(params) {
        const { filePath, depth = 2 } = params;
        
        if (!filePath) {
            throw new Error('filePath is required');
        }
        
        const fullPath = path.isAbsolute(filePath) 
            ? filePath 
            : path.join(PROJECT_ROOT, filePath);
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }
        
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        // Basic analysis
        const analysis = {
            file: filePath,
            size: stats.size,
            lines: lines.length,
            language: this.detectLanguage(fullPath),
            functions: this.extractFunctions(content, this.detectLanguage(fullPath)),
            imports: this.extractImports(content),
            exports: this.extractExports(content),
            complexity: this.estimateComplexity(content),
        };
        
        return analysis;
    }

    getImpact(params) {
        const { filePath } = params;
        
        if (!filePath) {
            throw new Error('filePath is required');
        }
        
        // Check if graph exists
        const graphFile = path.join(GRAPH_DIR, 'graph.json');
        
        let graph = { nodes: [], edges: [] };
        if (fs.existsSync(graphFile)) {
            graph = JSON.parse(fs.readFileSync(graphFile, 'utf-8'));
        }
        
        // Find related files
        const related = this.findRelatedFiles(filePath, graph);
        
        return {
            file: filePath,
            related: related,
            dependents: related.filter(r => r.type === 'depends-on').length,
            dependencies: related.filter(r => r.type === 'depended-by').length,
        };
    }

    findRelated(params) {
        const { pattern, type = 'any' } = params;
        
        if (!pattern) {
            throw new Error('pattern is required');
        }
        
        const files = this.searchFiles(pattern);
        
        return files.map(f => ({
            path: f,
            name: path.basename(f),
            type: this.detectLanguage(f),
        }));
    }

    getDependencies(params) {
        const { filePath } = params;
        
        if (!filePath) {
            throw new Error('filePath is required');
        }
        
        const fullPath = path.isAbsolute(filePath) 
            ? filePath 
            : path.join(PROJECT_ROOT, filePath);
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        const imports = this.extractImports(content);
        
        return imports.map(i => ({
            module: i.module,
            imported: i.imported,
            type: i.type,
        }));
    }

    suggestRefactors(params) {
        const { filePath } = params;
        
        if (!filePath) {
            throw new Error('filePath is required');
        }
        
        const fullPath = path.isAbsolute(filePath) 
            ? filePath 
            : path.join(PROJECT_ROOT, filePath);
        
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found: ${fullPath}`);
        }
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        const suggestions = [];
        
        // Check for long functions
        const functions = this.extractFunctions(content, this.detectLanguage(fullPath));
        for (const fn of functions) {
            if (fn.lines > 50) {
                suggestions.push({
                    type: 'long-function',
                    severity: 'warning',
                    message: `Function "${fn.name}" has ${fn.lines} lines. Consider splitting.`,
                    line: fn.start,
                });
            }
        }
        
        // Check for deep nesting
        const nesting = this.estimateNesting(content);
        if (nesting > 4) {
            suggestions.push({
                type: 'deep-nesting',
                severity: 'warning',
                message: `Maximum nesting depth is ${nesting}. Consider refactoring.`,
            });
        }
        
        // Check for TODO comments
        const todos = content.match(/\/\/\s*TODO|\/\*\s*TODO/gi);
        if (todos) {
            suggestions.push({
                type: 'todo-comments',
                severity: 'info',
                message: `Found ${todos.length} TODO comments`,
            });
        }
        
        return suggestions;
    }

    detectLanguage(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const langMap = {
            '.js': 'JavaScript',
            '.jsx': 'JavaScript (React)',
            '.ts': 'TypeScript',
            '.tsx': 'TypeScript (React)',
            '.py': 'Python',
            '.java': 'Java',
            '.go': 'Go',
            '.rs': 'Rust',
            '.rb': 'Ruby',
            '.php': 'PHP',
            '.cs': 'C#',
            '.cpp': 'C++',
            '.c': 'C',
        };
        return langMap[ext] || 'Unknown';
    }

    extractFunctions(content, language) {
        const functions = [];
        
        if (language.includes('JavaScript') || language.includes('TypeScript')) {
            const regex = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\([^)]*\)\s*\{)/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                functions.push({
                    name: match[1] || match[2] || match[3],
                    start: content.substring(0, match.index).split('\n').length,
                    lines: 1,
                });
            }
        } else if (language === 'Python') {
            const regex = /(?:def\s+(\w+)|class\s+(\w+))/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                functions.push({
                    name: match[1] || match[2],
                    start: content.substring(0, match.index).split('\n').length,
                    lines: 1,
                });
            }
        }
        
        return functions;
    }

    extractImports(content) {
        const imports = [];
        
        // JavaScript/TypeScript
        const jsRegex = /(?:import\s+(?:.*?)\s+from\s+['"]([^'"]+)['"]|require\s*\(['"]([^'"]+)['"]\))/g;
        let match;
        while ((match = jsRegex.exec(content)) !== null) {
            imports.push({
                module: match[1] || match[2],
                type: 'require',
            });
        }
        
        // Python
        const pyRegex = /(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/g;
        while ((match = pyRegex.exec(content)) !== null) {
            imports.push({
                module: match[1] || match[2],
                type: 'import',
            });
        }
        
        return imports;
    }

    extractExports(content) {
        const exports = [];
        
        // JavaScript/TypeScript
        const regex = /(?:export\s+(?:default\s+)?(?:const|let|var|function|class)\s+(\w+))/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        
        return exports;
    }

    estimateComplexity(content) {
        const lines = content.split('\n');
        let complexity = 1;
        
        for (const line of lines) {
            if (/\bif\b|\belse\b|\bfor\b|\bwhile\b|\bswitch\b|\bcatch\b/.test(line)) {
                complexity++;
            }
        }
        
        return complexity;
    }

    estimateNesting(content) {
        let maxNesting = 0;
        let currentNesting = 0;
        
        for (const char of content) {
            if (char === '{') {
                currentNesting++;
                maxNesting = Math.max(maxNesting, currentNesting);
            } else if (char === '}') {
                currentNesting--;
            }
        }
        
        return maxNesting;
    }

    findRelatedFiles(filePath, graph) {
        const fileName = path.basename(filePath);
        const related = [];
        
        // Find in graph edges
        for (const edge of graph.edges || []) {
            if (edge.source === fileName || edge.target === fileName) {
                related.push({
                    file: edge.source === fileName ? edge.target : edge.source,
                    type: edge.type || 'related',
                    relationship: edge.source === fileName ? 'depends-on' : 'depended-by',
                });
            }
        }
        
        return related;
    }

    searchFiles(pattern) {
        const results = [];
        const regex = new RegExp(pattern, 'i');
        
        function search(dir, depth = 0) {
            if (depth > 5) return;
            
            try {
                const entries = fs.readdirSync(dir);
                
                for (const entry of entries) {
                    if (entry.startsWith('.') || entry === 'node_modules') continue;
                    
                    const fullPath = path.join(dir, entry);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        search(fullPath, depth + 1);
                    } else if (stat.isFile() && regex.test(entry)) {
                        results.push(fullPath);
                    }
                }
            } catch (e) {
                // Skip inaccessible
            }
        }
        
        search(PROJECT_ROOT);
        return results;
    }
}

// Create server instance
const server = new CodeReviewServer();

// Handle MCP requests
process.stdin.on('data', (chunk) => {
    let buffer = '';
    buffer += chunk;
    
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        
        if (line.trim()) {
            try {
                const request = JSON.parse(line);
                const response = server.handleRequest(request.method, request.params);
                console.log(JSON.stringify({ id: request.id, result: response }));
            } catch (e) {
                console.error(JSON.stringify({ error: e.message }));
            }
        }
    }
});

process.stdin.resume();

// CLI for testing
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command || command === 'help') {
        console.log('Code Review MCP Server');
        console.log('');
        console.log('Usage: node code-review-server.js [command]');
        console.log('');
        console.log('Commands:');
        console.log('  analyze <file>     Analyze a file');
        console.log('  impact <file>      Get impact analysis');
        console.log('  suggest <file>      Get refactor suggestions');
        console.log('  deps <file>        Get dependencies');
        process.exit(0);
    }
    
    try {
        switch (command) {
            case 'analyze':
                console.log(JSON.stringify(server.analyzeCode({ filePath: args[1] }), null, 2));
                break;
            case 'impact':
                console.log(JSON.stringify(server.getImpact({ filePath: args[1] }), null, 2));
                break;
            case 'suggest':
                console.log(JSON.stringify(server.suggestRefactors({ filePath: args[1] }), null, 2));
                break;
            case 'deps':
                console.log(JSON.stringify(server.getDependencies({ filePath: args[1] }), null, 2));
                break;
            default:
                console.log('Unknown command');
                process.exit(1);
        }
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
