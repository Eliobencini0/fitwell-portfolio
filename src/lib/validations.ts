import { z } from 'zod';
import { isValidYmd } from '@/lib/date';
import type { AuthKey } from '@/i18n/messages/auth';

const ymdDate = z.string().refine(isValidYmd, 'Invalid date format');

// Auth schemas (English messages, for server-side use)
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

// Localised auth schema factories: pass the `t` function from useT(auth)
type AuthT = (key: AuthKey) => string;

export const createLoginSchema = (t: AuthT) =>
  z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(6, t('passwordTooShort')),
  });

export const createRegisterSchema = (t: AuthT) =>
  z.object({
    email: z.string().email(t('invalidEmail')),
    password: z.string().min(6, t('passwordTooShort')),
    fullName: z.string().min(2, t('nameTooShort')),
  });

// Activity schemas
export const activitySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  calories: z.number().int().min(-5000).max(5000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  protein: z.number().min(0).max(500).optional(),
  fats: z.number().min(0).max(500).optional(),
  activity_type: z.enum(['meal', 'workout', 'meditation', 'supplement', 'other']),
  date: ymdDate,
});

// Hydration schema
export const hydrationSchema = z.object({
  glasses: z.number().int().min(0, 'Cannot be negative').max(50, 'Value is too high'),
  date: ymdDate,
});

// Profile schema
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is too short').max(100, 'Name is too long').optional(),
  dailyCalorieTarget: z.number().int().min(500).max(10000).optional(),
  dailyWaterTarget: z.number().int().min(1).max(50).optional(),
  macroCarbs: z.number().min(0).max(100).optional(),
  macroProtein: z.number().min(0).max(100).optional(),
  macroFats: z.number().min(0).max(100).optional(),
});

// Profile details edited from the profile page (empty optional fields are null)
export const profileDetailsSchema = z.object({
  fullName: z.string().trim().max(100).nullable(),
  sex: z.enum(['male', 'female', 'other']).nullable(),
  heightCm: z.number().min(50).max(250).nullable(),
  weightKg: z.number().min(20).max(500).nullable(),
  dailyCalorieTarget: z.number().int().min(500).max(10000),
  dailyWaterTarget: z.number().int().min(1).max(50),
});

// Body measurement schema
export const bodyMeasurementSchema = z.object({
  weight: z.number().min(20).max(500).optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).max(300).optional(),
  visceralFat: z.number().min(0).max(50).optional(),
  date: ymdDate,
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type HydrationInput = z.infer<typeof hydrationSchema>;
export type ProfileDetailsInput = z.infer<typeof profileDetailsSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type BodyMeasurementInput = z.infer<typeof bodyMeasurementSchema>;
