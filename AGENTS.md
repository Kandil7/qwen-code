# Qwen Code Global Agents Configuration

**Total Agents:** 53 Kandil Specialized Subagents

This file registers all available agents globally for Qwen Code.

---

## 🎯 Quick Usage

Type `@` followed by agent name in any Qwen Code conversation:

```
@orchestrator-tech-lead    # Complex projects
@full-stack-ai-engineer    # AI/LLM/RAG features
@software-engineer         # General development
@security-compliance-engineer  # Security reviews
```

---

## 📋 Agent Registry

### Primary Agents (Project Leadership)

```yaml
- name: orchestrator-tech-lead
  mode: primary
  description: Technical leader for complex multi-domain projects
  coordinates: All 49 specialized agents
  use_for: Complex projects requiring multiple specialists
```

### Subagents (Specialized Tasks)

#### AI Core & LLM Operations (13 agents)

```yaml
- name: full-stack-ai-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: RAG, LLM integration, AI features, embeddings, agents

- name: paper2code-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Transform ML research papers into working code repositories (PaperCoder pipeline)
  command: /paper2code
  repo_path: C:\Users\amazon\paper2code-repo

- name: llm-ops-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Multi-provider LLM, cost optimization, fallbacks, caching

- name: rag-optimization-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Retrieval tuning, chunking, reranking, hybrid search

- name: vector-db-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Vector DB selection, indexing, scaling, queries

- name: embedding-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Embedding models, fine-tuning, batch processing

- name: agent-systems-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: AI agent architecture, tool registries, memory, planning

- name: ai-evaluation-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: LLM quality, hallucination detection, eval harness

- name: ai-safety-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Content moderation, guardrails, jailbreak prevention

- name: prompt-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Prompt optimization, structured outputs, token budgeting

- name: search-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Hybrid search, query understanding, ranking

- name: ai-research-eval-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: AI benchmarks, evaluation metrics, research

- name: ai-product-analyst
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: AI metrics, engagement analysis, cost per user
```

#### Data Engineering & ML (11 agents)

```yaml
- name: data-engineer
  mode: subagent
  use_for: Data pipelines, ETL, ingestion, normalization

- name: data-scientist
  mode: subagent
  use_for: Data analysis, ML models, statistical insights

- name: data-governance-engineer
  mode: subagent
  use_for: Data lineage, GDPR/CCPA, compliance

- name: data-privacy-engineer
  mode: subagent
  use_for: PII detection, anonymization, consent

- name: feature-store-engineer
  mode: subagent
  use_for: Feature stores, online/offline features

- name: database-engineer
  mode: subagent
  use_for: Schema design, migrations, query optimization

- name: mlops-engineer
  mode: subagent
  use_for: ML training, deployment, monitoring, retraining

- name: model-versioning-engineer
  mode: subagent
  use_for: Model registry, A/B testing, canary deployments

- name: web-scraper-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Web scraping with Scrapling, adaptive parsing, anti-bot bypass, crawling

- name: firecrawl-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: AI-powered scraping with Firecrawl, natural language extraction, MCP

- name: scrapy-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Production-scale crawling with Scrapy, pipelines, middleware, distributed scraping
```

#### Platform & Infrastructure (5 agents)

```yaml
- name: dev-ops-platform-engineer
  mode: subagent
  use_for: Kubernetes, CI/CD, autoscaling, Docker, Helm

- name: observability-engineer
  mode: subagent
  use_for: OpenTelemetry, tracing, metrics, dashboards, alerts

- name: sre-reliability-engineer
  mode: subagent
  use_for: SLOs, incident response, load testing, runbooks

- name: infrastructure-security-engineer
  mode: subagent
  use_for: IAM, network security, secrets, container hardening

- name: security-compliance-engineer
  mode: subagent
  use_for: Security audits, threat modeling, compliance
```

#### Application Development (8 agents)

```yaml
- name: software-engineer
  mode: subagent
  use_for: Backend APIs, business logic, database integration

- name: code-review-graph-engineer
  mode: subagent
  tools: [read, grep, glob, edit, write, bash]
  use_for: Knowledge graphs, impact analysis, blast radius, code structure mapping
  command: /code-review-graph
  repo_path: C:\Users\amazon\code-review-graph-repo

- name: api-engineer
  mode: subagent
  use_for: REST/GraphQL API design, OpenAPI, versioning

- name: frontend-engineer
  mode: subagent
  use_for: React/Vue/Next.js, components, accessibility

- name: developer-experience-engineer
  mode: subagent
  use_for: SDKs, API docs, developer portals

- name: qa-automation-engineer
  mode: subagent
  use_for: Test automation, CI/CD quality gates

- name: code-reviewer
  mode: subagent
  use_for: Code review, best practices, security checks

- name: test-engineer
  mode: subagent
  use_for: Test strategy, unit/integration/E2E tests
```

#### Integrations & Conversational (5 agents)

```yaml
- name: integration-engineer
  mode: subagent
  use_for: Third-party API integrations (CRM, ERP)

- name: webhook-integration-engineer
  mode: subagent
  use_for: Webhook handlers, event systems, retry logic

- name: chatbot-architect
  mode: subagent
  use_for: Chatbot architecture, session management

- name: conversation-designer
  mode: subagent
  use_for: Dialogue flows, persona design, UX

- name: ai-customer-support-engineer
  mode: subagent
  use_for: Support automation, ticket classification
```

#### Product, Growth & Cost (5 agents)

```yaml
- name: product-engineer
  mode: subagent
  use_for: PRDs, UX flows, success metrics

- name: growth-engineer
  mode: subagent
  use_for: Analytics, onboarding, lifecycle campaigns

- name: a-b-testing-engineer
  mode: subagent
  use_for: A/B test design, statistical analysis

- name: finops-engineer
  mode: subagent
  use_for: Cost optimization, unit economics, billing

- name: knowledge-base-engineer
  mode: subagent
  use_for: Knowledge management, doc optimization for RAG
```

#### Specialized Roles (5 agents)

```yaml
- name: accessibility-specialist
  mode: subagent
  use_for: WCAG compliance, screen readers, a11y

- name: i18n-specialist
  mode: subagent
  use_for: Internationalization, localization, RTL

- name: performance-optimizer
  mode: subagent
  use_for: Performance tuning, bottleneck analysis

- name: dependency-manager
  mode: subagent
  use_for: Dependency updates, security patches

- name: migration-specialist
  mode: subagent
  use_for: Database migrations, version upgrades
```

#### Documentation (1 agent)

```yaml
- name: documentation-writer
  mode: subagent
  use_for: Technical documentation, README, guides
```

---

## 🔄 Orchestration Patterns

### Pattern 1: Complex Project (Use @orchestrator-tech-lead)

```
User: "Build a production RAG chatbot"

@orchestrator-tech-lead coordinates:
  Phase 1: @data-engineer → @embedding-engineer → @vector-db-engineer
  Phase 2: @full-stack-ai-engineer → @rag-optimization-engineer
  Phase 3: @frontend-engineer → @chatbot-architect
  Phase 4: @ai-safety-engineer → @ai-evaluation-engineer
  Phase 5: @dev-ops-platform-engineer → @observability-engineer
```

### Pattern 2: Single Task (Direct Invocation)

```
User: "@security-compliance-engineer Review this auth code"
User: "@prompt-engineer Optimize this prompt for JSON output"
User: "@performance-optimizer Fix the slow database queries"
```

### Pattern 4: Web Scraping Pipeline (Use @orchestrator-tech-lead)

```
User: "Build a production web scraper for product data"

@orchestrator-tech-lead coordinates:
  Phase 1: @web-scraper-engineer → Build scraper with /scrape command
  Phase 2: @data-engineer → Build ingestion & validation pipeline
  Phase 3: @data-governance-engineer → Compliance review (robots.txt, GDPR)
  Phase 4: @api-engineer → Expose data via API (optional)
  Phase 5: @dev-ops-platform-engineer → Deploy with Docker
  Phase 6: @observability-engineer → Add monitoring & alerting
```

### Pattern 3: Spec-Driven Development (SDD)

For complex projects, use the 4-phase SDD workflow:

```
# Phase 1: Define WHAT and WHY
/specify "Build a production RAG chatbot for customer support"

# Phase 2: Define HOW (technical approach)
/sdd-plan "Build a production RAG chatbot for customer support"

# Phase 3: Break into actionable tasks
/tasks "Build a production RAG chatbot for customer support"

# Phase 4: Implement task by task
/implement "Build RAG chatbot --task T-001"
/implement "Build RAG chatbot --task T-002"
```

**SDD Agent Coordination:**
```
/specify  → @orchestrator-tech-lead + @product-engineer + @documentation-writer
/sdd-plan → @orchestrator-tech-lead + @architect + @tech-lead-ai-engineer
/tasks    → @orchestrator-tech-lead + @product-engineer + @software-engineer
/implement → @orchestrator-tech-lead + [specialized agent per task]
```

**Specialized Agent Assignment During Implementation:**
- Database tasks → @database-engineer
- API tasks → @api-engineer
- Frontend tasks → @frontend-engineer
- Web scraping tasks → @web-scraper-engineer + /scrape command
- AI/ML tasks → @full-stack-ai-engineer + @embedding-engineer + @vector-db-engineer
- Security tasks → @security-compliance-engineer
- DevOps tasks → @dev-ops-platform-engineer
- Test tasks → @test-engineer + @qa-automation-engineer

---

## 📁 File Locations

| Component | Path |
|-----------|------|
| Agent Files | `C:\Users\amazon\.qwen\agents\` |
| Skill Files | `C:\Users\amazon\.qwen\skills\kandil\agents\` |
| Global Config | `C:\Users\amazon\.qwen\AGENTS.md` |
| User Config | `C:\Users\amazon\CLAUDE.md` |
| Source | `K:\skills\agents\` |
| SDD Commands | `C:\Users\amazon\.qwen\commands\` |
| SDD Templates | `C:\Users\amazon\.qwen\templates\sdd\` |
| SDD Artifacts | `<project>/.qwen/specs/`, `<project>/.qwen/plans/`, `<project>/.qwen/tasks/` |

---

## ✅ Verification

Run to verify all agents are installed:

```batch
K:\skills\verify-installation.bat
```

Expected output:
```
[SUCCESS] All 53 Kandil agents are installed!
```

---

## 🔧 Maintenance

### Refresh Agent Cache
```batch
K:\skills\refresh-agents.bat
```

### Reinstall All Agents
```batch
K:\skills\setup-all.bat
```

### Setup Global Configuration
```batch
K:\skills\setup-global-agents.bat
```

---

**Last Updated:** March 30, 2026
**Status:** ✅ Production Ready - Globally Available
**SDD Integration:** ✅ Spec-Driven Development workflow enabled
