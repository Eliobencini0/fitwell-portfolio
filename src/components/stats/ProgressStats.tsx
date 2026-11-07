import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Droplet, Flame } from 'lucide-react';

interface ProgressStatsProps {
  avgCalories: number;
  totalWorkouts: number;
  avgHydration: number;
  currentWeight: number | null;
  weightChange: number | null;
  completionRate: number;
}

export function ProgressStats({
  avgCalories,
  totalWorkouts,
  avgHydration,
  currentWeight,
  weightChange,
  completionRate,
}: ProgressStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {/* Average Calories */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <div className="text-xs text-muted-foreground">Calorie medie</div>
          </div>
          <div className="text-xl font-bold">{Math.round(avgCalories).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">kcal/giorno</div>
        </CardContent>
      </Card>

      {/* Total Workouts */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <div className="text-xs text-muted-foreground">Allenamenti</div>
          </div>
          <div className="text-xl font-bold">{totalWorkouts}</div>
          <div className="text-xs text-muted-foreground">ultimi 30 gg</div>
        </CardContent>
      </Card>

      {/* Average Hydration */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-4 h-4 text-cyan-500" />
            <div className="text-xs text-muted-foreground">Idratazione media</div>
          </div>
          <div className="text-xl font-bold">{avgHydration.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">bicchieri/giorno</div>
        </CardContent>
      </Card>

      {/* Current Weight */}
      {currentWeight !== null && (
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-lg">⚖️</div>
              <div className="text-xs text-muted-foreground">Peso attuale</div>
            </div>
            <div className="text-xl font-bold">{currentWeight.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">kg</div>
          </CardContent>
        </Card>
      )}

      {/* Weight Change */}
      {weightChange !== null && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {weightChange < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-orange-500" />
              )}
              <div className="text-xs text-muted-foreground">Variazione</div>
            </div>
            <div className={`text-xl font-bold ${weightChange < 0 ? 'text-emerald-500' : 'text-orange-500'}`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">kg (30 gg)</div>
          </CardContent>
        </Card>
      )}

      {/* Completion Rate */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg">✅</div>
            <div className="text-xs text-muted-foreground">Completamento</div>
          </div>
          <div className="text-xl font-bold">{completionRate}%</div>
          <div className="text-xs text-muted-foreground">attività (30 gg)</div>
        </CardContent>
      </Card>
    </div>
  );
}
