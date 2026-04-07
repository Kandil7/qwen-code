#!/usr/bin/env python3
"""
Scrapling Monitoring & Observability Utilities

Provides:
- Prometheus metrics exporter for scraper metrics
- Structured JSON logging with correlation IDs
- Selector drift detection
- Proxy health monitoring
- Alert threshold checking
- Health check endpoints

Usage:
    from scrapling_monitoring import ScraperMetrics
    metrics = ScraperMetrics()
    metrics.record_request_success(True, domain="example.com")
    metrics.export_prometheus()
"""

import json
import logging
import time
import uuid
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any


class ScraperMetrics:
    """Track and export scraper-specific metrics."""
    
    def __init__(self):
        self.reset()
    
    def reset(self):
        """Reset all metrics."""
        self.request_count = defaultdict(int)
        self.request_success = defaultdict(int)
        self.request_failure = defaultdict(int)
        self.request_duration = defaultdict(list)
        self.items_extracted = defaultdict(int)
        self.validation_failures = defaultdict(int)
        self.selector_drift_count = defaultdict(int)
        self.proxy_success = defaultdict(int)
        self.proxy_failure = defaultdict(int)
        self.start_time = time.time()
    
    def record_request_success(self, domain: str, duration: float, items_extracted: int = 0):
        """Record successful request."""
        self.request_count[domain] += 1
        self.request_success[domain] += 1
        self.request_duration[domain].append(duration)
        self.items_extracted[domain] += items_extracted
    
    def record_request_failure(self, domain: str, duration: float, error: str = ""):
        """Record failed request."""
        self.request_count[domain] += 1
        self.request_failure[domain] += 1
        self.request_duration[domain].append(duration)
    
    def record_validation_failure(self, domain: str, count: int = 1):
        """Record data validation failure."""
        self.validation_failures[domain] += count
    
    def record_selector_drift(self, domain: str, count: int = 1):
        """Record selector drift detection."""
        self.selector_drift_count[domain] += count
    
    def record_proxy_success(self, proxy_id: str):
        """Record successful proxy request."""
        self.proxy_success[proxy_id] += 1
    
    def record_proxy_failure(self, proxy_id: str):
        """Record failed proxy request."""
        self.proxy_failure[proxy_id] += 1
    
    def get_success_rate(self, domain: str) -> float:
        """Get success rate for domain."""
        total = self.request_count[domain]
        if total == 0:
            return 100.0
        return (self.request_success[domain] / total) * 100
    
    def get_avg_response_time(self, domain: str) -> float:
        """Get average response time for domain."""
        durations = self.request_duration[domain]
        if not durations:
            return 0.0
        return sum(durations) / len(durations)
    
    def get_p95_response_time(self, domain: str) -> float:
        """Get 95th percentile response time."""
        durations = sorted(self.request_duration[domain])
        if not durations:
            return 0.0
        idx = int(len(durations) * 0.95)
        return durations[min(idx, len(durations) - 1)]
    
    def get_items_per_request(self, domain: str) -> float:
        """Get average items extracted per request."""
        total = self.request_count[domain]
        if total == 0:
            return 0.0
        return self.items_extracted[domain] / total
    
    def detect_selector_drift(self, domain: str, baseline_items: int, threshold: float = 0.3) -> bool:
        """
        Detect selector drift by comparing current extraction count to baseline.
        
        Args:
            domain: Target domain
            baseline_items: Expected number of items per page
            threshold: Percentage drop to trigger drift detection (default 30%)
        
        Returns:
            True if drift detected
        """
        current = self.get_items_per_request(domain)
        if baseline_items == 0:
            return False
        
        drop = (baseline_items - current) / baseline_items
        if drop > threshold:
            self.record_selector_drift(domain)
            return True
        return False
    
    def export_prometheus(self) -> str:
        """Export metrics in Prometheus exposition format."""
        lines = []
        timestamp = int(time.time() * 1000)
        
        # Request success rate
        lines.append("# HELP scraper_request_success_total Total successful requests")
        lines.append("# TYPE scraper_request_success_total counter")
        for domain, count in self.request_success.items():
            lines.append(f'scraper_request_success_total{{domain="{domain}"}} {count}')
        
        # Request failures
        lines.append("# HELP scraper_request_failures_total Total failed requests")
        lines.append("# TYPE scraper_request_failures_total counter")
        for domain, count in self.request_failure.items():
            lines.append(f'scraper_request_failures_total{{domain="{domain}"}} {count}')
        
        # Items extracted
        lines.append("# HELP scraper_items_extracted_total Total items extracted")
        lines.append("# TYPE scraper_items_extracted_total counter")
        for domain, count in self.items_extracted.items():
            lines.append(f'scraper_items_extracted_total{{domain="{domain}"}} {count}')
        
        # Success rate gauge
        lines.append("# HELP scraper_success_rate_percent Success rate percentage")
        lines.append("# TYPE scraper_success_rate_percent gauge")
        for domain in self.request_count:
            rate = self.get_success_rate(domain)
            lines.append(f'scraper_success_rate_percent{{domain="{domain}"}} {rate:.1f}')
        
        # Response time histogram
        lines.append("# HELP scraper_request_duration_seconds Request duration in seconds")
        lines.append("# TYPE scraper_request_duration_seconds histogram")
        for domain in self.request_duration:
            avg = self.get_avg_response_time(domain)
            p95 = self.get_p95_response_time(domain)
            lines.append(f'scraper_request_duration_seconds_bucket{{domain="{domain}",le="0.5"}} 0')
            lines.append(f'scraper_request_duration_seconds_bucket{{domain="{domain}",le="1.0"}} 0')
            lines.append(f'scraper_request_duration_seconds_bucket{{domain="{domain}",le="5.0"}} 0')
            lines.append(f'scraper_request_duration_seconds_bucket{{domain="{domain}",le="+Inf"}} {len(self.request_duration[domain])}')
            lines.append(f'scraper_request_duration_seconds_sum{{domain="{domain}"}} {sum(self.request_duration[domain]):.3f}')
            lines.append(f'scraper_request_duration_seconds_count{{domain="{domain}"}} {len(self.request_duration[domain])}')
        
        # Selector drift
        lines.append("# HELP scraper_selector_drift_detected Selector drift detection count")
        lines.append("# TYPE scraper_selector_drift_detected gauge")
        for domain, count in self.selector_drift_count.items():
            lines.append(f'scraper_selector_drift_detected{{domain="{domain}"}} {count}')
        
        # Proxy health
        lines.append("# HELP scraper_proxy_active Active proxy count")
        lines.append("# TYPE scraper_proxy_active gauge")
        lines.append(f"scraper_proxy_active {len(self.proxy_success)}")
        
        lines.append("# HELP scraper_proxy_failed Failed proxy count")
        lines.append("# TYPE scraper_proxy_failed gauge")
        lines.append(f"scraper_proxy_failed {len(self.proxy_failure)}")
        
        # Uptime
        uptime = time.time() - self.start_time
        lines.append("# HELP scraper_uptime_seconds Scraper uptime in seconds")
        lines.append("# TYPE scraper_uptime_seconds gauge")
        lines.append(f"scraper_uptime_seconds {uptime:.0f}")
        
        return "\n".join(lines)
    
    def export_json(self) -> Dict[str, Any]:
        """Export metrics as JSON."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": time.time() - self.start_time,
            "domains": {
                domain: {
                    "total_requests": self.request_count[domain],
                    "successful": self.request_success[domain],
                    "failed": self.request_failure[domain],
                    "success_rate": f"{self.get_success_rate(domain):.1f}%",
                    "avg_response_time": f"{self.get_avg_response_time(domain):.3f}s",
                    "p95_response_time": f"{self.get_p95_response_time(domain):.3f}s",
                    "items_extracted": self.items_extracted[domain],
                    "items_per_request": f"{self.get_items_per_request(domain):.2f}",
                    "validation_failures": self.validation_failures[domain],
                    "selector_drift": self.selector_drift_count[domain]
                }
                for domain in self.request_count
            },
            "proxy": {
                "active": len(self.proxy_success),
                "failed": len(self.proxy_failure),
                "details": {
                    proxy_id: {
                        "success": count,
                        "failure": self.proxy_failure.get(proxy_id, 0)
                    }
                    for proxy_id, count in self.proxy_success.items()
                }
            }
        }


class StructuredLogger:
    """JSON structured logger with correlation IDs."""
    
    def __init__(self, name: str = "scraper"):
        self.logger = logging.getLogger(name)
        self.correlation_id = str(uuid.uuid4())
    
    def _format(self, level: str, message: str, **kwargs) -> dict:
        """Format log entry as structured JSON."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "correlation_id": self.correlation_id,
            "message": message,
            **kwargs
        }
    
    def info(self, message: str, **kwargs):
        """Log info message."""
        entry = self._format("INFO", message, **kwargs)
        self.logger.info(json.dumps(entry, default=str))
    
    def warning(self, message: str, **kwargs):
        """Log warning message."""
        entry = self._format("WARNING", message, **kwargs)
        self.logger.warning(json.dumps(entry, default=str))
    
    def error(self, message: str, **kwargs):
        """Log error message."""
        entry = self._format("ERROR", message, **kwargs)
        self.logger.error(json.dumps(entry, default=str))
    
    def debug(self, message: str, **kwargs):
        """Log debug message."""
        entry = self._format("DEBUG", message, **kwargs)
        self.logger.debug(json.dumps(entry, default=str))
    
    def new_correlation_id(self):
        """Generate new correlation ID for new request chain."""
        self.correlation_id = str(uuid.uuid4())
        return self.correlation_id


class AlertChecker:
    """Check metrics against alert thresholds."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.alerts = []
    
    def check(self, metrics: ScraperMetrics) -> List[Dict[str, Any]]:
        """
        Check all metrics against thresholds.
        
        Returns:
            List of triggered alerts
        """
        self.alerts = []
        
        for domain in metrics.request_count:
            # Check failure rate
            failure_rate = self._get_failure_rate(metrics, domain)
            if failure_rate >= self.config.get("failure_rate", {}).get("critical", 25):
                self._add_alert("critical", "failure_rate", domain, failure_rate)
            elif failure_rate >= self.config.get("failure_rate", {}).get("warning", 10):
                self._add_alert("warning", "failure_rate", domain, failure_rate)
            
            # Check selector drift
            if metrics.selector_drift_count.get(domain, 0) > 0:
                self._add_alert("warning", "selector_drift", domain, metrics.selector_drift_count[domain])
            
            # Check validation failures
            validation_rate = self._get_validation_rate(metrics, domain)
            if validation_rate >= self.config.get("validation_failure_rate", {}).get("critical", 15):
                self._add_alert("critical", "validation_failure", domain, validation_rate)
            elif validation_rate >= self.config.get("validation_failure_rate", {}).get("warning", 5):
                self._add_alert("warning", "validation_failure", domain, validation_rate)
        
        return self.alerts
    
    def _get_failure_rate(self, metrics: ScraperMetrics, domain: str) -> float:
        """Calculate failure rate percentage."""
        total = metrics.request_count[domain]
        if total == 0:
            return 0.0
        return (metrics.request_failure[domain] / total) * 100
    
    def _get_validation_rate(self, metrics: ScraperMetrics, domain: str) -> float:
        """Calculate validation failure rate percentage."""
        total = metrics.request_count[domain]
        if total == 0:
            return 0.0
        return (metrics.validation_failures[domain] / total) * 100
    
    def _add_alert(self, severity: str, alert_type: str, domain: str, value: float):
        """Add alert to list."""
        self.alerts.append({
            "severity": severity,
            "type": alert_type,
            "domain": domain,
            "value": value,
            "timestamp": datetime.utcnow().isoformat()
        })


class HealthChecker:
    """Health check endpoint for scraper services."""
    
    def __init__(self, metrics: ScraperMetrics):
        self.metrics = metrics
    
    def check(self) -> Dict[str, Any]:
        """Run health checks and return status."""
        status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {}
        }
        
        # Check success rate
        overall_success = self._overall_success_rate()
        status["checks"]["success_rate"] = {
            "status": "healthy" if overall_success >= 95 else "degraded" if overall_success >= 80 else "unhealthy",
            "value": f"{overall_success:.1f}%"
        }
        
        # Check response times
        avg_latency = self._overall_avg_latency()
        status["checks"]["latency"] = {
            "status": "healthy" if avg_latency < 5 else "degraded" if avg_latency < 10 else "unhealthy",
            "value": f"{avg_latency:.2f}s"
        }
        
        # Check for selector drift
        drift_count = sum(self.metrics.selector_drift_count.values())
        status["checks"]["selector_drift"] = {
            "status": "healthy" if drift_count == 0 else "unhealthy",
            "value": drift_count
        }
        
        # Determine overall status
        checks = [c["status"] for c in status["checks"].values()]
        if "unhealthy" in checks:
            status["status"] = "unhealthy"
        elif "degraded" in checks:
            status["status"] = "degraded"
        
        return status
    
    def _overall_success_rate(self) -> float:
        """Calculate overall success rate across all domains."""
        total = sum(self.metrics.request_count.values())
        if total == 0:
            return 100.0
        success = sum(self.metrics.request_success.values())
        return (success / total) * 100
    
    def _overall_avg_latency(self) -> float:
        """Calculate overall average latency."""
        all_durations = []
        for durations in self.metrics.request_duration.values():
            all_durations.extend(durations)
        
        if not all_durations:
            return 0.0
        return sum(all_durations) / len(all_durations)


# Example usage
if __name__ == "__main__":
    # Initialize metrics
    metrics = ScraperMetrics()
    logger = StructuredLogger()
    
    # Simulate some requests
    logger.info("Starting scraper monitoring demo")
    
    metrics.record_request_success("example.com", 1.2, items_extracted=10)
    metrics.record_request_success("example.com", 0.8, items_extracted=8)
    metrics.record_request_failure("example.com", 5.0)
    metrics.record_request_success("shop.example.com", 2.1, items_extracted=15)
    
    # Check health
    health = HealthChecker(metrics)
    print("Health Status:")
    print(json.dumps(health.check(), indent=2))
    
    # Export Prometheus metrics
    print("\nPrometheus Metrics:")
    print(metrics.export_prometheus())
    
    # Export JSON
    print("\nJSON Metrics:")
    print(json.dumps(metrics.export_json(), indent=2))
