/**
 * Comprehensive Error Tracking for Mobile Debugging
 * Captures all errors with full context for mobile troubleshooting
 */

const ERROR_LOG_KEY = 'app_error_tracking';
const MAX_ERROR_LOGS = 100;

export interface ErrorTrackingEntry {
  id: string;
  timestamp: number;
  type: 'api_error' | 'component_error' | 'storage_error' | 'auth_error' | 'render_error' | 'network_error' | 'permission_error' | 'unknown_error';
  severity: 'critical' | 'error' | 'warning' | 'info';
  location: string; // function or component name
  errorMessage: string;
  errorCode?: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
  resolved?: boolean;
}

/**
 * Initialize error tracking system
 */
export const initializeErrorTracking = () => {
  try {
    if (typeof window === 'undefined') return;

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[ErrorTracking] Unhandled Promise Rejection:', event.reason);
      trackError({
        type: 'unknown_error',
        severity: 'critical',
        location: 'window.unhandledrejection',
        errorMessage: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        context: {
          reason: event.reason,
          type: event.type,
        },
      });
    });

    // Capture global errors
    window.addEventListener('error', (event) => {
      console.error('[ErrorTracking] Global Error:', event.error);
      trackError({
        type: 'render_error',
        severity: 'critical',
        location: event.filename || 'unknown',
        errorMessage: event.message || 'Unknown error',
        stack: event.error?.stack,
        context: {
          lineno: event.lineno,
          colno: event.colno,
          filename: event.filename,
        },
      });
    });

    console.log('[ErrorTracking] Error tracking system initialized');
  } catch (e) {
    console.warn('[ErrorTracking] Failed to initialize:', e);
  }
};

/**
 * Track an error with full context
 */
export const trackError = (
  errorInput: Omit<ErrorTrackingEntry, 'id' | 'timestamp' | 'userAgent' | 'url'>
) => {
  try {
    if (typeof window === 'undefined') return;

    const entry: ErrorTrackingEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...errorInput,
    };

    // Get existing logs
    const logs = getAllErrorLogs();
    logs.push(entry);

    // Keep only last MAX_ERROR_LOGS entries
    if (logs.length > MAX_ERROR_LOGS) {
      logs.splice(0, logs.length - MAX_ERROR_LOGS);
    }

    // Store to localStorage
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs));

    // Log to console for immediate debugging
    console.log(`[ErrorTracking] ${entry.severity.toUpperCase()} [${entry.type}]:`, {
      message: entry.errorMessage,
      location: entry.location,
      context: entry.context,
      stack: entry.stack,
    });

    return entry;
  } catch (e) {
    console.error('[ErrorTracking] Failed to track error:', e);
  }
};

/**
 * Get all tracked errors
 */
export const getAllErrorLogs = (): ErrorTrackingEntry[] => {
  try {
    if (typeof window === 'undefined') return [];
    const logs = localStorage.getItem(ERROR_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (e) {
    console.warn('[ErrorTracking] Failed to retrieve error logs:', e);
    return [];
  }
};

/**
 * Get critical errors only
 */
export const getCriticalErrors = (): ErrorTrackingEntry[] => {
  return getAllErrorLogs().filter((log) => log.severity === 'critical' || log.severity === 'error');
};

/**
 * Clear all error logs
 */
export const clearErrorLogs = () => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch (e) {
    console.warn('[ErrorTracking] Failed to clear error logs:', e);
  }
};

/**
 * Wrap async function with error tracking
 */
export const withErrorTracking = async <T>(
  fn: () => Promise<T>,
  context: {
    type: ErrorTrackingEntry['type'];
    location: string;
    context?: Record<string, any>;
  }
): Promise<{ success: boolean; data?: T; error?: ErrorTrackingEntry }> => {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: any) {
    const entry = trackError({
      type: context.type,
      severity: 'error',
      location: context.location,
      errorMessage: error?.message || String(error),
      errorCode: error?.code,
      stack: error?.stack,
      context: {
        ...context.context,
        errorDetails: error,
      },
    });
    return { success: false, error: entry };
  }
};

/**
 * Export all error logs as JSON string for sharing
 */
export const exportErrorLogs = (): string => {
  try {
    const logs = getAllErrorLogs();
    const criticalErrors = getCriticalErrors();
    const summary = {
      exportedAt: new Date().toISOString(),
      totalErrors: logs.length,
      criticalErrors: criticalErrors.length,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      errors: logs,
    };
    return JSON.stringify(summary, null, 2);
  } catch (e) {
    console.error('[ErrorTracking] Failed to export logs:', e);
    return JSON.stringify({ error: 'Failed to export logs' });
  }
};

/**
 * Track specific error types
 */

export const trackApiError = (
  endpoint: string,
  error: any,
  context?: Record<string, any>
) => {
  trackError({
    type: 'api_error',
    severity: error.response?.status === 401 ? 'warning' : 'error',
    location: `API: ${error.config?.method?.toUpperCase()} ${endpoint}`,
    errorMessage: error.message || 'API request failed',
    errorCode: error.code || error.response?.status,
    stack: error.stack,
    context: {
      endpoint,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      ...context,
    },
  });
};

export const trackStorageError = (
  operation: 'get' | 'set' | 'remove' | 'clear',
  key: string,
  error: any,
  context?: Record<string, any>
) => {
  trackError({
    type: 'storage_error',
    severity: operation === 'get' ? 'warning' : 'error',
    location: `Storage.${operation}`,
    errorMessage: error.message || `Storage ${operation} failed for key: ${key}`,
    errorCode: error.code || error.name,
    stack: error.stack,
    context: {
      operation,
      key,
      error: error.toString(),
      ...context,
    },
  });
};

export const trackAuthError = (
  operation: string,
  error: any,
  context?: Record<string, any>
) => {
  trackError({
    type: 'auth_error',
    severity: 'error',
    location: `Auth: ${operation}`,
    errorMessage: error.message || `Auth operation failed: ${operation}`,
    errorCode: error.code,
    stack: error.stack,
    context: {
      operation,
      error: error.toString(),
      ...context,
    },
  });
};

export const trackPermissionError = (
  permission: string,
  error: any,
  context?: Record<string, any>
) => {
  trackError({
    type: 'permission_error',
    severity: 'warning',
    location: `Permission: ${permission}`,
    errorMessage: error.message || `Permission denied: ${permission}`,
    errorCode: error.code,
    stack: error.stack,
    context: {
      permission,
      ...context,
    },
  });
};
