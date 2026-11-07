'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n/client';
import { common } from '@/i18n/messages/common';
import { profile as profileMessages } from '@/i18n/messages/profile';
import { updateProfileDetails } from '@/lib/profile-actions';
import { profileDetailsSchema } from '@/lib/validations';

type Sex = 'male' | 'female' | 'other';

export interface ProfileValues {
  fullName: string;
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  dailyCalorieTarget: number;
  dailyWaterTarget: number;
}

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return value.trim() === '' || Number.isNaN(parsed) ? null : parsed;
};

export function ProfileForm({ email, initial }: { email: string; initial: ProfileValues }) {
  const t = useT(profileMessages);
  const tc = useT(common);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(initial.fullName);
  const [sex, setSex] = useState<Sex | ''>(initial.sex ?? '');
  const [height, setHeight] = useState(initial.heightCm?.toString() ?? '');
  const [weight, setWeight] = useState(initial.weightKg?.toString() ?? '');
  const [calories, setCalories] = useState(initial.dailyCalorieTarget.toString());
  const [water, setWater] = useState(initial.dailyWaterTarget.toString());

  const sexLabel: Record<Sex, string> = {
    male: t('sexMale'),
    female: t('sexFemale'),
    other: t('sexOther'),
  };

  const reset = () => {
    setName(initial.fullName);
    setSex(initial.sex ?? '');
    setHeight(initial.heightCm?.toString() ?? '');
    setWeight(initial.weightKg?.toString() ?? '');
    setCalories(initial.dailyCalorieTarget.toString());
    setWater(initial.dailyWaterTarget.toString());
    setEditing(false);
  };

  const save = () => {
    const parsed = profileDetailsSchema.safeParse({
      fullName: name.trim() || null,
      sex: sex || null,
      heightCm: toNumber(height),
      weightKg: toNumber(weight),
      dailyCalorieTarget: toNumber(calories),
      dailyWaterTarget: toNumber(water),
    });

    if (!parsed.success) {
      toast.error(t('invalidValues'));
      return;
    }

    startTransition(async () => {
      try {
        await updateProfileDetails(parsed.data);
        toast.success(t('saved'));
        setEditing(false);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(t('saveError'));
      }
    });
  };

  const view = (label: string, value: string) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );

  const field = (id: string, label: string, value: string, onChange: (v: string) => void, inputMode: 'text' | 'decimal' | 'numeric' = 'text') => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={id}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        disabled={pending}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {view(t('email'), email)}

      {editing ? (
        <>
          {field('profile-name', t('name'), name, setName)}

          <div className="space-y-1.5">
            <Label htmlFor="profile-sex" className="text-xs text-muted-foreground">{t('sex')}</Label>
            <select
              id="profile-sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex | '')}
              disabled={pending}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            >
              <option value="" className="bg-card">{t('notSet')}</option>
              {(Object.keys(sexLabel) as Sex[]).map((key) => (
                <option key={key} value={key} className="bg-card">{sexLabel[key]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('profile-height', `${t('height')} (cm)`, height, setHeight, 'decimal')}
            {field('profile-weight', `${t('weight')} (kg)`, weight, setWeight, 'decimal')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('profile-calories', `${t('calorieTarget')} (kcal)`, calories, setCalories, 'numeric')}
            {field('profile-water', t('waterTarget'), water, setWater, 'numeric')}
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={reset} disabled={pending}>
              {tc('cancel')}
            </Button>
            <Button type="button" className="flex-1" onClick={save} disabled={pending}>
              {pending ? t('saving') : tc('save')}
            </Button>
          </div>
        </>
      ) : (
        <>
          {view(t('name'), initial.fullName || t('notSet'))}
          {view(t('sex'), initial.sex ? sexLabel[initial.sex] : t('notSet'))}
          <div className="grid grid-cols-2 gap-4">
            {view(t('height'), initial.heightCm ? t('cm', { value: initial.heightCm }) : t('notSet'))}
            {view(t('weight'), initial.weightKg ? t('kg', { value: initial.weightKg }) : t('notSet'))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {view(t('calorieTarget'), t('kcal', { value: initial.dailyCalorieTarget }))}
            {view(t('waterTarget'), t('glasses', { value: initial.dailyWaterTarget }))}
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={() => setEditing(true)}>
            {t('edit')}
          </Button>
        </>
      )}
    </div>
  );
}
