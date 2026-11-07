import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve essere almeno 6 caratteri'),
});

export const registerSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve essere almeno 6 caratteri'),
  fullName: z.string().min(2, 'Nome deve essere almeno 2 caratteri'),
});

// Activity schemas
export const activitySchema = z.object({
  title: z.string().min(1, 'Titolo obbligatorio').max(100, 'Titolo troppo lungo'),
  description: z.string().max(500, 'Descrizione troppo lunga').optional(),
  calories: z.number().int().min(-5000).max(5000).optional(),
  carbs: z.number().min(0).max(1000).optional(),
  protein: z.number().min(0).max(500).optional(),
  fats: z.number().min(0).max(500).optional(),
  activity_type: z.enum(['meal', 'workout', 'meditation', 'supplement', 'other']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
});

// Hydration schema
export const hydrationSchema = z.object({
  glasses: z.number().int().min(0, 'Non può essere negativo').max(50, 'Valore troppo alto'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
});

// Profile schema
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Nome troppo corto').max(100, 'Nome troppo lungo').optional(),
  dailyCalorieTarget: z.number().int().min(500).max(10000).optional(),
  dailyWaterTarget: z.number().int().min(1).max(50).optional(),
  macroCarbs: z.number().min(0).max(100).optional(),
  macroProtein: z.number().min(0).max(100).optional(),
  macroFats: z.number().min(0).max(100).optional(),
});

// Body measurement schema
export const bodyMeasurementSchema = z.object({
  weight: z.number().min(20).max(500).optional(),
  bodyFatPercentage: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).max(300).optional(),
  visceralFat: z.number().min(0).max(50).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato data non valido'),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type HydrationInput = z.infer<typeof hydrationSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type BodyMeasurementInput = z.infer<typeof bodyMeasurementSchema>;
