#!/usr/bin/env pwsh
# code-review-graph MCP Server Setup Script for Qwen Code
# This script installs and configures the code-review-graph MCP server

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  code-review-graph Setup for Qwen Code" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Python version
Write-Host "[1/4] Checking Python installation..." -ForegroundColor Yellow

try {
    $pythonVersion = python --version 2>&1
    Write-Host "  Found: $pythonVersion" -ForegroundColor Green
    
    # Extract version number
    $versionMatch = $pythonVersion -match 'Python (\d+)\.(\d+)'
    if ($versionMatch) {
        $major = [int]$matches[1]
        $minor = [int]$matches[2]
        
        if ($major -lt 3 -or ($major -eq 3 -and $minor -lt 10)) {
            Write-Host "  ERROR: Python 3.10+ required. Found $major.$minor" -ForegroundColor Red
            exit 1
        }
        Write-Host "  Python version OK (3.10+)" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: Could not parse Python version" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: Python not found. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Install code-review-graph via pip
Write-Host "[2/4] Installing code-review-graph..." -ForegroundColor Yellow

try {
    $pipOutput = python -m pip install code-review-graph --upgrade 2>&1
    Write-Host "  Installation completed" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to install code-review-graph" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Verify installation
Write-Host "[3/4] Verifying installation..." -ForegroundColor Yellow

try {
    $packageInfo = python -m pip show code-review-graph 2>&1
    if ($packageInfo -match "Name: code-review-graph") {
        Write-Host "  code-review-graph installed successfully" -ForegroundColor Green
        
        # Extract version
        if ($packageInfo -match "Version: (.+)") {
            Write-Host "  Version: $($matches[1])" -ForegroundColor Green
        }
    } else {
        Write-Host "  WARNING: Could not verify package installation" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  WARNING: Could not verify installation" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Verify CLI is accessible
Write-Host "[4/4] Verifying CLI accessibility..." -ForegroundColor Yellow

try {
    $helpOutput = python -m code_review_graph --help 2>&1
    if ($helpOutput -match "code-review-graph") {
        Write-Host "  CLI is accessible via 'python -m code_review_graph'" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: CLI output unexpected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERROR: CLI not accessible" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Restart Qwen Code to load the MCP server" -ForegroundColor White
Write-Host "  2. Navigate to your project directory" -ForegroundColor White
Write-Host "  3. Run: python -m code_review_graph init" -ForegroundColor White
Write-Host "  4. Use @code-review-graph for AI-powered code reviews" -ForegroundColor White
Write-Host ""
Write-Host "Available Commands:" -ForegroundColor Cyan
Write-Host "  python -m code_review_graph init     - Initialize graph for current project" -ForegroundColor White
Write-Host "  python -m code_review_graph build    - Build/update the code graph" -ForegroundColor White
Write-Host "  python -m code_review_graph query    - Query the knowledge graph" -ForegroundColor White
Write-Host "  python -m code_review_graph serve    - Start MCP server (auto-started by Qwen Code)" -ForegroundColor White
Write-Host ""
Write-Host "Note: The CLI may not be on PATH. Use 'python -m code_review_graph' instead." -ForegroundColor Gray
Write-Host ""
