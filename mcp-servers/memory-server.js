#!/usr/bin/env node
/**
 * Knowledge Graph Memory MCP Server
 * Stores and retrieves context across sessions for improved agent coordination
 * 
 * Capabilities:
 * - Store entity relationships
 * - Query by similarity
 * - Track session history
 * - Learn patterns from past interactions
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'memory');
const ENTITIES_FILE = path.join(DATA_DIR, 'entities.json');
const RELATIONS_FILE = path.join(DATA_DIR, 'relations.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const PATTERNS_FILE = path.join(DATA_DIR, 'patterns.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files
function initData() {
  const files = {
    [ENTITIES_FILE]: [],
    [RELATIONS_FILE]: [],
    [SESSIONS_FILE]: [],
    [PATTERNS_FILE]: { successful: [], failed: [], agents: {} }
  };
  
  for (const [file, defaultData] of Object.entries(files)) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
    }
  }
}

// Load data
function loadData(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
}

// Save data
function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Generate ID
function generateId() {
  return crypto.randomBytes(8).toString('hex');
}

// Simple embedding simulation (for demonstration)
function simpleEmbedding(text) {
  const hash = crypto.createHash('sha256').update(text).digest();
  return Array.from(hash).map(b => b / 255);
}

// Calculate cosine similarity
function cosineSimilarity(a, b) {
  if (a.length !== b.length) return 0;
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// Tool handlers
const tools = {
  // Store a new entity
  store_entity: (params) => {
    const { name, type, description, metadata } = params;
    const entities = loadData(ENTITIES_FILE);
    
    const entity = {
      id: generateId(),
      name,
      type,
      description,
      embedding: simpleEmbedding(`${name} ${description}`),
      metadata: metadata || {},
      created: new Date().toISOString(),
      accessed: new Date().toISOString(),
      accessCount: 0
    };
    
    entities.push(entity);
    saveData(ENTITIES_FILE, entities);
    
    return { success: true, entity };
  },
  
  // Query entities by similarity
  query_entities: (params) => {
    const { query, type, limit = 5 } = params;
    const entities = loadData(ENTITIES_FILE);
    
    const queryEmbedding = simpleEmbedding(query);
    
    // Score by similarity
    let results = entities
      .map(e => ({
        ...e,
        score: cosineSimilarity(queryEmbedding, e.embedding)
      }))
      .filter(e => !type || e.type === type)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // Update access counts
    const updatedIds = new Set(results.map(r => r.id));
    entities.forEach(e => {
      if (updatedIds.has(e.id)) {
        e.accessed = new Date().toISOString();
        e.accessCount = (e.accessCount || 0) + 1;
      }
    });
    saveData(ENTITIES_FILE, entities);
    
    return { results };
  },
  
  // Create relationship between entities
  relate: (params) => {
    const { fromId, toId, relation, weight = 1.0 } = params;
    const relations = loadData(RELATIONS_FILE);
    
    const relationObj = {
      id: generateId(),
      from: fromId,
      to: toId,
      type: relation,
      weight,
      created: new Date().toISOString()
    };
    
    relations.push(relationObj);
    saveData(RELATIONS_FILE, relations);
    
    return { success: true, relation: relationObj };
  },
  
  // Get related entities
  get_related: (params) => {
    const { entityId, relation, depth = 1 } = params;
    const relations = loadData(RELATIONS_FILE);
    const entities = loadData(ENTITIES_FILE);
    
    const entityMap = {};
    entities.forEach(e => entityMap[e.id] = e);
    
    const related = [];
    const seen = new Set();
    
    function findRelated(id, currentDepth) {
      if (currentDepth > depth || seen.has(id)) return;
      seen.add(id);
      
      const outgoing = relations.filter(r => r.from === id && (!relation || r.type === relation));
      
      for (const r of outgoing) {
        const target = entityMap[r.to];
        if (target) {
          related.push({ entity: target, relation: r.type, depth: currentDepth });
          findRelated(r.to, currentDepth + 1);
        }
      }
    }
    
    findRelated(entityId, 1);
    
    return { related };
  },
  
  // Store session information
  store_session: (params) => {
    const { sessionId, project, task, agents, outcome, duration } = params;
    const sessions = loadData(SESSIONS_FILE);
    
    const session = {
      id: sessionId || generateId(),
      project,
      task,
      agents: agents || [],
      outcome, // 'success', 'partial', 'failed'
      duration, // in seconds
      timestamp: new Date().toISOString()
    };
    
    sessions.push(session);
    
    // Keep last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    saveData(SESSIONS_FILE, sessions);
    
    // Learn from session
    learnFromSession(session);
    
    return { success: true, session };
  },
  
  // Get recent sessions
  get_sessions: (params) => {
    const { project, limit = 10 } = params;
    let sessions = loadData(SESSIONS_FILE);
    
    if (project) {
      sessions = sessions.filter(s => s.project === project);
    }
    
    sessions = sessions.slice(-limit);
    
    return { sessions: sessions.reverse() };
  },
  
  // Learn pattern from session
  learn_pattern: (params) => {
    const { pattern, type, outcome, agents, context } = params;
    const patterns = loadData(PATTERNS_FILE);
    
    if (type === 'successful') {
      patterns.successful.push({
        pattern,
        agents,
        context,
        timestamp: new Date().toISOString()
      });
    } else if (type === 'failed') {
      patterns.failed.push({
        pattern,
        agents,
        context,
        timestamp: new Date().toISOString()
      });
    }
    
    // Track agent performance
    if (agents && agents.length > 0) {
      agents.forEach(agent => {
        if (!patterns.agents[agent]) {
          patterns.agents[agent] = { successes: 0, failures: 0, patterns: [] };
        }
        
        if (outcome === 'success') {
          patterns.agents[agent].successes++;
          patterns.agents[agent].patterns.push(pattern);
        } else {
          patterns.agents[agent].failures++;
        }
      });
    }
    
    saveData(PATTERNS_FILE, patterns);
    
    return { success: true };
  },
  
  // Get suggested agents based on patterns
  suggest_agents: (params) => {
    const { task, context } = params;
    const patterns = loadData(PATTERNS_FILE);
    
    // Find successful patterns similar to current task
    const taskEmbedding = simpleEmbedding(task);
    let suggestions = [];
    
    for (const p of patterns.successful) {
      const pEmbedding = simpleEmbedding(p.pattern);
      const similarity = cosineSimilarity(taskEmbedding, pEmbedding);
      
      if (similarity > 0.5) {
        suggestions.push({
          agents: p.agents,
          similarity,
          pattern: p.pattern
        });
      }
    }
    
    // Aggregate agent scores
    const agentScores = {};
    suggestions.forEach(s => {
      s.agents.forEach(agent => {
        if (!agentScores[agent]) {
          agentScores[agent] = { score: 0, count: 0 };
        }
        agentScores[agent].score += s.similarity;
        agentScores[agent].count++;
      });
    });
    
    // Sort by average score
    const ranked = Object.entries(agentScores)
      .map(([agent, data]) => ({
        agent,
        avgScore: data.score / data.count,
        totalUses: data.count
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
    
    return { suggestions: ranked.slice(0, 5) };
  },
  
  // Get memory statistics
  stats: () => {
    const entities = loadData(ENTITIES_FILE);
    const relations = loadData(RELATIONS_FILE);
    const sessions = loadData(SESSIONS_FILE);
    const patterns = loadData(PATTERNS_FILE);
    
    return {
      entities: entities.length,
      relations: relations.length,
      sessions: sessions.length,
      patterns: {
        successful: patterns.successful.length,
        failed: patterns.failed.length,
        agents: Object.keys(patterns.agents).length
      }
    };
  },
  
  // Clear all data
  clear: () => {
    initData();
    return { success: true };
  }
};

// Learn from session helper
function learnFromSession(session) {
  const type = session.outcome === 'success' ? 'successful' : 'failed';
  
  tools.learn_pattern({
    pattern: session.task,
    type,
    outcome: session.outcome,
    agents: session.agents,
    context: session.project
  });
}

// MCP Protocol
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize
initData();

// Handle requests
async function handleRequest(line) {
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;
    
    if (tools[method]) {
      const result = await tools[method](params || {});
      const response = JSON.stringify({
        id,
        result
      });
      console.log(response);
    } else {
      const error = JSON.stringify({
        id,
        error: { code: 'METHOD_NOT_FOUND', message: `Unknown method: ${method}` }
      });
      console.log(error);
    }
  } catch (e) {
    const error = JSON.stringify({
      error: { code: 'PARSE_ERROR', message: e.message }
    });
    console.log(error);
  }
}

rl.on('line', handleRequest);

// Handle initialize
console.log(JSON.stringify({
  protocolVersion: "2024-11-05",
  capabilities: {
    tools: Object.keys(tools)
  },
  serverInfo: {
    name: "memory",
    version: "1.0.0"
  }
}));