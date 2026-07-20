'use client';

import { Mail, Phone, User } from 'lucide-react';
import type { TransactionDetailUser } from '@/types/transaction-detail.types';

interface UserInfoProps {
  user: TransactionDetailUser;
}

export function UserInfo({ user }: UserInfoProps) {
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || '?';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-bold text-gray-900">User Information</h3>
      </div>
      <div className="px-6 py-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {user.profile_photo_url ? (
            <img
              src={user.profile_photo_url}
              alt={`${user.first_name} ${user.last_name}`}
              className="h-14 w-14 rounded-full object-cover shrink-0 border-2 border-gray-100"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#d71927]/10 text-lg font-bold text-[#d71927] border-2 border-[#d71927]/10">
              {initials}
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 flex-1">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.first_name} {user.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-700">{user.phone_number}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">User ID</p>
              <p className="text-sm font-semibold text-gray-900">#{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
