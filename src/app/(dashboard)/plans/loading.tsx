export default function PlansLoading() {
  return (
    <div className="space-y-6 pb-24">
      {/* Page Header Skeleton */}
      <div className="text-center animate-pulse">
        <div className="h-8 bg-muted rounded w-64 mx-auto mb-2" />
        <div className="h-4 bg-muted rounded w-96 mx-auto" />
      </div>

      {/* Goal Card Skeleton */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-muted rounded w-32 animate-pulse" />
            <div className="h-4 bg-muted rounded w-48 animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card Skeleton */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="h-5 bg-muted rounded w-40 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              <div className="h-6 bg-muted rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Meal Plan Skeleton */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted rounded w-48 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                <div className="h-3 bg-muted rounded w-20 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout Schedule Skeleton */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                <div className="h-3 bg-muted rounded w-40 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplements Skeleton */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-32 animate-pulse" />
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                <div className="h-3 bg-muted rounded w-40 animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Target Summary Skeleton */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="h-5 bg-muted rounded w-40 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-muted rounded w-20 animate-pulse" />
              <div className="h-6 bg-muted rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
