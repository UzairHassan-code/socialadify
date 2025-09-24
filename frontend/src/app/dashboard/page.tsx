// D:\socialadify\frontend\src\app\dashboard\page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import OverallStats from '../../components/OverallStats';
import TrendsChart from '../../components/TrendsChart';
import CampaignList from '../../components/CampaignList';
import { useAuth } from '../../context/AuthContext';
import { getGoogleCampaigns, GoogleCampaign } from '../../services/insightsService';
import Link from 'next/link';

// --- UNIFIED DATA STRUCTURE ---
// This allows our components to handle data from any source (Meta, Google, etc.)
export interface UnifiedCampaign {
    id: string;
    name: string;
    status: string;
    platform: 'Google';
    // Metrics
    clicks: number;
    impressions: number;
    ctr: number;
    cost: number;
    cpc: number;
}

export default function DashboardPage() {
    const { user, token, isAuthReady } = useAuth();

    // State for unified campaign data
    const [campaigns, setCampaigns] = useState<UnifiedCampaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<UnifiedCampaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !user) {
                if(isAuthReady) setError("Please log in to view data.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                // If a Google account is connected, fetch Google data.
                if (user.google_ad_account_id) {
                    console.log("Fetching Google Ads campaigns...");
                    const response = await getGoogleCampaigns(token);
                    // Map Google data to our unified structure
                    const unifiedData = response.campaigns.map((c: GoogleCampaign): UnifiedCampaign => ({
                        id: c.id,
                        name: c.name,
                        status: c.status,
                        platform: 'Google',
                        clicks: Number(c.clicks),
                        impressions: Number(c.impressions),
                        ctr: Number(c.ctr) * 100, // Convert to percentage
                        cost: Number(c.cost),
                        cpc: Number(c.average_cpc),
                    }));
                    setCampaigns(unifiedData);
                } else {
                    // If no account is connected, show an informative message.
                    setCampaigns([]);
                    setError("No ad account connected. Please connect your Google Ads account in the settings to see your campaigns.");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred while fetching campaigns.");
                setCampaigns([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthReady) {
            fetchData();
        }
    }, [user, token, isAuthReady]);

    const handleCampaignSelection = (campaignId: string) => {
        const campaign = campaigns.find(c => c.id === campaignId) || null;
        setSelectedCampaign(campaign);
    };

    // NOTE: The child components (OverallStats, CampaignList) will need to be updated
    // to accept the new `UnifiedCampaign` data structure.

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4 md:p-6 lg:p-8">
            <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ad Insights Dashboard</h1>
                <Link href="/account" className="mt-2 sm:mt-0 px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300">
                    &larr; Back to Account
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <main className="lg:col-span-9 space-y-6">
                    <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {selectedCampaign ? `Performance Trends for: ${selectedCampaign.name}` : 'Overall Performance Trends'}
                        </h3>
                        <TrendsChart identifier={selectedCampaign?.id || null} type={selectedCampaign ? 'campaign' : 'overall'} token={token} />
                    </section>

                    <section className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                         <OverallStats data={selectedCampaign} title="Campaign Statistics" isLoading={isLoading && !!selectedCampaign} />
                    </section>
                </main>

                <aside className="lg:col-span-3">
                    <CampaignList
                        campaigns={campaigns}
                        selectedCampaignId={selectedCampaign?.id || null}
                        onCampaignSelect={handleCampaignSelection}
                        isLoading={isLoading}
                        error={error}
                    />
                </aside>
            </div>
        </div>
    );
}
