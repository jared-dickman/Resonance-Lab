package cache

import (
	"sync"
	"time"
)

type entry struct {
	value      interface{}
	expiration time.Time
}

// Cache provides thread-safe in-memory caching with TTL support.
type Cache struct {
	mu      sync.RWMutex
	entries map[string]entry
	ttl     time.Duration
}

// New creates a Cache with the specified TTL.
func New(ttl time.Duration) *Cache {
	c := &Cache{
		entries: make(map[string]entry),
		ttl:     ttl,
	}
	go c.cleanup()
	return c
}

func (c *Cache) Get(key string) (interface{}, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	e, exists := c.entries[key]
	if !exists || time.Now().After(e.expiration) {
		return nil, false
	}
	return e.value, true
}

func (c *Cache) Set(key string, value interface{}) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.entries[key] = entry{
		value:      value,
		expiration: time.Now().Add(c.ttl),
	}
}

func (c *Cache) Invalidate(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.entries, key)
}

func (c *Cache) cleanup() {
	ticker := time.NewTicker(c.ttl)
	defer ticker.Stop()

	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for k, e := range c.entries {
			if now.After(e.expiration) {
				delete(c.entries, k)
			}
		}
		c.mu.Unlock()
	}
}
