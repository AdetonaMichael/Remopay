'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import { BarChart3, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  useEffect(() => {
    setReports([
      {
        id: '1',
        name: 'Daily Transaction Report',
        description: 'Summary of all transactions for a specific day',
        frequency: 'Daily',
        lastGenerated: '2024-01-25 23:59',
      },
      {
        id: '2',
        name: 'Weekly Revenue Report',
        description: 'Weekly revenue breakdown by provider and type',
        frequency: 'Weekly',
        lastGenerated: '2024-01-22 23:59',
      },
      {
        id: '3',
        name: 'User Activity Report',
        description: 'New users, active users, and user engagement metrics',
        frequency: 'Weekly',
        lastGenerated: '2024-01-22 23:59',
      },
      {
        id: '4',
        name: 'Refund Report',
        description: 'All refund transactions and reasons',
        frequency: 'Daily',
        lastGenerated: '2024-01-25 23:59',
      },
      {
        id: '5',
        name: 'Provider Performance',
        description: 'Transaction volume and success rate by provider',
        frequency: 'Weekly',
        lastGenerated: '2024-01-22 23:59',
      },
    ]);
    setLoading(false);
  }, []);

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
        <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-2">Generate and manage system reports</p>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedReport === report.id
                    ? 'border-[#a9b7ff] bg-[#f7f8ff]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedReport(report.id)}
              >
                <div className="flex items-start gap-3">
                  <BarChart3 className="text-[#a9b7ff] mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {report.frequency}
                      </span>
                      <span className="text-xs text-gray-500">
                        Last: {report.lastGenerated}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedReport && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Report Options</h3>
              <Button>
                <Download size={18} className="mr-2" />
                Download Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a9b7ff] mt-4">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a9b7ff] mt-4">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a9b7ff]">
                  <option>Summary</option>
                  <option>Detailed</option>
                  <option>Executive Summary</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Custom Report Builder</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
            <input
              type="text"
              placeholder="Enter custom report name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a9b7ff]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metrics</label>
              <select multiple className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Total Revenue</option>
                <option>Transaction Count</option>
                <option>User Count</option>
                <option>Success Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grouping</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a9b7ff]">
                <option>By Day</option>
                <option>By Week</option>
                <option>By Month</option>
                <option>By Provider</option>
              </select>
            </div>
          </div>

          <Button fullWidth>Generate Custom Report</Button>
        </div>
      </Card>
    </div>
  );
}
