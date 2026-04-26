/**
 * Mobile Debug Logging
 * Logs errors to localStorage for later inspection on mobile devices
 * Helps identify issues that only occur on mobile browsers
 */

const MAX_LOGS = 50;
const LOG_STORAGE_KEY = 'app_debug_logs';

interface DebugLog {
  timestamp: number;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any;
}

/**
 * Get all debug logs from storage
 */
export const getDebugLogs = (): DebugLog[] => {
  try {
    if (typeof window === 'undefined') return [];
    const logs = localStorage.getItem(LOG_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (e) {
    console.warn('[DebugLog] Failed to retrieve logs:', e);
    return [];
  }
};

/**
 * Add a log entry
 */
const addLog = (level: 'log' | 'warn' | 'error' | 'info', message: string, data?: any) => {
  try {
    if (typeof window === 'undefined') return;

    const logs = getDebugLogs();
    logs.push({
      timestamp: Date.now(),
      level,
      message,
      data,
    });

    // Keep only last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('[DebugLog] Failed to store log:', e);
  }
};

/**
 * Clear all debug logs
 */
export const clearDebugLogs = (): void => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOG_STORAGE_KEY);
  } catch (e) {
    console.warn('[DebugLog] Failed to clear logs:', e);
  }
};

/**
 * Log a message
 */
export const debugLog = (message: string, data?: any) => {
  console.log('[DEBUG]', message, data);
  addLog('log', message, data);
};

/**
 * Log a warning
 */
export const debugWarn = (message: string, data?: any) => {
  console.warn('[DEBUG]', message, data);
  addLog('warn', message, data);
};

/**
 * Log an error
 */
export const debugError = (message: string, error?: any) => {
  console.error('[DEBUG]', message, error);
  addLog('error', message, {
    message: error?.message,
    stack: error?.stack,
    code: error?.code,
    details: error,
  });
};

/**
 * Initialize debug logging
 * Captures global error and unhandled rejection handlers
 */
export const initializeDebugLogging = () => {
  if (typeof window === 'undefined') return;

  // Capture uncaught errors
  window.addEventListener('error', (event) => {
    debugError('[Global Error]', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.message,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    debugError('[Unhandled Rejection]', {
      reason: event.reason?.message || event.reason,
      promise: event.promise,
    });
  });

  debugLog('[DebugLogging] Initialized');
};

/**
 * Export logs as JSON string for debugging
 */
export const exportDebugLogs = (): string => {
  const logs = getDebugLogs();
  return JSON.stringify(logs, null, 2);
};

/**
 * Print debug logs to console
 */
export const printDebugLogs = () => {
  const logs = getDebugLogs();
  console.group('[DEBUG LOGS]');
  logs.forEach((log) => {
    const timestamp = new Date(log.timestamp).toISOString();
    console.log(`[${timestamp}] [${log.level.toUpperCase()}] ${log.message}`, log.data);
  });
  console.groupEnd();
};
