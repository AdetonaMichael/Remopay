'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface PINInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  error?: boolean;
  showValue?: boolean; // If true, show actual numbers; if false, show dots
}

/**
 * Reusable PIN Input Component
 * 
 * Features:
 * - Accepts only numeric input (0-9)
 * - Maximum 4 digits
 * - Displays masked characters (dots) by default
 * - Can optionally show actual numbers
 * - Prevents copy/paste of PIN
 * - Clears on paste attempt
 * - Mobile-friendly numeric keyboard
 * - No autofill
 */
export const PINInput = forwardRef<HTMLInputElement, PINInputProps>(
  (
    {
      value,
      onChange,
      placeholder = '••••',
      disabled = false,
      autoFocus = false,
      onKeyDown,
      className,
      error = false,
      showValue = false,
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Only allow digits
      inputValue = inputValue.replace(/\D/g, '');

      // Limit to 4 digits
      inputValue = inputValue.slice(0, 4);

      onChange(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent common shortcuts that might expose the PIN
      if (
        e.ctrlKey || 
        e.metaKey || 
        e.key === 'c' || 
        e.key === 'C' || 
        e.key === 'x' || 
        e.key === 'X' || 
        e.key === 'v' || 
        e.key === 'V'
      ) {
        e.preventDefault();
        return;
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      // Silently ignore paste attempts
    };

    const handleCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      // Silently ignore copy attempts
    };

    const displayValue = showValue ? value : '•'.repeat(value.length);

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="\d{0,4}"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCopy={handleCopy}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        maxLength={4}
        className={clsx(
          'w-full px-4 py-3 text-center text-2xl font-mono tracking-widest',
          'border-2 rounded-lg transition-colors',
          'dark:bg-gray-800 dark:text-white dark:border-gray-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
          className
        )}
        aria-label="Transaction PIN"
        role="spinbutton"
        aria-valuemin={0}
        aria-valuemax={9999}
        aria-valuenow={parseInt(value) || 0}
      />
    );
  }
);

PINInput.displayName = 'PINInput';
