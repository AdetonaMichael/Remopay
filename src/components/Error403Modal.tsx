'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

/**
 * Error403Modal Component
 * 
 * Displays a modal when user receives 403 Forbidden error.
 * Shows user-friendly message and options to go back or return home.
 */
export function Error403Modal() {
  const router = useRouter();
  const [error, setError] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Check for 403 error in sessionStorage
    const checkFor403Error = () => {
      try {
        const errorData = sessionStorage.getItem('error_403');
        if (errorData) {
          const parsedError = JSON.parse(errorData);
          setError(parsedError);
          setIsOpen(true);
          // Clear the error after showing it once
          sessionStorage.removeItem('error_403');
        }
      } catch (err) {
        console.error('[Error403Modal] Failed to parse error:', err);
      }
    };

    // Check immediately and set up interval to check for new errors
    checkFor403Error();
    const interval = setInterval(checkFor403Error, 500);

    return () => clearInterval(interval);
  }, [isClient]);

  if (!isClient || !isOpen || !error) {
    return null;
  }

  const handleGoBack = () => {
    setIsOpen(false);
    router.back();
  };

  const handleGoHome = () => {
    setIsOpen(false);
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
        </div>

        {/* Message */}
        <p className="mb-6 text-sm text-gray-600">
          You do not have permission to access this resource.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleGoBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
