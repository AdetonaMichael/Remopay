'use client';

import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorState({ message, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-gray-900">Something went wrong</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">{message}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d71927] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#b81420]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
