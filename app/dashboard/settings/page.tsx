'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Lock,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useAuthStore } from '@/store/auth.store';
import { tierUpgradeService } from '@/services/tier-upgrade.service';
import { TierUpgradeFormV2 } from '@/components/dashboard/TierUpgradeForm.v2';
import { UpdateProfileForm } from '@/components/dashboard/UpdateProfileForm';
import { AccountDeletion } from '@/components/dashboard/AccountDeletion';
import { useAlert } from '@/hooks/useAlert';
import { useApi } from '@/hooks/useApi';
import {
  TierLevel,
  TierStatusInfo,
  getTierLevelFromNumber,
} from '@/types/tier-upgrade.types';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const TIER_INFO: Record<
  TierLevel,
  { name: string; description: string; color: string }
> = {
  TIER_ZERO: {
    name: 'Tier 0',
    description: 'Basic account access',
    color: 'text-gray-600',
  },
  TIER_ONE: {
    name: 'Tier 1',
    description: 'Verified personal account',
    color: 'text-amber-600',
  },
  TIER_TWO: {
    name: 'Tier 2',
    description: 'Higher limits and advanced access',
    color: 'text-[#d71927]',
  },
};

const tabs = [
  {
    label: 'Account Tier',
    icon: Zap,
    subtitle: 'Upgrade your account',
  },
  {
    label: 'Profile',
    icon: User,
    subtitle: 'Personal information',
  },
  {
    label: 'Security',
    icon: ShieldCheck,
    subtitle: 'PIN and protection',
  },
  {
    label: 'Privacy & Account',
    icon: Trash2,
    subtitle: 'Data and deletion',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success } = useAlert();
  const { execute } = useApi();

  const [tierStatus, setTierStatus] = useState<TierStatusInfo | null>(null);
  const [tierLoading, setTierLoading] = useState(true);

  useEffect(() => {
    const loadTierStatus = async () => {
      try {
        setTierLoading(true);
        const response = await execute(tierUpgradeService.getTierStatus());

        if (response?.data) {
          setTierStatus(response.data);
        }
      } catch (err) {
        console.error('Failed to load tier status:', err);
      } finally {
        setTierLoading(false);
      }
    };

    if (user) {
      loadTierStatus();
    }
  }, [user, execute]);

  const currentTierLevel = useMemo(() => {
    if (!tierStatus) return 'TIER_ZERO' as TierLevel;
    return getTierLevelFromNumber(tierStatus.current_tier.level);
  }, [tierStatus]);

  const currentTierMeta = TIER_INFO[currentTierLevel];

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="space-y-8 max-w-full overflow-x-hidden"
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div className="grid w-full gap-6 sm:gap-8 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4 sm:space-y-6 min-w-0">
          <Card className="rounded-[24px] sm:rounded-[32px] border border-[#E6E9F5] bg-white p-4 sm:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] xl:sticky xl:top-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF5F5] text-[#d71927]">
                <User size={20} className="sm:hidden" />
                <User size={26} className="hidden sm:block" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-[#111827]">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="truncate text-sm text-[#667085]">{user?.email}</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 rounded-[16px] sm:rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFF] p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98A2B3]">
                Current Tier
              </p>

              {tierLoading ? (
                <div className="mt-4 h-16 animate-pulse rounded-2xl bg-[#F3F4F6]" />
              ) : tierStatus ? (
                <div className="mt-3 sm:mt-4 flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                      {tierStatus.current_tier.name}
                    </p>
                    <p className="mt-1 text-sm text-[#667085]">
                      {currentTierMeta.description}
                    </p>
                  </div>

                  <span
                    className={classNames(
                      'rounded-full border px-3 py-1 text-xs font-bold',
                      tierStatus.current_tier.status === 'ACTIVE'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : tierStatus.current_tier.status === 'PENDING'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                    )}
                  >
                    {tierStatus.current_tier.status}
                  </span>
                </div>
              ) : (
                <p className="mt-4 text-sm font-semibold text-red-600">
                  Unable to load tier information
                </p>
              )}
            </div>

            {tierStatus?.next_tier && tierStatus.current_tier.level !== 2 && (
              <div className="mt-3 sm:mt-4 rounded-[16px] sm:rounded-[24px] border border-[#F0DADA] bg-[#FFF7F7] p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d71927]">
                  Next Upgrade
                </p>
                <p className="mt-1 sm:mt-2 text-base sm:text-lg font-extrabold text-[#111827]">
                  {tierStatus.next_tier.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  Complete the required information to unlock higher account
                  limits and additional Remopay features.
                </p>
              </div>
            )}
          </Card>
        </aside>

        <main className="min-w-0">
          <Tab.Group>
            <Tab.List className="flex gap-3 overflow-x-auto rounded-[24px] sm:rounded-[32px] border border-[#E6E9F5] bg-white p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:grid sm:grid-cols-2 xl:grid-cols-4 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <Tab
                    key={tab.label}
                    className={({ selected }) =>
                      classNames(
                        'rounded-2xl px-3 sm:px-4 py-3 sm:py-4 text-left transition-all duration-200 focus:outline-none flex-shrink-0 sm:flex-shrink',
                        selected
                          ? 'bg-[#d71927] text-white shadow-[0_14px_30px_rgba(98,7,7,0.24)]'
                          : 'bg-[#FCFCFF] text-[#111827] hover:bg-[#FFF5F5]'
                      )
                    }
                  >
                    {({ selected }) => (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div
                          className={classNames(
                            'rounded-xl sm:rounded-2xl p-2 sm:p-3',
                            selected ? 'bg-white/15' : 'bg-[#FFF5F5]'
                          )}
                        >
                          <Icon
                            size={16}
                            className={`sm:hidden ${selected ? 'text-white' : 'text-[#d71927]'}`}
                          />
                          <Icon
                            size={18}
                            className={`hidden sm:block ${selected ? 'text-white' : 'text-[#d71927]'}`}
                          />
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm font-extrabold leading-tight">{tab.label}</p>
                          <p
                            className={classNames(
                              'mt-0.5 sm:mt-1 text-[10px] sm:text-xs leading-4 sm:leading-5',
                              selected ? 'text-white/75' : 'text-[#667085]'
                            )}
                          >
                            {tab.subtitle}
                          </p>
                        </div>
                      </div>
                    )}
                  </Tab>
                );
              })}
            </Tab.List>

            <Tab.Panels className="mt-6">
              <Tab.Panel className="min-w-0">
                <Card className="rounded-[24px] sm:rounded-[32px] border border-[#E6E9F5] bg-white p-4 sm:p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] w-full">
                  <div className="mb-6 sm:mb-8">
                    <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF5F5] text-[#d71927]">
                      <Zap size={20} className="sm:hidden" />
                      <Zap size={24} className="hidden sm:block" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827]">
                      Account Tier Upgrade
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
                      Upgrade your Remopay account by completing verification
                      requirements. Higher tiers unlock stronger limits and
                      broader financial access.
                    </p>
                  </div>

                  {tierStatus && !tierLoading ? (
                    <TierUpgradeFormV2
                      currentTier={getTierLevelFromNumber(
                        tierStatus.current_tier.level
                      )}
                      onSuccess={() => {
                        success(
                          'Tier upgraded successfully! Your new tier is now active.'
                        );
                      }}
                      initialData={{
                        first_name: user?.first_name,
                        last_name: user?.last_name,
                        email: user?.email,
                        phone_number: user?.phone_number,
                      }}
                    />
                  ) : tierLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div
                          key={item}
                          className="h-20 animate-pulse rounded-2xl bg-[#F3F4F6]"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-center">
                      <AlertCircle className="mx-auto text-red-600" size={28} />
                      <p className="mt-3 font-bold text-red-900">
                        Unable to load tier information
                      </p>
                      <p className="mt-1 text-sm text-red-700">
                        Please refresh the page and try again.
                      </p>
                    </div>
                  )}
                </Card>
              </Tab.Panel>

              <Tab.Panel className="min-w-0">
                <Card className="rounded-[24px] sm:rounded-[32px] border border-[#E6E9F5] bg-white p-4 sm:p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] w-full">
                  <div className="mb-6 sm:mb-8">
                    <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF5F5] text-[#d71927]">
                      <User size={20} className="sm:hidden" />
                      <User size={24} className="hidden sm:block" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827]">
                      Update Profile
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
                      Keep your personal details, contact information, address,
                      and identity information accurate for smoother verification
                      and account operations.
                    </p>
                  </div>

                  <UpdateProfileForm 
                    currentData={{
                      first_name: user?.first_name,
                      last_name: user?.last_name,
                      email: user?.email,
                      phone: {
                        phone_country_code: '+234',
                        phone_number: user?.phone_number,
                      },
                    }}
                    onSuccess={() => {
                      success('Profile updated successfully!');
                    }}
                  />
                </Card>
              </Tab.Panel>

              <Tab.Panel className="min-w-0">
                <Card className="rounded-[24px] sm:rounded-[32px] border border-[#E6E9F5] bg-white p-4 sm:p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] w-full">
                  <div className="mb-6 sm:mb-8">
                    <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF5F5] text-[#d71927]">
                      <ShieldCheck size={20} className="sm:hidden" />
                      <ShieldCheck size={24} className="hidden sm:block" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827]">
                      Security Settings
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
                      Manage transaction authorization, PIN protection, and other
                      important security controls for your Remopay wallet.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="rounded-[20px] sm:rounded-[28px] border border-[#EEF2F7] bg-[#FCFCFF] p-4 sm:p-5">
                      <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF5F5] text-[#d71927]">
                        <KeyRound size={18} className="sm:hidden" />
                        <KeyRound size={22} className="hidden sm:block" />
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-[#111827]">
                        Transaction PIN
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#667085]">
                        Create or update your transaction PIN for wallet
                        transfers, bills, card actions, and sensitive operations.
                      </p>

                      <Button
                        onClick={() => router.push('/dashboard/settings/pin')}
                        className="mt-5 h-12 rounded-2xl bg-[#d71927] px-5 font-bold text-white hover:bg-[#d71923]"
                      >
                        Manage PIN
                        <ChevronRight size={18} className="ml-2" />
                      </Button>
                    </div>

                    <div className="rounded-[20px] sm:rounded-[28px] border border-[#EEF2F7] bg-[#FCFCFF] p-4 sm:p-5">
                      <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-[#FFF5F5] text-[#d71927]">
                        <Lock size={18} className="sm:hidden" />
                        <Lock size={22} className="hidden sm:block" />
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-[#111827]">
                        Account Protection
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#667085]">
                        Remopay uses authorization tokens, PIN verification, and
                        secure transaction flows to protect your account.
                      </p>

                      <div className="mt-5 rounded-2xl border border-[#F0DADA] bg-[#FFF7F7] p-4">
                        <p className="flex items-center gap-2 text-sm font-bold text-[#d71927]">
                          <CheckCircle2 size={16} />
                          Security controls active
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Tab.Panel>

              <Tab.Panel className="min-w-0">
                <Card className="rounded-[24px] sm:rounded-[32px] border border-[#E6E9F5] bg-white p-4 sm:p-6 sm:p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] w-full">
                  <div className="mb-6 sm:mb-8">
                    <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-red-50 text-red-600">
                      <Trash2 size={20} className="sm:hidden" />
                      <Trash2 size={24} className="hidden sm:block" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111827]">
                      Privacy & Account
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-[#667085]">
                      Manage sensitive account actions including data controls
                      and permanent account deletion requests.
                    </p>
                  </div>

                  <AccountDeletion />
                </Card>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </main>
      </div>
    </div>
  );
}