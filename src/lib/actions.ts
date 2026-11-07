'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { activitySchema, hydrationSchema } from '@/lib/validations';

const idSchema = z.string().uuid('Id non valido');

function refresh() {
  revalidatePath('/dashboard');
  revalidatePath('/history');
  revalidatePath('/plans');
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, user };
}

export async function toggleActivity(activityId: string, completed: boolean) {
  const id = idSchema.parse(activityId);
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('daily_activities')
    .update({ completed: Boolean(completed) })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  refresh();
}

export async function updateHydration(date: string, glasses: number) {
  const input = hydrationSchema.parse({ date, glasses });
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('hydration_logs')
    .upsert({
      user_id: user.id,
      date: input.date,
      glasses: input.glasses,
    }, {
      onConflict: 'user_id,date'
    });

  if (error) throw error;

  refresh();
}

export async function createActivity(data: {
  date: string;
  title: string;
  activity_type: string;
  calories: number;
  description?: string;
  carbs?: number;
  protein?: number;
  fats?: number;
  completed?: boolean;
}) {
  const { completed, ...rest } = data;
  const input = activitySchema.parse(rest);
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('daily_activities')
    .insert({
      user_id: user.id,
      ...input,
      ...(completed ? { completed: true } : {}),
    });

  if (error) throw error;

  refresh();
}

export async function updateActivity(activityId: string, data: z.input<typeof activitySchema>) {
  const id = idSchema.parse(activityId);
  const input = activitySchema.parse(data);
  const { supabase, user } = await requireUser();

  const isMeal = input.activity_type === 'meal';
  const { error } = await supabase
    .from('daily_activities')
    .update({
      title: input.title,
      description: input.description || null,
      activity_type: input.activity_type,
      date: input.date,
      calories: input.calories ?? 0,
      carbs: isMeal ? input.carbs ?? 0 : 0,
      protein: isMeal ? input.protein ?? 0 : 0,
      fats: isMeal ? input.fats ?? 0 : 0,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  refresh();
}

export async function deleteActivity(activityId: string) {
  const id = idSchema.parse(activityId);
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('daily_activities')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;

  refresh();
}
