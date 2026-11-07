import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes('placeholder');

  if (!isSupabaseConfigured) {
    // Show a setup page if Supabase is not configured
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-2xl space-y-6 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-4xl">
            💪
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Fitness Tracker
          </h1>
          <div className="bg-card rounded-lg p-8 border border-border space-y-4 text-left">
            <h2 className="text-xl font-semibold text-primary">
              🔧 Configurazione Supabase
            </h2>
            <p className="text-muted-foreground">
              Per utilizzare l&apos;app, devi configurare Supabase:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Vai su <a href="https://supabase.com/dashboard" target="_blank" className="text-primary hover:underline">supabase.com/dashboard</a></li>
              <li>Crea un nuovo progetto</li>
              <li>Vai su Settings → API</li>
              <li>Copia il Project URL e la anon/public key</li>
              <li>Aggiorna il file <code className="bg-background px-2 py-1 rounded">.env.local</code></li>
              <li>Esegui lo script SQL per creare le tabelle (vedi DATABASE_SETUP.md)</li>
              <li>Riavvia il server di sviluppo</li>
            </ol>
            <div className="mt-6 p-4 bg-background rounded border border-border">
              <p className="text-xs font-mono text-muted-foreground mb-2">
                .env.local:
              </p>
              <code className="text-xs">
                NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co<br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=tua-chiave-qui
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
