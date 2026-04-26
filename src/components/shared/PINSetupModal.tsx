'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

interface PINSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isLoading?: boolean;
  mode?: 'setup' | 'update'; // setup for first-time, update for changing existing PIN
  onSubmit: (data: { currentPin?: string; newPin: string; newPinConfirmation: string; password: string }) => Promise<void>;
}

export function PINSetupModal({
  isOpen,
  onClose,
  onSuccess,
  isLoading = false,
  mode = 'setup',
  onSubmit,
}: PINSetupModalProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === 'update' && !currentPin) {
      newErrors.currentPin = 'Current PIN is required';
    }
    if (currentPin && currentPin.length !== 4) {
      newErrors.currentPin = 'PIN must be 4 digits';
    }

    if (!newPin) {
      newErrors.newPin = 'New PIN is required';
    } else if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      newErrors.newPin = 'PIN must be exactly 4 digits';
    }

    if (!confirmPin) {
      newErrors.confirmPin = 'Confirmation is required';
    } else if (confirmPin !== newPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    if (!password) {
      newErrors.password = 'Password is required for security';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        currentPin: mode === 'update' ? currentPin : undefined,
        newPin,
        newPinConfirmation: confirmPin,
        password,
      });

      setSuccessMessage(mode === 'setup' ? 'PIN created successfully!' : 'PIN updated successfully!');
      
      // Reset form after successful submission
      setTimeout(() => {
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setPassword('');
        setErrors({});
        setSuccessMessage('');
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('[PINSetupModal] Error:', error);
      
      const errorMessage = error?.message || 'Failed to set PIN';
      
      if (errorMessage.includes('password')) {
        setErrors({ password: 'Invalid password' });
      } else if (errorMessage.includes('current')) {
        setErrors({ currentPin: 'Invalid current PIN' });
      } else {
        setErrors({ submit: errorMessage });
      }
    }
  };

  const handleClose = () => {
    if (!isLoading && !successMessage) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setPassword('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'setup' ? 'Set Transaction PIN' : 'Update PIN'}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f8ff] mb-3">
            <Lock className="text-[#4a5ff7]" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">
            {mode === 'setup' ? 'Set Transaction PIN' : 'Update PIN'}
          </h2>
          <p className="mt-2 text-sm text-[#6b7280]">
            {mode === 'setup'
              ? 'Create a secure 4-digit PIN for your transactions'
              : 'Update your transaction PIN'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-[12px] border border-[#86efac] bg-[#f0fdf4] p-4">
            <CheckCircle2 className="text-[#16a34a]" size={20} />
            <p className="text-sm font-medium text-[#16a34a]">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 flex items-center gap-3 rounded-[12px] border border-[#fca5a5] bg-[#fef2f2] p-4">
            <AlertCircle className="text-[#dc2626]" size={20} />
            <p className="text-sm font-medium text-[#dc2626]">{errors.submit}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current PIN (only for update mode) */}
          {mode === 'update' && (
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">
                Current PIN
              </label>
              <div className="relative">
                <input
                  type={showCurrentPin ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => {
                    setCurrentPin(e.target.value.slice(0, 4));
                    setErrors((prev) => ({ ...prev, currentPin: '' }));
                  }}
                  placeholder="0000"
                  maxLength={4}
                  inputMode="numeric"
                  disabled={isLoading || !!successMessage}
                  className={`w-full rounded-[12px] border-2 bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] transition-all ${
                    errors.currentPin
                      ? 'border-[#fca5a5] bg-[#fef2f2]'
                      : 'border-[#e5e7eb] focus:border-[#4a5ff7] focus:outline-none'
                  } disabled:bg-[#f3f4f6]`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
                >
                  {showCurrentPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.currentPin && (
                <p className="mt-1 text-xs text-[#dc2626]">{errors.currentPin}</p>
              )}
            </div>
          )}

          {/* New PIN */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              New PIN
            </label>
            <div className="relative">
              <input
                type={showNewPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value.slice(0, 4));
                  setErrors((prev) => ({ ...prev, newPin: '' }));
                }}
                placeholder="0000"
                maxLength={4}
                inputMode="numeric"
                disabled={isLoading || !!successMessage}
                className={`w-full rounded-[12px] border-2 bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] transition-all ${
                  errors.newPin
                    ? 'border-[#fca5a5] bg-[#fef2f2]'
                    : 'border-[#e5e7eb] focus:border-[#4a5ff7] focus:outline-none'
                } disabled:bg-[#f3f4f6]`}
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
              >
                {showNewPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPin && (
              <p className="mt-1 text-xs text-[#dc2626]">{errors.newPin}</p>
            )}
          </div>

          {/* Confirm PIN */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              Confirm PIN
            </label>
            <div className="relative">
              <input
                type={showConfirmPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.slice(0, 4));
                  setErrors((prev) => ({ ...prev, confirmPin: '' }));
                }}
                placeholder="0000"
                maxLength={4}
                inputMode="numeric"
                disabled={isLoading || !!successMessage}
                className={`w-full rounded-[12px] border-2 bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] transition-all ${
                  errors.confirmPin
                    ? 'border-[#fca5a5] bg-[#fef2f2]'
                    : 'border-[#e5e7eb] focus:border-[#4a5ff7] focus:outline-none'
                } disabled:bg-[#f3f4f6]`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
              >
                {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPin && (
              <p className="mt-1 text-xs text-[#dc2626]">{errors.confirmPin}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">
              Account Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: '' }));
                }}
                placeholder="Enter your password"
                disabled={isLoading || !!successMessage}
                className={`w-full rounded-[12px] border-2 bg-white px-4 py-3 text-base transition-all ${
                  errors.password
                    ? 'border-[#fca5a5] bg-[#fef2f2]'
                    : 'border-[#e5e7eb] focus:border-[#4a5ff7] focus:outline-none'
                } disabled:bg-[#f3f4f6]`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-[#dc2626]">{errors.password}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleClose}
              disabled={isLoading || !!successMessage}
              className="rounded-[12px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || !!successMessage}
              className="rounded-[12px]"
            >
              {mode === 'setup' ? 'Create PIN' : 'Update PIN'}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 rounded-[12px] bg-[#f0f3ff] p-4">
          <p className="text-xs text-[#6b7280]">
            💡 Your PIN is required for all transactions. Keep it secure and never share it with anyone.
          </p>
        </div>
      </div>
    </Modal>
  );
}
