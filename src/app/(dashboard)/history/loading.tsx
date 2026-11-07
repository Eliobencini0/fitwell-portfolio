import { ActivityCardSkeleton, StatsCardSkeleton } from '@/components/history/HistorySkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryLoading() {
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-8 w-48 bg-muted/50 rounded animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-muted/50 rounded animate-pulse mx-auto" />
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Stats */}
      <StatsCardSkeleton />

      {/* Activities */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40 mx-auto" />
        {[1, 2, 3, 4, 5].map((i) => (
          <ActivityCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
