'use client';

import { useState, useCallback } from 'react';
import { usePin } from './usePin';
import { useAlert } from './useAlert';
import { useAuth } from './useAuth';

interface PINVerificationOptions {
  onSuccess: () => Promise<void> | void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  requirePINSetup?: boolean;
}

interface PINVerificationState {
  showModal: boolean;
  isVerifying: boolean;
  error: string | null;
  isPinLocked: boolean;
  lockoutCountdown: number | null;
}

/**
 * Hook for managing PIN verification in transaction flows
 * 
 * Usage:
 * ```typescript
 * const { openPINVerification, isPINVerified, ...state } = usePINVerification();
 * 
 * const handleWithdrawal = async () => {
 *   await openPINVerification({
 *     onSuccess: async () => {
 *       await performWithdrawal();
 *     },
 *     onError: (err) => console.error('Failed:', err),
 *   });
 * };
 * 
 * return (
 *   <>
 *     <Button onClick={handleWithdrawal}>Withdraw</Button>
 *     {state.modal}
 *   </>
 * );
 * ```
 */
export function usePINVerification() {
  const { user } = useAuth();
  const { verifyPin, isPinLocked, lockoutCountdown } = usePin();
  const { error: showError } = useAlert();

  const [state, setState] = useState<PINVerificationState>({
    showModal: false,
    isVerifying: false,
    error: null,
    isPinLocked: false,
    lockoutCountdown: null,
  });

  const [options, setOptions] = useState<PINVerificationOptions | null>(null);

  /**
   * Check if user has PIN set and show setup modal if not
   */
  const checkPINSetup = useCallback((): boolean => {
    if (!user?.transaction_pin) {
      showError('Transaction PIN is required. Please set one up in Settings > Transaction PIN');
      // You can optionally redirect to PIN settings here
      // router.push('/dashboard/settings/pin');
      return false;
    }
    return true;
  }, [user?.transaction_pin, showError]);

  /**
   * Open PIN verification modal
   */
  const openPINVerification = useCallback(
    async (opts: PINVerificationOptions) => {
      // Check if PIN is set
      if (opts.requirePINSetup !== false && !checkPINSetup()) {
        opts.onError?.(new Error('PIN_NOT_SET'));
        return;
      }

      // Check if PIN is locked
      if (isPinLocked || (user?.pin_locked_until && new Date(user.pin_locked_until) > new Date())) {
        const lockedUntil = user?.pin_locked_until
          ? new Date(user.pin_locked_until).getTime()
          : Date.now();
        const now = new Date().getTime();
        const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);

        setState({
          showModal: false,
          isVerifying: false,
          error: `Your PIN is locked. Try again in ${Math.ceil(remainingSeconds / 60)} minutes.`,
          isPinLocked: true,
          lockoutCountdown: remainingSeconds > 0 ? remainingSeconds : null,
        });
        opts.onError?.(new Error('PIN_LOCKED'));
        return;
      }

      // Store options and open modal
      setOptions(opts);
      setState({
        showModal: true,
        isVerifying: false,
        error: null,
        isPinLocked: false,
        lockoutCountdown: null,
      });
    },
    [user?.pin_locked_until, isPinLocked, checkPINSetup]
  );

  /**
   * Handle PIN verification
   */
  const handlePINVerify = useCallback(
    async (pin: string) => {
      setState((prev) => ({ ...prev, isVerifying: true }));
      try {
        await verifyPin(pin);
        
        // Call the success callback
        if (options?.onSuccess) {
          await options.onSuccess();
        }
        
        // Close modal on success
        setState({
          showModal: false,
          isVerifying: false,
          error: null,
          isPinLocked: false,
          lockoutCountdown: null,
        });
      } catch (error: any) {
        // Handle different error scenarios
        if (error.code === 'PIN_LOCKED' || error.message === 'PIN_LOCKED') {
          const remainingSeconds = error.data?.remaining_seconds || 1800;
          setState({
            showModal: true,
            isVerifying: false,
            error: `Your PIN is locked. Try again in ${Math.ceil(remainingSeconds / 60)} minutes.`,
            isPinLocked: true,
            lockoutCountdown: remainingSeconds,
          });
        } else if (error.code === 'INVALID_PIN') {
          const remaining = error.data?.remaining_attempts;
          let message = 'Invalid PIN.';
          if (remaining === 0) {
            message = 'Too many failed attempts. Your PIN is now locked for 30 minutes.';
            setState({
              showModal: true,
              isVerifying: false,
              error: message,
              isPinLocked: true,
              lockoutCountdown: 1800,
            });
          } else if (remaining === 1) {
            message = `Invalid PIN. 1 attempt remaining.`;
            setState({
              showModal: true,
              isVerifying: false,
              error: message,
              isPinLocked: false,
              lockoutCountdown: null,
            });
          } else {
            message = `Invalid PIN. ${remaining} attempts remaining.`;
            setState({
              showModal: true,
              isVerifying: false,
              error: message,
              isPinLocked: false,
              lockoutCountdown: null,
            });
          }
        } else {
          setState({
            showModal: true,
            isVerifying: false,
            error: error.message || 'PIN verification failed. Please try again.',
            isPinLocked: false,
            lockoutCountdown: null,
          });
        }
        options?.onError?.(error);
      } finally {
        setState((prev) => ({ ...prev, isVerifying: false }));
      }
    },
    [verifyPin, options]
  );

  /**
   * Close modal and cancel transaction
   */
  const closePINVerification = useCallback(() => {
    setState({
      showModal: false,
      isVerifying: false,
      error: null,
      isPinLocked: false,
      lockoutCountdown: null,
    });
    options?.onCancel?.();
  }, [options]);

  return {
    ...state,
    openPINVerification,
    closePINVerification,
    handlePINVerify,
    hasPIN: !!user?.transaction_pin,
  };
}
