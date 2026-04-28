'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Mail,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
  Clock,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import {
  verifyEmailSchema,
  type VerifyEmailSchema,
} from '@/utils/validation.utils';

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const [countdown, setCountdown] = useState(0);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { verifyEmail, resendEmailOTP, isLoading, emailVerificationCooldown } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: defaultEmail,
      otp: '',
    },
  });

  const email = watch('email');
  const otp = watch('otp');

  // Auto-send OTP when component mounts with email
  useEffect(() => {
    if (defaultEmail && !showOTPInput) {
      setShowOTPInput(true);
      // Trigger resend on mount (the backend sends OTP during registration, but we can trigger again if needed)
    }
  }, [defaultEmail]);

  // Handle cooldown countdown
  useEffect(() => {
    if (emailVerificationCooldown > 0) {
      setCountdown(emailVerificationCooldown);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emailVerificationCooldown]);

  const onSubmit = async (data: VerifyEmailSchema) => {
    setHasError(false);
    const result = await verifyEmail(data);
    if (!result.success) {
      setHasError(true);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setHasError(true);
      return;
    }
    const result = await resendEmailOTP(email);
    if (result.success) {
      setCountdown(60);
    } else {
      setHasError(true);
    }
  };

  const handleOTPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('otp', value);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <img
        src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1800&q=90"
        alt="Remopay verification background"
        className="absolute inset-0 h-full w-full object-cover brightness-95 contrast-110 saturate-110"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,60,60,0.15),transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/icon.png" alt="Remopay" width={45} height={45} />
              <span className="text-2xl font-black">Remopay</span>
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
              
              </div>

              <h1 className="text-3xl font-black">Verify your email</h1>

              <p className="mt-3 text-sm leading-6 text-white/70">
                We've sent a 6-digit verification code to <span className="font-bold text-white">{email}</span>. Enter it below to verify your account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email field - hidden if already provided */}
              {!defaultEmail && (
                <div>
                  <label className="mb-1 block text-sm font-bold">Email</label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                      size={16}
                    />

                    <input
                      {...register('email')}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="mb-2 flex items-center justify-between text-sm font-bold">
                  <span>Verification Code</span>
                  <span className="text-xs font-normal text-white/60">6 digits</span>
                </label>

                <div className="relative">
                  <ShieldCheck
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                    size={16}
                  />
                  <input
                    {...register('otp')}
                    onChange={handleOTPInput}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-center text-2xl font-black tracking-[0.35em] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff4b55]"
                  />
                </div>

                {errors.otp && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.otp.message}
                  </p>
                )}

                {hasError && !errors.otp && (
                  <p className="mt-1 text-xs text-red-400">
                    Invalid or expired OTP. Please try again or request a new code.
                  </p>
                )}
              </div>

              {/* Verification Status Messages */}
              {otp.length === 6 && !hasError && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
                  <BadgeCheck size={14} />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d71927] py-3 text-sm font-black text-white shadow-lg shadow-[#d71927]/30 transition hover:bg-[#b91420] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Resend Section */}
            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="mb-3 text-center text-sm text-white/70">
                Didn't receive the code?
              </p>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#fff] py-3 text-sm font-black text-[#fff] transition hover:bg-[#ff4b55]/10 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/50"
              >
                {countdown > 0 ? (
                  <>
                    <Clock size={16} />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCcw size={16} />
                    Resend verification code
                  </>
                )}
              </button>

              <p className="mt-3 text-center text-xs text-white/50">
                Check your spam folder if you don't see the email
              </p>
            </div>

            {/* Already verified link */}
            <div className="mt-6 text-center text-sm">
              <p className="text-white/60">
                Already verified?{' '}
                <Link
                  href="/auth/login"
                  className="font-black text-[#ff737b] hover:text-[#ff4b55]"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
         