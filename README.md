# Fitwell — Fitness Tracker PWA

A personal project that brings daily activities, nutrition, hydration and progress together in one web app that also works on a phone.

This repository is a public copy of the code, prepared for a portfolio. It contains no personal data, credentials or history from the original repository.

## The product

The daily dashboard collects activities, calories, macronutrients and hydration. The history view lets you review past activities, and the statistics section shows progress over time. A dedicated section holds the goals, workout plans and meal plans linked to the account.

The project includes Supabase authentication, a responsive interface, PWA configuration, feedback on actions and undo for deletions. The interface is available in English and Italian. The chat and photo sections exist as structure only: no AI feature works yet.

## Stack

- Next.js and React with TypeScript
- Tailwind CSS e componenti shadcn/ui
- Supabase for authentication and the PostgreSQL database
- Recharts for charts and next-pwa for the PWA setup

## Run locally

Requires a Node.js version compatible with Next.js 16 and a dedicated Supabase project.

```bash
git clone https://github.com/Eliobencini0/fitwell-portfolio.git
cd fitwell-portfolio
npm ci
cp .env.example .env.local
```

Set the URL and the public anon key of your own Supabase project in `.env.local`. Do not use service role keys.

In an empty development database, apply these scripts in the Supabase SQL editor, in this order:

1. `supabase-schema.sql`
2. `supabase-migration-macro-targets.sql`
3. `supabase-migration-activity-macros.sql`
4. `supabase-migration-personal-plan.sql`

The scripts define the schema and the access policies. They include no accounts, personal measurements or prefilled plans. Read them and adapt them to your own environment before use.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000) and create a test account.

## Structure

- `src/app/`: pages, dashboard and authentication callbacks
- `src/components/`: UI components, activities, history and charts
- `src/lib/`: Supabase access, actions and validation
- `public/`: icons and PWA manifest
- `supabase-*.sql`: database schema and migrations

## Limits

This is a personal project in progress. The public code needs a configured Supabase environment. This release includes no security audit and no full check of every feature.
