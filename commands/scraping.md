---
description: Large-scale web crawling using Scrapy framework. Production-grade pipelines, middleware, item processing, and distributed crawling.
agents: ["scrapy-engineer", "data-engineer"]
skills: ["scrapy-workflow"]
---

# /scraping - Production Web Crawling Command

## Usage

```
/scraping "Crawl https://shop.example.com and extract products"
/scraping "Build a spider for job listings with pagination"
/scraping "Set up a Scrapy project with proxy rotation" --advanced
/scraping "Deploy Scrapy spider to production" --deploy
```

## What Happens

1. **Analyze Requirements** - Understand target, data structure, scale
2. **Choose Architecture** - Select appropriate Scrapy components:
   - `Spider` - Crawling logic and parsing
   - `Middleware` - Request/response processing (proxies, retries)
   - `Pipeline` - Item processing (validation, storage, dedup)
   - `Scheduler` - Request queue management
3. **Build Pipeline** - Create Scrapy project with proper architecture
4. **Configure & Deploy** - Set up settings, logging, monitoring

## Scrapy Installation

```bash
# Core installation
pip install scrapy

# With Playwright support
pip install scrapy playwright
playwright install

# Production deployment
pip install scrapyd  # REST API for spider deployment
pip install scrapy-redis  # Distributed crawling
```

## Architecture Selection Guide

| Use Case | Architecture | Components |
|----------|-------------|------------|
| Simple site | Basic Spider | Spider + Settings |
| Production pipeline | Full Project | Spider + Middleware + Pipeline |
| JS-rendered sites | Playwright | Spider + scrapy-playwright |
| Distributed crawl | Scrapy + Redis | Multiple workers + shared queue |
| Scheduled jobs | Scrapyd | REST API + cron/systemd |

## Output Format

```json
{
  "success": true,
  "spider": "product-spider",
  "stats": {
    "items_scraped": 1500,
    "pages_crawled": 75,
    "errors": 3,
    "duration_seconds": 120
  },
  "output": "data/products.json"
}
```

## Advanced Options

| Flag | Description |
|------|-------------|
| `--advanced` | Include middleware, pipelines, proxies |
| `--deploy` | Deploy to Scrapyd or cloud |
| `--distributed` | Set up Scrapy-Redis for distributed crawling |
| `--playwright` | Enable JavaScript rendering |
| `--output <file>` | Save results to file |
| `--settings <file>` | Custom settings file |

## Crawling Patterns

### Basic Spider

```python
import scrapy

class ProductSpider(scrapy.Spider):
    name = "products"
    start_urls = ["https://shop.example.com/products"]
    
    def parse(self, response):
        for product in response.css(".product-card"):
            yield {
                "name": product.css(".name::text").get(),
                "price": product.css(".price::text").get(),
                "url": response.urljoin(product.css("a::attr(href)").get())
            }
        
        # Follow pagination
        next_page = response.css("a.next::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

### Run Spider

```bash
# Run and save to JSON
scrapy crawl products -o products.json

# Run with custom settings
scrapy crawl products -s DOWNLOAD_DELAY=2 -o products.csv

# Run with logging
scrapy crawl products -L INFO
```

### With Middleware (Proxy Rotation)

```python
# middlewares.py
import random

class ProxyMiddleware:
    def process_request(self, request, spider):
        proxies = [
            "http://proxy1:8080",
            "http://proxy2:8080",
            "http://proxy3:8080"
        ]
        request.meta["proxy"] = random.choice(proxies)
```

### With Pipeline (Validation & Storage)

```python
# pipelines.py
from itemadapter import ItemAdapter
import sqlite3

class ValidationPipeline:
    def process_item(self, item, spider):
        # Drop items without price
        if not item.get("price"):
            raise DropItem(f"Missing price: {item['name']}")
        
        # Clean data
        item["price"] = float(item["price"].replace("$", ""))
        return item

class DatabasePipeline:
    def open_spider(self, spider):
        self.connection = sqlite3.connect("products.db")
        self.cursor = self.connection.cursor()
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                name TEXT, price REAL, url TEXT
            )
        """)
    
    def close_spider(self, spider):
        self.connection.commit()
        self.connection.close()
    
    def process_item(self, item, spider):
        self.cursor.execute(
            "INSERT INTO products VALUES (?, ?, ?)",
            (item["name"], item["price"], item["url"])
        )
        return item
```

### Playwright Integration (JS Rendering)

```python
# settings.py
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
DOWNLOAD_HANDLERS = {
    "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
    "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
}
PLAYWRIGHT_BROWSER_TYPE = "chromium"

# spider.py
class DynamicSpider(scrapy.Spider):
    name = "dynamic"
    
    def start_requests(self):
        yield scrapy.Request(
            "https://example.com/dynamic",
            meta={"playwright": True},
        )
    
    async def parse(self, response):
        # Wait for dynamic content
        page = response.meta["playwright_page"]
        await page.wait_for_selector(".loaded-content")
        
        content = await page.content()
        # Parse with CSS/XPath as normal
```

### Distributed Crawling (Scrapy-Redis)

```python
# settings.py
SCHEDULER = "scrapy_redis.scheduler.Scheduler"
DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"
REDIS_URL = "redis://localhost:6379"

# Spider inherits from RedisMixin
from scrapy_redis.spiders import RedisSpider

class DistributedSpider(RedisSpider):
    name = "distributed"
    redis_key = "distributed:start_urls"
    
    def parse(self, response):
        # Same as normal spider
        yield {...}
```

## Best Practices

1. **Use Items** - Define `scrapy.Item` for data consistency
2. **Set DOWNLOAD_DELAY** - Be respectful (1-3s minimum)
3. **Enable AutoThrottle** - Adaptive delay based on server load
4. **Use pipelines** - Validate, clean, and store data properly
5. **Handle errors** - Implement retry middleware
6. **Monitor stats** - Use Scrapy stats collector for metrics
7. **Respect robots.txt** - Enable ROBOTSTXT_OBEY
8. **Test locally** - Use `scrapy shell` for selector testing

## Related Commands

- `/scrape` - Scrapling-based scraping (adaptive parsing)
- `/firecrawl` - Firecrawl AI-powered extraction
- `/docs` - Documentation research
- `/plan` - Plan complex crawling projects
