'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  Phone,
  ReceiptText,
  ShieldCheck,
  Wallet,
  Wifi,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { PINVerificationModal } from '@/components/shared/PINVerificationModal';
import { RecipientSelector } from '@/components/vtu';
import { paymentService } from '@/services/payment.service';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency } from '@/utils/format.utils';

interface FormData {
  provider: string;
  providerName: string;
  variation?: string;
  variationCode?: string;
  variationName?: string;
  variationAmount?: string;
  subsidizedAmount?: string;
  savings?: number;
}

type TransactionStatus = 'idle' | 'processing' | 'success' | 'error';
type PaymentMethod = 'wallet' | 'card' | 'bank_transfer';

export default function DataReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { pinStatus } = useAuthStore();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [showPINModal, setShowPINModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user has PIN set
  const hasPIN = !!(pinStatus?.has_pin);

  useEffect(() => {
    const savedData =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('dataFormData')
        : null;

    if (!savedData) {
      router.push('/dashboard/data');
      return;
    }

    try {
      setFormData(JSON.parse(savedData) as FormData);
    } catch {
      router.push('/dashboard/data');
    }
  }, [router]);

  const amount = useMemo(
    () => Number(formData?.variationAmount || 0),
    [formData]
  );

  const handleBack = () => {
    router.push('/dashboard/data');
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value.replace(/\s/g, ''));
    setPhoneError('');
  };

  const validatePhoneNumber = (): boolean => {
    const phone = phoneNumber.replace(/\s/g, '');

    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }

    if (!/^0[789]\d{9}$/.test(phone)) {
      setPhoneError('Please enter a valid Nigerian phone number');
      return false;
    }

    setPhoneError('');
    return true;
  };

  const handleConfirmPayment = () => {
    if (!formData || isProcessing || transactionStatus === 'success') return;

    if (!validatePhoneNumber()) return;

    setShowPINModal(true);
  };

  const handleVerifyPIN = async (pin: string) => {
    if (!formData || !user || !pin) return;

    setIsProcessing(true);
    setTransactionStatus('processing');

    try {
      // Process data transaction with PIN included
      console.log('[DataReview] Processing data transaction with PIN...');

      const dataPayload = {
        service_id: formData.provider,
        variation_code: formData.variationCode,
        amount,
        phone_number: phoneNumber.replace(/\s/g, ''),
        user_id: user.id?.toString(),
        payment_method: paymentMethod as 'wallet' | 'card' | 'mobile_money',
        pin, // Include PIN directly with request
      };

      const response = await paymentService.purchaseData(dataPayload);
      console.log('[DataReview] Transaction response:', response);

      // API client returns the backend response directly (not wrapped in data property)
      const responseData = response as any;
      if (responseData?.success && (responseData?.status === 'success' || responseData?.status === 'completed')) {
        // Use backend-generated request_id from response
        setTransactionId(responseData?.request_id || responseData?.vtu_reference || responseData?.reference);
        setTransactionStatus('success');
        setShowPINModal(false);
        sessionStorage.removeItem('dataFormData');

        addToast({
          message: 'Data purchased successfully!',
          type: 'success',
        });

        setTimeout(() => {
          router.push('/dashboard/history');
        }, 2500);

        return;
      }

      setShowPINModal(false);
      setTransactionStatus('error');

      if (responseData?.error_code === 'INSUFFICIENT_USER_BALANCE') {
        addToast({
          message: `Insufficient wallet balance. You need ₦${responseData?.required_amount}, but your balance is ₦${responseData?.current_balance}. Please top up your wallet and try again.`,
          type: 'error',
        });

        return;
      }

      addToast({
        message: responseData?.message || 'Transaction failed. Please try again.',
        type: 'error',
      });
      setErrorMessage(responseData?.message || 'Please review your wallet balance or try again.');
    } catch (error: any) {
      console.error('[DataReview] Error:', error);
      setShowPINModal(false);
      setTransactionStatus('error');
      setIsProcessing(false);

      // Check if there's an originalMessage from backend (idempotency errors)
      if (error.originalMessage) {
        setErrorMessage(error.originalMessage);
        addToast({
          message: error.originalMessage,
          type: 'error',
        });
        return;
      }

      // Handle PIN verification errors
      if (error.code === 'INVALID_PIN') {
        const remaining = error.data?.remaining_attempts;
        const pinErrorMsg = remaining === 0
          ? 'Your PIN is now locked for 30 minutes due to too many failed attempts.'
          : `Invalid PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`;
        setErrorMessage(pinErrorMsg);
        addToast({
          message: pinErrorMsg,
          type: 'error',
        });
        return;
      }

      if (error.code === 'PIN_LOCKED') {
        const lockMsg = `Your PIN is temporarily locked. Try again in ${Math.ceil(
          error.data?.remaining_seconds / 60
        )} minutes.`;
        setErrorMessage(lockMsg);
        addToast({
          message: lockMsg,
          type: 'error',
        });
        return;
      }

      if (error.code === 'PIN_NOT_SET') {
        setErrorMessage('Please set your PIN in settings before making payments.');
        addToast({
          message: 'Please set your PIN in settings before making payments.',
          type: 'error',
        });
        return;
      }

      const errorMsg = error.message || 'Transaction failed. Please try again.';
      setErrorMessage(errorMsg);
      addToast({
        message: errorMsg,
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFE5EB]">
            <Loader2 className="animate-spin text-[#d71927]" size={28} />
          </div>
          <p className="text-sm font-bold text-gray-900">Loading review...</p>
          <p className="mt-1 text-xs text-gray-600">
            Preparing your data purchase summary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>


      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d71927] bg-white text-sm font-extrabold text-[#d71927]">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Select Provider & Plan
                    </p>
                    <p className="text-xs text-gray-600">
                      Completed successfully.
                    </p>
                  </div>
                </div>

                <div className="hidden h-[2px] flex-1 bg-[#d71927] sm:block" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Confirm & Pay
                    </p>
                    <p className="text-xs text-gray-600">
                      Authorize transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Service Details
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Network Provider
                  </p>
                  <p className="mt-2 text-base font-extrabold text-gray-900">
                    {formData.providerName}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Plan Code
                  </p>
                  <p className="mt-2 text-base font-extrabold text-gray-900">
                    {formData.variationCode}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Data Plan
                  </p>
                  <p className="mt-2 text-base font-extrabold leading-7 text-gray-900">
                    {formData.variationName}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#FFE5EB]  px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {formData.subsidizedAmount ? 'Discounted Amount' : 'Total Amount'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    {formData.subsidizedAmount
                      ? 'Subsidy discount has been applied to this plan.'
                      : 'This is the final amount that will be deducted.'}
                  </p>
                  {formData.subsidizedAmount && formData.savings && formData.savings > 0 && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      💰 You save ₦{formData.savings.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-3xl font-extrabold tracking-tight text-green-600">
                    {formatCurrency(Number(formData.subsidizedAmount || amount))}
                  </p>
                  {formData.subsidizedAmount && (
                    <p className="mt-1 text-sm font-medium text-gray-400 line-through">
                      {formatCurrency(amount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Recipient Details
            </h2>

            <div className="mt-6">
              <RecipientSelector
                value={phoneNumber}
                onChange={(value) => {
                  handlePhoneChange(value);
                  setPhoneError('');
                }}
                label="Recipient Phone Number"
                placeholder="Enter or select a phone number"
                error={phoneError}
                transactionType="data"
                serviceIdentifier={formData.provider || 'mtn'}
                showQuickSelect={true}
                showManager={true}
                credentialType="phone"
              />
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Payment Method
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  value: 'wallet',
                  label: 'Remopay',
                  description:
                    'Recommended. Fastest option for instant checkout.',
                  icon: Wallet,
                  disabled: false,
                },
                {
                  value: 'card',
                  label: 'Card / Bank Payment',
                  description:
                    'Additional payment options will be available soon.',
                  icon: CreditCard,
                  disabled: true,
                },
              ].map((method) => {
                const Icon = method.icon;
                const active = paymentMethod === method.value;

                return (
                  <button
                    key={method.value}
                    type="button"
                    disabled={method.disabled || isProcessing}
                    onClick={() =>
                      !method.disabled &&
                      setPaymentMethod(method.value as PaymentMethod)
                    }
                    className={`flex w-full items-start justify-between rounded-2xl border p-5 text-left transition-all ${
                      method.disabled
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                        : active
                          ? 'border-[#d71927] bg-[#FFE5EB] shadow-sm shadow-red-200'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-2xl p-3 ${
                          active ? 'bg-[#d71927]' : 'bg-[#FFE5EB]'
                        }`}
                      >
                        <Icon
                          className={active ? 'text-white' : 'text-[#d71927]'}
                          size={22}
                        />
                      </div>

                      <div>
                        <p className="text-base font-extrabold text-gray-900">
                          {method.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {method.description}
                        </p>

                        {method.disabled && (
                          <span className="mt-3 inline-flex rounded-full bg-[#FFE5EB] px-3 py-1 text-xs font-bold text-[#d71927]">
                            Coming soon
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        active
                          ? 'border-[#d71927] bg-[#d71927]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {active && <CheckCircle2 className="text-white" size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <aside>
          <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:sticky xl:top-8">
            <h3 className="text-xl font-extrabold tracking-tight text-gray-900">
              Order Summary
            </h3>

            <div className="mt-5 space-y-4 border-b border-gray-100 pb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Provider</span>
                <span className="font-bold text-gray-900">
                  {formData.providerName.split(' ')[0]}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="max-w-[210px] text-right font-bold leading-6 text-gray-900">
                  {formData.variationName}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Recipient</span>
                <span className="font-bold text-gray-900">
                  {phoneNumber || 'Not entered'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>

            <div className="my-6 flex items-center justify-between rounded-2xl bg-[#FFE5EB] px-5 py-4">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#d71927]">
                {formatCurrency(amount)}
              </span>
            </div>

            {transactionStatus === 'success' && (
              <div className="mb-6 rounded-[24px] border border-green-200 bg-green-50 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 text-green-600" size={28} />
                <p className="text-sm font-extrabold text-green-900">
                  Transaction Successful
                </p>
                <p className="mt-1 break-all text-xs text-green-700">
                  ID: {transactionId}
                </p>
              </div>
            )}

            {transactionStatus === 'error' && (
              <div className="mb-6 rounded-[24px] border border-[#FFE5EB] bg-[#FFF0F3] p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 text-[#d71927]" size={22} />
                  <div>
                    <p className="text-sm font-extrabold text-[#7F2434]">
                      Transaction failed
                    </p>
                    {errorMessage && (
                      <p className="mt-1 text-xs leading-5 text-[#a13150]">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {transactionStatus !== 'success' && (
              <>
                {!hasPIN && (
                  <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 text-amber-600" size={22} />
                      <div className="flex-1">
                        <p className="text-sm font-extrabold text-amber-900">
                          Set up your Transaction PIN
                        </p>
                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          You'll need a PIN to complete this payment. Set one up now for secure transactions.
                        </p>
                        <button
                          onClick={() => router.push('/dashboard/settings/pin')}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-200"
                        >
                          Set PIN Now
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  fullWidth
                  onClick={handleConfirmPayment}
                  disabled={isProcessing || !hasPIN}
                  className="mb-3 h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b80a1f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} />
                      Processing Payment...
                    </span>
                  ) : !hasPIN ? (
                    'PIN Required to Pay'
                  ) : (
                    'Confirm & Pay'
                  )}
                </Button>
              </>
            )}

            <Button
              variant="secondary"
              fullWidth
              onClick={handleBack}
              disabled={isProcessing}
              className="h-12 rounded-2xl font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? 'Processing...' : 'Cancel'}
            </Button>

            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-gray-600">
                <Lock size={13} />
                Secured by Remopay transaction protection
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-gray-600">
              <ShieldCheck size={14} className="text-[#d71927]" />
              PIN verification required
            </div>
          </Card>
        </aside>
      </div>

      <PINVerificationModal
        isOpen={showPINModal}
        onClose={() => !isProcessing && setShowPINModal(false)}
        onVerify={handleVerifyPIN}
        isLoading={isProcessing}
        title="Verify Transaction"
        description="Enter your 4-digit PIN to complete this data purchase"
      />

      <Toast />
    </div>
  );
}
