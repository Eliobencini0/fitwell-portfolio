import { DailyActivity } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dateLocaleTags } from '@/i18n/config';
import { getLocale, getT } from '@/i18n/server';
import { history } from '@/i18n/messages/history';

const activityIcons = {
  meal: '🍽️',
  workout: '💪',
  meditation: '🧘',
  supplement: '💊',
  other: '📝',
} as const;

interface ActivityCardProps {
  activity: DailyActivity;
}

export async function ActivityCard({ activity }: ActivityCardProps) {
  const t = await getT(history);
  const locale = await getLocale();
  const icon = activityIcons[activity.activity_type] || '📝';
  const date = new Date(activity.date);
  const formattedDate = date.toLocaleDateString(dateLocaleTags[locale], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const showMacros = activity.activity_type === 'meal' &&
    (activity.carbs > 0 || activity.protein > 0 || activity.fats > 0);

  return (
    <div className={cn(
      "bg-card rounded-lg p-4 border border-border transition-all hover:border-primary/50",
      !activity.completed && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight">{activity.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
            </div>

            {/* Completion Status */}
            <div className="shrink-0">
              {activity.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* Calories & Macros */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {activity.calories !== 0 && (
              <div className="text-xs">
                <span className="font-medium">
                  {activity.calories > 0 ? '+' : ''}{activity.calories}
                </span>
                <span className="text-muted-foreground"> kcal</span>
              </div>
            )}

            {showMacros && (
              <div className="flex gap-2 text-xs">
                {activity.carbs > 0 && (
                  <span className="text-cyan-500">{t('gramsCarbs', { value: activity.carbs })}</span>
                )}
                {activity.protein > 0 && (
                  <span className="text-emerald-500">{t('gramsProtein', { value: activity.protein })}</span>
                )}
                {activity.fats > 0 && (
                  <span className="text-amber-500">{t('gramsFats', { value: activity.fats })}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
