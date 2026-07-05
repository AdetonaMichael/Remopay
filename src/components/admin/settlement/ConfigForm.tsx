'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, ShieldCheck, Link, CheckCircle2, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { Badge } from '@/components/shared/Badge';
import type {
  SettlementConfig,
  UpdateConfigRequest,
  ConfigValidationResult,
  ConfigTestResult,
  SettlementConfigTab,
} from '@/types/settlement.types';

interface ConfigFormProps {
  config: SettlementConfig | null;
  onSubmit: (data: UpdateConfigRequest) => Promise<void>;
  onValidate: () => Promise<void>;
  onTest: () => Promise<void>;
  validationResult: ConfigValidationResult | null;
  testResult: ConfigTestResult | null;
  isLoading?: boolean;
  isValidating?: boolean;
  isTesting?: boolean;
}

const tabs: { id: SettlementConfigTab; label: string }[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'commission', label: 'Commission Account' },
  { id: 'vtu', label: 'VTU Account' },
  { id: 'recipients', label: 'Recipients' },
  { id: 'advanced', label: 'Advanced' },
];

export const ConfigForm = ({
  config,
  onSubmit,
  onValidate,
  onTest,
  validationResult,
  testResult,
  isLoading = false,
  isValidating = false,
  isTesting = false,
}: ConfigFormProps) => {
  const [activeTab, setActiveTab] = useState<SettlementConfigTab>('schedule');
  const [formData, setFormData] = useState<UpdateConfigRequest>({});

  // Initialize form data from config
  useEffect(() => {
    if (config) {
      setFormData({
        schedule: config.schedule,
        enabled: config.enabled,
        reporting_period_days: config.reporting_period_days,
        commission_account_number: undefined,
        commission_account_name: config.commission_account?.account_name || undefined,
        commission_bank_code: config.commission_account?.bank_code || undefined,
        commission_bank_name: config.commission_account?.bank_name || undefined,
        min_commission_transfer_amount: config.commission_account?.min_transfer_amount || undefined,
        vtu_settlement_account_number: undefined,
        vtu_settlement_account_name: config.vtu_settlement_account?.account_name || undefined,
        vtu_settlement_bank_code: config.vtu_settlement_account?.bank_code || undefined,
        vtu_settlement_bank_name: config.vtu_settlement_account?.bank_name || undefined,
        min_vtu_transfer_amount: config.vtu_settlement_account?.min_transfer_amount || undefined,
        report_recipient_emails: [...config.report_recipient_emails],
        process_commissions: config.process_commissions,
        process_vtu_settlement: config.process_vtu_settlement,
        retry_max_attempts: config.retry.max_attempts,
        retry_delay_minutes: config.retry.delay_minutes,
        notify_on_success: config.notifications.on_success,
        notify_on_failure: config.notifications.on_failure,
      });
    }
  }, [config]);

  const updateField = useCallback(
    <K extends keyof UpdateConfigRequest>(key: K, value: UpdateConfigRequest[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const [newEmail, setNewEmail] = useState('');

  const addEmail = useCallback(() => {
    const email = newEmail.trim();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const currentEmails = formData.report_recipient_emails || [];
      if (!currentEmails.includes(email)) {
        updateField('report_recipient_emails', [...currentEmails, email]);
      }
      setNewEmail('');
    }
  }, [newEmail, formData.report_recipient_emails, updateField]);

  const removeEmail = useCallback(
    (emailToRemove: string) => {
      const currentEmails = formData.report_recipient_emails || [];
      updateField(
        'report_recipient_emails',
        currentEmails.filter((e) => e !== emailToRemove)
      );
    },
    [formData.report_recipient_emails, updateField]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [onSubmit, formData]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Input
                  label="Cron Expression"
                  placeholder="e.g., 0 23 * * *"
                  value={formData.schedule || ''}
                  onChange={(e) => updateField('schedule', e.target.value)}
                  helperText="Standard cron format (min hour day month weekday)"
                  required
                />
              </div>
              <div>
                <Input
                  label="Reporting Period (Days)"
                  type="number"
                  placeholder="1"
                  min={1}
                  max={365}
                  value={formData.reporting_period_days ?? ''}
                  onChange={(e) => updateField('reporting_period_days', parseInt(e.target.value) || 1)}
                  helperText="Number of days per settlement period (1–365)"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.enabled ?? false}
                  onChange={(e) => updateField('enabled', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#d71927] peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Enable Auto-Settlement</p>
                <p className="text-xs text-[#6b7280]">Automatically process settlement on schedule</p>
              </div>
            </div>
            {config && (
              <div className="rounded-xl bg-[#f8fafc] p-4 space-y-2">
                <p className="text-xs font-medium text-[#6b7280]">Current Schedule Info</p>
                <p className="text-sm text-[#111827]">
                  Next run: <span className="font-semibold">{config.next_run_at ? new Date(config.next_run_at).toLocaleString('en-NG') : 'N/A'}</span>
                </p>
                <p className="text-sm text-[#111827]">
                  Last run: <span className="font-semibold">{config.last_run_at ? new Date(config.last_run_at).toLocaleString('en-NG') : 'N/A'}</span>
                </p>
              </div>
            )}
          </div>
        );

      case 'commission':
        return (
          <div className="space-y-6">
            <p className="text-sm text-[#6b7280]">
              Configure the commission settlement account. Account numbers are masked for security.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="Account Name"
                placeholder="Remopay Commission Account"
                value={formData.commission_account_name || ''}
                onChange={(e) => updateField('commission_account_name', e.target.value)}
              />
              <Input
                label="Account Number"
                placeholder="0123456789"
                maxLength={10}
                value={formData.commission_account_number || ''}
                onChange={(e) => updateField('commission_account_number', e.target.value)}
                helperText="Enter full account number"
              />
              <Input
                label="Bank Code"
                placeholder="000001"
                maxLength={10}
                value={formData.commission_bank_code || ''}
                onChange={(e) => updateField('commission_bank_code', e.target.value)}
              />
              <Input
                label="Bank Name"
                placeholder="Sterling Bank"
                value={formData.commission_bank_name || ''}
                onChange={(e) => updateField('commission_bank_name', e.target.value)}
              />
              <Input
                label="Minimum Transfer Amount (₦)"
                type="number"
                placeholder="100"
                min={0}
                value={formData.min_commission_transfer_amount ?? ''}
                onChange={(e) =>
                  updateField('min_commission_transfer_amount', parseFloat(e.target.value) || 0)
                }
              />
            </div>
            {config?.commission_account && (
              <div className="rounded-xl bg-[#f8fafc] p-4">
                <p className="text-xs font-medium text-[#6b7280]">Current Account (masked)</p>
                <p className="text-sm font-bold text-[#111827] mt-1">
                  {config.commission_account.account_name} — ****{config.commission_account.account_number.slice(-4)} ({config.commission_account.bank_name})
                </p>
              </div>
            )}
          </div>
        );

      case 'vtu':
        return (
          <div className="space-y-6">
            <p className="text-sm text-[#6b7280]">
              Configure the VTU provider settlement account. Account numbers are masked for security.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="Account Name"
                placeholder="VTU Provider Account"
                value={formData.vtu_settlement_account_name || ''}
                onChange={(e) => updateField('vtu_settlement_account_name', e.target.value)}
              />
              <Input
                label="Account Number"
                placeholder="9876543210"
                maxLength={10}
                value={formData.vtu_settlement_account_number || ''}
                onChange={(e) => updateField('vtu_settlement_account_number', e.target.value)}
                helperText="Enter full account number"
              />
              <Input
                label="Bank Code"
                placeholder="000001"
                maxLength={10}
                value={formData.vtu_settlement_bank_code || ''}
                onChange={(e) => updateField('vtu_settlement_bank_code', e.target.value)}
              />
              <Input
                label="Bank Name"
                placeholder="Sterling Bank"
                value={formData.vtu_settlement_bank_name || ''}
                onChange={(e) => updateField('vtu_settlement_bank_name', e.target.value)}
              />
              <Input
                label="Minimum Transfer Amount (₦)"
                type="number"
                placeholder="500"
                min={0}
                value={formData.min_vtu_transfer_amount ?? ''}
                onChange={(e) =>
                  updateField('min_vtu_transfer_amount', parseFloat(e.target.value) || 0)
                }
              />
            </div>
            {config?.vtu_settlement_account && (
              <div className="rounded-xl bg-[#f8fafc] p-4">
                <p className="text-xs font-medium text-[#6b7280]">Current Account (masked)</p>
                <p className="text-sm font-bold text-[#111827] mt-1">
                  {config.vtu_settlement_account.account_name} — ****{config.vtu_settlement_account.account_number.slice(-4)} ({config.vtu_settlement_account.bank_name})
                </p>
              </div>
            )}
          </div>
        );

      case 'recipients':
        return (
          <div className="space-y-6">
            <p className="text-sm text-[#6b7280]">
              Manage report recipient email addresses. These recipients will receive settlement reports.
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="admin@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addEmail();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={addEmail}
                disabled={!newEmail.trim()}
                className="mt-0"
              >
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {(formData.report_recipient_emails || []).length === 0 ? (
                <p className="text-sm text-[#9ca3af] py-4 text-center">
                  No recipients added yet. Add at least one email recipient.
                </p>
              ) : (
                (formData.report_recipient_emails || []).map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between rounded-xl bg-[#f8fafc] px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-[#111827]">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="Retry Max Attempts"
                type="number"
                placeholder="3"
                min={1}
                max={10}
                value={formData.retry_max_attempts ?? ''}
                onChange={(e) => updateField('retry_max_attempts', parseInt(e.target.value) || 3)}
                helperText="Number of retry attempts (1–10)"
              />
              <Input
                label="Retry Delay (Minutes)"
                type="number"
                placeholder="5"
                min={1}
                value={formData.retry_delay_minutes ?? ''}
                onChange={(e) => updateField('retry_delay_minutes', parseInt(e.target.value) || 5)}
                helperText="Delay between retry attempts"
              />
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#111827]">Process Options</p>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.process_commissions ?? true}
                    onChange={(e) => updateField('process_commissions', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#d71927] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Process Commissions</p>
                  <p className="text-xs text-[#6b7280]">Include commission settlement in processing</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.process_vtu_settlement ?? true}
                    onChange={(e) => updateField('process_vtu_settlement', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#d71927] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Process VTU Settlement</p>
                  <p className="text-xs text-[#6b7280]">Include VTU provider settlement in processing</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#111827]">Notifications</p>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.notify_on_success ?? true}
                    onChange={(e) => updateField('notify_on_success', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#d71927] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Notify on Success</p>
                  <p className="text-xs text-[#6b7280]">Send notification when settlement completes successfully</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.notify_on_failure ?? true}
                    onChange={(e) => updateField('notify_on_failure', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#d71927] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Notify on Failure</p>
                  <p className="text-xs text-[#6b7280]">Send notification when settlement fails</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation & Test Results */}
      {validationResult && !validationResult.valid && (
        <Card className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Configuration Errors</p>
              <ul className="mt-2 space-y-1">
                {validationResult.errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span>•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {validationResult && validationResult.valid && (
        <Card className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm font-bold text-green-800">Configuration is valid</p>
          </div>
        </Card>
      )}

      {testResult && (
        <Card className="rounded-2xl border border-[#e5e7eb] p-4">
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
            )}
            <div className="space-y-2">
              <p className={`text-sm font-bold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                Account Connectivity Test
              </p>
              {Object.entries(testResult.results).map(([key, result]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${result.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-[#374151]">
                    <span className="font-medium capitalize">{key.replace('_', ' ')}</span>: {result.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Card className="rounded-2xl border border-[#e5e7eb] overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-[#e5e7eb] bg-white px-4">
          <nav className="flex gap-1 overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-[#d71927] text-[#d71927]'
                    : 'border-transparent text-[#6b7280] hover:text-[#111827] hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onValidate}
            isLoading={isValidating}
            disabled={isValidating}
          >
            <ShieldCheck className="h-4 w-4" />
            Validate
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onTest}
            isLoading={isTesting}
            disabled={isTesting}
          >
            <Link className="h-4 w-4" />
            Test Accounts
          </Button>
        </div>
        <Button type="submit" isLoading={isLoading} disabled={isLoading}>
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </form>
  );
};
