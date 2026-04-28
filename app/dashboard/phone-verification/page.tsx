'use client';

import { useState } from 'react';
import { Phone, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { authService } from '@/services/auth.service';

export default function PhoneVerificationPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.requestPhoneVerification({ phone });
      setStep('otp');
      setTimer(600); // 10 minutes
      const interval = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) clearInterval(interval);
          return Math.max(0, t - 1);
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('OTP is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.verifyPhone({ phone, code: otp });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Verify Phone Number</h1>
        <p className="mt-2 text-gray-600">Complete verification to unlock rewards</p>
      </div>

      {step === 'phone' && (
        <Card className="mt-8">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto mb-6">
            <Phone className="h-8 w-8 text-[#4a5ff7]" />
          </div>

          <p className="text-center text-gray-600 mb-6">
            We'll send a verification code to your phone number
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="+234 XXX XXXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button
              onClick={handleSendOtp}
              disabled={loading || !phone.trim()}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </div>
        </Card>
      )}

      {step === 'otp' && (
        <Card className="mt-8">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mx-auto mb-6">
            <Clock className="h-8 w-8 text-purple-600" />
          </div>

          <p className="text-center text-gray-600 mb-2">
            Verification code sent to <span className="font-semibold">{phone}</span>
          </p>

          <p className="text-center text-sm text-gray-500 mb-6">
            {timer > 0 ? `Code expires in ${formatTime(timer)}` : 'Code expired'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Enter Verification Code
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                disabled={loading}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <Button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
              variant="secondary"
              className="w-full"
              disabled={loading}
            >
              Change Phone Number
            </Button>
          </div>
        </Card>
      )}

      {step === 'success' && (
        <Card className="mt-8">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-center text-xl font-bold text-gray-900 mb-2">
            Phone Verified!
          </h2>

          <p className="text-center text-gray-600 mb-6">
            Your phone number has been successfully verified. You can now earn rewards through referrals.
          </p>

          <Button onClick={() => window.location.href = '/dashboard/referral/milestones'} className="w-full">
            View Referral Milestones
          </Button>
        </Card>
      )}
    </div>
  );
}
