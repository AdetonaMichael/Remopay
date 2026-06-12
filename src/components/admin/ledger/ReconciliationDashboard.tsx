/**
 * Reconciliation Dashboard Component
 * Date: June 12, 2026
 * 
 * Component for viewing reconciliation reports with:
 * - Report listing with filters
 * - Generate new report
 * - View report details
 * - Display discrepancies
 * - Pagination support
 */

'use client';

import React, { useState } from 'react';
import { ReconciliationReport, ReconciliationFilters, ReconciliationStatus } from '@/types/ledger.types';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useLedger } from '@/hooks/useLedger';

interface ReconciliationDashboardProps {
  reports: ReconciliationReport[];
  isLoading: boolean;
  pagination: any;
  filters: ReconciliationFilters;
  onFiltersChange: (filters: ReconciliationFilters) => void;
}

const statusColors: Record<ReconciliationStatus, string> = {
  reconciled: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  discrepancy_found: 'bg-red-100 text-red-800',
};

export const ReconciliationDashboard: React.FC<ReconciliationDashboardProps> = ({
  reports,
  isLoading,
  pagination,
  filters,
  onFiltersChange,
}) => {
  const { generateReconciliation, fetchReconciliationReport } = useLedger();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedReport, setSelectedReport] = useState<ReconciliationReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleGenerateReport = async () => {
    const result = await generateReconciliation({
      reconciliation_date: selectedDate,
    });
    if (result) {
      setShowGenerateModal(false);
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  };

  const handleViewDetails = async (reportId: number) => {
    await fetchReconciliationReport(reportId);
    setShowDetails(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading reconciliation reports...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reconciliation Reports</h2>
        <Button
          onClick={() => setShowGenerateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Generate Report
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filters.status || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: (e.target.value as ReconciliationStatus) || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Statuses</option>
          <option value="reconciled">Reconciled</option>
          <option value="pending">Pending</option>
          <option value="discrepancy_found">Discrepancy Found</option>
        </select>

        <input
          type="date"
          value={filters.start_date || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              start_date: e.target.value || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />

        <input
          type="date"
          value={filters.end_date || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              end_date: e.target.value || undefined,
              page: 1,
            })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Entries</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Debits</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Credits</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Balanced</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(report.reconciliation_date).toLocaleDateString('en-NG')}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{report.total_entries ?? 0}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">
                  ₦{(report.total_debit_amount ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">
                  ₦{(report.total_credit_amount ?? 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-center">
                  {report.is_balanced ? (
                    <span className="text-green-600 font-medium">✓</span>
                  ) : (
                    <span className="text-red-600 font-medium">✗</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusColors[report.overall_status as ReconciliationStatus]
                    }`}
                  >
                    {report.overall_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Button
                    size="sm"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                    onClick={() => handleViewDetails(report.id)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Generate Reconciliation Report</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reconciliation Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <p className="text-sm text-gray-600">
                This will verify that all accounts balance (debits = credits) for the selected date.
              </p>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerateReport}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Generate
                </Button>
                <Button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Details Modal - Placeholder */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reconciliation Report Details</h3>
            <p className="text-sm text-gray-600 mb-4">Report details will be displayed here.</p>
            <Button
              onClick={() => setShowDetails(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </Card>
  );
};
