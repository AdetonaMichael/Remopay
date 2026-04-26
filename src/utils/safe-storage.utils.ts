/**
 * Safe localStorage wrapper
 * Handles Safari private mode and other mobile browser edge cases
 * Returns null/undefined gracefully instead of throwing
 */

import { trackStorageError } from '@/utils/error-tracking.utils';

let _isPrivateMode: boolean | null = null;

/**
 * Check if browser is in private/incognito mode
 * This is especially important for mobile Safari
 */
const isPrivateMode = (): boolean => {
  if (_isPrivateMode !== null) {
    return _isPrivateMode;
  }

  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    _isPrivateMode = false;
  } catch (e) {
    _isPrivateMode = true;
  }

  return _isPrivateMode;
};

/**
 * Safe getItem - never throws
 */
export const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window === 'undefined') {
      console.warn(`[SafeStorage] getItem("${key}") - window is undefined`);
      return null;
    }
    if (isPrivateMode()) {
      console.warn(`[SafeStorage] Browser in private mode, cannot access localStorage for "${key}"`);
      return null;
    }
    const value = localStorage.getItem(key);
    console.log(`[SafeStorage] Retrieved from localStorage - key: "${key}", found: ${value !== null}, value length: ${value?.length || 0}`);
    return value;
  } catch (error: any) {
    console.warn(`[SafeStorage] Failed to get item "${key}":`, error);
    trackStorageError('get', key, error);
    return null;
  }
};

/**
 * Safe setItem - never throws
 */
export const safeSetItem = (key: string, value: string): boolean => {
  try {
    if (typeof window === 'undefined') {
      console.warn(`[SafeStorage] setItem("${key}") - window is undefined`);
      return false;
    }
    if (isPrivateMode()) {
      console.warn(`[SafeStorage] Browser in private mode, cannot write to localStorage for "${key}"`);
      return false;
    }
    console.log(`[SafeStorage] Writing to localStorage - key: "${key}", value length: ${value?.length || 0}`);
    localStorage.setItem(key, value);
    const verify = localStorage.getItem(key);
    const isStored = verify === value;
    console.log(`[SafeStorage] Verification - stored: ${isStored}, retrieved value length: ${verify?.length || 0}`);
    return isStored;
  } catch (error: any) {
    console.warn(`[SafeStorage] Failed to set item "${key}":`, error);
    trackStorageError('set', key, error);
    return false;
  }
};

/**
 * Safe removeItem - never throws
 */
export const safeRemoveItem = (key: string): boolean => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    if (isPrivateMode()) {
      return false;
    }
    localStorage.removeItem(key);
    return true;
  } catch (error: any) {
    console.warn(`[SafeStorage] Failed to remove item "${key}":`, error);
    trackStorageError('remove', key, error);
    return false;
  }
};

/**
 * Safe clear - never throws
 */
export const safeClear = (): boolean => {
  try {
    if (typeof window === 'undefined') {
      return false;
    }
    if (isPrivateMode()) {
      return false;
    }
    localStorage.clear();
    return true;
  } catch (error: any) {
    console.warn(`[SafeStorage] Failed to clear storage:`, error);
    trackStorageError('clear', 'all', error);
    return false;
  }
};
