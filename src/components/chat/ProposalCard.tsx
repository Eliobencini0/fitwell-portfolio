'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useT } from '@/i18n/client';
import { chat } from '@/i18n/messages/chat';
import { createActivity } from '@/lib/actions';

export type Proposal =
  | {
      kind: 'meal';
      title: string;
      items: string[];
      calories: number;
      carbs: number;
      protein: number;
      fats: number;
      date: string;
    }
  | {
      kind: 'workout';
      title: string;
      details: string | null;
      durationMin: number | null;
      caloriesBurned: number;
      date: string;
    };

export type ProposalStatus = 'added' | 'dismissed';

interface ProposalCardProps {
  proposal: Proposal;
  status?: ProposalStatus;
  onResolve: (status: ProposalStatus) => void;
}

export function ProposalCard({ proposal, status, onResolve }: ProposalCardProps) {
  const t = useT(chat);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    setSaving(true);
    try {
      if (proposal.kind === 'meal') {
        await createActivity({
          date: proposal.date,
          title: proposal.title,
          description: proposal.items.join(', ') || undefined,
          activity_type: 'meal',
          calories: proposal.calories,
          carbs: proposal.carbs,
          protein: proposal.protein,
          fats: proposal.fats,
          completed: true,
        });
      } else {
        const description = [
          proposal.details,
          proposal.durationMin ? t('minutes', { value: proposal.durationMin }) : null,
        ]
          .filter(Boolean)
          .join(' · ');
        await createActivity({
          date: proposal.date,
          title: proposal.title,
          description: description || undefined,
          activity_type: 'workout',
          calories: -proposal.caloriesBurned,
          completed: true,
        });
      }
      toast.success(t('added'));
      onResolve('added');
    } catch (error) {
      console.error(error);
      toast.error(t('addError'));
    } finally {
      setSaving(false);
    }
  };

  const macro = (label: string, value: number, color: string) => (
    <div className="flex-1 rounded-xl bg-background/50 px-2 py-1.5 text-center">
      <p className={`text-sm font-semibold ${color}`}>{t('grams', { value })}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {proposal.kind === 'meal' ? t('proposalMeal') : t('proposalWorkout')}
          </p>
          <p className="text-sm font-semibold text-foreground">{proposal.title}</p>
          <p className="text-xs text-muted-foreground">
            {t('proposalDate')}: {proposal.date}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-primary">
          {proposal.kind === 'meal'
            ? t('kcalEaten', { value: proposal.calories })
            : t('kcalBurned', { value: proposal.caloriesBurned })}
        </p>
      </div>

      {proposal.kind === 'meal' && (
        <>
          {proposal.items.length > 0 && (
            <p className="text-xs text-muted-foreground">{proposal.items.join(', ')}</p>
          )}
          <div className="flex gap-2">
            {macro(t('carbs'), proposal.carbs, 'text-cyan-500')}
            {macro(t('protein'), proposal.protein, 'text-emerald-500')}
            {macro(t('fats'), proposal.fats, 'text-amber-500')}
          </div>
        </>
      )}

      {proposal.kind === 'workout' && (proposal.details || proposal.durationMin) && (
        <p className="text-xs text-muted-foreground">
          {[proposal.details, proposal.durationMin ? t('minutes', { value: proposal.durationMin }) : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">{t('estimate')}</p>

      {status === 'added' && <p className="text-xs font-medium text-primary">{t('added')}</p>}
      {status === 'dismissed' && <p className="text-xs text-muted-foreground">{t('dismissed')}</p>}
      {!status && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onResolve('dismissed')}
            disabled={saving}
          >
            {t('dismiss')}
          </Button>
          <Button type="button" className="flex-1" onClick={add} disabled={saving}>
            {t('add')}
          </Button>
        </div>
      )}
    </div>
  );
}
