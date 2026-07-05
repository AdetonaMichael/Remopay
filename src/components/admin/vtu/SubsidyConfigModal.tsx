'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Percent, Coins } from 'lucide-react';
import { clsx } from 'clsx';

import type { ServiceSubsidyConfig, SubsidyType } from '@/types/vtu.types';
import { vtuSubsidyApi } from '@/services/vtu-subsidy.service';
import { calculateSubsidyPreview } from '@/utils/subsidy-calculator';
import { useUIStore } from '@/store/ui.store';

// ─── Types ───────────────────────────────────────────────────────────

interface SubsidyConfigModalProps {
  service: ServiceSubsidyConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: ServiceSubsidyConfig) => void;
}

interface FormErrors {
  subsidy_type?: string;
  subsidy_value?: string;
  min_discount_cap?: string;
  max_discount_cap?: string;
}

// ─── Constants ───────────────────────────────────────────────────────

const SAMPLE_AMOUNT = 1000;
const MAX_DECIMAL_PLACES = 2;

// ─── Helper ──────────────────────────────────────────────────────────

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// ─── Component ───────────────────────────────────────────────────────

export function SubsidyConfigModal({
  service,
  isOpen,
  onClose,
  onSaved,
}: SubsidyConfigModalProps) {
  const { addToast } = useUIStore();

  const [type, setType] = useState<SubsidyType>('percentage');
  const [value, setValue] = useState<number>(0);
  const [minCap, setMinCap] = useState<number | null>(null);
  const [maxCap, setMaxCap] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens with a new service
  useEffect(() => {
    if (service && isOpen) {
      setType(service.subsidy_type);
      setValue(service.subsidy_value);
      setMinCap(service.min_discount_cap);
      setMaxCap(service.max_discount_cap);
      setErrors({});
    }
  }, [service, isOpen]);

  // Live preview calculation
  const preview = useMemo(
    () => calculateSubsidyPreview(SAMPLE_AMOUNT, type, value, minCap, maxCap),
    [type, value, minCap, maxCap],
  );

  // Validation
  const validate = useCallback((): FormErrors => {
    const errs: FormErrors = {};

    if (value <= 0) {
      errs.subsidy_value = 'Value must be greater than 0';
    } else if (value > 999_999_999) {
      errs.subsidy_value = 'Value is too large';
    }

    if (type === 'percentage' && value > 100) {
      errs.subsidy_value = 'Percentage cannot exceed 100%';
    }

    if (minCap != null && minCap < 0) {
      errs.min_discount_cap = 'Minimum cap cannot be negative';
    }

    if (maxCap != null && maxCap < 0) {
      errs.max_discount_cap = 'Maximum cap cannot be negative';
    }

    if (
      minCap != null &&
      maxCap != null &&
      minCap > maxCap
    ) {
      errs.min_discount_cap = 'Minimum cannot exceed maximum';
      errs.max_discount_cap = 'Must be ≥ minimum cap';
    }

    return errs;
  }, [type, value, minCap, maxCap]);

  // Handle value input change
  const handleValueChange = useCallback(
    (raw: string) => {
      const parsed = parseFloat(raw);
      setValue(isNaN(parsed) ? 0 : roundTo(parsed, MAX_DECIMAL_PLACES));
      setErrors((prev) => ({ ...prev, subsidy_value: undefined }));
    },
    [],
  );

  // Handle cap input change
  const handleCapChange = useCallback(
    (
      field: 'min_discount_cap' | 'max_discount_cap',
      raw: string,
    ) => {
      const parsed = raw === '' ? null : parseFloat(raw);
      const value = parsed != null && !isNaN(parsed) ? roundTo(parsed, MAX_DECIMAL_PLACES) : null;
      if (field === 'min_discount_cap') {
        setMinCap(value);
        setErrors((prev) => ({ ...prev, min_discount_cap: undefined }));
      } else {
        setMaxCap(value);
        setErrors((prev) => ({ ...prev, max_discount_cap: undefined }));
      }
    },
    [],
  );

  // Save handler
  const handleSave = useCallback(async () => {
    if (!service) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const updated = await vtuSubsidyApi.updateSubsidyConfig(
        service.service_id,
        {
          subsidy_type: type,
          subsidy_value: value,
          min_discount_cap: minCap,
          max_discount_cap: maxCap,
        },
      );
      onSaved(updated);
      addToast({
        type: 'success',
        message: `Subsidy configuration updated for ${updated.service_name}`,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update subsidy configuration';
      addToast({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  }, [service, type, value, minCap, maxCap, validate, onSaved, onClose, addToast]);

  const handleTypeChange = useCallback((newType: SubsidyType) => {
    setType(newType);
  }, []);

  if (!isOpen || !service) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* ── Header ── */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                  <div>
                    <Dialog.Title className="text-lg font-bold text-gray-900">
                      Configure Subsidy
                    </Dialog.Title>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {service.service_name}
                      <span className="ml-1.5 text-xs text-gray-400">
                        ({service.service_id})
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* ── Body ── */}
                <div className="px-6 py-5 space-y-5">
                  {/* Subsidy Status Indicator */}
                  <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-700">
                      Subsidy Status
                    </span>
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
                        service.subsidy_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-500',
                      )}
                    >
                      <span
                        className={clsx(
                          'h-2 w-2 rounded-full',
                          service.subsidy_enabled ? 'bg-green-500' : 'bg-gray-400',
                        )}
                      />
                      {service.subsidy_enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Subsidy Type */}
                  <fieldset>
                    <legend className="text-sm font-semibold text-gray-700 mb-2.5">
                      Subsidy Type <span className="text-red-500">*</span>
                    </legend>
                    <div className="flex gap-3">
                      {([
                        { value: 'percentage' as const, label: 'Percentage (%)', icon: Percent },
                        { value: 'fixed' as const, label: 'Fixed Amount (₦)', icon: Coins },
                      ] as const).map((option) => {
                        const Icon = option.icon;
                        const selected = type === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleTypeChange(option.value)}
                            className={clsx(
                              'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all',
                              selected
                                ? 'border-[#d71927] bg-[#d71927]/5 text-[#d71927]'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                            )}
                            aria-pressed={selected}
                          >
                            <Icon size={18} />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Subsidy Value */}
                  <div>
                    <label
                      htmlFor="subsidy-value"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Subsidy Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="subsidy-value"
                        type="number"
                        min={0}
                        step={type === 'percentage' ? 0.5 : 10}
                        value={value || ''}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder="0.00"
                        className={clsx(
                          'w-full rounded-xl border-2 px-4 py-3 pr-12 text-lg font-bold text-gray-900 transition-all',
                          'focus:outline-none focus:ring-2 focus:ring-[#d71927]/20',
                          errors.subsidy_value
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-gray-200 focus:border-[#d71927]',
                        )}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                        {type === 'percentage' ? '%' : '₦'}
                      </span>
                    </div>
                    {errors.subsidy_value && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.subsidy_value}
                      </p>
                    )}
                  </div>

                  {/* Discount Caps */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2.5">
                      Discount Caps <span className="text-gray-400 font-normal">(Optional)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="min-cap"
                          className="block text-xs font-medium text-gray-500 mb-1.5"
                        >
                          Minimum (₦)
                        </label>
                        <input
                          id="min-cap"
                          type="number"
                          min={0}
                          value={minCap ?? ''}
                          onChange={(e) => handleCapChange('min_discount_cap', e.target.value)}
                          placeholder="No minimum"
                          className={clsx(
                            'w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium text-gray-900 transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-[#d71927]/20',
                            errors.min_discount_cap
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-gray-200 focus:border-[#d71927]',
                          )}
                        />
                        {errors.min_discount_cap && (
                          <p className="mt-1 text-xs font-medium text-red-600">
                            {errors.min_discount_cap}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="max-cap"
                          className="block text-xs font-medium text-gray-500 mb-1.5"
                        >
                          Maximum (₦)
                        </label>
                        <input
                          id="max-cap"
                          type="number"
                          min={0}
                          value={maxCap ?? ''}
                          onChange={(e) => handleCapChange('max_discount_cap', e.target.value)}
                          placeholder="No maximum"
                          className={clsx(
                            'w-full rounded-xl border-2 px-4 py-2.5 text-sm font-medium text-gray-900 transition-all',
                            'focus:outline-none focus:ring-2 focus:ring-[#d71927]/20',
                            errors.max_discount_cap
                              ? 'border-red-400 focus:border-red-500'
                              : 'border-gray-200 focus:border-[#d71927]',
                          )}
                        />
                        {errors.max_discount_cap && (
                          <p className="mt-1 text-xs font-medium text-red-600">
                            {errors.max_discount_cap}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      Preview — based on ₦{SAMPLE_AMOUNT.toLocaleString()} plan
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Original:</span>
                        <span className="text-gray-500 line-through">
                          ₦{preview.originalAmount.toLocaleString()}.00
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Discount:</span>
                        <span className="font-semibold text-green-600">
                          -₦{preview.discount.toFixed(MAX_DECIMAL_PLACES)}
                          {type === 'percentage' && value > 0
                            ? ` (${value}%)`
                            : ''}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200/60 pt-1.5">
                        <span className="text-sm font-bold text-gray-700">Subsidized:</span>
                        <span className="text-sm font-bold text-blue-700">
                          ₦{preview.subsidizedAmount.toFixed(MAX_DECIMAL_PLACES)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">You save:</span>
                        <span className="font-semibold text-green-600">
                          ₦{preview.savings.toFixed(MAX_DECIMAL_PLACES)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50/80">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={clsx(
                      'rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all',
                      saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#d71927] hover:bg-[#b81520] shadow-lg shadow-[#d71927]/20',
                    )}
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Saving…
                      </span>
                    ) : (
                      'Save Configuration'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
