// D:\socialadify\frontend\app\components\TrendsChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, ChartOptions, TooltipItem
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const API_BASE_URL = 'http://127.0.0.1:8000';

interface TrendPoint {
  date: string; impressions: number; clicks: number; conversions?: number;
  spend?: number; revenue?: number; ctr?: number; roi?: number;
}

export interface TrendsChartProps {
  identifier: string | null;
  type: 'ad' | 'campaign' | 'overall';
}

const TrendsChart: React.FC<TrendsChartProps> = ({ identifier, type }) => {
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartTitle, setChartTitle] = useState('Performance Trends');

  const fetchData = useCallback(async () => {
    // If type is 'ad' or 'campaign' but no identifier is provided,
    // set a placeholder title, clear data, and do not proceed with fetching.
    if ((type === 'ad' || type === 'campaign') && !identifier) {
      setTrendData([]);
      setChartTitle(type === 'ad' ? 'Select an Ad to view trends.' : 'Select a Campaign to view trends.');
      setIsLoading(false); // Ensure loading is false if we're not fetching
      setError(null); // Clear any previous errors
      return; // Stop execution for this case
    }
    
    setIsLoading(true);
    setError(null);
    setTrendData([]); // Clear previous data before new fetch

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
      // This case should ideally not be reached if the initial check is correct
      // but serves as a fallback.
      setIsLoading(false);
      setChartTitle('Please select an item to view trends.');
      return;
    }
    
    setChartTitle(newChartTitle);

    console.log(`Fetching trends from: ${requestUrl} (Type: ${type}, Identifier: ${identifier})`);
    try {
      const res = await fetch(requestUrl);

      console.log(`fetchData Trends (${identifier}, ${type}) - Status:`, res.status, `OK?:`, res.ok, `Type:`, res.type);

      if (res.type === 'opaque') {
        console.error(`fetchData Trends - Opaque response. CORS issue likely.`);
        throw new Error('Failed to fetch trends: Opaque response. Check CORS.');
      }
      if (!res.ok) {
        let errorDetail = `Server error: ${res.status} ${res.statusText}`;
        try { 
          const errorData = await res.json(); 
          errorDetail = errorData.detail || errorDetail; 
          console.error(`fetchData Trends - Server error (JSON):`, errorData);
        } catch { 
            try {
                const textError = await res.text();
                errorDetail = textError || errorDetail;
                console.error(`fetchData Trends - Server error (Text):`, textError);
            } catch {/* ignore */}
        }
        throw new Error(errorDetail);
      }
      const data: TrendPoint[] = await res.json();
      setTrendData(data);
      console.log(`fetchData Trends - Successfully fetched trends for ${identifier || 'overall'}:`, data);
    } catch (err: unknown) {
      console.error(`Full error object in fetchData Trends for ${identifier || 'overall'}:`, err);
      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        setError(`Network error or CORS issue fetching trends. Check console.`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching trend data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [identifier, type]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartDataConfig = {
    labels: trendData.map(item => new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Clicks', data: trendData.map(item => item.clicks),
      borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.4, fill: true, pointRadius: 2, pointHoverRadius: 5, pointBorderColor: 'rgb(59,130,246)', pointBackgroundColor: '#fff',
    }],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 12 }, usePointStyle: true, boxWidth: 8 }},
      title: { display: true, text: chartTitle, font: {size: 16, weight: 'normal'}, padding: {bottom: 10} },
      tooltip: {
        mode: 'index' as const, intersect: false, backgroundColor: 'rgba(0,0,0,0.8)', titleFont: {size: 13}, bodyFont: {size: 12},
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
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }},
      y: { type: 'linear' as const, display: true, position: 'left' as const, beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.3)' }, ticks: { font: { size: 10 }}},
    },
  };

  // Updated conditional rendering logic
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
  // If type is 'ad' or 'campaign' and there's no identifier, show a prompt (handled by title and empty data)
  if ((type === 'ad' || type === 'campaign') && !identifier) {
    return <div className="flex items-center justify-center h-full text-gray-500"><p>{chartTitle}</p></div>;
  }
  // If data fetch was attempted (isLoading is false, no error) but no data was returned
  if (trendData.length === 0) {
    const noDataMessage = (type === 'ad' || type === 'campaign') && identifier 
        ? `No trend data available for ${type} ${identifier}.` 
        : (type === 'overall' ? 'No overall trend data available.' : 'No trend data available.');
    return <div className="flex items-center justify-center h-full text-gray-500"><p>{noDataMessage}</p></div>;
  }
  
  return (
    <div className="w-full h-80 md:h-96">
      <Line options={chartOptions} data={chartDataConfig} />
    </div>
  );
};
export default TrendsChart;
