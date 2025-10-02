// D:\socialadify\frontend\src/components/CampaignComparisonChart.tsx
'use client';

import React from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ChartOptions, ChartData, PointElement, LineElement,
    RadialLinearScale, Filler
} from 'chart.js';
// --- MODIFIED: Import the new data structure from the parent page ---
import { ComparisonData } from '@/app/dashboard/page';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    RadialLinearScale, Title, Tooltip, Legend, Filler
);

interface CampaignComparisonChartProps {
    data: ComparisonData | null;
}

// --- MODIFIED: Metrics to compare now use the keys from the 'Statistics' object ---
// We can now compare a much richer set of 8 metrics.
const metricsToCompare = [
    { key: 'clicks', label: 'Clicks' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'ctr', label: 'CTR (%)' },
    { key: 'conversions', label: 'Conversions' },
    { key: 'cost', label: 'Cost (Rs)' },
    { key: 'avg_cpc', label: 'Avg. CPC (Rs)' },
    { key: 'cpm', label: 'CPM (Rs)' },
    { key: 'cpa', label: 'CPA (Rs)' },
];

const CampaignComparisonChart: React.FC<CampaignComparisonChartProps> = ({ data }) => {
    // This initial state message is now handled by the parent component's logic.
    // This component will only render when valid data is passed to it.
    if (!data || !data.campaign1 || !data.campaign2) {
        // This is a fallback and shouldn't typically be seen if the parent logic is correct.
        return (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg h-[400px] flex items-center justify-center">
                <p>Comparison data is unavailable.</p>
            </div>
        );
    }

    const { campaign1, campaign2, campaign1Name, campaign2Name } = data;

    const chartLabels = metricsToCompare.map(metric => metric.label);
    
    // --- MODIFIED: Data extraction is simpler, directly accessing properties from the Statistics object ---
    const campaign1DataValues = metricsToCompare.map(metric => campaign1[metric.key as keyof typeof campaign1]);
    const campaign2DataValues = metricsToCompare.map(metric => campaign2[metric.key as keyof typeof campaign2]);

    // --- Chart Configurations (styling is the same, but data source is updated) ---
    const barChartData: ChartData<'bar'> = {
        labels: chartLabels,
        datasets: [
            {
                label: campaign1Name,
                data: campaign1DataValues,
                backgroundColor: 'rgba(79, 70, 229, 0.7)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 1, borderRadius: 4,
            },
            {
                label: campaign2Name,
                data: campaign2DataValues,
                backgroundColor: 'rgba(34, 197, 94, 0.7)', // Changed to green for better contrast
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1, borderRadius: 4,
            },
        ],
    };

    const barChartOptions: ChartOptions<'bar'> = {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
        scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.1)' } },
            y: { grid: { display: false } },
        },
        plugins: {
            legend: { position: 'top' as const },
            // --- FIXED: font.weight is now a number ---
            title: { display: true, text: `Metric Comparison`, font: { size: 16, weight: 600 } },
        },
    };

    const radarChartData: ChartData<'radar'> = {
        labels: chartLabels,
        datasets: [
            {
                label: campaign1Name,
                data: campaign1DataValues,
                backgroundColor: 'rgba(79, 70, 229, 0.3)',
                borderColor: 'rgb(79, 70, 229)',
                borderWidth: 2,
            },
            {
                label: campaign2Name,
                data: campaign2DataValues,
                backgroundColor: 'rgba(34, 197, 94, 0.3)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
            },
        ],
    };

    const radarChartOptions: ChartOptions<'radar'> = {
        responsive: true, maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, pointLabels: { font: { size: 11 } }, ticks: { display: false } } },
        plugins: {
            legend: { position: 'top' as const },
            // --- FIXED: font.weight is now a number ---
            title: { display: true, text: `Performance Profile`, font: { size: 16, weight: 600 } },
        },
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-[450px] md:h-[500px]">
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Side-by-Side Performance</h3>
                <Bar options={barChartOptions} data={barChartData} />
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-[400px] md:h-[450px]">
                <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">Strength & Weakness Radar</h3>
                <Radar data={radarChartData} options={radarChartOptions} />
            </div>
        </div>
    );
};

export default CampaignComparisonChart;

