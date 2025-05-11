// D:\socialadify\frontend\app\components\OverallStats.tsx
'use client';
import React from 'react';

// Helper to format values (currency, percentages, numbers)
const formatValue = (key: string, value: number | string | undefined | null): string => {
    if (value === null || typeof value === 'undefined') return 'N/A';

    if (typeof value === 'string' && isNaN(parseFloat(value))) {
        return value;
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return String(value); // Return original string if parsing failed

    const lowerKey = key.toLowerCase();

    // Order matters for more specific keys like 'cost_per_...'
    if (["amount_spent", "average_cpc", "average_cpm", "revenue", "cost_per_conversion", "cost_per_page_like", "cost_per_post_reaction", "spend", "arpu"].some(k => lowerKey.includes(k))) {
        return `$${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (["ctr", "roi_metric", "engagement_rate", "conversion_rate", "roi", "unique_ctr"].some(k => lowerKey.includes(k))) {
        return `${numValue.toFixed(2)}%`;
    }
    // For whole numbers that are not explicitly currency or percentage
    if (Number.isInteger(numValue) && !lowerKey.includes("rate") && !lowerKey.includes("cpc") && !lowerKey.includes("cpm") && !lowerKey.includes("roi")) {
        return numValue.toLocaleString();
    }
    // Default for other numbers (e.g., ratios that are not percentages)
    return numValue.toFixed(2);
};

// Define the order and labels for metrics
const METRIC_DISPLAY_CONFIG: { [key: string]: { label: string, order: number, tooltip?: string } } = {
    clicks: { label: "Clicks", order: 1, tooltip: "Total number of clicks." },
    impressions: { label: "Impressions", order: 2, tooltip: "Total times your ads were displayed." },
    reach: { label: "Reach", order: 3, tooltip: "Number of unique people who saw your ads." },
    amount_spent: { label: "Amount Spent", order: 4, tooltip: "Total amount spent." },
    average_cpc: { label: "Average CPC", order: 5, tooltip: "Average Cost Per Click." },
    average_cpm: { label: "Average CPM", order: 6, tooltip: "Average Cost Per 1,000 Impressions." },
    ctr: { label: "CTR", order: 7, tooltip: "Click-Through Rate (Clicks ÷ Impressions)." },
    
    page_likes: { label: "Page Likes", order: 8, tooltip: "New Page likes attributed to ads." },
    post_reactions: { label: "Post Reactions", order: 9, tooltip: "Reactions on posts attributed to ads." },
    cost_per_page_like: { label: "Cost / Page Like", order: 10, tooltip: "Average cost per Page like." },
    cost_per_post_reaction: { label: "Cost / Post Reaction", order: 11, tooltip: "Average cost per post reaction." },
    
    unique_link_clicks: { label: "Unique Link Clicks", order: 12, tooltip: "Unique people who clicked links." },
    unique_ctr: { label: "Unique CTR", order: 13, tooltip: "Unique Click-Through Rate." },
    
    total_conversions: { label: "Conversions", order: 14, tooltip: "Total number of conversions." }, // API might send 'conversions' or 'total_conversions'
    cost_per_conversion: { label: "Cost/Conversion", order: 15, tooltip: "Average cost per conversion." },
    total_revenue: { label: "Revenue", order: 16, tooltip: "Total revenue generated." }, // API might send 'revenue' or 'total_revenue'
    roi: { label: "ROI", order: 17, tooltip: "Return On Investment." }, // API might send 'roi' or 'roi_metric'
    
    // Fallbacks or alternative keys from API
    conversions: { label: "Conversions (Ad)", order: 18, tooltip: "Conversions from ad-level data." },
    revenue: { label: "Revenue (Ad)", order: 19, tooltip: "Revenue from ad-level data." },
    roi_metric: { label: "ROI (Ad Level)", order: 20, tooltip: "Return On Investment from ad-level data." },
    arpu: { label: "ARPU", order: 21, tooltip: "Average Revenue Per User/Conversion." },
    engagement_rate: { label: "Engagement Rate", order: 22, tooltip: "Rate of engagement with your ads." },
    count: { label: "Ad Count", order: 23, tooltip: "Number of ads in this set." },
};

interface OverallStatsProps {
  data: Record<string, number | string | undefined | null> | null;
  title?: string;
}

export default function OverallStats({ data, title = "Detailed Statistics" }: OverallStatsProps) {
    if (!data) {
        return (
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
                  {title}
                </h2>
                <div className="p-4 text-center text-gray-500">
                    No data available to display.
                </div>
            </section>
        );
    }

    const displayableMetrics = Object.entries(data)
        .filter(([key]) => METRIC_DISPLAY_CONFIG[key] && typeof data[key] !== 'undefined' && data[key] !== null)
        .map(([key, value]) => ({
            key,
            value,
            label: METRIC_DISPLAY_CONFIG[key]?.label || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), // Fallback label
            order: METRIC_DISPLAY_CONFIG[key]?.order || 999, // Fallback order
            tooltip: METRIC_DISPLAY_CONFIG[key]?.tooltip
        }))
        .sort((a, b) => a.order - b.order);

    if (displayableMetrics.length === 0) {
        return (
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                 <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
                   {title}
                 </h2>
                 <div className="p-4 text-center text-gray-500">
                    No statistics to display based on current configuration or available data.
                </div>
            </section>
        );
    }

    return (
        <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-5">
              {title}
            </h2>
            {/* This is the grid container */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                {displayableMetrics.map(({ key, value, label, tooltip }) => (
                    <div 
                        key={key} 
                        className="bg-slate-50 rounded-xl shadow-md p-4 border border-slate-200 flex flex-col justify-between min-h-[100px] hover:shadow-indigo-100 transition-all duration-200 ease-in-out transform hover:-translate-y-1"
                        title={tooltip}
                    >
                        <h3 className="text-xs sm:text-sm font-medium text-slate-600 capitalize mb-1 truncate">
                            {label}
                        </h3>
                        <p className="text-xl sm:text-2xl lg:text-2xl font-bold text-indigo-600 truncate">
                            {formatValue(key, value)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
