'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';
import { useT } from '@/i18n/client';
import { history } from '@/i18n/messages/history';

type TimeRange = 'week' | 'month' | 'all';
type ActivityFilter = 'all' | 'meal' | 'workout' | 'other';

export function HistoryFilters() {
  const t = useT(history);
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
          {t('period')}
        </label>
        <div className="flex gap-2">
          <Button
            variant={currentRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('range', 'week')}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-1" />
            {t('week')}
          </Button>
          <Button
            variant={currentRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('range', 'month')}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-1" />
            {t('month')}
          </Button>
          <Button
            variant={currentRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilter('range', 'all')}
            className="flex-1"
          >
            {t('all')}
          </Button>
        </div>
      </div>

      {/* Activity Type Filter */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          {t('activityType')}
        </label>
        <Tabs value={currentType} onValueChange={(v) => updateFilter('type', v)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{t('all')}</TabsTrigger>
            <TabsTrigger value="meal">{t('typeMeals')}</TabsTrigger>
            <TabsTrigger value="workout">{t('typeWorkout')}</TabsTrigger>
            <TabsTrigger value="other">{t('typeOther')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
