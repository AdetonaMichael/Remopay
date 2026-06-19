/**
 * Tier Upgrade Main Page
 * Complete tier upgrade workflow with draft saving and status tracking
 * 
 * Path: /dashboard/settings/tier-upgrade
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Spinner } from '@/components/shared/Spinner';
import { useTierUpgradeFlow } from '@/hooks/useTierUpgradeFlow';
import { useAuth } from '@/hooks/useAuth';
import { Tier0Form } from '@/components/dashboard/tier-upgrade/Tier0Form';
import { Tier1Form } from '@/components/dashboard/tier-upgrade/Tier1Form';
import { Tier2Form } from '@/components/dashboard/tier-upgrade/Tier2Form';
import { TierUpgradeStatusDisplay } from '@/components/dashboard/tier-upgrade/StatusDisplay';
import type { TierName, TierUpgradeFormData } from '@/types/tier-upgrade.types';

const TIERS = [
  {
    name: 'zero' as TierName,
    title: 'Tier 0 - Basic',
    description: 'Set up your basic profile to get started',
    features: ['Basic account access', 'Standard limits'],
    icon: <Sparkles size={24} />,
  },
  {
    name: 'one' as TierName,
    title: 'Tier 1 - Bronze',
    description: 'Enhanced verification with personal details',
    features: ['Verified account', 'Increased limits', 'BVN verification'],
    icon: <CheckCircle2 size={24} />,
  },
  {
    name: 'two' as TierName,
    title: 'Tier 2 - Silver',
    description: 'Maximum access with government ID verification',
    features: ['Full verification', 'Highest limits', 'Identity document verification'],
    icon: <CheckCircle2 size={24} />,
  },
];

export default function TierUpgradePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<TierName | null>(null);

  const tierFlow = useTierUpgradeFlow({
    tier: selectedTier || 'zero',
    onSuccess: (status) => {
      if (status === 'approved') {
        // Navigate to success page or dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    },
  });

  // Load application on tier select
  useEffect(() => {
    if (selectedTier) {
      tierFlow.loadApplication();
    }
  }, [selectedTier]);

  if (!user) {
    return null;
  }

  // Show tier selection if not selected
  if (!selectedTier) {
    return (
      <div className="space-y-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        `}</style>

        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Tier Upgrade</h1>
          <p className="text-gray-600">Enhance your account with our tier system</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className="rounded-2xl border border-gray-200 bg-white p-6 cursor-pointer hover:border-[#d71927] hover:shadow-lg transition"
              onClick={() => setSelectedTier(tier.name)}
            >
              <div className="text-[#d71927] mb-4">{tier.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{tier.description}</p>

              <ul className="space-y-2 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="w-full justify-between">
                Select <ChevronRight size={18} />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show loading state
  if (tierFlow.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading tier upgrade form...</p>
        </div>
      </div>
    );
  }

  // Show status if application exists
  if (tierFlow.status && tierFlow.status !== 'not_started') {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-2 pb-4">
          <Button variant="ghost" onClick={() => setSelectedTier(null)}>
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-2xl font-black text-gray-900">
            {TIERS.find((t) => t.name === selectedTier)?.title}
          </h1>
        </div>

        <TierUpgradeStatusDisplay
          application={tierFlow.application}
          status={tierFlow.status}
          isLoading={tierFlow.loading}
          onReset={() => {
            if (tierFlow.application?.status === 'rejected' || tierFlow.application?.status === 'failed') {
              tierFlow.resetForm();
            }
          }}
        />

        {tierFlow.isApproved && tierFlow.successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">Congratulations!</h3>
            <p className="text-green-800">{tierFlow.successMessage}</p>
            <p className="text-sm text-green-700 mt-2">You will be redirected to your dashboard...</p>
          </div>
        )}

        {(tierFlow.isRejected || tierFlow.isFailed) && (
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setSelectedTier(null)}
              className="flex-1"
            >
              Back to Tier Selection
            </Button>
            {(tierFlow.isRejected || tierFlow.canRetry) && (
              <Button
                onClick={() => tierFlow.resetForm()}
                className="flex-1"
              >
                Edit Application
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show form based on tier
  return (
    <div className="space-y-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex items-center gap-2 pb-4">
        <Button variant="ghost" onClick={() => setSelectedTier(null)}>
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-2xl font-black text-gray-900">
          {TIERS.find((t) => t.name === selectedTier)?.title}
        </h1>
      </div>

      {/* Save Status */}
      {tierFlow.isDirty && (
        <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unsaved changes</p>
            <p className="text-xs">Your progress will be saved automatically</p>
          </div>
        </div>
      )}

      {tierFlow.saving && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Spinner size="sm" />
          <p>Saving draft...</p>
        </div>
      )}

      {/* Form */}
      <Card className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        {selectedTier === 'zero' && (
          <Tier0Form
            initialData={tierFlow.formData}
            isSubmitting={tierFlow.submitting}
            error={tierFlow.error}
            onSubmit={(data) => tierFlow.submitApplication()}
            onSaveDraft={(data) => tierFlow.updateFormData(data)}
          />
        )}

        {selectedTier === 'one' && (
          <Tier1Form
            initialData={tierFlow.formData}
            isSubmitting={tierFlow.submitting}
            error={tierFlow.error}
            onSubmit={(data) => tierFlow.submitApplication()}
            onSaveDraft={(data) => tierFlow.updateFormData(data)}
          />
        )}

        {selectedTier === 'two' && (
          <Tier2Form
            initialData={tierFlow.formData}
            isSubmitting={tierFlow.submitting}
            error={tierFlow.error}
            onSubmit={(data) => tierFlow.submitApplication()}
            onSaveDraft={(data) => tierFlow.updateFormData(data)}
          />
        )}
      </Card>

      {/* Draft Indicator */}
      {tierFlow.isDraft && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            <strong>Draft Saved:</strong> Your progress has been automatically saved. You can close this page and return later to continue.
          </p>
        </div>
      )}
    </div>
  );
}
