'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleActivity, deleteActivity } from '@/lib/actions';
import { toast } from 'sonner';
import type { DailyActivity } from '@/types';
import type { ActivityFilter } from './ActivityTabs';
import { AnimatedList, AnimatedListItem } from '@/components/ui/animated-list';
import { LoadingSpinner } from '@/components/ui/success-checkmark';
import { useUndo } from '@/hooks/useUndo';
import { createActivity } from '@/lib/actions';

interface ActivityListStyledProps {
  activities: DailyActivity[];
  filter: ActivityFilter;
}

export function ActivityListStyled({ activities, filter }: ActivityListStyledProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { executeWithUndo } = useUndo<DailyActivity>();

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    if (filter === 'all') return true;
    if (filter === 'meal') return activity.activity_type === 'meal';
    if (filter === 'workout') return ['workout', 'meditation', 'other'].includes(activity.activity_type);
    return true;
  });

  const handleToggle = async (activityId: string, currentStatus: boolean) => {
    setLoadingId(activityId);

    try {
      await toggleActivity(activityId, !currentStatus);
      router.refresh();
      toast.success(!currentStatus ? 'Completata! 🎉' : 'Non completata');
    } catch (error) {
      toast.error('Errore');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (activity: DailyActivity) => {
    setLoadingId(activity.id);

    try {
      await executeWithUndo(
        activity,
        // Delete action
        async () => {
          await deleteActivity(activity.id);
          router.refresh();
        },
        // Undo action
        async () => {
          await createActivity({
            date: activity.date,
            title: activity.title,
            activity_type: activity.activity_type,
            calories: activity.calories,
            description: activity.description || undefined,
          });
          router.refresh();
        },
        'Attività eliminata'
      );
    } catch (error) {
      toast.error('Errore durante l\'eliminazione');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-sm text-muted-foreground">
          Nessuna attività
        </p>
      </div>
    );
  }

  return (
    <AnimatedList className="space-y-3">
      {filteredActivities.map((activity) => {
        const isLoading = loadingId === activity.id;
        const isConsumed = activity.calories > 0;
        const isBurned = activity.calories < 0;

        return (
          <AnimatedListItem
            key={activity.id}
            id={activity.id}
            className="bg-card rounded-2xl p-4 border border-border/50 flex items-center gap-4"
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggle(activity.id, activity.completed)}
              disabled={isLoading}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
              <div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${
                    activity.completed
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground/30 hover:border-primary/50'
                  }
                `}
              >
                {activity.completed && (
                  <svg
                    className="w-5 h-5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4
                className={`
                  text-base font-medium
                  ${activity.completed ? 'line-through text-muted-foreground' : 'text-foreground'}
                `}
              >
                {activity.title}
              </h4>
              <p
                className={`
                  text-sm mt-0.5
                  ${
                    isConsumed
                      ? 'text-success'
                      : isBurned
                      ? 'text-info'
                      : 'text-muted-foreground'
                  }
                `}
              >
                {activity.calories > 0 && `${activity.calories} kcal`}
                {activity.calories < 0 && `${Math.abs(activity.calories)} kcal bruciate`}
                {activity.calories === 0 && activity.description}
              </p>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(activity)}
              disabled={isLoading}
              className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </AnimatedListItem>
        );
      })}
    </AnimatedList>
  );
}
