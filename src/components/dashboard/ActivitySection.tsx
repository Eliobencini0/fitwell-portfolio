'use client';

import { useState } from 'react';
import { ActivityTabs, type ActivityFilter } from './ActivityTabs';
import { ActivityListStyled } from './ActivityListStyled';
import { AddActivityButton } from './AddActivityButton';
import type { DailyActivity } from '@/types';

interface ActivitySectionProps {
  activities: DailyActivity[];
  date: string;
}

export function ActivitySection({ activities, date }: ActivitySectionProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');

  return (
    <>
      {/* Activity Tabs */}
      <ActivityTabs onFilterChange={setFilter} />

      {/* Activities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">
            Lista delle attività
          </h3>
          <AddActivityButton date={date} />
        </div>

        <ActivityListStyled activities={activities} filter={filter} />
      </div>
    </>
  );
}
