'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useT, useLocale } from '@/i18n/client';
import { dateLocaleTags } from '@/i18n/config';
import { stats } from '@/i18n/messages/stats';

interface HydrationData {
  date: string;
  glasses: number;
  target: number;
}

interface HydrationChartProps {
  data: HydrationData[];
}

export function HydrationChart({ data }: HydrationChartProps) {
  const t = useT(stats);
  const locale = useLocale();
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('hydrationTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('hydrationEmpty')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgGlasses = data.reduce((sum, d) => sum + d.glasses, 0) / data.length;
  const avgTarget = data[0]?.target || 8;
  const completionRate = Math.round((avgGlasses / avgTarget) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t('hydrationTitle')}</CardTitle>
          <div className="text-sm font-medium text-cyan-500">
            {t('goalPercent', { percent: completionRate })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGlasses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              formatter={(value) => [t('glassesTooltip', { count: String(value) }), t('drunk')]}
            />
            <Area
              type="monotone"
              dataKey="glasses"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGlasses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
