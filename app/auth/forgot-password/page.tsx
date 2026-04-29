'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import { AuthProtected } from '@/components/AuthProtected';
import { useAlert } from '@/hooks/useAlert';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import { authService } from '@/services/auth.service';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <img
        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=90"
        alt="Remopay auth background"
        className="absolute inset-0 h-full w-full object-cover brightness-95 contrast-110 saturate-110"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,60,60,0.15),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/icon.png" alt="Remopay" width={45} height={45} />
              <span className="h5 font-bold">Remopay</span>
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ForgotPasswordPageContent() {
  const router = useRouter();
  const { success: showSuccess, error: showError, warning: showWarning } = useAlert();
  const { getPasswordStrength, requirements, isPasswordValid } = usePasswordValidation();

  const showAlert = useCallback(
    ({ type, message }: { type: 'success' | 'error' | 'warning'; message: string }) => {
      if (type === 'success') showSuccess(message);
      if (type === 'error') showError(message);
      if (type === 'warning') showWarning(message);
    },
    [showSuccess, showError, showWarning]
  );

  const [currentStep, setCurrentStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpCountdown, setOtpCountdown] = useState(600);
  const [otpExpiredAlertShown, setOtpExpiredAlertShown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<any>({
    level: 'weak',
    score: 0,
  });
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (currentStep !== 'otp') return;

    if (otpCountdown > 0) {
      const timer = setTimeout(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (!otpExpiredAlertShown) {
      setOtpExpiredAlertShown(true);
      showAlert({
        type: 'error',
        message: 'OTP has expired. Please request a new one.',
      });
    }
  }, [currentStep, otpCountdown, otpExpiredAlertShown, showAlert]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = async (data: EmailFormData) => {
    try {
      emailForm.clearErrors();

      const response = await authService.forgotPassword(data);

      if (response.success) {
        setEmail(data.email);
        setOtpCountdown(600);
        setOtpExpiredAlertShown(false);
        setCurrentStep('otp');
        setResendCountdown(60);

        showAlert({
          type: 'success',
          message: 'OTP sent successfully. Check your email.',
        });

        return;
      }

      showAlert({
        type: 'error',
        message: response.message || 'Failed to send OTP',
      });
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setResendCountdown(60);

        showAlert({
          type: 'warning',
          message: 'Please wait 60 seconds before requesting again',
        });

        return;
      }

      showAlert({
        type: 'error',
        message: error?.response?.data?.message || 'An error occurred while sending OTP',
      });
    }
  };

  const handleOtpSubmit = async (data: OTPFormData) => {
    try {
      otpForm.clearErrors();

      const response = await authService.verifyPasswordResetOtp({
        email,
        otp: data.otp,
      });

      if (response.success && response.data?.reset_token) {
        setResetToken(response.data.reset_token);
        setCurrentStep('password');

        showAlert({
          type: 'success',
          message: 'OTP verified successfully',
        });

        return;
      }

      showAlert({
        type: 'error',
        message: response.message || 'OTP verification failed',
      });
    } catch (error: any) {
      showAlert({
        type: 'error',
        message: error?.response?.data?.message || 'An error occurred while verifying OTP',
      });
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;

    try {
      const response = await authService.forgotPassword({ email });

      if (response.success) {
        setOtpCountdown(600);
        setOtpExpiredAlertShown(false);
        setResendCountdown(60);

        showAlert({
          type: 'success',
          message: 'OTP resent successfully',
        });
      }
    } catch {
      showAlert({
        type: 'error',
        message: 'Failed to resend OTP',
      });
    }
  };

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      setPasswordStrength(getPasswordStrength(value));
    },
    [getPasswordStrength]
  );

  const handlePasswordSubmit = async () => {
    try {
      setIsResettingPassword(true);

      if (!isPasswordValid()) {
        showAlert({
          type: 'error',
          message: 'Password does not meet all requirements',
        });
        setIsResettingPassword(false);
        return;
      }

      if (password !== confirmPassword) {
        showAlert({
          type: 'error',
          message: 'Passwords do not match',
        });
        setIsResettingPassword(false);
        return;
      }

      const response = await authService.resetPassword({
        email,
        reset_token: resetToken,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.success) {
        setCurrentStep('success');

        showAlert({
          type: 'success',
          message: 'Password reset successfully',
        });

        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);

        return;
      }

      showAlert({
        type: 'error',
        message: response.message || 'Failed to reset password',
      });

      setIsResettingPassword(false);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || 'An error occurred while resetting password';

      if (error?.response?.status === 400 && errorMessage.includes('expired')) {
        setCurrentStep('email');

        showAlert({
          type: 'error',
          message: 'Session expired. Please start over.',
        });
      } else {
        showAlert({
          type: 'error',
          message: errorMessage,
        });
      }

      setIsResettingPassword(false);
    }
  };

  if (currentStep === 'success') {
    return (
      <AuthBackground>
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
            <CheckCircle2 className="h-9 w-9 text-[#22c55e]" />
          </div>

          <h1 className="text-3xl font-black">Password reset successful</h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            Your password has been changed successfully. Please sign in again
            with your new password.
          </p>

          <Link href="/auth/login">
            <Button className="mt-7 w-full rounded-xl bg-[#d71927] py-3 font-black text-white hover:bg-[#b91420]">
              Continue to Login
            </Button>
          </Link>
        </div>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
          {currentStep === 'email' && <Mail className="h-8 w-8 text-[#ff737b]" />}
          {currentStep === 'otp' && <ShieldCheck className="h-8 w-8 text-[#ff737b]" />}
          {currentStep === 'password' && <Lock className="h-8 w-8 text-[#ff737b]" />}
        </div>

        <h1 className="text-3xl font-black">
          {currentStep === 'email' && 'Forgot password?'}
          {currentStep === 'otp' && 'Verify your email'}
          {currentStep === 'password' && 'Create new password'}
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/70">
          {currentStep === 'email' &&
            "Enter your email address and we'll send you a password reset code."}
          {currentStep === 'otp' && 'Enter the 6-digit code sent to your email address.'}
          {currentStep === 'password' &&
            'Choose a strong password to secure your Remopay account.'}
        </p>
      </div>

      <div className="mb-8 flex gap-2">
        {(['email', 'otp', 'password'] as const).map((step, index) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors ${
              ['email', 'otp', 'password'].indexOf(currentStep) >= index
                ? 'bg-[#ff4b55]'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {currentStep === 'email' && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block label">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                {...emailForm.register('email')}
              />
            </div>

            {emailForm.formState.errors.email && (
              <p className="mt-2 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={14} />
                {emailForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={emailForm.formState.isSubmitting}
            className="w-full rounded-xl bg-[#d71927] py-3 button-md text-white shadow-lg shadow-[#d71927]/30 hover:bg-[#b91420]"
          >
            {emailForm.formState.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Sending...
              </span>
            ) : (
              'Send Reset Code'
            )}
          </Button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 label text-[#ff737b]"
            >
              <ArrowLeft size={15} />
              Back to login
            </Link>
          </div>
        </form>
      )}

      {currentStep === 'otp' && (
        <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="body-sm text-white/70">
              Code sent to <span className="font-bold text-[#ff737b]">{email}</span>
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="otp" className="label">
                Verification Code
              </label>

              <span className="caption-xs font-semibold text-white/60">
                Expires in {formatCountdown(otpCountdown)}
              </span>
            </div>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              disabled={otpCountdown === 0}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-2xl font-black tracking-[0.35em] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#ff4b55] disabled:cursor-not-allowed disabled:opacity-50"
              {...otpForm.register('otp')}
            />

            {otpForm.formState.errors.otp && (
              <p className="mt-2 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle size={14} />
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={otpForm.formState.isSubmitting || otpCountdown === 0}
            className="w-full rounded-xl bg-[#d71927] py-3 font-black text-white shadow-lg shadow-[#d71927]/30 hover:bg-[#b91420] disabled:opacity-60"
          >
            {otpForm.formState.isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="text-center">
            <p className="mb-2 text-sm text-white/65">Didn&apos;t receive the code?</p>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0}
              className="text-sm font-bold text-[#ff737b] disabled:cursor-not-allowed disabled:text-white/40"
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentStep('email');
              emailForm.reset();
            }}
            className="w-full text-sm font-bold text-white/70 hover:text-white"
          >
            Use a different email
          </button>
        </form>
      )}

      {currentStep === 'password' && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handlePasswordSubmit();
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-bold">
              New Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />

              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(event) => handlePasswordChange(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {password && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-white/60">
                  Password Strength
                </span>
                <span className="text-xs font-black text-[#ff737b]">
                  {passwordStrength?.level?.charAt(0).toUpperCase() +
                    passwordStrength?.level?.slice(1)}
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor:
                      passwordStrength.level === 'weak'
                        ? '#ef4444'
                        : passwordStrength.level === 'medium'
                          ? '#f59e0b'
                          : '#22c55e',
                  }}
                />
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { label: 'At least 8 characters', key: 'minLength' },
                  { label: 'Contains uppercase letter', key: 'hasUppercase' },
                  { label: 'Contains lowercase letter', key: 'hasLowercase' },
                  { label: 'Contains number', key: 'hasNumber' },
                  { label: 'Contains symbol', key: 'hasSymbol' },
                ].map(({ label, key }) => {
                  const passed = requirements[key as keyof typeof requirements];

                  return (
                    <div key={key} className="flex items-center gap-2 text-xs text-white/70">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full ${
                          passed ? 'bg-[#22c55e]' : 'bg-white/15'
                        }`}
                      >
                        {passed && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password_confirmation" className="mb-1 block text-sm font-bold">
              Confirm Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />

              <input
                id="password_confirmation"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
              />
            </div>

            {confirmPassword && password !== confirmPassword && (
              <p className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
                <AlertCircle size={14} />
                Passwords don&apos;t match
              </p>
            )}

            {confirmPassword && password === confirmPassword && (
              <p className="mt-2 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 size={14} />
                Passwords match
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isResettingPassword || !isPasswordValid() || password !== confirmPassword}
            className="w-full rounded-xl bg-[#d71927] py-3 font-black text-white shadow-lg shadow-[#d71927]/30 hover:bg-[#b91420] disabled:opacity-60"
          >
            {isResettingPassword ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>

          <button
            type="button"
            onClick={() => {
              setCurrentStep('email');
              emailForm.reset();
            }}
            className="w-full text-sm font-bold text-white/70 hover:text-white"
          >
            Start over
          </button>
        </form>
      )}
    </AuthBackground>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthProtected requireAuth={false}>
      <ForgotPasswordPageContent />
    </AuthProtected>
  );
}