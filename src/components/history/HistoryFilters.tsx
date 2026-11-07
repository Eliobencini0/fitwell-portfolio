'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';

type TimeRange = 'week' | 'month' | 'all';
type ActivityFilter = 'all' | 'meal' | 'workout' | 'other';

export function HistoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange = (searchParams.get('range') as TimeRange) || 'week';
  const currentType = (searchParams.get('type') as ActivityFilter) || 'all';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    // Reset page when changing filters
    params.delete('page');
    router.push(`/history?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Time Range Filter */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Periodo
        </label>
        <div className="flex gap-2">
          <Button
            variant={currentRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('range', 'week')}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Settimana
          </Button>
          <Button
            variant={currentRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('range', 'month')}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Mese
          </Button>
          <Button
            variant={currentRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('range', 'all')}
            className="flex-1"
          >
            Tutto
          </Button>
        </div>
      </div>

      {/* Activity Type Filter */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Tipo Attività
        </label>
        <Tabs value={currentType} onValueChange={(v) => updateFilter('type', v)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Tutto</TabsTrigger>
            <TabsTrigger value="meal">🍽️ Pasti</TabsTrigger>
            <TabsTrigger value="workout">💪 Workout</TabsTrigger>
            <TabsTrigger value="other">📝 Altro</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
