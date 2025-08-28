// D:/socialadify/frontend/src/components/MetaIntegration.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveMetaPageDetails } from '../services/authService';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

// --- (Icons and other components remain the same) ---
const FacebookIcon = ({ className = "w-5 h-5" }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V21.878A10.003 10.003 0 0022 12z" /></svg> );
const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const LoadingSpinner = () => ( <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

interface FacebookPage {
    id: string;
    name: string;
    access_token: string;
}

export const MetaIntegration = () => {
    const { user, token, fetchAndUpdateUser } = useAuth();
    const [sdkLoaded, setSdkLoaded] = useState(false);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [selectedPage, setSelectedPage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const isMetaConnected = !!user?.meta_page_id;
    const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1709794616385500';

    useEffect(() => {
        if (window.FB) {
            setSdkLoaded(true);
            return;
        }
        window.fbAsyncInit = function () {
            window.FB.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: true, version: 'v18.0' });
            setSdkLoaded(true);
        };
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement(s) as HTMLScriptElement; js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            if(fjs && fjs.parentNode) { fjs.parentNode.insertBefore(js, fjs); }
        }(document, 'script', 'facebook-jssdk'));
    }, [FACEBOOK_APP_ID]);

    const fetchPages = useCallback(() => {
        window.FB.api('/me/accounts', { fields: 'name,id,access_token' }, function(response: any) {
            if (response && !response.error) {
                setPages(response.data || []);
                setSuccessMessage("Facebook account connected! Please select your Page.");
            } else {
                setError("Could not fetch your Facebook Pages.");
            }
        });
    }, []);

    const handleFacebookLogin = () => {
        if (!sdkLoaded) return;
        setError(null);
        setSuccessMessage(null);
        window.FB.login(function (response: any) {
            if (response.authResponse) {
                fetchPages();
            } else {
                setError('User cancelled login or did not fully authorize.');
            }
        }, { scope: 'pages_show_list,pages_manage_posts,ads_management', return_scopes: true });
    };

    const handleSavePage = async () => {
        if (!selectedPage || !token) {
            setError("Please select a page to continue.");
            return;
        }
        const selectedPageData = pages.find(p => p.id === selectedPage);
        if (!selectedPageData) {
            setError("Selected page data not found.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);
        try {
            await saveMetaPageDetails(token, selectedPageData.id, selectedPageData.access_token);
            await fetchAndUpdateUser();
            setSuccessMessage("Meta Page saved successfully!");
            setPages([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save the selected page.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-slate-800/60 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Meta (Facebook & Instagram)</h3>
                {isMetaConnected && ( <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-900/50 px-2 py-1 rounded-full"><CheckCircleIcon className="w-4 h-4" /> Connected</span> )}
            </div>

            {pages.length > 0 && !isMetaConnected && (
                <div className="space-y-4 mb-6">
                    <p className="text-sm text-slate-300">Please select the Facebook Page you want to use with SocialAdify.</p>
                    <select value={selectedPage} onChange={(e) => setSelectedPage(e.target.value)} className="w-full p-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm">
                        <option value="" disabled>-- Select a Page --</option>
                        {pages.map(page => (<option key={page.id} value={page.id}>{page.name}</option>))}
                    </select>
                    <button onClick={handleSavePage} disabled={isSaving || !selectedPage} className="w-full flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-70">
                        {isSaving ? 'Saving...' : 'Save and Continue'}
                    </button>
                </div>
            )}

            {!isMetaConnected && pages.length === 0 && (
                <button onClick={handleFacebookLogin} disabled={!sdkLoaded} className="w-full flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70">
                    <FacebookIcon className="w-5 h-5 mr-2" />
                    {sdkLoaded ? 'Connect Facebook Account' : 'Loading SDK...'}
                </button>
            )}
            
            {isMetaConnected && (
                 <button onClick={handleFacebookLogin} disabled={!sdkLoaded} className="w-full flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70">
                    <FacebookIcon className="w-5 h-5 mr-2" />
                    {sdkLoaded ? 'Reconnect with a different Page' : 'Loading SDK...'}
                </button>
            )}
            
            {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
            {successMessage && <p className="text-sm text-green-400 mt-4">{successMessage}</p>}
        </div>
    );
};
