'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface CardBreadcrumbProps {
  onBack: () => void;
}

export const CardBreadcrumb: React.FC<CardBreadcrumbProps> = ({ onBack }) => (
  <nav className="flex items-center gap-2 text-sm">
    <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium transition-colors">
      Cards
    </button>
    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
    <span className="font-bold text-gray-900">Card details</span>
  </nav>
);