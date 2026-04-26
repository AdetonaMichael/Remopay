'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, X } from 'lucide-react';
import { Button } from './Button';
import Image from 'next/image';

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
    } catch (err) {
      setError('Invalid PIN. Please try again.');
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
              <Image src="/icon.png" alt="AFRIDataNG Logo" width={32} height={32}/>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-base mb-10">{description}</p>

        {/* PIN Input Fields */}
        <div className="flex gap-4 mb-10 justify-center">
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
              className={`w-20 h-20 text-center text-4xl font-bold rounded-2xl border-2 transition-all duration-200 ${
                digit
                  ? 'border-[#a9b7ff] bg-gradient-to-br from-[#f7f8ff] to-[#e8ecff] text-[#2d3748] shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              } focus:outline-none focus:border-[#6b7bd6] focus:ring-2 focus:ring-[#a9b7ff]/30 focus:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-8">
            <p className="text-red-700 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={handleVerify}
            disabled={!pinComplete || isLoading}
            className={!pinComplete || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isLoading ? 'Verifying...' : 'Confirm'}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center">
          Your PIN is required for security
        </p>
      </div>
    </div>
  );
};
