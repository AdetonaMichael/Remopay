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
  Phone,
  ReceiptText,
  ShieldCheck,
  Wallet,
  Wifi,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { PINVerificationModal } from '@/components/shared/PINVerificationModal';
import { paymentService } from '@/services/payment.service';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency } from '@/utils/format.utils';

interface FormData {
  provider: string;
  providerName: string;
  variation?: string;
  variationCode?: string;
  variationName?: string;
  variationAmount?: string;
}

type TransactionStatus = 'idle' | 'processing' | 'success' | 'error';
type PaymentMethod = 'wallet' | 'card' | 'bank_transfer';

export default function DataReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    let phone = value.replace(/\D/g, '').slice(0, 11);

    if (phone.length > 7) {
      phone = `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
    } else if (phone.length > 3) {
      phone = `${phone.slice(0, 3)} ${phone.slice(3)}`;
    }

    setPhoneNumber(phone);
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
      const now = new Date();
      const requestId = `${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, '0')}${String(now.getDate()).padStart(
        2,
        '0'
      )}${Date.now()}${uuidv4().slice(0, 8)}`;

      const dataPayload = {
        service_id: formData.provider,
        variation_code: formData.variationCode,
        amount,
        phone_number: phoneNumber.replace(/\s/g, ''),
        user_id: user.id?.toString(),
        payment_method: paymentMethod as 'wallet' | 'card' | 'mobile_money',
        request_id: requestId,
      };

      const response = await paymentService.purchaseData(dataPayload);

      if (response.success && response.data) {
        const confirmResponse = await paymentService.confirmDataPurchase(
          requestId,
          { pin, request_id: requestId }
        );

        if (confirmResponse.success) {
          setTransactionId(confirmResponse.data?.id || requestId);
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

        setTransactionStatus('error');
        addToast({
          message:
            confirmResponse.message ||
            'PIN verification failed. Please try again.',
          type: 'error',
        });

        return;
      }

      setShowPINModal(false);
      setTransactionStatus('error');

      if (response.error_code === 'INSUFFICIENT_USER_BALANCE') {
        const balanceData = response.data as any;

        addToast({
          message: `Insufficient wallet balance. You need ₦${balanceData?.required_amount}, but your balance is ₦${balanceData?.current_balance}. Please top up your wallet and try again.`,
          type: 'error',
        });

        return;
      }

      addToast({
        message: response.message || 'Transaction failed. Please try again.',
        type: 'error',
      });
    } catch (error: any) {
      if (error?.isDuplicateError) {
        addToast({
          message:
            'This data purchase has already been processed. Please check your history.',
          type: 'info',
        });
      } else if (error?.isIdempotencyError) {
        addToast({
          message: 'Payment system error. Please try again.',
          type: 'error',
        });
      } else {
        addToast({
          message:
            error?.response?.data?.message ||
            error?.message ||
            'Failed to process payment. Please try again.',
          type: 'error',
        });
      }

      setTransactionStatus('error');
    } finally {
      setIsProcessing(false);
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

              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#DCE3FF]  px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
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
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Recipient Details
            </h2>

            <div className="mt-6">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="080 1234 5678"
                value={phoneNumber}
                onChange={(event) => handlePhoneChange(event.target.value)}
                onBlur={validatePhoneNumber}
                error={phoneError}
                helperText="Enter the Nigerian number that should receive the data bundle."
                icon={<Phone size={18} />}
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
                  Transaction Successful
                </p>
                <p className="mt-1 break-all text-xs text-green-700">
                  ID: {transactionId}
                </p>
              </div>
            )}

            {transactionStatus === 'error' && (
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
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="mb-3 h-13 rounded-2xl bg-[#4A5FF7] text-base font-bold text-white shadow-sm shadow-blue-300 hover:bg-[#3A4FE7] disabled:cursor-not-allowed disabled:opacity-70"
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
              <ShieldCheck size={14} className="text-[#4A5FF7]" />
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
