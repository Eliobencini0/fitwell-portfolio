import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  tool,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { createGoogle } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getLocale } from '@/i18n/server';
import { isValidYmd, todayYmd } from '@/lib/date';
import { localeNames } from '@/i18n/config';
import { availableModels, cooldown, firstOutput } from '@/lib/model-cascade';

export const maxDuration = 60;

const MAX_MESSAGES = 30;
const MAX_IMAGE_DATA_URL_CHARS = 3_000_000; // ~2.2 MB of image data
const MAX_REQUESTS_PER_MINUTE = 12;

// Best-effort limiter: per server instance, enough to stop a runaway client.
const recentRequests = new Map<string, number[]>();

function rateLimited(userId: string) {
  const now = Date.now();
  const recent = (recentRequests.get(userId) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  recentRequests.set(userId, recent);
  return recent.length > MAX_REQUESTS_PER_MINUTE;
}

function json(status: number, code: string) {
  return Response.json({ error: code }, { status });
}

const dateField = z
  .string()
  .optional()
  .describe('YYYY-MM-DD. Leave empty for today.');

function resolveDate(value: string | undefined) {
  return isValidYmd(value) ? value : todayYmd();
}

const round = (value: number) => Math.round(value * 10) / 10;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return json(503, 'not_configured');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json(401, 'unauthenticated');
  if (rateLimited(user.id)) return json(429, 'too_many_requests');

  let messages: UIMessage[];
  try {
    const body = await request.json();
    messages = Array.isArray(body?.messages) ? body.messages.slice(-MAX_MESSAGES) : [];
  } catch {
    return json(400, 'bad_request');
  }
  if (messages.length === 0) return json(400, 'bad_request');

  // Only accept small images; drop anything else a client might send.
  for (const message of messages) {
    message.parts = message.parts.filter((part) => {
      if (part.type !== 'file') return true;
      return (
        /^image\/(jpeg|png|webp)$/.test(part.mediaType) &&
        typeof part.url === 'string' &&
        part.url.startsWith('data:') &&
        part.url.length <= MAX_IMAGE_DATA_URL_CHARS
      );
    });
  }

  const locale = await getLocale();
  const today = todayYmd();
  const timeNow = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const [profileRes, todayRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('daily_activities')
      .select('title, activity_type, calories, carbs, protein, fats, completed, created_at')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at'),
  ]);

  const profile = profileRes.data;
  const profileSummary = {
    name: profile?.full_name ?? null,
    sex: profile?.sex ?? null,
    heightCm: profile?.height_cm ?? null,
    dailyCalorieTarget: profile?.daily_calorie_target ?? 2000,
    dailyWaterGlasses: profile?.daily_water_target ?? 10,
    macroSplitPercent: {
      carbs: profile?.macro_carbs_percentage ?? 50,
      protein: profile?.macro_protein_percentage ?? 30,
      fats: profile?.macro_fats_percentage ?? 20,
    },
  };

  const system = `You are the assistant inside Fitwell, a personal fitness tracker. You help one user with food, workouts, hydration, weekly plans and brainstorming.

Always reply in the language of the user's latest message (for example Italian if they write in Italian). Only if the message has no clear language, use ${localeNames[locale]}. Be brief and concrete: short sentences, numbers with units, no filler. Plain text only: no markdown, no asterisks, no headings; use short lines or a simple dash list.

Now: ${today} ${timeNow} (Europe/Rome). The user's profile and targets: ${JSON.stringify(profileSummary)}.
Today's logged activities (completed=false means planned but not done): ${JSON.stringify(todayRes.data ?? [])}.

Rules:
- Food photo: name the foods you can see, estimate portion sizes in grams, then call propose_meal with calories and macros for the whole plate. Say that it is an estimate. If the photo is unclear or portions are impossible to judge, ask one short question instead of guessing.
- Gym machine or exercise photo: identify the machine or exercise, then ask for sets, reps, weight and duration if the user has not said them. Only after that call propose_workout with an estimated calories burned (a positive number) based on the user's data.
- Text only ("I ate 2 eggs", "I ran 30 minutes", "lentils for dinner today and spinach for lunch tomorrow"): estimate and call propose_meal or propose_workout once for EACH meal or workout mentioned, in the same turn, each with its own date. Dates can be in the future ("tomorrow", "Friday"): resolve them from today's date. Never answer with a plain text list of numbers instead of calling the tool.
- Quantities are as eaten: legumes, pasta, rice and similar foods are cooked unless the user says raw or dry. Do not ask about this; just use cooked values.
- propose_meal and propose_workout never save anything: the user confirms in the app. Do not say the activity was added; say you prepared it and ask them to confirm.
- Use get_day, get_week and get_plans to answer questions about what the user did or planned. Do not invent past data: if a tool returns nothing, say so.
- Planning and brainstorming (weekly meals, workout split, suggestions): use the profile, targets and recent activity. Give a concrete plan, ask at most one clarifying question, and keep it short. A stored weekly plan document cannot be saved yet, but any specific meal or workout with a date can be proposed with the tools, so when the user tells you concrete meals or workouts for given days, propose each one instead of saying you cannot save it.
- You are not a doctor. For medical conditions, injuries or very low calorie targets, suggest talking to a professional.`;

  const google = createGoogle({ apiKey });
  const modelIds = availableModels();
  if (modelIds.length === 0) return json(503, 'quota_exhausted');

  const baseOptions = {
    system,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    maxRetries: 0,
    tools: {
      propose_meal: tool({
        description:
          'Prepare a meal or snack for the user to confirm. Does not save anything. Macros are for the whole portion.',
        inputSchema: z.object({
          title: z.string().min(1).max(100).describe('Short name, e.g. "Pasta with vegetables"'),
          items: z.array(z.string()).max(15).describe('Foods recognised in the meal'),
          calories: z.number().min(0).max(5000).describe('Total kcal'),
          carbs_g: z.number().min(0).max(1000),
          protein_g: z.number().min(0).max(500),
          fats_g: z.number().min(0).max(500),
          date: dateField,
        }),
        execute: async (input) => ({
          kind: 'meal' as const,
          title: input.title,
          items: input.items,
          calories: Math.round(input.calories),
          carbs: round(input.carbs_g),
          protein: round(input.protein_g),
          fats: round(input.fats_g),
          date: resolveDate(input.date),
        }),
      }),

      propose_workout: tool({
        description:
          'Prepare a workout or exercise session for the user to confirm. Does not save anything.',
        inputSchema: z.object({
          title: z.string().min(1).max(100).describe('e.g. "Leg press 4x10 at 80 kg"'),
          details: z.string().max(300).optional().describe('Sets, reps, weight, machine'),
          duration_min: z.number().min(1).max(600).optional(),
          calories_burned: z.number().min(0).max(5000).describe('Estimated kcal burned, positive number'),
          date: dateField,
        }),
        execute: async (input) => ({
          kind: 'workout' as const,
          title: input.title,
          details: input.details ?? null,
          durationMin: input.duration_min ? Math.round(input.duration_min) : null,
          caloriesBurned: Math.round(input.calories_burned),
          date: resolveDate(input.date),
        }),
      }),

      get_day: tool({
        description: "Read the user's activities for one day (meals, workouts, completion).",
        inputSchema: z.object({ date: dateField }),
        execute: async ({ date }) => {
          const day = resolveDate(date);
          const [activities, hydration] = await Promise.all([
            supabase
              .from('daily_activities')
              .select('title, activity_type, calories, carbs, protein, fats, completed, created_at')
              .eq('user_id', user.id)
              .eq('date', day)
              .order('created_at'),
            supabase
              .from('hydration_logs')
              .select('glasses, target')
              .eq('user_id', user.id)
              .eq('date', day)
              .maybeSingle(),
          ]);
          return { date: day, activities: activities.data ?? [], hydration: hydration.data ?? null };
        },
      }),

      get_week: tool({
        description: 'Read the last 7 days: per day calories eaten and burned (completed activities only) and activity count.',
        inputSchema: z.object({}),
        execute: async () => {
          const from = new Date(`${today}T00:00:00Z`);
          from.setUTCDate(from.getUTCDate() - 6);
          const fromYmd = from.toISOString().slice(0, 10);

          const { data } = await supabase
            .from('daily_activities')
            .select('date, activity_type, calories, completed')
            .eq('user_id', user.id)
            .gte('date', fromYmd)
            .lte('date', today);

          const days: Record<string, { eaten: number; burned: number; activities: number; done: number }> = {};
          for (const row of data ?? []) {
            const day = (days[row.date] ??= { eaten: 0, burned: 0, activities: 0, done: 0 });
            day.activities += 1;
            if (!row.completed) continue;
            day.done += 1;
            if (row.calories > 0) day.eaten += row.calories;
            else day.burned += Math.abs(row.calories);
          }
          return { from: fromYmd, to: today, days };
        },
      }),

      get_plans: tool({
        description: "Read the user's active goal, meal plan, workout plan and supplements, as stored.",
        inputSchema: z.object({}),
        execute: async () => {
          const [goal, meals, workouts, supplements] = await Promise.all([
            supabase.from('user_goals').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
            supabase.from('meal_plans').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
            supabase.from('workout_plans').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
            supabase.from('supplements').select('*').eq('user_id', user.id).eq('is_active', true),
          ]);
          return {
            goal: goal.data ?? null,
            mealPlan: meals.data ?? null,
            workoutPlan: workouts.data ?? null,
            supplements: supplements.data ?? [],
          };
        },
      }),
    },
  };

  // Try the models in order. A model that fails before producing output
  // (quota, overload, unknown model) is skipped and the next one is tried.
  let lastError: unknown;
  for (const modelId of modelIds) {
    const result = streamText({
      ...baseOptions,
      model: google(modelId),
      onError: () => {},
    });

    const attempt = await firstOutput(result.stream);
    if (attempt.ok) {
      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: attempt.stream }),
      });
    }

    lastError = attempt.error;
    console.error(`chat model ${modelId} failed`, attempt.error);
    cooldown(modelId, attempt.error);
  }

  console.error('all chat models failed', lastError);
  return json(503, 'quota_exhausted');
}
