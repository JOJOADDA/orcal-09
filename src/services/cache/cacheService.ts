
export class CacheService {
  protected cache = new Map();
  protected cacheTimeout = 5 * 60 * 1000; // 5 minutes

  protected getCacheKey(key: string, params?: any): string {
    return params ? `${key}_${JSON.stringify(params)}` : key;
  }

  protected getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  protected setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  protected clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  clearAllCache(): void {
    this.clearCache();
  }
}
