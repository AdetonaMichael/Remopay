'use client';

import { useCallback, useState } from 'react';
import { useUIStore } from '@/store/ui.store';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = (options?: UseApiOptions) => {
  const { setIsLoading, addToast } = useUIStore();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(
    async <T,>(apiCall: Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall;
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        options?.onError?.(err);
        addToast({ type: 'error', message: errorMessage });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, addToast, options]
  );

  return { execute, error, data, setError };
};
