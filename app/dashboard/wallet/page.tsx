'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import { CreditCard, Plus, TrendingDown, TrendingUp } from 'lucide-react';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [fundAmount, setFundAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');

  useEffect(() => {
    setWallet({
      balance: 125000,
      currency: 'NGN',
      last_updated: '2024-01-25T10:30:00Z',
      transactions: [
        {
          id: 'TXN001',
          type: 'debit',
          description: 'Airtime Purchase - MTN',
          amount: 5000,
          date: '2024-01-25 14:30',
          status: 'completed',
        },
        {
          id: 'TXN002',
          type: 'credit',
          description: 'Fund Wallet - Card',
          amount: 50000,
          date: '2024-01-24 11:15',
          status: 'completed',
        },
        {
          id: 'TXN003',
          type: 'debit',
          description: 'Bills Payment - NEPA',
          amount: 25000,
          date: '2024-01-23 09:45',
          status: 'completed',
        },
      ],
      payment_methods: [
        { id: '1', type: 'card', name: 'Visa Card', last4: '4242', default: true },
        { id: '2', type: 'bank', name: 'GT Bank', account: '0123456789', default: false },
        {
          id: '3',
          type: 'mobile_money',
          name: 'Mobile Money',
          provider: 'MTN Money',
          default: false,
        },
      ],
    });
    setLoading(false);
  }, []);

  const handleFundWallet = () => {
    if (!fundAmount || isNaN(Number(fundAmount))) {
      alert('Please enter a valid amount');
      return;
    }
    console.log(`Funding wallet with ₦${fundAmount} using ${selectedMethod}`);
    setFundAmount('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your account balance and transactions</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-[#a9b7ff] to-[#9da9ff] text-white">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-white/80 text-sm font-medium">Available Balance</p>
            <p className="text-4xl font-bold mt-2">₦{wallet.balance.toLocaleString()}</p>
            <p className="text-white/70 text-sm mt-2">
              Last updated: {new Date(wallet.last_updated).toLocaleDateString()}
            </p>
          </div>
          <CreditCard size={32} className="opacity-80" />
        </div>

        <Button fullWidth className="bg-white text-[#a9b7ff] hover:bg-gray-100">
          <Plus size={18} className="mr-2" />
          Add Funds
        </Button>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-8">
            {['overview', 'fund', 'methods'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? 'border-[#a9b7ff] text-[#a9b7ff]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
            <div className="space-y-3">
              {wallet.transactions.map((txn: any) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {txn.type === 'debit' ? (
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <TrendingDown className="text-red-600" size={20} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="text-green-600" size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{txn.description}</p>
                      <p className="text-sm text-gray-600">{txn.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        txn.type === 'debit' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {txn.type === 'debit' ? '-' : '+'}₦{txn.amount.toLocaleString()}
                    </p>
                    <Badge variant="success" size="sm" className="mt-1">
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fund Tab */}
        {activeTab === 'fund' && (
          <div className="space-y-6 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-600 font-semibold">₦</span>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a9b7ff]"
              >
                <option value="card">Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div className="bg-[#f7f8ff] border border-[#e8ebff] rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Charges:</span> Processing fees may apply
                depending on your payment method. These will be displayed before confirmation.
              </p>
            </div>

            <Button fullWidth onClick={handleFundWallet}>
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h2>

            <div className="space-y-3">
              {wallet.payment_methods.map((method: any) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <CreditCard className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">
                          {method.type === 'card'
                            ? `•••• ${method.last4}`
                            : method.type === 'bank'
                            ? method.account
                            : method.provider}
                        </p>
                      </div>
                    </div>
                    {method.default && (
                      <Badge variant="success" size="sm">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button fullWidth variant="outline">
              <Plus size={18} className="mr-2" />
              Add New Payment Method
            </Button>
          </div>
        )}
      </Card>

      {/* Wallet Tips */}
      <Card className="bg-green-50 border-2 border-green-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Tips</h2>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Keep your wallet funded to avoid transaction failures
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Different payment methods may have different minimum amounts
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            All transactions are secure and encrypted
          </li>
        </ul>
      </Card>
    </div>
  );
}
