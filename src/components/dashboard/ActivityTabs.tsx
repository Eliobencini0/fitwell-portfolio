'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/client';
import { dashboard as messages } from '@/i18n/messages/dashboard';

export type ActivityFilter = 'all' | 'meal' | 'workout';

interface ActivityTabsProps {
  onFilterChange: (filter: ActivityFilter) => void;
  defaultFilter?: ActivityFilter;
}

const tabs = [
  { id: 'all' as ActivityFilter, labelKey: 'tabAll' as const, icon: '⊞' },
  { id: 'meal' as ActivityFilter, labelKey: 'tabMeals' as const, icon: '🍽️' },
  { id: 'workout' as ActivityFilter, labelKey: 'tabActivities' as const, icon: '⚡' },
];

export function ActivityTabs({ onFilterChange, defaultFilter = 'all' }: ActivityTabsProps) {
  const t = useT(messages);
  const [activeTab, setActiveTab] = useState<ActivityFilter>(defaultFilter);

  const handleTabClick = (tabId: ActivityFilter) => {
    setActiveTab(tabId);
    onFilterChange(tabId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('activity-filter', tabId);
    }
  };

  return (
    <div className="flex gap-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
          )}
        >
          <span className="text-base">{tab.icon}</span>
          <span>{t(tab.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
