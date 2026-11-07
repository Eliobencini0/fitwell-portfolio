'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useT } from '@/i18n/client';
import { profile } from '@/i18n/messages/profile';

const CHAT_STORAGE_KEY = 'fitwell-chat-v1';

export function LogoutButton() {
  const t = useT(profile);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    const { error } = await createClient().auth.signOut();

    if (error) {
      toast.error(t('logoutError'));
      setLoading(false);
      return;
    }

    // The chat history is stored on this device: remove it so the next person does not see it.
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // Storage unavailable: nothing to clear.
    }

    router.push('/login');
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full text-destructive hover:text-destructive"
      onClick={logout}
      disabled={loading}
    >
      <LogOut />
      {loading ? t('loggingOut') : t('logout')}
    </Button>
  );
}
