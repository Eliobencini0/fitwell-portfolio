'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useT, useLocale } from '@/i18n/client';
import { dateLocaleTags } from '@/i18n/config';
import { stats } from '@/i18n/messages/stats';

interface CalorieData {
  date: string;
  consumed: number;
  burned: number;
  target: number;
}

interface CaloriesChartProps {
  data: CalorieData[];
}

export function CaloriesChart({ data }: CaloriesChartProps) {
  const t = useT(stats);
  const locale = useLocale();
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('caloriesTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl">📈</div>
            <p className="text-sm text-muted-foreground">
              {t('caloriesEmpty')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('caloriesTitle7')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
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
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  consumed: t('legendConsumed'),
                  burned: t('legendBurned'),
                  target: t('legendTarget'),
                };
                return labels[value] || value;
              }}
            />
            <Bar dataKey="consumed" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            <Bar dataKey="burned" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
