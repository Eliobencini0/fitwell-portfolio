'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateActivity } from '@/lib/actions';
import { activitySchema } from '@/lib/validations';
import { useT } from '@/i18n/client';
import { common } from '@/i18n/messages/common';
import { activityEdit } from '@/i18n/messages/activity-edit';
import type { ActivityType, DailyActivity } from '@/types';

const TYPES: ActivityType[] = ['meal', 'workout', 'meditation', 'supplement', 'other'];

const typeKey = {
  meal: 'typeMeal',
  workout: 'typeWorkout',
  meditation: 'typeMeditation',
  supplement: 'typeSupplement',
  other: 'typeOther',
} as const;

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return value.trim() === '' || Number.isNaN(parsed) ? 0 : parsed;
};

interface EditActivityDialogProps {
  activity: DailyActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditActivityDialog({ activity, open, onOpenChange }: EditActivityDialogProps) {
  const t = useT(activityEdit);
  const tc = useT(common);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description ?? '');
  const [date, setDate] = useState(activity.date);
  const [type, setType] = useState<ActivityType>(activity.activity_type);
  const [calories, setCalories] = useState(String(activity.calories ?? 0));
  const [carbs, setCarbs] = useState(String(activity.carbs ?? 0));
  const [protein, setProtein] = useState(String(activity.protein ?? 0));
  const [fats, setFats] = useState(String(activity.fats ?? 0));

  const save = (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = activitySchema.safeParse({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      activity_type: type,
      calories: Math.round(toNumber(calories)),
      carbs: toNumber(carbs),
      protein: toNumber(protein),
      fats: toNumber(fats),
    });

    if (!parsed.success) {
      toast.error(t('invalid'));
      return;
    }

    startTransition(async () => {
      try {
        await updateActivity(activity.id, parsed.data);
        toast.success(t('saved'));
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(t('error'));
      }
    });
  };

  const field = (id: string, label: string, value: string, onChange: (v: string) => void, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={pending} {...props} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editTitle')}</DialogTitle>
          <DialogDescription>{t('editDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="space-y-4">
          {field('edit-title', t('title'), title, setTitle, { maxLength: 100 })}
          {field('edit-description', t('description'), description, setDescription, { maxLength: 500 })}

          <div className="grid grid-cols-2 gap-4">
            {field('edit-date', t('date'), date, setDate, { type: 'date' })}

            <div className="space-y-1.5">
              <Label htmlFor="edit-type" className="text-xs text-muted-foreground">{t('type')}</Label>
              <select
                id="edit-type"
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                disabled={pending}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
              >
                {TYPES.map((value) => (
                  <option key={value} value={value} className="bg-card">{t(typeKey[value])}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            {field('edit-calories', t('calories'), calories, setCalories, { inputMode: 'numeric' })}
            <p className="text-xs text-muted-foreground">{t('caloriesHint')}</p>
          </div>

          {type === 'meal' && (
            <div className="grid grid-cols-3 gap-3">
              {field('edit-carbs', t('carbs'), carbs, setCarbs, { inputMode: 'decimal' })}
              {field('edit-protein', t('protein'), protein, setProtein, { inputMode: 'decimal' })}
              {field('edit-fats', t('fats'), fats, setFats, { inputMode: 'decimal' })}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={pending}>
              {tc('cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? tc('loading') : tc('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
