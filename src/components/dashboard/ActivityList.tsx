'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toggleActivity, deleteActivity } from '@/lib/actions';
import { toast } from 'sonner';
import type { DailyActivity } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActivityListProps {
  activities: DailyActivity[];
}

const activityIcons: Record<string, string> = {
  meal: '🍽️',
  workout: '💪',
  meditation: '🧘',
  supplement: '💊',
  other: '📝',
};

export function ActivityList({ activities }: ActivityListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (activityId: string, currentStatus: boolean) => {
    setLoadingId(activityId);

    try {
      await toggleActivity(activityId, !currentStatus);
      router.refresh();
      toast.success(
        !currentStatus ? 'Attività completata! 🎉' : 'Attività non completata'
      );
    } catch (error) {
      toast.error('Errore nell\'aggiornamento');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa attività?')) {
      return;
    }

    setLoadingId(activityId);

    try {
      await deleteActivity(activityId);
      router.refresh();
      toast.success('Attività eliminata');
    } catch (error) {
      toast.error('Errore nell\'eliminazione');
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-lg p-8 border border-border text-center">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-sm text-muted-foreground">
          Nessuna attività pianificata per oggi.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Aggiungi la tua prima attività!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => {
        const isLoading = loadingId === activity.id;
        const icon = activityIcons[activity.activity_type] || '📝';

        return (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
          >
            {/* Checkbox */}
            <button
              onClick={() => handleToggle(activity.id, activity.completed)}
              disabled={isLoading}
              className="flex-shrink-0"
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  activity.completed
                    ? 'bg-success border-success'
                    : 'border-muted-foreground hover:border-primary'
                }`}
              >
                {activity.completed && <span className="text-white text-sm">✓</span>}
              </div>
            </button>

            {/* Icon */}
            <div className="text-2xl">{icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className={`text-sm font-medium truncate ${
                  activity.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {activity.title}
              </div>
              {activity.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </div>
              )}
            </div>

            {/* Calories */}
            <div className="flex-shrink-0">
              <div
                className={`text-sm font-medium ${
                  activity.calories > 0
                    ? 'text-success'
                    : activity.calories < 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {activity.calories > 0 ? '+' : ''}
                {activity.calories} cal
              </div>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isLoading}
                >
                  ⋮
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleToggle(activity.id, activity.completed)}
                >
                  {activity.completed ? '↩️ Segna non completata' : '✅ Segna completata'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(activity.id)}
                  className="text-destructive"
                >
                  🗑️ Elimina
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      })}
    </div>
  );
}
