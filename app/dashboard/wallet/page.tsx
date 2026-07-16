'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  ArrowRightLeft,
  RefreshCw,
  Loader,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Toast } from '@/components/shared/Toast';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { useUsdWallet } from '@/hooks/useUsdWallet';
import { walletService } from '@/services/wallet.service';
import type { ParsedUsdTransaction } from '@/types/usd-wallet.types';

// ─── Helpers ────────────────────────────────────────────────────────────

function fmtNgn(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return `₦${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtUsd(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type ModalStep = 'idle' | 'quote_received' | 'exchanging';

// ─── Main Component ─────────────────────────────────────────────────────

export default function WalletPage() {
  const {
    usdWalletState, fetchUsdWallet,
    formattedUsdBalance,               // ✅ correct USD balance from summary endpoint
    parsedTransactions,                 // ✅ parsed USD wallet transactions
    conversion, quoteExpiresIn, setConversionDirection,
    setConversionAmount, generateQuote, executeExchange, resetConversion,
  } = useUsdWallet();

  // Balances
  const [ngnBal, setNgnBal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state (local, not relying on conversion.step from hook)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDir, setModalDir] = useState<'ngn-to-usd' | 'usd-to-ngn'>('ngn-to-usd');
  const [modalStep, setModalStep] = useState<ModalStep>('idle');
  const [modalError, setModalError] = useState<string | null>(null);

  // ── Fetch data ────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const ngnRes = await walletService.getBalance();
      if (ngnRes.success && ngnRes.data) setNgnBal(ngnRes.data.balance);
      // USD balance is fetched by useUsdWallet hook via the summary endpoint
      // No need to fetch it again here
    } catch { /* */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Modal open/close ──────────────────────────────────────────────
  const openModal = (dir: 'ngn-to-usd' | 'usd-to-ngn') => {
    setModalDir(dir);
    setModalStep('idle');
    setModalError(null);
    setConversionDirection(dir === 'ngn-to-usd' ? 'NGN' : 'USD', dir === 'ngn-to-usd' ? 'USD' : 'NGN');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalStep('idle');
    setModalError(null);
    resetConversion();
  };

  // ── Generate quote ────────────────────────────────────────────────
  const handleGenerateQuote = async () => {
    const amt = parseFloat(conversion.sourceAmount);
    if (isNaN(amt) || amt <= 0) {
      setModalError('Please enter a valid amount');
      return;
    }
    setModalError(null);
    setModalStep('idle');
    const quote = await generateQuote();
    if (quote) {
      setModalStep('quote_received');
    } else {
      setModalError('Failed to generate quote. Please try again.');
    }
  };

  // ── Execute exchange (stays on same step during loading) ──────────
  const handleExecuteExchange = async () => {
    setModalError(null);
    setModalStep('exchanging');
    const ok = await executeExchange();
    if (ok) {
      setModalOpen(false);
      setModalStep('idle');
      setModalError(null);
      resetConversion();
      fetchData();
      fetchUsdWallet();
    } else {
      setModalStep('quote_received');
      setModalError('Conversion failed. Please try again.');
    }
  };

  if (loading) return <CardSkeleton count={3} />;

  const usdActivities = parsedTransactions.slice(0, 5);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="space-y-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      {/* ════════ MAIN CARD ════════ */}
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">1</div>
              <div>
                <p className="text-sm font-bold text-gray-900">Select Direction & Amount</p>
                <p className="text-xs text-gray-600">Choose conversion type and enter amount.</p>
              </div>
            </div>
            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300 text-sm font-extrabold text-white">2</div>
              <div>
                <p className="text-sm font-bold text-gray-400">Confirm & Exchange</p>
                <p className="text-xs text-gray-400">Review quote and complete conversion.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════ TWO-COLUMN CONTENT ════════ */}
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
          {/* ─── LEFT: Conversion Options + USD Activity ─── */}
          <div className="space-y-5">
            <button onClick={() => openModal('ngn-to-usd')}
              className="group flex w-full items-center gap-5 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left transition-all hover:border-[#d71927] hover:bg-red-50/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#d71927]/10">
                <ArrowUpRight className="h-6 w-6 text-[#d71927]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900 group-hover:text-[#d71927] transition-colors">NGN → USD</p>
                <p className="text-xs text-gray-500 mt-0.5">{fmtNgn(ngnBal)} available</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#d71927] transition-colors flex-shrink-0" />
            </button>

            <button onClick={() => openModal('usd-to-ngn')}
              className="group flex w-full items-center gap-5 rounded-2xl border-2 border-gray-200 bg-white p-5 text-left transition-all hover:border-[#d71927] hover:bg-red-50/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#d71927]/10">
                <ArrowDownLeft className="h-6 w-6 text-[#d71927]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-900 group-hover:text-[#d71927] transition-colors">USD → NGN</p>
                <p className="text-xs text-gray-500 mt-0.5">{formattedUsdBalance} available</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#d71927] transition-colors flex-shrink-0" />
            </button>

            {/* ─── USD Recent Activity (from summary endpoint) ─── */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">USD Recent Activity</h3>
                <button onClick={() => fetchUsdWallet()} disabled={usdWalletState.isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
                  <RefreshCw className={`h-3.5 w-3.5 text-gray-600 ${usdWalletState.isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {usdActivities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                  <DollarSign className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-900">No USD activity yet</p>
                  <p className="text-xs text-gray-500 mt-1">Convert NGN to USD to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {usdActivities.map((tx: ParsedUsdTransaction) => (
                    <div key={tx.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                          tx.isCredit ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.isCredit
                            ? <TrendingUp className="h-4 w-4 text-green-600" />
                            : <TrendingDown className="h-4 w-4 text-red-500" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{tx.typeLabel}</p>
                          <p className="text-xs text-gray-500">
                            {tx.createdAt.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                          {tx.description && (
                            <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{tx.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className={`text-sm font-extrabold ${tx.isCredit ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.isCredit ? '+' : '-'}{tx.amountFormatted}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ─── RIGHT: Balances Sidebar ─── */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d71927]">
                  <span className="text-xs font-black text-white">₦</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">NGN Balance</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{fmtNgn(ngnBal)}</p>
            </div>

            {/* USD Balance — using correct value from summary endpoint */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">USD Balance</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{formattedUsdBalance}</p>
              {usdWalletState.lastSyncedAt && (
                <p className="mt-1 text-[10px] text-gray-400">
                  Last synced: {new Date(usdWalletState.lastSyncedAt).toLocaleString()}
                </p>
              )}
            </div>

            <button onClick={() => { fetchData(); fetchUsdWallet(); }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <RefreshCw className="h-4 w-4" /> Refresh Balances
            </button>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Info</p>
              <p className="mt-2 text-xs leading-6 text-gray-600">
                Convert between NGN and USD at live market rates. Rates are locked for 2 minutes once a quote is generated.
              </p>
            </div>
          </aside>
        </div>
      </Card>

      {/* ════════ CONVERSION MODAL ════════ */}
      {modalOpen && (
        <ConversionModal
          isOpen={modalOpen}
          onClose={closeModal}
          conversion={conversion}
          quoteExpiresIn={quoteExpiresIn}
          direction={modalDir}
          modalStep={modalStep}
          modalError={modalError}
          onSetDirection={(s, t) => {
            setConversionDirection(s, t);
            setModalDir(s === 'NGN' ? 'ngn-to-usd' : 'usd-to-ngn');
          }}
          onSetAmount={(amt) => { setConversionAmount(amt); setModalError(null); }}
          onGenerateQuote={handleGenerateQuote}
          onExecuteExchange={handleExecuteExchange}
          ngnBalance={ngnBal}
          usdBalance={usdWalletState.balance}
        />
      )}

      <Toast />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CONVERSION MODAL (local state driven, smooth UX)
// ═══════════════════════════════════════════════════════════════════════

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversion: any;
  quoteExpiresIn: number | null;
  direction: 'ngn-to-usd' | 'usd-to-ngn';
  modalStep: ModalStep;
  modalError: string | null;
  onSetDirection: (source: any, target: any) => void;
  onSetAmount: (amount: string) => void;
  onGenerateQuote: () => void;
  onExecuteExchange: () => void;
  ngnBalance: number;
  usdBalance: number;
}

function ConversionModal({
  isOpen, onClose, conversion, quoteExpiresIn, direction,
  modalStep, modalError, onSetDirection, onSetAmount,
  onGenerateQuote, onExecuteExchange, ngnBalance, usdBalance,
}: ConversionModalProps) {
  if (!isOpen) return null;

  const isNgnToUsd = direction === 'ngn-to-usd';
  const src = isNgnToUsd ? 'NGN' : 'USD';
  const tgt = isNgnToUsd ? 'USD' : 'NGN';
  const srcSym = isNgnToUsd ? '₦' : '$';

  const isProcessing = modalStep === 'exchanging';
  const showConfirm = modalStep === 'quote_received' || modalStep === 'exchanging';

  const srcBalFmt = isNgnToUsd ? fmtNgn(ngnBalance) : fmtUsd(usdBalance);
  const tgtAmt = conversion.targetAmount ?? 0;
  const srcAmt = parseFloat(conversion.sourceAmount || '0');
  const displaySend = isNgnToUsd ? fmtNgn(srcAmt) : fmtUsd(srcAmt);
  const displayReceive = isNgnToUsd
    ? `$${(tgtAmt / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : `₦${(tgtAmt / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const rate = conversion.exchangeRate
    ? `1 USD = ₦${conversion.exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isProcessing ? onClose : undefined} />
      <div className="relative w-full max-w-2xl animate-in zoom-in-95">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d71927] text-sm font-extrabold text-white">
                  {showConfirm ? 2 : 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {showConfirm ? 'Review & Confirm' : 'Enter Amount'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {showConfirm ? 'Review the quote and complete your exchange.' : `How much ${src} do you want to convert?`}
                  </p>
                </div>
              </div>
              <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />
              <button onClick={onClose} disabled={isProcessing}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors disabled:opacity-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_280px]">
            {/* ─── Left ─── */}
            {showConfirm ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle2 className={`h-5 w-5 text-green-600 flex-shrink-0 ${isProcessing ? 'animate-pulse' : ''}`} />
                  <div>
                    <p className="text-sm font-bold text-green-800">Quote Generated</p>
                    <p className="text-xs text-green-600">
                      {isProcessing
                        ? 'Processing your exchange...'
                        : `Rate locked for ${quoteExpiresIn !== null
                            ? `${Math.floor(quoteExpiresIn / 60)}:${(quoteExpiresIn % 60).toString().padStart(2, '0')}`
                            : '2:00'}`}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">You send</span>
                    <span className="text-sm font-bold text-gray-900">{displaySend}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">You receive</span>
                    <span className="text-xl font-black text-green-700">{displayReceive}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Exchange rate</span>
                    <span className="text-sm font-bold text-gray-900">{rate}</span>
                  </div>
                  {quoteExpiresIn !== null && !isProcessing && (
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Expires in
                      </span>
                      <span className={`text-sm font-bold ${quoteExpiresIn < 30 ? 'text-red-600' : 'text-gray-900'}`}>
                        {Math.floor(quoteExpiresIn / 60)}:{(quoteExpiresIn % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {modalError && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" /> {modalError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => { onSetAmount(''); }} disabled={isProcessing}
                    className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={onExecuteExchange} disabled={isProcessing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#d71927] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#b81420] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                    {isProcessing ? (
                      <><Loader className="h-4 w-4 animate-spin" /> Exchanging...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Confirm & Exchange</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <button onClick={() => { onSetDirection(isNgnToUsd ? 'USD' : 'NGN', isNgnToUsd ? 'NGN' : 'USD'); }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-50 px-4 py-3.5 hover:bg-gray-100 transition-colors">
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black text-white bg-[#d71927]">{src}</span>
                    {src}
                  </span>
                  <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black text-white bg-blue-600">{tgt}</span>
                    {tgt}
                  </span>
                </button>

                <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                  <p className="text-xs font-semibold text-blue-700">{src} Balance: {srcBalFmt}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-900">Amount ({src})</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">{srcSym}</span>
                    <input type="number" step={isNgnToUsd ? '100' : '0.01'} min="0"
                      value={conversion.sourceAmount}
                      onChange={(e) => onSetAmount(e.target.value)}
                      placeholder={isNgnToUsd ? '100,000' : '50.00'}
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-10 pr-4 text-lg font-bold text-gray-900 placeholder-gray-400 focus:border-[#d71927] focus:outline-none focus:ring-2 focus:ring-red-100 transition-colors"
                      autoFocus
                    />
                  </div>
                </div>

                {modalError && (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" /> {modalError}
                  </div>
                )}

                <button onClick={onGenerateQuote} disabled={!conversion.sourceAmount}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d71927] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#b81420] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                  <ArrowRightLeft className="h-4 w-4" /> Generate Quote
                </button>
              </div>
            )}

            {/* ─── Right: Sidebar ─── */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d71927]">
                    <span className="text-[10px] font-black text-white">₦</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">NGN</p>
                  <p className="ml-auto text-sm font-bold text-gray-900">{fmtNgn(ngnBalance)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                    <DollarSign className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">USD</p>
                  <p className="ml-auto text-sm font-bold text-gray-900">{fmtUsd(usdBalance)}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">Note</p>
                <p className="mt-2 text-[11px] leading-5 text-gray-600">
                  Rates are locked for 2 minutes after quote generation. Make sure you have sufficient balance before confirming.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
