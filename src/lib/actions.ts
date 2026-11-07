'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleActivity(activityId: string, completed: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('daily_activities')
    .update({ completed })
    .eq('id', activityId);

  if (error) throw error;

  revalidatePath('/');
}

export async function updateHydration(date: string, glasses: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('hydration_logs')
    .upsert({
      user_id: user.id,
      date,
      glasses,
    }, {
      onConflict: 'user_id,date'
    });

  if (error) throw error;

  revalidatePath('/');
}

export async function createActivity(data: {
  date: string;
  title: string;
  activity_type: string;
  calories: number;
  description?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('daily_activities')
    .insert({
      user_id: user.id,
      ...data,
    });

  if (error) throw error;

  revalidatePath('/');
}

export async function deleteActivity(activityId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('daily_activities')
    .delete()
    .eq('id', activityId);

  if (error) throw error;

  revalidatePath('/');
}
