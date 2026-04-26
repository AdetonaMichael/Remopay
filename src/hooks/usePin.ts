'use client';

import { useState, useCallback } from 'react';
import { useAlert } from './useAlert';
import { pinService } from '@/services/pin.service';

interface PINStatus {
  has_pin: boolean;
  is_locked: boolean;
  failed_attempts: number;
  remaining_seconds?: number;
}

export function usePin() {
  const { success, error: alertError } = useAlert();
  const [pinStatus, setPinStatus] = useState<PINStatus | null>(null);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);

  // Set PIN (both create and update)
  const setPin = useCallback(
    async (
      newPin: string,
      newPinConfirmation: string,
      password: string,
      currentPin?: string
    ) => {
      setIsSettingPin(true);
      try {
        const response = await pinService.setPin(
          newPin,
          newPinConfirmation,
          password,
          currentPin
        );

        if (response?.success) {
          success('PIN set successfully!');
          // Update local PIN status
          setPinStatus((prev) => ({
            ...prev,
            has_pin: true,
          } as PINStatus));
          return response;
        } else {
          const errorMsg = response?.message || 'Failed to set PIN';
          alertError(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to set PIN';
        alertError(errorMsg);
        throw err;
      } finally {
        setIsSettingPin(false);
      }
    },
    [success, alertError]
  );

  // Verify PIN
  const verifyPin = useCallback(async (pin: string) => {
    setIsVerifyingPin(true);
    try {
      const response = await pinService.verifyPin(pin);

      // Handle lockout
      if (response?.code === 'PIN_LOCKED') {
        const remainingSeconds = response?.remaining_seconds || 1800;
        setLockoutCountdown(remainingSeconds);
        alertError(
          `PIN locked. Try again in ${Math.ceil(remainingSeconds / 60)} minutes`
        );
        throw new Error('PIN_LOCKED');
      }

      // Handle PIN not set
      if (response?.code === 'PIN_NOT_SET') {
        alertError('You must set a PIN first');
        throw new Error('PIN_NOT_SET');
      }

      // Handle invalid PIN
      if (response?.code === 'INVALID_PIN') {
        const failedAttempts = response?.data?.failed_attempts || 0;
        const remainingAttempts = 3 - failedAttempts;
        
        if (remainingAttempts > 0) {
          alertError(`Invalid PIN. ${remainingAttempts} attempts remaining`);
        } else {
          alertError('Too many failed attempts. PIN locked for 30 minutes.');
          setLockoutCountdown(1800);
        }
        throw new Error(`INVALID_PIN:${remainingAttempts}`);
      }

      if (response?.success && response?.data?.verified) {
        return response;
      } else {
        alertError(response?.message || 'PIN verification failed');
        throw new Error(response?.message || 'PIN verification failed');
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsVerifyingPin(false);
    }
  }, [alertError]);

  // Check if PIN is set (can be called on page load or after login)
  const checkPinStatus = useCallback((status: PINStatus) => {
    setPinStatus(status);
    
    if (status?.is_locked) {
      setLockoutCountdown(status?.remaining_seconds || 1800);
    }
  }, []);

  return {
    pinStatus,
    isSettingPin,
    isVerifyingPin,
    lockoutCountdown,
    setPin,
    verifyPin,
    checkPinStatus,
    hasPinSet: pinStatus?.has_pin ?? false,
    isPinLocked: pinStatus?.is_locked ?? false,
  };
}
