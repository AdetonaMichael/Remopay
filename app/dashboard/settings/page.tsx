'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tab } from '@headlessui/react';
import {
  BellRing,
  Camera,
  ChevronRight,
  KeyRound,
  Zap,
  Settings2,
  ShieldCheck,
  User2,
  Trash2,
} from 'lucide-react';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services/auth.service';
import { tierUpgradeService } from '@/services/tier-upgrade.service';
import { TierUpgradeFormV2 } from '@/components/dashboard/TierUpgradeForm.v2';
import { AccountDeletion } from '@/components/dashboard/AccountDeletion';
import {
  updateProfileSchema,
  type UpdateProfileSchema,
} from '@/utils/validation.utils';
import { useAlert } from '@/hooks/useAlert';
import { useApi } from '@/hooks/useApi';
import { TierStatus, TierLevel } from '@/types/tier-upgrade.types';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const TIER_INFO: Record<TierLevel, { name: string; icon: React.ComponentType<any>; color: string }> = {
  0: { name: 'None', icon: User2, color: 'text-gray-500' },
  1: { name: 'Bronze', icon: Zap, color: 'text-amber-600' },
  2: { name: 'Silver', icon: Zap, color: 'text-slate-400' },
  3: { name: 'Gold', icon: Zap, color: 'text-yellow-500' },
};

const tabs = [
  {
    label: 'Profile',
    icon: User2,
    subtitle: 'Personal details and account info',
  },
  {
    label: 'Account Tier',
    icon: Zap,
    subtitle: 'Upgrade your account and unlock benefits',
  },
  {
    label: 'Security',
    icon: ShieldCheck,
    subtitle: 'Password and account protection',
  },
  {
    label: 'Notifications',
    icon: BellRing,
    subtitle: 'Control how you receive updates',
  },
  {
    label: 'Privacy & Account',
    icon: Trash2,
    subtitle: 'Manage your data and account deletion',
  },
];

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { success, error: alertError } = useAlert();
  const { execute } = useApi();
  const [loading, setLoading] = useState(false);
  const [tierStatus, setTierStatus] = useState<TierStatus | null>(null);
  const [tierLoading, setTierLoading] = useState(true);

  const fullName = useMemo(() => {
    if (!user) return 'Remopay User';

    return (
      `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
      'Remopay User'
    );
  }, [user]);

  const initials = useMemo(() => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name[0])
      .join('')
      .toUpperCase();
  }, [fullName]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      bio: '',
      gender: undefined,
      country: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({
      name:
        `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
        '',
      bio: '',
      gender: undefined,
      country: '',
      city: '',
      state: '',
    });
  }, [user, reset]);

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

  const onSubmit = async (data: UpdateProfileSchema) => {
    try {
      setLoading(true);

      const res = await userService.updateProfile(data);

      if (res.success && res.data) {
        setUser(res.data.user);
        success('Profile updated successfully!');
      } else {
        alertError(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      alertError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-8">
      <div className="overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_20px_70px_rgba(16,3,3,0.08)]">

        <div className="grid grid-cols-1 gap-6 bg-[#f8f8f8] p-5 sm:p-6 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className="overflow-hidden rounded-[28px] border border-black/5 bg-white p-0 shadow-sm">
              <div className="h-24 bg-[#100303]" />

              <div className="px-6 pb-6">
                <div className="-mt-12 flex items-end justify-between">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-[#d71927] text-2xl font-black text-white shadow-lg shadow-[#d71927]/25">
                      {initials || 'U'}
                    </div>

                    <button
                      type="button"
                      className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#d71927] shadow-sm transition hover:bg-[#fff1f2]"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="text-xl font-black tracking-tight text-[#111]">
                    {fullName}
                  </h2>
                  <p className="mt-1 break-all text-sm font-medium text-black/50">
                    {user?.email || 'No email available'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-black/50">
                    {user?.phone_number || 'No phone number available'}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ['City', '—'],
                    ['State', '—'],
                    ['Country', '—'],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-2xl bg-[#f8f8f8] px-4 py-3"
                    >
                      <span className="text-sm font-bold text-black/45">
                        {label}
                      </span>
                      <span className="text-sm font-black text-[#111]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

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
                      {TIER_INFO[tierStatus.current_tier.level].icon && (
                        <div className={`text-2xl ${TIER_INFO[tierStatus.current_tier.level].color}`}>
                          {tierStatus.current_tier.level > 0 ? '⚡' : '•'}
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-black text-[#111]">
                          {TIER_INFO[tierStatus.current_tier.level].name}
                        </p>
                        <p className="text-xs text-black/50 mt-0.5">
                          {tierStatus.current_tier.status === 'active' ? '✓ Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {tierStatus.current_tier.level < 3 && (
                    <div className="rounded-2xl border-2 border-[#d71927]/20 bg-[#fff1f2] p-4">
                      <p className="text-sm font-bold text-[#d71927] mb-2">Next Tier</p>
                      <p className="text-base font-black text-[#111]">
                        {TIER_INFO[tierStatus.next_tier.level as TierLevel].name}
                      </p>
                      <p className="text-xs text-black/50 mt-2">
                        Complete profile info to upgrade
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-5 text-sm text-black/50">Unable to load tier information</p>
              )}
            </Card>
          </aside>

          <section>
            <Tab.Group>
              <Tab.List className="grid grid-cols-1 gap-3 rounded-[28px] border border-black/5 bg-white p-3 shadow-sm sm:grid-cols-4">
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
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                      <div className="mb-8">
                        <h2 className="text-2xl font-black tracking-tight text-[#111]">
                          Personal Information
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-7 text-black/50">
                          Update your account details and personal information.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Input
                          label="Full Name"
                          type="text"
                          error={errors.name?.message}
                          {...register('name')}
                        />

                        <Input
                          label="Email Address"
                          type="email"
                          value={user?.email || ''}
                          disabled
                        />

                        <Input
                          label="Phone Number"
                          type="tel"
                          value={user?.phone_number || ''}
                          disabled
                        />

                        <Select
                          label="Gender"
                          options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' },
                          ]}
                          {...register('gender')}
                        />

                        <Input
                          label="City"
                          type="text"
                          error={errors.city?.message}
                          {...register('city')}
                        />

                        <Input
                          label="State"
                          type="text"
                          error={errors.state?.message}
                          {...register('state')}
                        />

                        <div className="md:col-span-2">
                          <Input
                            label="Country"
                            type="text"
                            error={errors.country?.message}
                            {...register('country')}
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="mb-2 block text-sm font-black text-[#111]">
                          Bio
                        </label>

                        <textarea
                          rows={5}
                          placeholder="Tell us a little about yourself"
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-black/35 focus:border-[#d71927] focus:ring-4 focus:ring-[#d71927]/10"
                          {...register('bio')}
                        />

                        {errors.bio?.message ? (
                          <p className="mt-2 text-sm font-semibold text-[#d71927]">
                            {errors.bio.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button
                          type="submit"
                          isLoading={loading}
                          className="h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]"
                        >
                          Save Changes
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => reset()}
                          className="h-11 rounded-xl border-black/10 px-6 font-black text-[#111] hover:bg-[#fff1f2]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  </form>
                </Tab.Panel>

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
                        currentTier={tierStatus.current_tier.level}
                        onSuccess={(newTier) => {
                          success('Tier upgraded successfully! Your new tier is now active.');
                          setTierStatus({
                            ...tierStatus,
                            current_tier: {
                              ...tierStatus.current_tier,
                              level: newTier as TierLevel,
                            },
                          });
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
                  <Card className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-black tracking-tight text-[#111]">
                        Notification Preferences
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-black/50">
                        Choose how Remopay sends account alerts, transaction
                        updates, and service notifications.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          label: 'Email Notifications',
                          desc: 'Receive transaction updates, alerts, and important account communication by email.',
                        },
                        {
                          label: 'SMS Notifications',
                          desc: 'Receive important updates and service confirmations via SMS.',
                        },
                        {
                          label: 'App Notifications',
                          desc: 'Get real-time alerts directly inside your Remopay dashboard.',
                        },
                        {
                          label: 'Marketing Emails',
                          desc: 'Receive product updates, offers, and Remopay announcements.',
                        },
                      ].map((item, index) => (
                        <div
                          key={item.label}
                          className="flex flex-col gap-4 rounded-[24px] border border-black/5 bg-[#f8f8f8] p-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="pr-0 sm:pr-8">
                            <h3 className="text-base font-black text-[#111]">
                              {item.label}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-black/50">
                              {item.desc}
                            </p>
                          </div>

                          <label className="inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="peer sr-only"
                              defaultChecked={index !== 3}
                            />
                            <span className="relative h-7 w-12 rounded-full bg-black/20 transition peer-checked:bg-[#d71927] after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:left-6" />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8">
                      <Button className="h-11 rounded-xl bg-[#d71927] px-6 font-black text-white shadow-lg shadow-[#d71927]/20 hover:bg-[#b91521]">
                        Save Preferences
                      </Button>
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