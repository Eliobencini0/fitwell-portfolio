'use client';

import { useState, useOptimistic } from 'react';
import { startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updateHydration } from '@/lib/actions';
import { toast } from 'sonner';

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
  const [optimisticGlasses, setOptimisticGlasses] = useOptimistic(initialGlasses);
  const [loading, setLoading] = useState(false);

  const percentage = (optimisticGlasses / target) * 100;

  const handleIncrement = async () => {
    const nextGlasses = optimisticGlasses + 1;
    startTransition(() => {
      setOptimisticGlasses(nextGlasses);
    });
    setLoading(true);

    try {
      await updateHydration(date, nextGlasses);
      router.refresh();
    } catch (error) {
      toast.error('Errore nell\'aggiornamento');
      console.error(error);
      startTransition(() => {
        setOptimisticGlasses(initialGlasses);
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-3xl p-5 border border-border/50 flex items-center justify-between">
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
          <h3 className="text-base font-semibold text-foreground">Idratazione</h3>
          <p className="text-sm text-info font-medium">
            {optimisticGlasses}/{target} bicchieri
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
