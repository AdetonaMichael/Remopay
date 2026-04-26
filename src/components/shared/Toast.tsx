'use client';

import { useUIStore } from '@/store/ui.store';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-[#f7f8ff] border-[#e8ebff]';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-[#8a96ff]';
      default:
        return 'text-gray-800';
    }
  };

  // Don't render until after hydration to prevent mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast: any) => (
        <div
          key={toast.id}
          className={`${getBackgroundColor(toast.type)} ${getTextColor(toast.type)} border rounded-lg p-4 flex items-center justify-between pointer-events-auto animate-in slide-in-from-right-full duration-200`}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
