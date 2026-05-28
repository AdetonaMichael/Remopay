'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCards } from '@/hooks/useCards';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { CardList, CreateCardForm, CardFilterSection } from '@/components/dashboard/card';
import { AlertCircle, CreditCard, Loader } from 'lucide-react';

/**
 * Virtual Card Management Dashboard
 * Main page for creating and managing virtual USD cards
 */
export default function VirtualCardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  // Use the cards hook for all card operations
  const {
    cardListState,
    createFormData,
    updateCreateFormField,
    createFormErrors,
    isCreatingCard,
    createCard,
    goToPage,
    changePageSize,
    applyFilters,
    clearFilters,
    hasCards,
    isEmpty,
  } = useCards({
    onSuccess: (message) => {
      // Cards list will auto-refresh
    },
    onError: (error) => {
      // Error is already shown via toast in the hook
      console.error('[VirtualCardPage] Card operation error:', error);
    },
  });

  // Verify user authentication
  useEffect(() => {
    if (!user) {
      addToast({ type: 'error', message: 'Please log in to access cards' });
      router.push('/auth/login');
    }
  }, [user, router, addToast]);

  if (!user) {
    return null;
  }

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="min-h-screen bg-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
        
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Virtual Cards</h1>
              <p className="text-sm text-gray-600 mt-0.5">Create and manage your USD virtual cards</p>
            </div>
          </div>
        </div>

        {/* Error State Display */}
        {cardListState.error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{cardListState.error}</p>
              <p className="text-xs text-red-700 mt-1">
                If this issue persists, please ensure your profile is complete and verified.
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Create Card Form */}
          <CreateCardForm
            formData={createFormData}
            onFieldChange={updateCreateFormField}
            onSubmit={async () => {
              await createCard();
            }}
            errors={createFormErrors}
            isLoading={isCreatingCard || cardListState.isLoading}
            onSuccess={() => {
              // Form will auto-reset in the hook
            }}
          />

          {/* Filter Section - Only show if there are cards */}
          {hasCards && (
            <CardFilterSection
              onFiltersChange={applyFilters}
              onClear={clearFilters}
              isLoading={cardListState.isLoading}
            />
          )}

          {/* Cards List */}
          <CardList
            cards={cardListState.cards}
            pagination={cardListState.pagination}
            isLoading={cardListState.isLoading}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        </div>

        {/* Features Section - Only show if no cards */}
        {isEmpty && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Why Virtual Cards?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Instant Creation',
                  desc: 'Generate virtual cards in seconds, ready to use immediately.',
                  icon: '',
                },
                {
                  title: 'Enhanced Security',
                  desc: 'Protect your real card details with disposable virtual cards.',
                  icon: '',
                },
                {
                  title: 'Full Control',
                  desc: 'Manage multiple cards for different purposes and merchants.',
                  icon: '',
                },
              ].map((feature, idx) => (
                <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

