'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MacrosData {
  carbs: number;
  protein: number;
  fats: number;
}

interface MacrosChartProps {
  data: MacrosData;
}

const COLORS = {
  carbs: '#22d3ee',    // cyan
  protein: '#10b981',  // emerald
  fats: '#f59e0b',     // amber
};

export function MacrosChart({ data }: MacrosChartProps) {
  const total = data.carbs + data.protein + data.fats;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🥗 Distribuzione Macro (ultimi 7 gg)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nessun dato disponibile. Aggiungi pasti per vedere la distribuzione.
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Carboidrati', value: data.carbs, percentage: ((data.carbs / total) * 100).toFixed(0) },
    { name: 'Proteine', value: data.protein, percentage: ((data.protein / total) * 100).toFixed(0) },
    { name: 'Grassi', value: data.fats, percentage: ((data.fats / total) * 100).toFixed(0) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🥗 Distribuzione Macro (ultimi 7 gg)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ payload }: any) => `${payload.percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Object.values(COLORS)[index]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value) => `${Number(value).toFixed(0)}g`}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value, entry: any) => `${value} (${entry.payload.percentage}%)`}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
