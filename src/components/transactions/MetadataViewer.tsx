'use client';

import { Building2, Clock, User as UserIcon } from 'lucide-react';
import { formatDateTime, formatCurrency } from '@/utils/format.utils';
import type { PolymorphicRecord } from '@/types/transaction-detail.types';

// ─── Helpers ───────────────────────────────────────────────────────────

function fmtTimestamp(ts: any): string {
  if (!ts || typeof ts !== 'string') return '—';
  try { return formatDateTime(ts); } catch { return ts; }
}

function fmtAmount(v: any, currency = 'NGN'): string {
  if (v == null) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  if (isNaN(n)) return '—';
  return formatCurrency(n, currency);
}

function str(v: any, fallback = '—'): string {
  if (v == null) return fallback;
  return String(v);
}

function labelize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isObj(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// ─── Bank Details Card ─────────────────────────────────────────────────

function BankDetailsCard({ data }: { data: Record<string, any> }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-bold text-blue-900">Bank Account Details</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">Bank</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{str(data.bank_name)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">Account Name</p>
          <p className="mt-1 text-sm font-bold text-gray-900 truncate">{str(data.account_name)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">Account Number</p>
          <p className="mt-1 text-sm font-bold text-gray-900 font-mono">{str(data.account_number)}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Subsidy Card ──────────────────────────────────────────────────────

function SubsidyCard({ data }: { data: Record<string, any> }) {
  return (
    <div className="rounded-xl bg-green-50 border border-green-200 p-4">
      <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">💰 Subsidy Applied</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        <div><span className="text-green-600">Savings:</span> <span className="font-bold text-green-800">{fmtAmount(data.savings)}</span></div>
        <div><span className="text-green-600">Type:</span> <span className="font-bold text-green-800 capitalize">{str(data.subsidy_type)}</span></div>
        <div><span className="text-green-600">Original:</span> <span className="font-bold text-green-800">{fmtAmount(data.original_amount)}</span></div>
        <div><span className="text-green-600">Paid:</span> <span className="font-bold text-green-800">{fmtAmount(data.subsidized_amount)}</span></div>
      </div>
    </div>
  );
}

// ─── Paystack Transfer Details ─────────────────────────────────────────

function PaystackTransferDetails({ data }: { data: Record<string, any> }) {
  const meta = isObj(data.metadata) ? data.metadata : {};
  const recipient = isObj(meta.recipient) ? meta.recipient : {};
  const recipientDetails = isObj(recipient.details) ? recipient.details : {};
  const integration = isObj(meta.integration) ? meta.integration : {};
  const session = isObj(meta.session) ? meta.session : {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</p>
          <p className="mt-1 text-sm font-bold text-green-600">{str(data.status)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Channel</p>
          <p className="mt-1 text-sm font-bold text-gray-900 capitalize">{str(data.channel)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Amount</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.amount, str(data.currency))}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Fees</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.fees)}</p>
        </div>
      </div>

      {!!session.id && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Session</span>
          </div>
          <p className="text-xs font-mono text-amber-900 break-all">{str(session.id)}</p>
          {!!session.provider && (
            <p className="text-xs text-amber-700 mt-1">Provider: {str(session.provider)}</p>
          )}
        </div>
      )}

      <div className="rounded-xl bg-green-50 border border-green-200 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-green-800">Gateway Response:</span>
          <span className="text-sm font-medium text-green-700">{str(data.gateway_response)}</span>
        </div>
      </div>

      {!!recipient.name && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-gray-400">Name</p>
              <p className="text-sm font-bold text-gray-900">{str(recipient.name)}</p>
            </div>
            {!!recipientDetails.bank_name && (
              <div>
                <p className="text-[10px] text-gray-400">Bank</p>
                <p className="text-sm font-medium text-gray-700">{str(recipientDetails.bank_name)}</p>
              </div>
            )}
            {!!recipientDetails.account_number && (
              <div>
                <p className="text-[10px] text-gray-400">Account Number</p>
                <p className="text-sm font-bold text-gray-900 font-mono">{str(recipientDetails.account_number)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!!integration.business_name && (
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          {!!integration.logo_path && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={str(integration.logo_path)} alt="" className="h-8 w-8 rounded-lg object-contain" />
          )}
          <div>
            <p className="text-xs text-gray-500">Integration</p>
            <p className="text-sm font-bold text-gray-900">{str(integration.business_name)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {!!data.created_at && (
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-[10px] text-gray-400">Created</p>
            <p className="text-xs font-medium text-gray-700">{fmtTimestamp(data.created_at)}</p>
          </div>
        )}
        {!!data.paid_at && (
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-[10px] text-gray-400">Paid At</p>
            <p className="text-xs font-medium text-gray-700">{fmtTimestamp(data.paid_at)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── VTU Transaction Details ───────────────────────────────────────────

function VtuTransactionDetails({ data }: { data: Record<string, any> }) {
  const rawMeta = data.metadata;
  let meta: Record<string, any> = {};
  if (typeof rawMeta === 'string') {
    try { meta = JSON.parse(rawMeta); } catch { meta = {}; }
  } else if (isObj(rawMeta)) {
    meta = rawMeta;
  }

  const offer = isObj(meta.offer) ? meta.offer : {};
  const commissionDetails = isObj(meta.commission_details) ? meta.commission_details : {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</p>
          <p className="mt-1 text-sm font-bold text-gray-900 capitalize">{str(data.status)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Amount</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.amount)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Unit Price</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.unit_price)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Commission</p>
          <p className="mt-1 text-sm font-bold text-green-600">{fmtAmount(data.commission)}</p>
        </div>
      </div>

      {!!data.product_name && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3">
          <p className="text-xs text-indigo-500 font-semibold">Product</p>
          <p className="text-sm font-bold text-indigo-900">{str(data.product_name)}</p>
        </div>
      )}

      {!!(data.phone || data.unique_element) && (
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500 font-semibold">Recipient</p>
          <p className="text-sm font-bold text-gray-900 font-mono">{str(data.phone || data.unique_element)}</p>
        </div>
      )}

      {!!commissionDetails.rate && (
        <div className="rounded-xl border border-gray-200 p-3">
          <p className="text-xs text-gray-500 font-semibold mb-2">Commission Details</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div><span className="text-gray-400">Rate:</span> <span className="font-bold">{str(commissionDetails.rate)}%</span></div>
            <div><span className="text-gray-400">Amount:</span> <span className="font-bold">{fmtAmount(commissionDetails.amount)}</span></div>
            <div><span className="text-gray-400">Type:</span> <span className="font-bold capitalize">{str(commissionDetails.rate_type)}</span></div>
          </div>
        </div>
      )}

      {offer.offer_applied === true && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3">
          <p className="text-xs font-bold text-green-700">Offer Applied</p>
          {!!offer.offer_code && <p className="text-sm text-green-600">Code: {str(offer.offer_code)}</p>}
          {offer.discount != null && Number(offer.discount) > 0 && (
            <p className="text-sm font-bold text-green-600">Discount: -{fmtAmount(offer.discount)}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Wallet Transaction Details ────────────────────────────────────────

function WalletTransactionDetails({ data }: { data: Record<string, any> }) {
  const meta = isObj(data.metadata) ? data.metadata : {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Type</p>
          <p className="mt-1 text-sm font-bold text-gray-900 capitalize">{str(data.type)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Amount</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.amount)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Balance Before</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.balance_before)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Balance After</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.balance_after)}</p>
        </div>
      </div>

      {!!data.description && (
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500 font-semibold">Description</p>
          <p className="text-sm text-gray-900 mt-0.5">{str(data.description)}</p>
        </div>
      )}

      {!!meta.sender_name && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Sender</span>
          </div>
          <p className="text-sm font-bold text-blue-900 mt-1">{str(meta.sender_name)}</p>
        </div>
      )}

      {!!meta.recipient_name && (
        <div className="rounded-xl bg-purple-50 border border-purple-200 p-3">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Recipient</span>
          </div>
          <p className="text-sm font-bold text-purple-900 mt-1">{str(meta.recipient_name)}</p>
        </div>
      )}
    </div>
  );
}

// ─── Airtime Conversion Details ────────────────────────────────────────

function AirtimeConversionDetails({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status</p>
          <p className="mt-1 text-sm font-bold text-gray-900 capitalize">{str(data.status)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Air Time</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{fmtAmount(data.airtime_amount)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Cash Credited</p>
          <p className="mt-1 text-sm font-bold text-green-600">{fmtAmount(data.cash_credited)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Rate</p>
          <p className="mt-1 text-sm font-bold text-gray-900">{str(data.conversion_rate)}</p>
        </div>
      </div>

      {!!data.provider && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-3">
          <p className="text-xs text-orange-500 font-semibold">Provider</p>
          <p className="text-sm font-bold text-orange-900 uppercase">{String(data.provider)}</p>
        </div>
      )}

      {!!data.settlement_method && (
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500 font-semibold">Settlement Method</p>
          <p className="text-sm font-bold text-gray-900 capitalize">{String(data.settlement_method).replace(/_/g, ' ')}</p>
        </div>
      )}
    </div>
  );
}

// ─── Generic Metadata Renderer ─────────────────────────────────────────

function GenericMetadata({ metadata }: { metadata: Record<string, any> }) {
  const entries = Object.entries(metadata).filter(([, v]) => v !== null && v !== undefined);

  if (entries.length === 0) return null;

  return (
    <div className="divide-y divide-gray-50">
      {entries.map(([key, value]) => {
        if (isObj(value)) {
          const subEntries = Object.entries(value).filter(([, v]) => v != null);
          if (subEntries.length === 0) return null;
          return (
            <div key={key} className="py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">{labelize(key)}</p>
              <div className="space-y-1">
                {subEntries.map(([sk, sv]) => (
                  <div key={sk} className="flex justify-between text-xs">
                    <span className="text-gray-400">{labelize(sk)}</span>
                    <span className="font-medium text-gray-700 text-right max-w-[60%] truncate">
                      {isObj(sv) ? JSON.stringify(sv) : str(sv)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={key} className="flex justify-between py-2 text-sm">
            <span className="text-gray-500">{labelize(key)}</span>
            <span className="font-medium text-gray-900 text-right max-w-[60%] truncate font-mono text-xs">
              {str(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

interface MetadataViewerProps {
  metadata?: Record<string, any>;
  details?: PolymorphicRecord;
}

export function MetadataViewer({ metadata, details }: MetadataViewerProps) {
  const detailType = details?.type || '';

  return (
    <div className="space-y-6">
      {/* ── Metadata ── */}
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-bold text-gray-900">Additional Information</h3>
          </div>
          <div className="px-6 py-4 space-y-4">
            {isObj(metadata.bank_details) && <BankDetailsCard data={metadata.bank_details} />}
            {isObj(metadata.subsidy) && <SubsidyCard data={metadata.subsidy} />}
            <GenericMetadata metadata={metadata} />
          </div>
        </div>
      )}

      {/* ── Details ── */}
      {details && details.data && Object.keys(details.data).length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-bold text-gray-900">
              {detailType === 'PaystackTransaction' ? 'Payment Gateway Record' :
               detailType === 'VtuTransaction' ? 'VTU Transaction Record' :
               detailType === 'WalletTransaction' ? 'Wallet Transaction Record' :
               detailType === 'AirtimeConversionTransaction' ? 'Airtime Conversion Record' :
               'Transaction Details'}
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">{detailType}</p>
          </div>
          <div className="px-6 py-4">
            {detailType === 'PaystackTransaction' && <PaystackTransferDetails data={details.data} />}
            {detailType === 'VtuTransaction' && <VtuTransactionDetails data={details.data} />}
            {detailType === 'WalletTransaction' && <WalletTransactionDetails data={details.data} />}
            {detailType === 'AirtimeConversionTransaction' && <AirtimeConversionDetails data={details.data} />}
            {!['PaystackTransaction', 'VtuTransaction', 'WalletTransaction', 'AirtimeConversionTransaction'].includes(detailType) && (
              <pre className="max-h-[300px] overflow-auto rounded-lg bg-gray-50 p-4 text-xs leading-6 text-gray-700">
                {JSON.stringify(details.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
