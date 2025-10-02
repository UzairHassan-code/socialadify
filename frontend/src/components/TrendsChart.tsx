// D:\socialadify\frontend\src\components\TrendsChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    Title, Tooltip, Legend, Filler, ChartOptions, TooltipItem, ChartData
} from 'chart.js';
// --- MODIFIED: Import the TrendPoint interface from your service file ---
import { TrendPoint } from '@/services/insightsService';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

// --- MODIFIED: The props are now much simpler ---
// The component receives the data directly, along with loading and error states.
export interface TrendsChartProps {
    data: TrendPoint[];
    isLoading: boolean;
    error: string | null;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ data, isLoading, error }) => {
    
    // --- All data fetching logic (useState, useCallback, useEffect) has been removed ---
    // This component now only focuses on displaying the data it's given.

    const chartDataConfig: ChartData<'line'> = {
        labels: data.map(item => new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Clicks',
                data: data.map(item => item.clicks),
                borderColor: 'rgb(79, 70, 229)', // Indigo
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                yAxisID: 'yClicks',
                tension: 0.3, fill: 'origin', pointRadius: 2, pointHoverRadius: 5,
            },
            {
                label: 'Impressions',
                data: data.map(item => item.impressions),
                borderColor: 'rgb(22, 163, 74)', // Green
                backgroundColor: 'rgba(22, 163, 74, 0.2)',
                yAxisID: 'yImpressions',
                tension: 0.3, fill: 'origin', pointRadius: 2, pointHoverRadius: 5,
            }
        ],
    };

    const chartOptions: ChartOptions<'line'> = {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: {size: 13} }},
            // The title is now handled by the parent dashboard page, so we can disable it here.
            title: { display: false }, 
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)', titleFont: {size: 13}, bodyFont: {size: 12},
                callbacks: {
                    label: function(context: TooltipItem<'line'>) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) label += context.parsed.y.toLocaleString();
                        return label;
                    }
                }
            },
        },
        scales: {
            x: { 
                grid: { display: false }, 
                ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 }
            },
            yClicks: {
                type: 'linear' as const, display: true, position: 'left' as const, beginAtZero: true,
                grid: { color: 'rgba(200, 200, 200, 0.2)', z: -1 },
                ticks: { font: { size: 11 }, color: 'rgb(79, 70, 229)', padding: 5, callback: value => Number(value).toLocaleString() },
                // --- FIX: Changed font weight from string '600' to number 600 ---
                title: { display: true, text: 'Clicks', color: 'rgb(79, 70, 229)', font: {size: 12, weight: 600}}
            },
            yImpressions: {
                type: 'linear' as const, display: true, position: 'right' as const, beginAtZero: true,
                grid: { drawOnChartArea: false }, 
                ticks: { font: { size: 11 }, color: 'rgb(22, 163, 74)', padding: 5, callback: value => Number(value).toLocaleString() },
                // --- FIX: Changed font weight from string '600' to number 600 ---
                title: { display: true, text: 'Impressions', color: 'rgb(22, 163, 74)', font: {size: 12, weight: 600}}
            }
        },
    };

    // --- RENDER STATES based on props from the parent ---

    if (isLoading) { 
        return (
            <div className="flex items-center justify-center h-[350px] md:h-[400px]">
                <div className="text-center text-gray-500">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
                    <p>Loading Performance Trends...</p>
                </div>
            </div>
        );
    }

    if (error) { 
        return (
            <div className="flex items-center justify-center h-[350px] md:h-[400px] text-red-700 bg-red-50 p-4 rounded-md" role="alert">
                <div>
                    <p className="font-bold text-center">Error Loading Trends</p>
                    <p className="text-sm text-center mt-1">{error}</p>
                </div>
            </div>
        );
    }

    if (data.length === 0) { 
        return (
            <div className="flex items-center justify-center h-[350px] md:h-[400px] text-gray-500">
                <p>No trend data available for the selected period.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-2 sm:p-4 rounded-lg h-[350px] md:h-[400px]">
            <Line options={chartOptions} data={chartDataConfig} />
        </div>
    );
};

export default TrendsChart;
