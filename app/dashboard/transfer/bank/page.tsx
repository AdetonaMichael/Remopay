/**
 * Bank Transfer Form Page - Optimized UI
 * User selects bank, enters account details, and transfer amount
 * Redesigned following data purchase flow pattern
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useBankTransfer } from '@/hooks/useBankTransfer';
import { walletService } from '@/services/wallet.service';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Wallet } from '@/types/api.types';
import { formatAmount } from '@/utils/transfer.utils';
import { ChevronRight, Building2, Loader2, CheckCircle, Search, X } from 'lucide-react';

export default function BankTransferPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const {
    formData,
    validationErrors,
    banks,
    isLoadingBanks,
    isVerifyingAccount,
    updateField,
    selectBank,
    verifyBankAccount,
    validateForm,
  } = useBankTransfer();

  const [walletBalance, setWalletBalance] = useState<Wallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load wallet balance on mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        setIsLoadingWallet(true);
        const response = await walletService.getBalance();
        if (response?.data) {
          setWalletBalance(response.data);
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
        addToast({ type: 'error', message: 'Failed to load wallet data' });
      } finally {
        setIsLoadingWallet(false);
      }
    };

    loadWallet();
  }, [addToast]);

  // Get selected bank details
  const selectedBankDetails = useMemo(() => {
    return banks.find((b) => b.code === formData.selectedBank?.code);
  }, [banks, formData.selectedBank]);

  // Filter banks by search term
  const filteredBanks = useMemo(() => {
    if (!searchTerm.trim()) return banks;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return banks.filter((bank) =>
      bank.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [banks, searchTerm]);

  // Handle proceed to review
  const handleProceedToReview = async () => {
    try {
      if (!walletBalance) {
        addToast({ type: 'error', message: 'Wallet data not loaded' });
        return;
      }

      if (!formData.selectedBank) {
        addToast({ type: 'error', message: 'Please select a bank' });
        return;
      }

      if (!formData.accountVerified) {
        addToast({ type: 'error', message: 'Please verify your account number' });
        return;
      }

      if (!formData.amount || formData.amount <= 0) {
        addToast({ type: 'error', message: 'Please enter a valid amount' });
        return;
      }

      if (!validateForm(walletBalance?.available_balance ?? walletBalance?.balance ?? 0)) {
        return;
      }

      // Store form data in session storage
      sessionStorage.setItem('bankTransferFormData', JSON.stringify(formData));

      await router.push('/dashboard/transfer/bank/review');
    } catch (error) {
      console.error('Error proceeding to review:', error);
      addToast({ type: 'error', message: 'Failed to proceed. Please try again.' });
    }
  };

  if (isLoadingWallet) {
    return (
      <div className="space-y-4 p-6">
        {[...Array(5)].map((_, i) => (
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
                <p className="text-sm font-bold text-gray-900">Select Bank & Account</p>
                <p className="text-xs text-gray-600">Choose destination bank and account</p>
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
            {/* Bank Selection */}
            <div>
              <label className="mb-4 block text-sm font-bold text-gray-900">
                Select Bank
              </label>

              {isLoadingBanks ? (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10">
                  <div className="text-center">
                    <Loader2 className="mx-auto animate-spin text-[#d71927]" size={26} />
                    <p className="mt-3 text-sm font-semibold text-gray-600">
                      Loading banks...
                    </p>
                  </div>
                </div>
              ) : banks.length > 0 ? (
                <>
                  {/* Search Input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search banks by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d71927] transition-colors"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Banks List */}
                  <div className="grid max-h-[500px] gap-3 overflow-y-auto pr-1">
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank, index) => {
                        const active = formData.selectedBank?.code === bank.code;
                        return (
                          <button
                            key={`${bank.code}-${bank.name}-${index}`}
                            type="button"
                            onClick={() => {
                              selectBank(bank);
                              updateField('accountVerified', false);
                              updateField('accountNumber', '');
                              updateField('accountName', '');
                            }}
                            className={`w-full rounded-2xl border p-4 text-left transition-all ${
                              active
                                ? 'border-[#d71927] bg-red-50 shadow-sm shadow-red-200'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {bank.logo ? (
                                  <Image
                                    src={bank.logo}
                                    alt={bank.name}
                                    width={40}
                                    height={40}
                                    className="rounded-lg object-contain"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                    <Building2 className="text-[#d71927]" size={20} />
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-gray-900">{bank.name}</p>
                                </div>
                              </div>
                              {active && <CheckCircle className="text-[#d71927]" size={20} />}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                        <Building2 className="mx-auto text-gray-400" size={28} />
                        <p className="mt-3 text-sm font-semibold text-gray-600">
                          No banks found
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                  <Building2 className="mx-auto text-gray-400" size={28} />
                  <p className="mt-3 text-sm font-semibold text-gray-600">
                    No banks available
                  </p>
                </div>
              )}

              {validationErrors.bank && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {validationErrors.bank}
                </p>
              )}
            </div>

            {/* Account Details - Only show if bank selected */}
            {formData.selectedBank && (
              <div className="space-y-6 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div>
                  <label className="mb-3 block text-sm font-bold text-gray-900">
                    Account Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="10-digit account number"
                      value={formData.accountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        updateField('accountNumber', value);
                        updateField('accountVerified', false);
                      }}
                      error={validationErrors.accountNumber}
                      className="flex-1 bg-white"
                    />
                    <Button
                      onClick={verifyBankAccount}
                      disabled={!formData.accountNumber || isVerifyingAccount || formData.accountVerified}
                      isLoading={isVerifyingAccount}
                      variant={formData.accountVerified ? 'primary' : 'outline'}
                      className="px-4"
                    >
                      {formData.accountVerified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                  {validationErrors.accountNumber && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.accountNumber}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-600">
                    Nigerian NUBAN account number (10 digits)
                  </p>
                </div>

                {/* Account Name - Auto-filled after verification */}
                {formData.accountVerified && (
                  <div>
                    <label className="mb-3 block text-sm font-bold text-gray-900">
                      Account Name
                    </label>
                    <Input
                      type="text"
                      value={formData.accountName}
                      disabled
                      className="bg-white"
                    />
                    <p className="mt-2 text-xs text-green-600 font-medium">
                      ✓ Auto-filled from bank verification
                    </p>
                  </div>
                )}

                {/* Verification Status */}
                {formData.accountVerified && (
                  <div className="rounded-lg bg-green-50 p-3 flex items-start gap-2">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-semibold text-green-900 text-sm">Account Verified</p>
                      <p className="text-green-800 text-xs">{formData.accountName}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Amount Section */}
            {formData.accountVerified && (
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
                  Min: ₦100 | Max: ₦500,000
                </p>
                {validationErrors.amount && (
                  <p className="text-sm text-red-600">{validationErrors.amount}</p>
                )}
              </div>
            )}

            {/* Reason Section (Optional) */}
            {formData.accountVerified && (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-900">
                  Reason <span className="text-gray-600 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  placeholder="E.g., Payment for goods, service fee..."
                  value={formData.reason || ''}
                  onChange={(e) => updateField('reason', e.target.value)}
                  maxLength={255}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#d71927] transition-colors resize-none"
                />
                <p className="text-xs text-gray-600">
                  {(formData.reason?.length || 0)}/255 characters
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
                  Selected Bank
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {formData.selectedBank?.name || 'Not selected'}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                  Account Number
                </p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {formData.accountVerified
                    ? formData.accountNumber
                    : 'Not verified'}
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
                  <div className="rounded-2xl bg-blue-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                      Available Balance
                    </p>
                    <p className="mt-2 text-sm font-bold text-blue-900">
                      {formatAmount(availableBalance)}
                    </p>
                  </div>
                );
              })()}
            </div>

            <Button
              fullWidth
              onClick={handleProceedToReview}
              disabled={!formData.accountVerified || !formData.amount || formData.amount <= 0}
              className="mt-6 h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Continue to Review</span>
              <ChevronRight className="ml-2" size={20} />
            </Button>
          </aside>
        </div>
      </Card>
    </div>
  );
}
