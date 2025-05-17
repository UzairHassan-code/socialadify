// D:\socialadify\frontend\src\components\TrendsChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ChartOptions, TooltipItem, ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

interface TrendPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions?: number;
  spend?: number;
  revenue?: number;
  ctr?: number;
  roi?: number;
}

export interface TrendsChartProps {
  identifier: string | null;
  type: 'ad' | 'campaign' | 'overall';
  token: string | null;
}

const TrendsChart: React.FC<TrendsChartProps> = ({ identifier, type, token }) => {
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartTitle, setChartTitle] = useState('Performance Trends');

  const fetchData = useCallback(async () => {
    if ((type === 'ad' || type === 'campaign') && !identifier) {
      setTrendData([]);
      setChartTitle(type === 'ad' ? 'Select an Ad to view trends.' : 'Select a Campaign to view trends.');
      setIsLoading(false); setError(null); return;
    }
    if (!token) {
      setTrendData([]);
      setChartTitle((type === 'ad' || type === 'campaign') && !identifier ? chartTitle : "Authentication required to view trends.");
      setIsLoading(false); setError("Authentication token is missing."); return;
    }
    
    setIsLoading(true); setError(null); setTrendData([]);
    let requestUrl = '';
    let newChartTitle = 'Performance Trends'; 

    if (type === 'ad' && identifier) {
      requestUrl = `${API_BASE_URL}/insights/ad/${identifier}/trends/daily`;
      newChartTitle = `Trends for Ad: ${identifier}`;
    } else if (type === 'campaign' && identifier) {
      requestUrl = `${API_BASE_URL}/insights/campaign/${identifier}/trends/daily`;
      newChartTitle = `Trends for Campaign: ${identifier}`; 
    } else if (type === 'overall') {
      requestUrl = `${API_BASE_URL}/insights/analytics/overall-trends/daily`;
      newChartTitle = 'Overall Performance Trends';
    } else {
      setIsLoading(false); setChartTitle('Please select an item to view trends.'); return;
    }
    setChartTitle(newChartTitle);

    try {
      const res = await fetch(requestUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) { 
        let errorDetail = `Server error: ${res.status} ${res.statusText}`;
        try { const errorData = await res.json(); errorDetail = errorData.detail || errorDetail; } catch {/*ignore*/}
        throw new Error(errorDetail);
      }
      const data: TrendPoint[] = await res.json(); setTrendData(data);
    } catch (err: unknown) { 
        if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
            setError(`Network error or CORS. Check backend and console.`);
        } else if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Unknown error fetching trend data.");
        }
    } 
    finally { setIsLoading(false); }
  }, [identifier, type, token, chartTitle]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartDataConfig: ChartData<'line'> = {
    labels: trendData.map(item => new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Clicks',
        data: trendData.map(item => item.clicks),
        borderColor: 'rgb(79, 70, 229)', // Indigo
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        yAxisID: 'yClicks',
        tension: 0.3, fill: 'origin', pointRadius: 2, pointHoverRadius: 5,
      },
      {
        label: 'Impressions',
        data: trendData.map(item => item.impressions),
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
      title: { display: true, text: chartTitle, font: {size: 16, weight: 'normal'}, padding: {bottom: 15, top: 5} },
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
        grid: { color: 'rgba(200, 200, 200, 0.2)', z: -1 }, // Corrected: lowercase 'z'
        ticks: { font: { size: 11 }, color: 'rgb(79, 70, 229)', padding: 5, callback: value => Number(value).toLocaleString() },
        title: { display: true, text: 'Clicks', color: 'rgb(79, 70, 229)', font: {size: 12, weight: 600}} // Corrected: weight as number
      },
      yImpressions: {
        type: 'linear' as const, display: true, position: 'right' as const, beginAtZero: true,
        grid: { drawOnChartArea: false }, 
        ticks: { font: { size: 11 }, color: 'rgb(22, 163, 74)', padding: 5, callback: value => Number(value).toLocaleString() },
        title: { display: true, text: 'Impressions', color: 'rgb(22, 163, 74)', font: {size: 12, weight: 600}} // Corrected: weight as number
      }
    },
  };

  if (isLoading) { 
      return <div className="flex items-center justify-center h-full text-gray-500 animate-pulse"><p>Loading trends...</p></div>;
  }
  if (error) { 
      return (
        <div className="flex items-center justify-center h-full text-red-700 bg-red-50 p-4 rounded-md" role="alert">
          <div><p className="font-bold">Error Loading Trends</p><p className="text-sm">{error}</p></div>
        </div>
      );
  }
  if ((type === 'ad' || type === 'campaign') && !identifier) { 
      return <div className="flex items-center justify-center h-full text-gray-500"><p>{chartTitle}</p></div>; 
  }
  // Display message if token exists (meaning fetch was attempted or should be) but no data
  if (trendData.length === 0 && token) { 
    const noDataMessage = (type === 'ad' || type === 'campaign') && identifier 
        ? `No trend data available for ${type} ${identifier}.` 
        : (type === 'overall' ? 'No overall trend data available.' : 'No trend data available.');
    return <div className="flex items-center justify-center h-full text-gray-500"><p>{noDataMessage}</p></div>;
  }
  // Display message if no token and it's an overall chart (which might otherwise show if public)
  if (trendData.length === 0 && !token && type === 'overall') { 
      return <div className="flex items-center justify-center h-full text-gray-500"><p>Authentication required to view overall trends.</p></div>;
  }
  // If no token and it's a specific ad/campaign chart, the initial checks in fetchData should set an error or appropriate title.
  // This is a fallback.
  if (trendData.length === 0 && !token) {
    return <div className="flex items-center justify-center h-full text-gray-500"><p>Authentication required.</p></div>;
  }


  return (
    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm h-[350px] md:h-[400px]">
      <Line options={chartOptions} data={chartDataConfig} />
    </div>
  );
};
export default TrendsChart;
