# backend/utils/cache.py
import time
import hashlib

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
        # Use a hash of the key to handle larger PDFs gracefully
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        expiry = time.time() + self.ttl
        self.store[key_hash] = (value, expiry)

cache = Cache(ttl_seconds=3600)  # 1 hour default
