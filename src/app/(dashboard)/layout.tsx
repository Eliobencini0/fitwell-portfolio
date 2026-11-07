import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const isSupabaseConfigured =
    supabaseUrl && !supabaseUrl.includes('placeholder');

  let user = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (!user) {
      redirect('/login');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={user?.email} />

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
