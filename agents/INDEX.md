# Kandil Agents Index

**Total Agents:** 50
**Status:** ✅ Production Ready - Globally Available
**Location:** `C:\Users\amazon\.qwen\agents`

---

## 🚀 Quick Usage

In Qwen Code, type `@` followed by agent name:

```
@orchestrator-tech-lead    # Complex projects
@full-stack-ai-engineer    # AI/LLM/RAG features
@software-engineer         # General development
@security-compliance-engineer  # Security reviews
```

---

## 📋 All Agents (53)

### Primary (1)
| Agent | Description |
|-------|-------------|
| `@orchestrator-tech-lead` | Technical leader for complex multi-domain projects |

### AI Core & LLM Operations (12)
| Agent | Description |
|-------|-------------|
| `@full-stack-ai-engineer` | End-to-end AI systems (RAG, LLM, agents, embeddings) |
| `@llm-ops-engineer` | LLM lifecycle, multi-provider, cost optimization |
| `@rag-optimization-engineer` | RAG retrieval tuning, chunking, reranking |
| `@vector-db-engineer` | Vector databases, indexing, hybrid search |
| `@embedding-engineer` | Embedding models, fine-tuning, batch processing |
| `@agent-systems-engineer` | AI agent architecture, tool registries, memory |
| `@ai-evaluation-engineer` | LLM quality, hallucination detection, RAGAs |
| `@ai-safety-engineer` | AI safety, content moderation, jailbreak prevention |
| `@prompt-engineer` | Prompt optimization, structured outputs, token budgeting |
| `@search-engineer` | Hybrid search, query understanding, ranking |
| `@ai-research-eval-engineer` | AI benchmarks, evaluation metrics, synthetic data |
| `@ai-product-analyst` | AI metrics, engagement analysis, cost per user |
| `@firecrawl-engineer` | AI-powered scraping, natural language extraction, MCP |

### Data Engineering & ML (10)
| Agent | Description |
|-------|-------------|
| `@data-engineer` | Data pipelines, ETL, ingestion, normalization |
| `@data-scientist` | Data analysis, ML models, statistical insights |
| `@data-governance-engineer` | Data lineage, GDPR/CCPA, compliance |
| `@data-privacy-engineer` | PII detection, anonymization, consent |
| `@feature-store-engineer` | Feature stores, online/offline features |
| `@database-engineer` | Schema design, migrations, query optimization |
| `@mlops-engineer` | ML training, deployment, monitoring, retraining |
| `@model-versioning-engineer` | Model registry, A/B testing, canary deployments |
| `@web-scraper-engineer` | Web scraping with Scrapling, adaptive parsing, crawling |
| `@scrapy-engineer` | Production-scale crawling with Scrapy, pipelines, middleware |

### Platform & Infrastructure (5)
| Agent | Description |
|-------|-------------|
| `@dev-ops-platform-engineer` | Kubernetes, CI/CD, autoscaling, Docker, Helm |
| `@observability-engineer` | OpenTelemetry, tracing, metrics, dashboards |
| `@sre-reliability-engineer` | SLOs, incident response, load testing, runbooks |
| `@infrastructure-security-engineer` | IAM, network security, secrets, container hardening |
| `@security-compliance-engineer` | Security audits, threat modeling, compliance |

### Application Development (7)
| Agent | Description |
|-------|-------------|
| `@software-engineer` | Backend APIs, business logic, database integration |
| `@api-engineer` | REST/GraphQL API design, OpenAPI, versioning |
| `@frontend-engineer` | React/Vue/Next.js, components, accessibility |
| `@developer-experience-engineer` | SDKs, API docs, developer portals |
| `@qa-automation-engineer` | Test automation, CI/CD quality gates |
| `@test-engineer` | Test strategy, unit/integration/E2E tests |
| `@code-reviewer` | Code review, best practices, security checks |

### Integrations & Conversational (5)
| Agent | Description |
|-------|-------------|
| `@integration-engineer` | Third-party API integrations (CRM, ERP) |
| `@webhook-integration-engineer` | Webhook handlers, event systems, retry logic |
| `@chatbot-architect` | Chatbot architecture, session management |
| `@conversation-designer` | Dialogue flows, persona design, UX |
| `@ai-customer-support-engineer` | Support automation, ticket classification |

### Product, Growth & Cost (5)
| Agent | Description |
|-------|-------------|
| `@product-engineer` | PRDs, UX flows, success metrics, AI vs rules |
| `@growth-engineer` | Analytics, onboarding, lifecycle campaigns, PLG |
| `@a-b-testing-engineer` | A/B test design, statistical analysis |
| `@finops-engineer` | Cost optimization, unit economics, billing |
| `@knowledge-base-engineer` | Knowledge management, doc optimization for RAG |

### Specialized Roles (6)
| Agent | Description |
|-------|-------------|
| `@accessibility-specialist` | WCAG compliance, screen readers, a11y |
| `@i18n-specialist` | Internationalization, localization, RTL |
| `@performance-optimizer` | Performance tuning, bottleneck analysis |
| `@dependency-manager` | Dependency updates, security patches |
| `@migration-specialist` | Database migrations, version upgrades |
| `@documentation-writer` | Technical documentation, README, guides |

---

## ✅ Agent Features

Every agent includes:

1. **Executable Commands** - `npm test`, `npm run build`, domain-specific
2. **Three-Tier Boundaries** - Always do / Ask first / Never do
3. **Code Style Examples** - Good vs Bad code comparisons
4. **Tech Stack Versions** - Node.js 18+, Python 3.10+, TypeScript 5+
5. **Project Structure** - Clear file/directory layout
6. **Success Metrics** - Measurable quality targets

---

## 📊 Agent File Format

Each agent file follows this structure:

```yaml
---
name: agent-name
description: Clear description of when to use
mode: subagent | primary
tools:
  - read_file
  - search_file_content
  - glob_files
  - edit_file
  - write_file
  - run_shell_command
---
```

### Required Sections
- `## 🎯 Your Role` - Agent's expertise and output
- `## 🛠️ Commands You Can Use` - Executable commands
- `## 📚 Project Knowledge` - Tech stack and file structure
- `## 🚧 Boundaries` - Always/Ask/Never guidelines
- `## 💻 Code Style Examples` - Good vs Bad code
- `## 📋 Core Responsibilities` - Detailed responsibilities
- `## 📊 Success Metrics` - Measurable targets

---

## 🔄 Orchestration Patterns

### Pattern 1: Complex Project (Use @orchestrator-tech-lead)

```
User: "Build a production RAG chatbot"

@orchestrator-tech-lead coordinates:
  Phase 1: @data-engineer → @embedding-engineer → @vector-db-engineer
  Phase 2: @rag-optimization-engineer → @prompt-engineer
  Phase 3: @full-stack-ai-engineer → @frontend-engineer
  Phase 4: @ai-safety-engineer → @ai-evaluation-engineer
  Phase 5: @dev-ops-platform-engineer → @observability-engineer
```

### Pattern 2: Single Task (Direct Invocation)

```
User: "@security-compliance-engineer Review this auth code"
User: "@prompt-engineer Optimize this prompt for JSON output"
User: "@performance-optimizer Fix the slow database queries"
```

---

## 🔧 Maintenance

### Verify Installation
```batch
K:\skills\verify-installation.bat
```

### Refresh Agent Cache
```batch
K:\skills\refresh-agents.bat
```

### Reinstall All Agents
```batch
K:\skills\setup-all.bat
```

---

**Last Updated:** March 28, 2026
**Status:** ✅ Production Ready - Globally Available
