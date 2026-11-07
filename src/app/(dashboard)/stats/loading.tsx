import { ChartSkeleton, StatCardSkeleton } from '@/components/stats/ChartSkeleton';

export default function StatsLoading() {
  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="h-8 w-48 bg-muted/50 rounded animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-muted/50 rounded animate-pulse mx-auto" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        <ChartSkeleton />
        <ChartSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    </div>
  );
}
