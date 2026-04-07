---
description: Web scraping using Firecrawl API. AI-powered extraction, natural language queries, zero-config crawling, and LLM-ready output.
agents: ["firecrawl-engineer", "full-stack-ai-engineer"]
skills: ["firecrawl-workflow"]
---

# /firecrawl - AI-Powered Web Scraping Command

## Usage

```
/firecrawl "Extract product prices from https://shop.example.com"
/firecrawl "Crawl all documentation pages from https://docs.example.com"
/firecrawl "Find the founders and funding of this startup" --agent
/firecrawl "Search for best mechanical keyboards and extract reviews" --search
/firecrawl "Map all URLs on https://example.com" --map
```

## What Happens

1. **Analyze Request** - Understand extraction type and target
2. **Choose Method** - Select appropriate Firecrawl endpoint:
   - `scrape` - Single URL, clean markdown/JSON
   - `crawl` - Multi-page recursive crawling
   - `agent` - Natural language autonomous extraction
   - `search` - Web search with content extraction
   - `map` - URL discovery
   - `interact` - AI-driven browser actions
3. **Execute** - Run via Firecrawl API (cloud or self-hosted)
4. **Format Output** - Return LLM-ready structured data

## Firecrawl Installation

```bash
# Python SDK
pip install firecrawl-py

# Node.js SDK
npm install @mendable/firecrawl-js

# CLI
npx -y firecrawl-cli@latest init --all --browser

# Self-hosted (Docker)
git clone https://github.com/firecrawl/firecrawl.git
cd firecrawl && docker-compose up -d
```

## API Key Setup

```bash
# Cloud API (recommended)
# Sign up at https://firecrawl.dev and get your API key
export FIRECRAWL_API_KEY="fc-YOUR_API_KEY"

# Self-hosted (no API key needed)
export FIRECRAWL_API_URL="http://localhost:3002"
```

## Endpoint Selection Guide

| Use Case | Use This | Example |
|----------|----------|---------|
| Single page extraction | `scrape` | Get pricing page, article, profile |
| Full site crawling | `crawl` | Documentation, blog, catalog |
| Autonomous research | `agent` | "Find competitors and their pricing" |
| Web search + extract | `search` | "Best laptops 2024 with reviews" |
| URL discovery | `map` | "List all pages on example.com" |
| Browser actions | `interact` | "Search for X and click Y" |

## Output Format

```json
{
  "success": true,
  "endpoint": "scrape",
  "data": {
    "markdown": "# Clean markdown content...",
    "metadata": {
      "title": "Page Title",
      "description": "Page description",
      "sourceURL": "https://example.com",
      "statusCode": 200
    }
  }
}
```

## Advanced Options

| Flag | Description |
|------|-------------|
| `--agent` | Use autonomous AI agent for extraction |
| `--search` | Search web and extract results |
| `--crawl` | Recursive site crawling |
| `--map` | URL discovery mode |
| `--interact "<prompt>"` | AI-driven browser actions |
| `--schema <file>` | Pydantic schema for structured output |
| `--formats <list>` | Output formats: markdown, html, json, screenshot |
| `--limit <n>` | Limit crawl/search results |
| `--output <file>` | Save results to file |

## Scraping Patterns

### Single Page Extraction

```python
from firecrawl import Firecrawl

app = Firecrawl(api_key="fc-YOUR_API_KEY")

# Get clean markdown
doc = app.scrape("https://example.com", formats=["markdown"])
print(doc.markdown)

# Get structured JSON
doc = app.scrape("https://example.com", formats=["json"])
print(doc.json)
```

### Crawl with Limit

```python
# Crawl entire site with limit
docs = app.crawl("https://docs.example.com", limit=50)

for doc in docs.data:
    print(f"{doc.metadata.sourceURL}: {doc.markdown[:100]}")
```

### AI Agent (Natural Language)

```python
from pydantic import BaseModel, Field
from typing import List

class CompetitorSchema(BaseModel):
    competitors: List[dict] = Field(description="List of competitors")

result = app.agent(
    prompt="Find the top 5 competitors to Firecrawl and their pricing",
    schema=CompetitorSchema
)
print(result.data)
```

### Web Search + Extract

```python
# Search and get full content from results
results = app.search("best web scraping tools 2024", limit=10)

for r in results.data.web:
    print(f"{r.title}: {r.url}")
    print(r.markdown[:200])  # Full page content
```

### URL Discovery

```python
# Find all URLs on a domain
urls = app.map("https://example.com", search="docs")
print(urls.links)  # Filtered by search term
```

### AI Browser Actions

```python
# Step 1: Scrape to get scrape_id
doc = app.scrape("https://amazon.com")
scrape_id = doc.id

# Step 2: Interact with the page
result = app.interact(
    scrape_id=scrape_id,
    prompt="Search for 'mechanical keyboard' and click the first result"
)
print(result.markdown)
```

### Structured Output with Pydantic

```python
from pydantic import BaseModel, Field

class ProductSchema(BaseModel):
    name: str = Field(description="Product name")
    price: float = Field(description="Price in USD")
    rating: float = Field(description="Average rating")
    reviews_count: int = Field(description="Number of reviews")

result = app.scrape(
    "https://shop.example.com/product",
    formats=["json"],
    schema=ProductSchema
)
product = ProductSchema(**result.json)
```

## Best Practices

1. **Use cloud API for production** - Better coverage, zero infra management
2. **Set appropriate formats** - Don't request what you don't need
3. **Use schemas for structure** - Pydantic ensures consistent output
4. **Leverage agent for research** - Let AI navigate and find what you need
5. **Respect robots.txt** - Firecrawl respects by default
6. **Batch operations** - Use batch_scrape for large URL lists
7. **Monitor usage** - Check API dashboard for rate limits

## Related Commands

- `/scrape` - Scrapling-based scraping (code-first, adaptive parsing)
- `/scraping` - Scrapy-based crawling (production-scale pipelines)
- `/docs` - Documentation research
- `/plan` - Plan complex scraping projects
