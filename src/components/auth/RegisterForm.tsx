'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registerSchema } from '@/lib/validations';
import { LoadingSpinner } from '@/components/ui/success-checkmark';

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Errore', {
        description: 'Le password non coincidono',
      });
      return;
    }

    // Validate input
    const validation = registerSchema.safeParse({ email, password, fullName });
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error('Dati non validi', {
        description: firstError.message,
      });
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error('Errore di registrazione', {
          description: error.message,
        });
        return;
      }

      if (data.user) {
        toast.success('Registrazione completata!', {
          description: 'Verifica la tua email per confermare l\'account',
        });

        // Se l'email confirmation è disabilitata, l'utente viene loggato automaticamente
        if (data.session) {
          router.push('/');
          router.refresh();
        } else {
          // Altrimenti torna al login
          router.push('/login');
        }
      }
    } catch {
      toast.error('Errore imprevisto', {
        description: 'Si è verificato un errore durante la registrazione',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Mario Rossi"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
          className="w-full"
        />
      </div>

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
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">
          Minimo 6 caratteri
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Conferma password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
          className="w-full"
          minLength={6}
        />
      </div>

      <Button
        type="submit"
        className="w-full flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading && <LoadingSpinner size="sm" />}
        {loading ? 'Registrazione in corso...' : 'Registrati'}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Hai già un account? </span>
        <Link href="/login" className="text-primary hover:underline">
          Accedi
        </Link>
      </div>
    </form>
  );
}
