'use client';

import { useT } from '@/i18n/client';
import { dashboard as messages } from '@/i18n/messages/dashboard';
interface MacroData {
  carbs: number;      // grammi
  protein: number;    // grammi
  fats: number;       // grammi
}

interface CalorieBalanceProps {
  consumed: number;
  burned: number;
  target: number;
  macrosConsumed: MacroData;
  macrosTarget: MacroData;
}

function MacroIndicator({
  label,
  value,
  target,
  color
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <div className="flex-1 min-w-0 text-center">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs font-medium text-foreground">
        {Math.round(value)}/{Math.round(target)}g
      </div>
    </div>
  );
}

export function CalorieBalance({
  consumed,
  burned,
  target,
  macrosConsumed,
  macrosTarget,
}: CalorieBalanceProps) {
  const t = useT(messages);
  const remaining = Math.max(target - consumed + burned, 0);

  return (
    <div className="bg-card rounded-3xl p-6 border border-border/50">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-6">
        {t('summary')}
      </h3>

      {/* 3 Colonne Responsive */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* CONSUMATE */}
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-foreground">
            {consumed}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{t('consumed')}</div>
        </div>

        {/* RESTANTE */}
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-primary">
            {remaining}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{t('remaining')}</div>
        </div>

        {/* BRUCIATE */}
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-orange-500">
            {burned}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{t('burned')}</div>
        </div>
      </div>

      {/* Macro - Layout orizzontale */}
      <div className="flex gap-3">
        <MacroIndicator
          label={t('carbs')}
          value={macrosConsumed.carbs}
          target={macrosTarget.carbs}
          color="bg-cyan-500"
        />
        <MacroIndicator
          label={t('protein')}
          value={macrosConsumed.protein}
          target={macrosTarget.protein}
          color="bg-emerald-500"
        />
        <MacroIndicator
          label={t('fats')}
          value={macrosConsumed.fats}
          target={macrosTarget.fats}
          color="bg-amber-500"
        />
      </div>
    </div>
  );
}
