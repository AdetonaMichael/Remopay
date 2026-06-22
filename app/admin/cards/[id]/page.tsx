'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit2, RefreshCw, AlertCircle } from 'lucide-react';
import { CardDetailsForm, AuditLogTimeline } from '@/components/admin/cards';
import { cardAdminService } from '@/services/card-admin.service';
import { CardAdminView, CardAuditLog, SetCardDetailsRequest } from '@/types/card-admin.types';
import { useUIStore } from '@/store/ui.store';

export default function CardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useUIStore();

  const cardId = params.id as string;
  const [card, setCard] = useState<CardAdminView | null>(null);
  const [auditLogs, setAuditLogs] = useState<CardAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchCardData = async () => {
    try {
      setLoading(true);
      const response = await cardAdminService.getCardAuditLogs(cardId);

      if (response.success && response.data) {
        // The response includes audit logs; we need to construct the card view
        // For now, we'll use the data from the response
        setAuditLogs(response.data.audit_logs);
      } else {
        addToast({
          type: 'error',
          message: 'Failed to load card details',
        });
      }
    } catch (error: any) {
      console.error('Error fetching card data:', error);
      addToast({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to load card details',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) {
      fetchCardData();
    }
  }, [cardId]);

  const handleSetDetails = async (data: Partial<SetCardDetailsRequest>) => {
    try {
      setSubmitting(true);
      const response = await cardAdminService.setCardDetails(cardId, data);

      if (response.success) {
        addToast({
          type: 'success',
          message: 'Card details saved successfully',
        });
        setFormOpen(false);
        // Refresh the audit logs
        fetchCardData();
      } else {
        addToast({
          type: 'error',
          message: response.message || 'Failed to save card details',
        });
      }
    } catch (error: any) {
      console.error('Error setting card details:', error);
      addToast({
        type: 'error',
        message: error?.message || 'Failed to save card details',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </button>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg border border-gray-200 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cards
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Card Details</h1>
      </div>

      {/* Card Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Card Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Visual */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white aspect-video flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs opacity-75">Card Number</p>
                  <p className="font-mono font-bold text-lg mt-1">
                    {auditLogs[0]?.fields_modified?.includes('card_number')
                      ? '••••••••••••••••'
                      : '— — — —'}
                  </p>
                </div>
                <span className="text-lg font-bold">
                  {auditLogs[0]?.fields_modified?.includes('card_number')
                    ? 'VISA'
                    : ''}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-75">Expiry</p>
                  <p className="font-mono font-semibold mt-1">
                    {auditLogs[0]?.fields_modified?.includes('expiry')
                      ? '••/••'
                      : '——/——'}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-75">CVV</p>
                  <p className="font-mono font-semibold mt-1">•••</p>
                </div>
              </div>
            </div>

            {/* Card Info Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Card Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Card ID</p>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    {cardId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Type</p>
                  <p className="text-sm font-medium text-gray-900">VIRTUAL</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    ACTIVE
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Currency</p>
                  <p className="text-sm font-medium text-gray-900">USD</p>
                </div>
              </div>

              {/* Details Status */}
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Details Status
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      {auditLogs.length > 0
                        ? 'Card details have been populated'
                        : 'Card details not yet populated'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Card Details
                </button>
                <button
                  onClick={fetchCardData}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-4">User Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-medium text-gray-900">
                  user@example.com
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  User Name
                </p>
              </div>
            </div>
          </div>

          {/* Card Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-600">Created</p>
                <p className="font-medium text-gray-900">
                  Jun 20, 2026
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Balance</p>
                <p className="font-medium text-gray-900">
                  $0.00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Modification History
        </h2>
        <AuditLogTimeline logs={auditLogs} isLoading={loading} />
      </div>

      {/* Card Details Form Modal */}
      <CardDetailsForm
        cardId={parseInt(cardId)}
        maskedPan={`Card ID: ${cardId}`}
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSetDetails}
        isLoading={submitting}
      />
    </div>
  );
}
