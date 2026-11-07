'use client';

export default function PlansError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Errore</h2>
        <p className="text-muted-foreground">
          Si è verificato un problema nel caricamento del piano
        </p>
      </div>

      <div className="bg-card rounded-lg p-6 border border-destructive/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2 text-destructive">
              Dettagli Errore
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || 'Errore sconosciuto'}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mb-4">
                ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Riprova
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border text-center">
        <h3 className="font-semibold mb-2">Suggerimenti</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>Verifica la tua connessione internet</li>
          <li>Ricarica la pagina</li>
          <li>Se il problema persiste, contatta il supporto</li>
        </ul>
      </div>
    </div>
  );
}
