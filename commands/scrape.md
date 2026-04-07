---
description: Web scraping using Scrapling. Extract data from websites with adaptive parsing, anti-bot bypass, and crawling capabilities.
agents: ["web-scraper-engineer", "data-engineer"]
skills: ["scrapling-workflow"]
---

# /scrape - Web Scraping Command

## Usage

```
/scrape "Extract product names and prices from https://example.com/shop"
/scrape "Get all article titles from https://news-site.com" --dynamic
/scrape "Scrape job listings with descriptions" --stealth --output jobs.json
/scrape "Crawl all pages on https://docs-site.com and extract headings" --crawl
```

## What Happens

1. **Analyze Target** - Understand the website structure and data requirements
2. **Choose Fetcher** - Select appropriate request engine:
   - `Fetcher` - Standard HTTP (fast, for simple sites)
   - `DynamicFetcher` - Browser automation (for JS-rendered content)
   - `StealthyFetcher` - Anti-bot bypass (for Cloudflare/protected sites)
3. **Build Scraper** - Create adaptive scraping code with proper selectors
4. **Extract Data** - Run the scraper and collect results
5. **Format Output** - Return data in clean, structured format

## Scrapling Installation

Ensure Scrapling is installed before running:

```bash
# Base parser only
pip install scrapling

# Full features (recommended)
pip install "scrapling[fetchers]" && scrapling install

# Everything including AI/MCP features
pip install "scrapling[all]"
```

## Fetcher Selection Guide

| Website Type | Use This | Example |
|-------------|----------|---------|
| Simple HTML sites | `Fetcher` | Static pages, APIs, blogs |
| JS-rendered content | `DynamicFetcher` | React/Vue SPAs, infinite scroll |
| Cloudflare protected | `StealthyFetcher` | Sites with CF Turnstile/Interstitial |
| Multi-page crawl | Spider + any fetcher | Documentation, catalogs, listings |

## Output Format

Scraper results are returned as:

```json
{
  "success": true,
  "url": "https://example.com",
  "data": [
    {
      "field1": "value1",
      "field2": "value2"
    }
  ],
  "metadata": {
    "items_extracted": 10,
    "fetch_time_ms": 1250,
    "parse_time_ms": 45
  }
}
```

## Advanced Options

| Flag | Description |
|------|-------------|
| `--dynamic` | Use DynamicFetcher for JS-rendered pages |
| `--stealth` | Use StealthyFetcher for anti-bot bypass |
| `--crawl` | Enable multi-page crawling with spiders |
| `--output <file>` | Save results to JSON file |
| `--pages <n>` | Limit crawl to N pages |
| `--delay <ms>` | Add delay between requests |
| `--proxy <url>` | Use specified proxy |
| `--headers <json>` | Custom request headers |

## Scraping Patterns

### Single Page Extraction

```python
from scrapling import Fetcher

fetcher = Fetcher()
response = fetcher.get('https://example.com')

# Extract using CSS selectors
items = response.css('.product')
for item in items:
    name = item.css_first('.name').text
    price = item.css_first('.price').text
```

### Dynamic Content (Browser)

```python
from scrapling import DynamicFetcher

fetcher = DynamicFetcher(headless=True)
page = fetcher.get('https://example.com')

# Wait for dynamic content
page.wait_for_selector('.loaded-content')
data = page.css('.item')
```

### Protected Sites

```python
from scrapling import StealthyFetcher

fetcher = StealthyFetcher()
page = fetcher.get('https://protected-site.com')
# Automatically bypasses Cloudflare
```

### Multi-Page Crawl

```python
from scrapling import BaseSpider, Fetcher

class DocSpider(BaseSpider):
    name = 'doc-spider'
    start_urls = ['https://docs.example.com']
    
    async def parse(self, response):
        title = response.css_first('h1').text
        content = response.css_first('.content').text
        yield {'title': title, 'content': content}
        
        # Follow links
        for link in response.css('a[href]'):
            yield response.follow(link, callback=self.parse)
```

## Best Practices

1. **Respect robots.txt** - Always check site policies
2. **Add delays** - Be respectful to servers (use `--delay`)
3. **Handle errors** - Implement retry logic for failures
4. **Use adaptive selectors** - Let Scrapling auto-adjust to site changes
5. **Save progress** - Use pause/resume for long crawls
6. **Validate output** - Check data completeness and format

## Related Commands

- `/docs` - Research and documentation
- `/plan` - Plan complex scraping projects
- `/e2e` - Test scraping workflows
- `/verify` - Validate scraper code quality
