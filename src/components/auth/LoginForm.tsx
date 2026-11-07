'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createLoginSchema } from '@/lib/validations';
import { useT } from '@/i18n/client';
import { auth } from '@/i18n/messages/auth';
import { safeNextPath } from '@/lib/date';
import { LoadingSpinner } from '@/components/ui/success-checkmark';

export function LoginForm() {
  const router = useRouter();
  const t = useT(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validation = createLoginSchema(t).safeParse({ email, password });
      if (!validation.success) {
        const firstError = validation.error.issues[0];
        toast.error(t('invalidData'), {
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
        toast.error(t('loginError'), {
          description: error.message,
        });
        return;
      }

      if (data.user) {
        toast.success(t('loginSuccess'));
        router.push(safeNextPath(new URLSearchParams(window.location.search).get('next')));
        router.refresh();
      }
    } catch {
      toast.error(t('unexpectedError'), {
        description: t('loginUnexpected'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('password')}</Label>
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
        {loading ? t('signingIn') : t('signIn')}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t('noAccount')}</span>
        <Link href="/register" className="text-primary hover:underline">
          {t('register')}
        </Link>
      </div>
    </form>
  );
}
