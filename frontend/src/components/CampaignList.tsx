// D:\socialadify\frontend\app\components\CampaignList.tsx
'use client';

import React from 'react';

export interface CampaignSummary {
  id: string; // e.g., "winter-sale-campaign"
  name: string; // e.g., "Winter Sale Campaign"
  metric_value: number; // e.g., total clicks for the campaign
  ad_count: number;
}

interface CampaignListProps {
  campaigns: CampaignSummary[];
  selectedCampaignId: string | null;
  onCampaignSelect: (campaignId: string) => void;
  isLoading: boolean;
  error: string | null;
}

const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  selectedCampaignId,
  onCampaignSelect,
  isLoading,
  error
}) => {
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500 animate-pulse">Loading campaigns...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600 bg-red-100 rounded-md">Error: {error}</div>;
  }

  if (!campaigns || campaigns.length === 0) {
    return <div className="p-4 text-center text-gray-500">No campaigns found.</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-full overflow-y-auto">
      <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">
        Campaigns
      </h3>
      <ul className="space-y-2">
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <button
              onClick={() => onCampaignSelect(campaign.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400
                ${selectedCampaignId === campaign.id
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-gray-50 hover:bg-indigo-100 text-gray-700'
                }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate" title={campaign.name}>
                  {campaign.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full
                  ${selectedCampaignId === campaign.id
                    ? 'bg-indigo-400 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {campaign.metric_value.toLocaleString()} {/* Displaying the metric_value (e.g., clicks) */}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {selectedCampaignId === campaign.id ? `${campaign.ad_count} ads` : `${campaign.ad_count} ads`}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CampaignList;
