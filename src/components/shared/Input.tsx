'use client';

import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-600">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}

          <input
            className={clsx(
              'w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400 text-base',
              'focus:outline-none focus:ring-2 focus:ring-[#a9b7ff] focus:border-transparent',
              'disabled:bg-gray-100 disabled:cursor-not-allowed transition-all',
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
              icon && 'pl-12',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
