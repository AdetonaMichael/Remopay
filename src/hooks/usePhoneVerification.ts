import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/services/auth.service';

export const usePhoneVerification = (onVerified?: () => void) => {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { addToast } = useUIStore();

  // Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'call'>('sms');
  const [otp, setOtp] = useState('');

  // Verification state
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(user?.isPhoneVerified || false);

  // Loading and error state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Timer state
  const [expiresIn, setExpiresIn] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [maskedPhoneNumber, setMaskedPhoneNumber] = useState<string>('');

  // Current step: 'phone-input' | 'otp-input' | 'success'
  const [step, setStep] = useState<'phone-input' | 'otp-input' | 'success'>('phone-input');

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (expiresIn <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [expiresIn]);

  // Format phone number for display (E.164 or local format)
  const formatPhoneNumber = useCallback((phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Handle Nigerian numbers
    if (cleaned.length === 10 && cleaned.startsWith('8')) {
      // Local format: 0810... -> +2348102...
      return '+234' + cleaned.substring(1);
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      // Format: 08102... -> +2348102...
      return '+234' + cleaned.substring(1);
    } else if (cleaned.length === 12 && cleaned.startsWith('234')) {
      // Format: 2348102... -> +2348102...
      return '+' + cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('+')) {
      // Already E.164
      return phone;
    }

    // Return as-is if not recognized
    return phone;
  }, []);

  // Validate phone number format
  const validatePhoneNumber = useCallback((phone: string): boolean => {
    const formatted = formatPhoneNumber(phone);
    // Check if it's valid E.164 format
    const e164Regex = /^\+\d{1,15}$/;
    return e164Regex.test(formatted);
  }, [formatPhoneNumber]);

  // Send OTP
  const sendOTP = useCallback(async () => {
    setError(null);
    setFieldErrors({});

    // Validate input
    if (!phoneNumber.trim()) {
      setFieldErrors({ phone_number: ['Phone number is required'] });
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setFieldErrors({ phone_number: ['Invalid phone number format'] });
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log('[usePhoneVerification] Sending OTP:', { 
        originalPhone: phoneNumber, 
        formattedPhone,
        method: verificationMethod 
      });

      const response = await authService.sendPhoneVerificationOTP({
        phone_number: formattedPhone,
        method: verificationMethod,
      });

      if (response.success && response.data) {
        const { verification_id, phone_number, expires_in_minutes, message } = response.data;
        
        setVerificationId(verification_id);
        setMaskedPhoneNumber(phone_number);
        setExpiresIn(expires_in_minutes * 60); // Convert to seconds
        setStep('otp-input');
        setOtp('');
        
        console.log('[usePhoneVerification] OTP sent successfully:', {
          verificationId: verification_id,
          maskedPhone: phone_number,
          expiresIn: expires_in_minutes,
          method: verificationMethod,
        });
        
        addToast({
          type: 'success',
          message: `OTP sent via ${verificationMethod.toUpperCase()} to ${phone_number}`,
        });
      } else {
        const errorMsg = response.message || 'Failed to send OTP';
        setError(errorMsg);
        setFieldErrors(response.errors || {});
        addToast({ type: 'error', message: errorMsg });
        console.warn('[usePhoneVerification] Send OTP failed:', response);
      }
    } catch (err: any) {
      const message = err.message || 'An error occurred while sending OTP';
      setError(message);
      addToast({ type: 'error', message });
      console.error('[usePhoneVerification] Send OTP error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, verificationMethod, formatPhoneNumber, validatePhoneNumber, addToast]);

  // Verify OTP
  const verifyOTP = useCallback(async () => {
    setError(null);
    setFieldErrors({});

    if (!otp.trim()) {
      setFieldErrors({ otp: ['Verification code is required'] });
      return;
    }

    if (!/^\d{5,6}$/.test(otp)) {
      setFieldErrors({ otp: ['Code must be 5-6 digits'] });
      return;
    }

    if (!verificationId) {
      setError('Verification session expired. Please request a new OTP.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyPhoneWithOTP({
        verification_id: verificationId,
        otp,
      });

      if (response.success && response.data?.user) {
        // Update user state with verified phone data from backend
        const updatedUser = response.data.user;
        setUser(updatedUser);
        
        // Verify the phone is marked as verified in the response
        if (updatedUser.isPhoneVerified === true) {
          setIsPhoneVerified(true);
          setStep('success');
          addToast({
            type: 'success',
            message: 'Phone number verified successfully!',
          });
          console.log('[usePhoneVerification] Phone verified:', {
            phone: updatedUser.phone_number,
            verifiedAt: updatedUser.phone_verified_at,
            isPhoneVerified: updatedUser.isPhoneVerified,
          });

          // Redirect after 2 seconds
          setTimeout(() => {
            if (onVerified) {
              onVerified();
            } else {
              // Check for redirect URL in query params
              const params = new URLSearchParams(window.location.search);
              const nextUrl = params.get('next');
              if (nextUrl && nextUrl !== '/auth/verify-phone') {
                router.replace(nextUrl);
              } else {
                router.replace('/dashboard');
              }
            }
          }, 2000);
        } else {
          // Safety check: user was returned but isPhoneVerified is not true
          console.warn('[usePhoneVerification] Phone not marked as verified in response:', updatedUser);
          setError('Phone verification status not updated. Please try again or contact support.');
          addToast({ 
            type: 'warning', 
            message: 'Verification may not have completed. Please refresh and try again.' 
          });
        }
      } else {
        const errorMsg = response.message || 'Failed to verify OTP';
        setError(errorMsg);
        setFieldErrors(response.errors || {});
        addToast({ type: 'error', message: errorMsg });
        console.warn('[usePhoneVerification] Verification failed:', response);
      }
    } catch (err: any) {
      const message = err.message || 'An error occurred while verifying OTP';
      setError(message);
      addToast({ type: 'error', message });
      console.error('[usePhoneVerification] OTP verification error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [otp, verificationId, setUser, addToast, router, onVerified]);

  // Reset to phone input step
  const resetToPhoneInput = useCallback(() => {
    setStep('phone-input');
    setOtp('');
    setError(null);
    setFieldErrors({});
    setVerificationId(null);
    setMaskedPhoneNumber('');
    setExpiresIn(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Format minutes:seconds for display
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(expiresIn / 60);
    const seconds = expiresIn % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [expiresIn]);

  return {
    // Form state
    phoneNumber,
    setPhoneNumber,
    verificationMethod,
    setVerificationMethod,
    otp,
    setOtp,

    // Verification state
    verificationId,
    isPhoneVerified,
    step,

    // UI state
    isLoading,
    error,
    fieldErrors,
    expiresIn,
    isExpired: expiresIn === 0 && step === 'otp-input' && verificationId !== null,
    maskedPhoneNumber,

    // Actions
    sendOTP,
    verifyOTP,
    resetToPhoneInput,
    formatTimeRemaining,
    formatPhoneNumber,
    validatePhoneNumber,
  };
};
