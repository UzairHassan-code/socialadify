// D:\socialadify\frontend\src\components\OverallStats.tsx
'use client';
import React from 'react';
// 1. Import the UnifiedCampaign interface from the dashboard page
import { UnifiedCampaign } from '@/app/dashboard/page';

// --- SVG Icon Components (can be simplified or removed if not used) ---
const IconClicks = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.698 9.931c.852.175 1.73.266 2.698.266 1.934 0 3.743-.39 5.368-1.097l-2.668-5.446M12 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565" /></svg>;
const IconImpressions = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconCTR = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.06.022L10.5 9.75l.256-1.304A.75.75 0 0111.53 8l2.308 4.22A.75.75 0 0113.27 13H8.25m0 0a2.25 2.25 0 00-2.25 2.25v2.25H15M8.25 7.5V6m0 1.5V4.5m0 3V1.5A2.25 2.25 0 0110.5 0h3A2.25 2.25 0 0115.75 2.25v1.5M8.25 7.5h-1.5M15 15H4.5a2.25 2.25 0 00-2.25 2.25v2.25A2.25 2.25 0 004.5 24h10.5A2.25 2.25 0 0017.25 21.75V19.5A2.25 2.25 0 0015 15z" /></svg>;
const IconSpend = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Helper to format values ---
const formatValue = (key: keyof UnifiedCampaign, value: number | string): string => {
    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);

    if (key === 'cost' || key === 'cpc') {
        return `Rs${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (key === 'ctr') {
        return `${numValue.toFixed(2)}%`;
    }
    return numValue.toLocaleString();
};

// --- 2. UPDATED METRIC_DISPLAY_CONFIG to match UnifiedCampaign fields ---
const METRIC_DISPLAY_CONFIG: { 
    [key in keyof UnifiedCampaign]?: { 
        label: string; 
        icon?: React.FC;
        highlight?: 'positive' | 'neutral' | 'cost';
    } 
} = {
    impressions: { label: "Impressions", icon: IconImpressions, highlight: 'neutral' },
    clicks: { label: "Clicks", icon: IconClicks, highlight: 'neutral' },
    ctr: { label: "CTR", icon: IconCTR, highlight: 'positive' },
    cost: { label: "Cost", icon: IconSpend, highlight: 'cost' },
    cpc: { label: "Avg. CPC", icon: IconSpend, highlight: 'cost' },
};

// The keys we want to display from the UnifiedCampaign object, in order.
const metricsToShow: (keyof UnifiedCampaign)[] = ['impressions', 'clicks', 'ctr', 'cost', 'cpc'];

// --- 3. UPDATED Component Props ---
interface OverallStatsProps {
    data: UnifiedCampaign | null;
    title?: string;
    isLoading?: boolean;
}

const MetricSkeletonCard = () => (
    <div className="bg-slate-50 rounded-xl shadow-md p-4 border border-slate-200 min-h-[110px] animate-pulse">
        <div className="h-3.5 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-7 bg-slate-300 rounded w-1/2"></div>
    </div>
);

export default function OverallStats({ data, title = "Detailed Statistics", isLoading = false }: OverallStatsProps) {
    if (isLoading) {
        return (
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">{title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                    {Array.from({ length: 5 }).map((_, index) => <MetricSkeletonCard key={`skeleton-${index}`} />)}
                </div>
            </section>
        );
    }

    if (!data) {
        return (
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
                <div className="p-4 text-center text-gray-500">Select a campaign to view its detailed statistics.</div>
            </section>
        );
    }

    // --- Styling helper functions ---
    const getHighlightClasses = (highlightType?: 'positive' | 'neutral' | 'cost') => {
        switch (highlightType) {
            case 'positive': return 'bg-green-50 border-green-200 hover:shadow-green-100';
            case 'cost': return 'bg-red-50 border-red-200 hover:shadow-red-100';
            default: return 'bg-slate-50 border-slate-200 hover:shadow-indigo-100';
        }
    };
    const getValueTextClasses = (highlightType?: 'positive' | 'neutral' | 'cost') => {
        switch (highlightType) {
            case 'positive': return 'text-green-700';
            case 'cost': return 'text-red-700';
            default: return 'text-indigo-600';
        }
    }

    return (
        <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                {metricsToShow.map((key) => {
                    const config = METRIC_DISPLAY_CONFIG[key];
                    if (!config) return null;
                    const value = data[key];
                    const Icon = config.icon;
                    return (
                        <div
                            key={key}
                            className={`rounded-xl shadow-md p-3 sm:p-4 border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] transition-all duration-200 ease-in-out transform hover:-translate-y-1 ${getHighlightClasses(config.highlight)}`}
                        >
                            <div className="flex items-center text-xs sm:text-sm font-medium text-slate-700 capitalize mb-1.5 truncate">
                                {Icon && <Icon />}
                                {config.label}
                            </div>
                            <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${getValueTextClasses(config.highlight)}`}>
                                {formatValue(key, value)}
                            </p>
                        </div>
                    )
                })}
            </div>
        </section>
    );
}
