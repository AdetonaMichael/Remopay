'use client';

import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/services/auth.service';
import { LoginSchema, RegisterSchema, VerifyEmailSchema } from '@/utils/validation.utils';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, setUser, setAuthToken, setIsLoading, setError, getPrimaryRole, logout: logoutStore } = useAuthStore();
  const { addToast } = useUIStore();

  const login = useCallback(
    async (data: LoginSchema) => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('[useAuth] Login attempt for:', data.email);
        const response = await authService.login(data);
        console.log('[useAuth] Login response:', {
          success: response.success,
          hasToken: !!response.data?.token,
          tokenLength: response.data?.token?.length || 0,
          hasUser: !!response.data?.user,
          message: response.message,
        });

        if (response.success && response.data) {
          console.log('[useAuth] Login successful, setting user and token');
          setUser(response.data.user);
          setAuthToken(response.data.token);
          console.log('[useAuth] Token set in auth store');
          addToast({ type: 'success', message: 'Login successful!' });

          // Redirect based on primary role (admin > agent > user)
          const roles = response.data.user.roles || [];
          const primaryRole = getPrimaryRole(roles);
          console.log('[useAuth] Primary role determined:', primaryRole);
          
          if (primaryRole === 'admin') {
            router.push('/admin');
          } else if (primaryRole === 'agent') {
            router.push('/agent');
          } else {
            router.push('/dashboard');
          }
        } else {
          console.warn('[useAuth] Login failed:', response.message);
          setError(response.message || 'Login failed');
          addToast({ type: 'error', message: response.message || 'Login failed' });
        }
      } catch (err: any) {
        console.error('[useAuth] Login error:', err);
        const message = err.message || 'An error occurred during login';
        setError(message);
        addToast({ type: 'error', message });
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setAuthToken, setIsLoading, setError, getPrimaryRole, addToast, router]
  );

  const register = useCallback(
    async (data: RegisterSchema) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.register(data);

        if (response.success) {
          addToast({
            type: 'success',
            message: 'Registration successful! Please verify your email.',
          });
          router.push('/auth/verify-email?email=' + encodeURIComponent(data.email));
        } else {
          setError(response.message || 'Registration failed');
          addToast({ type: 'error', message: response.message || 'Registration failed' });
        }
      } catch (err: any) {
        const message = err.message || 'An error occurred during registration';
        setError(message);
        addToast({ type: 'error', message });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, addToast, router]
  );

  const verifyEmail = useCallback(
    async (data: VerifyEmailSchema) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.verifyEmail(data);

        if (response.success) {
          addToast({ type: 'success', message: 'Email verified successfully!' });
          router.push('/auth/login');
        } else {
          setError(response.message || 'Verification failed');
          addToast({ type: 'error', message: response.message || 'Verification failed' });
        }
      } catch (err: any) {
        const message = err.message || 'An error occurred during verification';
        setError(message);
        addToast({ type: 'error', message });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, addToast, router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      logoutStore();
      addToast({ type: 'success', message: 'Logged out successfully' });
      router.push('/');
    } catch (err: any) {
      addToast({ type: 'error', message: 'Logout failed' });
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, logoutStore, addToast, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    verifyEmail,
    logout,
  };
};
