'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Loader2,
  Lock,
  ReceiptText,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { PINVerificationModal } from '@/components/shared/PINVerificationModal';
import { paymentService } from '@/services/payment.service';
import { pinService } from '@/services/pin.service';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency } from '@/utils/format.utils';

interface FormData {
  provider: string;
  providerName: string;
  phone: string;
  amount: string;
}

type TransactionStatus = 'idle' | 'processing' | 'success' | 'error';
type PaymentMethod = 'wallet' | 'card' | 'bank_transfer';

export default function AirtimeReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [showPINModal, setShowPINModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('idle');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const savedData = sessionStorage.getItem('airtimeFormData');

    if (!savedData) {
      router.push('/dashboard/airtime');
      return;
    }

    try {
      setFormData(JSON.parse(savedData) as FormData);
    } catch {
      router.push('/dashboard/airtime');
    }
  }, [router]);

  const amount = useMemo(() => Number(formData?.amount || 0), [formData]);
  const convenienceFee = useMemo(() => Math.ceil(amount * 0.0), [amount]);
  const totalAmount = amount + convenienceFee;

  const handleBack = () => {
    router.push('/dashboard/airtime');
  };

  const handleConfirmPayment = () => {
    if (!formData || isProcessing || transactionStatus === 'success') return;
    setShowPINModal(true);
  };

  const handleVerifyPIN = async (pin: string) => {
    if (!formData || !user || !pin) return;

    setIsProcessing(true);
    setTransactionStatus('processing');

    try {
      // Process airtime transaction with PIN
      console.log('[AirtimeReview] Processing airtime transaction with PIN...');

      const airtimePayload = {
        provider: formData.provider,
        phone_number: formData.phone.replace(/\s/g, ''),
        amount: parseInt(formData.amount, 10),
        user_id: user.id?.toString(),
        payment_method: paymentMethod as 'wallet' | 'card' | 'mobile_money',
        pin, // Include PIN directly with payment request
      };

      const response = await paymentService.purchaseAirtime(airtimePayload);
      console.log('[AirtimeReview] Transaction response:', response);

      // API client returns the backend response directly (not wrapped in data property)
      const responseData = response as any;
      if (responseData?.success && responseData?.status === 'completed') {
        // Use backend-generated request_id from response
        setTransactionId(responseData?.request_id || responseData?.vtu_reference || responseData?.reference);
        setTransactionStatus('success');
        setShowPINModal(false);
        sessionStorage.removeItem('airtimeFormData');

        addToast({
          message: 'Airtime purchased successfully!',
          type: 'success',
        });

        setTimeout(() => {
          router.push('/dashboard/history');
        }, 2500);

        return;
      }

      // Handle error response
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
    } catch (error: any) {
      console.error('[AirtimeReview] Error:', error);
      setShowPINModal(false);
      setTransactionStatus('error');
      setIsProcessing(false);

      // Handle PIN verification errors
      if (error.code === 'INVALID_PIN') {
        const remaining = error.data?.remaining_attempts;
        if (remaining === 0) {
          addToast({
            message: 'Your PIN is now locked for 30 minutes due to too many failed attempts.',
            type: 'error',
          });
        } else {
          addToast({
            message: `Invalid PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
            type: 'error',
          });
        }
        return;
      }

      if (error.code === 'PIN_LOCKED') {
        addToast({
          message: `Your PIN is temporarily locked. Try again in ${Math.ceil(
            error.data?.remaining_seconds / 60
          )} minutes.`,
          type: 'error',
        });
        return;
      }

      if (error.code === 'PIN_NOT_SET') {
        addToast({
          message: 'Please set your PIN in settings before making payments.',
          type: 'error',
        });
        return;
      }

      addToast({
        message: error.message || 'Transaction failed. Please try again.',
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50">
            <Loader2 className="animate-spin text-[#d71927]" size={28} />
          </div>
          <p className="text-sm font-bold text-gray-900">Loading review...</p>
          <p className="mt-1 text-xs text-gray-600">
            Preparing your transaction summary.
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
                      Select Provider & Amount
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
                {[
                  ['Network Provider', formData.providerName],
                  ['Phone Number', formData.phone],
                  ['Airtime Amount', formatCurrency(amount)],
                  ['Convenience Fee', formatCurrency(convenienceFee)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      {label}
                    </p>
                    <p className="mt-2 text-base font-extrabold text-gray-900">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-200  px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Total Amount
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    This is the final amount that will be deducted.
                  </p>
                </div>

                <p className="text-3xl font-extrabold tracking-tight text-[#d71927]">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
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
                  label: 'Remopay Wallet',
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
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
                        : active
                          ? 'border-[#d71927]  shadow-sm shadow-red-200'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-2xl p-3 ${
                          active ? 'bg-[#d71927]' : 'bg-red-50'
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
                          <span className="mt-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#d71927]">
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
              {[
                ['Provider', formData.providerName.split(' ')[0]],
                ['Phone', formData.phone],
                ['Amount', formatCurrency(amount)],
                ['Fee', formatCurrency(convenienceFee)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600">{label}</span>
                  <span className="font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>

            <div className="my-6 flex items-center justify-between rounded-2xl bg-red-50 px-5 py-4">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#d71927]">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {transactionStatus === 'success' && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
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
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 text-red-600" size={22} />
                  <div>
                    <p className="text-sm font-extrabold text-red-900">
                      Transaction failed
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700">
                      Please review your wallet balance or try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {transactionStatus !== 'success' && (
              <Button
                fullWidth
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="mb-3 h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Processing Payment...
                  </span>
                ) : (
                  'Confirm & Pay'
                )}
              </Button>
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
        description="Enter your 4-digit PIN to complete this purchase"
      />

      <Toast />
    </div>
  );
}