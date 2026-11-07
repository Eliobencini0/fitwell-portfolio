'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ImagePlus, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useT } from '@/i18n/client';
import { chat } from '@/i18n/messages/chat';
import {
  ProposalCard,
  type Proposal,
  type ProposalStatus,
} from '@/components/chat/ProposalCard';

const STORAGE_KEY = 'fitwell-chat-v1';
const MAX_STORED_MESSAGES = 30;
const MAX_IMAGE_SIDE = 1280;

type StoredState = {
  messages: ReturnType<typeof useChat>['messages'];
  resolved: Record<string, ProposalStatus>;
};

/** Shrinks a photo so it fits the request size limit and uploads fast on mobile. */
async function fileToDataUrl(file: File): Promise<string> {
  const source = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image'));
      el.src = source;
    });
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function ChatView() {
  const t = useT(chat);
  const { messages, sendMessage, setMessages, status, error, clearError } = useChat();
  const [input, setInput] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Record<string, ProposalStatus>>({});
  const [loaded, setLoaded] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const busy = status === 'submitted' || status === 'streaming';

  // Restore the conversation saved on this device.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoredState;
        setMessages(stored.messages ?? []);
        // Reading localStorage is only possible after mount, so state is set from an effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResolved(stored.resolved ?? {});
      }
    } catch {
      // Corrupt or unavailable storage: start empty.
    }
    setLoaded(true);
  }, [setMessages]);

  // Save text and proposals; photos are not stored to keep the storage small.
  useEffect(() => {
    if (!loaded || busy) return;
    try {
      const trimmed = messages.slice(-MAX_STORED_MESSAGES).map((message) => ({
        ...message,
        parts: message.parts.filter((part) => part.type !== 'file'),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages: trimmed, resolved }));
    } catch {
      // Storage full or blocked: the chat still works in memory.
    }
  }, [messages, resolved, loaded, busy]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, status]);

  const pickPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setPhoto(await fileToDataUrl(file));
    } catch {
      setPhoto(null);
    }
  };

  const send = (text: string) => {
    const value = text.trim();
    if ((!value && !photo) || busy) return;
    clearError();
    sendMessage({
      text: value || (photo ? '📷' : ''),
      files: photo ? [{ type: 'file', mediaType: 'image/jpeg', url: photo }] : undefined,
    });
    setInput('');
    setPhoto(null);
  };

  const newChat = () => {
    setMessages([]);
    setResolved({});
    clearError();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const errorText = (() => {
    if (!error) return null;
    if (error.message.includes('not_configured')) return t('errorNotConfigured');
    if (error.message.includes('too_many_requests')) return t('errorTooMany');
    if (error.message.includes('quota_exhausted')) return t('errorQuota');
    return t('errorGeneric');
  })();

  const suggestions = [
    { label: t('suggestMeal'), prompt: t('suggestMealPrompt') },
    { label: t('suggestWorkout'), prompt: t('suggestWorkoutPrompt') },
    { label: t('suggestPlan'), prompt: t('suggestPlanPrompt') },
  ];

  const lookingUp = busy && messages.at(-1)?.parts.some(
    (part) =>
      part.type.startsWith('tool-get_') &&
      'state' in part &&
      part.state !== 'output-available'
  );

  return (
    <div className="pb-44">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
        {messages.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={newChat} disabled={busy}>
            {t('clear')}
          </Button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="space-y-4 pt-6 text-center">
          <div className="text-5xl" aria-hidden="true">
            <span className="animate-lift-twice">🏋️</span>
          </div>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">{t('intro')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => send(item.prompt)}
                className="rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex flex-col gap-2', message.role === 'user' ? 'items-end' : 'items-start')}
          >
            {message.parts.map((part, index) => {
              const key = `${message.id}-${index}`;

              if (part.type === 'text') {
                if (!part.text) return null;
                return (
                  <div
                    key={key}
                    className={cn(
                      'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground border border-border/50'
                    )}
                  >
                    {part.text}
                  </div>
                );
              }

              if (part.type === 'file' && part.mediaType.startsWith('image/')) {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={key}
                    src={part.url}
                    alt=""
                    className="max-h-56 max-w-[70%] rounded-2xl border border-border/50 object-cover"
                  />
                );
              }

              if (
                (part.type === 'tool-propose_meal' || part.type === 'tool-propose_workout') &&
                part.state === 'output-available'
              ) {
                return (
                  <div key={key} className="w-full">
                    <ProposalCard
                      proposal={part.output as Proposal}
                      status={resolved[part.toolCallId]}
                      onResolve={(next) =>
                        setResolved((current) => ({ ...current, [part.toolCallId]: next }))
                      }
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        ))}

        {busy && (
          <p className="text-xs text-muted-foreground">
            {lookingUp ? t('lookingUp') : t('thinking')}
          </p>
        )}
        {errorText && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorText}
          </p>
        )}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="fixed bottom-[68px] left-0 right-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-lg"
      >
        <div className="mx-auto max-w-lg space-y-2 px-4 py-3">
          {photo && (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" className="h-16 w-16 rounded-xl border border-border/50 object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                aria-label={t('removePhoto')}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card text-foreground shadow border border-border/50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickPhoto}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t('attach')}
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('placeholder')}
              disabled={busy}
              className="h-10 min-w-0 flex-1 rounded-full border border-input bg-transparent px-4 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            />
            <Button
              type="submit"
              size="icon"
              aria-label={t('send')}
              disabled={busy || (!input.trim() && !photo)}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
