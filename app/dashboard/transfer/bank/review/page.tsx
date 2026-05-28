/**
 * Bank Transfer Review & Confirmation Page
 * User reviews bank transfer details and enters PIN to confirm
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useBankTransfer } from '@/hooks/useBankTransfer';
import { walletService } from '@/services/wallet.service';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { PINVerificationModal } from '@/components/shared/PINVerificationModal';
import { TransferSummary } from '@/components/shared/TransferSummary';
import { BankTransferFormData, TransferType } from '@/types/transfer.types';
  import { Wallet } from '@/types/api.types';
import { formatAmount } from '@/utils/transfer.utils';
import { CheckCircle, Loader, AlertCircle, Copy } from 'lucide-react';

export default function BankTransferReviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast, setIsLoading } = useUIStore();
  const { submitTransfer, restoreFormData } = useBankTransfer({
    onSuccess: (response) => {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 5000);
    },
  });

  const [formData, setFormData] = useState<BankTransferFormData | null>(null);
  const [walletBalance, setWalletBalance] = useState<Wallet | null>(null);
  const [showPINModal, setShowPINModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load form data from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem('bankTransferFormData');
    if (!storedData) {
      addToast({ type: 'error', message: 'Form data not found' });
      router.push('/dashboard/transfer/bank');
      return;
    }

    try {
      const data = JSON.parse(storedData) as BankTransferFormData;
      setFormData(data);
      restoreFormData(data); // Restore hook state
      loadWalletBalance();
    } catch (error) {
      console.error('Error parsing form data:', error);
      addToast({ type: 'error', message: 'Invalid form data' });
      router.push('/dashboard/transfer/bank');
    }
  }, [router, addToast, restoreFormData]);

  const loadWalletBalance = async () => {
    try {
      const response = await walletService.getBalance();
      if (response?.data) {
        setWalletBalance(response.data);
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  };

  // Handle PIN submission
  const handlePINSubmit = async (pin: string) => {
    setIsProcessing(true);
    try {
      const response = await submitTransfer(pin);
      if (response) {
        // Extract data - API returns data at root or in .data property
        const transferData = response.data || response;
        setSuccessData(transferData);
      }
    } finally {
      setIsProcessing(false);
      setShowPINModal(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 text-[#d71927] animate-spin" />
      </div>
    );
  }

  if (showSuccess && successData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="text-center space-y-6 py-8 px-6 sm:px-8">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transfer Successful!</h2>
              <p className="text-gray-600 text-sm mt-2">
                Your bank transfer has been completed successfully
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Bank</span>
                <span className="font-semibold text-gray-900">
                  {formData.selectedBank?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Amount</span>
                <span className="font-semibold text-[#d71927]">
                  {formatAmount(formData.amount)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Reference</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-200 px-2 py-1 rounded text-xs text-[#d71927] font-mono font-bold">
                      {successData.reference || successData.transfer_code}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(successData.reference || successData.transfer_code);
                        addToast({
                          type: 'success',
                          message: 'Reference copied',
                        });
                      }}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => {
                  sessionStorage.removeItem('bankTransferFormData');
                  router.push('/dashboard/transfer/bank');
                }}
                variant="outline"
                className="w-full"
              >
                Another Transaction
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>

            <p className="text-gray-600 text-xs">
              Redirecting in 5 seconds...
            </p>
          </div>
        </div>
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
            <div className="flex items-center gap-3 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-extrabold text-gray-500">
                1
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Select Bank & Account</p>
                <p className="text-xs text-gray-600">Choose destination bank and account</p>
              </div>
            </div>

            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
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
        <div className="p-6 sm:p-8">
          <div className="space-y-8">

            {/* Transfer Summary */}
            {walletBalance && formData.selectedBank && (
              <TransferSummary
                type={TransferType.BANK}
                recipient={null}
                amount={formData.amount}
                description={formData.reason}
                walletBalance={walletBalance?.available_balance ?? walletBalance?.balance ?? 0}
                bankName={formData.selectedBank.name}
                accountNumber={formData.accountNumber}
              />
            )}


            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                disabled={isProcessing}
                className="flex-1"
              >
                Edit Details
              </Button>
              <Button
                onClick={() => setShowPINModal(true)}
                disabled={isProcessing}
                isLoading={isProcessing}
                className="flex-1"
              >
                Confirm & Pay
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* PIN Modal */}
      <PINVerificationModal
        isOpen={showPINModal}
        onClose={() => setShowPINModal(false)}
        onVerify={handlePINSubmit}
        isLoading={isProcessing}
        title="Enter Transaction PIN"
        description="Enter your 4-digit PIN to authorize this bank transfer"
      />
    </div>
  );
}
