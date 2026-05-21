'use client';

import { TargetCriteria } from '@/types/promotional-email.types';

interface AudienceSelectorProps {
  criteria: TargetCriteria;
  targetUserCount: number;
  onUpdate: (criteria: TargetCriteria) => void;
}

const AUDIENCE_OPTIONS = [
  {
    id: 'all_users',
    title: 'All Users',
    description: 'Send to all active users',
    icon: '👥',
  },
  {
    id: 'tier_level',
    title: 'By Loyalty Tier',
    description: 'Users in a specific loyalty tier',
    icon: '⭐',
    subfield: 'tier_id',
  },
  {
    id: 'vtu_users',
    title: 'VTU Users',
    description: 'Users who have made VTU purchases',
    icon: '📱',
  },
  {
    id: 'first_time_users',
    title: 'First-Time Users',
    description: 'Recent sign-ups within N days',
    icon: '🆕',
    subfield: 'days',
  },
  {
    id: 'inactive_users',
    title: 'Inactive Users',
    description: 'No activity for N days',
    icon: '😴',
    subfield: 'days',
  },
  {
    id: 'high_value_users',
    title: 'High-Value Users',
    description: 'Users with minimum transaction count',
    icon: '💎',
    subfield: 'min_transactions',
  },
];

export default function AudienceSelector({
  criteria,
  targetUserCount,
  onUpdate,
}: AudienceSelectorProps) {
  const handleUpdate = (updates: Partial<TargetCriteria>) => {
    onUpdate({
      ...criteria,
      ...updates,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Select Target Audience</h2>

      <div className="space-y-4 mb-8">
        {AUDIENCE_OPTIONS.map((option) => (
          <div key={option.id}>
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:border-[#620707]" 
              style={{
                borderColor: criteria.type === option.id ? '#620707' : '#e5e7eb',
                backgroundColor: criteria.type === option.id ? '#faf7f7' : 'white',
              }}>
              <input
                type="radio"
                name="audience-type"
                value={option.id}
                checked={criteria.type === option.id}
                onChange={() => handleUpdate({ type: option.id as any })}
                className="w-4 h-4 accent-[#620707]"
              />
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{option.title}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </div>
            </label>

            {/* Subfields */}
            {criteria.type === option.id && option.subfield && (
              <div className="mt-3 ml-12 p-4 bg-gray-50 rounded-lg">
                {option.subfield === 'tier_id' && (
                  <select
                    value={criteria.tier_id || ''}
                    onChange={(e) =>
                      handleUpdate({ tier_id: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707]"
                  >
                    <option value="">Select Tier...</option>
                    <option value="1">Bronze</option>
                    <option value="2">Silver</option>
                    <option value="3">Gold</option>
                    <option value="4">Platinum</option>
                  </select>
                )}

                {option.subfield === 'days' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days: <span className="text-gray-500">{criteria.days || 7} days</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={criteria.days || 7}
                      onChange={(e) => handleUpdate({ days: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707]"
                    />
                  </div>
                )}

                {option.subfield === 'min_transactions' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Transactions: <span className="text-gray-500">{criteria.min_transactions || 10}</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={criteria.min_transactions || 10}
                      onChange={(e) => handleUpdate({ min_transactions: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {targetUserCount > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            <span className="font-bold">📊 Audience Size:</span> This campaign will reach{' '}
            <span className="font-bold text-lg">{targetUserCount.toLocaleString()}</span> users
          </p>
        </div>
      )}
    </div>
  );
}
