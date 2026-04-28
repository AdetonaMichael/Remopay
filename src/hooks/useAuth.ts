import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/services/auth.service';
import { LoginSchema, RegisterSchema, VerifyEmailSchema } from '@/utils/validation.utils';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, setUser, setAuthToken, setIsLoading, setError, getPrimaryRole, logout: logoutStore, setEmailVerificationCooldown, emailVerificationCooldown } = useAuthStore();
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

          // Check if email is verified
          const isEmailVerified = response.data.user?.isEmailVerified === true;
          console.log('[useAuth] Email verification status:', isEmailVerified);
          
          if (!isEmailVerified) {
            // Redirect to email verification page
            console.log('[useAuth] Email not verified - redirecting to verification page');
            router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
            return;
          }

          // Email is verified - redirect based on primary role (admin > agent > user)
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

  const resendEmailOTP = useCallback(
    async (email: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.resendEmailVerificationOTP(email);

        if (response.success) {
          // Start 60-second cooldown
          let countdown = 60;
          setEmailVerificationCooldown(countdown);
          const interval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
              clearInterval(interval);
              setEmailVerificationCooldown(0);
            } else {
              setEmailVerificationCooldown(countdown);
            }
          }, 1000);

          addToast({ type: 'success', message: 'OTP sent! Check your email.' });
          return { success: true };
        } else {
          setError(response.message || 'Failed to resend OTP');
          addToast({ type: 'error', message: response.message || 'Failed to resend OTP' });
          return { success: false, message: response.message };
        }
      } catch (err: any) {
        const message = err.message || 'An error occurred while resending OTP';
        setError(message);
        addToast({ type: 'error', message });
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setError, setEmailVerificationCooldown, addToast]
  );

  const verifyEmail = useCallback(
    async (data: VerifyEmailSchema) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.verifyEmail(data);

        if (response.success && response.data?.user) {
          // Update user in store with verified email status
          setUser(response.data.user);
          addToast({ type: 'success', message: 'Email verified successfully!' });
          
          // Redirect immediately to dashboard (user is already authenticated and verified)
          router.replace('/dashboard');
          return { success: true };
        } else {
          const errorMsg = response.message || 'Verification failed';
          setError(errorMsg);
          addToast({ type: 'error', message: errorMsg });
          return { success: false, message: errorMsg };
        }
      } catch (err: any) {
        const message = err.message || 'An error occurred during verification';
        setError(message);
        addToast({ type: 'error', message });
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setIsLoading, setError, addToast, router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Attempt to notify backend
      await authService.logout();
    } catch (err) {
      console.warn('[useAuth] Backend logout failed, continuing with local cleanup:', err);
    } finally {
      // Full cleanup regardless of backend response
      logoutStore();
      
      // Additional cleanup - clear all auth-related storage
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-store');
          sessionStorage.removeItem('auth-store');
          sessionStorage.removeItem('error_403');
        } catch (e) {
          console.warn('[useAuth] Error clearing storage:', e);
        }
      }
      
      addToast({ type: 'success', message: 'Logged out successfully' });
      setIsLoading(false);
      
      // Redirect to landing page
      router.replace('/');
    }
  }, [logoutStore, addToast, router, setIsLoading]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    emailVerificationCooldown,
    login,
    register,
    verifyEmail,
    resendEmailOTP,
    logout,
  };
};
