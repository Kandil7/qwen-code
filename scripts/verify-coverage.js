#!/usr/bin/env node
/**
 * Enhanced coverage verification with trends, HTML report, and per-file breakdown
 * Usage: node .qwen/scripts/verify-coverage.js [--trend] [--html] [--details]
 * 
 * Options:
 *   --trend   Show coverage trends (last 5 runs)
 *   --html    Generate HTML report
 *   --details Show per-file coverage breakdown
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  coverage: {
    threshold: 80,
    failOnTrend: true,
    trendHistory: 5,
    trendDbPath: '.qwen/data/coverage-trends.json'
  },
  colors: {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
  }
};

// Parse arguments
const args = process.argv.slice(2);
const showTrend = args.includes('--trend') || args.includes('-t');
const generateHtml = args.includes('--html') || args.includes('-h');
const showDetails = args.includes('--details') || args.includes('-d');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadTrends() {
  try {
    if (fs.existsSync(CONFIG.coverage.trendDbPath)) {
      return JSON.parse(fs.readFileSync(CONFIG.coverage.trendDbPath, 'utf8'));
    }
  } catch (e) {
    // Ignore errors
  }
  return { runs: [] };
}

function saveTrend(coverage) {
  const trends = loadTrends();
  const entry = {
    date: new Date().toISOString(),
    coverage: coverage
  };
  trends.runs.push(entry);
  
  // Keep only last N runs
  if (trends.runs.length > CONFIG.coverage.trendHistory * 2) {
    trends.runs = trends.runs.slice(-CONFIG.coverage.trendHistory);
  }
  
  ensureDir(path.dirname(CONFIG.coverage.trendDbPath));
  fs.writeFileSync(CONFIG.coverage.trendDbPath, JSON.stringify(trends, null, 2));
}

function showTrends() {
  const trends = loadTrends();
  if (trends.runs.length === 0) {
    console.log('\n📈 No trend data available yet. Run coverage check multiple times to build trends.');
    return;
  }
  
  console.log('\n📈 Coverage Trends (last ' + Math.min(trends.runs.length, CONFIG.coverage.trendHistory) + ' runs)\n');
  console.log('='.repeat(60));
  
  const recentRuns = trends.runs.slice(-CONFIG.coverage.trendHistory);
  recentRuns.forEach((run, idx) => {
    const date = new Date(run.date);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    const cov = run.coverage;
    const bar = generateProgressBar(cov);
    console.log(`${idx + 1}. ${dateStr}`);
    console.log(`   Coverage: ${cov.toFixed(1)}% ${bar}`);
  });
  
  // Calculate trend
  if (recentRuns.length >= 2) {
    const first = recentRuns[0].coverage;
    const last = recentRuns[recentRuns.length - 1].coverage;
    const diff = last - first;
    const trendIcon = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
    console.log('\n' + '='.repeat(60));
    console.log(`Trend: ${trendIcon} ${diff > 0 ? '+' : ''}${diff.toFixed(1)}% over ${recentRuns.length} runs`);
    
    // Check if trending down
    if (CONFIG.coverage.failOnTrend && diff < -5) {
      console.log(CONFIG.colors.red + '\n⚠️  Coverage trending down! Add more tests.' + CONFIG.colors.reset);
      process.exit(1);
    }
  }
}

function generateProgressBar(percentage) {
  const total = 20;
  const filled = Math.round((percentage / 100) * total);
  const empty = total - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return bar;
}

function getPerFileCoverage(coverage) {
  const files = [];
  
  if (coverage && coverage.data) {
    for (const [filePath, data] of Object.entries(coverage.data)) {
      if (typeof data === 'object' && data.lines) {
        files.push({
          path: filePath,
          lines: data.lines.pct || 0,
          statements: data.statements?.pct || 0,
          branches: data.branches?.pct || 0,
          functions: data.functions?.pct || 0
        });
      }
    }
  }
  
  return files.sort((a, b) => a.lines - b.lines);
}

function showPerFileDetails(coverage) {
  const files = getPerFileCoverage(coverage);
  
  if (files.length === 0) {
    console.log('\n📄 No per-file data available.');
    return;
  }
  
  console.log('\n📄 Per-File Coverage Breakdown\n');
  console.log('='.repeat(80));
  console.log('File'.padEnd(50) + 'Lines'.padEnd(10) + 'Stmt'.padEnd(8) + 'Brch'.padEnd(8) + 'Func');
  console.log('-'.repeat(80));
  
  files.forEach(file => {
    const line = file.path.length > 48 ? '...' + file.path.slice(-47) : file.path;
    const bar = generateProgressBar(file.lines);
    const status = file.lines < CONFIG.coverage.threshold ? CONFIG.colors.red + '✗' : CONFIG.colors.green + '✓';
    console.log(
      line.padEnd(50) + 
      `${file.lines.toFixed(1)}%`.padEnd(10) + 
      `${file.statements.toFixed(1)}%`.padEnd(8) + 
      `${file.branches.toFixed(1)}%`.padEnd(8) + 
      `${file.functions.toFixed(1)}% ${CONFIG.colors.reset}`
    );
  });
  
  console.log('='.repeat(80));
  
  // Show worst files
  const worst = files.filter(f => f.lines < CONFIG.coverage.threshold).slice(0, 5);
  if (worst.length > 0) {
    console.log(CONFIG.colors.yellow + '\n⚠️  Files below threshold (< ' + CONFIG.coverage.threshold + '%):' + CONFIG.colors.reset);
    worst.forEach(f => {
      console.log(`  - ${f.path} (${f.lines.toFixed(1)}%)`);
    });
  }
}

function generateHtmlReport(coverage) {
  const files = getPerFileCoverage(coverage);
  const summary = coverage.total;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coverage Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .metric { padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; }
    .metric-value { font-size: 36px; font-weight: bold; }
    .metric-label { color: #666; margin-top: 5px; }
    .pass { color: #28a745; }
    .fail { color: #dc3545; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #007bff; color: white; }
    tr:hover { background: #f8f9fa; }
    .low-coverage { background: #ffe6e6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Coverage Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    
    <div class="summary">
      <div class="metric">
        <div class="metric-value ${summary.statements.pct >= 80 ? 'pass' : 'fail'}">${summary.statements.pct.toFixed(1)}%</div>
        <div class="metric-label">Statements</div>
      </div>
      <div class="metric">
        <div class="metric-value ${summary.branches.pct >= 80 ? 'pass' : 'fail'}">${summary.branches.pct.toFixed(1)}%</div>
        <div class="metric-label">Branches</div>
      </div>
      <div class="metric">
        <div class="metric-value ${summary.functions.pct >= 80 ? 'pass' : 'fail'}">${summary.functions.pct.toFixed(1)}%</div>
        <div class="metric-label">Functions</div>
      </div>
      <div class="metric">
        <div class="metric-value ${summary.lines.pct >= 80 ? 'pass' : 'fail'}">${summary.lines.pct.toFixed(1)}%</div>
        <div class="metric-label">Lines</div>
      </div>
    </div>
    
    <h2>File Coverage</h2>
    <table>
      <thead>
        <tr><th>File</th><th>Lines</th><th>Statements</th><th>Branches</th><th>Functions</th></tr>
      </thead>
      <tbody>
        ${files.map(f => `
          <tr class="${f.lines < 80 ? 'low-coverage' : ''}">
            <td>${f.path}</td>
            <td>${f.lines.toFixed(1)}%</td>
            <td>${f.statements.toFixed(1)}%</td>
            <td>${f.branches.toFixed(1)}%</td>
            <td>${f.functions.toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  
  const reportPath = '.qwen/reports/coverage.html';
  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, html);
  console.log('\n📄 HTML report generated: ' + reportPath);
}

function checkCoverage() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coveragePath)) {
    console.error(CONFIG.colors.red + '❌ No coverage report found.' + CONFIG.colors.reset);
    console.error('Run tests first: npm test -- --coverage');
    process.exit(1);
  }
  
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  const summary = coverage.total;
  
  const checks = [
    { name: 'Statements', value: summary.statements.pct },
    { name: 'Branches', value: summary.branches.pct },
    { name: 'Functions', value: summary.functions.pct },
    { name: 'Lines', value: summary.lines.pct }
  ];
  
  let allPassed = true;
  let lowestMetric = { name: '', value: 100 };
  
  console.log('\n📊 Coverage Report\n');
  console.log('='.repeat(50));
  console.log('Target: ' + CONFIG.coverage.threshold + '%\n');
  
  for (const check of checks) {
    const passed = check.value >= CONFIG.coverage.threshold;
    const status = passed ? CONFIG.colors.green + '✅' : CONFIG.colors.red + '❌';
    const indicator = passed ? '✓' : '✗';
    console.log(
      `${status} ${CONFIG.colors.reset}${check.name.padEnd(12)}: ${check.value.toFixed(1)}% ${indicator} ` +
      `(target: ${CONFIG.coverage.threshold}%)`
    );
    if (!passed) {
      allPassed = false;
      if (check.value < lowestMetric.value) {
        lowestMetric = check;
      }
    }
  }
  
  console.log('='.repeat(50));
  
  // Save trend
  saveTrend(summary.lines.pct);
  
  // Show trends if requested
  if (showTrend) {
    showTrends();
  }
  
  // Show per-file details if requested
  if (showDetails) {
    showPerFileDetails(coverage);
  }
  
  // Generate HTML if requested
  if (generateHtml) {
    generateHtmlReport(coverage);
  }
  
  if (allPassed) {
    console.log(CONFIG.colors.green + '\n✅ All coverage thresholds met!' + CONFIG.colors.reset + '\n');
    process.exit(0);
  } else {
    console.log(CONFIG.colors.red + '\n❌ Coverage below threshold.' + CONFIG.colors.reset);
    console.log(`Lowest: ${lowestMetric.name} at ${lowestMetric.value.toFixed(1)}%`);
    console.log('\n💡 Tips:');
    console.log('  - Add more unit tests for uncovered functions');
    console.log('  - Check per-file breakdown with: node .qwen/scripts/verify-coverage.js --details');
    console.log('  - View trends with: node .qwen/scripts/verify-coverage.js --trend\n');
    process.exit(1);
  }
}

checkCoverage();
