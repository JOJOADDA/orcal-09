
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import LoadingScreen from "./components/LoadingScreen";

// تحميل الصفحات بشكل lazy للأداء الأفضل
const FastIndex = lazy(() => import("./pages/FastIndex"));
const NotFound = lazy(() => import("./pages/NotFound"));

// إعداد محسن لـ QueryClient مع خيارات أداء أفضل
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 دقائق
      gcTime: 15 * 60 * 1000, // 15 دقيقة
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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

export default App;
