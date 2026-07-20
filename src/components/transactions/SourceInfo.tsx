'use client';

import { Phone, Tv, Wifi, Globe, CreditCard, FileText, MessageSquare, XCircle } from 'lucide-react';
import type { TransactionSource } from '@/types/transaction-detail.types';

interface SourceInfoProps {
  source: TransactionSource;
}

function InfoRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-3 divide-y divide-gray-50">
        {children}
      </div>
    </div>
  );
}

/** Render VTU purchase source details */
function VtuSourceDetails({ source }: { source: Extract<TransactionSource, { type: 'vtu' }> }) {
  return (
    <Section title="Purchase Details" icon={Wifi}>
      {source.product_name && <InfoRow label="Product" value={source.product_name} />}
      {source.recipient && <InfoRow label="Recipient" value={source.recipient} />}
      {source.unique_element && <InfoRow label="Account / Phone" value={source.unique_element} />}
      {source.channel && <InfoRow label="Channel" value={source.channel} />}
      {source.platform && <InfoRow label="Platform" value={source.platform} />}
      {source.method && <InfoRow label="Payment Method" value={source.method} />}
    </Section>
  );
}

/** Render Airtime Conversion source details */
function AirtimeConversionSourceDetails({ source }: { source: Extract<TransactionSource, { type: 'airtime_conversion' }> }) {
  return (
    <Section title="Airtime Conversion Details" icon={Phone}>
      {source.phone_number && <InfoRow label="Phone Number" value={source.phone_number} />}
      {source.provider && <InfoRow label="Provider" value={source.provider.toUpperCase()} />}
      {source.notes && (
        <div className="py-2">
          <span className="text-sm text-gray-500 block mb-1">Notes</span>
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{source.notes}</p>
        </div>
      )}
      {source.rejection_reason && (
        <div className="py-2">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600 font-medium">Rejection Reason</span>
          </div>
          <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">{source.rejection_reason}</p>
        </div>
      )}
      {source.screenshot && (
        <div className="py-2">
          <span className="text-sm text-gray-500 block mb-2">Screenshot</span>
          <img
            src={source.screenshot}
            alt="Transaction screenshot"
            className="rounded-lg border border-gray-200 max-h-48 object-contain"
          />
        </div>
      )}
    </Section>
  );
}

/** Render Paystack funding source details */
function PaystackSourceDetails({ source }: { source: Extract<TransactionSource, { type: 'paystack' }> }) {
  return (
    <Section title="Payment Gateway Details" icon={CreditCard}>
      {source.gateway_response && <InfoRow label="Gateway Response" value={source.gateway_response} />}
      {source.domain && <InfoRow label="Domain" value={source.domain} />}
      {source.receipt_number && <InfoRow label="Receipt Number" value={source.receipt_number} />}
      {source.authorization?.id && <InfoRow label="Authorization ID" value={source.authorization.id} />}
    </Section>
  );
}

export function SourceInfo({ source }: SourceInfoProps) {
  switch (source.type) {
    case 'vtu':
      return <VtuSourceDetails source={source} />;
    case 'airtime_conversion':
      return <AirtimeConversionSourceDetails source={source} />;
    case 'paystack':
      return <PaystackSourceDetails source={source} />;
    default:
      return null;
  }
}
