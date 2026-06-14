'use client';

import React from 'react';
import { Clock, TrendingUp, Plus } from 'lucide-react';
import { VtuRecipient } from '@/types/api.types';

interface RecipientQuickSelectProps {
  recentlyUsed?: VtuRecipient[];
  frequentlyUsed?: VtuRecipient[];
  onSelect: (recipient: VtuRecipient) => void;
  onAddNew?: () => void;
  isLoading?: boolean;
}

export const RecipientQuickSelect: React.FC<RecipientQuickSelectProps> = ({
  recentlyUsed = [],
  frequentlyUsed = [],
  onSelect,
  onAddNew,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const displayRecent = recentlyUsed.slice(0, 3);
  const displayFrequent = frequentlyUsed.slice(0, 3);

  if (displayRecent.length === 0 && displayFrequent.length === 0) {
    return null;
  }

  const RecipientChip: React.FC<{ recipient: VtuRecipient; icon: React.ReactNode }> = ({
    recipient,
    icon,
  }) => (
    <button
      onClick={() => onSelect(recipient)}
      className="group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
      type="button"
      title={recipient.recipient_name || recipient.credential}
    >
      <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition">
        {icon}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-sm font-medium text-gray-900 truncate">
          {recipient.credential}
        </p>
        {recipient.recipient_name && (
          <p className="text-xs text-gray-500 truncate">{recipient.recipient_name}</p>
        )}
      </div>
      {recipient.usage_count > 0 && (
        <span className="flex-shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {recipient.usage_count}x
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Recently Used */}
      {displayRecent.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Recently Used</h3>
          </div>
          <div className="space-y-2">
            {displayRecent.map((recipient) => (
              <RecipientChip
                key={recipient.id}
                recipient={recipient}
                icon={<Clock className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>
      )}

      {/* Frequently Used */}
      {displayFrequent.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Frequently Used</h3>
          </div>
          <div className="space-y-2">
            {displayFrequent.map((recipient) => (
              <RecipientChip
                key={recipient.id}
                recipient={recipient}
                icon={<TrendingUp className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add New Button */}
      {onAddNew && (
        <button
          onClick={onAddNew}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 font-medium"
          type="button"
        >
          <Plus className="h-5 w-5" />
          Add New Recipient
        </button>
      )}
    </div>
  );
};
