'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, CreditCard, DollarSign, Landmark, Banknote, Plus, TrendingDown, TrendingUp, Wallet, ArrowRightLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Toast } from '@/components/shared/Toast';
import { Badge } from '@/components/shared/Badge';
import { CardSkeleton } from '@/components/shared/SkeletonLoader';
import { UsdWalletCard, ConversionModal } from '@/components/dashboard/wallet';
import { useUsdWallet } from '@/hooks/useUsdWallet';
import { walletService } from '@/services/wallet.service';
import { useAuthStore } from '@/store/auth.store';

type WalletTab = 'ngn' | 'usd';

interface NgnTransaction {
  id: string;
  type: 'debit' | 'credit';
  description: string;
  amount: number;
  date: string;
  status: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  last4?: string;
  account?: string;
  provider?: string;
  default: boolean;
}

interface NgnWalletData {
  balance: number;
  currency: string;
  last_updated: string;
  transactions: NgnTransaction[];
  payment_methods: PaymentMethod[];
}

const QUICK_FUND = [5000, 10000, 25000, 50000, 100000];

const FALLBACK: NgnWalletData = {
  balance: 125000,
  currency: 'NGN',
  last_updated: new Date().toISOString(),
  transactions: [
    { id: 'TXN001', type: 'debit', description: 'Airtime Purchase - MTN', amount: 5000, date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
    { id: 'TXN002', type: 'credit', description: 'Fund Wallet - Card', amount: 50000, date: new Date(Date.now() - 172800000).toISOString(), status: 'completed' },
  ],
  payment_methods: [
    { id: '1', type: 'card', name: 'Visa Card', last4: '4242', default: true },
    { id: '2', type: 'bank', name: 'GT Bank', account: '0123456789', default: false },
  ],
};

function fmt(amount: number): string {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export default function WalletPage() {
  const { user } = useAuthStore();

  const {
    usdWalletState, formattedUsdBalance, fetchUsdWallet,
    conversion, quoteExpiresIn, setConversionDirection,
    setConversionAmount, generateQuote, executeExchange, resetConversion,
  } = useUsdWallet();

  const [activeWalletTab, setActiveWalletTab] = useState<WalletTab>('ngn');

  // NGN state
  const [ngnWallet, setNgnWallet] = useState<NgnWalletData | null>(null);
  const [ngnLoading, setNgnLoading] = useState(true);
  const [ngnTab, setNgnTab] = useState<'overview' | 'fund' | 'methods'>('overview');
  const [fundAmount, setFundAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');

  // Conversion modal
  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [conversionDirection, setConversionDirectionState] = useState<'ngn-to-usd' | 'usd-to-ngn'>('ngn-to-usd');

  useEffect(() => {
    (async () => {
      setNgnLoading(true);
      try {
        const res = await walletService.getBalance();
        if (res.success && res.data) {
          setNgnWallet({ balance: res.data.balance, currency: 'NGN', last_updated: new Date().toISOString(), transactions: [], payment_methods: [] });
        } else {
          setNgnWallet(FALLBACK);
        }
      } catch { setNgnWallet(FALLBACK); }
      finally { setNgnLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (activeWalletTab !== 'ngn' || !user?.id || !ngnWallet) return;
    (async () => {
      try {
        const res = await walletService.getTransactions();
        if (res.success && res.data?.data) {
          const txs = res.data.data.map((txn: any) => ({
            id: txn.id,
            type: (txn.type === 'topup' ? 'credit' : 'debit') as 'debit' | 'credit',
            description: txn.description,
            amount: txn.amount,
            date: new Date(txn.created_at).toISOString(),
            status: 'completed',
          }));
          setNgnWallet(prev => prev ? { ...prev, transactions: txs } : prev);
        }
      } catch { /* */ }
    })();
  }, [user?.id, activeWalletTab]);

  const handleFund = () => {
    if (!fundAmount || isNaN(Number(fundAmount))) return;
    setFundAmount('');
  };

  const openConversion = (dir: 'ngn-to-usd' | 'usd-to-ngn') => {
    setConversionDirectionState(dir);
    setConversionDirection(dir === 'ngn-to-usd' ? 'NGN' : 'USD', dir === 'ngn-to-usd' ? 'USD' : 'NGN');
    setConversionModalOpen(true);
  };

  const closeConversion = () => { setConversionModalOpen(false); resetConversion(); };
  const genQuote = useCallback(async () => generateQuote(), [generateQuote]);
  const execExchange = useCallback(async (): Promise<boolean> => {
    const ok = await executeExchange();
    if (ok) { setConversionModalOpen(false); resetConversion(); }
    return ok;
  }, [executeExchange, resetConversion]);

  if (ngnLoading && activeWalletTab === 'ngn') return <CardSkeleton count={3} />;

  const bal = ngnWallet?.balance ?? 0;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="space-y-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* ═══ Step-indicator header (matching data page) ═══ */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              onClick={() => setActiveWalletTab('ngn')}
              className="flex items-center gap-3"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white ${activeWalletTab === 'ngn' ? 'bg-[#d71927]' : 'bg-gray-300'}`}>
                <span className="text-xs font-black">₦</span>
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${activeWalletTab === 'ngn' ? 'text-gray-900' : 'text-gray-400'}`}>NGN Wallet</p>
                <p className="text-xs text-gray-500">Manage your Naira balance</p>
              </div>
            </button>

            <div className="hidden h-[2px] flex-1 bg-gray-200 sm:block" />

            <button
              onClick={() => setActiveWalletTab('usd')}
              className="flex items-center gap-3"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white ${activeWalletTab === 'usd' ? 'bg-[#d71927]' : 'bg-gray-300'}`}>
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${activeWalletTab === 'usd' ? 'text-gray-900' : 'text-gray-400'}`}>USD Wallet</p>
                <p className="text-xs text-gray-500">Manage your Dollar balance</p>
              </div>
            </button>
          </div>
        </div>

        {/* ═══ NGN Wallet Content ═══ */}
        {activeWalletTab === 'ngn' && (
          <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
            {/* ── LEFT: Main Content ── */}
            <div className="space-y-8">
              {/* Sub-tabs */}
              <div className="flex gap-6 border-b border-gray-100">
                {(['overview', 'fund', 'methods'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setNgnTab(tab)}
                    className={`border-b-2 px-1 pb-3 text-sm font-bold transition-all ${
                      ngnTab === tab
                        ? 'border-[#d71927] text-[#d71927]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab === 'overview' ? 'Transactions' : tab === 'fund' ? 'Fund Wallet' : 'Payment Methods'}
                  </button>
                ))}
              </div>

              {/* ── Overview ── */}
              {ngnTab === 'overview' && (
                <div className="space-y-3">
                  {(ngnWallet?.transactions?.length ?? 0) === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                      <TrendingUp className="mx-auto text-gray-300" size={32} />
                      <p className="mt-3 text-sm font-bold text-gray-900">No transactions yet</p>
                      <p className="mt-1 text-xs text-gray-500">Your NGN transaction history will appear here.</p>
                    </div>
                  ) : (
                    ngnWallet!.transactions.map(txn => {
                      const isCredit = txn.type === 'credit';
                      return (
                        <div key={txn.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                              {isCredit ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-extrabold text-gray-900 truncate">{txn.description}</p>
                              <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0 ml-3">
                            <p className={`text-sm font-extrabold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                              {isCredit ? '+' : '-'}{fmt(txn.amount)}
                            </p>
                            <Badge variant="success" size="sm">{txn.status}</Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ── Fund Wallet ── */}
              {ngnTab === 'fund' && (
                <div className="space-y-5 max-w-lg">
                  <div>
                    <label className="mb-4 block text-sm font-bold text-gray-900">Quick Amount</label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_FUND.map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setFundAmount(String(amt))}
                          className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                            fundAmount === String(amt)
                              ? 'bg-[#d71927] text-white shadow-sm shadow-red-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {fmt(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-4 block text-sm font-bold text-gray-900">Custom Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₦</span>
                      <Input type="number" placeholder="Enter amount" value={fundAmount} onChange={e => setFundAmount(e.target.value)} className="h-13 rounded-2xl border-gray-200 bg-white pl-8 text-base focus:border-[#d71927]" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-4 block text-sm font-bold text-gray-900">Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'card', label: 'Debit Card', icon: CreditCard },
                        { value: 'bank', label: 'Bank Transfer', icon: Landmark },
                        { value: 'mobile_money', label: 'Mobile Money', icon: Banknote },
                      ].map(m => {
                        const Icon = m.icon;
                        const a = selectedMethod === m.value;
                        return (
                          <button key={m.value} type="button" onClick={() => setSelectedMethod(m.value)}
                            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all ${a ? 'border-[#d71927] shadow-sm shadow-red-200' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                            <Icon className={`h-5 w-5 ${a ? 'text-[#d71927]' : 'text-gray-400'}`} />
                            <span className={`text-xs font-bold ${a ? 'text-[#d71927]' : 'text-gray-500'}`}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button fullWidth onClick={handleFund} className="h-13 rounded-2xl bg-[#d71927] text-base font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420]">
                    Continue to Payment <ChevronRight className="ml-2" size={20} />
                  </Button>
                </div>
              )}

              {/* ── Payment Methods ── */}
              {ngnTab === 'methods' && (
                <div>
                  {(ngnWallet?.payment_methods?.length ?? 0) === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                      <CreditCard className="mx-auto text-gray-300" size={32} />
                      <p className="mt-3 text-sm font-bold text-gray-900">No payment methods</p>
                      <p className="mt-1 text-xs text-gray-500">Add a payment method to fund your wallet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ngnWallet!.payment_methods.map(method => (
                        <div key={method.id} className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3.5 transition-colors hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                              <CreditCard className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-gray-900">{method.name}</p>
                              <p className="text-xs text-gray-500">
                                {method.type === 'card' ? `•••• ${method.last4}` : method.type === 'bank' ? method.account : method.provider}
                              </p>
                            </div>
                          </div>
                          {method.default && <Badge variant="success" size="sm">Default</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                  <Button fullWidth variant="outline" className="mt-5 h-12 rounded-2xl border-gray-200 text-sm font-bold">
                    <Plus className="mr-2 h-4 w-4" /> Add Payment Method
                  </Button>
                </div>
              )}
            </div>

            {/* ── RIGHT: Sidebar Summary ── */}
            <aside className="rounded-2xl border border-gray-200 bg-white p-5 self-start">
              <p className="text-sm font-bold text-gray-900">Wallet Summary</p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d71927]">
                      <span className="text-xs font-black text-white">₦</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Available Balance</p>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{fmt(bal)}</p>
                  <p className="mt-1 text-xs text-gray-400">{ngnWallet ? `Updated ${new Date(ngnWallet.last_updated).toLocaleDateString()}` : ''}</p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Currency</p>
                  <p className="mt-2 text-sm font-bold text-gray-900">NGN — Nigerian Naira</p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Total Transactions</p>
                  <p className="mt-2 text-sm font-bold text-gray-900">{ngnWallet?.transactions?.length ?? 0}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Button
                  fullWidth
                  onClick={() => setNgnTab('fund')}
                  className="h-12 rounded-2xl bg-[#d71927] text-sm font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420]"
                >
                  <Plus className="mr-2 h-4 w-4" /> Fund NGN Wallet
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => openConversion('ngn-to-usd')}
                  className="h-12 rounded-2xl border-gray-200 text-sm font-bold"
                >
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Convert to USD
                </Button>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Note</p>
                <p className="mt-2 text-xs leading-6 text-gray-600">
                  Fund your NGN wallet to start transacting. You can also convert NGN to USD for your virtual cards.
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* ═══ USD Wallet Content ═══ */}
        {activeWalletTab === 'usd' && (
          <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_360px]">
            {/* ── LEFT: USD Balance + Activity ── */}
            <div className="space-y-6">
              {/* USD Balance Card */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d71927]">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">USD Balance</p>
                        <p className="text-3xl font-black text-gray-900">{formattedUsdBalance}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {usdWalletState.lastSyncedAt ? `Synced ${new Date(usdWalletState.lastSyncedAt).toLocaleString()}` : 'Not yet synced'}
                        </p>
                      </div>
                    </div>
                    <button onClick={fetchUsdWallet} disabled={usdWalletState.isLoading}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
                      <RefreshCw className={`h-4 w-4 text-gray-600 ${usdWalletState.isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button onClick={() => openConversion('ngn-to-usd')}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-[#d71927]" /> NGN → USD
                    </button>
                    <button onClick={() => openConversion('usd-to-ngn')}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-[#d71927]" /> USD → NGN
                    </button>
                  </div>
                </div>
              </div>

              {/* USD Activity */}
              <div>
                <p className="mb-4 text-sm font-bold text-gray-900">Recent USD Activity</p>
                {(usdWalletState.recentTransactions?.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
                    <DollarSign className="mx-auto text-gray-300" size={32} />
                    <p className="mt-3 text-sm font-bold text-gray-900">No USD activity yet</p>
                    <p className="mt-1 text-xs text-gray-500">Convert NGN to USD to get started.</p>
                    <Button onClick={() => openConversion('ngn-to-usd')} className="mt-4 rounded-xl bg-[#d71927] px-4 py-2 text-xs font-bold text-white">
                      Convert NGN → USD
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {usdWalletState.recentTransactions.slice(0, 5).map(txn => {
                      const credit = ['credit', 'conversion_in', 'refund'].includes(txn.type);
                      return (
                        <div key={txn.id} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3.5 transition-all hover:border-gray-300 hover:bg-gray-50">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${credit ? 'bg-green-100' : 'bg-red-100'}`}>
                              {credit ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-extrabold text-gray-900 truncate">
                                {{ credit: 'Credit', debit: 'Debit', conversion_in: 'Conversion In', conversion_out: 'Conversion Out', card_funding: 'Card Funding', refund: 'Refund' }[txn.type] || txn.type}
                              </p>
                              <p className="text-xs text-gray-500">{new Date(txn.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <p className={`text-sm font-extrabold flex-shrink-0 ml-3 ${credit ? 'text-green-600' : 'text-red-500'}`}>
                            {credit ? '+' : '-'}${(txn.amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: USD Sidebar ── */}
            <aside className="rounded-2xl border border-gray-200 bg-white p-5 self-start">
              <p className="text-sm font-bold text-gray-900">USD Wallet</p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d71927]">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">USD Balance</p>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{formattedUsdBalance}</p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Currency</p>
                  <p className="mt-2 text-sm font-bold text-gray-900">USD — US Dollar</p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Transactions</p>
                  <p className="mt-2 text-sm font-bold text-gray-900">{usdWalletState.recentTransactions?.length ?? 0}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Button fullWidth onClick={() => openConversion('ngn-to-usd')}
                  className="h-12 rounded-2xl bg-[#d71927] text-sm font-bold text-white shadow-sm shadow-red-300 hover:bg-[#b81420]">
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Convert NGN → USD
                </Button>
                <Link href="/dashboard/virtual-card">
                  <Button fullWidth variant="outline" className="h-12 rounded-2xl border-gray-200 text-sm font-bold">
                    <CreditCard className="mr-2 h-4 w-4" /> Fund Virtual Card
                  </Button>
                </Link>
              </div>

              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Note</p>
                <p className="mt-2 text-xs leading-6 text-gray-600">
                  Convert NGN to USD to fund virtual cards for international payments. Rates are locked for 2 minutes.
                </p>
              </div>
            </aside>
          </div>
        )}
      </Card>

      {/* Conversion Modal */}
      <ConversionModal
        isOpen={conversionModalOpen}
        onClose={closeConversion}
        conversion={conversion}
        quoteExpiresIn={quoteExpiresIn}
        direction={conversionDirection}
        onSetDirection={(source, target) => {
          setConversionDirection(source, target);
          setConversionDirectionState(source === 'NGN' ? 'ngn-to-usd' : 'usd-to-ngn');
        }}
        onSetAmount={setConversionAmount}
        onGenerateQuote={genQuote}
        onExecuteExchange={execExchange}
        ngnBalance={bal}
        usdBalance={usdWalletState.balance}
      />

      <Toast />
    </div>
  );
}
