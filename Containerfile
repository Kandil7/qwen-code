# Qwen Code AI Engineering Container
#
# Based on ultraworkers/claw-code Containerfile pattern.
# Provides isolated, reproducible environment for Qwen Code sessions.
#
# Build:  docker build -f .qwen/Containerfile -t qwen-code-engineering .
# Run:    docker run -it --rm -v $(pwd):/workspace qwen-code-engineering
# With MCP: docker run -it --rm -v $(pwd):/workspace -e FIRECRAWL_API_KEY=... qwen-code-engineering

FROM node:20-slim AS base

# Set working directory
WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash qwen
USER qwen

# Install Python dependencies
RUN python3 -m venv /home/qwen/.venv
ENV PATH="/home/qwen/.venv/bin:$PATH"

# Copy and install Python requirements
COPY --chown=qwen:qwen requirements.txt /workspace/requirements.txt 2>/dev/null || true
RUN pip install --no-cache-dir pydantic || true

# Install Node.js global tools
RUN npm install -g npm@latest

# Copy Qwen Code configuration (as non-root user)
COPY --chown=qwen:qwen .qwen/ /workspace/.qwen/

# Create workspace directories
RUN mkdir -p /workspace/.qwen/session-summaries \
    && touch /workspace/.qwen/agent-audit.log \
    && touch /workspace/.qwen/audit-trail.json \
    && touch /workspace/.qwen/file-journal.json \
    && touch /workspace/.qwen/workflow-history.json

# Set environment variables
ENV HOME=/home/qwen
ENV WORKSPACE=/workspace
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node /workspace/.qwen/tests/parity-runner.js || exit 1

# Default command
CMD ["bash"]
