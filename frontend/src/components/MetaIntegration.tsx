// D:\socialadify\frontend\src\components\MetaIntegration.tsx
'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiSaveMetaCredentials, MetaCredentialsPayload } from '@/services/authService';

// --- Icon Components ---
const LoadingSpinner = () => ( <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );

export const MetaIntegration = () => {
    const { user, token, fetchAndUpdateUser } = useAuth();
    const [adAccountId, setAdAccountId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Pre-fill the form if the user has already connected their account
    useEffect(() => {
        if (user?.meta_ad_account_id) {
            setAdAccountId(user.meta_ad_account_id);
        }
    }, [user]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!token) {
            setError("Authentication error. Please log in again.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        const payload: MetaCredentialsPayload = {
            meta_ad_account_id: adAccountId,
            meta_access_token: accessToken,
        };

        try {
            await apiSaveMetaCredentials(token, payload);
            setSuccessMessage("Meta account connected successfully!");
            await fetchAndUpdateUser(); // Refresh user data to show the connected state
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to connect Meta account.");
        } finally {
            setIsLoading(false);
        }
    };

    const isAlreadyConnected = !!user?.meta_ad_account_id;

    return (
        <div className="bg-slate-800/60 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Meta Ads Integration</h3>
                {isAlreadyConnected && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-900/50 px-2 py-1 rounded-full">
                        <CheckCircleIcon className="w-4 h-4" />
                        Connected
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-400 mb-6">
                {isAlreadyConnected 
                    ? "Your Meta Ad Account is connected. To change accounts, enter a new Access Token and Ad Account ID below." 
                    : "Connect your Meta account to pull in your ad campaign data from the Meta Sandbox."
                }
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="adAccountId" className="block text-xs font-medium text-slate-300 mb-1.5">Ad Account ID</label>
                    <input
                        type="text"
                        id="adAccountId"
                        value={adAccountId}
                        onChange={(e) => setAdAccountId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-100"
                        placeholder="e.g., act_123456789"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="accessToken" className="block text-xs font-medium text-slate-300 mb-1.5">User Access Token</label>
                    <input
                        type="password"
                        id="accessToken"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-100"
                        placeholder="Paste your token here"
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}
                {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md transition-colors bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-70"
                    >
                        {isLoading ? <LoadingSpinner /> : (isAlreadyConnected ? 'Update Connection' : 'Connect Account')}
                    </button>
                </div>
            </form>
        </div>
    );
};
