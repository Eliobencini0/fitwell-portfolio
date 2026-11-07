'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useT, useLocale } from '@/i18n/client';
import { dateLocaleTags } from '@/i18n/config';
import { stats } from '@/i18n/messages/stats';

interface WeightData {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightData[];
  targetWeight?: number;
}

export function WeightChart({ data, targetWeight }: WeightChartProps) {
  const t = useT(stats);
  const locale = useLocale();
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {t('weightTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">📊</div>
            <p className="text-sm text-muted-foreground">
              {t('weightEmpty')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstWeight = data[0]?.weight;
  const lastWeight = data[data.length - 1]?.weight;
  const weightChange = lastWeight - firstWeight;
  const isLoss = weightChange < 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {t('weightTitle')}
          </CardTitle>
          {weightChange !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${isLoss ? 'text-emerald-500' : 'text-orange-500'}`}>
              {isLoss ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              {Math.abs(weightChange).toFixed(1)} kg
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString(dateLocaleTags[locale], { day: 'numeric', month: 'long' });
              }}
              formatter={(value) => [`${Number(value).toFixed(1)} kg`, t('weightLabel')]}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
            {targetWeight && (
              <Line
                type="monotone"
                dataKey={() => targetWeight}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        {targetWeight && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            {t('weightTargetLine', { weight: targetWeight })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
