---
name: scrapling-workflow
description: Complete web scraping workflow using Scrapling framework. Covers installation, fetchers, spiders, adaptive parsing, and best practices.
origin: Custom
version: "1.0.0"
---

# Scrapling Workflow

## Overview

This workflow provides comprehensive guidance for web scraping using [Scrapling](https://github.com/D4Vinci/Scrapling) - an adaptive, high-performance Python web scraping framework with built-in anti-bot bypass capabilities.

**Key Capabilities:**
- Adaptive parsing that auto-relocates elements after site changes
- Three request engines (HTTP, Browser, Stealth)
- Async-native crawling with pause/resume
- ~2ms text extraction (700x faster than BS4)
- Built-in Cloudflare bypass

---

## Phase 1: Setup & Installation

### Install Scrapling

```bash
# Option 1: Base parser only (lightweight)
pip install scrapling

# Option 2: Full features (recommended)
pip install "scrapling[fetchers]" && scrapling install

# Option 3: Everything including AI/MCP
pip install "scrapling[all]"
```

### Verify Installation

```python
import scrapling
print(scrapling.__version__)
```

---

## Phase 2: Choose the Right Fetcher

### Fetcher Selection Matrix

| Site Type | Fetcher | Speed | Complexity |
|-----------|---------|-------|------------|
| Static HTML | `Fetcher` | Fastest | Simple |
| JS-rendered (React/Vue) | `DynamicFetcher` | Medium | Moderate |
| Cloudflare protected | `StealthyFetcher` | Slower | Complex |
| Multi-page crawl | Spider + any fetcher | Variable | Complex |

---

## Phase 3: Implementation Patterns

### Pattern 1: Simple HTTP Extraction

**Use for:** Static HTML pages, blogs, documentation

```python
from scrapling import Fetcher

# Initialize fetcher
fetcher = Fetcher(
    follow_redirects=True,
    timeout=30
)

# Fetch page
response = fetcher.get('https://example.com/articles')

# Extract data with CSS selectors
articles = response.css('.article-card')

results = []
for article in articles:
    results.append({
        'title': article.css_first('h2').text.strip(),
        'author': article.css_first('.author').text.strip(),
        'date': article.css_first('.date').text.strip(),
        'url': article.css_first('a')['href']
    })

print(f"Extracted {len(results)} articles")
```

### Pattern 2: JavaScript-Rendered Content

**Use for:** SPAs, infinite scroll, dynamic loading

```python
from scrapling import DynamicFetcher

fetcher = DynamicFetcher(
    headless=True,
    wait_for='.content-loaded'  # Wait for selector
)

page = fetcher.get('https://example.com/dynamic')

# Execute JavaScript if needed
page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
page.wait_for_timeout(2000)  # Wait for lazy load

# Extract after dynamic content loads
items = page.css('.dynamic-item')
```

### Pattern 3: Bypass Anti-Bot Protection

**Use for:** Cloudflare Turnstile/Interstitial, protected sites

```python
from scrapling import StealthyFetcher

fetcher = StealthyFetcher(
    headless=True,
    block_images=False,  # Sometimes needed for CF
    disable_webgl=False
)

# Automatically handles Cloudflare challenges
page = fetcher.get('https://protected-site.com')

# Extract normally after bypass
data = page.css_first('.protected-content').text
```

### Pattern 4: Multi-Page Crawl with Spider

**Use for:** Documentation sites, catalogs, blogs

```python
from scrapling import BaseSpider, Fetcher
import asyncio

class ProductSpider(BaseSpider):
    name = 'products'
    allowed_domains = ['example-shop.com']
    start_urls = ['https://example-shop.com/products']
    
    # Concurrency settings
    concurrent_requests = 10
    download_delay = 1.0  # Be respectful
    
    def __init__(self):
        self.fetcher = Fetcher()
        self.products = []
    
    async def parse(self, response):
        """Parse product listing page"""
        # Extract products
        items = response.css('.product-card')
        for item in items:
            product = {
                'name': item.css_first('.name').text.strip(),
                'price': item.css_first('.price').text.strip(),
                'url': item.css_first('a')['href']
            }
            self.products.append(product)
            yield product
        
        # Follow pagination
        next_page = response.css_first('a.next-page')
        if next_page:
            next_url = next_page['href']
            yield self.make_request(
                url=next_url,
                callback=self.parse
            )
    
    async def closed(self):
        """Called when spider finishes"""
        print(f"Crawled {len(self.products)} products")

# Run the spider
async def main():
    spider = ProductSpider()
    async for item in spider.stream():
        print(item)

asyncio.run(main())
```

### Pattern 5: Adaptive Parsing (Auto-Healing Selectors)

**Use for:** Sites that frequently change structure

```python
from scrapling import Fetcher

fetcher = Fetcher()

# First, learn the structure
response = fetcher.get('https://example.com')
target = response.css_first('.target-element')

# Scrapling can auto-relocate if structure changes
# Store the element's characteristics
fingerprint = target.fingerprint()

# Later, if site redesign happens:
response2 = fetcher.get('https://example.com')

# Find element even if selector changed
relocated = response2.relocate_element(fingerprint)
if relocated:
    print(f"Found it! Text: {relocated.text}")
```

---

## Phase 4: Advanced Features

### Session Management

```python
from scrapling import FetcherSession

# Persistent session with cookies
session = FetcherSession(
    persist_cookies=True,
    session_file='session.pkl'
)

# Login once
session.post('https://example.com/login', data={
    'username': 'user',
    'password': 'pass'
})

# Subsequent requests maintain session
profile = session.get('https://example.com/profile')
```

### Proxy Rotation

```python
from scrapling import Fetcher, ProxyRotator

rotator = ProxyRotator(
    strategy='cyclic',  # or 'random', 'custom'
    proxies=[
        'http://proxy1:8080',
        'http://proxy2:8080',
        'http://proxy3:8080'
    ]
)

fetcher = Fetcher(proxy=rotator.get_next())
response = fetcher.get('https://example.com')
```

### Pause & Resume Crawls

```python
from scrapling import BaseSpider

class LongCrawlSpider(BaseSpider):
    name = 'long-crawl'
    persist_path = 'crawl_checkpoint.json'
    
    # Automatically saves state on Ctrl+C
    # Resumes from checkpoint on next run
```

### MCP Integration (AI-Assisted Scraping)

```bash
# Install AI features
pip install "scrapling[ai]"

# Start MCP server
scrapling mcp
```

---

## Phase 5: Error Handling & Resilience

```python
from scrapling import Fetcher
import logging

logging.basicConfig(level=logging.INFO)

class RobustScraper:
    def __init__(self):
        self.fetcher = Fetcher(timeout=30)
        self.max_retries = 3
    
    def fetch_with_retry(self, url, retries=0):
        try:
            response = self.fetcher.get(url)
            
            if response.status_code == 403:
                # Switch to stealth fetcher if blocked
                return self.fetch_stealthy(url)
            
            if response.status_code != 200:
                raise Exception(f"HTTP {response.status_code}")
            
            return response
            
        except Exception as e:
            if retries < self.max_retries:
                logging.warning(f"Retry {retries+1}/{self.max_retries}: {url}")
                import time
                time.sleep(2 ** retries)  # Exponential backoff
                return self.fetch_with_retry(url, retries + 1)
            else:
                logging.error(f"Failed after {self.max_retries} retries: {url}")
                return None
    
    def fetch_stealthy(self, url):
        from scrapling import StealthyFetcher
        stealth = StealthyFetcher()
        return stealth.get(url)
```

---

## Phase 6: Data Validation & Output

```python
from pydantic import BaseModel, ValidationError
from typing import List, Optional

# Define expected data structure
class Product(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    url: str
    image_url: Optional[str] = None

def validate_and_save(raw_data: List[dict], output_file: str):
    """Validate extracted data and save to JSON"""
    valid_products = []
    errors = []
    
    for idx, item in enumerate(raw_data):
        try:
            product = Product(**item)
            valid_products.append(product.model_dump())
        except ValidationError as e:
            errors.append({'index': idx, 'error': str(e), 'data': item})
    
    # Save valid products
    import json
    with open(output_file, 'w') as f:
        json.dump(valid_products, f, indent=2)
    
    print(f"✓ Saved {len(valid_products)} valid products")
    if errors:
        print(f"✗ {len(errors)} items failed validation")
    
    return valid_products, errors
```

---

## Best Practices Checklist

- [ ] **Respect robots.txt** - Check site policies before scraping
- [ ] **Add delays** - Use `download_delay` between requests (1-3s minimum)
- [ ] **Set proper headers** - Include User-Agent and Accept headers
- [ ] **Handle errors gracefully** - Implement retry with exponential backoff
- [ ] **Validate output** - Check data completeness and format
- [ ] **Use adaptive selectors** - Prefer text/content-based matching over fragile CSS
- [ ] **Save progress** - Use checkpoint persistence for long crawls
- [ ] **Monitor rate limits** - Don't overload target servers
- [ ] **Test locally** - Save HTML samples for offline testing
- [ ] **Log everything** - Keep track of successes, failures, and changes

---

## Performance Tips

1. **Use Fetcher over DynamicFetcher** when possible (10-50x faster)
2. **Disable images** in browser fetchers to save bandwidth
3. **Use connection pooling** for multiple requests to same domain
4. **Batch writes** - Collect data in memory, write periodically
5. **Use async** for I/O-bound operations
6. **Cache responses** during development to avoid re-fetching

---

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| 403 Forbidden | Switch to `StealthyFetcher` |
| Empty results | Check if JS-rendered, use `DynamicFetcher` |
| Slow scraping | Disable images, use Fetcher if possible |
| Elements not found | Use `wait_for_selector` for dynamic content |
| CAPTCHAs | Use `StealthyFetcher` or add longer delays |
| Memory issues | Process in batches, use streaming mode |

---

## Related Skills

- `data-engineer-knowledge-ingestion` - For pipeline integration
- `ecc-api-design` - If exposing scraped data via API
- `ecc-security-scan` - Validate scraper code for security

---

**Framework:** [Scrapling by D4Vinci](https://github.com/D4Vinci/Scrapling)
**License:** BSD-3-Clause
**Stars:** 34.9k+
**Python:** 3.10+
