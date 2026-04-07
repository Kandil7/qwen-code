#!/usr/bin/env python3
"""
Token & Cost Tracking System

Tracks per-session token usage, API costs, tool call counts, and latency.
Provides real-time accounting and budget enforcement based on policy.json limits.

Usage:
    from token_tracker import SessionTracker
    
    tracker = SessionTracker("session-001")
    tracker.record_tool_call("read_file", tokens=150, latency_ms=45)
    tracker.record_api_call("anthropic", input_tokens=500, output_tokens=200)
    tracker.record_cost(0.05)
    
    report = tracker.get_report()
    print(report.summary)
    
    if tracker.is_over_budget():
        print("⚠ Budget exceeded!")
"""

import json
import time
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
import os


class SessionTracker:
    """Track token usage, costs, and tool calls for a single session."""
    
    # Approximate costs per 1M tokens (varies by model)
    MODEL_COSTS = {
        "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00},
        "claude-opus-4-20250514": {"input": 15.00, "output": 75.00},
        "gpt-4o": {"input": 2.50, "output": 10.00},
        "qwen-coder": {"input": 0.50, "output": 2.00},
    }
    
    def __init__(self, session_id: str = None, policy_path: str = None):
        self.session_id = session_id or f"session-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        self.start_time = time.time()
        self.tool_calls: List[Dict] = []
        self.api_calls: List[Dict] = []
        self.costs: List[Dict] = []
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_cost_usd = 0.0
        
        # Load policy for budget limits
        self.policy = {}
        if policy_path and os.path.exists(policy_path):
            try:
                with open(policy_path, 'r') as f:
                    self.policy = json.load(f).get('budget_policies', {})
            except:
                pass
    
    def record_tool_call(self, tool_name: str, tokens: int = 0, latency_ms: float = 0, success: bool = True):
        """Record a tool call with token usage and latency."""
        self.tool_calls.append({
            "tool": tool_name,
            "tokens": tokens,
            "latency_ms": latency_ms,
            "success": success,
            "timestamp": datetime.utcnow().isoformat()
        })
        self.total_input_tokens += tokens
    
    def record_api_call(self, provider: str, input_tokens: int = 0, output_tokens: int = 0, model: str = None):
        """Record an API call to an LLM provider."""
        self.api_calls.append({
            "provider": provider,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "model": model,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        self.total_input_tokens += input_tokens
        self.total_output_tokens += output_tokens
        
        # Calculate cost
        if model and model in self.MODEL_COSTS:
            costs = self.MODEL_COSTS[model]
            input_cost = (input_tokens / 1_000_000) * costs["input"]
            output_cost = (output_tokens / 1_000_000) * costs["output"]
            self.total_cost_usd += input_cost + output_cost
    
    def record_cost(self, amount: float, description: str = ""):
        """Record a direct cost (e.g., MCP server call, external API)."""
        self.costs.append({
            "amount": amount,
            "description": description,
            "timestamp": datetime.utcnow().isoformat()
        })
        self.total_cost_usd += amount
    
    def get_tool_call_count(self) -> int:
        """Get total tool call count."""
        return len(self.tool_calls)
    
    def get_api_call_count(self) -> int:
        """Get total API call count."""
        return len(self.api_calls)
    
    def get_tool_call_rate(self) -> float:
        """Get tool calls per minute."""
        elapsed = (time.time() - self.start_time) / 60
        if elapsed == 0:
            return 0.0
        return len(self.tool_calls) / elapsed
    
    def get_avg_latency(self) -> float:
        """Get average tool call latency."""
        if not self.tool_calls:
            return 0.0
        return sum(c.get("latency_ms", 0) for c in self.tool_calls) / len(self.tool_calls)
    
    def get_p95_latency(self) -> float:
        """Get 95th percentile latency."""
        if not self.tool_calls:
            return 0.0
        latencies = sorted(c.get("latency_ms", 0) for c in self.tool_calls)
        idx = int(len(latencies) * 0.95)
        return latencies[min(idx, len(latencies) - 1)]
    
    def get_tool_breakdown(self) -> Dict[str, Dict]:
        """Get token/cost breakdown by tool."""
        breakdown = defaultdict(lambda: {"count": 0, "tokens": 0, "latency_ms": []})
        for call in self.tool_calls:
            tool = call["tool"]
            breakdown[tool]["count"] += 1
            breakdown[tool]["tokens"] += call.get("tokens", 0)
            breakdown[tool]["latency_ms"].append(call.get("latency_ms", 0))
        
        for tool, data in breakdown.items():
            data["avg_latency_ms"] = sum(data["latency_ms"]) / len(data["latency_ms"]) if data["latency_ms"] else 0
            del data["latency_ms"]
        
        return dict(breakdown)
    
    def is_over_budget(self) -> bool:
        """Check if session is over budget."""
        if not self.policy:
            return False
        
        # Check token limits
        max_tokens = self.policy.get("max_tokens_per_session", float('inf'))
        if self.total_input_tokens + self.total_output_tokens > max_tokens:
            return True
        
        # Check cost limits
        max_cost = self.policy.get("max_cost_usd_per_session", float('inf'))
        if self.total_cost_usd > max_cost:
            return True
        
        # Check API call limits
        max_calls = self.policy.get("max_api_calls_per_hour", float('inf'))
        # Convert to session-based check (assume session < 1 hour)
        if self.get_api_call_count() > max_calls:
            return True
        
        # Check tool call limits per turn
        max_tool_calls = self.policy.get("max_tool_calls_per_turn", float('inf'))
        # Check recent tool calls (last "turn" = last 20 calls)
        recent_calls = self.tool_calls[-20:] if len(self.tool_calls) > 20 else self.tool_calls
        if len(recent_calls) > max_tool_calls:
            return True
        
        return False
    
    def get_budget_usage(self) -> Dict[str, float]:
        """Get budget usage percentages."""
        usage = {}
        
        if self.policy.get("max_tokens_per_session"):
            total = self.total_input_tokens + self.total_output_tokens
            usage["tokens"] = (total / self.policy["max_tokens_per_session"]) * 100
        
        if self.policy.get("max_cost_usd_per_session"):
            usage["cost"] = (self.total_cost_usd / self.policy["max_cost_usd_per_session"]) * 100
        
        if self.policy.get("max_api_calls_per_hour"):
            usage["api_calls"] = (self.get_api_call_count() / self.policy["max_api_calls_per_hour"]) * 100
        
        return usage
    
    def get_report(self) -> Dict[str, Any]:
        """Generate comprehensive session report."""
        elapsed = time.time() - self.start_time
        
        return {
            "session_id": self.session_id,
            "start_time": datetime.fromtimestamp(self.start_time).isoformat(),
            "elapsed_seconds": elapsed,
            "tokens": {
                "input": self.total_input_tokens,
                "output": self.total_output_tokens,
                "total": self.total_input_tokens + self.total_output_tokens
            },
            "cost": {
                "total_usd": round(self.total_cost_usd, 4),
                "api_calls": len(self.api_calls),
                "direct_costs": len(self.costs)
            },
            "tool_calls": {
                "total": self.get_tool_call_count(),
                "rate_per_minute": round(self.get_tool_call_rate(), 2),
                "avg_latency_ms": round(self.get_avg_latency(), 2),
                "p95_latency_ms": round(self.get_p95_latency(), 2),
                "breakdown": self.get_tool_breakdown()
            },
            "budget": {
                "is_over_budget": self.is_over_budget(),
                "usage_percent": self.get_budget_usage()
            }
        }
    
    def save(self, filepath: str = None):
        """Save session report to file."""
        if filepath is None:
            filepath = f".qwen/session-reports/{self.session_id}.json"
        
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(path, 'w') as f:
            json.dump(self.get_report(), f, indent=2, default=str)
    
    @property
    def summary(self) -> str:
        """Human-readable summary."""
        report = self.get_report()
        
        lines = [
            f"Session: {self.session_id}",
            f"Duration: {report['elapsed_seconds']:.0f}s",
            f"Tokens: {report['tokens']['total']:,} (in: {report['tokens']['input']:,}, out: {report['tokens']['output']:,})",
            f"Cost: ${report['cost']['total_usd']:.4f} ({report['cost']['api_calls']} API calls)",
            f"Tool Calls: {report['tool_calls']['total']} ({report['tool_calls']['rate_per_minute']}/min)",
            f"Latency: avg={report['tool_calls']['avg_latency_ms']:.0f}ms, p95={report['tool_calls']['p95_latency_ms']:.0f}ms",
        ]
        
        if report['budget']['is_over_budget']:
            lines.append("⚠️  OVER BUDGET!")
        elif report['budget']['usage_percent']:
            lines.append(f"Budget Usage: {', '.join(f'{k}: {v:.0f}%' for k, v in report['budget']['usage_percent'].items())}")
        
        return "\n".join(lines)


# Global session tracker
_global_tracker: Optional[SessionTracker] = None

def get_tracker(session_id: str = None) -> SessionTracker:
    """Get or create global session tracker."""
    global _global_tracker
    if _global_tracker is None:
        policy_path = os.path.join(os.getcwd(), '.qwen', 'policy.json')
        _global_tracker = SessionTracker(session_id, policy_path)
    return _global_tracker

def reset_tracker():
    """Reset global tracker (for testing)."""
    global _global_tracker
    _global_tracker = None


# Example usage
if __name__ == "__main__":
    tracker = SessionTracker("demo-session")
    
    # Simulate tool calls
    tracker.record_tool_call("read_file", tokens=150, latency_ms=45)
    tracker.record_tool_call("write_file", tokens=200, latency_ms=60)
    tracker.record_tool_call("bash", tokens=100, latency_ms=200)
    tracker.record_tool_call("grep_search", tokens=50, latency_ms=30)
    
    # Simulate API calls
    tracker.record_api_call("anthropic", input_tokens=5000, output_tokens=2000, model="claude-sonnet-4-20250514")
    tracker.record_api_call("anthropic", input_tokens=3000, output_tokens=1500, model="claude-sonnet-4-20250514")
    
    # Print report
    print(tracker.summary)
    print()
    print(json.dumps(tracker.get_report(), indent=2))
