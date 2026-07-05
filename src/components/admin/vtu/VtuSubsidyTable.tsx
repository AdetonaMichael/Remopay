'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Wifi,
  Smartphone,
  Radio,
  Monitor,
  Tv,
  HelpCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

import type { ServiceSubsidyConfig } from '@/types/vtu.types';
import { vtuSubsidyApi } from '@/services/vtu-subsidy.service';
import { useUIStore } from '@/store/ui.store';
import { SubsidyConfigModal } from './SubsidyConfigModal';

// ─── Service Icons ───────────────────────────────────────────────────

function ServiceIcon({ serviceId }: { serviceId: string }) {
  const id = serviceId.toLowerCase();

  const iconMap: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    'mtn-data': {
      icon: <Wifi size={18} />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    'mtn-airtime': {
      icon: <Smartphone size={18} />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    'airtel-data': {
      icon: <Wifi size={18} />,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    'airtel-airtime': {
      icon: <Smartphone size={18} />,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    'glo-data': {
      icon: <Wifi size={18} />,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    'glo-airtime': {
      icon: <Smartphone size={18} />,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    '9mobile-data': {
      icon: <Wifi size={18} />,
      color: 'text-green-700',
      bg: 'bg-green-100',
    },
    '9mobile-airtime': {
      icon: <Smartphone size={18} />,
      color: 'text-green-700',
      bg: 'bg-green-100',
    },
    dstv: {
      icon: <Tv size={18} />,
      color: 'text-gray-700',
      bg: 'bg-gray-200',
    },
    gotv: {
      icon: <Tv size={18} />,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    startimes: {
      icon: <Radio size={18} />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
  };

  const matched = iconMap[id] ?? {
    icon: <HelpCircle size={18} />,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
  };

  return (
    <div
      className={clsx(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
        matched.bg,
        matched.color,
      )}
    >
      {matched.icon}
    </div>
  );
}

// ─── Toggle Switch ───────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={clsx(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d71927]/30 focus:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-60',
        checked ? 'bg-green-500' : 'bg-gray-300',
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
}

// ─── Table Skeleton ──────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex h-16 animate-pulse items-center gap-4 rounded-xl bg-gray-100 px-5"
        >
          <div className="h-10 w-10 rounded-xl bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-gray-200" />
            <div className="h-2 w-20 rounded bg-gray-200" />
          </div>
          <div className="h-7 w-12 rounded-full bg-gray-200" />
          <div className="h-5 w-16 rounded bg-gray-200" />
          <div className="h-5 w-16 rounded bg-gray-200" />
          <div className="h-8 w-8 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <AlertCircle className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-gray-900">
        {search ? 'No matching services' : 'No services available'}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        {search
          ? `No services match "${search}". Try adjusting your search term.`
          : 'There are no VTU services configured yet. Services will appear here once added.'}
      </p>
    </div>
  );
}

// ─── Error Banner ────────────────────────────────────────────────────

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-gray-900">Failed to load services</h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#d71927] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b81520]"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function VtuSubsidyTable() {
  const { addToast } = useUIStore();

  const [services, setServices] = useState<ServiceSubsidyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<ServiceSubsidyConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Debounce ref for search
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ── Load Services ──
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vtuSubsidyApi.listServices();
      setServices(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load services';
      setError(message);
      addToast({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // ── Debounced Search ──
  const handleSearch = useCallback(
    (value: string) => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      searchTimeout.current = setTimeout(() => {
        setSearch(value);
      }, 300);
    },
    [],
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // ── Filtered Services ──
  const filteredServices = useMemo(
    () =>
      services.filter(
        (s) =>
          s.service_name.toLowerCase().includes(search.toLowerCase()) ||
          s.service_id.toLowerCase().includes(search.toLowerCase()),
      ),
    [services, search],
  );

  // ── Toggle Handler ──
  const handleToggle = useCallback(
    async (serviceId: string) => {
      setTogglingIds((prev) => new Set(prev).add(serviceId));
      try {
        const result = await vtuSubsidyApi.toggleSubsidy(serviceId);

        // Optimistic update
        setServices((prev) =>
          prev.map((s) =>
            s.service_id === serviceId
              ? { ...s, subsidy_enabled: result.subsidy_enabled }
              : s,
          ),
        );

        if (selectedService?.service_id === serviceId) {
          setSelectedService((prev) =>
            prev ? { ...prev, subsidy_enabled: result.subsidy_enabled } : prev,
          );
        }

        addToast({
          type: 'success',
          message: result.subsidy_enabled
            ? `Subsidy enabled for ${result.service_name}`
            : `Subsidy disabled for ${result.service_name}`,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to toggle subsidy';
        addToast({ type: 'error', message });
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(serviceId);
          return next;
        });
      }
    },
    [addToast, selectedService],
  );

  // ── Config Modal ──
  const openConfigModal = useCallback((service: ServiceSubsidyConfig) => {
    setSelectedService(service);
    setModalOpen(true);
  }, []);

  const closeConfigModal = useCallback(() => {
    setModalOpen(false);
    // Delay clearing selected service to let modal animate out
    setTimeout(() => setSelectedService(null), 200);
  }, []);

  const handleConfigSaved = useCallback(
    (updated: ServiceSubsidyConfig) => {
      setServices((prev) =>
        prev.map((s) =>
          s.service_id === updated.service_id ? updated : s,
        ),
      );
    },
    [],
  );

  // ── Render ──

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200" />
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={loadServices} />;
  }

  return (
    <div className="space-y-5">
      {/* ── Search & Refresh ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search services..."
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#d71927] focus:ring-2 focus:ring-[#d71927]/10 transition-all"
          />
        </div>

        <button
          onClick={loadServices}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ── Services Count ── */}
      {!loading && !error && (
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {filteredServices.length} of {services.length} services
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* ── Table (Desktop) ── */}
      {filteredServices.length > 0 ? (
        <>
          {/* Desktop View */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Service
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 w-28">
                    Subsidy
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 w-24">
                    Type
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 w-28">
                    Value
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gray-500 w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr
                    key={service.service_id}
                    className="group transition-colors hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ServiceIcon serviceId={service.service_id} />
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {service.service_name}
                          </div>
                          <div className="text-xs font-medium text-gray-400">
                            {service.service_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          checked={service.subsidy_enabled}
                          disabled={togglingIds.has(service.service_id)}
                          onChange={() => handleToggle(service.service_id)}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {service.subsidy_enabled ? (
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold',
                            service.subsidy_type === 'percentage'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700',
                          )}
                        >
                          {service.subsidy_type === 'percentage' ? (
                            <>%</>
                          ) : (
                            <>₦</>
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {service.subsidy_enabled ? (
                        <span className="text-sm font-bold text-gray-900">
                          {service.subsidy_type === 'percentage'
                            ? `${service.subsidy_value}%`
                            : `₦${service.subsidy_value.toFixed(2)}`}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => openConfigModal(service)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-100 hover:text-[#d71927]"
                        title={`Configure subsidy for ${service.service_name}`}
                        aria-label={`Configure subsidy for ${service.service_name}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Card Layout */}
          <div className="space-y-3 md:hidden">
            {filteredServices.map((service) => (
              <div
                key={service.service_id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ServiceIcon serviceId={service.service_id} />
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {service.service_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {service.service_id}
                      </div>
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={service.subsidy_enabled}
                    disabled={togglingIds.has(service.service_id)}
                    onChange={() => handleToggle(service.service_id)}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Type</span>
                      <p>
                        {service.subsidy_enabled ? (
                          <span
                            className={clsx(
                              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
                              service.subsidy_type === 'percentage'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700',
                            )}
                          >
                            {service.subsidy_type === 'percentage'
                              ? 'Percentage'
                              : 'Fixed'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300">—</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Value</span>
                      <p className="text-sm font-bold text-gray-900">
                        {service.subsidy_enabled
                          ? service.subsidy_type === 'percentage'
                            ? `${service.subsidy_value}%`
                            : `₦${service.subsidy_value.toFixed(2)}`
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openConfigModal(service)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-gray-100 hover:text-[#d71927]"
                    aria-label={`Configure subsidy for ${service.service_name}`}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState search={search} />
      )}

      {/* ── Config Modal ── */}
      <SubsidyConfigModal
        service={selectedService}
        isOpen={modalOpen}
        onClose={closeConfigModal}
        onSaved={handleConfigSaved}
      />
    </div>
  );
}
