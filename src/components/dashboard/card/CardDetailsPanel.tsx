'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Loader, MapPin, RefreshCw, ShieldAlert } from 'lucide-react';
import { CardDetailData } from './card-detail.types';
import { getStatusConfig, formatDate } from './card-detail.utils';
import { CardFieldRow } from './CardFieldRow';
import { CardMetaItem } from './CardMetaItem';

interface CardDetailsPanelProps {
  card: CardDetailData;
  detailsVisible: boolean;
  onToggleVisibility: () => void;
  copiedField: string | null;
  onCopy: (label: string, value: string) => void;
  onFund: () => void;
  onWithdraw: () => void;
  onRefresh: () => void;
  onToggleFreeze: () => void;
  isFreezing: boolean;
  onRequestTerminate: () => void;
}

export const CardDetailsPanel: React.FC<CardDetailsPanelProps> = ({
  card,
  detailsVisible,
  onToggleVisibility,
  copiedField,
  onCopy,
  onFund,
  onWithdraw,
  onRefresh,
  onToggleFreeze,
  isFreezing,
  onRequestTerminate,
}) => {
  const statusConfig = getStatusConfig(card.status);
  const StatusIcon = statusConfig.Icon;
  const isActive = card.status === 'ACTIVE';

  // Full card number from the API (e.g. "4288520140333388")
  const fullPan = card.card_number || card.masked_pan || '';

  // API-provided masked version (e.g. "428852******3388")
  const apiMaskedPan = card.masked_pan || '';

  // Last 4 digits for the fallback hidden display
  const last4 = fullPan.length >= 4 ? fullPan.slice(-4) : fullPan;

  // Show the full number when toggled, otherwise show a hidden/masked version
  const displayNumber = detailsVisible ? fullPan : (apiMaskedPan || `•••• •••• •••• ${last4}`);
  const displayCvv = detailsVisible ? card.cvv : '•••';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">Details</h2>
          <p className="text-xs text-gray-500 mt-0.5">Created On {formatDate(card.created_at)}</p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Balance + Fund/Withdraw */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</p>
          <p className="text-2xl font-black text-gray-900 mt-1">${card.balance.toFixed(2)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Updated {formatDate(card.balance_updated_at, true)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onFund}
            disabled={!isActive}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#d71927] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Fund card
          </button>
          <button
            onClick={onWithdraw}
            disabled={!isActive}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Withdraw"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hide / show toggle */}
      <button
        onClick={onToggleVisibility}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
      >
        {detailsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {detailsVisible ? 'Hide details' : 'Show details'}
      </button>

      {/* Card Visual */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-5">
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#d71927]/20 -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 flex items-center justify-between mb-8">
          <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            Virtual
          </span>
          <Image
            src={card.issuer === 'VISA' ? '/visa.webp' : '/mastercard.svg'}
            alt={card.issuer}
            width={40}
            height={26}
            className="object-contain"
          />
        </div>
        <p className="relative z-10 font-mono text-lg font-bold tracking-[0.15em]">{displayNumber}</p>
        <p className="relative z-10 text-sm font-semibold text-white/90 mt-4">{card.name}</p>
      </div>

      {/* Field list */}
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <CardFieldRow label="Card ID" value={card.id} mono truncate copiedField={copiedField} onCopy={onCopy} />
        <CardFieldRow
          label="Card number"
          value={displayNumber}
          mono
          copiedField={copiedField}
          onCopy={onCopy}
          copyValue={fullPan}
        />
        <CardFieldRow label="Expiry date" value={card.expiry} mono copiedField={copiedField} onCopy={onCopy} />
        <CardFieldRow
          label="CVV"
          value={displayCvv}
          mono
          copiedField={copiedField}
          onCopy={onCopy}
          copyValue={card.cvv}
        />
      </div>

      {/* Status + secondary meta */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <CardMetaItem label="Status">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${statusConfig.badgeBg} ${statusConfig.badgeText}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
        </CardMetaItem>
        <CardMetaItem label="Type">{card.type}</CardMetaItem>
        <CardMetaItem label="Brand">{card.issuer}</CardMetaItem>
        <CardMetaItem label="Currency">{card.currency}</CardMetaItem>
        <CardMetaItem label="Auto approve">{card.auto_approve ? 'Enabled' : 'Disabled'}</CardMetaItem>
        <CardMetaItem label="Contactless">{card.is_contactless ? 'Yes' : 'No'}</CardMetaItem>
      </div>

      {/* Billing address */}
      <div>
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Billing address</p>
        <div className="flex items-start gap-2.5 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-900">{card.address.street}</p>
            <p>
              {card.address.city}, {card.address.state} {card.address.postal_code}
            </p>
            <p>{card.address.country}</p>
          </div>
        </div>
      </div>

      {/* Freeze */}
      <label className="flex items-center justify-between cursor-pointer border-t border-gray-100 pt-5">
        <div>
          <p className="text-sm font-bold text-gray-900">Freeze card</p>
          <p className="text-xs text-gray-500 mt-0.5">Temporarily block new transactions</p>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={card.status === 'FROZEN'}
            onChange={onToggleFreeze}
            disabled={isFreezing || card.status === 'TERMINATED'}
            className="sr-only peer"
          />
          {isFreezing ? (
            <Loader className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#d71927] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-disabled:opacity-50" />
          )}
        </div>
      </label>

      {/* Terminate */}
      <button
        onClick={onRequestTerminate}
        disabled={card.status === 'TERMINATED'}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#d71927] px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ShieldAlert className="h-4 w-4" />
        Terminate card
      </button>
    </div>
  );
};