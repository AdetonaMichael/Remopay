'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { Card } from '@/components/shared/Card';
import { Send, Building2, ChevronRight } from 'lucide-react';

export default function TransferPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    if (!user) {
      addToast({ type: 'error', message: 'Please log in to make transfers' });
      router.push('/auth/login');
    }
  }, [user, router, addToast]);

  const handleTransferTypeSelect = (type: 'remopay' | 'bank') => {
    router.push(
      type === 'remopay'
        ? '/dashboard/transfer/remopay'
        : '/dashboard/transfer/bank'
    );
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Send Money
          </h1>
        </div>

        {/* TRANSFER TYPE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* REMOPAY */}
          <Card
            onClick={() => handleTransferTypeSelect('remopay')}
            className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Send className="w-6 h-6 text-[#d71927]" />
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">Remopay</h3>
              <p className="text-sm text-gray-600">
                Send to Remopay users instantly
              </p>
            </div>
          </Card>

          {/* BANK */}
          <Card
            onClick={() => handleTransferTypeSelect('bank')}
            className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">Bank</h3>
              <p className="text-sm text-gray-600">
                Send to any Nigerian bank
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}