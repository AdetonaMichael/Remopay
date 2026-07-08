'use client';

import React from 'react';
import { Copy, CopyCheck } from 'lucide-react';

interface CardCopyButtonProps {
  value: string;
  label: string;
  copiedField: string | null;
  onCopy: (label: string, value: string) => void;
}

export const CardCopyButton: React.FC<CardCopyButtonProps> = ({ value, label, copiedField, onCopy }) => {
  const copied = copiedField === label;
  return (
    <button
      type="button"
      onClick={() => onCopy(label, value)}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 hover:text-[#d71927] hover:bg-red-50 transition-colors"
      title={copied ? 'Copied!' : `Copy ${label}`}
      aria-label={`Copy ${label}`}
    >
      {copied ? <CopyCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};