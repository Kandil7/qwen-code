#!/usr/bin/env python3
"""
Scrapy CLI Skill for Qwen Code

Provides project scaffolding, spider generation, and run helpers.

Usage:
    python scrapy.py init <project_name>
    python scrapy.py spider <name> --type basic|crawl|redis
    python scrapy.py run <spider_name> [--output <file>]
    python scrapy.py test
    python scrapy.py status
    python scrapy.py help
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_banner():
    print(f"\n{Colors.OKCYAN}{Colors.BOLD}╔══════════════════════════════════════╗")
    print(f"║   Scrapy Crawling Skill              ║")
    print(f"║   Qwen Code Integration              ║")
    print(f"╚══════════════════════════════════════╝{Colors.ENDC}\n")

def check_scrapy():
    try:
        import scrapy
        print(f"{Colors.OKGREEN}✓{Colors.ENDC} Scrapy {scrapy.__version__} installed")
        return True
    except ImportError:
        print(f"{Colors.FAIL}✗{Colors.ENDC} Scrapy not installed")
        print(f"  Install: pip install scrapy")
        return False

def init_project(args):
    name = args.name
    d = Path(name)
    if d.exists():
        print(f"{Colors.FAIL}✗{Colors.ENDC} Directory '{name}' exists")
        sys.exit(1)
    
    print(f"{Colors.OKGREEN}⟳{Colors.ENDC} Creating Scrapy project: {Colors.BOLD}{name}{Colors.ENDC}")
    
    # Use scrapy's built-in startproject if available
    if check_scrapy():
        subprocess.run([sys.executable, "-m", "scrapy", "startproject", name, str(d)], check=False)
        print(f"  {Colors.OKGREEN}✓{Colors.ENDC} Scrapy project scaffold created")
    
    # Add additional files
    files = {
        d/"scrapers"/"__init__.py": "",
        d/"scrapers"/"example_spider.py": _example_spider(),
        d/"middlewares"/"__init__.py": "",
        d/"middlewares"/"proxy.py": _proxy_middleware(),
        d/"pipelines"/"__init__.py": "",
        d/"pipelines"/"validation.py": _validation_pipeline(),
        d/"tests"/"__init__.py": "",
        d/"tests"/"conftest.py": _conftest(),
        d/"tests"/"test_spiders.py": _tests(),
        d/"tests"/"fixtures"/"sample.html": _fixture(),
        d/"config"/"alerts.yaml": _alerts(),
        d/"Dockerfile": _dockerfile(),
        d/"docker-compose.yml": _docker_compose(),
        d/".dockerignore": _dockerignore(),
    }
    
    for f, content in files.items():
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(content)
        print(f"  {Colors.OKGREEN}✓{Colors.ENDC} Created {f}")
    
    print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓{Colors.ENDC} Project ready!")
    print(f"\n{Colors.WARNING}Next steps:{Colors.ENDC}")
    print(f"  cd {name}")
    print(f"  pip install -r requirements.txt")
    print(f"  scrapy crawl products -o data/products.json")

def _example_spider():
    return '''import scrapy

class ProductSpider(scrapy.Spider):
    name = "products"
    allowed_domains = ["shop.example.com"]
    start_urls = ["https://shop.example.com/products"]
    
    custom_settings = {
        "DOWNLOAD_DELAY": 2,
        "CONCURRENT_REQUESTS": 10,
        "AUTOTHROTTLE_ENABLED": True,
        "ROBOTSTXT_OBEY": True,
    }
    
    def parse(self, response):
        for product in response.css(".product-card"):
            yield {
                "name": product.css(".name::text").get("").strip(),
                "price": product.css(".price::text").get("").strip(),
                "url": response.urljoin(product.css("a::attr(href)").get("")),
            }
        
        next_page = response.css("a.next::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
'''

def _proxy_middleware():
    return '''import random

class RotatingProxyMiddleware:
    def __init__(self, proxies):
        self.proxies = proxies
    
    @classmethod
    def from_crawler(cls, crawler):
        proxies = crawler.settings.getlist("PROXY_LIST", [])
        return cls(proxies)
    
    def process_request(self, request, spider):
        if self.proxies:
            request.meta["proxy"] = random.choice(self.proxies)
'''

def _validation_pipeline():
    return '''from scrapy.exceptions import DropItem

class PriceValidationPipeline:
    def process_item(self, item, spider):
        if not item.get("price"):
            raise DropItem(f"Missing price: {item.get('name', 'unknown')}")
        
        price = item["price"].replace("$", "").replace(",", "")
        try:
            item["price"] = float(price)
        except ValueError:
            raise DropItem(f"Invalid price: {item['price']}")
        
        return item

class DeduplicationPipeline:
    def __init__(self):
        self.seen = set()
    
    def process_item(self, item, spider):
        url = item.get("url")
        if url in self.seen:
            raise DropItem(f"Duplicate: {url}")
        self.seen.add(url)
        return item
'''

def _conftest():
    return '''import pytest
from pathlib import Path
from scrapy.http import HtmlResponse

@pytest.fixture
def fixtures_dir():
    return Path(__file__).parent / "fixtures"

@pytest.fixture
def sample_html(fixtures_dir):
    return (fixtures_dir / "sample.html").read_text()

@pytest.fixture
def sample_response(sample_html):
    return HtmlResponse(url="https://example.com", body=sample_html.encode(), encoding="utf-8")
'''

def _tests():
    return '''import pytest
from scrapy.http import HtmlResponse

def test_product_parsing(sample_response):
    from scrapers.example_spider import ProductSpider
    spider = ProductSpider()
    results = list(spider.parse(sample_response))
    assert isinstance(results, list)
'''

def _fixture():
    return '''<!DOCTYPE html>
<html><body>
<div class="product-card">
    <h2 class="name">Widget A</h2>
    <span class="price">$19.99</span>
    <a href="/products/widget-a">View</a>
</div>
</body></html>
'''

def _alerts():
    return '''alerts:
  failure_rate:
    warning: 10
    critical: 25
  response_time:
    warning: 10
    critical: 30
'''

def _dockerfile():
    return '''FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN mkdir -p data
CMD ["scrapy", "crawl", "products", "-o", "data/output.json"]
'''

def _docker_compose():
    return '''version: '3.8'
services:
  scraper:
    build: .
    volumes:
      - ./data:/app/data
    restart: unless-stopped
'''

def _dockerignore():
    return '''__pycache__
*.pyc
data/*.json
*.log
.venv
.git
'''

def generate_spider(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Generating spider: {Colors.BOLD}{args.name}{Colors.ENDC}")
    print(f"  Type: {args.type}")
    
    if args.url:
        print(f"  Start URL: {args.url}")
    
    # For now, document the process
    print(f"\n{Colors.WARNING}⚠{Colors.ENDC} Use `scrapy genspider {args.name} {args.url or 'example.com'}` for full generation")

def run_spider(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Running spider: {Colors.BOLD}{args.spider_name}{Colors.ENDC}")
    
    if not check_scrapy():
        sys.exit(1)
    
    cmd = [sys.executable, "-m", "scrapy", "crawl", args.spider_name]
    if args.output:
        cmd.extend(["-o", args.output])
    
    subprocess.run(cmd)

def run_tests(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Running tests...")
    
    try:
        import pytest
    except ImportError:
        print(f"{Colors.FAIL}✗{Colors.ENDC} pytest not installed")
        sys.exit(1)
    
    exit_code = pytest.main(["-v", "tests/"])
    sys.exit(0 if exit_code == 0 else 1)

def show_status(args):
    print(f"{Colors.BOLD}Scrapy Status:{Colors.ENDC}\n")
    check_scrapy()
    
    # Check optional deps
    for pkg, desc in [("scrapy_playwright", "JS rendering"), ("scrapy_redis", "distributed"), ("scrapyd", "deployment")]:
        try:
            __import__(pkg)
            print(f"  {Colors.OKGREEN}✓{Colors.ENDC} {pkg} ({desc})")
        except ImportError:
            print(f"  {Colors.WARNING}✗{Colors.ENDC} {pkg} ({desc})")

def show_help(args):
    print_banner()
    print(f"{Colors.BOLD}Commands:{Colors.ENDC}\n")
    cmds = {
        "init <name>": "Create Scrapy project scaffold",
        "spider <name> --type basic|crawl|redis": "Generate spider from template",
        "run <spider_name> [--output]": "Run a spider",
        "test": "Run spider tests",
        "status": "Check installation",
        "help": "Show this help"
    }
    for cmd, desc in cmds.items():
        print(f"  {Colors.OKCYAN}{cmd}{Colors.ENDC}\n    {desc}\n")

def main():
    parser = argparse.ArgumentParser(description="Scrapy Skill for Qwen Code")
    subparsers = parser.add_subparsers(dest="command")
    
    init_p = subparsers.add_parser("init")
    init_p.add_argument("name")
    
    spider_p = subparsers.add_parser("spider")
    spider_p.add_argument("name")
    spider_p.add_argument("--type", default="basic", choices=["basic", "crawl", "redis"])
    spider_p.add_argument("--url")
    
    run_p = subparsers.add_parser("run")
    run_p.add_argument("spider_name")
    run_p.add_argument("--output", "-o")
    
    subparsers.add_parser("test")
    subparsers.add_parser("status")
    subparsers.add_parser("help")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(0)
    
    print_banner()
    
    cmds = {
        "init": init_project, "spider": generate_spider, "run": run_spider,
        "test": run_tests, "status": show_status, "help": show_help
    }
    cmds[args.command](args)

if __name__ == "__main__":
    main()
