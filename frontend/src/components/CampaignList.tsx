// D:\socialadify\frontend\src\components\CampaignList.tsx
'use client';

import React from 'react';
import { UnifiedCampaign } from '@/app/dashboard/page';

// --- MODIFIED: Component Props updated to handle comparison mode ---
interface CampaignListProps {
    campaigns: UnifiedCampaign[];
    onCampaignSelect: (campaignId: string) => void;
    isLoading: boolean;
    error: string | null;
    // Props for single-select mode
    selectedCampaignId: string | null;
    // Props for multi-select (comparison) mode
    isComparing: boolean;
    comparisonIds: string[];
}

// --- Platform Icon Component (Unchanged) ---
const GoogleLogoIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1Z" />
    </svg>
);

const CampaignList: React.FC<CampaignListProps> = ({
    campaigns,
    onCampaignSelect,
    isLoading,
    error,
    selectedCampaignId,
    isComparing,
    comparisonIds
}) => {
    // --- Loading and Error states (Unchanged) ---
    if (isLoading) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md h-full">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
                <ul className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="h-16 bg-gray-100 rounded-md animate-pulse"></li>
                    ))}
                </ul>
            </div>
        );
    }
    if (error) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md h-full">
                 <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Campaigns</h3>
                 <div className="p-4 text-red-600 bg-red-50 rounded-md border border-red-200">{error}</div>
            </div>
        );
    }
    if (!campaigns || campaigns.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-md h-full">
                <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Campaigns</h3>
                <div className="p-4 text-center text-gray-500">No campaigns found.</div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md h-full overflow-y-auto">
            <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">
                {isComparing ? 'Select 2 to Compare' : 'Campaigns'}
            </h3>
            <ul className="space-y-2">
                {campaigns.map((campaign) => {
                    // --- NEW: Logic to determine the selection state and style ---
                    const isSelected = isComparing 
                        ? comparisonIds.includes(campaign.id)
                        : selectedCampaignId === campaign.id;

                    const buttonClasses = `w-full text-left px-3 py-2 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${isSelected
                            ? (isComparing ? 'bg-green-600 text-white shadow-sm ring-green-500' : 'bg-indigo-600 text-white shadow-sm ring-indigo-500')
                            : 'bg-gray-50 hover:bg-indigo-100 text-gray-700'
                        }`;

                    return (
                        <li key={campaign.id}>
                            <button onClick={() => onCampaignSelect(campaign.id)} className={buttonClasses}>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium truncate" title={campaign.name}>
                                        {campaign.name}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}>
                                        {campaign.clicks.toLocaleString()} Clicks
                                    </span>
                                </div>
                                <div className={`flex items-center text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                    <GoogleLogoIcon className="w-3.5 h-3.5 mr-1.5" />
                                    Status: {campaign.status}
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default CampaignList;

