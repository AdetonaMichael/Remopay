'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { Calculator, Info } from 'lucide-react';
import { Card } from '@/components/shared/Card';
import type { FeeCalculationType, UpdateFeeConfigRequest } from '@/types/card-fee.types';

interface FeePreviewProps {
  feeType: string;
  formValues: UpdateFeeConfigRequest;
}

interface LocalFeeCalc {
  provider_fee: number;
  our_fee: number;
  total_fee: number;
  provider_desc: string;
  our_desc: string;
}

export function FeePreview({ feeType, formValues }: FeePreviewProps) {
  const calcType = formValues.fee_calculation_type || 'fixed';

  const calculateFee = (amount: number, isProvider: boolean): LocalFeeCalc => {
    const fixed = isProvider
      ? formValues.provider_fixed_amount || 0
      : formValues.fixed_amount || 0;
    const percentage = isProvider
      ? formValues.provider_percentage_rate || 0
      : formValues.percentage_rate || 0;
    const threshold = formValues.threshold_amount || 0;
    const belowFixed = isProvider
      ? 0
      : formValues.below_threshold_fixed || 0;
    const belowPct = isProvider
      ? 0
      : formValues.below_threshold_percentage || 0;
    const aboveFixed = isProvider
      ? 0
      : formValues.above_threshold_fixed || 0;
    const abovePct = isProvider
      ? 0
      : formValues.above_threshold_percentage || 0;

    let pFee = 0;
    let pDesc = 'No fee';
    let oFee = 0;
    let oDesc = 'No fee';

    const calc = (type: FeeCalculationType, isProv: boolean) => {
      const f = isProv ? formValues.provider_fixed_amount || 0 : formValues.fixed_amount || 0;
      const p = isProv ? formValues.provider_percentage_rate || 0 : formValues.percentage_rate || 0;
      const t = formValues.threshold_amount || 0;
      const bF = isProv ? 0 : formValues.below_threshold_fixed || 0;
      const bP = isProv ? 0 : formValues.below_threshold_percentage || 0;
      const aF = isProv ? 0 : formValues.above_threshold_fixed || 0;
      const aP = isProv ? 0 : formValues.above_threshold_percentage || 0;

      switch (type) {
        case 'fixed': {
          const fee = f;
          return { fee, desc: `Fixed $${fee.toFixed(4)}` };
        }
        case 'percentage': {
          const fee = amount * (p / 100);
          return { fee, desc: `${p}% of $${amount.toFixed(2)}` };
        }
        case 'hybrid': {
          const fee = f + amount * (p / 100);
          const parts: string[] = [];
          if (f > 0) parts.push(`$${f.toFixed(2)}`);
          if (p > 0) parts.push(`${p}%`);
          return { fee, desc: parts.length > 0 ? parts.join(' + ') : 'No fee' };
        }
        case 'threshold': {
          if (amount < t) {
            const fee = bF + amount * (bP / 100);
            const parts: string[] = [];
            if (bF > 0) parts.push(`$${bF.toFixed(2)}`);
            if (bP > 0) parts.push(`${bP}%`);
            return { fee, desc: `Below $${t.toFixed(2)}: ${parts.length > 0 ? parts.join(' + ') : 'No fee'}` };
          } else {
            const fee = aF + amount * (aP / 100);
            const parts: string[] = [];
            if (aF > 0) parts.push(`$${aF.toFixed(2)}`);
            if (aP > 0) parts.push(`${aP}%`);
            return { fee, desc: `≥ $${t.toFixed(2)}: ${parts.length > 0 ? parts.join(' + ') : 'No fee'}` };
          }
        }
        default:
          return { fee: 0, desc: 'No fee' };
      }
    };

    const providerResult = calc(calcType, true);
    pFee = providerResult.fee;
    pDesc = providerResult.desc;

    const ourResult = calc(calcType, false);
    oFee = ourResult.fee;
    oDesc = ourResult.desc;

    // For fixed/no-amount fee types (issuance, withdrawal, chargeback, etc.),
    // the fee is charged regardless of transaction amount
    const isFlatFeeType = ['issuance', 'withdrawal', 'chargeback', 'decline_unsettled', 'maintenance_monthly'].includes(feeType);
    
    if (isFlatFeeType && calcType === 'fixed') {
      pFee = formValues.provider_fixed_amount || 0;
      pDesc = `Fixed $${(formValues.provider_fixed_amount || 0).toFixed(4)}`;
      oFee = formValues.fixed_amount || 0;
      oDesc = `Fixed $${(formValues.fixed_amount || 0).toFixed(4)}`;
    }

    return {
      provider_fee: pFee,
      our_fee: oFee,
      total_fee: pFee + oFee,
      provider_desc: pDesc,
      our_desc: oDesc,
    };
  };

  const flatFeeCalc = useMemo(() => {
    return calculateFee(0, false);
  }, [formValues, feeType, calcType]);

  // For flat fee types, show the fixed amounts directly
  const isFlatFeeType = ['issuance', 'withdrawal', 'chargeback', 'decline_unsettled', 'maintenance_monthly'].includes(feeType);
  const usesAmount = ['funding', 'transaction', 'cross_border', 'fx_markup'].includes(feeType);
  const needsAmount = calcType !== 'fixed' || !isFlatFeeType;

  return (
    <Card className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Preview Fee Calculation</h3>
      
      {isFlatFeeType && calcType === 'fixed' ? (
        /* Flat fee preview - no transaction amount needed */
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-sm font-semibold text-gray-700">Total Fee</span>
            <span className="text-2xl font-black text-[#d71927]">
              ${flatFeeCalc.total_fee.toFixed(2)}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Provider Fee</p>
                <p className="text-xs text-gray-500">{flatFeeCalc.provider_desc}</p>
              </div>
              <span className="text-sm font-bold text-gray-700">
                ${flatFeeCalc.provider_fee.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Our Fee</p>
                <p className="text-xs text-gray-500">{flatFeeCalc.our_desc}</p>
              </div>
              <span className="text-sm font-bold text-[#d71927]">
                ${flatFeeCalc.our_fee.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Amount-based fee types - show calculator */
        <p className="text-sm text-gray-500">
          This fee type uses {calcType === 'percentage' ? 'a percentage' : calcType === 'hybrid' ? 'a hybrid' : calcType === 'threshold' ? 'a threshold' : 'a fixed'} calculation.
          {usesAmount && ' Enter a transaction amount in the field above and click Calculate to preview (uses saved config).'}
          {!usesAmount && ' The fee is applied per event at the configured rate.'}
        </p>
      )}

      {/* Fee type summary */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5">
        <Info size={14} className="flex-shrink-0 text-amber-600" />
        <p className="text-xs text-amber-800">
          Preview shows the fee based on the form values above. 
          Click <strong>Save Changes</strong> to persist.
        </p>
      </div>
    </Card>
  );
}
