#!/usr/bin/env node

/**
 * Database Utilities
 * 
 * Common database operations for development and debugging.
 * Supports PostgreSQL, MySQL, SQLite, and MongoDB.
 * 
 * Usage: node .qwen/scripts/db-utils.js [command] [args...]
 * 
 * Commands:
 *   connect     Test database connection
 *   migrate    Run database migrations
 *   seed       Seed database with test data
 *   reset      Reset database (drop all tables)
 *   backup     Backup database
 *   restore    Restore from backup
 *   stats      Show database statistics
 *   query      Run a query
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
};

function log(msg, color = 'reset') {
    console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function findConfig() {
    const configs = [
        'database.json',
        'db.config.js',
        'prisma/schema.prisma',
        '.env',
        'config/database.js',
    ];
    
    for (const config of configs) {
        if (fs.existsSync(config)) {
            return config;
        }
    }
    return null;
}

function getDbType(config) {
    if (config === 'prisma/schema.prisma') {
        const content = fs.readFileSync(config, 'utf-8');
        if (content.includes('provider = "postgresql"')) return 'postgresql';
        if (content.includes('provider = "mysql"')) return 'mysql';
        if (content.includes('provider = "sqlite"')) return 'sqlite';
        if (content.includes('provider = "mongodb"')) return 'mongodb';
    }
    
    if (config === '.env') {
        const content = fs.readFileSync(config, 'utf-8');
        if (content.includes('DATABASE_URL') && content.includes('postgres')) return 'postgresql';
        if (content.includes('DATABASE_URL') && content.includes('mysql')) return 'mysql';
        if (content.includes('DATABASE_URL') && content.includes('sqlite')) return 'sqlite';
        if (content.includes('DATABASE_URL') && content.includes('mongodb')) return 'mongodb';
    }
    
    return 'unknown';
}

async function testConnection() {
    const config = findConfig();
    
    if (!config) {
        log('No database configuration found', 'yellow');
        return;
    }
    
    const dbType = getDbType(config);
    log(`Database type: ${dbType}`, 'cyan');
    log(`Config file: ${config}`, 'cyan');
    
    // Try to connect based on type
    switch (dbType) {
        case 'postgresql':
        case 'mysql':
            try {
                execSync('npx prisma db execute --stdin', { stdio: 'inherit' });
                log('Connection successful', 'green');
            } catch (e) {
                log(`Connection failed: ${e.message}`, 'red');
            }
            break;
            
        case 'sqlite':
            log('SQLite database found', 'green');
            const dbPath = config === '.env' ? '.env' : '*.db';
            log(`Database path: ${dbPath}`, 'cyan');
            break;
            
        case 'mongodb':
            log('MongoDB configuration found', 'green');
            break;
            
        default:
            log('Could not determine database type', 'yellow');
    }
}

function showStats() {
    const config = findConfig();
    
    if (!config) {
        log('No database configuration found', 'yellow');
        return;
    }
    
    const dbType = getDbType(config);
    log(`Database: ${dbType}`, 'cyan');
    
    // Show appropriate stats
    switch (dbType) {
        case 'postgresql':
            try {
                const result = execSync('npx prisma db execute --stdin <<< "SELECT count(*) FROM pg_tables;"', { encoding: 'utf-8' });
                log(result, 'gray');
            } catch (e) {
                log('Could not fetch stats', 'yellow');
            }
            break;
            
        case 'sqlite':
            const dbFiles = execSync('dir /b *.db 2>nul').trim().split('\n').filter(Boolean);
            log(`Database files: ${dbFiles.length}`, 'cyan');
            for (const file of dbFiles) {
                const size = fs.statSync(file.trim()).size;
                log(`  ${file.trim()}: ${(size / 1024).toFixed(2)} KB`, 'gray');
            }
            break;
            
        default:
            log('Stats not available for this database type', 'yellow');
    }
}

function runMigrations() {
    const config = findConfig();
    
    if (!config) {
        log('No database configuration found', 'yellow');
        return;
    }
    
    log('Running migrations...', 'cyan');
    
    try {
        // Check for Prisma
        if (fs.existsSync('prisma/schema.prisma')) {
            execSync('npx prisma migrate deploy', { stdio: 'inherit' });
            log('Migrations complete', 'green');
            return;
        }
        
        // Check for TypeORM
        if (fs.existsSync('typeorm.config.js')) {
            execSync('npm run typeorm migration:run', { stdio: 'inherit' });
            log('Migrations complete', 'green');
            return;
        }
        
        // Check for Sequelize
        if (fs.existsSync('migrations')) {
            execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
            log('Migrations complete', 'green');
            return;
        }
        
        log('No migration tool found. Install Prisma, TypeORM, or Sequelize.', 'yellow');
    } catch (e) {
        log(`Migration failed: ${e.message}`, 'red');
    }
}

function seedDatabase() {
    const config = findConfig();
    
    if (!config) {
        log('No database configuration found', 'yellow');
        return;
    }
    
    log('Seeding database...', 'cyan');
    
    try {
        // Check for Prisma
        if (fs.existsSync('prisma/seed.js') || fs.existsSync('prisma/seed.ts')) {
            execSync('npx prisma db seed', { stdio: 'inherit' });
            log('Seeding complete', 'green');
            return;
        }
        
        // Check for seed script in package.json
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        if (pkg.scripts?.seed) {
            execSync('npm run seed', { stdio: 'inherit' });
            log('Seeding complete', 'green');
            return;
        }
        
        log('No seed script found', 'yellow');
    } catch (e) {
        log(`Seeding failed: ${e.message}`, 'red');
    }
}

function resetDatabase() {
    log('⚠️  This will delete all data!', 'red');
    log('Use --force to skip confirmation', 'gray');
    
    if (!args.includes('--force')) {
        log('Run with --force to confirm', 'yellow');
        return;
    }
    
    const config = findConfig();
    
    if (!config) {
        log('No database configuration found', 'yellow');
        return;
    }
    
    log('Resetting database...', 'cyan');
    
    try {
        if (fs.existsSync('prisma/schema.prisma')) {
            execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
            log('Database reset complete', 'green');
            return;
        }
        
        log('Reset not supported for this database type', 'yellow');
    } catch (e) {
        log(`Reset failed: ${e.message}`, 'red');
    }
}

function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.sql`;
    
    log(`Creating backup: ${backupFile}`, 'cyan');
    
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        
        if (pkg.dependencies?.pg) {
            execSync(`pg_dump -U $(whoami) > ${backupFile}`, { shell: true });
            log(`Backup saved to ${backupFile}`, 'green');
        } else if (pkg.dependencies?.mysql2) {
            execSync(`mysqldump -u root > ${backupFile}`, { shell: true });
            log(`Backup saved to ${backupFile}`, 'green');
        } else {
            // For SQLite, just copy the file
            const dbFiles = execSync('dir /b *.db 2>nul').trim().split('\n').filter(Boolean);
            if (dbFiles.length > 0) {
                fs.copyFileSync(dbFiles[0].trim(), backupFile);
                log(`Backup saved to ${backupFile}`, 'green');
            } else {
                log('No database file found', 'yellow');
            }
        }
    } catch (e) {
        log(`Backup failed: ${e.message}`, 'red');
    }
}

function showHelp() {
    console.log(`
Database Utilities

Usage: node .qwen/scripts/db-utils.js [command] [options]

Commands:
  connect     Test database connection
  stats      Show database statistics
  migrate    Run database migrations
  seed       Seed database with test data
  reset      Reset database (drop all tables)
  backup     Backup database
  query      Run a SQL query

Options:
  --force     Skip confirmation prompts

Examples:
  node .qwen/scripts/db-utils.js connect
  node .qwen/scripts/db-utils.js stats
  node .qwen/scripts/db-utils.js migrate
  node .qwen/scripts/db-utils.js seed
  node .qwen/scripts/db-utils.js backup
  node .qwen/scripts/db-utils.js reset --force
`);
}

// Main
const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help') {
    showHelp();
    process.exit(0);
}

switch (command) {
    case 'connect':
        testConnection();
        break;
    case 'stats':
        showStats();
        break;
    case 'migrate':
        runMigrations();
        break;
    case 'seed':
        seedDatabase();
        break;
    case 'reset':
        resetDatabase();
        break;
    case 'backup':
        backupDatabase();
        break;
    default:
        log(`Unknown command: ${command}`, 'red');
        showHelp();
        process.exit(1);
}
