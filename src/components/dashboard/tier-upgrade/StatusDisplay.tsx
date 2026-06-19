/**
 * Tier Upgrade Status Display Component
 * Shows application status, rejection reasons, and action buttons
 */

'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  RefreshCw,
  Home,
} from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { TierUpgradeApplication, ApplicationStatus } from '@/types/tier-upgrade.types';

interface TierUpgradeStatusDisplayProps {
  application: TierUpgradeApplication | null;
  status: ApplicationStatus | 'not_started' | null;
  onRetry?: () => void;
  onReset?: () => void;
  isLoading?: boolean;
}

const StatusConfig: Record<ApplicationStatus | 'not_started', {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = {
  not_started: {
    icon: <Home className="text-gray-400" />,
    title: 'Not Started',
    description: 'Begin your tier upgrade process',
    color: 'bg-gray-50 border-gray-200',
  },
  draft: {
    icon: <Clock className="text-blue-500" />,
    title: 'Draft Saved',
    description: 'Your form has been saved. You can continue later.',
    color: 'bg-blue-50 border-blue-200',
  },
  submitted: {
    icon: <Clock className="text-amber-500" />,
    title: 'Submitted',
    description: 'Your application has been submitted for review',
    color: 'bg-amber-50 border-amber-200',
  },
  processing: {
    icon: <Clock className="text-amber-500" />,
    title: 'Processing',
    description: 'Your application is being processed',
    color: 'bg-amber-50 border-amber-200',
  },
  pending_review: {
    icon: <Clock className="text-amber-500" />,
    title: 'Pending Review',
    description: 'Awaiting manual review. This usually takes 24-48 hours.',
    color: 'bg-amber-50 border-amber-200',
  },
  approved: {
    icon: <CheckCircle2 className="text-green-500" />,
    title: 'Approved',
    description: 'Your tier upgrade has been approved!',
    color: 'bg-green-50 border-green-200',
  },
  rejected: {
    icon: <XCircle className="text-red-500" />,
    title: 'Rejected',
    description: 'Your application was rejected',
    color: 'bg-red-50 border-red-200',
  },
  failed: {
    icon: <AlertCircle className="text-orange-500" />,
    title: 'Failed',
    description: 'An error occurred during processing',
    color: 'bg-orange-50 border-orange-200',
  },
};

export const TierUpgradeStatusDisplay: React.FC<TierUpgradeStatusDisplayProps> = ({
  application,
  status,
  onRetry,
  onReset,
  isLoading,
}) => {
  if (!status || isLoading) {
    return null;
  }

  const config = StatusConfig[status];

  return (
    <div className={`rounded-lg border p-6 ${config.color}`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0">{config.icon}</div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{config.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{config.description}</p>

          {/* Rejection Reason */}
          {status === 'rejected' && application?.failure_reason && (
            <div className="mt-3 p-3 rounded bg-white/50 border border-red-100">
              <p className="text-sm text-red-800">
                <strong>Reason:</strong> {application.failure_reason}
              </p>
            </div>
          )}

          {/* Failure Reason */}
          {status === 'failed' && application?.failure_reason && (
            <div className="mt-3 p-3 rounded bg-white/50 border border-orange-100">
              <p className="text-sm text-orange-800">
                <strong>Error:</strong> {application.failure_reason}
              </p>
            </div>
          )}

          {/* Timestamps */}
          {application && (
            <div className="mt-3 space-y-1 text-xs text-gray-600">
              {application.submitted_at && (
                <p>Submitted: {new Date(application.submitted_at).toLocaleString()}</p>
              )}
              {application.approved_at && (
                <p>Approved: {new Date(application.approved_at).toLocaleString()}</p>
              )}
              {application.rejected_at && (
                <p>Rejected: {new Date(application.rejected_at).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Retry Count */}
          {status === 'failed' && application && (
            <p className="mt-2 text-xs text-gray-600">
              Retry attempts: {application.retry_count}/3
            </p>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            {(status === 'failed' && application?.can_retry) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetry}
                disabled={isLoading}
              >
                <RefreshCw size={16} />
                Retry
              </Button>
            )}

            {(status === 'rejected' || (status === 'failed' && !application?.can_retry)) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onReset}
                disabled={isLoading}
              >
                Edit & Resubmit
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
