/**
 * Remopay Transfer Form Page - Optimized UI
 * User enters recipient details and transfer amount
 * Redesigned following data purchase flow pattern
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useTransfer } from '@/hooks/useTransfer';
import { walletService } from '@/services/wallet.service';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { RecentRecipientsList } from '@/components/shared/RecentRecipientsList';
import { RecipientCard } from '@/components/shared/RecipientCard';
import { IdentifierType } from '@/types/transfer.types';
import { Wallet } from '@/types/api.types';
import { formatPhoneForDisplay, formatAmount } from '@/utils/transfer.utils';
import { ChevronRight, Mail, Phone, Loader2, CheckCircle } from 'lucide-react';

export default function RemopayTransferPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const {
    formData,
    validationErrors,
    recipientDetails,
    recentRecipients,
    isVerifying,
    isLoadingRecipients,
    updateField,
    verifyRecipient,
    selectRecentRecipient,
    loadRecentRecipients,
    validateForm,
  } = useTransfer();

  const [walletBalance, setWalletBalance] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [showRecentRecipients, setShowRecentRecipients] = useState(false);
  const [isProceedingToReview, setIsProceedingToReview] = useState(false);

  // Determine if button should be disabled and why
  const isButtonDisabled = !recipientDetails || !formData.amount || formData.amount <= 0;
  const buttonDisabledReason = !recipientDetails 
    ? 'Please verify a recipient first'
    : !formData.amount || formData.amount <= 0
    ? 'Please enter a valid amount'
    : null;

  // Log button state for debugging
  useEffect(() => {
    if (buttonDisabledReason) {
      console.log('[Transfer] Button disabled:', {
        reason: buttonDisabledReason,
        recipientDetails: !!recipientDetails,
        amount: formData.amount,
      });
    }
  }, [recipientDetails, formData.amount, buttonDisabledReason]);

  // Load wallet balance and recent recipients on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoadingWallet(true);
        const response = await walletService.getBalance();
        console.log('[Wallet] Full API Response:', response);
        
        if (response?.data) {
          console.log('[Wallet] Balance Data:', {
            available_balance: response.data.available_balance,
            balance: response.data.balance,
            pending_amount: response.data.pending_amount,
            locked_amount: response.data.locked_amount,
          });
          setWalletBalance(response.data);
        } else {
          console.warn('[Wallet] No data in response:', response);
        }
        await loadRecentRecipients();
      } catch (error: any) {
        console.error('[Wallet] Error loading wallet data:', error);
        console.error('[Wallet] Error details:', {
          message: error.message,
          status: error.status,
          response: error.response,
        });
        addToast({ type: 'error', message: 'Failed to load wallet data' });
      } finally {
        setIsLoadingWallet(false);
      }
    };

    initializeData();
  }, [loadRecentRecipients, addToast]);

  // Handle proceed to review
  const handleProceedToReview = async () => {
    try {
      console.log('[Transfer] Button clicked - proceeding to review');
      setIsProceedingToReview(true);

      // Validation checks with detailed logging
      if (!recipientDetails) {
        console.warn('[Transfer] Validation failed: No recipient details');
        addToast({ type: 'error', message: 'Please verify a recipient first' });
        setIsProceedingToReview(false);
        return;
      }

      if (!formData.amount || formData.amount <= 0) {
        console.warn('[Transfer] Validation failed: Invalid amount', { amount: formData.amount });
        addToast({ type: 'error', message: 'Please enter a valid amount' });
        setIsProceedingToReview(false);
        return;
      }

      if (!walletBalance) {
        console.warn('[Transfer] Validation failed: No wallet balance');
        addToast({ type: 'error', message: 'Wallet data not loaded. Please refresh the page.' });
        setIsProceedingToReview(false);
        return;
      }

      const availableBalance = walletBalance?.available_balance ?? walletBalance?.balance ?? 0;
      if (!validateForm(availableBalance)) {
        console.warn('[Transfer] Form validation failed');
        setIsProceedingToReview(false);
        return;
      }

      console.log('[Transfer] All validations passed. Storing form data and navigating...');

      // Store form data in session storage
      sessionStorage.setItem(
        'remopayTransferFormData',
        JSON.stringify({
          ...formData,
          recipientDetails,
        })
      );

      console.log('[Transfer] Navigating to review page');
      await router.push('/dashboard/transfer/remopay/review');
    } catch (error) {
      console.error('[Transfer] Error proceeding to review:', error);
      addToast({ type: 'error', message: 'Failed to proceed. Please try again.' });
      setIsProceedingToReview(false);
    }
  };

  if (isLoadingWallet) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="space-y-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Step Indicator */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Enter Recipient & Amount</p>
                <p className="text-xs text-gray-600">Choose who to send money to</p>
              </div>
            </div>

            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />

            <div className="flex items-center gap-3 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-extrabold text-gray-500">
                2
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Confirm & Pay</p>
                <p className="text-xs text-gray-600">Review and authorize transaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Recent Recipients Section */}
            {recentRecipients.length > 0 && (
              <div>
                <label className="mb-4 block text-sm font-bold text-gray-900">
                  Recent Recipients
                </label>
                <RecentRecipientsList
                  recipients={recentRecipients}
                  onSelect={selectRecentRecipient}
                  isLoading={isLoadingRecipients}
                />
              </div>
            )}

            {/* Recipient Identifier Tabs */}
            <div>
              <label className="mb-4 block text-sm font-bold text-gray-900">
                Enter Recipient
              </label>
              <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl mb-4">
                <button
                  onClick={() => updateField('identifierType', IdentifierType.PHONE)}
                  className={`flex-1 py-2 rounded-xl transition-all text-sm font-bold ${
                    formData.identifierType === IdentifierType.PHONE
                      ? 'bg-[#d71927] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone
                </button>
                <button
                  onClick={() => updateField('identifierType', IdentifierType.EMAIL)}
                  className={`flex-1 py-2 rounded-xl transition-all text-sm font-bold ${
                    formData.identifierType === IdentifierType.EMAIL
                      ? 'bg-[#d71927] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </button>
              </div>

              {/* Recipient Input */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={
                    formData.identifierType === IdentifierType.PHONE
                      ? 'Enter phone (e.g., 07077504334)'
                      : 'Enter email address'
                  }
                  value={formData.recipientIdentifier}
                  onChange={(e) => updateField('recipientIdentifier', e.target.value)}
                  error={validationErrors.recipient || validationErrors.recipientIdentifier}
                  className="flex-1 bg-white"
                />
                <Button
                  onClick={verifyRecipient}
                  disabled={!formData.recipientIdentifier || isVerifying}
                  isLoading={isVerifying}
                  className="px-4"
                >
                  Verify
                </Button>
              </div>

              {validationErrors.recipient && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {validationErrors.recipient}
                </p>
              )}
            </div>

            {/* Recipient Details Card */}
            {recipientDetails && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{recipientDetails.name}</p>
                    <p className="text-sm text-gray-600">
                      {formData.identifierType === IdentifierType.PHONE
                        ? recipientDetails.phone_number
                        : recipientDetails.email}
                    </p>
                  </div>
                  <button
                    onClick={() => updateField('recipientIdentifier', '')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Amount Section */}
            {recipientDetails && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-900">
                  Transfer Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold text-lg">
                    ₦
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount || ''}
                    onChange={(e) => updateField('amount', parseFloat(e.target.value) || 0)}
                    className={`w-full pl-8 pr-4 py-3 bg-white border rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${
                      validationErrors.amount
                        ? 'border-red-500'
                        : 'border-gray-200 focus:border-[#d71927]'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Min: ₦50 | Max: ₦100,000
                </p>
                {validationErrors.amount && (
                  <p className="text-sm text-red-600">{validationErrors.amount}</p>
                )}
              </div>
            )}

            {/* Description Section (Optional) */}
            {recipientDetails && (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900">
                  Description <span className="text-gray-600 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  placeholder="E.g., Payment for services, loan repayment..."
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  maxLength={255}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d71927] transition-colors resize-none"
                />
                <p className="text-xs text-gray-600">
                  {(formData.description?.length || 0)}/255 characters
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <aside className="rounded-2xl border border-gray-200 bg-white p-6 h-fit">
            <p className="text-sm font-bold text-gray-900">Transfer Summary</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Recipient
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {recipientDetails?.name || 'Not selected'}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Contact
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {recipientDetails
                    ? formData.identifierType === IdentifierType.PHONE
                      ? recipientDetails.phone_number
                      : recipientDetails.email
                    : 'Not selected'}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Amount
                </p>
                <p className="mt-2 text-2xl font-extrabold text-[#d71927]">
                  {formatAmount(formData.amount || 0)}
                </p>
              </div>

              {walletBalance && (() => {
                const availableBalance = walletBalance.available_balance ?? walletBalance.balance ?? 0;
                return (
                  availableBalance === 0 ? (
                    <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">
                        ⚠️ Insufficient Balance
                      </p>
                      <p className="mt-2 text-sm font-bold text-red-900">
                        Your wallet balance is ₦0.00
                      </p>
                      <p className="mt-1 text-xs text-red-700">
                        Please top up your wallet to make a transfer
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-blue-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                        Available Balance
                      </p>
                      <p className="mt-2 text-sm font-bold text-blue-900">
                        {formatAmount(availableBalance)}
                      </p>
                    </div>
                  )
                );
              })()}
            </div>

            <Button
              fullWidth
              onClick={handleProceedToReview}
              isLoading={isProceedingToReview}
              disabled={isButtonDisabled || isProceedingToReview}
              title={buttonDisabledReason || 'Proceed to review and confirm transfer'}
              className="mt-6 h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Continue to Review</span>
              <ChevronRight className="ml-2" size={20} />
            </Button>

            {isButtonDisabled && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-medium text-amber-900">
                  {buttonDisabledReason}
                </p>
              </div>
            )}

            {validationErrors.balance && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs font-medium text-red-900">
                  ❌ {validationErrors.balance}
                </p>
              </div>
            )}

          </aside>
        </div>
      </Card>
    </div>
  );
}
