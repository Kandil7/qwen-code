#!/usr/bin/env python3
"""
Unified Scraping Data Quality Framework

Provides a shared validation layer that works across all three frameworks:
- Scrapling (adaptive parsing)
- Firecrawl (AI-powered extraction)
- Scrapy (production crawling)

Features:
- Pydantic-based schema validation
- Data quality scoring (completeness, accuracy, consistency)
- Deduplication
- Field-level validation rules
- Quality reports
- Alert thresholds

Usage:
    from scraping_data_quality import QualityChecker, ProductSchema
    
    checker = QualityChecker()
    
    # Validate extracted data
    result = checker.validate(raw_data, ProductSchema)
    print(f"Valid: {result.valid_count}, Invalid: {result.invalid_count}")
    print(f"Quality Score: {result.quality_score:.1f}%")
    
    # Get quality report
    report = checker.report()
    print(report.summary)
"""

from pydantic import BaseModel, Field, ValidationError, field_validator
from typing import List, Dict, Any, Optional, Type
from datetime import datetime
from dataclasses import dataclass, field
from collections import defaultdict
import hashlib
import json


@dataclass
class ValidationResult:
    """Result of a validation batch."""
    valid: List[dict] = field(default_factory=list)
    invalid: List[dict] = field(default_factory=list)
    errors: List[dict] = field(default_factory=list)
    duplicates: List[dict] = field(default_factory=list)
    
    @property
    def valid_count(self) -> int:
        return len(self.valid)
    
    @property
    def invalid_count(self) -> int:
        return len(self.invalid)
    
    @property
    def duplicate_count(self) -> int:
        return len(self.duplicates)
    
    @property
    def total_count(self) -> int:
        return self.valid_count + self.invalid_count
    
    @property
    def quality_score(self) -> float:
        if self.total_count == 0:
            return 100.0
        return (self.valid_count / self.total_count) * 100


class QualityReport:
    """Detailed quality report with field-level metrics."""
    
    def __init__(self):
        self.timestamp = datetime.utcnow()
        self.total_items = 0
        self.valid_items = 0
        self.invalid_items = 0
        self.duplicate_items = 0
        self.field_completeness: Dict[str, float] = {}
        self.value_distributions: Dict[str, Dict] = {}
        self.error_summary: Dict[str, int] = defaultdict(int)
        self.alerts: List[dict] = []
    
    def add_error(self, field: str, error_type: str):
        """Track error by type."""
        self.error_summary[f"{field}:{error_type}"] += 1
    
    def add_alert(self, severity: str, message: str):
        """Add alert to report."""
        self.alerts.append({
            "severity": severity,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def calculate_field_completeness(self, items: List[dict]):
        """Calculate how complete each field is across items."""
        if not items:
            return
        
        field_counts = defaultdict(int)
        for item in items:
            for key in item:
                if item[key] is not None and item[key] != "":
                    field_counts[key] += 1
        
        total = len(items)
        self.field_completeness = {
            k: (v / total) * 100 for k, v in field_counts.items()
        }
    
    def to_dict(self) -> dict:
        """Convert report to dictionary."""
        return {
            "timestamp": self.timestamp.isoformat(),
            "total_items": self.total_items,
            "valid_items": self.valid_items,
            "invalid_items": self.invalid_items,
            "duplicate_items": self.duplicate_items,
            "quality_score": (self.valid_items / self.total_items * 100) if self.total_items > 0 else 100.0,
            "field_completeness": self.field_completeness,
            "error_summary": dict(self.error_summary),
            "alerts": self.alerts
        }
    
    @property
    def summary(self) -> str:
        """Human-readable summary."""
        score = (self.valid_items / self.total_items * 100) if self.total_items > 0 else 100.0
        
        lines = [
            f"Quality Report ({self.timestamp.strftime('%Y-%m-%d %H:%M:%S')})",
            f"=" * 50,
            f"Total Items: {self.total_items}",
            f"Valid: {self.valid_items} ({score:.1f}%)",
            f"Invalid: {self.invalid_items}",
            f"Duplicates: {self.duplicate_items}",
        ]
        
        if self.field_completeness:
            lines.append("\nField Completeness:")
            for field_name, completeness in self.field_completeness.items():
                status = "✓" if completeness >= 90 else "⚠" if completeness >= 70 else "✗"
                lines.append(f"  {status} {field_name}: {completeness:.1f}%")
        
        if self.error_summary:
            lines.append("\nTop Errors:")
            for error, count in sorted(self.error_summary.items(), key=lambda x: -x[1])[:5]:
                lines.append(f"  - {error}: {count}")
        
        if self.alerts:
            lines.append("\nAlerts:")
            for alert in self.alerts:
                lines.append(f"  [{alert['severity'].upper()}] {alert['message']}")
        
        return "\n".join(lines)


class QualityChecker:
    """
    Unified data quality checker for all scraping frameworks.
    
    Works with:
    - Scrapling extracted data
    - Firecrawl extracted data
    - Scrapy scraped items
    """
    
    def __init__(
        self,
        deduplicate: bool = True,
        dedup_key: str = "url",
        min_quality_score: float = 80.0,
        max_invalid_rate: float = 20.0,
        min_completeness: float = 70.0
    ):
        self.deduplicate = deduplicate
        self.dedup_key = dedup_key
        self.min_quality_score = min_quality_score
        self.max_invalid_rate = max_invalid_rate
        self.min_completeness = min_completeness
        self.seen_hashes = set()
        self.report = QualityReport()
    
    def _generate_hash(self, item: dict) -> str:
        """Generate deduplication hash for an item."""
        # Use specified key if available, otherwise hash entire item
        if self.dedup_key in item:
            content = str(item[self.dedup_key])
        else:
            content = json.dumps(item, sort_keys=True, default=str)
        return hashlib.md5(content.encode()).hexdigest()
    
    def _is_duplicate(self, item: dict) -> bool:
        """Check if item is a duplicate."""
        if not self.deduplicate:
            return False
        
        item_hash = self._generate_hash(item)
        if item_hash in self.seen_hashes:
            return True
        
        self.seen_hashes.add(item_hash)
        return False
    
    def validate(
        self,
        data: List[dict],
        schema: Type[BaseModel]
    ) -> ValidationResult:
        """
        Validate a list of dicts against a Pydantic schema.
        
        Args:
            data: List of extracted data dicts
            schema: Pydantic model to validate against
        
        Returns:
            ValidationResult with valid/invalid items
        """
        result = ValidationResult()
        
        for idx, item in enumerate(data):
            try:
                # Check for duplicates
                if self._is_duplicate(item):
                    result.duplicates.append(item)
                    self.report.duplicate_items += 1
                    continue
                
                # Validate against schema
                validated = schema(**item)
                result.valid.append(validated.model_dump())
                self.report.valid_items += 1
                
            except ValidationError as e:
                error_info = {
                    "index": idx,
                    "data": item,
                    "errors": [
                        {"field": err["loc"][0], "message": err["msg"]}
                        for err in e.errors()
                    ]
                }
                result.invalid.append(error_info)
                self.report.invalid_items += 1
                
                # Track error types
                for err in e.errors():
                    self.report.add_error(
                        str(err["loc"][0]) if err["loc"] else "unknown",
                        err["type"]
                    )
        
        self.report.total_items = self.report.valid_items + self.report.invalid_items + self.report.duplicate_items
        
        # Calculate field completeness
        self.report.calculate_field_completeness(result.valid)
        
        # Check quality thresholds
        self._check_thresholds()
        
        return result
    
    def validate_raw(self, data: List[dict], required_fields: List[str] = None) -> ValidationResult:
        """
        Validate raw data without schema (basic checks only).
        
        Args:
            data: List of extracted data dicts
            required_fields: List of required field names
        
        Returns:
            ValidationResult
        """
        result = ValidationResult()
        
        for idx, item in enumerate(data):
            try:
                # Check for duplicates
                if self._is_duplicate(item):
                    result.duplicates.append(item)
                    self.report.duplicate_items += 1
                    continue
                
                # Check required fields
                if required_fields:
                    missing = [f for f in required_fields if f not in item or item[f] is None]
                    if missing:
                        raise ValueError(f"Missing required fields: {missing}")
                
                result.valid.append(item)
                self.report.valid_items += 1
                
            except (ValueError, TypeError) as e:
                result.invalid.append({
                    "index": idx,
                    "data": item,
                    "errors": [{"message": str(e)}]
                })
                self.report.invalid_items += 1
        
        self.report.total_items = self.report.valid_items + self.report.invalid_items + self.report.duplicate_items
        self.report.calculate_field_completeness(result.valid)
        self._check_thresholds()
        
        return result
    
    def _check_thresholds(self):
        """Check quality thresholds and add alerts."""
        score = self.report.quality_score
        
        if score < self.min_quality_score:
            self.report.add_alert(
                "critical",
                f"Quality score {score:.1f}% is below threshold {self.min_quality_score}%"
            )
        elif score < self.min_quality_score + 10:
            self.report.add_alert(
                "warning",
                f"Quality score {score:.1f}% is approaching threshold {self.min_quality_score}%"
            )
        
        # Check field completeness
        for field_name, completeness in self.report.field_completeness.items():
            if completeness < self.min_completeness:
                self.report.add_alert(
                    "warning",
                    f"Field '{field_name}' completeness {completeness:.1f}% is below {self.min_completeness}%"
                )
        
        # Check invalid rate
        invalid_rate = (self.report.invalid_items / self.report.total_items * 100) if self.report.total_items > 0 else 0
        if invalid_rate > self.max_invalid_rate:
            self.report.add_alert(
                "critical",
                f"Invalid rate {invalid_rate:.1f}% exceeds threshold {self.max_invalid_rate}%"
            )
    
    def generate_report(self) -> str:
        """Generate and return quality report."""
        return self.report.summary
    
    def export_report(self, filepath: str):
        """Export quality report to JSON file."""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(self.report.to_dict(), f, indent=2, default=str)


# Example schemas for common use cases
class ProductSchema(BaseModel):
    """Product data schema."""
    name: str = Field(..., min_length=1, max_length=500, description="Product name")
    price: float = Field(..., gt=0, lt=1_000_000, description="Price in USD")
    url: str = Field(..., min_length=1, description="Product URL")
    description: Optional[str] = Field(None, description="Product description")
    image_url: Optional[str] = Field(None, description="Product image URL")
    category: Optional[str] = Field(None, description="Product category")
    
    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class ArticleSchema(BaseModel):
    """Article/blog post schema."""
    title: str = Field(..., min_length=1, description="Article title")
    content: str = Field(..., min_length=10, description="Article content")
    url: str = Field(..., min_length=1, description="Article URL")
    author: Optional[str] = Field(None, description="Author name")
    published_date: Optional[str] = Field(None, description="Publication date")
    tags: Optional[List[str]] = Field(None, description="Article tags")


class JobListingSchema(BaseModel):
    """Job listing schema."""
    title: str = Field(..., min_length=1, description="Job title")
    company: str = Field(..., min_length=1, description="Company name")
    url: str = Field(..., min_length=1, description="Job posting URL")
    location: Optional[str] = Field(None, description="Job location")
    description: Optional[str] = Field(None, description="Job description")
    posted_date: Optional[str] = Field(None, description="Posting date")


# Example usage
if __name__ == "__main__":
    checker = QualityChecker(
        deduplicate=True,
        dedup_key="url",
        min_quality_score=90.0
    )
    
    # Simulate scraped data
    raw_data = [
        {"name": "Widget A", "price": 19.99, "url": "https://example.com/a"},
        {"name": "Widget B", "price": 29.99, "url": "https://example.com/b"},
        {"name": "", "price": 39.99, "url": "https://example.com/c"},  # Invalid: empty name
        {"name": "Widget D", "price": -5, "url": "https://example.com/d"},  # Invalid: negative price
        {"name": "Widget A", "price": 19.99, "url": "https://example.com/a"},  # Duplicate
        {"name": "Widget E", "price": 49.99, "url": "https://example.com/e"},
    ]
    
    # Validate
    result = checker.validate(raw_data, ProductSchema)
    
    print(f"Valid: {result.valid_count}")
    print(f"Invalid: {result.invalid_count}")
    print(f"Duplicates: {result.duplicate_count}")
    print(f"Quality Score: {result.quality_score:.1f}%")
    print()
    print(checker.generate_report())
    
    # Export report
    checker.export_report("quality_report.json")
