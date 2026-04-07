---
name: firecrawl-workflow
description: Complete workflow for AI-powered web scraping using Firecrawl. Covers all endpoints (scrape, crawl, agent, search, map, interact), async job polling, Pydantic schemas, and cost optimization.
origin: Custom
version: "1.0.0"
---

# Firecrawl Workflow

## Overview

This workflow provides comprehensive guidance for web scraping using [Firecrawl](https://github.com/firecrawl/firecrawl) - an AI-powered web data API that delivers LLM-ready outputs with zero configuration.

**Key Capabilities:**
- Natural language extraction via `/agent` endpoint
- Clean markdown/JSON output (no post-processing needed)
- 96% web coverage including JS-rendered pages
- MCP integration for AI agent workflows
- Autonomous research and navigation

---

## Phase 1: Setup & Installation

### Install SDK

```bash
# Python SDK (recommended)
pip install firecrawl-py

# Node.js SDK
npm install @mendable/firecrawl-js

# CLI
npx -y firecrawl-cli@latest init --all --browser
```

### API Key Setup

```bash
# Cloud API (recommended)
export FIRECRAWL_API_KEY="fc-YOUR_API_KEY"

# Self-hosted (optional)
export FIRECRAWL_API_URL="http://localhost:3002"
```

### Verify Installation

```python
from firecrawl import Firecrawl
import os

app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])
doc = app.scrape("https://example.com", formats=["markdown"])
print(doc.markdown[:200])
```

---

## Phase 2: Choose the Right Endpoint

### Endpoint Selection Matrix

| Use Case | Endpoint | Speed | Cost |
|----------|----------|-------|------|
| Single page | `/scrape` | Fast | Low |
| Full site | `/crawl` | Medium | Medium |
| Research/AI | `/agent` | Slow | High |
| Search + extract | `/search` | Medium | Medium |
| URL discovery | `/map` | Fast | Low |
| Browser actions | `/interact` | Medium | Medium |
| Bulk URLs | `/batch_scrape` | Fast | Low |

---

## Phase 3: Implementation Patterns

### Pattern 1: Single Page Extraction

**Use for:** Individual URLs, articles, product pages

```python
from firecrawl import Firecrawl
import os

app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])

# Get clean markdown
doc = app.scrape("https://example.com/article", formats=["markdown"])
print(doc.markdown)

# Get structured JSON
doc = app.scrape("https://example.com/product", formats=["json"])
print(doc.json)

# Get everything
doc = app.scrape(
    "https://example.com/page",
    formats=["markdown", "html", "screenshot"]
)
```

### Pattern 2: Multi-Page Crawling

**Use for:** Documentation sites, blogs, catalogs

```python
# Crawl with limits and filtering
docs = app.crawl(
    "https://docs.example.com",
    limit=100,              # Max pages
    scrape_options={
        "formats": ["markdown"]
    }
)

# SDK handles async polling automatically
for doc in docs.data:
    print(f"{doc.metadata.sourceURL}: {doc.markdown[:100]}")
```

### Pattern 3: AI Autonomous Agent

**Use for:** Research, competitor analysis, natural language queries

```python
from pydantic import BaseModel, Field
from typing import List

class CompetitorSchema(BaseModel):
    competitors: List[dict] = Field(
        description="List with name, pricing, key features"
    )

result = app.agent(
    prompt="Find the top 5 competitors to Firecrawl, compare their pricing, and list key features",
    schema=CompetitorSchema,
    model="spark-1-mini"  # or "spark-1-pro" for complex tasks
)

print(result.data.competitors)
```

### Pattern 4: Web Search + Extract

**Use for:** Market research, finding information with full content

```python
# Search and get full page content
results = app.search(
    "best web scraping tools 2024",
    limit=10,
    scrape_options={"formats": ["markdown"]}
)

for r in results.data.web:
    print(f"{r.title}: {r.url}")
    print(f"Content: {r.markdown[:500]}...")
```

### Pattern 5: URL Discovery (Map)

**Use for:** Site structure analysis, crawl planning

```python
# Discover all URLs on a domain
urls = app.map("https://example.com")
print(f"Found {len(urls.links)} URLs")

# Filter by search term
urls = app.map("https://docs.example.com", search="api")
print(f"Found {len(urls.links)} API-related URLs")
```

### Pattern 6: AI Browser Actions (Interact)

**Use for:** Complex workflows requiring clicks, searches, navigation

```python
# Step 1: Scrape to get a scrape_id
doc = app.scrape("https://amazon.com")
scrape_id = doc.id

# Step 2: Interact with the page using natural language
result = app.interact(
    scrape_id=scrape_id,
    prompt="Search for 'mechanical keyboard' and click the first result"
)
print(result.markdown)

# Step 3: Continue interacting
result2 = app.interact(
    scrape_id=scrape_id,
    prompt="Scroll down and extract all product reviews"
)
```

### Pattern 7: Batch Scrape (Bulk URLs)

**Use for:** Thousands of URLs in parallel

```python
urls = [
    "https://example.com/page1",
    "https://example.com/page2",
    # ... thousands more
]

# Async batch processing
batch = app.batch_scrape(
    urls,
    options={"formats": ["markdown"]}
)

# Poll for results
for result in batch.results:
    print(f"{result.url}: {result.markdown[:200]}")
```

---

## Phase 4: Structured Output with Pydantic

### Define Your Schema

```python
from pydantic import BaseModel, Field
from typing import List, Optional

class Product(BaseModel):
    name: str = Field(description="Product name")
    price: float = Field(description="Price in USD", gt=0)
    rating: Optional[float] = Field(description="Average rating", ge=0, le=5)
    review_count: Optional[int] = Field(description="Number of reviews")
    url: str = Field(description="Product URL")

class Article(BaseModel):
    title: str = Field(description="Article title")
    author: Optional[str] = Field(description="Author name")
    published_date: Optional[str] = Field(description="Publication date")
    content: str = Field(description="Full article content")
    tags: Optional[List[str]] = Field(description="Article tags/categories")
```

### Use with Agent

```python
result = app.agent(
    prompt="Find all products on this page and extract their details",
    schema=Product
)
product = Product(**result.data)
```

---

## Phase 5: Async Job Polling (Crawl & Agent)

Crawl and Agent endpoints return job IDs. You must poll for results.

```python
import time

# Start crawl
crawl_job = app.crawl("https://docs.example.com", limit=50)
crawl_id = crawl_job.id

# Poll for status
while True:
    status = app.check_crawl_status(crawl_id)
    
    if status.status == "completed":
        docs = status.data
        print(f"Completed: {len(docs)} pages scraped")
        break
    elif status.status == "failed":
        print(f"Failed: {status.error}")
        break
    else:
        print(f"Progress: {status.completed}/{status.total}")
        time.sleep(5)  # Wait before next poll
```

---

## Phase 6: Error Handling & Resilience

```python
from firecrawl import Firecrawl
import os
import time

class FirecrawlScraper:
    def __init__(self, api_key=None, max_retries=3):
        self.app = Firecrawl(api_key=api_key or os.environ["FIRECRAWL_API_KEY"])
        self.max_retries = max_retries
    
    def scrape_with_retry(self, url, retries=0, **kwargs):
        try:
            doc = self.app.scrape(url, **kwargs)
            return doc
        except Exception as e:
            if retries < self.max_retries:
                wait = 2 ** retries
                print(f"Retry {retries+1}/{self.max_retries} in {wait}s: {e}")
                time.sleep(wait)
                return self.scrape_with_retry(url, retries + 1, **kwargs)
            else:
                print(f"Failed after {self.max_retries} retries: {url}")
                return None
    
    def crawl_with_poll(self, url, limit=100, timeout=300):
        """Start crawl and poll for completion."""
        job = self.app.crawl(url, limit=limit)
        crawl_id = job.id
        
        start = time.time()
        while time.time() - start < timeout:
            status = self.app.check_crawl_status(crawl_id)
            
            if status.status == "completed":
                return status.data
            elif status.status == "failed":
                raise Exception(f"Crawl failed: {status.error}")
            
            time.sleep(5)
        
        raise TimeoutError(f"Crawl timed out after {timeout}s")
```

---

## Phase 7: Cost Optimization

### Agent Model Selection

| Model | Cost | Use For |
|-------|------|---------|
| `spark-1-mini` | Low (60% cheaper) | Simple queries, single-page extraction |
| `spark-1-pro` | High | Complex research, multi-step navigation |

### Cost Reduction Tips

1. **Use `/scrape` instead of `/agent`** when you know the URL
2. **Limit crawl depth** with `limit` parameter
3. **Request only needed formats** (don't ask for screenshot if you need markdown)
4. **Use `/map` first** to filter URLs before crawling
5. **Batch operations** for large URL lists
6. **Self-host** for high-volume use cases

---

## Best Practices Checklist

- [ ] **Set API key** via environment variable (never hardcode)
- [ ] **Define Pydantic schemas** for structured, validated output
- [ ] **Choose correct endpoint** for the task (scrape vs crawl vs agent)
- [ ] **Poll async jobs** with timeout for crawl/agent endpoints
- [ ] **Limit formats** to only what you need
- [ ] **Implement retry logic** with exponential backoff
- [ ] **Monitor API usage** via dashboard
- [ ] **Use `spark-1-mini`** for simple tasks (60% cost savings)
- [ ] **Self-host** for high-volume/production use
- [ ] **Respect robots.txt** (Firecrawl respects by default)

---

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Timeout on crawl/agent | Poll with status check, set appropriate timeout |
| Agent returns wrong data | Improve prompt, add stricter Pydantic schema |
| Rate limited | Implement exponential backoff, check API tier |
| Missing content | Try different formats, check if JS-rendered |
| High costs | Use `spark-1-mini`, limit formats, batch operations |
| Self-hosted browsers fail | Check Docker resources, verify Playwright install |

---

## Related Skills

- `scrapling-workflow` - For code-first scraping with Scrapling
- `scrapy-workflow` - For production-scale crawling with Scrapy
- `scraping-framework-selector` - For choosing the right framework

---

**Framework:** [Firecrawl](https://github.com/firecrawl/firecrawl)
**API:** api.firecrawl.dev/v2
**License:** AGPL-3.0 (core), MIT (SDKs)
**Python:** 3.10+
