'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { todayYmd } from '@/lib/date';
import { profileDetailsSchema, type ProfileDetailsInput } from '@/lib/validations';

export async function updateProfileDetails(input: ProfileDetailsInput) {
  const data = profileDetailsSchema.parse(input);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName || null,
      sex: data.sex,
      height_cm: data.heightCm,
      daily_calorie_target: data.dailyCalorieTarget,
      daily_water_target: data.dailyWaterTarget,
    })
    .eq('id', user.id);

  if (error) throw error;

  if (data.weightKg !== null) {
    const { error: weightError } = await supabase
      .from('body_measurements')
      .upsert(
        { user_id: user.id, date: todayYmd(), weight: data.weightKg },
        { onConflict: 'user_id,date' }
      );
    if (weightError) throw weightError;
  }

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  revalidatePath('/plans');
}
