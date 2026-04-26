'use client';

import React, { ReactNode } from 'react';
import { trackError, getAllErrorLogs, getCriticalErrors, exportErrorLogs } from '@/utils/error-tracking.utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary Component
 * Catches runtime errors in child components and prevents white screen
 * Logs errors for debugging
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Error stack:', error?.stack);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
    
    // Track error with comprehensive tracking system
    trackError({
      type: 'render_error',
      severity: 'critical',
      location: 'ErrorBoundary - React Render Error',
      errorMessage: error?.message || 'Unknown React error',
      stack: error?.stack,
      context: {
        componentStack: errorInfo?.componentStack,
        errorInfo,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 text-sm mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            {/* Error Details */}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-left text-xs text-red-800 overflow-auto max-h-48">
              <p className="font-mono font-bold mb-2">🔴 Error Details:</p>
              <p className="break-words font-semibold text-red-900">{this.state.error?.message || 'Unknown error'}</p>
              {this.state.error?.stack && (
                <div className="mt-3 p-2 bg-red-100 rounded text-xs font-mono whitespace-pre-wrap break-words">
                  {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                </div>
              )}
            </div>

            {/* All Tracked Errors */}
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-left text-xs">
              <p className="font-mono font-bold mb-2 text-orange-900">🟠 Error History ({getAllErrorLogs().length} total):</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {getCriticalErrors().slice(-5).map((log) => (
                  <div key={log.id} className="p-2 bg-white rounded border border-orange-100 text-xs">
                    <div className="font-semibold text-orange-900">{log.location}</div>
                    <div className="text-orange-700 break-words">{log.errorMessage}</div>
                    {log.errorCode && <div className="text-xs text-gray-600">Code: {log.errorCode}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={() => {
                const data = exportErrorLogs();
                try {
                  navigator.clipboard.writeText(data);
                  alert('Error logs copied to clipboard! Share with support.');
                } catch (e) {
                  console.log('Exported logs:', data);
                  alert('Export completed. Check console logs.');
                }
              }}
              className="w-full mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors text-xs"
            >
              📋 Copy Error Logs
            </button>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
