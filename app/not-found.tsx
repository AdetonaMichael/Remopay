'use client';

import Link from 'next/link';
import { AlertCircle, Home, RotateCw } from 'lucide-react';
import { ErrorPageProvider } from '@/contexts/ErrorPageContext';

function NotFoundContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl opacity-50 animate-pulse" />
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white mb-2">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-slate-100">
            Page Not Found
          </h2>
          
          <p className="text-slate-300 text-base leading-relaxed">
            The page you're looking for doesn't exist or may have been moved to a different location.
          </p>

          {/* Status Indicator */}
          <div className="mt-6 p-4 bg-slate-700/50 border border-slate-600 rounded-lg backdrop-blur">
            <p className="text-sm font-medium text-slate-300">
              This resource could not be found
            </p>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm font-semibold text-blue-300 mb-3">Here are some helpful links:</p>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Go back to the home page</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Check the URL for typos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Contact support for help</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            <RotateCw className="h-5 w-5" />
            Go Back
          </button>
        </div>

        {/* Support Link */}
        <p className="text-center text-xs text-slate-400 mt-8">
          Need help?{' '}
          <a 
            href="mailto:support@remopay.com" 
            className="text-red-400 font-semibold hover:text-red-300 transition-colors"
          >
            Contact Support
          </a>
        </p>
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
