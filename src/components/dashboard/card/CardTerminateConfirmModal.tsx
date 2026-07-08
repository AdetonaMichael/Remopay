'use client';

import React from 'react';
import { Loader, ShieldAlert } from 'lucide-react';

interface CardTerminateConfirmModalProps {
  isOpen: boolean;
  isTerminating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const CardTerminateConfirmModal: React.FC<CardTerminateConfirmModalProps> = ({
  isOpen,
  isTerminating,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isTerminating && onCancel()} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <ShieldAlert className="h-5 w-5 text-[#d71927]" />
          </div>
          <h3 className="text-base font-black text-gray-900">Terminate this card?</h3>
        </div>
        <p className="text-sm text-gray-600">
          This action is permanent. The card will stop working immediately and cannot be reactivated.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isTerminating}
            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isTerminating}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#d71927] px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isTerminating ? <Loader className="h-4 w-4 animate-spin" /> : null}
            Terminate
          </button>
        </div>
      </div>
    </div>
  );
};