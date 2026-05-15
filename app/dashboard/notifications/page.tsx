'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Settings } from 'lucide-react';
import { NotificationsList } from '@/components/dashboard/NotificationsList';
import { Card } from '@/components/shared/Card';

export default function NotificationsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#140404] rounded-lg p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-gray-300 text-sm">Manage and review all your notifications</p>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => router.push('/dashboard/settings/notifications')}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Notification settings"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <>
        <NotificationsList limit={20} />
      </>
    </div>
  );
}
