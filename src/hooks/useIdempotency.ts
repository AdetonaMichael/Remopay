import { useState, useCallback, useRef } from 'react';
import {
  generateIdempotencyKey,
  getStoredIdempotencyKey,
  storeIdempotencyKey,
  clearIdempotencyKey,
  validateIdempotencyKeyFormat,
} from '@/utils/idempotency.utils';

interface IdempotencyState {
  key: string | null;
  isProcessing: boolean;
  error: string | null;
  isRetry: boolean;
}

interface UseIdempotencyOptions {
  operationId: string; // Unique identifier for the operation (e.g., 'transfer-recipient-123')
  onSuccess?: (key: string) => void;
  onError?: (error: string, key: string) => void;
  onRetry?: (key: string) => void;
}

/**
 * Custom hook for managing idempotency keys in payment operations
 * Handles key generation, storage, retrieval, and cleanup
 *
 * @param options - Configuration options for idempotency management
 * @returns Idempotency state and control functions
 *
 * @example
 * const { key, isProcessing, error, getKey, markSuccess, markError, retry } = useIdempotency({
 *   operationId: 'transfer-user-123',
 *   onSuccess: (key) => console.log('Transfer successful with key:', key)
 * });
 *
 * // Use in form submission
 * const handleSubmit = async (formData) => {
 *   const idempotencyKey = getKey();
 *   try {
 *     const response = await apiClient.post('/wallet/transfer', formData, {
 *       headers: { 'Idempotency-Key': idempotencyKey }
 *     });
 *     markSuccess();
 *   } catch (error) {
 *     markError(error.message);
 *   }
 * };
 */
export const useIdempotency = (options: UseIdempotencyOptions) => {
  const { operationId, onSuccess, onError, onRetry } = options;
  const [state, setState] = useState<IdempotencyState>({
    key: null,
    isProcessing: false,
    error: null,
    isRetry: false,
  });
  const isInitialized = useRef(false);

  // Initialize idempotency key on mount
  const initializeKey = useCallback(() => {
    if (isInitialized.current) return;

    // Try to retrieve existing key for retries
    const storedKey = getStoredIdempotencyKey(operationId);

    if (storedKey && validateIdempotencyKeyFormat(storedKey)) {
      console.log('[useIdempotency] Retrieved existing key for retry:', operationId);
      setState((prev) => ({
        ...prev,
        key: storedKey,
        isRetry: true,
      }));
    } else {
      // Generate new key
      const newKey = generateIdempotencyKey();
      storeIdempotencyKey(newKey, operationId);
      console.log('[useIdempotency] Generated new key for operation:', operationId);
      setState((prev) => ({
        ...prev,
        key: newKey,
        isRetry: false,
      }));
    }

    isInitialized.current = true;
  }, [operationId]);

  // Get current idempotency key
  const getKey = useCallback((): string => {
    if (!state.key) {
      initializeKey();
    }
    return state.key || generateIdempotencyKey();
  }, [state.key, initializeKey]);

  // Mark operation as processing
  const markProcessing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isProcessing: true,
      error: null,
    }));
    console.log('[useIdempotency] Marked as processing:', operationId);
  }, [operationId]);

  // Mark operation as successful
  const markSuccess = useCallback(() => {
    console.log('[useIdempotency] Operation successful:', operationId);
    setState((prev) => ({
      ...prev,
      isProcessing: false,
      error: null,
    }));

    // Clear key after success (5-minute grace period for retries)
    setTimeout(() => {
      clearIdempotencyKey(operationId);
      console.log('[useIdempotency] Cleared idempotency key after success:', operationId);
    }, 5 * 60 * 1000);

    if (onSuccess) {
      onSuccess(state.key!);
    }
  }, [state.key, operationId, onSuccess]);

  // Mark operation as failed
  const markError = useCallback(
    (errorMessage: string) => {
      console.error('[useIdempotency] Operation failed:', operationId, errorMessage);
      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));

      if (onError) {
        onError(errorMessage, state.key!);
      }
    },
    [state.key, operationId, onError]
  );

  // Retry operation with same key
  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    console.log('[useIdempotency] Retrying operation:', operationId);
    markProcessing();

    try {
      const result = await retryFn();
      markSuccess();
      if (onRetry) {
        onRetry(state.key!);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      markError(errorMessage);
      throw error;
    }
  }, [operationId, markProcessing, markSuccess, markError, state.key, onRetry]);

  // Reset idempotency state (generates new key)
  const reset = useCallback(() => {
    console.log('[useIdempotency] Resetting idempotency for new operation:', operationId);
    clearIdempotencyKey(operationId);
    const newKey = generateIdempotencyKey();
    storeIdempotencyKey(newKey, operationId);
    setState({
      key: newKey,
      isProcessing: false,
      error: null,
      isRetry: false,
    });
    isInitialized.current = false;
  }, [operationId]);

  // Clear key immediately (for special cases)
  const clear = useCallback(() => {
    console.log('[useIdempotency] Clearing idempotency key:', operationId);
    clearIdempotencyKey(operationId);
    setState((prev) => ({
      ...prev,
      key: null,
    }));
  }, [operationId]);

  return {
    // State
    key: state.key,
    isProcessing: state.isProcessing,
    error: state.error,
    isRetry: state.isRetry,

    // Methods
    getKey,
    initializeKey,
    markProcessing,
    markSuccess,
    markError,
    retry,
    reset,
    clear,
  };
};

export type UseIdempotencyReturn = ReturnType<typeof useIdempotency>;
