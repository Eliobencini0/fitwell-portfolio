'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/client';
import { common } from '@/i18n/messages/common';
import { layout } from '@/i18n/messages/layout';

type NavLabel = 'navToday' | 'navHistory' | 'navChat' | 'navPlans';

const navItems: { href: string; label: NavLabel; icon: React.ReactNode }[] = [
  {
    href: '/dashboard',
    label: 'navToday',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: '/history',
    label: 'navHistory',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: '/chat',
    label: 'navChat',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 10h8M8 14h5m-9 6l1.5-3.5A8 8 0 1112 20H4z"
        />
      </svg>
    ),
  },
  {
    href: '/plans',
    label: 'navPlans',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const tCommon = useT(common);
  const tLayout = useT(layout);
  const labels: Record<NavLabel, string> = {
    navToday: tCommon('navToday'),
    navHistory: tCommon('navHistory'),
    navChat: tCommon('navChat'),
    navPlans: tLayout('navPlans'),
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-lg z-50">
      <div className="container mx-auto px-6 py-2 flex justify-around items-center max-w-lg">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground/60 hover:text-muted-foreground'
              )}
            >
              <div className={cn(isActive && 'scale-110 transition-transform')}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wide">
                {labels[item.label]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
