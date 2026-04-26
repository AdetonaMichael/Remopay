'use client';

import { useState, useEffect } from 'react';
import { getDebugLogs, clearDebugLogs, printDebugLogs, exportDebugLogs } from '@/utils/debug.utils';
import { getAllErrorLogs, getCriticalErrors, clearErrorLogs, exportErrorLogs } from '@/utils/error-tracking.utils';
import { useAuthStore } from '@/store/auth.store';

/**
 * Debug Panel Component
 * Shows app state, logs, and debug information
 * Only shows in development mode
 */
export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const refreshLogs = () => {
      setLogs(getDebugLogs());
      setErrorLogs(getAllErrorLogs());
    };

    refreshLogs();
    const interval = setInterval(refreshLogs, 1000);
    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-mono"
        title="Open debug panel"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-96 bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-96 font-mono text-xs">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
        <span className="font-bold">Debug Panel</span>
        <button
          onClick={() => setIsOpen(false)}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          ✕
        </button>
      </div>

      {/* State */}
      <div className="px-4 py-3 border-t border-gray-700">
        <div className="font-bold text-blue-400 mb-2">Auth State</div>
        <div className="space-y-1 text-gray-300">
          <div>isAuthenticated: {isAuthenticated ? '✓' : '✗'}</div>
          <div>user: {user ? user.first_name : 'null'}</div>
          <div>token: {localStorage.getItem('token') ? '✓' : '✗'}</div>
        </div>
      </div>

      {/* Logs */}
      <div className="px-4 py-3 border-t border-gray-700 flex-1 overflow-y-auto">
        {errorLogs.length > 0 && (
          <>
            <div className="font-bold text-red-400 mb-2">Errors ({errorLogs.length})</div>
            <div className="space-y-2 text-gray-400 mb-4 pb-4 border-b border-gray-700">
              {errorLogs.map((error, idx) => (
                <div key={idx} className="text-xs bg-red-950 p-2 rounded">
                  <div className="text-red-300 font-bold">{error.message}</div>
                  {error.stack && <div className="text-red-400 text-xs mt-1 font-mono">{error.stack.substring(0, 200)}</div>}
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="font-bold text-green-400 mb-2">Logs ({logs.length})</div>
        <div className="space-y-1 text-gray-400">
          {logs.slice(-20).map((log, idx) => (
            <div key={idx} className="text-xs">
              <span className="text-gray-500">[{log.level.toUpperCase()}]</span> {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex gap-2 flex-wrap">
        <button
          onClick={() => {
            printDebugLogs();
            alert('Logs printed to console');
          }}
          className="flex-1 min-w-12 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
        >
          Print
        </button>
        <button
          onClick={() => {
            const data = exportErrorLogs();
            navigator.clipboard.writeText(data).catch(() => console.log(data));
            alert('Error logs copied!');
          }}
          className="flex-1 min-w-12 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
        >
          Copy Errors
        </button>
        <button
          onClick={() => {
            clearErrorLogs();
            setErrorLogs([]);
            alert('Error logs cleared');
          }}
          className="flex-1 min-w-12 px-2 py-1 bg-red-800 hover:bg-red-900 rounded text-xs"
        >
          Clear Errors
        </button>
        <button
          onClick={() => {
            clearDebugLogs();
            setLogs([]);
          }}
          className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
