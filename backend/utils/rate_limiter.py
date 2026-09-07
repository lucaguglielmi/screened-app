"""Token-bucket rate limiting utilities for Screened MCP & WebMCP tool invocations."""
import time
import threading
from typing import Dict, Tuple

class TokenBucket:
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = float(capacity)
        self.tokens = float(capacity)
        self.refill_rate = refill_rate_per_sec
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def consume(self, amount: float = 1.0) -> Tuple[bool, int]:
        with self.lock:
            now = time.time()
            elapsed = now - self.last_refill
            self.last_refill = now
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)

            if self.tokens >= amount:
                self.tokens -= amount
                return True, 0
            else:
                missing = amount - self.tokens
                retry_after = int(missing / self.refill_rate) + 1
                return False, max(1, retry_after)


class TieredRateLimiter:
    """Multi-tiered in-memory rate limiter for MCP endpoints.
    
    Tiers:
    - READ: 60 req/minute per client IP
    - SCOUT: 20 req/minute per client IP
    - HEAVY: 3 req/hour per client IP (dispatched agent deep investigations)
    """
    TIER_CONFIGS = {
        "READ": (60, 60.0 / 60.0),       # capacity 60, 1 per sec
        "SCOUT": (20, 20.0 / 60.0),      # capacity 20, 0.333 per sec
        "HEAVY": (3, 3.0 / 3600.0),      # capacity 3, 3 per hour
    }

    def __init__(self):
        self.buckets: Dict[str, TokenBucket] = {}
        self.lock = threading.Lock()

    def _get_bucket(self, client_id: str, tier: str) -> TokenBucket:
        key = f"{tier}:{client_id}"
        with self.lock:
            if key not in self.buckets:
                capacity, rate = self.TIER_CONFIGS.get(tier, (60, 1.0))
                self.buckets[key] = TokenBucket(capacity, rate)
            return self.buckets[key]

    def check(self, client_id: str, tier: str = "READ") -> Tuple[bool, int]:
        bucket = self._get_bucket(client_id, tier)
        return bucket.consume(1.0)


# Global singleton instance
mcp_rate_limiter = TieredRateLimiter()
