import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Flame } from 'lucide-react';

interface StatsCardProps {
  totalActivities: number;
  completedActivities: number;
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  avgDailyCalories: number;
}

export function StatsCard({
  totalActivities,
  completedActivities,
  totalCaloriesConsumed,
  totalCaloriesBurned,
  avgDailyCalories,
}: StatsCardProps) {
  const completionRate = totalActivities > 0
    ? Math.round((completedActivities / totalActivities) * 100)
    : 0;

  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Riepilogo Periodo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Activities Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{totalActivities}</div>
            <div className="text-xs text-muted-foreground">Attività totali</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-emerald-500">{completionRate}%</div>
            <div className="text-xs text-muted-foreground">Completate</div>
          </div>
        </div>

        {/* Calories Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-muted-foreground">Consumate</span>
            </div>
            <span className="font-medium">{totalCaloriesConsumed.toLocaleString()} kcal</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-muted-foreground">Bruciate</span>
            </div>
            <span className="font-medium">{totalCaloriesBurned.toLocaleString()} kcal</span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-cyan-500" />
              <span className="text-muted-foreground">Nette</span>
            </div>
            <span className="font-bold text-primary">
              {netCalories > 0 ? '+' : ''}{netCalories.toLocaleString()} kcal
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Media giornaliera</span>
            <span className="font-medium">{Math.round(avgDailyCalories).toLocaleString()} kcal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
