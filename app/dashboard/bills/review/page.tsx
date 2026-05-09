'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Bolt,
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
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { PINVerificationModal } from '@/components/shared/PINVerificationModal';
import { useAlert } from '@/hooks/useAlert';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/payment.service';
import { formatCurrency } from '@/utils/format.utils';

interface ElectricityFormData {
  serviceID: string;
  billersCode: string;
  provider: string;
  providerID: string;
  meterNumber: string;
  customerName: string;
  paymentType: string;
  variationCode: string;
}

type PaymentMethod = 'wallet' | 'card' | 'bank_transfer';
type TransactionStatus = 'idle' | 'processing' | 'success' | 'error';

export default function ElectricityReviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: alertError } = useAlert();
  const { execute } = useApi();

  const [formData, setFormData] = useState<ElectricityFormData | null>(null);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('wallet');
  const [showPINModal, setShowPINModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('idle');
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<{
    requiredAmount: number;
    currentBalance: number;
    shortfall: number;
  } | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('electricityFormData')
        : null;

    if (!stored) {
      router.push('/dashboard/bills');
      return;
    }

    try {
      setFormData(JSON.parse(stored) as ElectricityFormData);
    } catch {
      router.push('/dashboard/bills');
    }
  }, [router]);

  const amountValue = useMemo(() => Number(amount || 0), [amount]);

  const isValidAmount = (): boolean => {
    return amountValue >= 100 && amountValue <= 10000000;
  };

  const isValidPhone = (): boolean => {
    return /^0[789]\d{9}$/.test(phone.replace(/\s/g, ''));
  };

  const isValidEmail = (): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePhoneChange = (value: string) => {
    let nextPhone = value.replace(/\D/g, '').slice(0, 11);

    if (nextPhone.length > 7) {
      nextPhone = `${nextPhone.slice(0, 3)} ${nextPhone.slice(
        3,
        7
      )} ${nextPhone.slice(7)}`;
    } else if (nextPhone.length > 3) {
      nextPhone = `${nextPhone.slice(0, 3)} ${nextPhone.slice(3)}`;
    }

    setPhone(nextPhone);
  };

  const handlePayment = () => {
    if (!amount.trim()) {
      alertError('Please enter an amount');
      return;
    }

    if (!isValidAmount()) {
      alertError('Amount must be between ₦100 and ₦10,000,000');
      return;
    }

    if (!isValidPhone()) {
      alertError('Please enter a valid Nigerian phone number');
      return;
    }

    if (!isValidEmail()) {
      alertError('Please enter a valid email address');
      return;
    }

    setShowPINModal(true);
  };

  const handlePINConfirm = async (pin: string) => {
    if (!formData || !user) {
      alertError('Form data missing');
      setShowPINModal(false);
      return;
    }

    setIsProcessing(true);
    setInsufficientBalance(false);
    setTransactionStatus('processing');

    try {
      // Process electricity transaction with PIN included
      console.log('[BillsReview] Processing electricity transaction with PIN...');

      const paymentPayload = {
        serviceID: formData.serviceID,
        phone: phone.replace(/\s/g, ''),
        amount: amountValue,
        billersCode: formData.billersCode,
        variation_code: formData.variationCode,
        user_id: user.id,
        user_email: email,
        payment_method: paymentMethod,
        pin, // Include PIN directly with request
      };

      const response = await paymentService.payBill(paymentPayload as any);
      console.log('[BillsReview] Transaction response:', response);

      // API client returns the backend response directly (not wrapped in data property)
      const responseData = response as any;
      if (responseData?.success && responseData?.status === 'completed') {
        success('Electricity bill payment successful!');
        setTransactionStatus('success');
        setShowPINModal(false);
        sessionStorage.removeItem('electricityFormData');

        setTimeout(() => {
          router.push('/dashboard/history');
        }, 2500);

        return;
      }

      const errorCode = responseData?.error_code;

      if (errorCode === 'INSUFFICIENT_USER_BALANCE') {
        const required = amountValue;
        const current = responseData?.current_balance || 0;
        const shortfall = required - current;

        setInsufficientBalance(true);
        setBalanceInfo({
          requiredAmount: required,
          currentBalance: current,
          shortfall: Math.max(0, shortfall),
        });
        setTransactionStatus('error');
        setShowPINModal(false);
        return;
      }

      setTransactionStatus('error');
      alertError(responseData?.message || 'Payment failed');
      setShowPINModal(false);
    } catch (error: any) {
      console.error('[BillsReview] Error:', error);
      setShowPINModal(false);
      setTransactionStatus('error');

      // Handle PIN verification errors
      if (error.code === 'INVALID_PIN') {
        const remaining = error.data?.remaining_attempts;
        if (remaining === 0) {
          alertError('Your PIN is now locked for 30 minutes due to too many failed attempts.');
        } else {
          alertError(`Invalid PIN. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
        }
        return;
      }

      if (error.code === 'PIN_LOCKED') {
        alertError(
          `Your PIN is temporarily locked. Try again in ${Math.ceil(
            error.data?.remaining_seconds / 60
          )} minutes.`
        );
        return;
      }

      if (error.code === 'PIN_NOT_SET') {
        alertError('Please set your PIN in settings before making payments.');
        return;
      }

      alertError(error.message || 'Transaction failed. Please try again.');
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
          <p className="text-sm font-bold text-[#111827]">Loading review...</p>
          <p className="mt-1 text-xs text-[#667085]">
            Preparing your electricity payment summary.
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
          <Card className="overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#EEF2F7] bg-white px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d71927] bg-white text-sm font-extrabold text-[#d71927]">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">
                      Meter Verified
                    </p>
                    <p className="text-xs text-[#667085]">
                      Customer details confirmed.
                    </p>
                  </div>
                </div>

                <div className="hidden h-[2px] flex-1 bg-[#d71927] sm:block" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">
                      Confirm & Pay
                    </p>
                    <p className="text-xs text-[#667085]">
                      Authorize bill payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                Verified Meter Details
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#EEF2F7] bg-white px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Provider
                  </p>
                  <p className="mt-2 text-base font-extrabold text-[#111827]">
                    {formData.provider}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#EEF2F7] bg-white px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Meter Type
                  </p>
                  <p className="mt-2 text-base font-extrabold text-[#111827]">
                    {formData.paymentType}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#EEF2F7] bg-white px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Meter Number
                  </p>
                  <p className="mt-2 text-base font-extrabold text-[#111827]">
                    {formData.meterNumber}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#EEF2F7] bg-white px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Customer
                  </p>
                  <p className="mt-2 text-base font-extrabold text-[#111827]">
                    {formData.customerName}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Input
                  label="Amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  error={
                    amount && !isValidAmount()
                      ? 'Amount must be between ₦100 and ₦10,000,000'
                      : undefined
                  }
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="080 1234 5678"
                  value={phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  error={
                    phone && !isValidPhone()
                      ? 'Enter a valid Nigerian phone number'
                      : undefined
                  }
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={
                    email && !isValidEmail()
                      ? 'Enter a valid email address'
                      : undefined
                  }
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[24px] border border-red-200 bg-red-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    Total Amount
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#667085]">
                    This amount will be deducted from your selected payment
                    method.
                  </p>
                </div>

                <p className="text-3xl font-extrabold tracking-tight text-[#d71927]">
                  {formatCurrency(amountValue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
              Payment Method
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  value: 'wallet',
                  label: 'Remopay',
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
                    className={`flex w-full items-start justify-between rounded-[24px] border p-5 text-left transition-all ${
                      method.disabled
                        ? 'cursor-not-allowed border-gray-200 bg-[#F8FAFC] opacity-60'
                        : active
                          ? 'border-[#d71927] bg-red-50 shadow-[0_14px_30px_rgba(215,25,39,0.12)]'
                          : 'border-gray-200 bg-white hover:border-[#A9B7FF]'
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
                        <p className="text-base font-extrabold text-[#111827]">
                          {method.label}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#667085]">
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
                          : 'border-[#CBD5E1] bg-white'
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
          <Card className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] xl:sticky xl:top-8">
            <h3 className="text-xl font-extrabold tracking-tight text-[#111827]">
              Order Summary
            </h3>

            <div className="mt-5 space-y-4 border-b border-[#EEF2F7] pb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#667085]">Provider</span>
                <span className="font-bold text-[#111827]">
                  {formData.provider}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#667085]">Meter Type</span>
                <span className="font-bold text-[#111827]">
                  {formData.paymentType}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#667085]">Meter</span>
                <span className="font-bold text-[#111827]">
                  {formData.meterNumber}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-[#667085]">Customer</span>
                <span className="max-w-[190px] text-right font-bold leading-6 text-[#111827]">
                  {formData.customerName}
                </span>
              </div>
            </div>

            <div className="my-6 flex items-center justify-between rounded-[24px] bg-red-50 px-5 py-4">
              <span className="text-base font-bold text-[#111827]">Total</span>
              <span className="text-2xl font-extrabold tracking-tight text-[#d71927]">
                {formatCurrency(amountValue)}
              </span>
            </div>

            {insufficientBalance && balanceInfo && (
              <div className="mb-6 rounded-[24px] border border-red-200 bg-red-50 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 text-red-600" size={22} />
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-red-900">
                      Insufficient Balance
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700">
                      You need {formatCurrency(balanceInfo.requiredAmount)} to
                      complete this payment.
                    </p>

                    <div className="mt-3 space-y-2 rounded-2xl bg-red-100 p-3 text-xs text-red-800">
                      <div className="flex justify-between">
                        <span>Current Balance</span>
                        <span>{formatCurrency(balanceInfo.currentBalance)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Shortfall</span>
                        <span>{formatCurrency(balanceInfo.shortfall)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-4 w-full rounded-xl"
                      onClick={() => router.push('/dashboard/wallet')}
                    >
                      Go to Wallet
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {transactionStatus === 'success' && (
              <div className="mb-6 rounded-[24px] border border-green-200 bg-green-50 p-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 text-green-600" size={28} />
                <p className="text-sm font-extrabold text-green-900">
                  Payment Successful
                </p>
                <p className="mt-1 text-xs text-green-700">
                  Redirecting to transaction history...
                </p>
              </div>
            )}

            {transactionStatus !== 'success' && (
              <Button
                fullWidth
                onClick={handlePayment}
                disabled={isProcessing}
                className="mb-3 h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-[0_14px_30px_rgba(215,25,39,0.24)] hover:bg-[#b81420] disabled:cursor-not-allowed disabled:opacity-70"
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
              onClick={() => router.push('/dashboard/bills')}
              disabled={isProcessing}
              className="h-12 rounded-2xl font-bold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isProcessing ? 'Processing...' : 'Cancel'}
            </Button>

            <div className="mt-5 rounded-2xl border border-[#EEF2F7] bg-white p-4">
              <p className="flex items-center justify-center gap-2 text-center text-xs font-semibold text-[#667085]">
                <Lock size={13} />
                Secured by Remopay transaction protection
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#667085]">
              <ShieldCheck size={14} className="text-[#d71927]" />
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
        description="Enter your 4-digit PIN to complete this electricity payment"
      />

      <Toast />
    </div>
  );
}

