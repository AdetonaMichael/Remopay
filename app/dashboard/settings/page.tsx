'use client';

import { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import {
  ChevronRight,
  KeyRound,
  Zap,
  Settings2,
  ShieldCheck,
  Trash2,
  User,
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
import { TierStatus, TierLevel, TierStatusInfo, getTierLevelFromNumber } from '@/types/tier-upgrade.types';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const TIER_INFO: Record<TierLevel, { name: string; icon: React.ComponentType<any>; color: string }> = {
  TIER_ZERO: { name: 'None', icon: Zap, color: 'text-gray-500' },
  TIER_ONE: { name: 'Bronze', icon: Zap, color: 'text-amber-600' },
  TIER_TWO: { name: 'Silver', icon: Zap, color: 'text-slate-400' },
};

const tabs = [
  {
    label: 'Account Tier',
    icon: Zap,
    subtitle: 'Upgrade your account and unlock benefits',
  },
  {
    label: 'Profile',
    icon: User,
    subtitle: 'Update your personal information',
  },
  {
    label: 'Security',
    icon: ShieldCheck,
    subtitle: 'Password and account protection',
  },
  {
    label: 'Privacy & Account',
    icon: Trash2,
    subtitle: 'Manage your data and account deletion',
  },
];

export default function SettingsPage() {
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
      } catch (err: any) {
        console.error('Failed to load tier status:', err);
      } finally {
        setTierLoading(false);
      }
    };

    if (user) {
      loadTierStatus();
    }
  }, [user, execute]);

  return (
    <div className="mx-auto space-y-8">
      <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_20px_70px_rgba(16,3,3,0.08)]">

        <div className="space-y-6 bg-[#f8f8f8] p-5 sm:p-6">
          <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black tracking-tight text-[#111]">
              Account Tier
            </h3>

            {tierLoading ? (
              <div className="mt-5 h-32 rounded-2xl bg-[#f8f8f8] animate-pulse" />
            ) : tierStatus ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-[#f8f8f8] p-4">
                  <p className="text-sm font-bold text-black/45 mb-2">Current Tier</p>
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${tierStatus.current_tier.level !== 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {tierStatus.current_tier.level !== 0 ? '⚡' : '•'}
                    </div>
                    <div>
                      <p className="text-lg font-black text-[#111]">
                        {tierStatus.current_tier.name}
                      </p>
                      <p className="text-xs text-black/50 mt-0.5">
                        {tierStatus.current_tier.status === 'ACTIVE' ? '✓ Active' : tierStatus.current_tier.status === 'PENDING' ? '⏳ Pending' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                {tierStatus.current_tier.level !== 2 && tierStatus.next_tier && (
                  <div className="rounded-2xl border-2 border-[#d71927]/20 bg-[#fff1f2] p-4">
                    <p className="text-sm font-bold text-[#d71927] mb-2">Next Tier</p>
                    <p className="text-base font-black text-[#111]">
                      {tierStatus.next_tier.name}
                    </p>
                    <p className="text-xs text-black/50 mt-2">
                      Required: {Object.keys(tierStatus.next_tier.requirements).map(key => key.replace(/_/g, ' ')).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-black/50">Unable to load tier information</p>
            )}
          </Card>

          <section>
            <Tab.Group>
              <Tab.List className="grid grid-cols-1 gap-3 rounded-[28px] border border-black/5 bg-white p-3 shadow-sm sm:grid-cols-5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <Tab
                      key={tab.label}
                      className={({ selected }) =>
                        classNames(
                          'rounded-2xl px-4 py-4 text-left transition-all duration-200 focus:outline-none',
                          selected
                            ? 'bg-[#d71927] text-white shadow-lg shadow-[#d71927]/25'
                            : 'bg-[#f8f8f8] text-[#111] hover:bg-[#fff1f2]'
                        )
                      }
                    >
                      {({ selected }) => (
                        <div className="flex items-start gap-3">
                          <div
                            className={classNames(
                              'rounded-2xl p-3',
                              selected ? 'bg-white/15' : 'bg-[#fff1f2]'
                            )}
                          >
                            <Icon
                              size={18}
                              className={selected ? 'text-white' : 'text-[#d71927]'}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-black">{tab.label}</p>
                            <p
                              className={classNames(
                                'mt-1 text-xs leading-5',
                                selected ? 'text-white/70' : 'text-black/45'
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

                <Tab.Panel>
                  <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black tracking-tight text-[#111]">
                        Account Tier Upgrade
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-black/50">
                        Upgrade your account tier by completing your profile information. Each tier unlocks new features and higher limits.
                      </p>
                    </div>

                    {tierStatus && !tierLoading ? (
                      <TierUpgradeFormV2
                        currentTier={getTierLevelFromNumber(tierStatus.current_tier.level)}
                        onSuccess={(newTier) => {
                          success('Tier upgraded successfully! Your new tier is now active.');
                          // Refetch tier status after upgrade
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
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-20 rounded-2xl bg-[#f8f8f8] animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-red-50 border border-red-200">
                        <div className="p-6 text-center">
                          <p className="text-red-900 font-semibold">Unable to load tier information</p>
                          <p className="text-red-700 text-sm mt-2">Please refresh the page and try again.</p>
                        </div>
                      </Card>
                    )}
                  </Card>
                </Tab.Panel>

                <Tab.Panel>
                  <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black tracking-tight text-[#111]">
                        Update Profile
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-black/50">
                        Update your personal information, contact details, address, and identity documents.
                      </p>
                    </div>

                    {user ? (
                      <UpdateProfileForm
                        mapleradCustomerId={String(user?.id)}
                        currentData={{
                          first_name: user?.first_name,
                          last_name: user?.last_name,
                          email: user?.email,
                          phone: user?.phone_number ? { phone_country_code: '+234', phone_number: user.phone_number } : undefined,
                        }}
                        onSuccess={(updatedData) => {
                          success('Profile updated successfully!');
                        }}
                      />
                    ) : (
                      <p className="text-sm text-black/50">Loading profile...</p>
                    )}
                  </Card>
                </Tab.Panel>

                <Tab.Panel>
                  <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black tracking-tight text-[#111]">
                        Security Settings
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-black/50">
                        Manage your password and account protection settings.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          title: 'Change Password',
                          description:
                            'Update your password regularly to keep your Remopay account safe.',
                          action: 'Change',
                          icon: KeyRound,
                        },
                        {
                          title: 'Two-Factor Authentication',
                          description:
                            'Add another layer of protection to your account sign-in process.',
                          action: 'Enable',
                          icon: ShieldCheck,
                        },
                        {
                          title: 'Login History',
                          description:
                            'Review recent login activity and active account sessions.',
                          action: 'View',
                          icon: ChevronRight,
                        },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.title}
                            className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-[#f8f8f8] p-5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl bg-[#fff1f2] p-3">
                                <Icon className="h-5 w-5 text-[#d71927]" />
                              </div>

                              <div>
                                <h3 className="text-base font-black text-[#111]">
                                  {item.title}
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-black/50">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              className="h-11 rounded-xl border-black/10 px-5 font-black text-[#111] hover:bg-[#fff1f2]"
                            >
                              {item.action}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </Tab.Panel>

                <Tab.Panel>
                  <AccountDeletion />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </section>
        </div>
      </div>
    </div>
  );
}