#!/usr/bin/env node
/**
 * Enhanced security scan with 25+ secret patterns, severity scoring, and auto-remediation hints
 * Usage: node .qwen/scripts/security-scan.js [--auto-fix] [--severity LEVEL] [--exclude PATTERN]
 * 
 * Options:
 *   --auto-fix     Show auto-fix suggestions (doesn't modify files)
 *   --severity    Minimum severity to report (CRITICAL|HIGH|MEDIUM|LOW)
 *   --exclude     Exclude patterns from config file
 *   --config      Custom config file path
 */

const fs = require('fs');
const path = require('path');

// Enhanced secret patterns with 25+ entries
const SECRET_PATTERNS = [
  // AWS (CRITICAL)
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'CRITICAL',
    remediation: 'Remove key. Use IAM roles or environment variables instead.'
  },
  {
    name: 'AWS Secret Key',
    pattern: /aws_secret_access_key\s*[:=]\s*['"][A-Za-z0-9/+=]{40}['"]/gi,
    severity: 'CRITICAL',
    remediation: 'Remove secret. Use IAM roles or AWS Secrets Manager.'
  },
  {
    name: 'AWS Session Token',
    pattern: /AWS_SESSION_TOKEN\s*[:=]\s*['"][A-Za-z0-9/+=]{200,}['"]/gi,
    severity: 'CRITICAL',
    remediation: 'Remove token. Use IAM roles instead.'
  },
  
  // GitHub (CRITICAL)
  {
    name: 'GitHub Token',
    pattern: /ghp_[A-Za-z0-9]{36}/g,
    severity: 'CRITICAL',
    remediation: 'Revoke token at GitHub > Settings > Developer settings > Tokens. Use GitHub Apps.'
  },
  {
    name: 'GitHub OAuth',
    pattern: /gho_[A-Za-z0-9]{36}/g,
    severity: 'CRITICAL',
    remediation: 'Revoke OAuth token at GitHub > Settings > Applications.'
  },
  
  // Payment (CRITICAL)
  {
    name: 'Stripe API Key',
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'CRITICAL',
    remediation: 'Rotate key immediately at Stripe Dashboard > API Keys. Use Stripe CLI for dev.'
  },
  {
    name: 'Stripe Publishable Key',
    pattern: /pk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'HIGH',
    remediation: 'Rotate key if exposed. Use pk_test_ for development.'
  },
  {
    name: 'Stripe Webhook Secret',
    pattern: /whsec_[A-Za-z0-9]{32,}/g,
    severity: 'CRITICAL',
    remediation: 'Regenerate webhook secret at Stripe Dashboard > Webhooks.'
  },
  
  // Generic API Keys (HIGH)
  {
    name: 'Generic API Key',
    pattern: /(?:api[_-]?key|apikey|api_secret|apiSecret)\s*[:=]\s*['"][A-Za-z0-9]{16,}['"]/gi,
    severity: 'HIGH',
    remediation: 'Move to environment variables or secret manager. Use .env files.'
  },
  {
    name: 'Private Key Header',
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'CRITICAL',
    remediation: 'Remove private key from code. Use key management service (AWS KMS, HashiCorp Vault).'
  },
  {
    name: 'PEM Certificate',
    pattern: /-----BEGIN CERTIFICATE-----/g,
    severity: 'MEDIUM',
    remediation: 'Ensure certificates are public or use certificate manager.'
  },
  
  // Database (HIGH)
  {
    name: 'Database URL with Password',
    pattern: /(?:mongodb|postgres|postgresql|mysql|redis):\/\/[^:]+:[^@]+@[a-z0-9.-]+/gi,
    severity: 'CRITICAL',
    remediation: 'Use environment variables: DATABASE_URL without credentials. Use IAM auth.'
  },
  {
    name: 'Database Connection String',
    pattern: /(?:Server=|Data Source=|Host=|Password=)[^;]+;/gi,
    severity: 'HIGH',
    remediation: 'Use connection pooling service or environment variables.'
  },
  
  // Authentication (HIGH)
  {
    name: 'JWT Secret',
    pattern: /(?:jwt[_-]?secret|jwt[_-]?key|JWT_SECRET)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    severity: 'HIGH',
    remediation: 'Generate new secret: openssl rand -base64 32. Store in secrets manager.'
  },
  {
    name: 'Bearer Token',
    pattern: /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g,
    severity: 'HIGH',
    remediation: 'Revoke token. Implement proper OAuth2 flow with short-lived tokens.'
  },
  {
    name: 'Basic Auth',
    pattern: /Basic\s+[A-Za-z0-9+/=]{20,}/g,
    severity: 'HIGH',
    remediation: 'Use OAuth2 or API keys instead of basic auth.'
  },
  
  // Passwords (CRITICAL)
  {
    name: 'Password Assignment',
    pattern: /(?:password|passwd|pwd|pass)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    severity: 'CRITICAL',
    remediation: 'Never hardcode passwords. Use environment variables or secrets manager.'
  },
  {
    name: 'Secret Assignment',
    pattern: /(?:secret|client_secret|app_secret)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    severity: 'HIGH',
    remediation: 'Move to secrets manager. Never commit secrets.'
  },
  
  // Cloud Providers (HIGH)
  {
    name: 'Azure Subscription Key',
    pattern: /[a-f0-9]{32}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
    severity: 'HIGH',
    remediation: 'Regenerate at Azure Portal > Subscriptions.'
  },
  {
    name: 'Google API Key',
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    severity: 'HIGH',
    remediation: 'Restrict key at Google Cloud Console > API Keys. Add HTTP referrer restrictions.'
  },
  {
    name: 'Google OAuth Client',
    pattern: /[0-9]+-[A-Za-z0-9_]{32}\.apps\.googleusercontent\.com/g,
    severity: 'HIGH',
    remediation: 'Regenerate at Google Cloud Console > Credentials.'
  },
  
  // Slack (HIGH)
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
    severity: 'HIGH',
    remediation: 'Revoke at Slack > Workspace Settings > Tokens. Use Bot User OAuth tokens.'
  },
  {
    name: 'Slack Webhook',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9]+\/B[a-zA-Z0-9]+\/[a-zA-Z0-9]+/g,
    severity: 'MEDIUM',
    remediation: 'Regenerate at Slack > Apps > Incoming Webhooks.'
  },
  
  // SendGrid (HIGH)
  {
    name: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g,
    severity: 'HIGH',
    remediation: 'Regenerate at SendGrid > Settings > API Keys.'
  },
  
  // Twilio (HIGH)
  {
    name: 'Twilio Account SID',
    pattern: /AC[a-z0-9]{32}/gi,
    severity: 'HIGH',
    remediation: 'Regenerate at Twilio Console > General Settings.'
  },
  {
    name: 'Twilio Auth Token',
    pattern: /[a-z0-9]{32}/gi,
    severity: 'HIGH',
    remediation: 'Regenerate at Twilio Console > General Settings.'
  },
  
  // Heroku (HIGH)
  {
    name: 'Heroku API Key',
    pattern: /[h|H][e|E][r|R][o|O][k|K][u|U].*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/g,
    severity: 'HIGH',
    remediation: 'Regenerate at Heroku Dashboard > Account Settings.'
  },
  
  // Docker (MEDIUM)
  {
    name: 'Docker Hub Token',
    pattern: /dockerhub[_-]?token[_-]?[a-z0-9]{20,}/gi,
    severity: 'HIGH',
    remediation: 'Regenerate at Docker Hub > Security.'
  },
  
  // Mailgun (HIGH)
  {
    name: 'Mailgun API Key',
    pattern: /key-[0-9a-zA-Z]{32}/g,
    severity: 'HIGH',
    remediation: 'Regenerate at Mailgun > API Security.'
  },
  
  // NPM (MEDIUM)
  {
    name: 'NPM Token',
    pattern: /npm_[A-Za-z0-9]{36}/g,
    severity: 'HIGH',
    remediation: 'Regenerate at npm > Access Tokens.'
  },
  
  // Generic secrets (MEDIUM)
  {
    name: 'Hex Secret',
    pattern: /secret[_-]?(?:key)?\s*[:=]\s*['"]([0-9a-f]{32,})['"]/gi,
    severity: 'MEDIUM',
    remediation: 'Use secrets manager instead of hardcoded values.'
  },
  {
    name: 'Base64 Encoded Secret',
    pattern: /password\s*[:=]\s*['"]([A-Za-z0-9+/=]{40,})['"]/gi,
    severity: 'MEDIUM',
    remediation: 'Decode and check if secret. Use environment variables.'
  }
];

// Configuration
const CONFIG = {
  excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', 'vendor', '.qwen'],
  excludeFiles: ['.env.example', '.env.template', 'example.env', 'secrets.json', 'seed-data.json'],
  severityThreshold: 'HIGH',
  autoFix: false
};

// Parse arguments
const args = process.argv.slice(2);
let customSeverityThreshold = null;
let excludePatterns = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--auto-fix' || args[i] === '-f') {
    CONFIG.autoFix = true;
  } else if (args[i] === '--severity' && args[i + 1]) {
    customSeverityThreshold = args[++i];
  } else if (args[i] === '--exclude' && args[i + 1]) {
    excludePatterns.push(args[++i]);
  }
}

if (customSeverityThreshold) {
  CONFIG.severityThreshold = customSeverityThreshold;
}

const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
const minSeverity = severityOrder[CONFIG.severityThreshold] || 3;

function shouldScan(filePath) {
  const fileName = path.basename(filePath);
  if (CONFIG.excludeFiles.includes(fileName)) return false;
  
  for (const pattern of excludePatterns) {
    if (filePath.includes(pattern)) return false;
  }
  
  return true;
}

function scanFile(filePath, relativePath) {
  const findings = [];
  
  if (!shouldScan(filePath)) {
    return findings;
  }
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return findings;
  }
  
  for (const { name, pattern, severity, remediation } of SECRET_PATTERNS) {
    // Skip lower severity than threshold
    if (severityOrder[severity] < minSeverity) continue;
    
    const regex = new RegExp(pattern.source, pattern.flags || 'g');
    const matches = content.match(regex);
    
    if (matches && matches.length > 0) {
      const lines = content.split('\n');
      const lineNumbers = [];
      for (let i = 0; i < lines.length; i++) {
        const lineRegex = new RegExp(pattern.source, pattern.flags || 'g');
        if (lineRegex.test(lines[i])) {
          lineNumbers.push(i + 1);
          lineRegex.lastIndex = 0;
        }
      }
      
      findings.push({
        file: relativePath,
        type: name,
        severity,
        count: matches.length,
        lines: lineNumbers,
        remediation,
        matchedValue: matches[0].substring(0, 20) + '...'
      });
    }
  }
  
  return findings;
}

function scanDirectory(dir, relativePath = '') {
  const findings = [];
  
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (e) {
    return findings;
  }
  
  for (const file of files) {
    if (file.startsWith('.')) continue;
    if (CONFIG.excludeDirs.includes(file)) continue;
    
    const filePath = path.join(dir, file);
    const fileRelativePath = path.join(relativePath, file);
    
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (e) {
      continue;
    }
    
    if (stat.isDirectory()) {
      findings.push(...scanDirectory(filePath, fileRelativePath));
    } else if (/\.(js|ts|jsx|tsx|py|go|java|rb|php|env|json|yaml|yml|toml|properties|config)$/.test(file)) {
      findings.push(...scanFile(filePath, fileRelativePath));
    }
  }
  
  return findings;
}

function printFindings(findings) {
  if (findings.length > 0) {
    console.log('\n🚨 Security Scan - Secrets Detected\n');
    console.log('='.repeat(70));
    
    // Group by severity
    const critical = findings.filter(f => f.severity === 'CRITICAL');
    const high = findings.filter(f => f.severity === 'HIGH');
    const medium = findings.filter(f => f.severity === 'MEDIUM');
    const low = findings.filter(f => f.severity === 'LOW');
    
    if (critical.length > 0) {
      console.log('\n🔴 CRITICAL (' + critical.length + '):\n');
      for (const finding of critical) {
        console.log(`  📁 ${finding.file}`);
        console.log(`     Type: ${finding.type}`);
        console.log(`     Lines: ${finding.lines.join(', ')}`);
        if (CONFIG.autoFix) {
          console.log(`     💡 ${finding.remediation}`);
        }
        console.log('');
      }
    }
    
    if (high.length > 0) {
      console.log('\n🟠 HIGH (' + high.length + '):\n');
      for (const finding of high) {
        console.log(`  📁 ${finding.file}`);
        console.log(`     Type: ${finding.type}`);
        console.log(`     Lines: ${finding.lines.join(', ')}`);
        if (CONFIG.autoFix) {
          console.log(`     💡 ${finding.remediation}`);
        }
        console.log('');
      }
    }
    
    if (medium.length > 0) {
      console.log('\n🟡 MEDIUM (' + medium.length + '):\n');
      for (const finding of medium.slice(0, 5)) {
        console.log(`  📁 ${finding.file} - ${finding.type} (line ${finding.lines[0]})`);
      }
      if (medium.length > 5) {
        console.log(`  ... and ${medium.length - 5} more`);
      }
    }
    
    console.log('='.repeat(70));
    console.log(`\n❌ Total: ${findings.length} potential secret(s) found\n`);
    
    if (!CONFIG.autoFix) {
      console.log('⚠️  IMMEDIATE ACTIONS:\n');
      console.log('  1. Run with --auto-fix to see remediation hints');
      console.log('  2. Remove hardcoded secrets from code');
      console.log('  3. Move to environment variables or secret manager');
      console.log('  4. Rotate any exposed credentials IMMEDIATELY');
      console.log('  5. Check git history for leaked secrets: git log -p --all -S "secret"\n');
    }
  }
  
  return findings.length;
}

function main() {
  const cwd = process.cwd();
  console.log('\n🔍 Security Scan');
  console.log('Minimum severity: ' + CONFIG.severityThreshold);
  console.log('');
  
  const findings = scanDirectory(cwd);
  const count = printFindings(findings);
  
  if (count === 0) {
    console.log('\n✅ No hardcoded secrets detected. Good job!\n');
    console.log('💡 Remember:');
    console.log('  - Use environment variables for all secrets');
    console.log('  - Use secrets manager (AWS Secrets Manager, HashiCorp Vault)');
    console.log('  - Add secrets to .gitignore');
    console.log('  - Use .env files with .env.example for templates\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
