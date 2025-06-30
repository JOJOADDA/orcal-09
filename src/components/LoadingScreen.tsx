
import { Skeleton } from "@/components/ui/skeleton";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
