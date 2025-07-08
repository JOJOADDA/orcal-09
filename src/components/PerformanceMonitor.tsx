import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Database, Wifi, Activity } from 'lucide-react';
import { performanceService } from '@/services/performanceService';
import { unifiedChatService } from '@/services/unifiedChatService';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const PerformanceMonitor = ({ isVisible = false, onToggle }: PerformanceMonitorProps) => {
  const [stats, setStats] = useState<any>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      const performanceStats = performanceService.getPerformanceReport();
      const chatStats = unifiedChatService.getPerformanceStats();
      
      setStats({
        ...performanceStats,
        ...chatStats,
        memoryUsage: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        connectionSpeed: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'unknown',
        loadTime: performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 0
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [isVisible]);

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm shadow-lg"
      >
        <Activity className="w-4 h-4 mr-2" />
        مراقب الأداء
      </Button>
    );
  }

  const getPerformanceColor = (value: number, good: number, bad: number) => {
    if (value <= good) return 'bg-green-500';
    if (value <= bad) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 p-4 z-50 bg-white/95 backdrop-blur-sm shadow-xl border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">مراقب الأداء</span>
        </div>
        <Button onClick={onToggle} variant="ghost" size="sm">
          ×
        </Button>
      </div>

      <div className="space-y-3 text-sm">
        {/* حالة الاتصال */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>الاتصال</span>
          </div>
          <Badge className={isOnline ? 'bg-green-500' : 'bg-red-500'}>
            {isOnline ? 'متصل' : 'منقطع'}
          </Badge>
        </div>

        {/* إحصائيات الدردشة */}
        <div className="flex items-center justify-between">
          <span>الرسائل المحفوظة</span>
          <Badge variant="outline">{stats.cachedMessages || 0}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>الغرف المحفوظة</span>
          <Badge variant="outline">{stats.cachedRooms || 0}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>الاشتراكات النشطة</span>
          <Badge variant="outline">{stats.activeSubscriptions || 0}</Badge>
        </div>

        {/* استخدام الذاكرة */}
        {stats.memoryUsage && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>الذاكرة</span>
              </div>
              <span className="text-xs">
                {stats.memoryUsage.used}MB / {stats.memoryUsage.total}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getPerformanceColor(
                  (stats.memoryUsage.used / stats.memoryUsage.total) * 100,
                  50,
                  80
                )}`}
                style={{ width: `${Math.min(100, (stats.memoryUsage.used / stats.memoryUsage.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* سرعة التحميل */}
        {stats.loadTime > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>وقت التحميل</span>
            </div>
            <Badge 
              className={getPerformanceColor(stats.loadTime, 1000, 3000)}
            >
              {Math.round(stats.loadTime)}ms
            </Badge>
          </div>
        )}

        {/* سرعة الاتصال */}
        {stats.connectionSpeed !== 'unknown' && (
          <div className="flex items-center justify-between">
            <span>سرعة الاتصال</span>
            <Badge variant="outline">{stats.connectionSpeed}</Badge>
          </div>
        )}

        {/* العمليات البطيئة */}
        {Object.entries(stats).filter(([key, value]) => 
          typeof value === 'number' && value > 100 && key !== 'loadTime'
        ).map(([operation, time]) => (
          <div key={operation} className="flex items-center justify-between text-xs text-amber-600">
            <span>⚠️ {operation}</span>
            <span>{Math.round(time as number)}ms</span>
          </div>
        ))}

        <div className="pt-2 border-t text-xs text-gray-500 text-center">
          النظام محسن للسرعة القصوى ⚡
        </div>
      </div>
    </Card>
  );
};

export default PerformanceMonitor;