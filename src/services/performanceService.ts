// خدمة تحسين الأداء الشاملة
class PerformanceService {
  private static instance: PerformanceService;
  private metricsCache = new Map<string, number>();

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // قياس أداء العمليات
  measureOperation<T>(name: string, operation: () => T | Promise<T>): T | Promise<T> {
    const start = performance.now();
    
    const result = operation();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        this.recordMetric(name, end - start);
      });
    } else {
      const end = performance.now();
      this.recordMetric(name, end - start);
      return result;
    }
  }

  // تسجيل المقاييس
  private recordMetric(name: string, duration: number) {
    this.metricsCache.set(name, duration);
    
    // تسجيل المقاييس المهمة فقط في production
    if (duration > 100) { // أكثر من 100ms
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  // تحسين الصور
  optimizeImage(src: string, width?: number, height?: number): string {
    if (!src) return '';
    
    // إذا كانت الصورة من Supabase، أضف معاملات التحسين
    if (src.includes('supabase')) {
      const url = new URL(src);
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      url.searchParams.set('quality', '80');
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    
    return src;
  }

  // تحسين طلبات الشبكة
  async optimizedFetch(url: string, options?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options?.headers,
          'Cache-Control': 'max-age=300', // 5 دقائق cache
        }
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // تحسين Local Storage
  setOptimizedStorage(key: string, value: any, ttl: number = 3600000): void {
    const item = {
      value,
      timestamp: Date.now(),
      ttl
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      // إذا امتلأت الذاكرة، احذف العناصر القديمة
      this.cleanupExpiredStorage();
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch {
        console.warn('Local storage full, unable to store:', key);
      }
    }
  }

  getOptimizedStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // تحقق من انتهاء الصلاحية
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.value;
    } catch {
      return null;
    }
  }

  // تنظيف التخزين المحلي
  private cleanupExpiredStorage(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      this.getOptimizedStorage(key); // سيحذف المنتهية الصلاحية تلقائياً
    });
  }

  // تحسين التمرير الافتراضي
  enableVirtualScrolling(container: HTMLElement, itemHeight: number): void {
    let ticking = false;

    const updateVisibleItems = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        container.children.length
      );

      // إخفاء العناصر غير المرئية
      Array.from(container.children).forEach((child, index) => {
        const element = child as HTMLElement;
        if (index < startIndex || index > endIndex) {
          element.style.display = 'none';
        } else {
          element.style.display = '';
        }
      });

      ticking = false;
    };

    container.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibleItems);
        ticking = true;
      }
    });
  }

  // الحصول على تقرير الأداء
  getPerformanceReport(): Record<string, number> {
    return Object.fromEntries(this.metricsCache);
  }

  // إعادة تعيين المقاييس
  resetMetrics(): void {
    this.metricsCache.clear();
  }
}

export const performanceService = PerformanceService.getInstance();