---
name: scrapy-workflow
description: Complete workflow for production-scale web crawling using Scrapy framework. Covers project setup, spider development, middleware, pipelines, settings tuning, and deployment.
origin: Custom
version: "1.0.0"
---

# Scrapy Workflow

## Overview

This workflow provides comprehensive guidance for web crawling using [Scrapy](https://github.com/scrapy/scrapy) - a fast, high-level, open-source web scraping and crawling framework.

**Key Capabilities:**
- Async networking with Twisted (non-blocking I/O)
- Built-in CSS/XPath selectors via parsel
- Extensible middleware and pipeline architecture
- Native export to JSON, CSV, XML, JSON Lines
- Distributed crawling with Scrapy-Redis
- Production deployment with Scrapyd/Docker

---

## Phase 1: Setup & Installation

### Install Scrapy

```bash
# Core installation
pip install scrapy

# With Playwright support
pip install scrapy playwright
playwright install --with-deps chromium

# For distributed crawling
pip install scrapy-redis

# For deployment
pip install scrapyd
```

### Verify Installation

```bash
scrapy version
# Should output: Scrapy X.X.X
```

### Create Project

```bash
scrapy startproject myproject
cd myproject
```

---

## Phase 2: Understand the Architecture

### Scrapy Data Flow

```
Spider → Requests → Scheduler → Downloader → Response → Spider
                                                    ↓
                                              Items → Pipeline → Storage
                                                    ↓
                                          New Requests → Scheduler
```

### Core Components

| Component | Purpose |
|-----------|---------|
| **Spider** | User-defined crawling logic, selectors |
| **Scheduler** | Request queue, deduplication |
| **Downloader** | HTTP fetching with middleware |
| **Item Pipeline** | Data validation, cleaning, storage |
| **Middleware** | Request/response interception (proxies, retries) |

---

## Phase 3: Implementation Patterns

### Pattern 1: Basic Spider

**Use for:** Simple sites with predictable structure

```python
import scrapy

class ProductSpider(scrapy.Spider):
    name = "products"
    allowed_domains = ["shop.example.com"]
    start_urls = ["https://shop.example.com/products"]
    
    def parse(self, response):
        for product in response.css(".product-card"):
            yield {
                "name": product.css(".name::text").get("").strip(),
                "price": product.css(".price::text").get("").strip(),
                "url": response.urljoin(product.css("a::attr(href)").get("")),
            }
        
        # Follow pagination
        next_page = response.css("a.next::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

### Pattern 2: CrawlSpider (Rule-Based)

**Use for:** Sites with consistent link patterns

```python
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor

class DocSpider(CrawlSpider):
    name = "docs"
    allowed_domains = ["docs.example.com"]
    start_urls = ["https://docs.example.com"]
    
    rules = (
        # Follow article links and parse
        Rule(
            LinkExtractor(allow=(r"/article/")),
            callback="parse_article",
        ),
        # Follow category links without parsing
        Rule(
            LinkExtractor(allow=(r"/category/")),
            follow=True,
        ),
    )
    
    def parse_article(self, response):
        yield {
            "title": response.css("h1::text").get(""),
            "content": response.css(".article-body::text").getall(),
            "url": response.url,
        }
```

### Pattern 3: With Proxy Middleware

**Use for:** Sites with rate limiting or IP blocks

```python
# middlewares.py
import random

class RotatingProxyMiddleware:
    def __init__(self, proxies):
        self.proxies = proxies
    
    @classmethod
    def from_crawler(cls, crawler):
        proxies = crawler.settings.getlist("PROXY_LIST")
        return cls(proxies)
    
    def process_request(self, request, spider):
        request.meta["proxy"] = random.choice(self.proxies)
        spider.logger.debug(f"Using proxy: {request.meta['proxy']}")

# settings.py
PROXY_LIST = [
    "http://proxy1:8080",
    "http://proxy2:8080",
    "http://proxy3:8080",
]

DOWNLOADER_MIDDLEWARES = {
    "myproject.middlewares.RotatingProxyMiddleware": 543,
}
```

### Pattern 4: Validation Pipeline

**Use for:** Data cleaning and quality control

```python
# pipelines.py
from scrapy.exceptions import DropItem
import re

class PriceValidationPipeline:
    def process_item(self, item, spider):
        # Drop items without price
        if not item.get("price"):
            raise DropItem(f"Missing price: {item.get('name', 'unknown')}")
        
        # Clean price value
        price = item["price"]
        price = re.sub(r"[^0-9.]", "", price)
        
        try:
            item["price"] = float(price)
        except ValueError:
            raise DropItem(f"Invalid price: {item['price']}")
        
        # Validate price range
        if item["price"] <= 0 or item["price"] > 1_000_000:
            raise DropItem(f"Unreasonable price: {item['price']}")
        
        return item

class DeduplicationPipeline:
    def __init__(self):
        self.seen_urls = set()
    
    def process_item(self, item, spider):
        if item.get("url") in self.seen_urls:
            raise DropItem(f"Duplicate: {item['url']}")
        self.seen_urls.add(item["url"])
        return item
```

### Pattern 5: Playwright Integration (JS Rendering)

**Use for:** JavaScript-rendered single-page applications

```python
# settings.py
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"

DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}

PLAYWRIGHT_BROWSER_TYPE = "chromium"
PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT = 30000

# spider.py
class DynamicSpider(scrapy.Spider):
    name = "dynamic"
    
    def start_requests(self):
        yield scrapy.Request(
            "https://example.com/dynamic",
            meta={"playwright": True},
        )
    
    async def parse(self, response):
        page = response.meta["playwright_page"]
        
        # Wait for content
        await page.wait_for_selector(".loaded-content")
        
        # Scroll to load lazy content
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.wait_for_timeout(2000)
        
        # Extract normally
        for item in response.css(".item"):
            yield {
                "title": item.css(".title::text").get(""),
            }
        
        await page.close()
```

### Pattern 6: Distributed Crawling (Scrapy-Redis)

**Use for:** Multi-worker, large-scale crawls

```python
# settings.py
SCHEDULER = "scrapy_redis.scheduler.Scheduler"
DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"
REDIS_URL = "redis://localhost:6379"
SCHEDULER_PERSIST = True
SCHEDULER_QUEUE_CLASS = "scrapy_redis.queue.PriorityQueue"

# spider.py
from scrapy_redis.spiders import RedisSpider

class DistributedSpider(RedisSpider):
    name = "distributed"
    redis_key = "distributed:start_urls"
    
    def parse(self, response):
        # Same parsing logic as normal spider
        for item in response.css(".item"):
            yield {
                "data": item.css("::text").get(""),
            }
        
        # Follow links - they go to Redis queue
        for link in response.css("a::attr(href)").getall():
            yield response.follow(link, self.parse)
```

---

## Phase 4: Settings Configuration

### Essential Settings

```python
# settings.py

# Bot identity
BOT_NAME = "myproject"
USER_AGENT = "MyProject/1.0 (+https://example.com/bot)"

# Concurrency
CONCURRENT_REQUESTS = 16
CONCURRENT_REQUESTS_PER_DOMAIN = 8
DOWNLOAD_DELAY = 2  # Be respectful

# AutoThrottle (adaptive delays)
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 60
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# Politeness
ROBOTSTXT_OBEY = True
RETRY_ENABLED = True
RETRY_TIMES = 3

# Caching (development only)
# HTTPCACHE_ENABLED = True
# HTTPCACHE_DIR = "httpcache"

# Export
FEED_FORMAT = "json"
FEED_URI = "data/output.json"
FEED_EXPORT_INDENT = 2

# Logging
LOG_LEVEL = "INFO"
LOG_FILE = "scrapy.log"

# Middlewares
# DOWNLOADER_MIDDLEWARES = {
#     "myproject.middlewares.ProxyMiddleware": 543,
# }

# Pipelines
# ITEM_PIPELINES = {
#     "myproject.pipelines.PriceValidationPipeline": 300,
#     "myproject.pipelines.DatabasePipeline": 400,
# }
```

---

## Phase 5: Testing & Debugging

### Interactive Shell

```bash
# Test selectors on a live page
scrapy shell "https://example.com/products"

# In the shell:
response.css(".product-card").getall()
response.css(".name::text").get()
response.xpath("//div[@class='price']/text()").get()
```

### Unit Tests

```python
# tests/test_spiders.py
import pytest
from scrapy.http import HtmlResponse

def test_product_parsing():
    from myproject.spiders.products import ProductSpider
    
    spider = ProductSpider()
    
    html = """
    <div class="product-card">
        <h2 class="name">Widget</h2>
        <span class="price">$19.99</span>
        <a href="/products/widget">View</a>
    </div>
    """
    
    response = HtmlResponse(
        url="https://example.com",
        body=html.encode(),
        encoding="utf-8"
    )
    
    results = list(spider.parse(response))
    assert len(results) == 1
    assert results[0]["name"] == "Widget"
    assert "$19.99" in results[0]["price"]
```

### Spider Contracts

```python
# tests/contracts.py
from scrapy.contracts.default import Contract

class HasItemsContract(Contract):
    """Verify that spider yields items."""
    name = "returns_items"
    
    def adjust_request_args(self, args):
        return {}
    
    def check_output(self, response):
        return len(response) > 0

# In spider:
def parse(self, response):
    """
    @returns items 1 100
    @scrapes name price url
    """
    yield {...}
```

### Run Checks

```bash
scrapy check
```

---

## Phase 6: Deployment

### Scrapyd (REST API)

```bash
# Install
pip install scrapyd scrapyd-client

# Configure
# scrapy.cfg
[deploy]
url = http://localhost:6800/
project = myproject

# Deploy
scrapyd-deploy

# Schedule crawl
curl http://localhost:6800/schedule.json \
  -d project=myproject -d spider=products

# Check status
curl http://localhost:6800/jobs.json
```

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["scrapy", "crawl", "products", "-o", "data/output.json"]
```

---

## Phase 7: Monitoring

### Built-in Stats

```bash
# View stats after crawl
scrapy crawl products --stats

# Key stats to monitor:
# - downloader/request_count
# - downloader/response_status_count/200
# - item_scraped_count
# - log_count/WARNING
# - log_count/ERROR
# - finish_reason
```

### Stats in Pipeline

```python
class StatsPipeline:
    def process_item(self, item, spider):
        # Track custom metrics
        spider.crawler.stats.inc_value("items/scraped")
        spider.crawler.stats.inc_value(f"domain/{spider.name}")
        return item
```

---

## Best Practices Checklist

- [ ] **Define Items** - Use `scrapy.Item` or Pydantic for data consistency
- [ ] **Set DOWNLOAD_DELAY** - Minimum 1-3s between requests
- [ ] **Enable ROBOTSTXT_OBEY** - Respect site policies
- [ ] **Enable AutoThrottle** - Adaptive delays based on server load
- [ ] **Use pipelines** - Validate, clean, and deduplicate data
- [ ] **Implement retry** - Handle transient failures (RETRY_TIMES)
- [ ] **Test with scrapy shell** - Verify selectors before crawling
- [ ] **Log errors** - Set LOG_LEVEL and LOG_FILE
- [ ] **Use allowed_domains** - Prevent crawling outside target
- [ ] **Monitor stats** - Check `--stats` after each crawl

---

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Spider returns no items | Check selectors with `scrapy shell` |
| 403 Forbidden | Add User-Agent, use proxy middleware |
| Too many duplicates | Add DeduplicationPipeline |
| Crawl too slow | Increase CONCURRENT_REQUESTS, enable AutoThrottle |
| Memory issues | Reduce CONCURRENT_REQUESTS, process items in pipeline |
| JS content missing | Use scrapy-playwright integration |
| Rate limited | Increase DOWNLOAD_DELAY, use rotating proxies |
| Crawling forever | Set DEPTH_LIMIT, use allowed_domains |

---

## Related Skills

- `scrapling-workflow` - For adaptive parsing with Scrapling
- `firecrawl-workflow` - For AI-powered extraction with Firecrawl
- `scraping-framework-selector` - For choosing the right framework

---

**Framework:** [Scrapy](https://github.com/scrapy/scrapy)
**Python:** 3.10+
**License:** BSD-3-Clause
**Maintained by:** Zyte (formerly Scrapinghub)
