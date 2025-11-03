// D:/socialadify/frontend/src/app/ad-creator/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    fetchAdCreatives,
    deleteAdCreative,
    publishAdToGoogle,
    AdCreativePublic
} from '@/services/adCreatorService';

// Import the new components using the @ alias from your main components folder
import { AdDashboard } from '@/components/AdDashboard';
import { AdCreatorForm } from '@/components/AdCreatorForm';

// --- Icons ---
const HomeIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125A2.25 2.25 0 0021 18.75V9.75M8.25 21h7.5" /></svg> );
const LoadingSpinner = ({ className = "animate-spin h-5 w-5 text-white" }: {className?: string}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

type PageState = 'dashboard' | 'creating';

export default function AdCreatorPage() {
    const { token, logout, isAuthReady } = useAuth();
    
    const [pageState, setPageState] = useState<PageState>('dashboard');
    const [ads, setAds] = useState<AdCreativePublic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState<string | null>(null); // Stores ID of ad

    const cardClass = "bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700/80";

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!isAuthReady) return;
        if (!token) {
            logout();
            return;
        }

        const loadAds = async () => {
            setIsLoading(true);
            try {
                const fetchedAds = await fetchAdCreatives(token);
                setAds(fetchedAds);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load ad drafts.");
            } finally {
                setIsLoading(false);
            }
        };
        loadAds();
    }, [isAuthReady, token, logout]);

    // --- Event Handlers (passed down to children) ---

    const handleDraftSaved = (newAd: AdCreativePublic) => {
        setAds([newAd, ...ads]); // Add new ad to the top of the list
        setPageState('dashboard'); // Switch back to the dashboard view
    };

    const handleDelete = async (adId: string) => {
        if (!token || !window.confirm("Are you sure you want to delete this draft?")) return;
        
        try {
            await deleteAdCreative(token, adId);
            setAds(ads.filter(ad => ad.id !== adId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete ad.");
        }
    };
    
    const handlePublish = async (ad: AdCreativePublic) => {
        if (!token || !window.confirm(`This will publish the ad "${ad.campaign_name}" to your Google Ads test account. Continue?`)) return;

        setIsPublishing(ad.id);
        setError(null);

        try {
            const publishedAd = await publishAdToGoogle(token, ad.id);
            // Update the ad in the list with its new status
            setAds(ads.map(a => a.id === publishedAd.id ? publishedAd : a));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to publish ad.";
            setError(errorMsg);
            // Update ad with error status from backend if it exists
            const failedAd = ads.find(a => a.id === ad.id);
            if (failedAd) {
                setAds(ads.map(a => a.id === ad.id ? { ...a, status: 'FAILED', error_message: errorMsg } : a));
            }
        } finally {
            setIsPublishing(null);
        }
    };

    // --- Main Page Render ---
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="text-center mb-10">
                <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
                    <Link href="/home" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1.5">
                        <HomeIcon /> Back to Hub
                    </Link>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-300 via-sky-400 to-blue-400 bg-clip-text text-transparent pb-2">
                    AI Ad Placement
                </h1>
                <p className="mt-3 text-md text-slate-400 max-w-2xl mx-auto">
                    Create, target, and publish your ads to Google and Meta, all in one place.
                </p>
            </header>

            <div className="max-w-6xl mx-auto">
                {error && (
                    <div className={`${cardClass} mb-6 text-center`}>
                        <h3 className="text-lg font-semibold text-red-400">An Error Occurred</h3>
                        <p className="mt-2 text-sm text-slate-400 bg-slate-700/50 p-3 rounded-md">{error}</p>
                        <button onClick={() => setError(null)} className="mt-4 px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-500 rounded-md">
                            Dismiss
                        </button>
                    </div>
                )}

                {pageState === 'dashboard' ? (
                    <AdDashboard
                        ads={ads}
                        isLoading={isLoading}
                        isPublishing={isPublishing}
                        onGoToCreate={() => setPageState('creating')}
                        onDelete={handleDelete}
                        onPublish={handlePublish}
                        cardClass={cardClass} // Pass down styles
                    />
                ) : (
                    <AdCreatorForm
                        token={token}
                        onDraftSaved={handleDraftSaved}
                        onCancel={() => setPageState('dashboard')}
                        cardClass={cardClass} // Pass down styles
                    />
                )}
            </div>
        </div>
    );
}

