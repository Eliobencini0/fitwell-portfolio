import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
}

export function EmptyState({ icon, title, description, ctaText, ctaHref }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        {ctaText && ctaHref && (
          <Button asChild size="sm">
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
