#!/usr/bin/env node

/**
 * Context Manager MCP Server
 * 
 * Manages conversation context, session history, and entity tracking.
 * Provides tools for maintaining context across sessions.
 * 
 * Tools:
 *   - save_context: Save current context
 *   - load_context: Load saved context
 *   - track_entity: Track entities in conversation
 *   - get_entities: Get all tracked entities
 *   - clear_context: Clear all context
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'memory');
const CONTEXT_FILE = path.join(DATA_DIR, 'context.json');
const ENTITIES_FILE = path.join(DATA_DIR, 'entities.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(CONTEXT_FILE)) {
    fs.writeFileSync(CONTEXT_FILE, JSON.stringify({ sessions: [], current: null }, null, 2));
}
if (!fs.existsSync(ENTITIES_FILE)) {
    fs.writeFileSync(ENTITIES_FILE, JSON.stringify({ entities: {} }, null, 2));
}

// MCP Server Protocol
class ContextManagerServer {
    constructor() {
        this.name = 'context-manager';
    }

    async handleRequest(method, params) {
        switch (method) {
            case 'save_context':
                return this.saveContext(params);
            case 'load_context':
                return this.loadContext(params);
            case 'track_entity':
                return this.trackEntity(params);
            case 'get_entities':
                return this.getEntities(params);
            case 'list_contexts':
                return this.listContexts(params);
            case 'clear_context':
                return this.clearContext(params);
            case 'get_session_history':
                return this.getSessionHistory(params);
            default:
                throw new Error(`Unknown method: ${method}`);
        }
    }

    saveContext(params) {
        const { sessionId, context, metadata } = params;
        
        const data = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        
        const entry = {
            sessionId: sessionId || `session_${Date.now()}`,
            context: context || '',
            metadata: metadata || {},
            timestamp: new Date().toISOString(),
        };
        
        data.sessions.push(entry);
        data.current = entry.sessionId;
        
        fs.writeFileSync(CONTEXT_FILE, JSON.stringify(data, null, 2));
        
        return { success: true, sessionId: entry.sessionId };
    }

    loadContext(params) {
        const { sessionId } = params;
        
        const data = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        
        if (sessionId) {
            const session = data.sessions.find(s => s.sessionId === sessionId);
            return session || null;
        }
        
        // Load current session
        if (data.current) {
            return data.sessions.find(s => s.sessionId === data.current) || null;
        }
        
        return null;
    }

    listContexts(params) {
        const data = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        
        return data.sessions.map(s => ({
            sessionId: s.sessionId,
            timestamp: s.timestamp,
            preview: s.context?.substring(0, 100) || '',
        }));
    }

    clearContext(params) {
        const { sessionId } = params;
        
        const data = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        
        if (sessionId) {
            data.sessions = data.sessions.filter(s => s.sessionId !== sessionId);
            if (data.current === sessionId) {
                data.current = data.sessions[0]?.sessionId || null;
            }
        } else {
            data.sessions = [];
            data.current = null;
        }
        
        fs.writeFileSync(CONTEXT_FILE, JSON.stringify(data, null, 2));
        
        return { success: true };
    }

    getSessionHistory(params) {
        const { limit } = params;
        
        const data = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'));
        
        const sessions = data.sessions
            .slice(-(limit || 10))
            .reverse();
        
        return sessions;
    }

    trackEntity(params) {
        const { name, type, value, metadata } = params;
        
        if (!name) {
            throw new Error('Entity name is required');
        }
        
        const data = JSON.parse(fs.readFileSync(ENTITIES_FILE, 'utf-8'));
        
        data.entities[name] = {
            name,
            type: type || 'unknown',
            value,
            metadata: metadata || {},
            updated: new Date().toISOString(),
        };
        
        fs.writeFileSync(ENTITIES_FILE, JSON.stringify(data, null, 2));
        
        return { success: true, entity: data.entities[name] };
    }

    getEntities(params) {
        const { type, pattern } = params;
        
        const data = JSON.parse(fs.readFileSync(ENTITIES_FILE, 'utf-8'));
        
        let entities = Object.values(data.entities);
        
        if (type) {
            entities = entities.filter(e => e.type === type);
        }
        
        if (pattern) {
            const regex = new RegExp(pattern, 'i');
            entities = entities.filter(e => 
                regex.test(e.name) || regex.test(e.value)
            );
        }
        
        return entities;
    }
}

// MCP Protocol Handler
const server = new ContextManagerServer();

// Simple MCP stdio protocol
let buffer = '';

process.stdin.on('data', (chunk) => {
    buffer += chunk;
    
    // Try to parse complete JSON messages
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

// CLI interface for testing
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Context Manager MCP Server');
        console.log('Usage: node context-server.js [command] [args...]');
        process.exit(0);
    }
    
    const command = args[0];
    
    switch (command) {
        case 'save':
            console.log(server.saveContext({
                sessionId: args[1],
                context: args[2]
            }));
            break;
            
        case 'load':
            console.log(server.loadContext({ sessionId: args[1] }));
            break;
            
        case 'entities':
            console.log(server.getEntities({}));
            break;
            
        case 'list':
            console.log(server.listContexts({}));
            break;
            
        default:
            console.log('Unknown command');
            process.exit(1);
    }
}
