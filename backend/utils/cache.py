# backend/utils/cache.py
import time

class Cache:
    def __init__(self, ttl_seconds=3600):
        self.store = {}  # {key: (value, expiry_timestamp)}
        self.ttl = ttl_seconds

    def get_cache(self, key):
        """Return cached value if valid, else None"""
        item = self.store.get(key)
        if item:
            value, expiry = item
            if expiry > time.time():
                return value
            else:
                del self.store[key]
        return None

    def set_cache(self, key, value):
        """Store value with TTL"""
        expiry = time.time() + self.ttl
        self.store[key] = (value, expiry)

# Singleton instance to use in backend
cache = Cache(ttl_seconds=3600)  # 1 hour default
