# Container Usage Guide

**Based on:** [ultraworkers/claw-code docs/container.md](https://github.com/ultraworkers/claw-code/blob/main/docs/container.md)

## Overview

Run Qwen Code AI Engineering setup in an isolated Docker container for:
- Reproducible agent sessions
- Clean environment testing
- Safe experimentation (no host system contamination)
- CI/CD pipeline integration
- Shared development environments

---

## Quick Start

### Build the Container

```bash
# From project root (C:\Users\amazon)
docker build -f .qwen/Containerfile -t qwen-code-engineering .
```

### Run Interactive Session

```bash
# Basic run with workspace mount
docker run -it --rm -v ${PWD}:/workspace qwen-code-engineering

# With API keys for MCP servers
docker run -it --rm \
  -v ${PWD}:/workspace \
  -e FIRECRAWL_API_KEY=your-key \
  -e GITHUB_TOKEN=your-token \
  qwen-code-engineering

# With specific user
docker run -it --rm -u qwen -v ${PWD}:/workspace qwen-code-engineering
```

### Run Parity Tests

```bash
# Run mock parity tests inside container
docker run --rm qwen-code-engineering \
  node /workspace/.qwen/tests/parity-runner.js

# Run specific scenario
docker run --rm qwen-code-engineering \
  node /workspace/.qwen/tests/parity-runner.js --scenario read_file_roundtrip

# Verbose output
docker run --rm qwen-code-engineering \
  node /workspace/.qwen/tests/parity-runner.js --verbose
```

### Run Validation

```bash
# Full setup validation
docker run --rm qwen-code-engineering \
  node /workspace/.qwen/scripts/validate-setup.js

# Code health check
docker run --rm qwen-code-engineering \
  node /workspace/.qwen/scripts/code-health-check.js
```

---

## Container Architecture

```
┌─────────────────────────────────────────────────┐
│                  Docker Container                │
│                                                  │
│  /workspace                                      │
│  ├── .qwen/                                      │
│  │   ├── agents/          (53 agent definitions) │
│  │   ├── skills/          (20 skills)            │
│  │   ├── commands/        (21 commands)          │
│  │   ├── scripts/         (24 hook scripts)      │
│  │   ├── plugins/         (3 plugins)            │
│  │   ├── tests/           (parity runner)        │
│  │   ├── settings.json    (MCP + hooks config)   │
│  │   ├── policy.json      (runtime policies)     │
│  │   └── TOOLS.md         (registry docs)        │
│  ├── AGENTS.md            (project config)       │
│  └── requirements.txt     (Python deps)          │
│                                                  │
│  Node.js 20.x              (tool execution)      │
│  Python 3.x + pydantic     (AI skills)           │
│  Git                        (worktree isolation)  │
│  User: qwen (non-root)     (safety)              │
└─────────────────────────────────────────────────┘
```

---

## Use Cases

### 1. Clean Environment Testing

Test if Qwen Code setup works in a fresh environment:

```bash
docker run --rm qwen-code-engineering \
  node /workspace/.qwen/scripts/validate-setup.js
```

### 2. Safe Agent Experimentation

Run agents without risking host system changes:

```bash
# Container has isolated filesystem
docker run -it --rm qwen-code-engineering bash
# Any changes inside container are lost on exit
```

### 3. CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/qwen-validation.yml
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build container
        run: docker build -f .qwen/Containerfile -t qwen-code .
      - name: Run parity tests
        run: docker run --rm qwen-code node .qwen/tests/parity-runner.js
      - name: Run validation
        run: docker run --rm qwen-code node .qwen/scripts/validate-setup.js
```

### 4. Shared Development Environment

Ensure all team members have identical setup:

```bash
# Push container image to registry
docker tag qwen-code-engineering registry.example.com/qwen-code:latest
docker push registry.example.com/qwen-code:latest

# Team members pull identical image
docker pull registry.example.com/qwen-code:latest
```

---

## Advanced Configuration

### With MCP Servers

Some MCP servers need host system access:

```bash
# With Docker socket (for Docker MCP server)
docker run -it --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ${PWD}:/workspace \
  qwen-code-engineering

# With network access (for remote MCP servers)
docker run -it --rm \
  --network host \
  -v ${PWD}:/workspace \
  qwen-code-engineering
```

### Resource Limits

```bash
# Limit CPU and memory
docker run -it --rm \
  --cpus=2 \
  --memory=4g \
  -v ${PWD}:/workspace \
  qwen-code-engineering
```

### Persistent Sessions

```bash
# Mount session directory for persistence
docker run -it --rm \
  -v ${PWD}:/workspace \
  -v ${PWD}/.qwen/sessions:/home/qwen/.claude/sessions \
  qwen-code-engineering
```

---

## Troubleshooting

### Build Fails: requirements.txt not found

```bash
# Create empty requirements.txt
echo "# Python dependencies" > requirements.txt
docker build -f .qwen/Containerfile -t qwen-code-engineering .
```

### Permission Denied

```bash
# Ensure proper ownership
chown -R 1000:1000 .qwen/
```

### MCP Servers Not Reachable

```bash
# Use host network
docker run -it --rm --network host -v ${PWD}:/workspace qwen-code-engineering
```

---

**Related:**
- [PARITY.md](../PARITY.md) — Feature parity tracking
- [PHILOSOPHY.md](../PHILOSOPHY.md) — Design principles
- [TOOLS.md](../TOOLS.md) — Complete tool registry
