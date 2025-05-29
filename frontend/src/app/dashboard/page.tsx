// D:\socialadify\frontend\src\app\dashboard\page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import OverallStats from '@/components/OverallStats';
import TrendsChart from '@/components/TrendsChart';
import CampaignList, { CampaignSummary } from '@/components/CampaignList';
import { useAuth } from '@/context/AuthContext';
import SuggestionModal from '@/components/SuggestionModal';
import Link from 'next/link';
import CampaignComparisonChart from '../../components/CampaignComparisonChart'; 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

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
  conversions?: number; // This could be total or specific, ensure consistency
  roi?: number; // This could be total or specific, ensure consistency
  page_likes?: number;
  post_reactions?: number;
  cost_per_page_like?: number;
  cost_per_post_reaction?: number;
  unique_link_clicks?: number;
  unique_ctr?: number;
  total_conversions?: number; // Explicitly for aggregate
  total_revenue?: number;    // Explicitly for aggregate
  conversion_rate?: number;
  cost_per_conversion?: number;
  arpu?: number;
  count?: number; // Number of ads in campaign
  ad_type?: string; // If campaign has a primary ad type, or for single ad stats
  // Allow any other string keys for flexibility with mock data or future API responses
  [key: string]: string | number | undefined | null;
}

interface AISuggestion {
    ad_id: string;
    suggestion: string | string[]; // Backend might send string or array
    confidence?: number;
}

export interface ComparisonData { 
  campaign1: CampaignStatsData | null;
  campaign2: CampaignStatsData | null;
}

export default function DashboardPage() {
  const { token, isAuthReady, isAuthenticated, logout } = useAuth(); // Added logout

  const [campaignList, setCampaignList] = useState<CampaignSummary[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null); 
  const [campaignStats, setCampaignStats] = useState<CampaignStatsData | null>(null);
  
  const [isLoadingCampaignList, setIsLoadingCampaignList] = useState(false);
  const [isLoadingCampaignData, setIsLoadingCampaignData] = useState(false);
  const [errorCampaignList, setErrorCampaignList] = useState<string | null>(null);
  const [errorCampaignData, setErrorCampaignData] = useState<string | null>(null);

  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [modalSuggestionData, setModalSuggestionData] = useState<AISuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);

  const [campaign1ForCompare, setCampaign1ForCompare] = useState<string | null>(null);
  const [campaign2ForCompare, setCampaign2ForCompare] = useState<string | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [errorComparison, setErrorComparison] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaignList = async () => {
      if (!token) { 
          setIsLoadingCampaignList(false); 
          if (isAuthReady && !isAuthenticated) { setErrorCampaignList("Not authenticated."); }
          return; 
      }
      setIsLoadingCampaignList(true); setErrorCampaignList(null);
      const requestUrl = `${API_BASE_URL}/insights/campaigns/list-summary`;
      try {
        const res = await fetch(requestUrl, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) { 
            const errData = await res.json().catch(() => ({ detail: `Server error ${res.status}`})); 
            throw new Error(errData.detail || `Failed to fetch campaign list`); 
        }
        const data: CampaignSummary[] = await res.json(); 
        setCampaignList(data);
        // Automatically select the first campaign if list is not empty and none is selected
        // if (data.length > 0 && !selectedCampaignId) {
        //    setSelectedCampaignId(data[0].id);
        // }
      } catch (error: unknown) { 
          const msg = error instanceof Error ? error.message : "Unknown error fetching campaign list.";
          setErrorCampaignList(msg); 
          if(msg.toLowerCase().includes("unauthorized")) logout();
      } 
      finally { setIsLoadingCampaignList(false); }
    };
    if (isAuthReady && isAuthenticated) { fetchCampaignList(); }
  }, [token, isAuthReady, isAuthenticated, logout]); // Removed selectedCampaignId from dep array

  const fetchCampaignData = useCallback(async (campaignId: string): Promise<CampaignStatsData | null> => { 
    if (!campaignId || !token) { return null; }
    try {
      const statsUrl = `${API_BASE_URL}/insights/campaign/${campaignId}/stats`;
      const statsRes = await fetch(statsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!statsRes.ok) { 
          const errData = await statsRes.json().catch(() => ({ detail: `Server error ${statsRes.status}`})); 
          throw new Error(errData.detail || `Failed to fetch stats for ${campaignId}`);
      }
      return await statsRes.json();
    } catch (error: unknown) { 
      console.error(`Error fetching data for campaign ${campaignId}:`, error);
      throw error; // Re-throw to be caught by calling function
    } 
  }, [token]);

  useEffect(() => {
    const loadMainCampaignData = async () => {
        if (selectedCampaignId && token && isAuthReady && isAuthenticated) {
            setIsLoadingCampaignData(true);
            setErrorCampaignData(null);
            setCampaignStats(null);
            try {
                const data = await fetchCampaignData(selectedCampaignId);
                setCampaignStats(data);
            } catch (error) {
                const msg = error instanceof Error ? error.message : "Unknown error fetching campaign data.";
                setErrorCampaignData(msg);
                if(msg.toLowerCase().includes("unauthorized")) logout();
            } finally {
                setIsLoadingCampaignData(false);
            }
            setIsSuggestionModalOpen(false);
            setModalSuggestionData(null);
            setErrorSuggestion(null);
        } else {
            setCampaignStats(null); 
            setIsSuggestionModalOpen(false);
        }
    };
    if (selectedCampaignId) { // Only load if a campaign is selected
        loadMainCampaignData();
    } else { // If no campaign is selected (e.g. on initial load or after clearing selection)
        setCampaignStats(null);
        setIsLoadingCampaignData(false); // Ensure loading is false
    }
  }, [selectedCampaignId, fetchCampaignData, token, isAuthReady, isAuthenticated, logout]);


  const handleCampaignSelection = (campaignId: string) => {
    if (selectedCampaignId === campaignId) { // If same campaign clicked, deselect it
        setSelectedCampaignId(null);
    } else {
        setSelectedCampaignId(campaignId);
    }
    setCampaign1ForCompare(null);
    setCampaign2ForCompare(null);
    setComparisonData(null);
    setErrorComparison(null);
  };
  
  const handleFetchSuggestion = async () => { 
    if (!token) { setErrorSuggestion("Authentication required."); setModalSuggestionData(null); setIsLoadingSuggestion(false); setIsSuggestionModalOpen(true); return; }
    
    let adIdToSuggest: string | null = null;
    // Ensure selectedCampaignId matches the 'id' field from CampaignSummary (slugified)
    if (selectedCampaignId === "winter-sale-campaign") adIdToSuggest = "meta_ad_001";
    else if (selectedCampaignId === "summer-launch") adIdToSuggest = "google_ad_002";
    else if (selectedCampaignId === "flash-deals") adIdToSuggest = "meta_ad_003";
    else if (selectedCampaignId === "influencer-bloom") adIdToSuggest = "tiktok_ad_004"; // Added mapping for the new campaign

    if (!adIdToSuggest) { 
        setErrorSuggestion("Could not determine an ad for suggestions for the selected campaign."); 
        setModalSuggestionData(null); 
        setIsLoadingSuggestion(false); 
        setIsSuggestionModalOpen(true); 
        return; 
    }

    setIsLoadingSuggestion(true); setErrorSuggestion(null); setModalSuggestionData(null); setIsSuggestionModalOpen(true); 
    const suggestionUrl = `${API_BASE_URL}/insights/ad/${adIdToSuggest}/generate-suggestion`;
    try {
      const res = await fetch(suggestionUrl, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); 
      if (!res.ok) { 
          const errData = await res.json().catch(() => ({ detail: `Server error ${res.status}.`})); 
          throw new Error(errData.detail || `Failed to fetch AI suggestion`); 
      }
      const data: AISuggestion = await res.json(); setModalSuggestionData(data);
    } catch (error: unknown) { 
        const msg = error instanceof Error ? error.message : `Unknown error fetching suggestion.`;
        setErrorSuggestion(msg); 
        if(msg.toLowerCase().includes("unauthorized")) logout();
    } 
    finally { setIsLoadingSuggestion(false); }
  };

  const handleCompareCampaigns = async () => {
    if (!campaign1ForCompare || !campaign2ForCompare) {
      setErrorComparison("Please select two different campaigns to compare.");
      setComparisonData(null); return;
    }
    if (campaign1ForCompare === campaign2ForCompare) {
      setErrorComparison("Please select two different campaigns.");
      setComparisonData(null); return;
    }
    if (!token) {
      setErrorComparison("Authentication required to compare campaigns.");
      setComparisonData(null); return;
    }
    setIsLoadingComparison(true); setErrorComparison(null); setComparisonData(null);
    try {
      const [data1, data2] = await Promise.all([
        fetchCampaignData(campaign1ForCompare),
        fetchCampaignData(campaign2ForCompare)
      ]);
      setComparisonData({ campaign1: data1, campaign2: data2 });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch data for comparison.";
      setErrorComparison(msg);
      if(msg.toLowerCase().includes("unauthorized")) logout();
      setComparisonData(null);
    } finally {
      setIsLoadingComparison(false);
    }
  };
  
  const trendsChartType: 'campaign' | 'overall' = selectedCampaignId ? 'campaign' : 'overall';

  if (!isAuthReady) { return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-slate-600">Loading dashboard...</p></div>; }
  if (!isAuthenticated && isAuthReady) { return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-red-600">Access Denied. Please log in.</p></div>;}

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ad Insights Dashboard</h1>
          <Link href="/home" className="mt-2 sm:mt-0 px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors self-start sm:self-center">
            &larr; Back to Home Hub
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <main className="lg:col-span-9 space-y-6">
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
              <TrendsChart identifier={selectedCampaignId} type={trendsChartType} token={token} />
            </section>

            <section className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-6 rounded-xl shadow-lg border border-indigo-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">AI Ad Optimizer</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Get data-driven recommendations to improve your selected ad&apos;s performance.
                    </p>
                  </div>
                  {selectedCampaignId && campaignStats && (
                  <button
                    onClick={handleFetchSuggestion}
                    disabled={isLoadingSuggestion || !token}
                    className="mt-3 sm:mt-0 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 active:scale-95"
                  >
                    {isLoadingSuggestion ? ( <div className="flex items-center justify-center"> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Generating... </div> ) : ( 'Get AI Suggestion' )}
                  </button>
                )}
              </div>
              {!selectedCampaignId && !isLoadingCampaignList && (
                <div className="text-center py-6 px-4">
                    <svg className="mx-auto h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"> <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>
                    <h4 className="mt-2 text-lg font-medium text-slate-700">Select a Campaign</h4>
                    <p className="mt-1 text-sm text-slate-500"> Choose a campaign from the list on the right to enable AI suggestions and view detailed stats. </p>
                </div>
              )}
            </section>
            
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Compare Campaigns</h3>
              {campaignList.length < 2 ? (
                <p className="text-slate-500">You need at least two campaigns to make a comparison.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label htmlFor="campaign1Compare" className="block text-sm font-medium text-slate-700 mb-1">Campaign 1</label>
                      <select
                        id="campaign1Compare"
                        value={campaign1ForCompare || ''}
                        onChange={(e) => setCampaign1ForCompare(e.target.value || null)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                        disabled={isLoadingCampaignList}
                      >
                        <option value="">Select Campaign 1</option>
                        {campaignList.map(c => (
                          <option key={`c1-${c.id}`} value={c.id} disabled={c.id === campaign2ForCompare}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="campaign2Compare" className="block text-sm font-medium text-slate-700 mb-1">Campaign 2</label>
                      <select
                        id="campaign2Compare"
                        value={campaign2ForCompare || ''}
                        onChange={(e) => setCampaign2ForCompare(e.target.value || null)}
                        className="w-full p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                        disabled={isLoadingCampaignList}
                      >
                        <option value="">Select Campaign 2</option>
                        {campaignList.map(c => (
                          <option key={`c2-${c.id}`} value={c.id} disabled={c.id === campaign1ForCompare}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleCompareCampaigns}
                    disabled={isLoadingComparison || !campaign1ForCompare || !campaign2ForCompare || campaign1ForCompare === campaign2ForCompare}
                    className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoadingComparison ? 'Comparing...' : 'Compare Selected Campaigns'}
                  </button>
                  {errorComparison && <p className="text-sm text-red-600 mt-2">{errorComparison}</p>}
                </div>
              )}
              {isLoadingComparison && (
                <div className="mt-6 py-8 text-center animate-pulse text-slate-500">Loading comparison data...</div>
              )}
              {!isLoadingComparison && comparisonData && (
                <div className="mt-6">
                  <CampaignComparisonChart data={comparisonData} />
                </div>
              )}
            </section>

            {selectedCampaignId ? ( 
              isLoadingCampaignData ? ( <div className="p-6 text-center text-slate-500 animate-pulse bg-white rounded-xl shadow-lg">Loading campaign statistics...</div> ) 
              : errorCampaignData ? ( <div className="p-6 text-red-600 bg-red-50 rounded-xl shadow-lg"> <p className="font-bold">Error loading campaign data:</p><p>{errorCampaignData}</p> </div> ) 
              : campaignStats ? ( <OverallStats data={campaignStats} title={`Statistics for Campaign: ${campaignStats.campaign_name}`} isLoading={false} /> ) 
              : ( <div className="p-6 text-center text-slate-500 bg-white rounded-xl shadow-lg">No statistics available for this campaign.</div> )
            ) : isLoadingCampaignList ? ( <div className="p-6 text-center text-slate-500 animate-pulse bg-white rounded-xl shadow-lg">Loading campaign list...</div> ) 
            : errorCampaignList ? ( <div className="p-6 text-red-600 bg-red-50 rounded-xl shadow-lg"> <p className="font-bold">Error loading campaigns:</p><p>{errorCampaignList}</p> </div> ) 
            : campaignList.length === 0 ? ( <OverallStats data={null} title="No campaigns available to display." isLoading={false} /> ) 
            : ( <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg text-center"> <p className="text-slate-500">Select a campaign from the right to view its statistics.</p> </section> )}
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

      <SuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => { setIsSuggestionModalOpen(false); }}
        suggestionData={modalSuggestionData}
        isLoading={isLoadingSuggestion}
        error={errorSuggestion}
      />
    </>
  );
}
