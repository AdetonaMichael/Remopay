'use client';

import React from 'react';

interface CardMetaItemProps {
  label: string;
  children: React.ReactNode;
}

export const CardMetaItem: React.FC<CardMetaItemProps> = ({ label, children }) => (
  <div>
    <p className="text-[11px] font-medium text-gray-500">{label}</p>
    <div className="font-semibold text-gray-900 mt-0.5">{children}</div>
  </div>
);