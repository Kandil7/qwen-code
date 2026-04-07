#!/usr/bin/env python3
"""
Firecrawl CLI Skill for Qwen Code

Provides project scaffolding, API interaction, and status checks.

Usage:
    python firecrawl.py init <project_name>
    python firecrawl.py scrape <url> [--formats markdown,json] [--output <file>]
    python firecrawl.py crawl <url> [--limit N]
    python firecrawl.py agent '<prompt>' [--model spark-1-mini]
    python firecrawl.py search '<query>' [--limit N]
    python firecrawl.py map <url> [--search <term>]
    python firecrawl.py status
    python firecrawl.py help
"""

import argparse
import json
import os
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
    print(f"║   Firecrawl AI Scraping Skill          ║")
    print(f"║   Qwen Code Integration                ║")
    print(f"╚══════════════════════════════════════╝{Colors.ENDC}\n")

def check_firecrawl():
    try:
        import firecrawl
        print(f"{Colors.OKGREEN}✓{Colors.ENDC} firecrawl-py installed")
        return True
    except ImportError:
        print(f"{Colors.FAIL}✗{Colors.ENDC} firecrawl-py not installed")
        print(f"  Install: pip install firecrawl-py")
        return False

def check_api_key():
    key = os.environ.get("FIRECRAWL_API_KEY")
    if key:
        print(f"{Colors.OKGREEN}✓{Colors.ENDC} FIRECRAWL_API_KEY set")
        return True
    else:
        print(f"{Colors.WARNING}⚠{Colors.ENDC} FIRECRAWL_API_KEY not set")
        print(f"  Set: set FIRECRAWL_API_KEY=fc-YOUR_KEY")
        return False

def init_project(args):
    name = args.name
    d = Path(name)
    if d.exists():
        print(f"{Colors.FAIL}✗{Colors.ENDC} Directory '{name}' exists")
        sys.exit(1)
    
    print(f"{Colors.OKGREEN}⟳{Colors.ENDC} Creating Firecrawl project: {Colors.BOLD}{name}{Colors.ENDC}")
    
    dirs = [d/"scrapers", d/"schemas", d/"utils", d/"tests", d/"data", d/"config"]
    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"  {Colors.OKGREEN}✓{Colors.ENDC} Created {dir_path}")
    
    files = {
        d/"scrapers"/"__init__.py": "",
        d/"scrapers"/"example.py": _example_scraper(),
        d/"schemas"/"__init__.py": "",
        d/"schemas"/"models.py": _schemas(),
        d/"utils"/"__init__.py": "",
        d/"utils"/"client.py": _client_config(),
        d/"tests"/"__init__.py": "",
        d/"tests"/"test_scrapers.py": _tests(),
        d/"config"/"settings.yaml": _settings(),
        d/"requirements.txt": _requirements(),
        d/"README.md": _readme(name),
        d/".gitignore": _gitignore(),
    }
    
    for f, content in files.items():
        f.write_text(content)
        print(f"  {Colors.OKGREEN}✓{Colors.ENDC} Created {f}")
    
    print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓{Colors.ENDC} Project initialized!")
    print(f"\n{Colors.WARNING}Next steps:{Colors.ENDC}")
    print(f"  cd {name}")
    print(f"  pip install -r requirements.txt")
    print(f"  set FIRECRAWL_API_KEY=fc-YOUR_KEY")

def _example_scraper():
    return '''"""Example Firecrawl scraper."""
import os
from firecrawl import Firecrawl
from schemas.models import Product

app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])

def scrape_product(url: str):
    doc = app.scrape(url, formats=["markdown"])
    return doc.markdown

def crawl_site(url: str, limit: int = 50):
    docs = app.crawl(url, limit=limit)
    return docs.data

def agent_research(prompt: str):
    result = app.agent(prompt=prompt)
    return result.data
'''

def _schemas():
    return '''"""Pydantic schemas for Firecrawl extraction."""
from pydantic import BaseModel, Field
from typing import List, Optional

class Product(BaseModel):
    name: str = Field(description="Product name")
    price: float = Field(description="Price", gt=0)
    url: str = Field(description="Product URL")

class Article(BaseModel):
    title: str = Field(description="Article title")
    content: str = Field(description="Full content")
    url: str = Field(description="Article URL")
    author: Optional[str] = None
'''

def _client_config():
    return '''"""Firecrawl client configuration."""
import os
from firecrawl import Firecrawl

def get_client():
    api_key = os.environ.get("FIRECRAWL_API_KEY")
    api_url = os.environ.get("FIRECRAWL_API_URL")  # For self-hosted
    kwargs = {"api_key": api_key}
    if api_url:
        kwargs["api_url"] = api_url
    return Firecrawl(**kwargs)
'''

def _tests():
    return '''"""Tests for Firecrawl scrapers."""
import pytest

def test_client_creation():
    from utils.client import get_client
    client = get_client()
    assert client is not None

def test_product_schema():
    from schemas.models import Product
    p = Product(name="Widget", price=19.99, url="https://example.com")
    assert p.name == "Widget"
    assert p.price == 19.99
'''

def _settings():
    return '''# Firecrawl Configuration
firecrawl:
  api_key: "${FIRECRAWL_API_KEY}"
  api_url: "${FIRECRAWL_API_URL}"  # Optional: self-hosted
  default_model: "spark-1-mini"
  timeout: 60

crawl:
  default_limit: 100
  respect_robots: true
'''

def _requirements():
    return '''firecrawl-py>=1.0.0
pydantic>=2.0
pytest>=7.0
pyyaml>=6.0
'''

def _readme(name):
    return f'''# {name}

Firecrawl-powered web scraping project.

## Setup
```bash
pip install -r requirements.txt
set FIRECRAWL_API_KEY=fc-YOUR_KEY
```

## Usage
```python
from scrapers.example import scrape_product
markdown = scrape_product("https://example.com")
```
'''

def _gitignore():
    return '''__pycache__
*.pyc
.env
data/
*.log
'''

def scrape_url(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Scraping: {Colors.BOLD}{args.url}{Colors.ENDC}")
    if not check_firecrawl() or not check_api_key():
        sys.exit(1)
    
    from firecrawl import Firecrawl
    app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])
    
    formats = args.formats.split(",") if args.formats else ["markdown"]
    start = time.time()
    
    doc = app.scrape(args.url, formats=formats)
    elapsed = time.time() - start
    
    print(f"\n{Colors.OKGREEN}✓{Colors.ENDC} Scraped in {elapsed:.2f}s")
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            if "markdown" in formats:
                f.write(doc.markdown or "")
            else:
                json.dump(doc.to_dict(), f, indent=2, default=str)
        print(f"  Saved to: {args.output}")
    else:
        preview = (doc.markdown or "")[:500]
        print(f"\n{Colors.BOLD}Preview (first 500 chars):{Colors.ENDC}")
        print(preview)

def crawl_site(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Crawling: {Colors.BOLD}{args.url}{Colors.ENDC}")
    print(f"  Limit: {args.limit} pages")
    if not check_firecrawl() or not check_api_key():
        sys.exit(1)
    
    from firecrawl import Firecrawl
    app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])
    
    start = time.time()
    docs = app.crawl(args.url, limit=args.limit)
    elapsed = time.time() - start
    
    print(f"\n{Colors.OKGREEN}✓{Colors.ENDC} Crawled {len(docs.data)} pages in {elapsed:.1f}s")
    
    if args.output:
        data = [{"url": d.metadata.sourceURL, "markdown": d.markdown} for d in docs.data]
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"  Saved to: {args.output}")

def agent_query(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Agent: {Colors.BOLD}{args.prompt[:80]}...{Colors.ENDC}")
    if not check_firecrawl() or not check_api_key():
        sys.exit(1)
    
    from firecrawl import Firecrawl
    app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])
    
    kwargs = {"prompt": args.prompt}
    if args.model:
        kwargs["model"] = args.model
    
    start = time.time()
    result = app.agent(**kwargs)
    elapsed = time.time() - start
    
    print(f"\n{Colors.OKGREEN}✓{Colors.ENDC} Agent completed in {elapsed:.1f}s")
    print(json.dumps(result.data, indent=2, default=str)[:1000])

def search_web(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Searching: {Colors.BOLD}{args.query}{Colors.ENDC}")
    if not check_firecrawl() or not check_api_key():
        sys.exit(1)
    
    from firecrawl import Firecrawl
    app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])
    
    results = app.search(args.query, limit=args.limit)
    
    print(f"\n{Colors.OKGREEN}✓{Colors.ENDC} Found {len(results.data.web)} results")
    for i, r in enumerate(results.data.web, 1):
        print(f"  {i}. {r.title}")
        print(f"     {r.url}")
        print(f"     {(r.markdown or '')[:100]}...")
        print()

def map_domain(args):
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Mapping: {Colors.BOLD}{args.url}{Colors.ENDC}")
    if not check_firecrawl() or not check_api_key():
        sys.exit(1)
    
    from firecrawl import Firecrawl
    app = Firecrawl(api_key=os.environ["FIRECRAWL_API_KEY"])
    
    kwargs = {}
    if args.search:
        kwargs["search"] = args.search
    
    urls = app.map(args.url, **kwargs)
    
    print(f"\n{Colors.OKGREEN}✓{Colors.ENDC} Found {len(urls.links)} URLs")
    for url in urls.links[:50]:
        print(f"  {url}")

def show_status(args):
    print(f"{Colors.BOLD}Firecrawl Status:{Colors.ENDC}\n")
    check_firecrawl()
    check_api_key()

def show_help(args):
    print_banner()
    print(f"{Colors.BOLD}Commands:{Colors.ENDC}\n")
    commands = {
        "init <name>": "Create Firecrawl project scaffold",
        "scrape <url> [--formats] [--output]": "Extract content from URL",
        "crawl <url> [--limit N] [--output]": "Crawl entire website",
        "agent '<prompt>' [--model]": "AI autonomous extraction",
        "search '<query>' [--limit N]": "Web search + content extract",
        "map <url> [--search]": "URL discovery",
        "status": "Check installation",
        "help": "Show this help"
    }
    for cmd, desc in commands.items():
        print(f"  {Colors.OKCYAN}{cmd}{Colors.ENDC}\n    {desc}\n")

def main():
    parser = argparse.ArgumentParser(description="Firecrawl Skill for Qwen Code")
    subparsers = parser.add_subparsers(dest="command")
    
    init_p = subparsers.add_parser("init")
    init_p.add_argument("name")
    
    scrape_p = subparsers.add_parser("scrape")
    scrape_p.add_argument("url")
    scrape_p.add_argument("--formats", default="markdown")
    scrape_p.add_argument("--output", "-o")
    
    crawl_p = subparsers.add_parser("crawl")
    crawl_p.add_argument("url")
    crawl_p.add_argument("--limit", type=int, default=100)
    crawl_p.add_argument("--output", "-o")
    
    agent_p = subparsers.add_parser("agent")
    agent_p.add_argument("prompt")
    agent_p.add_argument("--model", default="spark-1-mini")
    
    search_p = subparsers.add_parser("search")
    search_p.add_argument("query")
    search_p.add_argument("--limit", type=int, default=10)
    
    map_p = subparsers.add_parser("map")
    map_p.add_argument("url")
    map_p.add_argument("--search")
    
    subparsers.add_parser("status")
    subparsers.add_parser("help")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(0)
    
    print_banner()
    
    cmds = {
        "init": init_project, "scrape": scrape_url, "crawl": crawl_site,
        "agent": agent_query, "search": search_web, "map": map_domain,
        "status": show_status, "help": show_help
    }
    cmds[args.command](args)

if __name__ == "__main__":
    main()
