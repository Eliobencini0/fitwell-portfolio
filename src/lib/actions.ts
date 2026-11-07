'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { activitySchema, hydrationSchema } from '@/lib/validations';

const idSchema = z.string().uuid('Id non valido');

function refresh() {
  revalidatePath('/dashboard');
  revalidatePath('/history');
  revalidatePath('/stats');
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
}) {
  const input = activitySchema.parse(data);
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from('daily_activities')
    .insert({
      user_id: user.id,
      ...input,
    });

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
