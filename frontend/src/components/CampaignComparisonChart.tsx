// D:\socialadify\frontend\src\components\CampaignComparisonChart.tsx
'use client';

import React from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
// Assuming ComparisonData and CampaignStatsData (if not nested) are correctly exported and accessible
import { ComparisonData } from '@/app/dashboard/page'; 
// If CampaignStatsData is also directly needed and exported from dashboard/page.tsx:
// import { ComparisonData, CampaignStatsData } from '@/app/dashboard/page';
// Or define/import CampaignStatsData if it's in a shared types file.
// For this example, assuming CampaignStatsData is implicitly part of ComparisonData structure.

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  RadialLinearScale, Title, Tooltip, Legend, Filler
);

interface CampaignComparisonChartProps {
  data: ComparisonData | null;
}

// Define a more specific type for the campaign data object if not importing directly
// This should match the structure of campaign1 or campaign2 within ComparisonData
type CampaignDataForChart = NonNullable<ComparisonData['campaign1']>; // Or ComparisonData['campaign2']

const metricsToCompare = [
  { key: 'clicks', label: 'Clicks', normalize: true },
  { key: 'impressions', label: 'Impressions', normalize: true },
  { key: 'total_conversions', label: 'Conversions', fallbackKey: 'conversions', normalize: true },
  { key: 'amount_spent', label: 'Spend', fallbackKey: 'spend', normalize: true },
  { key: 'total_revenue', label: 'Revenue', fallbackKey: 'revenue', normalize: true },
  { key: 'roi', label: 'ROI (%)', fallbackKey: 'roi_metric', normalize: false },
];

// Helper function to get a value, trying primary key then fallback
// Updated campaignData type from 'any' to 'CampaignDataForChart'
const getMetricValue = (campaignData: CampaignDataForChart, metric: typeof metricsToCompare[0]): number => {
    let value = campaignData[metric.key as keyof CampaignDataForChart];
    if (value === undefined && metric.fallbackKey) {
      value = campaignData[metric.fallbackKey as keyof CampaignDataForChart];
    }
    // Ensure the value is treated as a number, default to 0 if not
    const numericValue = Number(value);
    return typeof numericValue === 'number' && !isNaN(numericValue) ? numericValue : 0;
};


const CampaignComparisonChart: React.FC<CampaignComparisonChartProps> = ({ data }) => {
  if (!data || !data.campaign1 || !data.campaign2) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        <p>Select two different campaigns and click &quot;Compare&quot; to see their performance side-by-side.</p>
      </div>
    );
  }

  // Types are now NonNullable<ComparisonData['campaign1']> which is CampaignStatsData
  const campaign1 = data.campaign1;
  const campaign2 = data.campaign2;

  const chartLabels = metricsToCompare.map(metric => metric.label);
  const campaign1DataValues = metricsToCompare.map(metric => getMetricValue(campaign1, metric));
  const campaign2DataValues = metricsToCompare.map(metric => getMetricValue(campaign2, metric));

  // --- Bar Chart Configuration ---
  const barChartData: ChartData<'bar'> = {
    labels: chartLabels,
    datasets: [
      {
        label: campaign1.campaign_name || 'Campaign 1',
        data: campaign1DataValues,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
      {
        label: campaign2.campaign_name || 'Campaign 2',
        data: campaign2DataValues,
        backgroundColor: 'rgba(255, 159, 64, 0.7)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: true, color: 'rgba(200, 200, 200, 0.1)' },
        ticks: {
          font: { size: 10 },
          callback: function(value) { 
            if (typeof value === 'number') {
                if (Math.abs(value) >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                if (Math.abs(value) >= 1000) return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        },
      },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 12 }, boxWidth: 12, padding: 15 } },
      title: { display: true, text: `Comparison: ${campaign1.campaign_name || 'Campaign 1'} vs ${campaign2.campaign_name || 'Campaign 2'}`, font: { size: 16, weight: 600 }, padding: { top: 10, bottom: 20 } },
      tooltip: { 
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.x !== null) {
              const metricConfig = metricsToCompare[context.dataIndex];
              const rawValue = context.parsed.x;
              if (metricConfig && (metricConfig.label.includes('Spend') || metricConfig.label.includes('Revenue'))) {
                label += `$${rawValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
              } else if (metricConfig && metricConfig.label.includes('ROI')) {
                label += `${rawValue.toFixed(2)}%`;
              } else {
                label += rawValue.toLocaleString();
              }
            }
            return label;
          },
        },
      },
    },
    layout: { padding: { top: 5, bottom: 5, left: 10, right: 10 } }
  };

  // --- Radar Chart Configuration ---
  const radarChartData: ChartData<'radar'> = {
    labels: chartLabels,
    datasets: [
      {
        label: campaign1.campaign_name || 'Campaign 1',
        data: campaign1DataValues,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      },
      {
        label: campaign2.campaign_name || 'Campaign 2',
        data: campaign2DataValues,
        backgroundColor: 'rgba(255, 159, 64, 0.3)',
        borderColor: 'rgb(255, 159, 64)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(255, 159, 64)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 159, 64)',
      },
    ],
  };

  const radarChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: { 
        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
        suggestedMin: 0,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: { font: { size: 10 } },
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 12 }, boxWidth: 12, padding: 15 } },
      title: { display: true, text: `Metric Profile: ${campaign1.campaign_name || 'Campaign 1'} vs ${campaign2.campaign_name || 'Campaign 2'}`, font: { size: 16, weight: 600 }, padding: { top: 10, bottom: 20 } },
      tooltip: {
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.r !== null) {
                    label += context.parsed.r.toLocaleString();
                }
                return label;
            }
        }
      }
    },
    elements: { line: { tension: 0.1 } }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-[450px] md:h-[500px] lg:h-[550px]">
        <Bar options={barChartOptions} data={barChartData} />
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md h-[400px] md:h-[450px]">
        <h4 className="text-md font-semibold text-gray-700 mb-3 text-center">Performance Radar</h4>
        <Radar data={radarChartData} options={radarChartOptions} />
      </div>
    </div>
  );
};

export default CampaignComparisonChart;
