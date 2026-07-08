'use client';

import React from 'react';
import Image from 'next/image';
import { VirtualCard, CardStatus } from '@/types/card.types';
import { Check, Snowflake, Ban, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface CardListItemProps {
  card: VirtualCard;
  onViewDetails?: (cardId: string) => void;
  onFund?: (cardId: string, maskedPan: string | null) => void;
  onWithdraw?: (cardId: string, maskedPan: string | null) => void;
}

export const CardListItem: React.FC<CardListItemProps> = ({
  card,
  onViewDetails,
  onFund,
  onWithdraw,
}) => {
  const getStatusConfig = (status: CardStatus) => {
    const configs: Record<string, { label: string; bg: string; text: string; Icon: any }> = {
      [CardStatus.ACTIVE]: {
        label: 'Active',
        bg: 'bg-emerald-50 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        Icon: Check,
      },
      [CardStatus.FROZEN]: {
        label: 'Frozen',
        bg: 'bg-blue-50 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        Icon: Snowflake,
      },
      [CardStatus.DISABLED]: {
        label: 'Disabled',
        bg: 'bg-amber-50 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        Icon: Ban,
      },
      [CardStatus.TERMINATED]: {
        label: 'Terminated',
        bg: 'bg-red-50 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        Icon: Ban,
      },
    };
    return configs[status] || configs[CardStatus.ACTIVE];
  };

  const statusConfig = getStatusConfig(card.status);
  const StatusIcon = statusConfig.Icon;
  const maskedPan = card.masked_pan || card.card_number || '';
  const displayPan = maskedPan.length > 8
    ? `•••• ${maskedPan.slice(-4)}`
    : maskedPan;
  const isActive = card.status === CardStatus.ACTIVE;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border transition-all duration-300
        ${isActive
          ? 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5'
          : 'border-gray-200 bg-gray-50/80'
        }
      `}
    >
      {/* Card Brand Accent Bar */}
      <div className={`h-1.5 w-full ${
        card.brand === 'VISA' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'
      }`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-gray-200 p-1.5">
              <Image
                src={card.brand === 'VISA' ? '/visa.webp' : '/mastercard.svg'}
                alt={card.brand}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{card.brand}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500">{card.currency}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-500">{card.type || 'VIRTUAL'}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${statusConfig.bg}`}>
            <StatusIcon className={`h-3 w-3 ${statusConfig.text}`} />
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Card Number */}
        <div className="mb-4">
          <p className="text-[11px] font-medium text-gray-500 mb-1">Card Number</p>
          <p className="font-mono text-base font-bold tracking-wider text-gray-900">
            {displayPan}
          </p>
        </div>

        {/* Card Meta Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-0.5">Expiry</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{card.expiry}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-0.5">CVV</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{card.cvv}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-500 mb-0.5">Balance</p>
            <p className="text-sm font-bold text-gray-900">
              ${card.balance?.toFixed(2) ?? '—'}
            </p>
          </div>
        </div>

        {/* Cardholder Name */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <p className="text-[11px] font-medium text-gray-500 mb-0.5">Cardholder</p>
          <p className="text-sm font-semibold text-gray-900">{card.cardholder_name || card.name || '—'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails?.(card.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Zap className="h-3.5 w-3.5" />
            Details
          </button>
          {isActive && (
            <>
              <button
                onClick={() => onFund?.(card.id, card.masked_pan || null)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <ArrowDownLeft className="h-3.5 w-3.5" />
                Fund
              </button>
              <button
                onClick={() => onWithdraw?.(card.id, card.masked_pan || null)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Withdraw
              </button>
            </>
          )}
        </div>

        {/* Created Date */}
        <p className="mt-3 text-[10px] text-gray-400">
          Created {new Date(card.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
};
