/**
 * Debug & Security Utility
 * - Development: Full console logging with sanitization
 * - Production: No console output, DevTools detection, critical errors only
 * - Mobile: Logs errors to localStorage for later inspection
 */

const MAX_LOGS = 50;
const LOG_STORAGE_KEY = 'app_debug_logs';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface DebugLog {
  timestamp: number;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any;
}

/**
 * Sensitive fields to redact from logs
 */
const SENSITIVE_FIELDS = [
  'pin',
  'password',
  'token',
  'authorization',
  'secret',
  'api_key',
  'access_token',
  'refresh_token',
  'credit_card',
  'cvv',
  'ssn',
];

/**
 * Sanitize sensitive data from objects
 */
const sanitizeData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  try {
    const sanitized = JSON.parse(JSON.stringify(data));

    const sanitizeObject = (obj: any) => {
      for (const key in obj) {
        if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '***REDACTED***';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    sanitizeObject(sanitized);
    return sanitized;
  } catch {
    return data;
  }
};

/**
 * Get all debug logs from storage
 */
export const getDebugLogs = (): DebugLog[] => {
  try {
    if (typeof window === 'undefined') return [];
    const logs = localStorage.getItem(LOG_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Add a log entry to storage
 */
const addLog = (level: 'log' | 'warn' | 'error' | 'info', message: string, data?: any) => {
  try {
    if (typeof window === 'undefined') return;

    const logs = getDebugLogs();
    logs.push({
      timestamp: Date.now(),
      level,
      message,
      data: sanitizeData(data),
    });

    // Keep only last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }

    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    // Silently fail
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
    // Silently fail
  }
};

/**
 * Development-only logger
 * Only logs in development mode, sanitizes sensitive data
 */
export const debug = {
  log: (label: string, data?: any) => {
    if (!IS_DEVELOPMENT) return;
    console.log(`%c${label}`, 'color: #4A90E2; font-weight: bold;', sanitizeData(data));
  },

  warn: (label: string, data?: any) => {
    if (!IS_DEVELOPMENT) return;
    console.warn(`%c${label}`, 'color: #F5A623; font-weight: bold;', sanitizeData(data));
  },

  error: (label: string, data?: any) => {
    if (!IS_DEVELOPMENT) return;
    console.error(`%c${label}`, 'color: #D0021B; font-weight: bold;', sanitizeData(data));
  },

  info: (label: string, data?: any) => {
    if (!IS_DEVELOPMENT) return;
    console.info(`%c${label}`, 'color: #7ED321; font-weight: bold;', sanitizeData(data));
  },

  /**
   * Log request details (sanitized)
   */
  logRequest: (method: string, url: string, data?: any) => {
    if (!IS_DEVELOPMENT) return;
    debug.log(`[${method}] ${url}`, sanitizeData(data));
  },

  /**
   * Log response details (sanitized)
   */
  logResponse: (status: number, url: string, data?: any) => {
    if (!IS_DEVELOPMENT) return;
    debug.log(`[${status}] ${url}`, sanitizeData(data));
  },
};

/**
 * Legacy functions for backward compatibility
 */
export const debugLog = (message: string, data?: any) => {
  if (IS_DEVELOPMENT) {
    console.log('[DEBUG]', message, sanitizeData(data));
  }
  addLog('log', message, data);
};

export const debugWarn = (message: string, data?: any) => {
  if (IS_DEVELOPMENT) {
    console.warn('[DEBUG]', message, sanitizeData(data));
  }
  addLog('warn', message, data);
};

export const debugError = (message: string, error?: any) => {
  if (IS_DEVELOPMENT) {
    console.error('[DEBUG]', message, sanitizeData(error));
  }
  addLog('error', message, {
    message: error?.message,
    code: error?.code,
  });
};

/**
 * Initialize production security measures
 */
export const initSecurityMeasures = () => {
  if (!IS_PRODUCTION) return;

  // Detect DevTools opening
  let devToolsOpen = false;

  const detectDevTools = () => {
    const threshold = 160;

    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        console.clear();
        console.log('%c⚠️  SECURITY WARNING', 'color: red; font-size: 20px; font-weight: bold;');
        console.log(
          '%cDo not paste any code, tokens, or PINs in this console. It may compromise your account.',
          'color: red; font-size: 14px;'
        );
      }
    } else {
      devToolsOpen = false;
    }
  };

  // Check on interval
  const interval = setInterval(detectDevTools, 500);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => clearInterval(interval));

  // Disable Right-click inspect (optional)
  document.addEventListener('contextmenu', (e) => {
    // Allow right-click, just prevent inspect element
    if (e.ctrlKey || e.metaKey) {
      // Allow Ctrl/Cmd + C for copying
      return;
    }
  });
};

/**
 * Initialize all debug utilities
 */
export const initDebugUtils = () => {
  // Initialize production security in production mode
  if (IS_PRODUCTION) {
    initSecurityMeasures();
  }

  // Capture global errors for storage
  window.addEventListener('error', (event) => {
    addLog('error', 'Uncaught Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    addLog('error', 'Unhandled Promise Rejection', {
      reason: event.reason?.message || event.reason,
    });
  });
};

/**
 * Export logs as JSON string for debugging
 */
export const exportDebugLogs = (): string => {
  const logs = getDebugLogs();
  return JSON.stringify(logs, null, 2);
};

/**
 * Print debug logs to console (development only)
 */
export const printDebugLogs = () => {
  if (!IS_DEVELOPMENT) return;
  const logs = getDebugLogs();
  console.group('[DEBUG LOGS]');
  logs.forEach((log) => {
    const timestamp = new Date(log.timestamp).toISOString();
    console.log(`[${timestamp}] [${log.level.toUpperCase()}] ${log.message}`, sanitizeData(log.data));
  });
  console.groupEnd();
};

/**
 * Backward compatibility: old function name maps to new initDebugUtils
 */
export const initializeDebugLogging = initDebugUtils;

export default debug;
