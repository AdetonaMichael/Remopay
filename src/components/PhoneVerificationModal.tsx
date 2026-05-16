'use client';

import { useEffect } from 'react';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { CheckCircle2, Phone, AlertCircle, Loader2 } from 'lucide-react';

/**
 * PhoneVerificationModal Component
 * 
 * Displays phone verification UI with three steps:
 * 1. Phone input - user enters phone number and selects SMS/Call
 * 2. OTP input - user enters 5-6 digit code with countdown timer
 * 3. Success - confirmation of verified phone number
 * 
 * This is a modal overlay that prevents user interaction outside of it.
 */
export function PhoneVerificationModal({ onVerified }: { onVerified?: () => void }) {
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
    isExpired,
    maskedPhoneNumber,
    isPhoneVerified,
    sendOTP,
    verifyOTP,
    resetToPhoneInput,
    formatTimeRemaining,
  } = usePhoneVerification(onVerified);

  // Auto-focus on phone input when component mounts
  useEffect(() => {
    const phoneInput = document.getElementById('phone-number-input');
    if (phoneInput) {
      (phoneInput as HTMLInputElement).focus();
    }
  }, []);

  // Auto-focus on OTP input when step changes to otp-input
  useEffect(() => {
    if (step === 'otp-input') {
      const otpInput = document.getElementById('otp-input');
      if (otpInput) {
        (otpInput as HTMLInputElement).focus();
      }
    }
  }, [step]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Prevent closing modal with Escape key
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && step !== 'success') {
        // Only prevent Escape during phone/OTP input, allow it after success
        event.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [step]);

  const handlePhoneKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendOTP();
    }
  };

  const handleOtpKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyOTP();
    }
  };

  // Limit OTP input to numeric only and max 6 characters
  const handleOtpChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setOtp(numericValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-lg p-8 animate-in pointer-events-auto">
        {/* Verification Required Banner */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold">Phone Verification Required</p>
            <p className="text-xs mt-1 opacity-90">You must verify your phone number to continue using RemoPay</p>
          </div>
        </div>
        {/* Phone Input Step */}
        {step === 'phone-input' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Phone Number</h2>
              <p className="text-gray-600 mt-2 text-sm">
                We need to verify your phone number to complete your account setup
              </p>
            </div>

            <div className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Phone Number Input */}
              <div>
                <label htmlFor="phone-number-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone-number-input"
                  type="tel"
                  placeholder="+234 810 230 0935 or 08102300935"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handlePhoneKeyPress}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {fieldErrors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.phone_number[0]}</p>
                )}
              </div>

              {/* Verification Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Receive code via
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['sms', 'call'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setVerificationMethod(method as 'sms' | 'call')}
                      disabled={isLoading}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${
                        verificationMethod === method
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {method === 'sms' ? '📱 SMS' : '📞 Voice Call'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                onClick={sendOTP}
                disabled={isLoading || !phoneNumber.trim()}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                Send Verification Code
              </button>
            </div>
          </div>
        )}

        {/* OTP Input Step */}
        {step === 'otp-input' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Enter Verification Code</h2>
              <p className="text-gray-600 mt-2 text-sm">
                We sent a verification code to<br />
                <span className="font-medium text-gray-900">{maskedPhoneNumber}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Expiry Warning */}
              {isExpired && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Code expired</p>
                    <p>Request a new verification code</p>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700">
                    Verification Code
                  </label>
                  {!isExpired && expiresIn > 0 && (
                    <span className="text-xs text-gray-500">
                      Expires in {formatTimeRemaining()}
                    </span>
                  )}
                </div>
                <input
                  id="otp-input"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  onKeyPress={handleOtpKeyPress}
                  disabled={isLoading || isExpired}
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
                {fieldErrors.otp && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.otp[0]}</p>
                )}
              </div>

              {/* Verify Button */}
              <button
                onClick={verifyOTP}
                disabled={isLoading || !otp.trim() || otp.length < 5 || isExpired}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                Verify Code
              </button>

              {/* Change Method Link */}
              <button
                onClick={resetToPhoneInput}
                disabled={isLoading}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use a different method?
              </button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full animate-pulse">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verified!</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Your phone number has been successfully verified
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{maskedPhoneNumber}</span> is verified
                </p>
              </div>
              <div className="text-xs text-gray-600 ml-7">
                {isPhoneVerified && 'Account unlocked - Full access enabled'}
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 py-4 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Redirecting you to your dashboard...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
