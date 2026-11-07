export default function ChatPage() {
  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">💬 Chat</h2>
        <p className="text-muted-foreground">Assistente fitness personale</p>
      </div>

      <div className="bg-card rounded-3xl p-12 border border-border/50 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold mb-2">Prossimamente</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Chat con un assistente AI per consigli su alimentazione, allenamento e motivazione
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
                💡
              </div>
              <div>
                <div className="font-medium text-sm">Consigli personalizzati</div>
                <div className="text-xs text-muted-foreground">Suggerimenti su misura per te</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                📊
              </div>
              <div>
                <div className="font-medium text-sm">Analisi progressi</div>
                <div className="text-xs text-muted-foreground">Feedback sui tuoi risultati</div>
              </div>
            </div>
          </div>

          <div className="bg-card/50 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                🎯
              </div>
              <div>
                <div className="font-medium text-sm">Piano allenamento</div>
                <div className="text-xs text-muted-foreground">Programmi personalizzati</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
