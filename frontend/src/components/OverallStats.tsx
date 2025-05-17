// D:\socialadify\frontend\src\components\OverallStats.tsx
'use client';
import React from 'react';

// --- SVG Icon Components (remain the same) ---
const IconClicks = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.698 9.931c.852.175 1.73.266 2.698.266 1.934 0 3.743-.39 5.368-1.097l-2.668-5.446M12 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565" /></svg>;
const IconImpressions = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconCTR = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.06.022L10.5 9.75l.256-1.304A.75.75 0 0111.53 8l2.308 4.22A.75.75 0 0113.27 13H8.25m0 0a2.25 2.25 0 00-2.25 2.25v2.25H15M8.25 7.5V6m0 1.5V4.5m0 3V1.5A2.25 2.25 0 0110.5 0h3A2.25 2.25 0 0115.75 2.25v1.5M8.25 7.5h-1.5M15 15H4.5a2.25 2.25 0 00-2.25 2.25v2.25A2.25 2.25 0 004.5 24h10.5A2.25 2.25 0 0017.25 21.75V19.5A2.25 2.25 0 0015 15z" /></svg>;
const IconReach = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const IconSpend = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconConversions = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 4.875 4.875 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 4.875 4.875 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>;
const IconRevenue = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const IconROI = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 012.25 4.5h.75m0 0H21m-12 6h9" /></svg>;
const IconTag = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>;
// --- End SVG Icon Components ---

const formatValue = (key: string, value: number | string | undefined | null): string => {
    if (value === null || typeof value === 'undefined') return 'N/A';
    if (typeof value === 'string' && isNaN(parseFloat(value))) return value;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return String(value); 

    const lowerKey = key.toLowerCase();
    if (["amount_spent", "average_cpc", "average_cpm", "revenue", "cost_per_conversion", "cost_per_page_like", "cost_per_post_reaction", "spend", "arpu"].some(k => lowerKey.includes(k))) {
        return `$${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (["ctr", "roi_metric", "engagement_rate", "conversion_rate", "roi", "unique_ctr"].some(k => lowerKey.includes(k))) {
        return `${numValue.toFixed(2)}%`;
    }
    if (Number.isInteger(numValue) && !lowerKey.includes("rate") && !lowerKey.includes("cpc") && !lowerKey.includes("cpm")) {
        return numValue.toLocaleString();
    }
    return numValue.toFixed(2);
};

const METRIC_DISPLAY_CONFIG: { 
    [key: string]: { 
        label: string, 
        order: number, 
        tooltip?: string, 
        icon?: React.FC,
        highlight?: 'positive' | 'neutral' | 'cost' | 'info'
    } 
} = {
  impressions: { label: "Impressions", order: 100, tooltip: "Total times your ads were displayed.", icon: IconImpressions, highlight: 'neutral' },
  reach: { label: "Reach", order: 110, tooltip: "Number of unique people who saw your ads.", icon: IconReach, highlight: 'neutral' },
  clicks: { label: "Clicks", order: 120, tooltip: "Total number of clicks.", icon: IconClicks, highlight: 'neutral' },
  ctr: { label: "CTR", order: 130, tooltip: "Click-Through Rate (Clicks ÷ Impressions).", icon: IconCTR, highlight: 'neutral' },
  unique_link_clicks: { label: "Unique Link Clicks", order: 140, tooltip: "Unique people who clicked links.", icon: IconClicks, highlight: 'neutral' },
  unique_ctr: { label: "Unique CTR", order: 150, tooltip: "Unique Click-Through Rate.", icon: IconCTR, highlight: 'neutral' },
  amount_spent: { label: "Amount Spent", order: 200, tooltip: "Total amount spent.", icon: IconSpend, highlight: 'cost' },
  average_cpc: { label: "Average CPC", order: 210, tooltip: "Average Cost Per Click.", icon: IconSpend, highlight: 'cost' },
  average_cpm: { label: "Average CPM", order: 220, tooltip: "Average Cost Per 1,000 Impressions.", icon: IconSpend, highlight: 'cost' },
  total_conversions: { label: "Total Conversions", order: 300, tooltip: "Total number of conversions.", icon: IconConversions, highlight: 'positive' },
  conversions: { label: "Conversions", order: 301, tooltip: "Conversions (often ad-level).", icon: IconConversions, highlight: 'positive' },
  cost_per_conversion: { label: "Cost/Conversion", order: 310, tooltip: "Average cost per conversion.", icon: IconSpend, highlight: 'cost' },
  total_revenue: { label: "Total Revenue", order: 320, tooltip: "Total revenue generated.", icon: IconRevenue, highlight: 'positive' },
  revenue: { label: "Revenue", order: 321, tooltip: "Revenue (often ad-level).", icon: IconRevenue, highlight: 'positive' },
  roi: { label: "ROI", order: 330, tooltip: "Return On Investment.", icon: IconROI, highlight: 'positive' },
  roi_metric: { label: "ROI (Metric)", order: 331, tooltip: "Return On Investment (often ad-level).", icon: IconROI, highlight: 'positive' },
  arpu: { label: "ARPU", order: 340, tooltip: "Average Revenue Per User/Conversion.", icon: IconRevenue, highlight: 'neutral' },
  page_likes: { label: "Page Likes", order: 400, tooltip: "New Page likes attributed to ads.", icon: IconClicks, highlight: 'neutral' },
  post_reactions: { label: "Post Reactions", order: 410, tooltip: "Reactions on posts attributed to ads.", icon: IconClicks, highlight: 'neutral' },
  cost_per_page_like: { label: "Cost / Page Like", order: 420, tooltip: "Average cost per Page like.", icon: IconSpend, highlight: 'cost' },
  cost_per_post_reaction: { label: "Cost / Post Reaction", order: 430, tooltip: "Average cost per post reaction.", icon: IconSpend, highlight: 'cost' },
  engagement_rate: { label: "Engagement Rate", order: 440, tooltip: "Rate of engagement with your ads.", icon: IconCTR, highlight: 'neutral' },
  ad_type: { label: "Ad Type", order: 500, tooltip: "Type of the ad (e.g., video, image).", icon: IconTag, highlight: 'info' },
  count: { label: "Ad Count", order: 510, tooltip: "Number of ads in this set.", icon: IconReach, highlight: 'info' },
};

interface OverallStatsProps {
  data: Record<string, number | string | undefined | null> | null;
  title?: string;
  isLoading?: boolean;
}

const MetricSkeletonCard = () => (
    <div className="bg-slate-50 rounded-xl shadow-md p-4 border border-slate-200 min-h-[110px] animate-pulse">
        <div className="h-3.5 bg-slate-200 rounded w-3/4 mb-3"></div> {/* Skeleton for label + icon */}
        <div className="h-7 bg-slate-300 rounded w-1/2"></div>   {/* Skeleton for value */}
    </div>
);

export default function OverallStats({ data, title = "Detailed Statistics", isLoading = false }: OverallStatsProps) {
    if (isLoading) {
        return (
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
                    {title}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <MetricSkeletonCard key={`skeleton-${index}`} />
                    ))}
                </div>
            </section>
        );
    }

    if (!data) { 
        return (
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
                <div className="p-4 text-center text-gray-500">No data available to display.</div>
            </section>
        );
    }

    const displayableMetrics = Object.entries(data)
        .filter(([key]) => METRIC_DISPLAY_CONFIG[key] && typeof data[key] !== 'undefined' && data[key] !== null)
        .map(([key, value]) => ({
            key, value,
            label: METRIC_DISPLAY_CONFIG[key]?.label || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            order: METRIC_DISPLAY_CONFIG[key]?.order || 999,
            tooltip: METRIC_DISPLAY_CONFIG[key]?.tooltip,
            Icon: METRIC_DISPLAY_CONFIG[key]?.icon,
            highlight: METRIC_DISPLAY_CONFIG[key]?.highlight
        }))
        .sort((a, b) => a.order - b.order);

    if (displayableMetrics.length === 0) { 
        return (
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">{title}</h2>
                <div className="p-4 text-center text-gray-500">No statistics to display.</div>
            </section>
        );
    }

    const getHighlightClasses = (highlightType?: 'positive' | 'neutral' | 'cost' | 'info') => {
        switch (highlightType) {
            case 'positive': return 'bg-green-50 border-green-200 hover:shadow-green-100';
            case 'cost': return 'bg-red-50 border-red-200 hover:shadow-red-100';
            case 'info': return 'bg-blue-50 border-blue-200 hover:shadow-blue-100';
            default: return 'bg-slate-50 border-slate-200 hover:shadow-indigo-100';
        }
    };
    
    const getValueTextClasses = (highlightType?: 'positive' | 'neutral' | 'cost' | 'info') => {
        switch (highlightType) {
            case 'positive': return 'text-green-700'; // Darker green for better contrast
            case 'cost': return 'text-red-700';     // Darker red
            case 'info': return 'text-blue-700';     // Darker blue
            default: return 'text-indigo-600';
        }
    }

    return (
        <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6">
                {title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {displayableMetrics.map(({ key, value, label, tooltip, Icon, highlight }) => (
                    <div 
                        key={key} 
                        className={`rounded-xl shadow-md p-3 sm:p-4 border flex flex-col justify-between min-h-[100px] sm:min-h-[110px] transition-all duration-200 ease-in-out transform hover:-translate-y-1 ${getHighlightClasses(highlight)}`}
                        title={tooltip}
                    >
                        <div className="flex items-center text-xs sm:text-sm font-medium text-slate-700 capitalize mb-1.5 truncate">
                            {Icon && <Icon />}
                            {label}
                        </div>
                        {/* --- MODIFIED FONT SIZE HERE --- */}
                        <p className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${getValueTextClasses(highlight)} ${highlight === 'cost' || highlight === 'positive' ? 'font-bold' : 'font-semibold'}`}>
                            {formatValue(key, value)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

