'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userEmail?: string | null;
}

export function Header({ userEmail }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">💪 Fitness Tracker</h1>

        {userEmail ? (
          <Button asChild variant="ghost" size="sm" aria-label="Vai al profilo">
            <Link href="/profile">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" />
              </svg>
              <span>Profilo</span>
            </Link>
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">🔧 Demo Mode</div>
        )}
      </div>
    </header>
  );
}
