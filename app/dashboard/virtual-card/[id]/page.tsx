'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCards } from '@/hooks/useCards';
import { Card } from '@/components/shared/Card';
import {
  CardActionModal,
  CardBreadcrumb,
  CardDetailsPanel,
  CardTransactionsTable,
  CardTerminateConfirmModal,
} from '@/components/dashboard/card';
import { AlertCircle, RefreshCw, CreditCard } from 'lucide-react';

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;

  const {
    cardDetail,
    cardDetailLoading,
    cardDetailError,
    fetchCardDetail,
    cardTransactions,
    transactionsLoading,
    transactionsPagination,
    fetchCardTransactions,
    fundCard,
    withdrawFromCard,
    actionModal,
    openActionModal,
    closeActionModal,
  } = useCards();

  const [detailsVisible, setDetailsVisible] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isFreezing, setIsFreezing] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);

  useEffect(() => {
    if (cardId) {
      fetchCardDetail(cardId);
      fetchCardTransactions(cardId);
    }
  }, [cardId, fetchCardDetail, fetchCardTransactions]);

  const handleRefresh = useCallback(() => {
    if (cardId) {
      fetchCardDetail(cardId);
      fetchCardTransactions(cardId);
    }
  }, [cardId, fetchCardDetail, fetchCardTransactions]);

  const handleTransactionsPageChange = useCallback(
    (page: number) => {
      if (cardId) fetchCardTransactions(cardId, page);
    },
    [cardId, fetchCardTransactions]
  );

  const handleCopy = useCallback((label: string, value: string) => {
    if (!value) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedField(label);
        window.setTimeout(() => setCopiedField((prev) => (prev === label ? null : prev)), 1500);
      })
      .catch(() => {
        /* clipboard permission denied — silently ignore */
      });
  }, []);

  // NOTE: useCards does not currently expose freeze/terminate actions.
  // Swap the TODO lines for the real API calls once available
  // (e.g. `await freezeCard(cardId)` / `await terminateCard(cardId)`).
  const handleToggleFreeze = useCallback(async () => {
    if (!cardDetail) return;
    setIsFreezing(true);
    try {
      // TODO: await freezeCard(cardId) / unfreezeCard(cardId)
      await new Promise((resolve) => setTimeout(resolve, 350));
      handleRefresh();
    } finally {
      setIsFreezing(false);
    }
  }, [cardDetail, handleRefresh]);

  const handleTerminate = useCallback(async () => {
    setIsTerminating(true);
    try {
      // TODO: await terminateCard(cardId)
      await new Promise((resolve) => setTimeout(resolve, 350));
      setShowTerminateConfirm(false);
      handleRefresh();
    } finally {
      setIsTerminating(false);
    }
  }, [handleRefresh]);

  const handleGenerateStatement = useCallback(() => {
    if (!cardDetail) return;
    const header = ['Ref ID', 'Date', 'Description', 'Entry', 'Amount (USD)', 'Fee (USD)', 'Status'];
    const rows = cardTransactions.map((txn) => [
      txn.id,
      new Date(txn.created_at).toISOString(),
      `"${(txn.description ?? '').replace(/"/g, '""')}"`,
      txn.type,
      txn.amount.toFixed(2),
      txn.fee.toFixed(2),
      txn.status,
    ]);
    const csv = [header, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const panSuffix = (cardDetail.masked_pan || cardDetail.card_number || '').slice(-4);
    link.href = url;
    link.download = `statement-${panSuffix || cardDetail.id}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [cardDetail, cardTransactions]);

  // Shared breadcrumb component
  const breadcrumb = <CardBreadcrumb onBack={() => router.back()} />;

  // Loading state
  if (cardDetailLoading) {
    return (
      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="space-y-8"
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        `}</style>

        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            {breadcrumb}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mt-6">
              <div className="h-[560px] rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-[560px] rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (cardDetailError || !cardDetail) {
    return (
      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="space-y-8"
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        `}</style>

        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            {breadcrumb}
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center mt-6">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-lg font-bold text-red-900 mb-2">Card Not Found</h2>
              <p className="text-sm text-red-700 mb-4">{cardDetailError || 'Unable to load card details'}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-xl bg-[#d71927] px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </Card>
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

      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {cardDetail.issuer} · {cardDetail.currency}
                </p>
                <p className="text-xs text-gray-600">
                  Card details and transactions
                </p>
              </div>
            </div>

            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />

            <div className="flex items-center gap-3 opacity-60">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-extrabold text-gray-500">
                <Image
                  src={cardDetail.issuer === 'VISA' ? '/visa.webp' : '/mastercard.svg'}
                  alt={cardDetail.issuer}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{cardDetail.status === 'ACTIVE' ? 'Active' : cardDetail.status}</p>
                <p className="text-xs text-gray-600">
                  Balance: ${cardDetail.balance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {breadcrumb}

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mt-6 items-start">
            <CardDetailsPanel
              card={cardDetail}
              detailsVisible={detailsVisible}
              onToggleVisibility={() => setDetailsVisible((v) => !v)}
              copiedField={copiedField}
              onCopy={handleCopy}
              onFund={() => openActionModal('fund', cardDetail.id, cardDetail.masked_pan)}
              onWithdraw={() => openActionModal('withdraw', cardDetail.id, cardDetail.masked_pan)}
              onRefresh={handleRefresh}
              onToggleFreeze={handleToggleFreeze}
              isFreezing={isFreezing}
              onRequestTerminate={() => setShowTerminateConfirm(true)}
            />

            <CardTransactionsTable
              transactions={cardTransactions}
              pagination={transactionsPagination}
              isLoading={transactionsLoading}
              copiedField={copiedField}
              onCopy={handleCopy}
              onRefresh={() => fetchCardTransactions(cardId)}
              onPageChange={handleTransactionsPageChange}
              onGenerateStatement={handleGenerateStatement}
            />
          </div>
        </div>
      </Card>

      <CardActionModal
        isOpen={actionModal.isOpen}
        action={actionModal.action}
        cardMaskedPan={actionModal.cardMaskedPan}
        onClose={closeActionModal}
        onSubmit={async (amountInCents) => {
          if (actionModal.action === 'fund' && actionModal.cardId) {
            const success = await fundCard(actionModal.cardId, amountInCents);
            if (success) handleRefresh();
            return success;
          } else if (actionModal.action === 'withdraw' && actionModal.cardId) {
            const success = await withdrawFromCard(actionModal.cardId, amountInCents);
            if (success) handleRefresh();
            return success;
          }
          return false;
        }}
      />

      <CardTerminateConfirmModal
        isOpen={showTerminateConfirm}
        isTerminating={isTerminating}
        onCancel={() => setShowTerminateConfirm(false)}
        onConfirm={handleTerminate}
      />
    </div>
  );
}
