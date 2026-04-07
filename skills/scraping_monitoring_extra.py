#!/usr/bin/env python3
"""
Firecrawl & Scrapy Monitoring Utilities

Extends the Scrapling monitoring module with framework-specific metrics:
- Firecrawl: API usage, costs, agent accuracy, endpoint success rates
- Scrapy: Crawl stats, pipeline throughput, spider health

Usage:
    from scraping_monitoring_extra import FirecrawlMonitor, ScrapyMonitor
    
    # Firecrawl monitoring
    fc_mon = FirecrawlMonitor(api_key="...")
    fc_mon.record_api_call("scrape", success=True, cost=0.01)
    print(fc_mon.export_json())
    
    # Scrapy monitoring
    sc_mon = ScrapyMonitor()
    sc_mon.record_spider_stats("products", items=1500, pages=75, errors=3)
    print(sc_mon.export_prometheus())
"""

import json
import time
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Any, Optional


class FirecrawlMonitor:
    """Monitor Firecrawl API usage, costs, and quality."""
    
    ENDPOINT_COSTS = {
        "scrape": 0.001,    # Per page
        "crawl": 0.002,     # Per page
        "agent": 0.05,      # Per request (AI cost)
        "search": 0.005,    # Per search
        "map": 0.0005,      # Per domain
        "interact": 0.01,   # Per interaction
        "batch_scrape": 0.0008,  # Per URL
    }
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key
        self.reset()
    
    def reset(self):
        """Reset all metrics."""
        self.api_calls = defaultdict(int)
        self.api_success = defaultdict(int)
        self.api_failures = defaultdict(int)
        self.api_latency = defaultdict(list)
        self.api_costs = defaultdict(float)
        self.pages_extracted = 0
        self.agent_accuracy = []  # Track agent result quality
        self.rate_limit_hits = 0
        self.start_time = time.time()
    
    def record_api_call(
        self,
        endpoint: str,
        success: bool = True,
        latency_ms: float = 0,
        cost: float = None,
        pages: int = 1
    ):
        """Record an API call."""
        self.api_calls[endpoint] += 1
        
        if success:
            self.api_success[endpoint] += 1
            self.pages_extracted += pages
        else:
            self.api_failures[endpoint] += 1
        
        if latency_ms > 0:
            self.api_latency[endpoint].append(latency_ms)
        
        # Track cost (use provided or estimate)
        if cost is not None:
            self.api_costs[endpoint] += cost
        else:
            self.api_costs[endpoint] += self.ENDPOINT_COSTS.get(endpoint, 0) * pages
    
    def record_agent_accuracy(self, accuracy: float):
        """Record agent extraction accuracy (0-100)."""
        self.agent_accuracy.append(accuracy)
    
    def record_rate_limit(self):
        """Record a rate limit hit."""
        self.rate_limit_hits += 1
    
    def get_success_rate(self, endpoint: str) -> float:
        """Get success rate for endpoint."""
        total = self.api_calls[endpoint]
        if total == 0:
            return 100.0
        return (self.api_success[endpoint] / total) * 100
    
    def get_avg_latency(self, endpoint: str) -> float:
        """Get average latency for endpoint."""
        latencies = self.api_latency[endpoint]
        if not latencies:
            return 0.0
        return sum(latencies) / len(latencies)
    
    def get_total_cost(self) -> float:
        """Get total estimated cost."""
        return sum(self.api_costs.values())
    
    def get_avg_agent_accuracy(self) -> float:
        """Get average agent accuracy."""
        if not self.agent_accuracy:
            return 0.0
        return sum(self.agent_accuracy) / len(self.agent_accuracy)
    
    def export_prometheus(self) -> str:
        """Export metrics in Prometheus format."""
        lines = []
        
        # API calls
        lines.append("# HELP firecrawl_api_calls_total Total API calls by endpoint")
        lines.append("# TYPE firecrawl_api_calls_total counter")
        for endpoint, count in self.api_calls.items():
            lines.append(f'firecrawl_api_calls_total{{endpoint="{endpoint}"}} {count}')
        
        # API failures
        lines.append("# HELP firecrawl_api_failures_total Total API failures by endpoint")
        lines.append("# TYPE firecrawl_api_failures_total counter")
        for endpoint, count in self.api_failures.items():
            lines.append(f'firecrawl_api_failures_total{{endpoint="{endpoint}"}} {count}')
        
        # Costs
        lines.append("# HELP firecrawl_cost_usd_total Total API cost in USD")
        lines.append("# TYPE firecrawl_cost_usd_total counter")
        for endpoint, cost in self.api_costs.items():
            lines.append(f'firecrawl_cost_usd_total{{endpoint="{endpoint}"}} {cost:.4f}')
        
        # Pages extracted
        lines.append("# HELP firecrawl_pages_extracted_total Total pages extracted")
        lines.append("# TYPE firecrawl_pages_extracted_total counter")
        lines.append(f"firecrawl_pages_extracted_total {self.pages_extracted}")
        
        # Agent accuracy
        accuracy = self.get_avg_agent_accuracy()
        lines.append("# HELP firecrawl_agent_accuracy Average agent accuracy percentage")
        lines.append("# TYPE firecrawl_agent_accuracy gauge")
        lines.append(f"firecrawl_agent_accuracy {accuracy:.1f}")
        
        # Rate limits
        lines.append("# HELP firecrawl_rate_limits_total Total rate limit hits")
        lines.append("# TYPE firecrawl_rate_limits_total counter")
        lines.append(f"firecrawl_rate_limits_total {self.rate_limit_hits}")
        
        # Total cost
        lines.append("# HELP firecrawl_total_cost_usd Total cost in USD")
        lines.append("# TYPE firecrawl_total_cost_usd gauge")
        lines.append(f"firecrawl_total_cost_usd {self.get_total_cost():.4f}")
        
        return "\n".join(lines)
    
    def export_json(self) -> Dict[str, Any]:
        """Export metrics as JSON."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": time.time() - self.start_time,
            "endpoints": {
                endpoint: {
                    "calls": self.api_calls[endpoint],
                    "success": self.api_success[endpoint],
                    "failed": self.api_failures[endpoint],
                    "success_rate": f"{self.get_success_rate(endpoint):.1f}%",
                    "avg_latency_ms": f"{self.get_avg_latency(endpoint):.0f}",
                    "cost_usd": f"{self.api_costs[endpoint]:.4f}"
                }
                for endpoint in self.api_calls
            },
            "summary": {
                "total_pages_extracted": self.pages_extracted,
                "total_cost_usd": f"{self.get_total_cost():.4f}",
                "agent_accuracy": f"{self.get_avg_agent_accuracy():.1f}%",
                "rate_limit_hits": self.rate_limit_hits
            }
        }


class ScrapyMonitor:
    """Monitor Scrapy spider statistics and pipeline health."""
    
    def __init__(self):
        self.reset()
    
    def reset(self):
        """Reset all metrics."""
        self.spider_runs = defaultdict(int)
        self.spider_items = defaultdict(int)
        self.spider_pages = defaultdict(int)
        self.spider_errors = defaultdict(int)
        self.spider_duration = defaultdict(list)
        self.pipeline_items_processed = defaultdict(int)
        self.pipeline_items_dropped = defaultdict(int)
        self.response_status_codes = defaultdict(lambda: defaultdict(int))
        self.start_time = time.time()
    
    def record_spider_stats(
        self,
        spider_name: str,
        items: int = 0,
        pages: int = 0,
        errors: int = 0,
        duration_seconds: float = 0
    ):
        """Record spider run statistics."""
        self.spider_runs[spider_name] += 1
        self.spider_items[spider_name] += items
        self.spider_pages[spider_name] += pages
        self.spider_errors[spider_name] += errors
        
        if duration_seconds > 0:
            self.spider_duration[spider_name].append(duration_seconds)
    
    def record_pipeline_item(self, pipeline_name: str, dropped: bool = False):
        """Record pipeline item processing."""
        self.pipeline_items_processed[pipeline_name] += 1
        if dropped:
            self.pipeline_items_dropped[pipeline_name] += 1
    
    def record_response(self, status_code: int, spider_name: str = None):
        """Record response status code."""
        key = spider_name or "all"
        self.response_status_codes[key][status_code] += 1
    
    def get_items_per_minute(self, spider_name: str) -> float:
        """Calculate items scraped per minute."""
        runs = self.spider_runs[spider_name]
        if runs == 0:
            return 0.0
        
        total_duration = sum(self.spider_duration[spider_name])
        if total_duration == 0:
            return 0.0
        
        return (self.spider_items[spider_name] / total_duration) * 60
    
    def get_error_rate(self, spider_name: str) -> float:
        """Calculate error rate percentage."""
        pages = self.spider_pages[spider_name]
        if pages == 0:
            return 0.0
        return (self.spider_errors[spider_name] / pages) * 100
    
    def get_pipeline_drop_rate(self, pipeline_name: str) -> float:
        """Calculate pipeline drop rate percentage."""
        processed = self.pipeline_items_processed[pipeline_name]
        if processed == 0:
            return 0.0
        return (self.pipeline_items_dropped[pipeline_name] / processed) * 100
    
    def export_prometheus(self) -> str:
        """Export metrics in Prometheus format."""
        lines = []
        
        # Spider runs
        lines.append("# HELP scrapy_spider_runs_total Total spider runs")
        lines.append("# TYPE scrapy_spider_runs_total counter")
        for spider, count in self.spider_runs.items():
            lines.append(f'scrapy_spider_runs_total{{spider="{spider}"}} {count}')
        
        # Items scraped
        lines.append("# HELP scrapy_items_scraped_total Total items scraped")
        lines.append("# TYPE scrapy_items_scraped_total counter")
        for spider, count in self.spider_items.items():
            lines.append(f'scrapy_items_scraped_total{{spider="{spider}"}} {count}')
        
        # Errors
        lines.append("# HELP scrapy_errors_total Total spider errors")
        lines.append("# TYPE scrapy_errors_total counter")
        for spider, count in self.spider_errors.items():
            lines.append(f'scrapy_errors_total{{spider="{spider}"}} {count}')
        
        # Pipeline
        lines.append("# HELP scrapy_pipeline_processed_total Pipeline processed items")
        lines.append("# TYPE scrapy_pipeline_processed_total counter")
        for pipeline, count in self.pipeline_items_processed.items():
            lines.append(f'scrapy_pipeline_processed_total{{pipeline="{pipeline}"}} {count}')
        
        lines.append("# HELP scrapy_pipeline_dropped_total Pipeline dropped items")
        lines.append("# TYPE scrapy_pipeline_dropped_total counter")
        for pipeline, count in self.pipeline_items_dropped.items():
            lines.append(f'scrapy_pipeline_dropped_total{{pipeline="{pipeline}"}} {count}')
        
        # Response status codes
        lines.append("# HELP scrapy_responses_total Response status codes")
        lines.append("# TYPE scrapy_responses_total counter")
        for spider, codes in self.response_status_codes.items():
            for code, count in codes.items():
                lines.append(f'scrapy_responses_total{{spider="{spider}",code="{code}"}} {count}')
        
        return "\n".join(lines)
    
    def export_json(self) -> Dict[str, Any]:
        """Export metrics as JSON."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": time.time() - self.start_time,
            "spiders": {
                spider: {
                    "runs": self.spider_runs[spider],
                    "items": self.spider_items[spider],
                    "pages": self.spider_pages[spider],
                    "errors": self.spider_errors[spider],
                    "error_rate": f"{self.get_error_rate(spider):.1f}%",
                    "items_per_minute": f"{self.get_items_per_minute(spider):.1f}",
                    "avg_duration_seconds": (
                        sum(self.spider_duration[spider]) / len(self.spider_duration[spider])
                        if self.spider_duration[spider] else 0
                    )
                }
                for spider in self.spider_runs
            },
            "pipelines": {
                pipeline: {
                    "processed": self.pipeline_items_processed[pipeline],
                    "dropped": self.pipeline_items_dropped[pipeline],
                    "drop_rate": f"{self.get_pipeline_drop_rate(pipeline):.1f}%"
                }
                for pipeline in self.pipeline_items_processed
            }
        }


# Unified dashboard exporter
class UnifiedDashboardExporter:
    """Export combined metrics from all three frameworks to a unified dashboard."""
    
    def __init__(self):
        self.metrics = {}
    
    def add_framework_metrics(self, framework: str, metrics: Dict[str, Any]):
        """Add metrics from a specific framework."""
        self.metrics[framework] = metrics
    
    def export_dashboard_json(self) -> Dict[str, Any]:
        """Export unified dashboard as JSON."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "frameworks": self.metrics,
            "summary": {
                "total_frameworks": len(self.metrics),
                "active_frameworks": [
                    name for name, data in self.metrics.items()
                    if data.get("spiders") or data.get("endpoints") or data.get("domains")
                ]
            }
        }


# Example usage
if __name__ == "__main__":
    # Firecrawl monitoring
    fc_mon = FirecrawlMonitor()
    fc_mon.record_api_call("scrape", success=True, latency_ms=3200, pages=1)
    fc_mon.record_api_call("scrape", success=True, latency_ms=2800, pages=1)
    fc_mon.record_api_call("agent", success=True, latency_ms=15000)
    fc_mon.record_agent_accuracy(92.5)
    
    print("Firecrawl Metrics:")
    print(json.dumps(fc_mon.export_json(), indent=2))
    
    # Scrapy monitoring
    sc_mon = ScrapyMonitor()
    sc_mon.record_spider_stats("products", items=1500, pages=75, errors=3, duration_seconds=300)
    sc_mon.record_spider_stats("articles", items=500, pages=50, errors=1, duration_seconds=180)
    sc_mon.record_pipeline_item("ValidationPipeline", dropped=False)
    sc_mon.record_pipeline_item("ValidationPipeline", dropped=True)
    sc_mon.record_pipeline_item("DatabasePipeline", dropped=False)
    
    print("\nScrapy Metrics:")
    print(json.dumps(sc_mon.export_json(), indent=2))
