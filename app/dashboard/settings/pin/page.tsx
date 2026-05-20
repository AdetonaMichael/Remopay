'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { PINSetupModal } from '@/components/shared/PINSetupModal';
import { usePin } from '@/hooks/usePin';
import { useAlert } from '@/hooks/useAlert';
import { useAuth } from '@/hooks/useAuth';

export default function PINSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { isSettingPin, setPin } = usePin();
  const { success, error: alertError } = useAlert();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lockdownCountdown, setLockdownCountdown] = useState<number | null>(
    null
  );

  // Simple check: does user have transaction_pin?
  const hasPIN = !!(user as any)?.transaction_pin;

  useEffect(() => {
    if (!lockdownCountdown || lockdownCountdown <= 0) return;

    const timer = setInterval(() => {
      setLockdownCountdown((prev) => {
        if (prev && prev > 1) return prev - 1;
        return null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockdownCountdown]);

  const isLocked = !!lockdownCountdown && lockdownCountdown > 0;
  const statusMeta = useMemo(() => {
    if (isLocked) {
      return {
        label: 'Locked',
        badgeVariant: 'error' as const,
        title: 'PIN Temporarily Locked',
        description:
          'Your transaction PIN is locked due to multiple failed attempts. Please wait for the lockout period to expire before trying again.',
        icon: Clock,
        iconClass: 'bg-red-50 text-red-600 border-red-100',
      };
    }

    if (hasPIN) {
      return {
        label: 'Active',
        badgeVariant: 'success' as const,
        title: 'Transaction PIN Active',
        description:
          'Your transaction PIN is set and ready to authorize withdrawals, transfers, card actions, bill payments, and other sensitive transactions.',
        icon: CheckCircle2,
        iconClass: 'bg-green-50 text-green-600 border-green-100',
      };
    }

    return {
      label: 'Not Set',
      badgeVariant: 'warning' as const,
      title: 'Transaction PIN Required',
      description:
        'You have not created a transaction PIN yet. Set up a secure 4-digit PIN to protect payments and sensitive wallet actions.',
      icon: AlertCircle,
      iconClass: 'bg-amber-50 text-amber-600 border-amber-100',
    };
  }, [hasPIN, isLocked]);

  const handleSetupPIN = async (data: {
    currentPin?: string;
    newPin: string;
    newPinConfirmation: string;
    password: string;
  }) => {
    try {
      await setPin(
        data.newPin,
        data.newPinConfirmation,
        data.password,
        data.currentPin
      );
      
      setIsModalOpen(false);
      success(hasPIN ? 'PIN updated successfully!' : 'PIN created successfully!');
    } catch (err: any) {
      alertError(
        err?.response?.data?.message ||
          err?.message ||
          (hasPIN ? 'Failed to update PIN' : 'Failed to create PIN')
      );
    }
  };

  const handleOpenModal = () => {
    if (isLocked) {
      alertError('Your PIN is locked. Please try again after the lockout period.');
      return;
    }

    setIsModalOpen(true);
  };

  const formatCountdown = (seconds: number | null): string => {
    if (!seconds || seconds <= 0) return '';

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedAccountDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  if (authLoading) {
    return (
      <div
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        className="space-y-6"
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        `}</style>

        <div className="h-48 animate-pulse rounded-[32px] bg-[#F3F4F6]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="h-80 animate-pulse rounded-[32px] bg-[#F3F4F6]" />
          <div className="h-80 animate-pulse rounded-[32px] bg-[#F3F4F6]" />
        </div>
      </div>
    );
  }

  const StatusIcon = statusMeta.icon;

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>
      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[32px] border border-[#E6E9F5] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[#EEF2F7] bg-[#FCFCFF] px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${statusMeta.iconClass}`}
                  >
                    <StatusIcon size={24} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                      PIN Status
                    </p>
                    <h2 className="text-xl font-extrabold tracking-tight text-[#111827]">
                      {statusMeta.title}
                    </h2>
                  </div>
                </div>

                <Badge variant={statusMeta.badgeVariant} className="w-fit">
                  {isLocked && <Clock size={12} className="mr-1" />}
                  {statusMeta.label}
                </Badge>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="max-w-2xl text-sm leading-7 text-[#667085]">
                {statusMeta.description}
              </p>

              {isLocked && (
                <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-5">
                  <div className="flex items-start gap-3">
                    <TimerReset className="mt-0.5 text-red-600" size={22} />
                    <div>
                      <p className="text-sm font-extrabold text-red-900">
                        Lockout active
                      </p>
                      <p className="mt-1 text-sm leading-6 text-red-700">
                        Try again in{' '}
                        <span className="font-extrabold">
                          {formatCountdown(lockdownCountdown)}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!hasPIN && !isLocked && (
                <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 text-amber-600" size={22} />
                    <div>
                      <p className="text-sm font-extrabold text-amber-900">
                        Setup required
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        You need a transaction PIN before completing sensitive
                        actions like withdrawals, transfers, payments, and card
                        management.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#EEF2F7] bg-[#FCFCFF] px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Current Status
                  </p>
                  <p className="mt-2 text-base font-extrabold text-[#111827]">
                    {isLocked
                      ? `Locked for ${formatCountdown(lockdownCountdown)}`
                      : hasPIN
                        ? 'Active and ready'
                        : 'Not configured'}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#EEF2F7] bg-[#FCFCFF] px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Account Created
                  </p>
                  <p className="mt-2 text-base font-extrabold text-[#111827]">
                    {formattedAccountDate}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[32px] border border-[#E6E9F5] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF5F5] text-[#620707]">
                  <KeyRound size={24} />
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight text-[#111827]">
                  {hasPIN ? 'Change Your Transaction PIN' : 'Create Your PIN'}
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-[#667085]">
                  {hasPIN
                    ? 'Update your transaction PIN periodically to keep your Remopay wallet protected.'
                    : 'Create a 4-digit transaction PIN to secure transfers, wallet activity, bills, cards, and other financial actions.'}
                </p>
              </div>

              <Button
                onClick={handleOpenModal}
                disabled={isSettingPin || isLocked}
                className="h-13 rounded-2xl bg-[#d71927] px-8 text-base font-bold text-white shadow-[0_14px_30px_rgba(98,7,7,0.24)] hover:bg-[#d71923] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Lock size={18} className="mr-2" />
                {isLocked
                  ? `Locked - ${formatCountdown(lockdownCountdown)}`
                  : hasPIN
                    ? 'Change PIN'
                    : 'Create PIN'}
              </Button>
            </div>
          </Card>
        </div>

        <aside>
          <Card className="rounded-[32px] border border-[#E6E9F5] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] xl:sticky xl:top-8">
            <h3 className="text-xl font-extrabold tracking-tight text-[#111827]">
              Security Rules
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#667085]">
              These rules help protect your account against unauthorized
              transactions.
            </p>

            <div className="mt-6 space-y-3">
              {[
                'PIN must be exactly 4 digits.',
                'Avoid weak patterns like 1111, 0000, or 1234.',
                'Your password is required when setting or updating PIN.',
                'After 3 failed attempts, PIN is locked for 30 minutes.',
                'PIN should never be shared with anyone.',
              ].map((rule) => (
                <div
                  key={rule}
                  className="flex items-start gap-3 rounded-2xl border border-[#EEF2F7] bg-[#FCFCFF] p-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFF5F5] text-[#620707]">
                    <CheckCircle2 size={14} />
                  </div>
                  <p className="text-sm font-semibold leading-6 text-[#475467]">
                    {rule}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#F0DADA] bg-[#FFF7F7] p-4">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#620707]">
                <ShieldCheck size={14} />
                Security Notice
              </p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                Remopay will never ask for your transaction PIN outside secure
                transaction authorization screens.
              </p>
            </div>
          </Card>
        </aside>
      </div>

      <PINSetupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setIsModalOpen(false)}
        onSubmit={handleSetupPIN}
        isLoading={isSettingPin}
        mode={hasPIN ? 'update' : 'setup'}
      />
    </div>
  );
}