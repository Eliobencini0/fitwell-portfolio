export default function ScattaPage() {
  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">📸 Scatta</h2>
        <p className="text-muted-foreground">Scatta foto dei tuoi pasti</p>
      </div>

      <div className="bg-card rounded-3xl p-12 border border-border/50 text-center">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-lg font-semibold mb-2">Prossimamente</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Qui potrai scattare foto dei tuoi pasti per tracciare visivamente la tua alimentazione
        </p>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">
          Funzionalità future:
        </div>
        <div className="grid gap-3">
          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                📱
              </div>
              <div>
                <div className="font-medium text-sm">Fotocamera integrata</div>
                <div className="text-xs text-muted-foreground">Scatta direttamente dall&apos;app</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                🤖
              </div>
              <div>
                <div className="font-medium text-sm">Riconoscimento AI</div>
                <div className="text-xs text-muted-foreground">Calorie automatiche dalle foto</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                📚
              </div>
              <div>
                <div className="font-medium text-sm">Galleria pasti</div>
                <div className="text-xs text-muted-foreground">Storico fotografico</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
