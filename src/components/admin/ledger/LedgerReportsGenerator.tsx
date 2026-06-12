/**
 * Ledger Reports Generator Component
 * Date: June 12, 2026
 * 
 * Component for generating financial reports:
 * - Trial Balance Report
 * - Account Ledger Report
 * - Export to CSV/PDF
 */

'use client';

import React, { useState } from 'react';
import {
  TrialBalanceReport,
  AccountLedgerReport,
  GenerateTrialBalanceRequest,
  GenerateAccountLedgerRequest,
  ExportReportRequest,
} from '@/types/ledger.types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useLedger } from '@/hooks/useLedger';

interface LedgerReportsGeneratorProps {
  isLoading: boolean;
}

type ReportType = 'trial_balance' | 'account_ledger';

export const LedgerReportsGenerator: React.FC<LedgerReportsGeneratorProps> = ({ isLoading }) => {
  const {
    generateTrialBalanceReport,
    generateAccountLedgerReport,
    exportReport,
    state,
  } = useLedger();

  const [activeTab, setActiveTab] = useState<ReportType>('trial_balance');
  const [trialBalanceParams, setTrialBalanceParams] = useState<GenerateTrialBalanceRequest>({
    as_of_date: new Date().toISOString().split('T')[0],
    include_inactive_accounts: false,
  });
  const [accountLedgerParams, setAccountLedgerParams] = useState<GenerateAccountLedgerRequest>({
    account_id: 0,
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const handleGenerateTrialBalance = async () => {
    await generateTrialBalanceReport(trialBalanceParams);
  };

  const handleGenerateAccountLedger = async () => {
    if (!accountLedgerParams.account_id) {
      alert('Please select an account');
      return;
    }
    await generateAccountLedgerReport(accountLedgerParams);
  };

  const handleExportTrialBalance = async () => {
    if (state.trialBalanceReport) {
      await exportReport({
        report_type: 'trial_balance',
        format: 'csv',
        start_date: trialBalanceParams.as_of_date,
        end_date: trialBalanceParams.as_of_date,
      });
    }
  };

  const handleExportAccountLedger = async () => {
    if (state.accountLedgerReport) {
      await exportReport({
        report_type: 'account_ledger',
        format: 'csv',
        account_id: accountLedgerParams.account_id,
        start_date: accountLedgerParams.start_date,
        end_date: accountLedgerParams.end_date,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === 'trial_balance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Trial Balance Report
        </button>
        <button
          onClick={() => setActiveTab('account_ledger')}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === 'account_ledger'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Account Ledger Report
        </button>
      </div>

      {/* Trial Balance Report Tab */}
      {activeTab === 'trial_balance' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Balance Report</h3>
          <p className="text-sm text-gray-600 mb-6">
            Shows all account balances at a specific date. Debits must equal credits.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
              <input
                type="date"
                value={trialBalanceParams.as_of_date}
                onChange={(e) =>
                  setTrialBalanceParams({ ...trialBalanceParams, as_of_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={trialBalanceParams.include_inactive_accounts}
                onChange={(e) =>
                  setTrialBalanceParams({
                    ...trialBalanceParams,
                    include_inactive_accounts: e.target.checked,
                  })
                }
                className="rounded"
              />
              <span className="text-sm text-gray-700">Include Inactive Accounts</span>
            </label>

            <Button
              onClick={handleGenerateTrialBalance}
              disabled={isLoading || state.isLoadingReports}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {state.isLoadingReports ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {/* Trial Balance Report Display */}
          {state.trialBalanceReport && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Report Summary</h4>
                  <Button
                    onClick={handleExportTrialBalance}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Export CSV
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Debits</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{state.trialBalanceReport.total_debits.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Credits</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{state.trialBalanceReport.total_credits.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p
                      className={`text-lg font-bold ${
                        state.trialBalanceReport.is_balanced ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {state.trialBalanceReport.is_balanced ? 'Balanced ✓' : 'Unbalanced ✗'}
                    </p>
                  </div>
                </div>

                {/* Accounts Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700">Account</th>
                        <th className="px-4 py-2 text-left text-gray-700">Type</th>
                        <th className="px-4 py-2 text-right text-gray-700">Balance</th>
                        <th className="px-4 py-2 text-left text-gray-700">Side</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {state.trialBalanceReport.accounts.map((account, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{account.account_name}</td>
                          <td className="px-4 py-2 text-gray-600">{account.account_type}</td>
                          <td className="px-4 py-2 text-right text-gray-900 font-medium">
                            ₦{account.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-gray-600">{account.side.toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Account Ledger Report Tab */}
      {activeTab === 'account_ledger' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Ledger Report</h3>
          <p className="text-sm text-gray-600 mb-6">
            Shows all transactions for a specific account within a date range.
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <select
                value={accountLedgerParams.account_id || ''}
                onChange={(e) =>
                  setAccountLedgerParams({
                    ...accountLedgerParams,
                    account_id: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Select an account...</option>
                {state.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_code} - {account.account_name} ({account.currency}) - Balance: ₦{account.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={accountLedgerParams.start_date}
                  onChange={(e) =>
                    setAccountLedgerParams({
                      ...accountLedgerParams,
                      start_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={accountLedgerParams.end_date}
                  onChange={(e) =>
                    setAccountLedgerParams({
                      ...accountLedgerParams,
                      end_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateAccountLedger}
              disabled={isLoading || state.isLoadingReports}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {state.isLoadingReports ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {/* Account Ledger Report Display */}
          {state.accountLedgerReport && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">
                    {state.accountLedgerReport.account.account_name}
                  </h4>
                  <Button
                    onClick={handleExportAccountLedger}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Export CSV
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Opening Balance</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{state.accountLedgerReport.opening_balance.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Debits</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{state.accountLedgerReport.total_debits.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Credits</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{state.accountLedgerReport.total_credits.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Closing Balance</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{state.accountLedgerReport.closing_balance.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                {/* Entries Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700">Date</th>
                        <th className="px-4 py-2 text-left text-gray-700">Reference</th>
                        <th className="px-4 py-2 text-left text-gray-700">Description</th>
                        <th className="px-4 py-2 text-right text-gray-700">Debit</th>
                        <th className="px-4 py-2 text-right text-gray-700">Credit</th>
                        <th className="px-4 py-2 text-right text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {state.accountLedgerReport.entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-600">
                            {new Date(entry.entry_date).toLocaleDateString('en-NG')}
                          </td>
                          <td className="px-4 py-2 text-gray-900 font-medium">
                            {entry.entry_reference}
                          </td>
                          <td className="px-4 py-2 text-gray-600">{entry.description}</td>
                          <td className="px-4 py-2 text-right text-gray-900">
                            {entry.debit > 0
                              ? `₦${entry.debit.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                              : '-'}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-900">
                            {entry.credit > 0
                              ? `₦${entry.credit.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                              : '-'}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-900 font-medium">
                            ₦{entry.balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
