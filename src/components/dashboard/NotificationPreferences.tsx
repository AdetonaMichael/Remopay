/**
 * NotificationPreferences Component
 * Manage notification settings and preferences - Full screen slide-in panel
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPreference } from '@/types/notification.types';
import {
  AlertCircle,
  CheckCircle,
  Loader,
  Bell,
  Zap,
  X,
  Smartphone,
  Mail,
} from 'lucide-react';

interface NotificationPreferencesProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type UpdatablePreferenceField = 
  | 'enabled' 
  | 'transaction_notifications' 
  | 'system_notifications' 
  | 'promotion_notifications' 
  | 'update_notifications' 
  | 'alert_notifications' 
  | 'email_notifications' 
  | 'push_notifications';

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ 
  isOpen = true, 
  onClose 
}) => {
  const { preferences, preferencesLoading, fetchPreferences, updatePreferences, error } =
    useNotifications();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch preferences on component mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async (
    field: keyof Pick<NotificationPreference, 'enabled' | 'transaction_notifications' | 'system_notifications' | 'promotion_notifications' | 'update_notifications' | 'alert_notifications' | 'email_notifications' | 'push_notifications'>,
    currentValue: boolean
  ) => {
    if (!preferences) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updatePreferences({
        [field]: !currentValue,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to update preferences';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Content */}
      <div className="p-6 md:p-8 space-y-6">
            
            {preferencesLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Loading your preferences...</p>
                </div>
              </div>
            ) : !preferences ? (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-red-900">Unable to load preferences</h3>
                  <p className="text-sm text-red-700 mt-1">We couldn't fetch your notification settings. Please try again later or contact support.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Success message */}
                {saveSuccess && (
                  <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex gap-4 animate-in fade-in duration-200">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-green-900">Preferences saved successfully</h3>
                      <p className="text-sm text-green-700 mt-0.5">Your notification settings have been updated.</p>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {saveError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex gap-4 animate-in fade-in duration-200">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-red-900">Failed to save preferences</h3>
                      <p className="text-sm text-red-700 mt-0.5 break-words">{saveError}</p>
                    </div>
                  </div>
                )}

                {/* Master Control Section - Full Width */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">Master Control</h3>
                      <p className="text-sm text-gray-600 mt-1">Enable or disable all notifications at once</p>
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-4 mt-4 p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full flex-shrink-0 bg-gradient-to-r from-gray-200 to-gray-300" style={{backgroundColor: preferences.enabled ? 'rgb(220, 38, 38)' : 'rgb(203, 213, 225)'}}>
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${preferences.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">All Notifications</span>
                    {isSaving && <Loader className="h-4 w-4 animate-spin text-red-600 flex-shrink-0" />}
                    <input
                      type="checkbox"
                      checked={preferences.enabled}
                      onChange={() => handleToggle('enabled', preferences.enabled)}
                      disabled={isSaving}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notification Types Section - Left Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Zap className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Notification Types</h3>
                        <p className="text-xs text-gray-600">Choose what kinds of notifications to receive</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'transaction_notifications' as const, label: 'Transactions', desc: 'Payments, transfers & wallet updates' },
                        { key: 'system_notifications' as const, label: 'System Updates', desc: 'Platform maintenance & important updates' },
                        { key: 'promotion_notifications' as const, label: 'Promotions', desc: 'Exclusive offers, deals & campaigns' },
                        { key: 'update_notifications' as const, label: 'New Features', desc: 'New features & product improvements' },
                        { key: 'alert_notifications' as const, label: 'Security Alerts', desc: 'Login alerts & suspicious activity' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer has-[:disabled]:opacity-60 has-[:disabled]:cursor-not-allowed">
                          <div className="relative inline-flex h-5 w-9 items-center rounded-full flex-shrink-0 bg-gray-300" style={{backgroundColor: preferences[item.key] && preferences.enabled ? '#3b82f6' : '#cbd5e1'}}>
                            <span className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${preferences[item.key] && preferences.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={preferences[item.key]}
                            onChange={() => handleToggle(item.key, preferences[item.key])}
                            disabled={isSaving || !preferences.enabled}
                            className="hidden"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Channels Section - Right Column */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Mail className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Delivery Channels</h3>
                        <p className="text-xs text-gray-600">How you want to receive notifications</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { key: 'push_notifications' as const, label: 'Push Notifications', icon: Smartphone, desc: 'Instant alerts on your device' },
                        { key: 'email_notifications' as const, label: 'Email Notifications', icon: Mail, desc: 'Daily or weekly email summaries' },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <label key={item.key} className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer has-[:disabled]:opacity-60 has-[:disabled]:cursor-not-allowed">
                            <div className="relative inline-flex h-5 w-9 items-center rounded-full flex-shrink-0 bg-gray-300" style={{backgroundColor: preferences[item.key] && preferences.enabled ? '#3b82f6' : '#cbd5e1'}}>
                              <span className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${preferences[item.key] && preferences.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <Icon className="h-4 w-4 flex-shrink-0" />
                                {item.label}
                              </p>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={preferences[item.key]}
                              onChange={() => handleToggle(item.key, preferences[item.key])}
                              disabled={isSaving || !preferences.enabled}
                              className="hidden"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
      </div>
    </div>
  );
};
