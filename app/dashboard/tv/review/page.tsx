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
  Tv,
  Wallet,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { PINVerificationModal } from '@/components/shared/PINVerificationModal';
import { vtuService } from '@/services/vtu.service';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency } from '@/utils/format.utils';

interface TVFormData {
  provider: string;
  providerName: string;
  variation?: string;
  variationCode?: string;
  variationName?: string;
  variationAmount?: string;
  smartcard?: string;
}

type TransactionStatus =
  | 'idle'
  | 'verifying'
  | 'verified'
  | 'processing'
  | 'success'
  | 'error';

type PaymentMethod = 'wallet' | 'card' | 'bank_transfer';

export default function TVReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState<TVFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [showPINModal, setShowPINModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verifiedCustomer, setVerifiedCustomer] = useState<{
    name?: string;
    number?: string;
  } | null>(null);

  const amount = useMemo(
    () => Number(formData?.variationAmount || 0),
    [formData]
  );

  useEffect(() => {
    const stored =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('tvFormData')
        : null;

    if (!stored) {
      router.push('/dashboard/tv');
      return;
    }

    try {
      const data = JSON.parse(stored) as TVFormData;
      setFormData(data);
      verifySmartcard(data.smartcard || '', data.provider);
    } catch {
      router.push('/dashboard/tv');
    }
  }, [router]);

  const verifySmartcard = async (smartcardNumber: string, provider: string) => {
    try {
      setTransactionStatus('verifying');
      setVerificationError('');

      const response = await vtuService.verifySmartcard(
        smartcardNumber,
        provider
      );

      if (response?.content?.WrongBillersCode || response?.WrongBillersCode) {
        setVerificationError(
          response?.content?.error ||
            'The smartcard number appears to be invalid. Please verify and try again.'
        );
        setTransactionStatus('error');
        return;
      }

      setVerifiedCustomer({
        name:
          response?.content?.Customer_Name ||
          response?.Customer_Name ||
          'Customer',
        number: smartcardNumber,
      });

      setTransactionStatus('verified');
    } catch {
      setTransactionStatus('error');
      setVerificationError(
        'Failed to verify smartcard. Please check and try again.'
      );
    }
  };

  const handleBack = () => {
    router.push('/dashboard/tv');
  };

  const handlePaymentProcess = async () => {
    if (!user || !formData) {
      addToast({
        message: 'Session expired. Please start over.',
        type: 'error',
      });
      router.push('/dashboard/tv');
      return;
    }

    if (transactionStatus !== 'verified') {
      addToast({
        message: 'Please verify your smartcard before proceeding.',
        type: 'error',
      });
      return;
    }

    if (paymentMethod === 'wallet') {
      setShowPINModal(true);
      return;
    }

    await handlePINConfirm('');
  };

  const handlePINConfirm = async (pin: string) => {
    if (!user || !formData) return;

    try {
      setIsProcessing(true);
      setTransactionStatus('processing');

      const requestId = uuidv4();

      const paymentData = {
        amount: formData.variationAmount || '0',
        billersCode: formData.smartcard || '',
        email: user.email || '',
        phone: user.phone_number || '',
        request_id: requestId,
        serviceID: formData.provider,
        variation_code: formData.variationCode,
        user_id: user.id || 0,
        pin,
      };

      const response = await vtuService.processPayment(paymentData);

      if (response?.status === 'success' || response?.message === 'successful') {
        setTransactionId(requestId);
        setTransactionStatus('success');
        setShowPINModal(false);

        sessionStorage.removeItem('tvFormData');

        addToast({
          message: 'TV subscription successful!',
          type: 'success',
        });

        setTimeout(() => {
          router.push(`/dashboard/tv-history?id=${requestId}`);
        }, 2500);

        return;
      }

      setTransactionStatus('error');
      addToast({
        message:
          response?.message ||
          'Payment failed. Please try again or use a different payment method.',
        type: 'error',
      });
    } catch {
      setTransactionStatus('error');
      addToast({
        message: 'An error occurred during payment. Please try again.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
      setShowPINModal(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EEF2FF]">
            <Loader2 className="animate-spin text-[#4A5FF7]" size={28} />
          </div>
          <p className="text-sm font-bold text-gray-900">Loading review...</p>
          <p className="mt-1 text-xs text-gray-600">
            Preparing your TV subscription summary.
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4A5FF7] bg-white text-sm font-extrabold text-[#4A5FF7]">
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

                <div className="hidden h-[2px] flex-1 bg-[#4A5FF7] sm:block" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4A5FF7] text-sm font-extrabold text-white">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Verify & Pay
                    </p>
                    <p className="text-xs text-gray-600">
                      Confirm customer and authorize payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Subscription Details
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    TV Provider
                  </p>
                  <p className="mt-2 text-base font-extrabold text-gray-900">
                    {formData.providerName}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Smartcard / IUC
                  </p>
                  <p className="mt-2 text-base font-extrabold text-gray-900">
                    {formData.smartcard}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                    Subscription Plan
                  </p>
                  <p className="mt-2 text-base font-extrabold leading-7 text-gray-900">
                    {formData.variationName}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-[#DCE3FF] bg-[#EEF2FF] px-5 py-5">
                {transactionStatus === 'verifying' && (
                  <div className="flex items-center gap-3">
                    <Loader2
                      className="animate-spin text-[#4A5FF7]"
                      size={22}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Verifying smartcard...
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Please wait while we confirm the customer details.
                      </p>
                    </div>
                  </div>
                )}

                {transactionStatus === 'verified' && verifiedCustomer && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 text-green-600" size={24} />
                    <div>
                      <p className="text-sm font-bold text-green-900">
                        Smartcard Verified
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Customer:{' '}
                        <span className="font-bold text-gray-900">
                          {verifiedCustomer.name}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {transactionStatus === 'error' && verificationError && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 text-red-600" size={24} />
                    <div>
                      <p className="text-sm font-bold text-red-900">
                        Verification Failed
                      </p>
                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {verificationError}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#DCE3FF] bg-[#EEF2FF] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Total Amount
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    This is the final amount that will be deducted.
                  </p>
                </div>

                <p className="text-3xl font-extrabold tracking-tight text-[#4A5FF7]">
                  {formatCurrency(amount)}
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
                    'Recommended. Fastest option for secure checkout.',
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
                          ? 'border-[#4A5FF7] bg-[#EEF2FF] shadow-sm shadow-blue-200'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-2xl p-3 ${
                          active ? 'bg-[#4A5FF7]' : 'bg-[#EEF2FF]'
                        }`}
                      >
                        <Icon
                          className={active ? 'text-white' : 'text-[#4A5FF7]'}
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
                          <span className="mt-3 inline-flex rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-bold text-[#4A5FF7]">
                            Coming soon
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        active
                          ? 'border-[#4A5FF7] bg-[#4A5FF7]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {active && (
                        <CheckCircle2 className="text-white" size={14} />
                      )}
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
                  {formData.providerName}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="max-w-[210px] text-right font-bold leading-6 text-gray-900">
                  {formData.variationName}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Smartcard</span>
                <span className="font-bold text-gray-900">
                  {formData.smartcard}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Customer</span>
                <span className="max-w-[180px] truncate text-right font-bold text-gray-900">
                  {verifiedCustomer?.name || 'Pending'}
                </span>
              </div>
            </div>

            <div className="my-6 flex items-center justify-between rounded-2xl bg-[#EEF2FF] px-5 py-4">
              <span className="text-base font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#4A5FF7]">
                {formatCurrency(amount)}
              </span>
            </div>

            {transactionStatus === 'success' && (
              <div className="mb-6 rounded-[24px] border border-green-200 bg-green-50 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 text-green-600" size={28} />
                <p className="text-sm font-extrabold text-green-900">
                  Subscription Successful
                </p>
                <p className="mt-1 break-all text-xs text-green-700">
                  ID: {transactionId}
                </p>
              </div>
            )}

            {transactionStatus === 'error' && !verificationError && (
              <div className="mb-6 rounded-[24px] border border-[#DCE3FF] bg-[#EEF2FF] p-5">
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
                onClick={handlePaymentProcess}
                disabled={
                  isProcessing ||
                  transactionStatus === 'verifying' ||
                  transactionStatus !== 'verified'
                }
                className="mb-3 h-13 rounded-2xl bg-[#4A5FF7] text-base font-bold text-white shadow-sm shadow-blue-300 hover:bg-[#3A4FE7] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing || transactionStatus === 'processing' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Processing Payment...
                  </span>
                ) : transactionStatus === 'verifying' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Verifying Smartcard...
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
              <ShieldCheck size={14} className="text-[#4A5FF7]" />
              PIN verification required
            </div>
          </Card>
        </aside>
      </div>

      <PINVerificationModal
        isOpen={showPINModal}
        onClose={() => !isProcessing && setShowPINModal(false)}
        onVerify={handlePINConfirm}
        isLoading={isProcessing}
        title="Verify Transaction"
        description="Enter your 4-digit PIN to complete this TV subscription"
      />

      <Toast />
    </div>
  );
}
