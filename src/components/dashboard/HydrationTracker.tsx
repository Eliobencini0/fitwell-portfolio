'use client';

import { useState, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { updateHydration } from '@/lib/actions';
import { toast } from 'sonner';
import { useT } from '@/i18n/client';
import { dashboard as messages } from '@/i18n/messages/dashboard';

interface HydrationTrackerProps {
  glasses: number;
  target: number;
  date: string;
}

export function HydrationTracker({
  glasses: initialGlasses,
  target,
  date,
}: HydrationTrackerProps) {
  const router = useRouter();
  const t = useT(messages);
  const [optimisticGlasses, setOptimisticGlasses] = useOptimistic(initialGlasses);
  const [loading, setLoading] = useState(false);

  const percentage = Math.min((optimisticGlasses / target) * 100, 100);

  const handleUpdate = async (newGlasses: number) => {
    if (newGlasses < 0) return;

    setOptimisticGlasses(newGlasses);
    setLoading(true);

    try {
      await updateHydration(date, newGlasses);
      router.refresh();
    } catch (error) {
      toast.error(t('updateError'));
      console.error(error);
      // Revert optimistic update
      setOptimisticGlasses(initialGlasses);
    } finally {
      setLoading(false);
    }
  };

  const increment = () => handleUpdate(optimisticGlasses + 1);
  const decrement = () => handleUpdate(Math.max(0, optimisticGlasses - 1));

  return (
    <div className="bg-card rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          💧 {t('hydration')}
        </h3>
        <div className="text-xs text-muted-foreground">
          {optimisticGlasses} / {target} {t('glasses')}
        </div>
      </div>

      <div className="space-y-4">
        <Progress value={percentage} className="h-3" />

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={decrement}
            disabled={loading || optimisticGlasses === 0}
            className="w-14 h-14 rounded-full text-xl"
          >
            −
          </Button>

          <div className="text-center min-w-[80px]">
            <div className="text-4xl font-bold text-info">
              {optimisticGlasses}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {percentage.toFixed(0)}%
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={increment}
            disabled={loading}
            className="w-14 h-14 rounded-full text-xl"
          >
            +
          </Button>
        </div>

        {optimisticGlasses >= target && (
          <div className="text-center text-sm text-success animate-in fade-in">
            {t('goalReached')}
          </div>
        )}
      </div>
    </div>
  );
}
