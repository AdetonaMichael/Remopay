'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Filter,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  FileText,
  Download,
  Trash2,
  Edit,
  Play,
} from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { FilterPanel, type FilterField } from '@/components/shared/FilterPanel';
import { useFilters } from '@/hooks/useFilters';
import { Toast } from '@/utils/toast.utils';
import { Modal } from '@/components/shared/Modal';
import { reportService, Report, ReportType, ReportStatistics } from '@/services/report.service';
import { formatDate } from '@/utils/format.utils';
import { TableSkeleton } from '@/components/shared/SkeletonLoader';

interface ReportFilters {
  type: string;
  frequency: string;
  status: string;
  is_active: boolean | '';
  search: string;
}

// Define filter fields for FilterPanel
const REPORT_FILTER_FIELDS: FilterField[] = [
  {
    id: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Report name or ID...',
    helpText: 'Search by report name or ID',
  },
  {
    id: 'type',
    label: 'Report Type',
    type: 'select',
    options: [
      { value: 'transaction', label: 'Transaction' },
      { value: 'user', label: 'User' },
      { value: 'revenue', label: 'Revenue' },
      { value: 'analytics', label: 'Analytics' },
    ],
  },
  {
    id: 'frequency',
    label: 'Frequency',
    type: 'select',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' },
    ],
  },
  {
    id: 'is_active',
    label: 'Active Status',
    type: 'checkbox',
    helpText: 'Show only active reports',
  },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);

  // Use filters hook
  const {
    isOpen,
    filters,
    isLoading: filtersLoading,
    hasActiveFilters,
    openFilters,
    closeFilters,
    applyFilters,
    resetFilters,
    getActiveFilterCount,
  } = useFilters({
    fields: REPORT_FILTER_FIELDS,
    onFiltersChange: (newFilters) => {
      setCurrentPage(1);
      loadReports(1, newFilters);
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedForExport, setSelectedForExport] = useState<Report | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([loadReports(1), loadReportTypes(), loadStatistics()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadReports(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadReports = async (page = 1, filterValues?: Record<string, any>) => {
    try {
      setIsLoading(true);
      setError('');

      const filtersToUse = filterValues || filters;
      const params: Record<string, any> = {
        page: page,
        per_page: perPage,
      };

      if (filtersToUse.type) params.type = filtersToUse.type;
      if (filtersToUse.frequency) params.frequency = filtersToUse.frequency;
      if (filtersToUse.status) params.status = filtersToUse.status;
      if (filtersToUse.is_active !== '' && filtersToUse.is_active !== false) params.is_active = filtersToUse.is_active;
      if (filtersToUse.search) params.search = filtersToUse.search;

      const response = await reportService.getReports(params);
      setReports(response.data?.data || []);
      if (response.data?.pagination) {
        setTotalPages(response.data.pagination.last_page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      Toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportTypes = async () => {
    try {
      const response = await reportService.getReportTypes();
      setReportTypes(response.data?.types || []);
    } catch (err) {
      console.error('Failed to load report types', err);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await reportService.getStatistics();
      setStatistics(response.data || null);
    } catch (err) {
      console.error('Failed to load statistics', err);
    }
  };

  const handleGenerateReport = async (reportId: number) => {
    try {
      setGeneratingId(reportId);
      await reportService.generateReport(reportId);
      Toast.success('Report generation started');
      await loadReports(currentPage);
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportService.deleteReport(reportId);
      Toast.success('Report deleted successfully');
      await loadReports(currentPage);
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  const handleExportClick = (report: Report) => {
    setSelectedForExport(report);
    setShowExportModal(true);
  };

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 ring-1 ring-green-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'failed':
        return 'bg-red-50 text-red-700 ring-1 ring-red-200';
      default:
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
    }
  };

  const frequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'weekly':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'monthly':
        return 'bg-purple-50 text-purple-700 ring-1 ring-purple-200';
      case 'manual':
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
    }
  };

  if (isLoading && !reports.length) {
    return <TableSkeleton rows={8} cols={7} />;
  }

  return (
    <div className="min-h-screen space-y-8 bg-[#fafafa] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Reports Management</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create, schedule, and manage system reports
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="rounded-2xl bg-[#620707] px-5 py-3 text-white hover:bg-[#4d0505]"
        >
          <Plus className="mr-2 h-5 w-5" />
          New Report
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Reports</p>
            <h3 className="mt-2 text-3xl font-black">{statistics.total_reports}</h3>
          </Card>

          <Card className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active Reports</p>
            <h3 className="mt-2 text-3xl font-black text-emerald-700">
              {statistics.active_reports}
            </h3>
          </Card>

          <Card className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Scheduled</p>
            <h3 className="mt-2 text-3xl font-black text-blue-700">
              {statistics.scheduled_reports}
            </h3>
          </Card>

          <Card className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">By Type</p>
            <h3 className="mt-2 text-2xl font-black text-purple-700">
              {Object.keys(statistics.by_type).length}
            </h3>
          </Card>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Card className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex justify-end">
        <Button
          onClick={openFilters}
          className={`h-11 rounded-xl px-4 font-semibold transition ${
            hasActiveFilters
              ? 'bg-[#d71927] text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]'
              : 'border border-black/10 text-[#111] hover:bg-[#f8f8f8]'
          }`}
        >
          <Filter className="h-4 w-4 mr-2 inline" />
          Filters {hasActiveFilters && `(${getActiveFilterCount()})`}
        </Button>
      </div>

      {/* FilterPanel Component */}
      <FilterPanel
        title="Filter Reports"
        description="Narrow down reports by type, frequency, status, and search term"
        fields={REPORT_FILTER_FIELDS}
        isOpen={isOpen}
        onClose={closeFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        isLoading={filtersLoading}
        position="right"
        mobilePosition="auto"
      />

      {/* Reports Table */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  'Name',
                  'Type',
                  'Frequency',
                  'Status',
                  'Last Generated',
                  'Next Scheduled',
                  'Actions',
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500 ${
                      heading === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report.id} className="transition hover:bg-[#620707]/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#620707]/10 p-2 text-[#620707]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-950">{report.name}</p>
                          <p className="text-xs text-slate-500">ID: {report.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="rounded-full bg-[#620707]/10 px-3 py-1 text-xs font-bold text-[#620707]">
                        {report.type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge className={`rounded-full px-3 py-1 text-xs font-bold ${frequencyBadgeColor(report.frequency)}`}>
                        {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <Badge className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {report.last_generated_at
                        ? formatDate(report.last_generated_at)
                        : 'Never'}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {report.next_scheduled_at
                        ? formatDate(report.next_scheduled_at)
                        : '-'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={generatingId === report.id}
                          className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                          title="Generate report"
                        >
                          <Play className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleExportClick(report)}
                          className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title="Export report"
                        >
                          <Download className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowCreateModal(true);
                          }}
                          className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50"
                          title="Edit report"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-3xl bg-[#620707]/10 p-5 text-[#620707]">
                        <FileText className="h-8 w-8" />
                      </div>
                      <h3 className="mt-5 text-lg font-black">No reports found</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Create your first report to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Report Modal */}
      <CreateReportModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        onSuccess={() => {
          setShowCreateModal(false);
          setSelectedReport(null);
          loadReports();
          loadStatistics();
        }}
      />

      {/* Export Modal */}
      {selectedForExport && (
        <ExportReportModal
          isOpen={showExportModal}
          onClose={() => {
            setShowExportModal(false);
            setSelectedForExport(null);
          }}
          report={selectedForExport}
        />
      )}
    </div>
  );
}

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: Report | null;
  onSuccess: () => void;
}

function CreateReportModal({
  isOpen,
  onClose,
  report,
  onSuccess,
}: CreateReportModalProps) {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    frequency: 'daily',
    scheduled_time: '01:30',
    config: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadReportTypes();
      if (report) {
        setFormData({
          name: report.name,
          type: report.type,
          frequency: report.frequency,
          scheduled_time: report.scheduled_time || '01:30',
          config: JSON.stringify(report.metrics || {}, null, 2),
          is_active: report.is_active,
        });
      }
    }
  }, [isOpen, report]);

  const loadReportTypes = async () => {
    try {
      const response = await reportService.getReportTypes();
      setReportTypes(response.data?.types || []);
    } catch (err) {
      console.error('Failed to load report types', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      setError('Report name and type are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const payload = {
        name: formData.name,
        type: formData.type,
        frequency: formData.frequency as 'daily' | 'weekly' | 'monthly' | 'manual',
        scheduled_time: formData.frequency !== 'manual' ? formData.scheduled_time : undefined,
        is_active: formData.is_active,
        config: formData.config ? JSON.parse(formData.config) : undefined,
      };

      if (report) {
        await reportService.updateReport(report.id, payload);
        Toast.success('Report updated successfully');
      } else {
        await reportService.createReport(payload);
        Toast.success('Report created successfully');
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      Toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={report ? 'Edit Report' : 'Create New Report'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Report Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Daily Transaction Report"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Report Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
          >
            <option value="">Select a type</option>
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Frequency *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['daily', 'weekly', 'monthly', 'manual'].map((freq) => (
              <label key={freq} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="frequency"
                  value={freq}
                  checked={formData.frequency === freq}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, frequency: e.target.value }))
                  }
                  className="h-4 w-4 cursor-pointer"
                />
                <span className="cursor-pointer text-sm font-medium capitalize">
                  {freq}
                </span>
              </label>
            ))}
          </div>
        </div>

        {formData.frequency !== 'manual' && (
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Scheduled Time
            </label>
            <input
              type="time"
              value={formData.scheduled_time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, scheduled_time: e.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#620707] focus:ring-4 focus:ring-[#620707]/10"
            />
          </div>
        )}

        <div>
          <label className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
              }
              className="h-4 w-4 cursor-pointer rounded"
            />
            <span className="cursor-pointer text-sm font-bold text-slate-700">
              Active
            </span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#620707] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d0505] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : report ? 'Update Report' : 'Create Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
}

function ExportReportModal({ isOpen, onClose, report }: ExportReportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'pdf'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await reportService.exportReport(report.id, selectedFormat);
      
      if (response.data?.download_url) {
        window.open(response.data.download_url, '_blank');
        Toast.success('Report exported successfully');
        onClose();
      }
    } catch (err) {
      Toast.error(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Export: ${report.name}`}>
      <div className="space-y-5">
        <p className="text-sm text-slate-600">
          Select the format for exporting this report:
        </p>

        <div className="space-y-3">
          {[
            {
              value: 'pdf',
              label: 'PDF',
              description: 'Professional formatted document',
            },
            {
              value: 'csv',
              label: 'CSV',
              description: 'Spreadsheet compatible format',
            },
            {
              value: 'json',
              label: 'JSON',
              description: 'Raw data format',
            },
          ].map((format) => (
            <label key={format.value} className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={selectedFormat === format.value}
                onChange={(e) => setSelectedFormat(e.target.value as any)}
                className="mt-1 h-4 w-4"
              />
              <div>
                <p className="font-semibold text-slate-900">{format.label}</p>
                <p className="text-xs text-slate-500">{format.description}</p>
              </div>
            </label>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          The export link will expire in 7 days.
        </p>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Export & Download'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
