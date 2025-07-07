import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceService } from '@/services/performanceService';

interface CacheConfig {
  ttl?: number;
  maxSize?: number;
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

// نظام تخزين مؤقت متقدم وسريع
export function useAdvancedCaching<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
) {
  const {
    ttl = 10 * 60 * 1000,
    maxSize = 100,
    storage = 'memory'
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const cacheRef = useRef(new Map<string, { data: T; timestamp: number }>());
  const abortControllerRef = useRef<AbortController | null>(null);

  // تنظيف التخزين المؤقت من العناصر القديمة
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [cacheKey, item] of cache.entries()) {
      if (now - item.timestamp > ttl) {
        cache.delete(cacheKey);
      }
    }
    
    // تنظيف الحجم إذا تجاوز الحد الأقصى
    if (cache.size > maxSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // احذف أقدم العناصر
      const toDelete = entries.slice(0, cache.size - maxSize);
      toDelete.forEach(([cacheKey]) => cache.delete(cacheKey));
    }
  }, [ttl, maxSize]);

  // الحصول على البيانات من التخزين المؤقت
  const getCachedData = useCallback((): T | null => {
    const now = Date.now();
    
    // تحقق من ذاكرة التطبيق أولاً
    const memoryCache = cacheRef.current.get(key);
    if (memoryCache && now - memoryCache.timestamp < ttl) {
      return memoryCache.data;
    }
    
    // تحقق من التخزين المحلي/الجلسة
    if (storage === 'localStorage' || storage === 'sessionStorage') {
      const storageData = performanceService.getOptimizedStorage<T>(key);
      if (storageData) {
        // أضف إلى ذاكرة التطبيق للوصول السريع
        cacheRef.current.set(key, { data: storageData, timestamp: now });
        return storageData;
      }
    }
    
    return null;
  }, [key, ttl, storage]);

  // تخزين البيانات في التخزين المؤقت
  const setCachedData = useCallback((newData: T) => {
    const now = Date.now();
    
    // تخزين في ذاكرة التطبيق
    cacheRef.current.set(key, { data: newData, timestamp: now });
    
    // تخزين في التخزين المحلي/الجلسة
    if (storage === 'localStorage' || storage === 'sessionStorage') {
      performanceService.setOptimizedStorage(key, newData, ttl);
    }
    
    // تنظيف التخزين المؤقت
    cleanupCache();
  }, [key, ttl, storage, cleanupCache]);

  // جلب البيانات مع تحسينات الأداء
  const fetchData = useCallback(async (force = false) => {
    const now = Date.now();
    
    // تحقق من التخزين المؤقت إذا لم يكن إجبارياً
    if (!force) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
    }
    
    // تحقق من الحاجة لإعادة الجلب (throttling)
    if (!force && now - lastFetch < 1000) {
      return data;
    }

    // إلغاء الطلب السابق إن وجد
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const result = await performanceService.measureOperation(
        `fetch-${key}`,
        () => fetcher()
      );
      
      setData(result);
      setCachedData(result);
      setLastFetch(now);
      setIsLoading(false);
      
      return result;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        console.error(`Error fetching ${key}:`, err);
      }
      setIsLoading(false);
      throw err;
    }
  }, [key, fetcher, getCachedData, setCachedData, lastFetch, data]);

  // التحديث التلقائي للبيانات
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  // إزالة البيانات من التخزين المؤقت
  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    if (storage === 'localStorage') {
      localStorage.removeItem(key);
    } else if (storage === 'sessionStorage') {
      sessionStorage.removeItem(key);
    }
    setData(null);
    setError(null);
  }, [key, storage]);

  // التحميل الأولي
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // تنظيف عند الإلغاء
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate,
    fetchData
  };
}

// تخزين مؤقت عالمي للبيانات المشتركة
class GlobalCache {
  private static instance: GlobalCache;
  private cache = new Map<string, any>();
  private subscribers = new Map<string, Set<(data: any) => void>>();

  static getInstance(): GlobalCache {
    if (!GlobalCache.instance) {
      GlobalCache.instance = new GlobalCache();
    }
    return GlobalCache.instance;
  }

  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key)!.add(callback);
    
    if (this.cache.has(key)) {
      callback(this.cache.get(key));
    }
    
    return () => {
      this.subscribers.get(key)?.delete(callback);
    };
  }

  update(key: string, data: any): void {
    this.cache.set(key, data);
    
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }

  get(key: string): any {
    return this.cache.get(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.subscribers.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.subscribers.clear();
  }
}

export const globalCache = GlobalCache.getInstance();