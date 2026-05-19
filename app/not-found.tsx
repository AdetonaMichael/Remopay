'use client';

import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';
import { ErrorPageProvider } from '@/contexts/ErrorPageContext';

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Page Not Found</h2>
        <p className="text-gray-600 text-sm mb-8">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-left text-xs text-blue-800">
            <p className="font-semibold mb-1">Debug Info:</p>
            <p className="font-mono break-all">This page was not found in the application.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-3">Quick Links:</p>
          <div className="space-y-2">
            <Link href="/dashboard" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
              Dashboard
            </Link>
            <Link href="/support" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
              Support
            </Link>
            <Link href="/faq" className="block text-sm text-blue-600 hover:text-blue-700 font-medium">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <ErrorPageProvider isErrorPage={true}>
      <NotFoundContent />
    </ErrorPageProvider>
  );
}
