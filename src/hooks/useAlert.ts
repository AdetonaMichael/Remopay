'use client';

import { useCallback } from 'react';
import { useUIStore } from '@/store/ui.store';

export const useAlert = () => {
  const { addToast } = useUIStore();

  const success = useCallback(
    (message: string) => {
      addToast({ type: 'success', message });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string) => {
      addToast({ type: 'error', message });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string) => {
      addToast({ type: 'warning', message });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string) => {
      addToast({ type: 'info', message });
    },
    [addToast]
  );

  return { success, error, warning, info };
};
