interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ResultCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
  }

  private generateKey(query: Record<string, unknown>): string {
    const sorted = Object.keys(query)
      .sort()
      .map(key => `${key}:${JSON.stringify(query[key])}`)
      .join('|');
    return sorted;
  }

  get(query: Record<string, unknown>): T | null {
    const key = this.generateKey(query);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(query: Record<string, unknown>, data: T, ttl?: number): void {
    const key = this.generateKey(query);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const fractionResultCache = new ResultCache<any>(2 * 60 * 1000);
export const filteredQueryCache = new ResultCache<any>(3 * 60 * 1000);

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    fractionResultCache.cleanup();
    filteredQueryCache.cleanup();
  }, 5 * 60 * 1000);
}

