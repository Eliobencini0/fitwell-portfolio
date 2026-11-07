# Fitwell — Fitness Tracker PWA

Progetto personale per riunire attività quotidiane, alimentazione, idratazione e progressi in una sola applicazione web, utilizzabile anche da smartphone.

Questa repository è una copia pubblica del codice, preparata per il portfolio. Non include dati personali, credenziali o la cronologia della repository originale.

## Il prodotto

Fitwell raccoglie nella dashboard giornaliera attività, calorie, macronutrienti e idratazione. Lo storico consente di rivedere le attività; la sezione statistiche mostra i progressi nel tempo. Una sezione dedicata raccoglie obiettivi, piani di allenamento e piani alimentari associati all’account.

Il progetto include autenticazione con Supabase, interfaccia responsive, configurazione PWA, feedback sulle azioni e annullamento delle eliminazioni. Le sezioni chat e foto sono presenti come struttura e non costituiscono funzionalità AI complete.

## Stack

- Next.js e React con TypeScript
- Tailwind CSS e componenti shadcn/ui
- Supabase per autenticazione e database PostgreSQL
- Recharts per i grafici e next-pwa per la configurazione PWA

## Avvio locale

Richiede Node.js compatibile con Next.js 16 e un progetto Supabase dedicato.

```bash
git clone https://github.com/Eliobencini0/fitwell-portfolio.git
cd fitwell-portfolio
npm ci
cp .env.example .env.local
```

Inserire in `.env.local` l’URL e la chiave pubblica anon del proprio progetto Supabase. Non usare chiavi service role.

In un database di sviluppo vuoto, applicare tramite l’editor SQL di Supabase, nell’ordine:

1. `supabase-schema.sql`
2. `supabase-migration-macro-targets.sql`
3. `supabase-migration-activity-macros.sql`
4. `supabase-migration-personal-plan.sql`

Gli script definiscono lo schema e le policy di accesso. Non includono account, misurazioni personali o piani precompilati. Prima di usarli, leggere gli script e configurarli per il proprio ambiente.

```bash
npm run dev
```

Aprire [localhost:3000](http://localhost:3000) e creare un account di test.

## Struttura

- `src/app/`: pagine, dashboard e callback di autenticazione
- `src/components/`: componenti UI, attività, storico e grafici
- `src/lib/`: accesso a Supabase, azioni e validazione
- `public/`: icone e manifest PWA
- `supabase-*.sql`: schema e migrazioni del database

## Limiti

È un progetto personale in evoluzione. Il codice pubblico richiede un ambiente Supabase configurato; questa pubblicazione non include un audit di sicurezza o una verifica completa di tutte le funzionalità.
