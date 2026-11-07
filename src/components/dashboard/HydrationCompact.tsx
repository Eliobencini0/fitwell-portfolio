'use client';

import { useState, useOptimistic } from 'react';
import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateHydration } from '@/lib/actions';
import { toast } from 'sonner';
import { useT } from '@/i18n/client';
import { dashboard as messages } from '@/i18n/messages/dashboard';

interface HydrationCompactProps {
  glasses: number;
  target: number;
  date: string;
}

export function HydrationCompact({
  glasses: initialGlasses,
  target,
  date,
}: HydrationCompactProps) {
  const router = useRouter();
  const t = useT(messages);
  const [optimisticGlasses, setOptimisticGlasses] = useOptimistic(initialGlasses);
  const [loading, setLoading] = useState(false);

  const percentage = (optimisticGlasses / target) * 100;

  const handleChange = async (nextGlasses: number) => {
    if (nextGlasses < 0) return;
    startTransition(() => {
      setOptimisticGlasses(nextGlasses);
    });
    setLoading(true);

    try {
      await updateHydration(date, nextGlasses);
      router.refresh();
    } catch (error) {
      toast.error(t('updateError'));
      console.error(error);
      startTransition(() => {
        setOptimisticGlasses(initialGlasses);
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = () => handleChange(optimisticGlasses + 1);
  const handleDecrement = () => handleChange(optimisticGlasses - 1);

  return (
    <div className="relative bg-card rounded-3xl p-5 pt-9 border border-border/50 flex items-center justify-between">
      {/* Remove Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={loading || optimisticGlasses <= 0}
        aria-label={t('removeGlass')}
        className="absolute top-2 left-2 w-7 h-7 rounded-full border border-border/50 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground flex items-center justify-center text-base leading-none transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        −
      </button>

      {/* Water Icon with Progress */}
      <div className="relative flex items-center gap-4">
        <div className="relative w-14 h-14">
          {/* Background circle */}
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-secondary/30"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-info transition-all duration-500"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - percentage / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          {/* Water drop icon */}
          <div className="absolute inset-0 flex items-center justify-center text-info text-2xl">
            💧
          </div>
        </div>

        {/* Text */}
        <div>
          <h3 className="text-base font-semibold text-foreground">{t('hydration')}</h3>
          <p className="text-sm text-info font-medium">
            {optimisticGlasses}/{target} {t('glasses')}
          </p>
        </div>
      </div>

      {/* Add Button */}
      <Button
        onClick={handleIncrement}
        disabled={loading}
        size="lg"
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 text-2xl font-light"
      >
        +
      </Button>
    </div>
  );
}
