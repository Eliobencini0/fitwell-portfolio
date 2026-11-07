'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { loginSchema } from '@/lib/validations';
import { safeNextPath } from '@/lib/date';
import { LoadingSpinner } from '@/components/ui/success-checkmark';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error('Dati non validi', {
          description: firstError.message,
        });
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Errore di accesso', {
          description: error.message,
        });
        return;
      }

      if (data.user) {
        toast.success('Accesso effettuato!');
        router.push(safeNextPath(new URLSearchParams(window.location.search).get('next')));
        router.refresh();
      }
    } catch {
      toast.error('Errore imprevisto', {
        description: 'Si è verificato un errore durante l\'accesso',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="mario.rossi@esempio.it"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading && <LoadingSpinner size="sm" />}
        {loading ? 'Accesso in corso...' : 'Accedi'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Non hai un account? </span>
        <Link href="/register" className="text-primary hover:underline">
          Registrati
        </Link>
      </div>
    </form>
  );
}
