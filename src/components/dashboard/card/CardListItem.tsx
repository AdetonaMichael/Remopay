'use client';

import React from 'react';
import { VirtualCard, CardStatus } from '@/types/card.types';
import { CreditCard, Check, AlertCircle } from 'lucide-react';

interface CardListItemProps {
  card: VirtualCard;
}

/**
 * Individual virtual card display item
 * Shows card details with status indicator
 */
export const CardListItem: React.FC<CardListItemProps> = ({ card }) => {
  const isActive = card.status === CardStatus.ACTIVE;
  const statusColor = isActive ? 'text-emerald-600' : 'text-amber-600';
  const statusBgColor = isActive ? 'bg-emerald-50' : 'bg-amber-50';
  const borderColor = isActive ? 'border-emerald-200' : 'border-amber-200';

  return (
    <div className={`rounded-lg border ${borderColor} ${isActive ? 'bg-white' : 'bg-gray-50'} p-4 transition-all hover:shadow-sm`}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{card.brand}</h3>
            <p className="text-xs text-gray-500">{card.currency}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 ${statusBgColor}`}>
          {isActive ? (
            <Check className={`h-3.5 w-3.5 ${statusColor}`} />
          ) : (
            <AlertCircle className={`h-3.5 w-3.5 ${statusColor}`} />
          )}
          <span className={`text-xs font-medium ${statusColor}`}>{card.status}</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-3">
        {/* Card Number */}
        <div>
          <p className="text-xs text-gray-600 mb-0.5">Card Number</p>
          <p className="font-mono text-sm font-semibold text-gray-900">{card.card_number}</p>
        </div>

        {/* Expiry and Cardholder */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Expiry</p>
            <p className="font-mono text-sm font-medium text-gray-900">{card.expiry}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Cardholder</p>
            <p className="text-sm font-medium text-gray-900">{card.cardholder_name}</p>
          </div>
        </div>

        {/* CVV (Always masked for security) */}
        <div>
          <p className="text-xs text-gray-600 mb-0.5">CVV</p>
          <p className="font-mono text-sm font-medium text-gray-900">{card.cvv}</p>
        </div>

        {/* Created Date */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Created on {new Date(card.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
