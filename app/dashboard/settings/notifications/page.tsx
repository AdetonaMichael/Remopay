'use client';

import React, { useEffect } from 'react';
import { Settings, Bell, Mail, Zap, Check } from 'lucide-react';
import { NotificationPreferences } from '@/components/dashboard/NotificationPreferences';
import { useNotifications } from '@/hooks/useNotifications';

export default function NotificationSettingsPage() {
  const { preferences, fetchPreferences } = useNotifications();

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-[#140404]  rounded-2xl p-8 border border-slate-700/50 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Notification Settings</h1>
              <p className="text-slate-400 mt-2">Customize how and when you receive notifications</p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        {preferences && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-700/50">
            {/* Overall Status */}
            <div className="bg-[#140404] backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Overall Status</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {preferences.enabled ? 'Active' : 'Paused'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${preferences.enabled ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  {preferences.enabled ? (
                    <Check className="h-6 w-6 text-green-400" />
                  ) : (
                    <Bell className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Push Status */}
            <div className="bg-[#140404] backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Push Notifications</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {preferences.push_notifications ? 'On' : 'Off'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${preferences.push_notifications ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  <Zap className={`h-6 w-6 ${preferences.push_notifications ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>

            {/* Email Status */}
            <div className="bg-[#140404] backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Email Notifications</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {preferences.email_notifications ? 'On' : 'Off'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${preferences.email_notifications ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                  <Mail className={`h-6 w-6 ${preferences.email_notifications ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Form */}
      <NotificationPreferences />
    </div>
  );
}
