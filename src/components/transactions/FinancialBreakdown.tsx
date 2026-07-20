'use client';

import { formatCurrency } from '@/utils/format.utils';
import type { TransactionFinancial } from '@/types/transaction-detail.types';

interface FinancialBreakdownProps {
  financial: TransactionFinancial;
}

function Row({ label, value, bold = false, negative = false }: { label: string; value: string; bold?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'font-medium text-gray-700'} ${negative ? 'text-red-600' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-100" />;
}

export function FinancialBreakdown({ financial }: FinancialBreakdownProps) {
  const isVtu = financial.unit_price !== undefined;
  const isAirtimeConversion = financial.gross_amount !== undefined;
  const isPaystack = financial.fees !== undefined && !isVtu && !isAirtimeConversion;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="text-base font-bold text-gray-900">Payment Details</h3>
      </div>
      <div className="px-6 py-3 divide-y divide-gray-50">
        {/* Core Amount */}
        <Row label="Amount" value={formatCurrency(financial.amount)} bold />

        {/* ── VTU / Airtime Purchase Fields ── */}
        {isVtu && (
          <>
            <Divider />
            {financial.unit_price !== undefined && (
              <Row label="Unit Price" value={formatCurrency(financial.unit_price)} />
            )}
            {financial.quantity !== undefined && (
              <Row label="Quantity" value={String(financial.quantity)} />
            )}
            {(financial.commission ?? 0) > 0 && (
              <Row label="Commission" value={formatCurrency(financial.commission!)} />
            )}
            {(financial.discount ?? 0) > 0 && (
              <Row label="Discount" value={`-${formatCurrency(financial.discount!)}`} negative />
            )}
            {(financial.convenience_fee ?? 0) > 0 && (
              <Row label="Convenience Fee" value={formatCurrency(financial.convenience_fee!)} />
            )}
          </>
        )}

        {/* ── Airtime Conversion Fields ── */}
        {isAirtimeConversion && (
          <>
            <Divider />
            <Row label="Gross Amount" value={formatCurrency(financial.gross_amount!)} />
            <Row
              label={`Service Fee (${financial.service_fee_pct ?? 0}%)`}
              value={`-${formatCurrency(financial.service_fee ?? 0)}`}
              negative
            />
            <Row label="Net Amount" value={formatCurrency(financial.net_amount!)} bold />
            <Row label="Cash Credited" value={formatCurrency(financial.cash_credited!)} bold />
            {financial.conversion_rate && (
              <Row label="Rate" value={`₦${Number(financial.conversion_rate).toFixed(2)}/unit`} />
            )}
            {financial.settlement_method && (
              <Row label="Settlement Method" value={financial.settlement_method.replace(/_/g, ' ')} />
            )}
          </>
        )}

        {/* ── Paystack Fields ── */}
        {isPaystack && (
          <>
            <Divider />
            <Row label="Gateway Fee" value={`-${formatCurrency(financial.fees!)}`} negative />
            <Row label="Currency" value={financial.currency ?? 'NGN'} />
          </>
        )}

        {/* Currency display for non-paystack */}
        {!isPaystack && financial.currency && (
          <>
            <Divider />
            <Row label="Currency" value={financial.currency} />
          </>
        )}
      </div>
    </div>
  );
}
