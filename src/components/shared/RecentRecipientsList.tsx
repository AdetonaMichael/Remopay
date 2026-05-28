/**
 * RecentRecipientsList Component
 * Shows recently used recipients for quick selection
 */

'use client';

import { Recipient, IdentifierType } from '@/types/transfer.types';
import { Button } from './Button';
import { User, ChevronRight } from 'lucide-react';

interface RecentRecipientsListProps {
  recipients: Recipient[];
  onSelect: (recipient: Recipient) => void;
  isLoading?: boolean;
}

export const RecentRecipientsList = ({
  recipients,
  onSelect,
  isLoading = false,
}: RecentRecipientsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!recipients || recipients.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600 text-sm">No recent recipients yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {recipients.map((recipient) => (
        <button
          key={recipient.id}
          onClick={() => onSelect(recipient)}
          className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all group"
        >
          {recipient.profile_image ? (
            <img
              src={recipient.profile_image}
              alt={recipient.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#d71927]" />
            </div>
          )}

          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-900 text-sm">{recipient.name}</p>
            <p className="text-xs text-gray-600">
              {recipient.identifier_type === IdentifierType.PHONE
                ? recipient.phone
                : recipient.email}
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      ))}
    </div>
  );
};
