'use client';

import { Copy, CheckCircle, Banknote } from 'lucide-react';
import { useState } from 'react';
import { DedicatedAccount } from '@/services/customer.service';
import { Card } from '@/components/shared/Card';

interface DedicatedAccountCardProps {
  account: DedicatedAccount;
  isLoading?: boolean;
}

export function DedicatedAccountCard({ account, isLoading }: DedicatedAccountCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Banknote className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Dedicated Account
            </p>
          </div>

          <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900">
            {account.account_name}
          </h3>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Account Number
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="font-mono text-lg font-bold text-gray-900">
                  {account.account_number}
                </p>
                <button
                  onClick={handleCopyAccount}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                  title="Copy account number"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Bank Name
              </p>
              <p className="mt-1 text-base font-bold text-gray-900">
                {account.bank_name}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-white/60 px-3 py-2.5 text-xs leading-5 text-gray-600">
            <p>
              <span className="font-semibold text-gray-700">Tip:</span> Use this account to receive payments directly. Keep your account number safe.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
