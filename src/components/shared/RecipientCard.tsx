/**
 * RecipientCard Component
 * Displays recipient information
 */

'use client';

import { RecipientUser, Recipient, IdentifierType } from '@/types/transfer.types';
import { User } from 'lucide-react';

interface RecipientCardProps {
  recipient: RecipientUser | Recipient;
  amount?: number;
  onRemove?: () => void;
}

export const RecipientCard = ({ recipient, amount, onRemove }: RecipientCardProps) => {
  const isUser = 'id' in recipient && !('bank_type' in recipient);
  const displayRecipient = recipient as RecipientUser;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        {displayRecipient.avatar ? (
          <img
            src={displayRecipient.avatar}
            alt={displayRecipient.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#d71927]/20 flex items-center justify-center">
            <User className="w-6 h-6 text-[#d71927]" />
          </div>
        )}

        <div className="flex-1">
          <p className="font-semibold text-white">{displayRecipient.name}</p>
          <p className="text-sm text-white/60">
            {displayRecipient.identifier_type === IdentifierType.PHONE
              ? displayRecipient.phone_number
              : displayRecipient.email}
          </p>
        </div>

        {amount && (
          <div className="text-right">
            <p className="font-semibold text-white">₦{amount.toLocaleString()}</p>
            <p className="text-xs text-white/60">Transfer amount</p>
          </div>
        )}
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className="mt-3 w-full py-2 text-sm text-[#d71927] hover:bg-[#d71927]/10 rounded-lg transition-colors"
        >
          Change Recipient
        </button>
      )}
    </div>
  );
};
