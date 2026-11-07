'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createActivity } from '@/lib/actions';
import { toast } from 'sonner';
import type { ActivityType } from '@/types';
import { useT } from '@/i18n/client';
import { common } from '@/i18n/messages/common';
import { dashboard as messages } from '@/i18n/messages/dashboard';

interface AddActivityButtonProps {
  date: string;
}

export function AddActivityButton({ date }: AddActivityButtonProps) {
  const router = useRouter();
  const t = useT(messages);
  const tc = useT(common);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('meal');

  // Only render after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t('titleRequired'));
      return;
    }

    setLoading(true);

    try {
      await createActivity({
        date,
        title: title.trim(),
        description: description.trim() || undefined,
        activity_type: activityType,
        calories: parseInt(calories) || 0,
      });

      toast.success(t('activityAdded'));
      setOpen(false);

      // Reset form
      setTitle('');
      setDescription('');
      setCalories('');
      setActivityType('meal');

      router.refresh();
    } catch (error) {
      toast.error(t('addError'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const quickActivities = {
    meal: [
      { title: t('quickBreakfast'), calories: 400 },
      { title: t('quickLunch'), calories: 600 },
      { title: t('quickDinner'), calories: 600 },
      { title: t('quickSnack'), calories: 200 },
    ],
    workout: [
      { title: t('quickStrength'), calories: -300 },
      { title: t('quickCardio'), calories: -250 },
      { title: t('quickWalk'), calories: -150 },
      { title: t('quickYoga'), calories: -100 },
    ],
    other: [
      { title: t('quickMeditation'), calories: 0 },
      { title: t('quickSupplements'), calories: 0 },
      { title: t('quickRest'), calories: 0 },
    ],
  };

  const fillQuickActivity = (quickTitle: string, quickCalories: number) => {
    setTitle(quickTitle);
    setCalories(quickCalories.toString());
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 flex items-center justify-center transition-all"
        disabled
      >
        <svg
          className="w-5 h-5 text-primary-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 flex items-center justify-center transition-all">
          <svg
            className="w-5 h-5 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('newActivity')}</DialogTitle>
          <DialogDescription>
            {t('newActivityDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs
            value={activityType}
            onValueChange={(v) => setActivityType(v as ActivityType)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="meal">{t('typeMeal')}</TabsTrigger>
              <TabsTrigger value="workout">{t('typeWorkout')}</TabsTrigger>
              <TabsTrigger value="other">{t('typeOther')}</TabsTrigger>
            </TabsList>

            <TabsContent value="meal" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActivities.meal.map((activity) => (
                  <Button
                    key={activity.title}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fillQuickActivity(activity.title, activity.calories)
                    }
                  >
                    {activity.title}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workout" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActivities.workout.map((activity) => (
                  <Button
                    key={activity.title}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fillQuickActivity(activity.title, activity.calories)
                    }
                  >
                    {activity.title}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="other" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-2">
                {quickActivities.other.map((activity) => (
                  <Button
                    key={activity.title}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      fillQuickActivity(activity.title, activity.calories)
                    }
                  >
                    {activity.title}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="title">{t('titleLabel')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">{t('caloriesLabel')}</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder={t('caloriesPlaceholder')}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {t('caloriesHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('notesLabel')}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('notesPlaceholder')}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {tc('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? t('adding') : t('add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
