'use client';

interface CampaignDetailsProps {
  data: {
    campaign_name: string;
    campaign_description: string;
  };
  onUpdate: (updates: { campaign_name?: string; campaign_description?: string }) => void;
}

export default function CampaignDetails({ data, onUpdate }: CampaignDetailsProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Campaign Details</h2>

      <form className="space-y-6">
        <div>
          <label htmlFor="campaign-name" className="block text-sm font-semibold text-gray-700 mb-2">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            id="campaign-name"
            type="text"
            value={data.campaign_name}
            onChange={(e) => onUpdate({ campaign_name: e.target.value })}
            placeholder="e.g., May VTU Bonus Promotion"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707] focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Give your campaign a descriptive name for easy identification
          </p>
        </div>

        <div>
          <label
            htmlFor="campaign-description"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Campaign Description
          </label>
          <textarea
            id="campaign-description"
            value={data.campaign_description}
            onChange={(e) => onUpdate({ campaign_description: e.target.value })}
            placeholder="Add notes about this campaign..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#620707] focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Internal notes for team reference (not shown to users)
          </p>
        </div>
      </form>
    </div>
  );
}
