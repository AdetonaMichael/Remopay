'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Button } from './Button';

interface PINVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export const PINVerificationModal: React.FC<PINVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  isLoading = false,
  title = 'Verify Transaction',
  description = 'Enter your 4-digit PIN to confirm and complete this transaction',
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      // Focus first input when modal opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only keep last character
    setPin(newPin);
    setError('');

    // Auto-focus next input
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
      // Modal will be closed by parent on success
    } catch (err: any) {
      // Handle specific PIN error codes
      if (err.code === 'INVALID_PIN') {
        const remaining = err.data?.remaining_attempts;
        if (remaining !== undefined && remaining !== null) {
          if (remaining === 0) {
            setError('Your PIN is now locked for 30 minutes due to too many failed attempts.');
          } else if (remaining === 1) {
            setError(`Invalid PIN. 1 attempt remaining - your PIN will be locked after this.`);
          } else {
            setError(`Invalid PIN. ${remaining} attempts remaining.`);
          }
        } else {
          setError('Invalid PIN. Please try again.');
        }
      } else if (err.code === 'PIN_LOCKED') {
        const mins = Math.ceil((err.data?.remaining_seconds || 1800) / 60);
        setError(`Your PIN is locked. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`);
      } else if (err.code === 'PIN_NOT_SET') {
        setError('PIN not set. Please configure your PIN in settings.');
      } else {
        setError(err.message || 'Invalid PIN. Please try again.');
      }
      
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (!isOpen) return null;

  const pinComplete = pin.every((digit) => digit !== '');

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8">
      

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-3">{title}</h2>

        {/* Description */}
        <p className="text-gray-600 text-center text-sm mb-8">{description}</p>

        {/* PIN Input Fields */}
        <div className="flex gap-3 mb-8 justify-center">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handlePinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className={`w-16 h-16 text-center text-3xl font-bold rounded-xl border-2 transition-all duration-200 ${
                digit
                  ? 'border-[#d71927] bg-red-50 text-gray-900 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } focus:outline-none focus:border-[#d71927] focus:ring-2 focus:ring-red-200 focus:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
            <p className="text-red-700 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-5">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl h-12 font-semibold"
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleVerify}
            disabled={!pinComplete || isLoading}
            className={`rounded-xl text-white h-12 font-semibold bg-[#d71927] hover:bg-[#b81420] ${!pinComplete || isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Verifying...' : 'Confirm'}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center">
          Secured transaction • Your PIN is never stored or shared
        </p>
      </div>
    </div>
  );
};
