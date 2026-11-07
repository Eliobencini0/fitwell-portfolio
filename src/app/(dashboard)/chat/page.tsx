import { getT } from '@/i18n/server';
import { misc } from '@/i18n/messages/misc';

export default async function ChatPage() {
  const t = await getT(misc);

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">💬 Chat</h2>
        <p className="text-muted-foreground">{t('chatSubtitle')}</p>
      </div>

      <div className="bg-card rounded-3xl p-12 border border-border/50 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold mb-2">{t('comingSoon')}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t('chatIntro')}
        </p>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          {t('futureFeatures')}
        </div>
        <div className="grid gap-3">
          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                💡
              </div>
              <div>
                <div className="font-medium text-sm">{t('chatTipsTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('chatTipsDesc')}</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                📊
              </div>
              <div>
                <div className="font-medium text-sm">{t('chatProgressTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('chatProgressDesc')}</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                🎯
              </div>
              <div>
                <div className="font-medium text-sm">{t('chatPlanTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('chatPlanDesc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
