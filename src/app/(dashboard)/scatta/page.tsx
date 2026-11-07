import { getT } from '@/i18n/server';
import { misc } from '@/i18n/messages/misc';

export default async function ScattaPage() {
  const t = await getT(misc);

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📸 {t('scattaTitle')}</h2>
        <p className="text-muted-foreground">{t('scattaSubtitle')}</p>
      </div>

      <div className="bg-card rounded-3xl p-12 border border-border/50 text-center">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-lg font-semibold mb-2">{t('comingSoon')}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {t('scattaIntro')}
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
                📱
              </div>
              <div>
                <div className="font-medium text-sm">{t('scattaCameraTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('scattaCameraDesc')}</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                🤖
              </div>
              <div>
                <div className="font-medium text-sm">{t('scattaAiTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('scattaAiDesc')}</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                📚
              </div>
              <div>
                <div className="font-medium text-sm">{t('scattaGalleryTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('scattaGalleryDesc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
