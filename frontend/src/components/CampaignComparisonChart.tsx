// D:\socialadify\frontend\src\components\CampaignComparisonChart.tsx
'use client';

import React from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title,
    Tooltip, Legend, ChartOptions, ChartData, PointElement, LineElement,
    RadialLinearScale, Filler
} from 'chart.js';
import { ComparisonData } from '@/app/dashboard/page';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement,
    RadialLinearScale, Title, Tooltip, Legend, Filler
);

interface CampaignComparisonChartProps {
    data: ComparisonData | null;
}

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
    if (!data || !data.campaign1 || !data.campaign2) {
        return (
            <div className="p-4 text-center text-slate-400 h-[400px] flex items-center justify-center">
                <p>Select two campaigns from the list and click "Compare Selected" to see their performance side-by-side.</p>
            </div>
        );
    }

    const { campaign1, campaign2, campaign1Name, campaign2Name } = data;

    const chartLabels = metricsToCompare.map(metric => metric.label);
    
    const campaign1DataValues = metricsToCompare.map(metric => campaign1[metric.key as keyof typeof campaign1]);
    const campaign2DataValues = metricsToCompare.map(metric => campaign2[metric.key as keyof typeof campaign2]);

    // --- MODIFIED: Chart configurations updated for dark theme ---
    const barChartData: ChartData<'bar'> = {
        labels: chartLabels,
        datasets: [
            {
                label: campaign1Name,
                data: campaign1DataValues,
                backgroundColor: 'rgba(129, 140, 248, 0.7)',
                borderColor: 'rgb(129, 140, 248)',
                borderWidth: 1, borderRadius: 4,
            },
            {
                label: campaign2Name,
                data: campaign2DataValues,
                backgroundColor: 'rgba(52, 211, 153, 0.7)',
                borderColor: 'rgb(52, 211, 153)',
                borderWidth: 1, borderRadius: 4,
            },
        ],
    };

    const barChartOptions: ChartOptions<'bar'> = {
        responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
        scales: {
            x: { 
                beginAtZero: true, 
                grid: { color: 'rgba(100, 116, 139, 0.2)' },
                ticks: { color: '#94a3b8' } // slate-400
            },
            y: { 
                grid: { display: false },
                ticks: { color: '#cbd5e1' } // slate-300
            },
        },
        plugins: {
            legend: { 
                position: 'top' as const,
                labels: { color: '#cbd5e1' } // slate-300
            },
            title: { display: true, text: `Metric Comparison`, font: { size: 16, weight: 600 }, color: '#f1f5f9' }, // slate-100
        },
    };

    const radarChartData: ChartData<'radar'> = {
        labels: chartLabels,
        datasets: [
            {
                label: campaign1Name,
                data: campaign1DataValues,
                backgroundColor: 'rgba(129, 140, 248, 0.3)',
                borderColor: 'rgb(129, 140, 248)',
                pointBackgroundColor: 'rgb(129, 140, 248)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(129, 140, 248)',
                borderWidth: 2,
            },
            {
                label: campaign2Name,
                data: campaign2DataValues,
                backgroundColor: 'rgba(52, 211, 153, 0.3)',
                borderColor: 'rgb(52, 211, 153)',
                pointBackgroundColor: 'rgb(52, 211, 153)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(52, 211, 153)',
                borderWidth: 2,
            },
        ],
    };

    const radarChartOptions: ChartOptions<'radar'> = {
        responsive: true, maintainAspectRatio: false,
        scales: { 
            r: { 
                beginAtZero: true, 
                pointLabels: { font: { size: 11 }, color: '#cbd5e1' }, // slate-300
                ticks: { display: false },
                grid: { color: 'rgba(100, 116, 139, 0.2)' }, // Slate 500 with opacity
                angleLines: { color: 'rgba(100, 116, 139, 0.2)' } // Slate 500 with opacity
            } 
        },
        plugins: {
            legend: { 
                position: 'top' as const,
                labels: { color: '#cbd5e1' } // slate-300
            },
            title: { display: true, text: `Performance Profile`, font: { size: 16, weight: 600 }, color: '#f1f5f9' }, // slate-100
        },
    };

    return (
        // --- THIS IS THE FIX: Increased the vertical spacing between the two charts ---
        <div className="space-y-16">
            <div className="h-[450px] md:h-[500px]">
                <h3 className="text-lg font-semibold text-slate-200 text-center mb-4">Side-by-Side Performance</h3>
                <Bar options={barChartOptions} data={barChartData} />
            </div>
            <div className="h-[400px] md:h-[450px]">
                <h3 className="text-lg font-semibold text-slate-200 text-center mb-4">Strength & Weakness Radar</h3>
                <Radar data={radarChartData} options={radarChartOptions} />
            </div>
        </div>
    );
};

export default CampaignComparisonChart;

