---
name: scraping-framework-selector
description: Decision guide for choosing the right scraping framework: Scrapling (adaptive parsing), Firecrawl (AI-powered), or Scrapy (production-scale crawling).
origin: Custom
version: "1.0.0"
---

# Scraping Framework Selection Guide

## Quick Decision Matrix

| Your Need | Use This | Why |
|-----------|----------|-----|
| "I need to scrape a single page reliably" | **Scrapling** | Fast, adaptive parsing, handles site changes |
| "I need to extract data using natural language" | **Firecrawl** | AI understands what you want, zero selectors |
| "I need to crawl 10,000+ pages" | **Scrapy** | Async architecture, distributed, production-grade |
| "The site has Cloudflare protection" | **Scrapling** | Built-in Cloudflare bypass |
| "I need LLM-ready clean data" | **Firecrawl** | Native markdown output, Pydantic schemas |
| "I need a full data pipeline with validation" | **Scrapy** | Items, pipelines, middleware ecosystem |
| "I'm building an AI agent that needs web data" | **Firecrawl** | MCP integration, agent endpoint |
| "I need to handle JS-rendered content" | **Any** | All support browser automation |
| "I need structured, recurring extraction" | **Scrapy** | Scheduled, monitored, deployed crawls |
| "I'm prototyping quickly" | **Scrapling** or **Firecrawl** | Minimal setup, immediate results |

---

## Framework Comparison

### Scrapling (Code-First, Adaptive)

**Best for:** Developers who write scraping code and want resilience to site changes.

| Aspect | Details |
|--------|---------|
| **Speed** | ~2ms text extraction (700x faster than BS4) |
| **Anti-Bot** | Built-in Cloudflare bypass, stealth fetcher |
| **Selectors** | CSS, XPath, text search, regex, adaptive relocation |
| **Learning** | Auto-relocates elements after site redesigns |
| **Architecture** | Single-process Python library |
| **Cost** | Free, open-source (BSD-3-Clause) |
| **Setup** | `pip install scrapling[all]` |
| **Scale** | Single to hundreds of pages per run |

**When to Choose:**
- You want to write and control the scraping code
- Sites frequently change their HTML structure
- You need to bypass Cloudflare or similar protections
- Performance is critical (fast extraction)
- You're building a custom scraping solution

**Command:** `/scrape "Extract X from URL"`

---

### Firecrawl (AI-Powered, Zero-Config)

**Best for:** AI agents, researchers, and users who want natural language extraction.

| Aspect | Details |
|--------|---------|
| **Coverage** | 96% web coverage (including heavily JS-rendered) |
| **AI** | Natural language `/agent` endpoint, MCP integration |
| **Output** | Clean markdown, JSON, HTML, screenshots |
| **Architecture** | Cloud API or self-hosted (Docker) |
| **Cost** | Cloud API (pay-per-use), self-hosted (free) |
| **Setup** | `pip install firecrawl-py` + API key |
| **Scale** | Thousands to millions of pages (cloud) |
| **Latency** | P95 of 3.4s across millions of pages |

**When to Choose:**
- You want to describe what you need in plain English
- You're building an AI agent that needs web data
- You want LLM-ready markdown output
- You don't want to maintain selectors or parsing logic
- You need web search + content extraction
- You need autonomous research capabilities

**Command:** `/firecrawl "Find X on the web"`

---

### Scrapy (Production-Scale, Pipeline)

**Best for:** Large-scale, structured data extraction with full pipeline control.

| Aspect | Details |
|--------|---------|
| **Speed** | Extremely fast async crawling (Twisted) |
| **Architecture** | Full framework: spiders, middleware, pipelines |
| **Ecosystem** | Rich plugin ecosystem (scrapy-redis, scrapy-playwright) |
| **Deployment** | Scrapyd, Docker, Scrapy Cloud |
| **Cost** | Free, open-source (BSD-3-Clause) |
| **Setup** | `pip install scrapy` |
| **Scale** | Millions of pages, distributed workers |
| **Monitoring** | Built-in stats, logging, monitoring |

**When to Choose:**
- You need to crawl 10,000+ pages regularly
- You need a full data pipeline (validation, storage, export)
- You need distributed/multi-worker crawling
- You need scheduled, monitored, production crawls
- You need complex middleware (proxies, retries, spoofing)
- You want full control over the crawling process

**Command:** `/scraping "Build a production crawler"`

---

## Framework Combination Patterns

### Pattern 1: Scrapling + Firecrawl

**Use when:** You need both code-precision and AI flexibility.

```
Scrapling → High-value, frequently-changing targets (pricing, inventory)
Firecrawl → Research, competitor analysis, content extraction
```

**Example:** E-commerce monitoring
- Scrapling monitors your target products (fast, reliable)
- Firecrawl researches competitor sites (AI-powered, flexible)

### Pattern 2: Scrapling + Scrapy

**Use when:** You need adaptive parsing within a large-scale crawl.

```
Scrapy → Orchestrates the crawl (scheduling, queue, distribution)
Scrapling → Parses individual pages (adaptive selectors)
```

**Example:** Use Scrapy for crawling infrastructure, Scrapling for parsing complex pages.

### Pattern 3: Firecrawl + Scrapy

**Use when:** You need AI extraction for complex pages and structured crawling for the rest.

```
Scrapy → Bulk crawl of predictable, structured pages
Firecrawl → Complex pages needing AI understanding
```

**Example:** News aggregation
- Scrapy crawls article listing pages (predictable structure)
- Firecrawl extracts full articles (varied formats, AI summarization)

### Pattern 4: All Three (Enterprise)

**Use when:** You have diverse scraping needs across many different targets.

```
Scrapling → Protected sites, high-value targets
Firecrawl → Research, AI agent workflows, LLM data
Scrapy → Large-scale, scheduled, production pipelines
```

**Example:** Market intelligence platform
- Scrapling scrapes competitor pricing (anti-bot bypass)
- Firecrawl researches market trends and news (AI agent)
- Scrapy crawls review sites and forums at scale (scheduled)

---

## Decision Flowchart

```
Start: What do you need?
  │
  ├─ "Extract data from a URL right now"
  │   ├─ Need to bypass protection? → Scrapling (StealthyFetcher)
  │   ├─ Need clean markdown for LLM? → Firecrawl (/scrape)
  │   └─ Simple static page? → Scrapling (Fetcher)
  │
  ├─ "Crawl an entire website"
  │   ├─ < 100 pages? → Scrapling (Spider)
  │   ├─ 100 - 10,000 pages? → Scrapy (single worker)
  │   └─ > 10,000 pages? → Scrapy (distributed with Redis)
  │
  ├─ "Research and find information"
  │   └─ Natural language query → Firecrawl (/agent)
  │
  ├─ "Build a production data pipeline"
  │   ├─ Need middleware/pipelines? → Scrapy
  │   └─ Need AI understanding? → Firecrawl + Scrapy
  │
  └─ "Build an AI agent with web data"
      └─ MCP, natural language → Firecrawl
```

---

## Cost Comparison

| Framework | Cost Model | Est. Cost (10k pages) | Est. Cost (1M pages) |
|-----------|-----------|----------------------|---------------------|
| Scrapling | Free (your infrastructure) | $0 + infra | $0 + infra |
| Firecrawl Cloud | Pay-per-page | ~$10-50 | ~$1,000-5,000 |
| Firecrawl Self-Hosted | Your infra + AI costs | ~$5-20 | ~$500-2,000 |
| Scrapy | Free (your infrastructure) | $0 + infra | $0 + infra |

**Note:** Infra costs depend on your setup. Firecrawl cloud includes proxy rotation, anti-bot bypass, and AI processing.

---

## Performance Comparison

| Metric | Scrapling | Firecrawl | Scrapy |
|--------|-----------|-----------|--------|
| Single page extraction | ~2ms | ~3.4s (P95) | ~50-200ms |
| 100 pages | ~1-5s | ~5-10min | ~1-5min |
| 10,000 pages | ~10-30min | ~1-3 hours | ~30min-2h |
| 1M pages | Not ideal | ~days (cloud) | ~hours-days (distributed) |
| Memory usage | Low | N/A (cloud) | Medium |
| CPU usage | Low | N/A (cloud) | Medium-High |

---

## Learning Curve

| Framework | Time to First Scrape | Time to Production | Complexity |
|-----------|---------------------|-------------------|------------|
| Scrapling | 5 minutes | 1-2 hours | Low-Medium |
| Firecrawl | 2 minutes | 10 minutes | Low |
| Scrapy | 30 minutes | 1-3 days | Medium-High |

---

## When NOT to Use Each

### Don't Use Scrapling When:
- You need to crawl 100,000+ pages (use Scrapy)
- You want natural language extraction (use Firecrawl)
- You need a full data pipeline with middleware (use Scrapy)

### Don't Use Firecrawl When:
- You need fine-grained control over selectors (use Scrapling/Scrapy)
- You're on a tight budget with high volume (use Scrapling/Scrapy)
- You need offline/self-contained scraping (use Scrapling/Scrapy)

### Don't Use Scrapy When:
- You need to scrape a single page quickly (use Scrapling/Firecrawl)
- You need anti-bot bypass out of the box (use Scrapling/Firecrawl)
- You want LLM-ready markdown output (use Firecrawl)

---

## Quick Start Commands

```bash
# Scrapling
/scrape "Extract prices from https://shop.example.com"
python scrapling.py init my-scraper

# Firecrawl
/firecrawl "Find the top 5 competitors and their pricing" --agent
pip install firecrawl-py

# Scrapy
/scraping "Build a product crawler with pagination"
pip install scrapy && scrapy startproject myproject
```

---

**Frameworks:** [Scrapling](https://github.com/D4Vinci/Scrapling) | [Firecrawl](https://github.com/firecrawl/firecrawl) | [Scrapy](https://github.com/scrapy/scrapy)
