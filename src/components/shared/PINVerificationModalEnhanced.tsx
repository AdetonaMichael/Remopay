'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface PINVerificationModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
  isLocked?: boolean;
  remainingSeconds?: number;
  failedAttempts?: number;
  maxAttempts?: number;
}

export const PINVerificationModalEnhanced: React.FC<PINVerificationModalEnhancedProps> = ({
  isOpen,
  onClose,
  onVerify,
  isLoading = false,
  title = 'Verify PIN',
  description = 'Enter your 4-digit PIN to confirm this transaction',
  isLocked = false,
  remainingSeconds = 0,
  failedAttempts = 0,
  maxAttempts = 3,
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lockdownCountdown, setLockdownCountdown] = useState(remainingSeconds);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || !isOpen) return;

    const timer = setInterval(() => {
      setLockdownCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, isOpen]);

  useEffect(() => {
    if (isOpen && !isLocked) {
      setPin(['', '', '', '']);
      setError('');
      setSuccess(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen, isLocked]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullPin = pin.join('');

    if (fullPin.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }

    try {
      await onVerify(fullPin);
      setSuccess(true);
      setTimeout(() => {
        setPin(['', '', '', '']);
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err?.message || 'Invalid PIN';
      
      if (errorMsg.includes('INVALID_PIN')) {
        const remaining = Math.max(0, maxAttempts - (failedAttempts + 1));
        if (remaining > 0) {
          setError(`Invalid PIN. ${remaining} attempts remaining`);
        } else {
          setError('PIN locked for 30 minutes due to multiple failed attempts');
        }
      } else if (errorMsg === 'PIN_LOCKED') {
        setError('PIN is locked. Try again later.');
      } else {
        setError(errorMsg);
      }

      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLocked) {
      handleVerify();
    }
  };

  const pinComplete = pin.every((digit) => digit !== '');
  const remainingAttempts = maxAttempts - failedAttempts;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full mb-3 ${
            success ? 'bg-[#f0fdf4]' : 'bg-[#f7f8ff]'
          }`}>
            {success ? (
              <CheckCircle2 className="text-[#16a34a]" size={24} />
            ) : (
              <Lock className={`${isLocked ? 'text-[#dc2626]' : 'text-[#4a5ff7]'}`} size={24} />
            )}
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">{title}</h2>
          <p className="mt-2 text-sm text-[#6b7280]">{description}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-[12px] border border-[#86efac] bg-[#f0fdf4] p-4">
            <CheckCircle2 className="text-[#16a34a]" size={20} />
            <p className="text-sm font-medium text-[#16a34a]">PIN verified successfully!</p>
          </div>
        )}

        {/* Locked State */}
        {isLocked && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-3 rounded-[12px] border border-[#fca5a5] bg-[#fef2f2] p-4">
              <AlertCircle className="text-[#dc2626] flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-[#dc2626]">PIN Locked</p>
                <p className="text-xs text-[#991b1b] mt-1">
                  Too many failed attempts. Please try again later.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 w-full justify-center rounded-[12px] bg-[#f0f3ff] p-4">
              <Clock className="text-[#4a5ff7]" size={20} />
              <div className="text-center">
                <p className="text-sm text-[#6b7280]">Try again in</p>
                <p className="text-2xl font-bold text-[#4a5ff7] font-mono">
                  {formatTime(lockdownCountdown)}
                </p>
              </div>
            </div>

            <Button
              fullWidth
              variant="secondary"
              onClick={onClose}
              className="rounded-[12px]"
            >
              Close
            </Button>
          </div>
        )}

        {/* PIN Input (only when not locked) */}
        {!isLocked && !success && (
          <>
            <div className="mb-8">
              <label className="block text-sm font-semibold text-[#111827] mb-4">
                Enter 4-Digit PIN
              </label>

              {/* PIN Input Fields */}
              <div className="flex gap-3 justify-center mb-4">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="password"
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onKeyPress={handleKeyPress}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={isLoading}
                    className={`h-16 w-16 rounded-[12px] border-2 text-center text-2xl font-bold transition-all ${
                      error
                        ? 'border-[#fca5a5] bg-[#fef2f2]'
                        : 'border-[#e5e7eb] focus:border-[#4a5ff7] focus:outline-none'
                    } disabled:bg-[#f3f4f6]`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-[12px] border border-[#fca5a5] bg-[#fef2f2] p-3 mb-4">
                  <AlertCircle className="text-[#dc2626]" size={18} />
                  <p className="text-sm text-[#dc2626]">{error}</p>
                </div>
              )}

              {/* Attempt Counter */}
              {failedAttempts > 0 && !error && (
                <div className="text-center">
                  <p className="text-xs text-[#6b7280]">
                    Attempts remaining: <span className="font-semibold">{remainingAttempts}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={onClose}
                disabled={isLoading}
                className="rounded-[12px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                fullWidth
                onClick={handleVerify}
                disabled={!pinComplete || isLoading}
                isLoading={isLoading}
                className="rounded-[12px]"
              >
                Verify
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
