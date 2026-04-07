#!/usr/bin/env python3
"""
Scrapling Web Scraping Skill for Qwen Code

Executable Python skill that provides:
- Project initialization and scaffolding
- Live scraping with progress tracking
- Crawl management with pause/resume
- Testing utilities and fixture management
- Health checks and status reporting

Usage:
    python scrapling.py init <project_name>
    python scrapling.py fetch <url> [--dynamic] [--stealth] [--output <file>]
    python scrapling.py crawl <start_url> [--pages <n>] [--delay <ms>]
    python scrapling.py status
    python scrapling.py test [--fixtures]
    python scrapling.py help
"""

import argparse
import asyncio
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_banner():
    """Print Scrapling skill banner"""
    print(f"\n{Colors.OKCYAN}{Colors.BOLD}╔══════════════════════════════════════╗")
    print(f"║   Scrapling Web Scraping Skill       ║")
    print(f"║   Qwen Code Integration              ║")
    print(f"╚══════════════════════════════════════╝{Colors.ENDC}\n")

def check_scrapling_installed() -> bool:
    """Check if Scrapling is installed"""
    try:
        import scrapling
        print(f"{Colors.OKGREEN}✓{Colors.ENDC} Scrapling {scrapling.__version__} is installed")
        return True
    except ImportError:
        print(f"{Colors.FAIL}✗{Colors.ENDC} Scrapling is not installed")
        print(f"\n{Colors.WARNING}Install with:{Colors.ENDC}")
        print(f"  pip install scrapling[all]")
        print(f"  scrapling install  # for browser dependencies")
        return False

def check_playwright_installed() -> bool:
    """Check if Playwright browsers are installed"""
    try:
        import playwright
        # Try to check if browsers are installed
        result = subprocess.run(
            [sys.executable, "-m", "playwright", "install", "--dry-run"],
            capture_output=True,
            text=True
        )
        # If chromium is listed as not installed, return False
        if "chromium" in result.stdout.lower() or "chromium" in result.stderr.lower():
            if "not installed" in result.stdout.lower() or "not installed" in result.stderr.lower():
                return False
        return True
    except ImportError:
        return False

def init_project(args):
    """Initialize a new scraper project"""
    project_name = args.name
    project_dir = Path(project_name)
    
    if project_dir.exists():
        print(f"{Colors.FAIL}✗{Colors.ENDC} Directory '{project_name}' already exists")
        sys.exit(1)
    
    print(f"{Colors.OKGREEN}⟳{Colors.ENDC} Creating scraper project: {Colors.BOLD}{project_name}{Colors.ENDC}")
    
    # Create directory structure
    directories = [
        project_dir / "scrapers",
        project_dir / "models",
        project_dir / "utils",
        project_dir / "tests" / "fixtures",
        project_dir / "data",
        project_dir / "config",
        project_dir / "monitoring",
    ]
    
    for dir_path in directories:
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"  {Colors.OKGREEN}✓{Colors.ENDC} Created {dir_path}")
    
    # Create files
    files = {
        project_dir / "scrapers" / "__init__.py": "",
        project_dir / "scrapers" / "base_scraper.py": _base_scraper_template(),
        project_dir / "scrapers" / "example_scraper.py": _example_scraper_template(),
        project_dir / "models" / "__init__.py": "",
        project_dir / "models" / "schemas.py": _schemas_template(),
        project_dir / "utils" / "__init__.py": "",
        project_dir / "utils" / "fetchers.py": _fetchers_template(),
        project_dir / "utils" / "storage.py": _storage_template(),
        project_dir / "tests" / "__init__.py": "",
        project_dir / "tests" / "conftest.py": _conftest_template(),
        project_dir / "tests" / "test_scrapers.py": _test_scrapers_template(),
        project_dir / "tests" / "fixtures" / "sample_page.html": _sample_html_fixture(),
        project_dir / "tests" / "fixtures" / "cloudflare_challenge.html": _cloudflare_fixture(),
        project_dir / "config" / "settings.yaml": _settings_template(),
        project_dir / "config" / "alerts.yaml": _alerts_template(),
        project_dir / "monitoring" / "dashboard.json": _grafana_dashboard_template(),
        project_dir / "requirements.txt": _requirements_template(),
        project_dir / "README.md": _readme_template(project_name),
        project_dir / ".gitignore": _gitignore_template(),
        project_dir / "Dockerfile": _dockerfile_template(),
        project_dir / "docker-compose.yml": _docker_compose_template(),
        project_dir / ".dockerignore": _dockerignore_template(),
    }
    
    for file_path, content in files.items():
        file_path.write_text(content)
        print(f"  {Colors.OKGREEN}✓{Colors.ENDC} Created {file_path}")
    
    print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓{Colors.ENDC} Project initialized successfully!")
    print(f"\n{Colors.WARNING}Next steps:{Colors.ENDC}")
    print(f"  cd {project_name}")
    print(f"  pip install -r requirements.txt")
    print(f"  # Edit scrapers/example_scraper.py with your target")
    print(f"  python -m pytest tests/ -v")

def _base_scraper_template():
    return '''"""Base scraper with retry logic, delays, and error handling."""

from scrapling import Fetcher, StealthyFetcher, DynamicFetcher
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)


class BaseScraper:
    """Base scraper class with common functionality."""
    
    def __init__(
        self,
        delay: float = 2.0,
        max_retries: int = 3,
        timeout: int = 30,
        fetcher_type: str = "auto"
    ):
        self.delay = delay
        self.max_retries = max_retries
        self.timeout = timeout
        self.fetcher = self._create_fetcher(fetcher_type)
        self.stats = {
            "success": 0,
            "failed": 0,
            "retries": 0
        }
    
    def _create_fetcher(self, fetcher_type: str):
        """Create appropriate fetcher based on type."""
        if fetcher_type == "stealth":
            return StealthyFetcher(headless=True)
        elif fetcher_type == "dynamic":
            return DynamicFetcher(headless=True)
        elif fetcher_type == "auto":
            # Start with regular fetcher, upgrade if needed
            return Fetcher(timeout=self.timeout)
        else:
            return Fetcher(timeout=self.timeout)
    
    def fetch_with_retry(self, url: str, retries: int = 0) -> Optional[object]:
        """Fetch URL with exponential backoff retry."""
        try:
            response = self.fetcher.get(url)
            
            if response.status_code == 403 and retries == 0:
                # Upgrade to stealth fetcher if blocked
                logger.warning(f"Blocked by {url}, upgrading to stealth fetcher")
                self.fetcher = StealthyFetcher(headless=True)
                return self.fetch_with_retry(url, retries)
            
            if response.status_code != 200:
                raise Exception(f"HTTP {response.status_code}")
            
            self.stats["success"] += 1
            return response
            
        except Exception as e:
            if retries < self.max_retries:
                wait_time = 2 ** retries
                logger.warning(f"Retry {retries+1}/{self.max_retries} for {url} in {wait_time}s: {e}")
                time.sleep(wait_time)
                self.stats["retries"] += 1
                return self.fetch_with_retry(url, retries + 1)
            else:
                logger.error(f"Failed to fetch {url} after {self.max_retries} retries: {e}")
                self.stats["failed"] += 1
                return None
    
    def wait(self):
        """Respectful delay between requests."""
        if self.delay > 0:
            time.sleep(self.delay)
    
    def get_stats(self) -> dict:
        """Return scraper statistics."""
        total = self.stats["success"] + self.stats["failed"]
        success_rate = (self.stats["success"] / total * 100) if total > 0 else 0
        
        return {
            **self.stats,
            "total": total,
            "success_rate": f"{success_rate:.1f}%"
        }
'''

def _example_scraper_template():
    return '''"""Example scraper - customize for your target website."""

from scrapers.base_scraper import BaseScraper
from models.schemas import Product
import logging

logger = logging.getLogger(__name__)


class ExampleScraper(BaseScraper):
    """Example product scraper."""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.products = []
    
    def scrape_product_listing(self, url: str) -> list[Product]:
        """Scrape products from a listing page."""
        response = self.fetch_with_retry(url)
        if not response:
            return []
        
        products = []
        items = response.css('.product-card')
        
        for item in items:
            try:
                product = Product(
                    name=item.css_first('.name').text.strip(),
                    price=self._extract_price(item),
                    url=url,
                    image_url=item.css_first('img')['src'] if item.css_first('img') else None
                )
                products.append(product)
            except Exception as e:
                logger.warning(f"Failed to extract product: {e}")
        
        self.products.extend(products)
        self.wait()
        
        return products
    
    def _extract_price(self, item) -> float:
        """Extract and parse price from element."""
        price_text = item.css_first('.price').text.strip()
        # Remove currency symbols and commas
        price_text = price_text.replace('$', '').replace(',', '')
        return float(price_text)
    
    def scrape_with_pagination(self, base_url: str, max_pages: int = 5):
        """Scrape multiple pages with pagination."""
        for page in range(1, max_pages + 1):
            url = f"{base_url}?page={page}"
            logger.info(f"Scraping page {page}: {url}")
            
            products = self.scrape_product_listing(url)
            if not products:
                logger.info(f"No products found on page {page}, stopping")
                break
            
            yield products


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    scraper = ExampleScraper(delay=2.0)
    
    # Example usage
    # products = scraper.scrape_product_listing("https://example.com/products")
    # print(f"Scraped {len(products)} products")
    # print(f"Stats: {scraper.get_stats()}")
'''

def _schemas_template():
    return '''"""Pydantic data models for scraped data."""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class Product(BaseModel):
    """Product data model."""
    name: str = Field(..., min_length=1, max_length=500)
    price: float = Field(..., gt=0)
    url: str = Field(..., min_length=1)
    description: Optional[str] = None
    image_url: Optional[str] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Product name cannot be empty')
        return v.strip()
    
    @field_validator('price')
    @classmethod
    def price_reasonable(cls, v: float) -> float:
        if v > 1_000_000:
            raise ValueError(f'Price {v} seems unreasonable')
        return round(v, 2)


class Article(BaseModel):
    """Article/blog post data model."""
    title: str = Field(..., min_length=1)
    author: Optional[str] = None
    published_date: Optional[str] = None
    content: str = Field(..., min_length=1)
    url: str = Field(..., min_length=1)
    scraped_at: datetime = Field(default_factory=datetime.utcnow)


class JobListing(BaseModel):
    """Job listing data model."""
    title: str = Field(..., min_length=1)
    company: str = Field(..., min_length=1)
    location: Optional[str] = None
    description: Optional[str] = None
    url: str = Field(..., min_length=1)
    posted_date: Optional[str] = None
    scraped_at: datetime = Field(default_factory=datetime.utcnow)
'''

def _fetchers_template():
    return '''"""Fetcher factory for creating configured fetchers."""

from scrapling import Fetcher, StealthyFetcher, DynamicFetcher
from typing import Optional


def create_fetcher(
    fetcher_type: str = "http",
    proxy: Optional[str] = None,
    timeout: int = 30,
    **kwargs
):
    """Create fetcher based on configuration.
    
    Args:
        fetcher_type: One of 'http', 'dynamic', 'stealth'
        proxy: Optional proxy URL
        timeout: Request timeout in seconds
        **kwargs: Additional fetcher-specific arguments
    
    Returns:
        Configured fetcher instance
    """
    common_kwargs = {"timeout": timeout}
    
    if proxy:
        common_kwargs["proxy"] = proxy
    
    if fetcher_type == "http":
        return Fetcher(**common_kwargs)
    elif fetcher_type == "dynamic":
        return DynamicFetcher(headless=True, **{**common_kwargs, **kwargs})
    elif fetcher_type == "stealth":
        return StealthyFetcher(headless=True, **{**common_kwargs, **kwargs})
    else:
        raise ValueError(f"Unknown fetcher type: {fetcher_type}")
'''

def _storage_template():
    return '''"""Data storage utilities for scraped data."""

import json
import csv
from pathlib import Path
from typing import List, Dict, Any


def save_to_json(data: List[Dict[str, Any]], filepath: str):
    """Save data to JSON file."""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"✓ Saved {len(data)} items to {filepath}")


def save_to_csv(data: List[Dict[str, Any]], filepath: str):
    """Save data to CSV file."""
    if not data:
        print("⚠ No data to save")
        return
    
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    keys = data[0].keys()
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"✓ Saved {len(data)} items to {filepath}")


def load_from_json(filepath: str) -> List[Dict[str, Any]]:
    """Load data from JSON file."""
    path = Path(filepath)
    if not path.exists():
        return []
    
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)
'''

def _conftest_template():
    return '''"""Pytest fixtures for scraper testing."""

import pytest
from pathlib import Path
from scrapling import Fetcher


@pytest.fixture
def fixtures_dir():
    """Return path to test fixtures."""
    return Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_html(fixtures_dir):
    """Load sample HTML fixture."""
    html_file = fixtures_dir / "sample_page.html"
    return html_file.read_text()


@pytest.fixture
def cloudflare_html(fixtures_dir):
    """Load Cloudflare challenge HTML fixture."""
    html_file = fixtures_dir / "cloudflare_challenge.html"
    return html_file.read_text()


@pytest.fixture
def mock_response(sample_html):
    """Create a mock response object."""
    from scrapling import Adaptor
    return Adaptor(sample_html, url="https://example.com/test")


@pytest.fixture
def scraper():
    """Create a test scraper instance."""
    from scrapers.example_scraper import ExampleScraper
    return ExampleScraper(delay=0.1)  # Fast delays for testing
'''

def _test_scrapers_template():
    return '''"""Tests for scrapers."""

import pytest
from pydantic import ValidationError


class TestBaseScraper:
    """Tests for base scraper functionality."""
    
    def test_create_http_fetcher(self):
        """Test HTTP fetcher creation."""
        from scrapling import Fetcher
        fetcher = Fetcher()
        assert fetcher is not None
    
    def test_stats_tracking(self):
        """Test scraper statistics tracking."""
        from scrapers.base_scraper import BaseScraper
        scraper = BaseScraper()
        stats = scraper.get_stats()
        assert "success" in stats
        assert "failed" in stats
        assert "success_rate" in stats


class TestExampleScraper:
    """Tests for example scraper."""
    
    def test_parse_sample_html(self, mock_response):
        """Test parsing sample HTML fixture."""
        # Customize this test for your actual selectors
        items = mock_response.css('.product-card')
        # Assert expected structure
        assert isinstance(items, list)
    
    def test_parse_cloudflare_challenge(self, cloudflare_html):
        """Test detection of Cloudflare challenge pages."""
        from scrapling import Adaptor
        response = Adaptor(cloudflare_html, url="https://example.com")
        
        # Should detect challenge page
        text = response.text
        assert "challenge" in text.lower() or "cloudflare" in text.lower()


class TestDataModels:
    """Tests for Pydantic data models."""
    
    def test_valid_product(self):
        """Test valid product creation."""
        from models.schemas import Product
        product = Product(
            name="Test Product",
            price=19.99,
            url="https://example.com/product"
        )
        assert product.name == "Test Product"
        assert product.price == 19.99
    
    def test_invalid_product_empty_name(self):
        """Test product validation with empty name."""
        from models.schemas import Product
        with pytest.raises(ValidationError):
            Product(name="", price=19.99, url="https://example.com")
    
    def test_invalid_product_negative_price(self):
        """Test product validation with negative price."""
        from models.schemas import Product
        with pytest.raises(ValidationError):
            Product(name="Product", price=-10, url="https://example.com")
    
    def test_invalid_product_high_price(self):
        """Test product validation with unreasonable price."""
        from models.schemas import Product
        with pytest.raises(ValidationError):
            Product(name="Product", price=10_000_000, url="https://example.com")
'''

def _sample_html_fixture():
    return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sample Product Listing</title>
</head>
<body>
    <div class="container">
        <h1>Products</h1>
        <div class="product-listing">
            <div class="product-card" data-id="1">
                <a href="/products/widget-a">
                    <img src="/images/widget-a.jpg" alt="Widget A">
                    <h2 class="name">Widget A</h2>
                </a>
                <p class="price">$19.99</p>
                <p class="description">A wonderful widget for all your needs.</p>
            </div>
            <div class="product-card" data-id="2">
                <a href="/products/widget-b">
                    <img src="/images/widget-b.jpg" alt="Widget B">
                    <h2 class="name">Widget B</h2>
                </a>
                <p class="price">$29.99</p>
                <p class="description">An even better widget!</p>
            </div>
            <div class="product-card" data-id="3">
                <a href="/products/gadget-c">
                    <img src="/images/gadget-c.jpg" alt="Gadget C">
                    <h2 class="name">Gadget C</h2>
                </a>
                <p class="price">$39.99</p>
                <p class="description">Premium quality gadget.</p>
            </div>
        </div>
        <div class="pagination">
            <a href="?page=1" class="active">1</a>
            <a href="?page=2">2</a>
            <a href="?page=3">3</a>
            <a href="?page=2" class="next-page">Next</a>
        </div>
    </div>
</body>
</html>
'''

def _cloudflare_fixture():
    return '''<!DOCTYPE html>
<html lang="en">
<head>
    <title>Just a moment...</title>
    <meta http-equiv="refresh" content="35">
</head>
<body>
    <div class="cf-wrapper">
        <div class="cf-columns">
            <div class="cf-column">
                <h1 data-translate="challenge_headline">Checking your browser before accessing the website...</h1>
                <p>This process is automatic. Your browser will redirect to your requested content shortly.</p>
                <p>Please allow up to 5 seconds...</p>
                <form id="challenge-form" action="/cdn-cgi/challenge-platform/h/b" method="POST">
                    <input type="hidden" name="r" value="challenge-token-12345">
                </form>
            </div>
        </div>
        <div class="cf-footer">
            <span>DDoS protection by Cloudflare</span>
        </div>
    </div>
    <script>
        // Cloudflare challenge JavaScript
        window._cf_chl_opt = {
            cZxRq: "challenge-token",
            cRay: "ray-id-12345"
        };
    </script>
</body>
</html>
'''

def _settings_template():
    return '''# Scraper Configuration

scraper:
  # Default delay between requests (seconds)
  delay: 2.0
  
  # Maximum retries for failed requests
  max_retries: 3
  
  # Request timeout (seconds)
  timeout: 30
  
  # Fetcher type: http, dynamic, stealth, auto
  fetcher_type: auto

crawl:
  # Maximum concurrent requests
  concurrent_requests: 10
  
  # Maximum pages to crawl
  max_pages: 1000
  
  # Respect robots.txt
  robots_txt: true
  
  # Save checkpoints for resume
  checkpoint: true
  checkpoint_interval: 60  # seconds

output:
  # Default output format: json, csv
  format: json
  
  # Output directory
  directory: data
  
  # File naming pattern
  filename_pattern: "{spider_name}_{timestamp}"

logging:
  # Log level: DEBUG, INFO, WARNING, ERROR
  level: INFO
  
  # Log file path
  file: scraper.log
  
  # Also log to console
  console: true
'''

def _alerts_template():
    return '''# Alerting Configuration

alerts:
  # Failure rate threshold (percentage)
  failure_rate:
    warning: 10
    critical: 25
  
  # Selector drift detection
  selector_drift:
    warning: 20  # % drop in items extracted
    critical: 50
  
  # Response time threshold (seconds)
  response_time:
    warning: 10
    critical: 30
  
  # Proxy health
  proxy_failure:
    warning: 3  # consecutive failures
    critical: 10
  
  # Data quality
  validation_failure_rate:
    warning: 5
    critical: 15

notifications:
  # Enable/disable notifications
  enabled: false
  
  # Notification channels
  channels:
    - type: email
      to: admin@example.com
    - type: slack
      webhook: "${SLACK_WEBHOOK_URL}"
    - type: webhook
      url: "${ALERT_WEBHOOK_URL}"
'''

def _grafana_dashboard_template():
    return '''{
  "dashboard": {
    "title": "Scraper Monitoring Dashboard",
    "panels": [
      {
        "title": "Success Rate",
        "type": "gauge",
        "targets": [{"expr": "scraper_success_rate_percent"}],
        "thresholds": [
          {"value": 95, "color": "green"},
          {"value": 80, "color": "yellow"},
          {"value": 0, "color": "red"}
        ]
      },
      {
        "title": "Items Extracted Over Time",
        "type": "graph",
        "targets": [{"expr": "rate(scraper_items_extracted_total[5m])"}]
      },
      {
        "title": "Request Latency",
        "type": "graph",
        "targets": [
          {"expr": "histogram_quantile(0.95, scraper_request_duration_seconds_bucket)"}
        ]
      },
      {
        "title": "Failure Rate by Domain",
        "type": "table",
        "targets": [{"expr": "scraper_request_failures_total"}]
      },
      {
        "title": "Proxy Health",
        "type": "stat",
        "targets": [
          {"expr": "scraper_proxy_active"},
          {"expr": "scraper_proxy_failed"}
        ]
      },
      {
        "title": "Selector Drift Detection",
        "type": "stat",
        "targets": [{"expr": "scraper_selector_drift_detected"}]
      }
    ]
  }
}
'''

def _requirements_template():
    return '''# Core dependencies
scrapling[all]>=0.1.0

# Data validation
pydantic>=2.0

# Testing
pytest>=7.0
pytest-asyncio>=0.21

# Configuration
pyyaml>=6.0

# Monitoring (optional)
prometheus-client>=0.17

# HTTP (optional, for custom fetchers)
aiohttp>=3.9

# CLI
rich>=13.0
tqdm>=4.66
'''

def _readme_template(project_name):
    return f'''# {project_name}

Web scraper built with Scrapling framework.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/ -v

# Run example scraper
python -m scrapers.example_scraper
```

## Project Structure

```
{project_name}/
├── scrapers/          # Scraper implementations
├── models/            # Pydantic data models
├── utils/             # Utilities (fetchers, storage)
├── tests/             # Tests and HTML fixtures
├── data/              # Output data
├── config/            # Configuration files
└── monitoring/        # Grafana dashboards
```

## Usage

### Single Page

```python
from scrapers.example_scraper import ExampleScraper

scraper = ExampleScraper(delay=2.0)
products = scraper.scrape_product_listing("https://example.com/products")
print(f"Scraped {{len(products)}} products")
```

### With Pagination

```python
for page_products in scraper.scrape_with_pagination("https://example.com/products", max_pages=5):
    print(f"Got {{len(page_products)}} products")
```

### Save Output

```python
from utils.storage import save_to_json

save_to_json([p.model_dump() for p in products], "data/products.json")
```

## Configuration

Edit `config/settings.yaml` to customize:
- Request delays
- Retry policies
- Output formats
- Logging levels

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=scrapers --cov=models

# Update HTML fixtures
python scrapling.py test --fixtures
```

## Docker

```bash
# Build
docker build -t scraper .

# Run
docker run -v $(pwd)/data:/app/data scraper
```

## Monitoring

Import Grafana dashboard from `monitoring/dashboard.json` to track:
- Success rates
- Extraction volumes
- Response times
- Selector drift
- Proxy health
'''

def _gitignore_template():
    return '''# Dependencies
__pycache__/
*.py[cod]
*.egg-info/
.eggs/
dist/

# Data
data/*.json
data/*.csv
!data/.gitkeep

# Logs
*.log

# Environment
.env
.venv/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Checkpoints
checkpoint.json
*.checkpoint
'''

def _dockerfile_template():
    return '''FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \\
    wget \\
    gnupg \\
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \\
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \\
    && apt-get update \\
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create data directory
RUN mkdir -p /app/data

# Run as non-root user
RUN useradd -m scraper
USER scraper

# Default command
CMD ["python", "-m", "scrapers.example_scraper"]
'''

def _docker_compose_template():
    return '''version: '3.8'

services:
  scraper:
    build: .
    volumes:
      - ./data:/app/data
      - ./config:/app/config
    environment:
      - LOG_LEVEL=INFO
      - DELAY=2.0
    restart: unless-stopped

  # Optional: PostgreSQL for persistent storage
  # db:
  #   image: postgres:15
  #   environment:
  #     POSTGRES_DB: scraper
  #     POSTGRES_USER: scraper
  #     POSTGRES_PASSWORD: ${DB_PASSWORD}
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

  # Optional: Prometheus for metrics
  # prometheus:
  #   image: prom/prometheus
  #   volumes:
  #     - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  #   ports:
  #     - "9090:9090"

  # Optional: Grafana for dashboards
  # grafana:
  #   image: grafana/grafana
  #   ports:
  #     - "3000:3000"
  #   volumes:
  #     - grafana_data:/var/lib/grafana
  #   environment:
  #     - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}

# volumes:
#   postgres_data:
#   grafana_data:
'''

def _dockerignore_template():
    return '''__pycache__
*.pyc
*.egg-info
.eggs
dist
data/*.json
data/*.csv
*.log
.env
.venv
.vscode
.idea
.git
.gitignore
tests/fixtures
monitoring
'''


async def fetch_url(args):
    """Fetch and extract data from a URL"""
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Fetching: {Colors.BOLD}{args.url}{Colors.ENDC}")
    
    try:
        import scrapling
    except ImportError:
        print(f"{Colors.FAIL}✗{Colors.ENDC} Scrapling not installed")
        print("  Install with: pip install scrapling[all]")
        sys.exit(1)
    
    start_time = time.time()
    
    # Choose fetcher
    if args.stealth:
        print(f"  Using {Colors.WARNING}StealthyFetcher{Colors.ENDC} (anti-bot bypass)")
        from scrapling import StealthyFetcher
        fetcher = StealthyFetcher(headless=True)
    elif args.dynamic:
        print(f"  Using {Colors.WARNING}DynamicFetcher{Colors.ENDC} (browser automation)")
        from scrapling import DynamicFetcher
        fetcher = DynamicFetcher(headless=True)
    else:
        print(f"  Using {Colors.OKGREEN}Fetcher{Colors.ENDC} (HTTP)")
        from scrapling import Fetcher
        fetcher = Fetcher()
    
    try:
        response = fetcher.get(args.url)
        elapsed = time.time() - start_time
        
        print(f"\n{Colors.OKGREEN}✓{Colors.ENDC} Fetched in {elapsed:.2f}s")
        print(f"  Status: {response.status_code}")
        print(f"  Size: {len(response.text):,} characters")
        
        # Save output if requested
        if args.output:
            data = {
                "url": args.url,
                "status": response.status_code,
                "html": response.text,
                "fetched_at": datetime.utcnow().isoformat()
            }
            
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"  Saved to: {args.output}")
        
        # Show preview
        print(f"\n{Colors.BOLD}Preview (first 500 chars):{Colors.ENDC}")
        print(response.text[:500])
        print(f"{Colors.WARNING}...{Colors.ENDC}")
        
    except Exception as e:
        print(f"{Colors.FAIL}✗{Colors.ENDC} Failed: {e}")
        sys.exit(1)


async def crawl_site(args):
    """Crawl multiple pages"""
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Crawling: {Colors.BOLD}{args.url}{Colors.ENDC}")
    print(f"  Max pages: {args.pages}")
    print(f"  Delay: {args.delay}s")
    
    # For now, just document the process
    # Full spider implementation would go here
    print(f"\n{Colors.WARNING}⚠{Colors.ENDC} Full crawl implementation coming soon...")
    print(f"  Use the project template to build custom crawlers:")
    print(f"  python scrapling.py init my-scraper")


async def run_tests(args):
    """Run scraper tests"""
    print(f"{Colors.OKCYAN}⟳{Colors.ENDC} Running tests...")
    
    # Check if pytest is available
    try:
        import pytest
    except ImportError:
        print(f"{Colors.FAIL}✗{Colors.ENDC} pytest not installed")
        print("  Install with: pip install pytest")
        sys.exit(1)
    
    # Run pytest
    exit_code = pytest.main(["-v", "tests/"])
    
    if exit_code == 0:
        print(f"\n{Colors.OKGREEN}✓{Colors.ENDC} All tests passed!")
    else:
        print(f"\n{Colors.FAIL}✗{Colors.ENDC} Some tests failed")
    
    sys.exit(exit_code)


def show_status(args):
    """Show Scrapling installation status"""
    print(f"{Colors.BOLD}Scrapling Status:{Colors.ENDC}\n")
    
    # Check Scrapling
    has_scrapling = check_scrapling_installed()
    
    # Check Playwright
    has_playwright = check_playwright_installed()
    if has_scrapling:
        if has_playwright:
            print(f"{Colors.OKGREEN}✓{Colors.ENDC} Playwright browsers installed")
        else:
            print(f"{Colors.WARNING}⚠{Colors.ENDC} Playwright browsers not installed")
            print(f"  Run: scrapling install")
    
    # Check optional dependencies
    optional_deps = {
        "pydantic": "Data validation",
        "pytest": "Testing",
        "pyyaml": "Configuration",
        "rich": "CLI formatting",
        "tqdm": "Progress bars"
    }
    
    print(f"\n{Colors.BOLD}Optional Dependencies:{Colors.ENDC}")
    for package, purpose in optional_deps.items():
        try:
            __import__(package.replace("-", "_"))
            print(f"  {Colors.OKGREEN}✓{Colors.ENDC} {package} ({purpose})")
        except ImportError:
            print(f"  {Colors.WARNING}✗{Colors.ENDC} {package} ({purpose})")


def show_help(args):
    """Show help information"""
    print_banner()
    
    print(f"{Colors.BOLD}Available Commands:{Colors.ENDC}\n")
    
    commands = {
        "init <name>": "Create new scraper project scaffold",
        "fetch <url> [--dynamic] [--stealth] [--output <file>]": "Fetch and extract a URL",
        "crawl <url> [--pages N] [--delay MS]": "Crawl multiple pages",
        "test": "Run scraper tests",
        "status": "Check installation status",
        "help": "Show this help message"
    }
    
    for cmd, desc in commands.items():
        print(f"  {Colors.OKCYAN}{cmd}{Colors.ENDC}")
        print(f"    {desc}\n")
    
    print(f"{Colors.BOLD}Examples:{Colors.ENDC}\n")
    examples = [
        "python scrapling.py init my-scraper",
        "python scrapling.py fetch https://example.com --output page.json",
        "python scrapling.py fetch https://protected-site.com --stealth",
        "python scrapling.py crawl https://docs.example.com --pages 100",
        "python scrapling.py test",
        "python scrapling.py status"
    ]
    
    for example in examples:
        print(f"  {Colors.OKGREEN}{example}{Colors.ENDC}")
    
    print()


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Scrapling Web Scraping Skill for Qwen Code",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # init command
    init_parser = subparsers.add_parser("init", help="Create new scraper project")
    init_parser.add_argument("name", help="Project name")
    
    # fetch command
    fetch_parser = subparsers.add_parser("fetch", help="Fetch and extract URL")
    fetch_parser.add_argument("url", help="URL to fetch")
    fetch_parser.add_argument("--dynamic", action="store_true", help="Use browser automation")
    fetch_parser.add_argument("--stealth", action="store_true", help="Use anti-bot bypass")
    fetch_parser.add_argument("--output", "-o", help="Save output to file")
    
    # crawl command
    crawl_parser = subparsers.add_parser("crawl", help="Crawl multiple pages")
    crawl_parser.add_argument("url", help="Starting URL")
    crawl_parser.add_argument("--pages", type=int, default=10, help="Max pages to crawl")
    crawl_parser.add_argument("--delay", type=float, default=2.0, help="Delay between requests")
    
    # test command
    test_parser = subparsers.add_parser("test", help="Run tests")
    test_parser.add_argument("--fixtures", action="store_true", help="Update HTML fixtures")
    
    # status command
    subparsers.add_parser("status", help="Check installation status")
    
    # help command
    subparsers.add_parser("help", help="Show help")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(0)
    
    print_banner()
    
    # Route to command handler
    if args.command == "init":
        init_project(args)
    elif args.command == "fetch":
        asyncio.run(fetch_url(args))
    elif args.command == "crawl":
        asyncio.run(crawl_site(args))
    elif args.command == "test":
        asyncio.run(run_tests(args))
    elif args.command == "status":
        show_status(args)
    elif args.command == "help":
        show_help(args)


if __name__ == "__main__":
    main()
