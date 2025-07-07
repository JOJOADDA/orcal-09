import { useEffect, useCallback, useRef } from 'react';

// تحسينات الأداء الشاملة
export const usePerfOptimization = () => {
  const rafRef = useRef<number>();

  // تحسين requestAnimationFrame
  const optimizedRAF = useCallback((callback: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(callback);
  }, []);

  // تحسين التمرير
  const optimizeScrolling = useCallback(() => {
    // تمكين smooth scrolling للمتصفحات التي تدعمه
    if ('scrollBehavior' in document.documentElement.style) {
      document.documentElement.style.scrollBehavior = 'smooth';
    }

    // تحسين الأداء على الأجهزة المحمولة
    document.body.style.touchAction = 'manipulation';
    (document.body.style as any).webkitOverflowScrolling = 'touch';
  }, []);

  // تحسين الصور
  const optimizeImages = useCallback(() => {
    // lazy loading للصور
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }, []);

  // تحسين الخطوط
  const optimizeFonts = useCallback(() => {
    // preload الخطوط المهمة
    const fontPreloads = [
      'Almarai',
      'Tajawal'
    ];

    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `/fonts/${font}.woff2`;
      document.head.appendChild(link);
    });
  }, []);

  // تحسين الذاكرة
  const optimizeMemory = useCallback(() => {
    // تنظيف الذاكرة كل 5 دقائق
    const cleanup = () => {
      if (window.gc) {
        window.gc();
      }
    };

    const interval = setInterval(cleanup, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // تطبيق جميع التحسينات
  useEffect(() => {
    optimizeScrolling();
    optimizeImages();
    optimizeFonts();
    const memoryCleanup = optimizeMemory();

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      memoryCleanup?.();
    };
  }, [optimizeScrolling, optimizeImages, optimizeFonts, optimizeMemory]);

  return {
    optimizedRAF
  };
};

// تحسين أداء المكونات
export const useComponentOptimization = () => {
  // تحسين re-renders
  const optimizeRenders = useCallback(() => {
    // إضافة console.count للتتبع في development
    if (process.env.NODE_ENV === 'development') {
      console.count('Component Render');
    }
  }, []);

  return {
    optimizeRenders
  };
};