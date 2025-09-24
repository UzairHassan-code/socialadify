// D:\socialadify\frontend\src\components\CampaignComparisonChart.tsx
'use client';

import React from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ChartOptions, ChartData, PointElement, LineElement,
    RadialLinearScale, Filler
} from 'chart.js';
// 1. Import the UnifiedCampaign interface
import { UnifiedCampaign } from '@/app/dashboard/page';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    RadialLinearScale, Title, Tooltip, Legend, Filler
);

// 2. Update the ComparisonData interface to use UnifiedCampaign
interface ComparisonData {
    campaign1: UnifiedCampaign | null;
    campaign2: UnifiedCampaign | null;
}

interface CampaignComparisonChartProps {
    data: ComparisonData | null;
}

// 3. Update metrics to match the keys in UnifiedCampaign
const metricsToCompare = [
    { key: 'clicks', label: 'Clicks' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'cost', label: 'Cost (Rs)' },
    { key: 'ctr', label: 'CTR (%)' },
    { key: 'cpc', label: 'CPC (Rs)' },
];

// Helper to get a numeric value from the campaign data
const getMetricValue = (campaignData: UnifiedCampaign, metricKey: keyof UnifiedCampaign): number => {
    const value = campaignData[metricKey];
    const numericValue = Number(value);
    return isNaN(numericValue) ? 0 : numericValue;
};

const CampaignComparisonChart: React.FC<CampaignComparisonChartProps> = ({ data }) => {
    if (!data || !data.campaign1 || !data.campaign2) {
        return (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                <p>Select two different campaigns and click "Compare" to see their performance.</p>
            </div>
        );
    }

    const { campaign1, campaign2 } = data;

    const chartLabels = metricsToCompare.map(metric => metric.label);
    
    // 4. Update data extraction logic to use the new types
    const campaign1DataValues = metricsToCompare.map(metric => getMetricValue(campaign1, metric.key as keyof UnifiedCampaign));
    const campaign2DataValues = metricsToCompare.map(metric => getMetricValue(campaign2, metric.key as keyof UnifiedCampaign));

    const campaign1Name = campaign1.name || 'Campaign 1';
    const campaign2Name = campaign2.name || 'Campaign 2';

    // --- Chart Configurations (styling remains the same) ---
    const barChartData: ChartData<'bar'> = {
        labels: chartLabels,
        datasets: [
            {
                label: campaign1Name,
                data: campaign1DataValues,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: campaign2Name,
                data: campaign2DataValues,
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const barChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
        scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.1)' } },
            y: { grid: { display: false } },
        },
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `Comparison: ${campaign1Name} vs ${campaign2Name}`, font: { size: 16, weight: 600 } },
        },
    };

    const radarChartData: ChartData<'radar'> = {
        labels: chartLabels,
        datasets: [
            {
                label: campaign1Name,
                data: campaign1DataValues,
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
            {
                label: campaign2Name,
                data: campaign2DataValues,
                backgroundColor: 'rgba(255, 159, 64, 0.3)',
                borderColor: 'rgb(255, 159, 64)',
                borderWidth: 2,
            },
        ],
    };

    const radarChartOptions: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, pointLabels: { font: { size: 10 } }, ticks: { display: false } } },
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: `Metric Profile: ${campaign1Name} vs ${campaign2Name}`, font: { size: 16, weight: 600 } },
        },
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-[450px] md:h-[500px]">
                <Bar options={barChartOptions} data={barChartData} />
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-[400px] md:h-[450px]">
                <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">Performance Radar</h4>
                <Radar data={radarChartOptions} options={radarChartOptions} />
            </div>
        </div>
    );
};

export default CampaignComparisonChart;
