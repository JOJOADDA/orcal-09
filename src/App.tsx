
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import LoadingScreen from "./components/LoadingScreen";
import { usePerfOptimization } from "@/hooks/usePerfOptimization";
import { performanceService } from "@/services/performanceService";

// تحميل الصفحات بشكل lazy للأداء الأفضل
const FastIndex = lazy(() => import("./pages/FastIndex"));
const NotFound = lazy(() => import("./pages/NotFound"));

// إعداد محسن للغاية لـ QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 دقيقة - تقليل الطلبات
      gcTime: 30 * 60 * 1000, // 30 دقيقة - احتفاظ أطول بالبيانات
      retry: (failureCount, error: any) => {
        // retry ذكي حسب نوع الخطأ
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      networkMode: 'online', // العمل فقط عند وجود اتصال
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const App = () => {
  // تطبيق تحسينات الأداء العامة
  usePerfOptimization();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={100}>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<FastIndex />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
