// D:\socialadify\frontend\app\dashboard\page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import OverallStats from '../components/OverallStats';
import TrendsChart from '../components/TrendsChart'; // Assuming TrendsChartProps is correctly defined and used in TrendsChart.tsx
import CampaignList, { CampaignSummary } from '../components/CampaignList';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface CampaignStatsData {
  id: string; 
  campaign_name: string;
  clicks?: number;
  impressions?: number;
  reach?: number;
  amount_spent?: number;
  average_cpc?: number;
  ctr?: number;
  average_cpm?: number;
  conversions?: number; // This is total_conversions at campaign level from backend
  roi?: number; // This is roi at campaign level from backend
  page_likes?: number;
  post_reactions?: number;
  cost_per_page_like?: number;
  cost_per_post_reaction?: number;
  unique_link_clicks?: number;
  unique_ctr?: number;
  total_conversions?: number; // Explicitly from backend campaign stats
  total_revenue?: number; // Explicitly from backend campaign stats
  conversion_rate?: number;
  cost_per_conversion?: number;
  arpu?: number;
  count?: number; // Number of ads in campaign
  [key: string]: string | number | undefined | null;
}

// New interface for AI Suggestion response
interface AISuggestion {
    ad_id: string;
    suggestion: string;
    confidence?: number; // Optional
}

export default function DashboardPage() {
  const [campaignList, setCampaignList] = useState<CampaignSummary[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStatsData | null>(null);
  
  const [isLoadingCampaignList, setIsLoadingCampaignList] = useState(true);
  const [isLoadingCampaignData, setIsLoadingCampaignData] = useState(false);
  const [errorCampaignList, setErrorCampaignList] = useState<string | null>(null);
  const [errorCampaignData, setErrorCampaignData] = useState<string | null>(null);

  // --- NEW State for AI Suggestions ---
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);
  // --- End NEW State ---

  useEffect(() => {
    const fetchCampaignList = async () => {
      setIsLoadingCampaignList(true);
      setErrorCampaignList(null);
      const requestUrl = `${API_BASE_URL}/insights/campaigns/list-summary`;
      console.log(`Fetching campaign list from: ${requestUrl}`);
      try {
        const res = await fetch(requestUrl);
        if (res.type === 'opaque') throw new Error('Opaque response fetching campaign list (CORS issue).');
        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: `Server error ${res.status}`}));
          throw new Error(errData.detail || `Failed to fetch campaign list`);
        }
        const data: CampaignSummary[] = await res.json();
        setCampaignList(data);
        console.log('Successfully fetched campaign list:', data);
      } catch (error: unknown) {
        console.error("Error fetching campaign list:", error);
        setErrorCampaignList(error instanceof Error ? error.message : "Unknown error fetching campaigns.");
      } finally {
        setIsLoadingCampaignList(false);
      }
    };
    fetchCampaignList();
  }, []); 

  // Auto-select first campaign (optional)
  // useEffect(() => {
  //   if (campaignList.length > 0 && !selectedCampaignId) {
  //     setSelectedCampaignId(campaignList[0].id); 
  //   }
  // }, [campaignList, selectedCampaignId]); 

  const fetchCampaignData = useCallback(async (campaignId: string) => {
    if (!campaignId) {
      setCampaignStats(null);
      return;
    }
    setIsLoadingCampaignData(true);
    setErrorCampaignData(null);
    setCampaignStats(null); // Clear previous stats

    try {
      const statsUrl = `${API_BASE_URL}/insights/campaign/${campaignId}/stats`;
      console.log(`Fetching campaign stats from: ${statsUrl}`);
      const statsRes = await fetch(statsUrl);
      if (statsRes.type === 'opaque') throw new Error('Opaque response fetching campaign stats (CORS issue).');
      if (!statsRes.ok) {
        const errData = await statsRes.json().catch(() => ({ detail: `Server error ${statsRes.status}`}));
        throw new Error(errData.detail || `Failed to fetch stats for campaign ${campaignId}`);
      }
      const statsData: CampaignStatsData = await statsRes.json();
      setCampaignStats(statsData);
      console.log(`Successfully fetched stats for campaign ${campaignId}:`, statsData);
    } catch (error: unknown) {
      console.error(`Error fetching data for campaign ${campaignId}:`, error);
      setErrorCampaignData(error instanceof Error ? error.message : `Unknown error fetching data for campaign ${campaignId}.`);
    } finally {
      setIsLoadingCampaignData(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchCampaignData(selectedCampaignId);
      // Clear previous AI suggestion and error when campaign changes
      setAiSuggestion(null); 
      setErrorSuggestion(null);
    } else {
      setCampaignStats(null);
      // Clear AI suggestion if no campaign is selected
      setAiSuggestion(null);
    }
  }, [selectedCampaignId, fetchCampaignData]);

  const handleCampaignSelection = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };
  
  // --- NEW Function to fetch AI Suggestion ---
  const handleFetchSuggestion = async () => {
    let adIdToSuggest: string | null = null;

    // Placeholder logic to determine ad_id based on selected campaign
    // In a real app, you'd have a way to select a specific ad.
    // Ensure these campaign IDs match exactly what's returned by your /campaigns/list-summary endpoint (e.g., "winter-sale-campaign")
    if (selectedCampaignId === "winter-sale-campaign") {
        adIdToSuggest = "meta_ad_001";
    } else if (selectedCampaignId === "summer-launch") {
        adIdToSuggest = "google_ad_002";
    } else if (selectedCampaignId === "flash-deals") {
        adIdToSuggest = "meta_ad_003";
    }
    // Add more mappings if needed for other campaigns from your mock_data

    if (!adIdToSuggest) {
        setErrorSuggestion("Could not determine an ad to get suggestions for this campaign (placeholder logic). Please select a mapped campaign or enhance ad selection.");
        console.warn("No ad_id mapped for suggestion for campaign:", selectedCampaignId);
        return;
    }

    setIsLoadingSuggestion(true);
    setErrorSuggestion(null);
    setAiSuggestion(null); // Clear previous suggestion before new fetch

    const suggestionUrl = `${API_BASE_URL}/insights/ad/${adIdToSuggest}/generate-suggestion`;
    console.log(`Fetching AI suggestion for ad ${adIdToSuggest} from: ${suggestionUrl}`);
    try {
        const res = await fetch(suggestionUrl, { method: 'POST' }); 
        if (res.type === 'opaque') throw new Error('Opaque response fetching AI suggestion (CORS issue). Check backend CORS and network.');
        if (!res.ok) {
            const errData = await res.json().catch(() => ({ detail: `Server error ${res.status}. Unable to parse error response.`}));
            throw new Error(errData.detail || `Failed to fetch AI suggestion for ad ${adIdToSuggest}`);
        }
        const data: AISuggestion = await res.json();
        setAiSuggestion(data);
        console.log(`Successfully fetched AI suggestion for ad ${adIdToSuggest}:`, data);
    } catch (error: unknown) {
        console.error(`Error fetching AI suggestion for ad ${adIdToSuggest}:`, error);
        setErrorSuggestion(error instanceof Error ? error.message : `Unknown error fetching AI suggestion.`);
    } finally {
        setIsLoadingSuggestion(false);
    }
  };
  // --- End NEW Function ---
  
  const trendsChartType: 'campaign' | 'overall' = selectedCampaignId ? 'campaign' : 'overall';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Ad Performance Dashboard
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <main className="lg:col-span-9 space-y-6">
          <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
            <TrendsChart
              identifier={selectedCampaignId} 
              type={trendsChartType}
            />
          </section>

          {/* --- NEW Section for AI Suggestion --- */}
          {selectedCampaignId && campaignStats && ( // Show this section only if a campaign and its stats are loaded
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-700">AI Ad Optimizer</h3>
                <button
                  onClick={handleFetchSuggestion}
                  disabled={isLoadingSuggestion || !selectedCampaignId} // Disable if loading or no campaign selected
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
                >
                  {isLoadingSuggestion ? 'Generating Suggestion...' : 'Get AI Suggestion'}
                </button>
              </div>

              {isLoadingSuggestion && (
                <div className="p-3 text-sm text-center text-gray-500 animate-pulse">Loading suggestion...</div>
              )}
              {errorSuggestion && !isLoadingSuggestion && (
                <div className="mt-3 p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">
                    <p className="font-semibold">Error fetching suggestion:</p>
                    <p>{errorSuggestion}</p>
                </div>
              )}
              {aiSuggestion && !isLoadingSuggestion && !errorSuggestion && (
                <div className="mt-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm font-semibold text-indigo-800">
                    Suggestion for Ad <span className="font-bold">{aiSuggestion.ad_id}</span>:
                  </p>
                  <p className="text-sm text-indigo-700 mt-1">{aiSuggestion.suggestion}</p>
                  {/* {aiSuggestion.confidence && <p className="text-xs text-indigo-500 mt-1">Confidence: {(aiSuggestion.confidence * 100).toFixed(1)}%</p>} */}
                </div>
              )}
            </section>
          )}
          {/* --- End NEW Section --- */}


          {isLoadingCampaignData && !campaignStats && (
            <div className="p-6 text-center text-gray-500 animate-pulse bg-white rounded-xl shadow-lg">Loading campaign statistics...</div>
          )}
          {errorCampaignData && !isLoadingCampaignData && (
              <div className="p-6 text-red-600 bg-red-50 rounded-xl shadow-lg">
                <p className="font-bold">Error loading campaign data:</p>
                <p>{errorCampaignData}</p>
              </div>
          )}
          {selectedCampaignId && campaignStats && !isLoadingCampaignData && !errorCampaignData && (
            <OverallStats data={campaignStats} title={`Statistics for Campaign: ${campaignStats.campaign_name}`} />
          )}
          {!selectedCampaignId && !isLoadingCampaignList && !errorCampaignList && ( // Show prompt if no campaign is selected
              <OverallStats data={null} title="Select a campaign to view its detailed statistics and get AI suggestions." />
          )}
        </main>

        <aside className="lg:col-span-3">
          <CampaignList
            campaigns={campaignList}
            selectedCampaignId={selectedCampaignId}
            onCampaignSelect={handleCampaignSelection}
            isLoading={isLoadingCampaignList}
            error={errorCampaignList}
          />
        </aside>
      </div>
    </div>
  );
}
