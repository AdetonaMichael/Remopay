import React from 'react';
import { AlertCircle, Loader2, ShieldCheck, Tv } from 'lucide-react';
import { Button } from './Button';

export interface SmartcardVerificationState {
  status: 'idle' | 'verifying' | 'verified' | 'error';
  error?: string;
  customer?: {
    name?: string;
    number?: string;
  };
}

interface SmartcardVerificationProps {
  state: SmartcardVerificationState;
  smartcardNumber?: string;
  providerName?: string;
  onRetry?: () => void;
  showHints?: boolean;
}

export const SmartcardVerification: React.FC<SmartcardVerificationProps> = ({
  state,
  smartcardNumber,
  providerName,
  onRetry,
  showHints = true,
}) => {
  return (
    <div className="space-y-4">
      {/* Verification Status Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          {state.status === 'verifying' && (
            <>
              <Loader2 className="text-blue-600 flex-shrink-0 animate-spin mt-0.5" size={20} />
              <div>
                <p className="font-medium text-blue-900">Verifying Smartcard</p>
                <p className="text-xs text-blue-800 mt-1">
                  Validating your smartcard number with{' '}
                  {providerName || 'the provider'}...
                </p>
              </div>
            </>
          )}

          {state.status === 'verified' && (
            <>
              <ShieldCheck className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-green-900">Verified</p>
                <p className="text-sm text-green-800 mt-1">
                  {state.customer?.name || 'Your account has been verified'}
                </p>
              </div>
            </>
          )}

          {state.status === 'error' && (
            <>
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-red-900">Verification Failed</p>
                <p className="text-sm text-red-800 mt-1">{state.error}</p>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    variant="outline"
                    className="mt-3 text-sm"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </>
          )}

          {state.status === 'idle' && (
            <>
              <Tv className="text-gray-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-gray-900">Enter Smartcard Number</p>
                <p className="text-xs text-gray-700 mt-1">
                  Your smartcard will be verified automatically
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Help Hints */}
      {showHints && state.status === 'idle' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-medium text-amber-900 mb-2">Where to find your number:</p>
          <ul className="text-xs text-amber-800 space-y-1">
            <li>• <strong>DSTV:</strong> Look for "Decoder No." on your device</li>
            <li>• <strong>GoTV:</strong> Check your smartcard or receipts</li>
            <li>• <strong>Startimes:</strong> Find on your decoder device</li>
            <li>• <strong>ShowMax:</strong> Look on your account or payment method</li>
          </ul>
        </div>
      )}
    </div>
  );
};
