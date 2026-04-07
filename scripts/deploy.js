#!/usr/bin/env node

/**
 * Deployment Helper
 * 
 * Scripts for common deployment scenarios.
 * Supports Docker, AWS, Vercel, Netlify, and more.
 * 
 * Usage: node .qwen/scripts/deploy.js [command] [options]
 * 
 * Commands:
 *   docker-build    Build Docker image
 *   docker-deploy   Deploy to container registry
 *   vercel          Deploy to Vercel
 *   netlify         Deploy to Netlify
 *   aws-ecs         Deploy to AWS ECS
 *   kubernetes      Deploy to Kubernetes
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

function exec(cmd, options = {}) {
    try {
        return execSync(cmd, { 
            encoding: 'utf-8', 
            stdio: 'inherit',
            ...options 
        });
    } catch (e) {
        log(`Error: ${e.message}`, 'red');
        return null;
    }
}

function findProjectRoot(startDir) {
    let current = startDir;
    while (current !== path.parse(current).root) {
        if (fs.existsSync(path.join(current, '.qwen'))) {
            return current;
        }
        current = path.dirname(current);
    }
    return null;
}

function dockerBuild() {
    log('Building Docker image...', 'cyan');
    
    const dockerfile = fs.existsSync('Dockerfile') ? 'Dockerfile' : 
                       fs.existsSync('Dockerfile.prod') ? 'Dockerfile.prod' : null;
    
    if (!dockerfile) {
        log('No Dockerfile found', 'red');
        return;
    }
    
    const imageName = getImageName();
    const tag = process.env.TAG || 'latest';
    
    exec(`docker build -t ${imageName}:${tag} -f ${dockerfile} .`);
    log(`Built: ${imageName}:${tag}`, 'green');
}

function dockerDeploy() {
    log('Deploying to registry...', 'cyan');
    
    const imageName = getImageName();
    const tag = process.env.TAG || 'latest';
    
    // Check for Docker Hub or GHCR
    const registry = process.env.DOCKER_REGISTRY || 'docker.io';
    const username = process.env.DOCKER_USERNAME || process.env.GITHUB_ACTOR;
    
    if (registry === 'ghcr.io') {
        exec(`docker tag ${imageName}:${tag} ghcr.io/${username}/${imageName}:${tag}`);
        exec(`echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin`);
        exec(`docker push ghcr.io/${username}/${imageName}:${tag}`);
    } else {
        exec(`docker login -u ${username}`);
        exec(`docker tag ${imageName}:${tag} ${username}/${imageName}:${tag}`);
        exec(`docker push ${username}/${imageName}:${tag}`);
    }
    
    log('Deployed to registry', 'green');
}

function deployVercel() {
    log('Deploying to Vercel...', 'cyan');
    
    // Check for Vercel CLI
    try {
        exec('npx vercel --prod');
        log('Deployed to Vercel', 'green');
    } catch (e) {
        log('Vercel deployment failed', 'red');
    }
}

function deployNetlify() {
    log('Deploying to Netlify...', 'cyan');
    
    try {
        exec('npx netlify deploy --prod');
        log('Deployed to Netlify', 'green');
    } catch (e) {
        log('Netlify deployment failed', 'red');
    }
}

function deployAWS() {
    log('Deploying to AWS ECS...', 'cyan');
    
    const cluster = process.env.ECS_CLUSTER || 'default';
    const service = process.env.ECS_SERVICE || 'app';
    const imageName = getImageName();
    const tag = process.env.TAG || 'latest';
    
    // Get account ID
    const accountId = exec('aws sts get-caller-identity --query Account --output text');
    
    // Update task definition
    exec(`aws ecs update-service --cluster ${cluster} --service ${service} --force-new-deployment`);
    
    log(`Triggered deployment to ${cluster}/${service}`, 'green');
}

function deployKubernetes() {
    log('Deploying to Kubernetes...', 'cyan');
    
    // Check for kubectl
    try {
        exec('kubectl version --client');
    } catch (e) {
        log('kubectl not found', 'red');
        return;
    }
    
    const manifest = process.env.MANIFEST || 'k8s/deployment.yaml';
    
    if (!fs.existsSync(manifest)) {
        log(`Manifest ${manifest} not found`, 'red');
        return;
    }
    
    // Apply deployment
    exec(`kubectl apply -f ${manifest}`);
    
    // Check rollout status
    const deployment = path.basename(manifest, '.yaml');
    exec(`kubectl rollout status deployment/${deployment}`);
    
    log('Deployed to Kubernetes', 'green');
}

function getImageName() {
    // Try to get from package.json
    if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        return pkg.name || 'app';
    }
    
    // Fall back to directory name
    return path.basename(process.cwd()).toLowerCase();
}

function showStatus() {
    const projectRoot = findProjectRoot(process.cwd());
    
    console.log(`\n${COLORS.cyan}Deployment Status:${COLORS.reset}\n`);
    
    // Check for deployment configs
    const configs = [];
    
    if (fs.existsSync('Dockerfile') || fs.existsSync('docker-compose.yml')) {
        configs.push({ name: 'Docker', status: 'available' });
    }
    
    if (fs.existsSync('vercel.json')) {
        configs.push({ name: 'Vercel', status: 'configured' });
    }
    
    if (fs.existsSync('netlify.toml')) {
        configs.push({ name: 'Netlify', status: 'configured' });
    }
    
    if (fs.existsSync('k8s')) {
        configs.push({ name: 'Kubernetes', status: 'configured' });
    }
    
    if (fs.existsSync('terraform')) {
        configs.push({ name: 'Terraform', status: 'configured' });
    }
    
    if (configs.length === 0) {
        log('No deployment configurations found', 'yellow');
    } else {
        for (const config of configs) {
            const icon = config.status === 'configured' ? '✓' : '?';
            log(`${icon} ${config.name}: ${config.status}`, 'gray');
        }
    }
}

function showHelp() {
    console.log(`
Deployment Helper

Usage: node .qwen/scripts/deploy.js [command] [options]

Commands:
  docker-build    Build Docker image
  docker-deploy   Deploy to container registry
  vercel          Deploy to Vercel
  netlify         Deploy to Netlify
  aws-ecs         Deploy to AWS ECS
  kubernetes      Deploy to Kubernetes
  status          Show available deployment options

Options:
  TAG             Image tag (default: latest)
  MANIFEST        Kubernetes manifest path (default: k8s/deployment.yaml)
  DOCKER_REGISTRY Registry (default: docker.io)

Examples:
  node .qwen/scripts/deploy.js docker-build
  TAG=v1.0.0 node .qwen/scripts/deploy.js docker-deploy
  node .qwen/scripts/deploy.js vercel
  node .qwen/scripts/deploy.js kubernetes
  node .qwen/scripts/deploy.js status
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
    case 'docker-build':
        dockerBuild();
        break;
    case 'docker-deploy':
        dockerDeploy();
        break;
    case 'vercel':
        deployVercel();
        break;
    case 'netlify':
        deployNetlify();
        break;
    case 'aws-ecs':
        deployAWS();
        break;
    case 'kubernetes':
        deployKubernetes();
        break;
    case 'status':
        showStatus();
        break;
    default:
        log(`Unknown command: ${command}`, 'red');
        showHelp();
        process.exit(1);
}
