// Models in order of preference. Override with GEMINI_MODELS="a,b,c" (comma separated).
const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

export function configuredModels() {
  const raw = process.env.GEMINI_MODELS ?? process.env.GEMINI_MODEL;
  const list = raw?.split(',').map((m) => m.trim()).filter(Boolean);
  return list && list.length > 0 ? list : DEFAULT_MODELS;
}

// A model that hit its quota is skipped for a while so the next request does not wait on it.
const coolingDown = new Map<string, number>();
const COOLDOWN_MS = 60_000;

export function availableModels() {
  const now = Date.now();
  return configuredModels().filter((id) => (coolingDown.get(id) ?? 0) <= now);
}

export function cooldown(modelId: string, error: unknown) {
  const status = (error as { statusCode?: number } | undefined)?.statusCode;
  if (status === 429 || status === 404 || (status !== undefined && status >= 500)) {
    coolingDown.set(modelId, Date.now() + COOLDOWN_MS);
  }
}

type StreamPart = { type: string; error?: unknown };

/**
 * Reads the stream until the model starts producing output or fails.
 * On success returns an equivalent stream that replays what was read.
 */
export async function firstOutput<T extends StreamPart>(
  source: ReadableStream<T>
): Promise<{ ok: true; stream: ReadableStream<T> } | { ok: false; error: unknown }> {
  const reader = source.getReader();
  const buffered: T[] = [];
  const preamble = new Set(['start', 'start-step', 'raw']);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.type === 'error') {
        await reader.cancel().catch(() => {});
        return { ok: false, error: value.error };
      }
      buffered.push(value);
      if (!preamble.has(value.type)) break;
    }
  } catch (error) {
    return { ok: false, error };
  }

  const stream = new ReadableStream<T>({
    start(controller) {
      for (const part of buffered) controller.enqueue(part);
    },
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });

  return { ok: true, stream };
}
