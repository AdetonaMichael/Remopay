'use client';

import React from 'react';
import { CardCopyButton } from './CardCopyButton';

interface CardFieldRowProps {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
  copiedField: string | null;
  onCopy: (label: string, value: string) => void;
  copyValue?: string;
}

export const CardFieldRow: React.FC<CardFieldRowProps> = ({
  label,
  value,
  mono,
  truncate,
  copiedField,
  onCopy,
  copyValue,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-500">{label}</p>
        <p
          className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono' : ''} ${
            truncate ? 'truncate max-w-[220px]' : ''
          }`}
        >
          {value}
        </p>
      </div>
      <CardCopyButton value={copyValue ?? value} label={label} copiedField={copiedField} onCopy={onCopy} />
    </div>
  );
};