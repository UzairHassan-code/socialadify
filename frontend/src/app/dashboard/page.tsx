// D:\socialadify\frontend\src\app\dashboard\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import OverallStats from '../../components/OverallStats';
import TrendsChart from '../../components/TrendsChart';
import CampaignList from '../../components/CampaignList';
import SuggestionModal from '../../components/SuggestionModal'; 
import CampaignComparisonChart from '../../components/CampaignComparisonChart';
import { useAuth } from '../../context/AuthContext';
import { 
    getGoogleCampaigns, GoogleCampaign, getGoogleCampaignPerformance, PerformanceData,
    getAiSuggestionForCampaign, AISuggestion, Statistics
} from '../../services/insightsService';
import Link from 'next/link';

// This interface is used by CampaignList
export interface UnifiedCampaign {
    id: string;
    name: string;
    status: string;
    platform: 'Google';
    clicks: number;
    impressions: number;
    ctr: number;
    cost: number;
    cpc: number;
}

// This interface is exported so CampaignComparisonChart can use it
export interface ComparisonData {
    campaign1: Statistics | null;
    campaign2: Statistics | null;
    campaign1Name: string;
    campaign2Name: string;
}

export default function DashboardPage() {
    const { user, token, isAuthReady } = useAuth();

    // State for the list of campaigns
    const [campaigns, setCampaigns] = useState<UnifiedCampaign[]>([]);
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
    const [campaignsError, setCampaignsError] = useState<string | null>(null);

    // State for single-campaign view
    const [selectedCampaign, setSelectedCampaign] = useState<UnifiedCampaign | null>(null);
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);
    const [performanceError, setPerformanceError] = useState<string | null>(null);

    // State for multi-campaign comparison view
    const [comparisonIds, setComparisonIds] = useState<string[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [isComparisonLoading, setIsComparisonLoading] = useState(false);

    // State for AI Suggestion Modal
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [suggestionData, setSuggestionData] = useState<AISuggestion | null>(null);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    
    // --- Data Fetching Effects ---
    useEffect(() => {
        const fetchCampaignList = async () => {
            if (!token || !user) {
                if(isAuthReady) setCampaignsError("Please log in to view data.");
                setIsLoadingCampaigns(false); return;
            }
            setIsLoadingCampaigns(true); setCampaignsError(null);
            try {
                if (user.google_ad_account_id) {
                    const response = await getGoogleCampaigns(token);
                    const unifiedData = response.campaigns.map((c: GoogleCampaign): UnifiedCampaign => ({
                        id: c.id, name: c.name, status: c.status, platform: 'Google',
                        clicks: Number(c.clicks), impressions: Number(c.impressions),
                        ctr: Number(c.ctr) * 100, cost: Number(c.cost), cpc: Number(c.average_cpc),
                    }));
                    setCampaigns(unifiedData);
                } else {
                    setCampaigns([]);
                    setCampaignsError("No ad account connected. Please connect your Google Ads account to see campaigns.");
                }
            } catch (err) {
                setCampaignsError(err instanceof Error ? err.message : "An unknown error occurred.");
                setCampaigns([]);
            } finally {
                setIsLoadingCampaigns(false);
            }
        };
        if (isAuthReady) fetchCampaignList();
    }, [user, token, isAuthReady]);

    useEffect(() => {
        const fetchPerformanceData = async () => {
            if (!selectedCampaign || !token || isComparing) {
                setPerformanceData(null); return;
            }
            setIsPerformanceLoading(true); setPerformanceError(null); setPerformanceData(null);
            try {
                const data = await getGoogleCampaignPerformance(token, selectedCampaign.id);
                setPerformanceData(data);
            } catch (err) {
                setPerformanceError(err instanceof Error ? err.message : "Failed to load performance data.");
            } finally {
                setIsPerformanceLoading(false);
            }
        };
        fetchPerformanceData();
    }, [selectedCampaign, token, isComparing]);

    // --- Event Handlers ---
    const handleCampaignSelection = (campaignId: string) => {
        if (isComparing) {
            setComparisonIds(prev => {
                const newSet = new Set(prev);
                if (newSet.has(campaignId)) {
                    newSet.delete(campaignId);
                } else if (newSet.size < 2) {
                    newSet.add(campaignId);
                }
                return Array.from(newSet);
            });
        } else {
            const campaign = campaigns.find(c => c.id === campaignId) || null;
            setSelectedCampaign(campaign);
        }
    };

    const handleStartComparison = async () => {
        if (comparisonIds.length !== 2 || !token) return;
        setIsComparisonLoading(true);
        setComparisonData(null);
        try {
            const [data1, data2] = await Promise.all([
                getGoogleCampaignPerformance(token, comparisonIds[0]),
                getGoogleCampaignPerformance(token, comparisonIds[1])
            ]);
            const name1 = campaigns.find(c => c.id === comparisonIds[0])?.name || 'Campaign 1';
            const name2 = campaigns.find(c => c.id === comparisonIds[1])?.name || 'Campaign 2';
            setComparisonData({
                campaign1: data1.statistics,
                campaign2: data2.statistics,
                campaign1Name: name1,
                campaign2Name: name2,
            });
        } catch (err) {
            console.error("Failed to fetch comparison data:", err);
        } finally {
            setIsComparisonLoading(false);
        }
    };

    const handleGenerateSuggestion = async () => {
        if (!selectedCampaign || !token) return;
        setIsSuggestionModalOpen(true);
        setIsSuggestionLoading(true);
        setSuggestionError(null);
        setSuggestionData(null);
        try {
            const data = await getAiSuggestionForCampaign(token, selectedCampaign.id);
            setSuggestionData(data);
        } catch (err) {
            setSuggestionError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsSuggestionLoading(false);
        }
    };
    
    const toggleComparisonMode = () => {
        setIsComparing(!isComparing);
        setSelectedCampaign(null);
        setComparisonIds([]);
        setComparisonData(null);
    };

    // --- Render Logic ---
    const renderMainContent = () => {
        if (isComparing) {
            return (
                <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    {isComparisonLoading ? (
                         <div className="text-center p-10 h-[500px] flex items-center justify-center"><p>Loading comparison data...</p></div>
                    ) : (
                         <CampaignComparisonChart data={comparisonData} />
                    )}
                </section>
            );
        }
        return (
            <>
                <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                           🚀 {selectedCampaign ? `Trends: ${selectedCampaign.name}` : 'Select a Campaign'}
                        </h3>
                        {selectedCampaign && (
                            <button onClick={handleGenerateSuggestion} disabled={isSuggestionLoading} className="mt-3 sm:mt-0 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center">
                                Get AI Suggestion
                            </button>
                        )}
                    </div>
                    <TrendsChart data={performanceData?.trends || []} isLoading={isPerformanceLoading} error={performanceError}/>
                </section>
                <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <OverallStats data={performanceData?.statistics || null} title="Campaign Statistics" isLoading={isPerformanceLoading} />
                </section>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
            <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ad Insights Dashboard</h1>
                {/* --- MODIFIED: "Compare Selected" button is now here and "Back to Account" is removed --- */}
                <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                    <button 
                        onClick={toggleComparisonMode} 
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                            isComparing 
                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                    >
                        {isComparing ? 'Exit Comparison' : 'Compare Campaigns'}
                    </button>
                    {isComparing && (
                        <button 
                            onClick={handleStartComparison} 
                            disabled={comparisonIds.length !== 2 || isComparisonLoading} 
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isComparisonLoading ? 'Loading...' : `Compare ${comparisonIds.length}/2 Selected`}
                        </button>
                    )}
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <main className="lg:col-span-9 space-y-6">{renderMainContent()}</main>
                <aside className="lg:col-span-3">
                    <CampaignList
                        campaigns={campaigns}
                        onCampaignSelect={handleCampaignSelection}
                        isLoading={isLoadingCampaigns}
                        error={campaignsError}
                        isComparing={isComparing}
                        comparisonIds={comparisonIds}
                        selectedCampaignId={selectedCampaign?.id || null}
                    />
                    {/* --- MODIFIED: The button group has been removed from here --- */}
                </aside>
            </div>
            <SuggestionModal
                isOpen={isSuggestionModalOpen}
                onClose={() => setIsSuggestionModalOpen(false)}
                suggestionData={suggestionData}
                isLoading={isSuggestionLoading}
                error={suggestionError}
            />
        </div>
    );
}

