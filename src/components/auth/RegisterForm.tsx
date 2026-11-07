'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createRegisterSchema } from '@/lib/validations';
import { useT } from '@/i18n/client';
import { auth } from '@/i18n/messages/auth';
import { LoadingSpinner } from '@/components/ui/success-checkmark';

export function RegisterForm() {
  const router = useRouter();
  const t = useT(auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('error'), {
        description: t('passwordsMismatch'),
      });
      return;
    }

    // Validate input
    const validation = createRegisterSchema(t).safeParse({ email, password, fullName });
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(t('invalidData'), {
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
        toast.error(t('registerError'), {
          description: error.message,
        });
        return;
      }

      if (data.user) {
        toast.success(t('registerSuccess'), {
          description: t('registerSuccessDesc'),
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
      toast.error(t('unexpectedError'), {
        description: t('registerUnexpected'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t('fullName')}</Label>
        <Input
          id="fullName"
          type="text"
          placeholder={t('fullNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
          className="w-full"
        />
      </div>

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
          minLength={6}
        />
        <p className="text-xs text-muted-foreground">
          {t('passwordMin')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
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
        {loading ? t('registering') : t('register')}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t('haveAccount')}</span>
        <Link href="/login" className="text-primary hover:underline">
          {t('signIn')}
        </Link>
      </div>
    </form>
  );
}
