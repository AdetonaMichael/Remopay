'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Phone,
  CheckCircle,
  RefreshCcw,
  ShieldCheck,
  Clock,
} from 'lucide-react';

import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { useAuthStore } from '@/store/auth.store';

export function VerifyPhoneForm() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const authenticatedPhoneNumber = user?.phone_number || '';
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    phoneNumber,
    setPhoneNumber,
    verificationMethod,
    setVerificationMethod,
    otp,
    setOtp,
    step,
    isLoading,
    error,
    fieldErrors,
    expiresIn,
    maskedPhoneNumber,
    isPhoneVerified,
    sendCooldown,
    sendOTP,
    verifyOTP,
    resetToPhoneInput,
    formatTimeRemaining,
  } = usePhoneVerification();

  // Auto-populate phone from authenticated user on mount
  useEffect(() => {
    if (authenticatedPhoneNumber && !phoneNumber) {
      setPhoneNumber(authenticatedPhoneNumber);
    }
  }, [authenticatedPhoneNumber, phoneNumber, setPhoneNumber]);

  // Handle countdown
  useEffect(() => {
    if (expiresIn > 0) {
      setCountdown(expiresIn);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(interval);
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiresIn]);

  const handleOTPKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyOTP();
    }
  };

  const handleOTPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
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
            {/* Phone Input Step */}
            {step === 'phone-input' && (
              <>
                <div className="mb-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <Phone className="h-12 w-12 text-[#ff737b]" />
                  </div>
                  <h1 className="text-3xl font-black">Verify your phone</h1>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    We'll send a verification code to your phone to verify your account.
                  </p>
                </div>

                <form className="space-y-5">
                  {/* Error Message */}
                  {(hasError || error) && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                      <p className="text-sm text-red-400">{error || 'An error occurred'}</p>
                    </div>
                  )}

                  {/* Phone Number Input - Read Only (Account Phone) */}
                  <div>
                    <label className="mb-1 block text-sm font-bold">Your Account Phone Number</label>
                    <p className="mb-2 text-xs text-white/50">
                      This is your registered phone number and cannot be changed here.
                    </p>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                        size={16}
                      />
                      <input
                        type="tel"
                        placeholder={authenticatedPhoneNumber || '+234 810 230 0935'}
                        value={phoneNumber}
                        onChange={() => {}} // Prevent any changes
                        onKeyPress={(e) => e.preventDefault()} // Prevent typing
                        onCut={(e) => e.preventDefault()} // Prevent cut
                        onCopy={(e) => e.preventDefault()} // Prevent copy
                        onPaste={(e) => e.preventDefault()} // Prevent paste
                        onDrag={(e) => e.preventDefault()} // Prevent drag
                        onDrop={(e) => e.preventDefault()} // Prevent drop
                        disabled
                        readOnly
                        className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-3 text-sm text-white placeholder:text-white/50 cursor-not-allowed opacity-70"
                      />
                    </div>
                    {fieldErrors.phone_number && (
                      <p className="mt-1 text-xs text-red-400">{fieldErrors.phone_number[0]}</p>
                    )}
                  </div>

                  {/* Verification Method Selection */}
                  <div>
                    <label className="mb-3 block text-sm font-bold">Receive code via</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['sms', 'call'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setVerificationMethod(method as 'sms' | 'call')}
                          disabled={isLoading}
                          className={`rounded-xl py-2 px-4 font-bold transition-all disabled:opacity-60 ${
                            verificationMethod === method
                              ? 'bg-[#d71927] text-white shadow-lg shadow-[#d71927]/25'
                              : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {method === 'sms' ? '📱 SMS' : '📞 Voice Call'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Send Code Button */}
                  <button
                    type="button"
                    onClick={sendOTP}
                    disabled={isLoading || !phoneNumber.trim() || sendCooldown > 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d71927] py-3 text-sm font-black text-white shadow-lg shadow-[#d71927]/30 transition hover:bg-[#b91420] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block animate-spin">⏳</span>
                        Sending...
                      </>
                    ) : sendCooldown > 0 ? (
                      <>
                        <Clock size={16} />
                        Resend in {sendCooldown}s
                      </>
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Already verified link */}
                <div className="mt-6 text-center text-sm">
                  <p className="text-white/60">
                    Having trouble?{' '}
                    <Link
                      href="/support"
                      className="font-black text-[#ff737b] hover:text-[#ff4b55]"
                    >
                      Contact support
                    </Link>
                  </p>
                </div>
              </>
            )}

            {/* OTP Input Step */}
            {step === 'otp-input' && (
              <>
                <div className="mb-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <ShieldCheck className="h-12 w-12 text-[#ff737b]" />
                  </div>
                  <h1 className="text-3xl font-black">Enter verification code</h1>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    We sent a 6-digit code to <span className="font-bold text-white">{maskedPhoneNumber}</span>
                  </p>
                </div>

                <form className="space-y-5">
                  {/* Error Message */}
                  {(hasError || error) && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                      <p className="text-sm text-red-400">{error || 'Invalid or expired OTP. Please try again.'}</p>
                    </div>
                  )}

                  {/* Expiry Warning */}
                  {countdown === 0 && expiresIn === 0 && (
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                      <p className="text-sm text-yellow-400">Code expired. Please request a new one.</p>
                    </div>
                  )}

                  {/* OTP Input */}
                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span>Verification Code</span>
                      <span className="text-xs font-normal text-white/60">5-6 digits</span>
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
                        size={16}
                      />
                      <input
                        type="text"
                        onChange={handleOTPInput}
                        onKeyPress={handleOTPKeyPress}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        disabled={countdown === 0 && expiresIn === 0}
                        value={otp}
                        className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-10 pr-4 text-center text-2xl font-black tracking-[0.35em] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#ff4b55] disabled:opacity-60"
                      />
                    </div>
                    {fieldErrors.otp && (
                      <p className="mt-1 text-xs text-red-400">{fieldErrors.otp[0]}</p>
                    )}
                  </div>

                  {/* Verification Status */}
                  {otp.length >= 5 && !hasError && !error && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-400">
                      <BadgeCheck size={14} />
                      Code ready to verify
                    </div>
                  )}

                  {/* Verify Button */}
                  <button
                    type="button"
                    onClick={verifyOTP}
                    disabled={isLoading || otp.length < 5 || (countdown === 0 && expiresIn === 0)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d71927] py-3 text-sm font-black text-white shadow-lg shadow-[#d71927]/30 transition hover:bg-[#b91420] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block animate-spin">⏳</span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Code
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Resend Section */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="mb-3 text-center text-sm text-white/70">Didn't receive the code?</p>

                  <button
                    type="button"
                    onClick={resetToPhoneInput}
                    disabled={isLoading}
                    className="w-full rounded-xl border-2 border-white/20 py-3 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCcw size={16} className="inline mr-2" />
                    Use different method
                  </button>

                  <p className="mt-3 text-center text-xs text-white/50">
                    Check your spam folder if you don't see the SMS
                  </p>
                </div>
              </>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <>
                <div className="mb-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-green-500/20 p-3">
                      <CheckCircle className="h-12 w-12 text-green-400" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-black">Verified!</h1>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Your phone number has been successfully verified.
                  </p>
                </div>

                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <p className="text-sm text-white">
                    <BadgeCheck size={14} className="inline mr-2 text-green-400" />
                    <span className="font-bold">{maskedPhoneNumber}</span> is verified
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/60">
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Redirecting you to your dashboard...</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
