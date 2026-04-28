import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthResponse } from '@/types/api.types';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/utils/safe-storage.utils';

interface PINStatus {
  has_pin: boolean;
  is_locked: boolean;
  failed_attempts?: number;
  remaining_seconds?: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pinStatus: PINStatus | null;
  activeRole: string | null;
  isEmailVerified: boolean;
  emailVerificationCooldown: number;
  
  setUser: (user: User | null) => void;
  setAuthToken: (token: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPinStatus: (status: PINStatus | null) => void;
  setActiveRole: (role: string) => void;
  setEmailVerificationCooldown: (seconds: number) => void;
  getPrimaryRole: (roles?: string[]) => string | null;
  logout: () => void;
  reset: () => void;
}

// Create storage with safe fallback for private mode/mobile Safari
const getStorage = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  
  // Use safe storage wrapper that handles mobile Safari private mode
  return createJSONStorage(() => ({
    getItem: (key: string) => {
      try {
        const value = safeGetItem(key);
        return value;
      } catch (e) {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        safeSetItem(key, value);
      } catch (e) {
        // Silent fail
      }
    },
    removeItem: (key: string) => {
      try {
        safeRemoveItem(key);
      } catch (e) {
        // Silent fail
      }
    },
  }));
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      pinStatus: null,
      activeRole: null,
      isEmailVerified: false,
      emailVerificationCooldown: 0,

      setUser: (user) => {
        // Determine primary role for activeRole
        let primaryRole: string | null = null;
        if (user?.roles) {
          if (user.roles.includes('admin')) {
            primaryRole = 'admin';
          } else if (user.roles.includes('agent')) {
            primaryRole = 'agent';
          } else {
            primaryRole = user.roles[0] || null;
          }
        }

        set({
          user,
          isAuthenticated: !!user,
          error: null,
          isEmailVerified: user?.isEmailVerified || false,
          // Set activeRole to primary role (admin > agent > customer/user)
          activeRole: primaryRole,
        });
      },

      setAuthToken: (token) => {
        if (typeof window !== 'undefined') {
          safeSetItem('token', token);
        }
      },

      setIsLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      setPinStatus: (status) => set({ pinStatus: status }),

      setActiveRole: (role) => set({ activeRole: role }),

      setEmailVerificationCooldown: (seconds) => set({ emailVerificationCooldown: seconds }),

      getPrimaryRole: (roles?: string[]) => {
        const rolesToCheck = roles || [];
        // Order of priority: admin > agent > customer/user
        if (rolesToCheck.includes('admin')) return 'admin';
        if (rolesToCheck.includes('agent')) return 'agent';
        return rolesToCheck.find((r) => r === 'customer' || r === 'user') || rolesToCheck[0] || null;
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          safeRemoveItem('token');
          // Clear all auth-related localStorage keys
          safeRemoveItem('auth-store');
        }
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          pinStatus: null,
          activeRole: null,
          isEmailVerified: false,
          emailVerificationCooldown: 0,
        });
      },

      reset: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          pinStatus: null,
          activeRole: null,
          isEmailVerified: false,
          emailVerificationCooldown: 0,
        });
      },
    }),
    {
      name: 'auth-store',
      storage: getStorage(),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pinStatus: state.pinStatus,
        activeRole: state.activeRole,
      }),
    }
  )
);
