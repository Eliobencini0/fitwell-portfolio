'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UndoState<T> {
  data: T;
  action: () => Promise<void>;
  timestamp: number;
}

export function useUndo<T>(undoDuration = 5000) {
  const [undoState, setUndoState] = useState<UndoState<T> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef<string | number | null>(null);

  const executeWithUndo = useCallback(
    async (data: T, action: () => Promise<void>, undoAction: () => Promise<void>, message: string) => {
      // Clear existing timeout and toast
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      // Show undo toast
      const toastId = toast.success(message, {
        duration: undoDuration,
        action: {
          label: 'Annulla',
          onClick: async () => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            await undoAction();
            setUndoState(null);
            toast.success('Azione annullata');
          },
        },
      });

      toastIdRef.current = toastId;

      // Set undo state
      setUndoState({
        data,
        action: undoAction,
        timestamp: Date.now(),
      });

      // Execute action after timeout
      timeoutRef.current = setTimeout(() => {
        setUndoState(null);
        toastIdRef.current = null;
      }, undoDuration);

      // Execute the action immediately
      await action();
    },
    [undoDuration]
  );

  return { executeWithUndo, undoState };
}
