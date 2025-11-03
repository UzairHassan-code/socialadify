// D:/socialadify/frontend/src/components/AdDashboard.tsx
'use client';

import React from 'react';
import { AdCreativePublic } from '@/services/adCreatorService';

// --- Icons ---
const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> );
const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.927a2.25 2.25 0 01-2.244-2.077L5.09 5.93c-.3-.058-.6-.117-.9-.176M4.5 5.25a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0112 5.25m-3 0h3.75" /></svg> );
const LoadingSpinner = ({ className = "animate-spin h-5 w-5 text-white" }: {className?: string}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const PublishIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" /></svg> );

interface AdDashboardProps {
    ads: AdCreativePublic[];
    isLoading: boolean;
    isPublishing: string | null;
    onGoToCreate: () => void;
    onDelete: (adId: string) => void;
    onPublish: (ad: AdCreativePublic) => void;
    cardClass: string;
}

export const AdDashboard: React.FC<AdDashboardProps> = ({
    ads,
    isLoading,
    isPublishing,
    onGoToCreate,
    onDelete,
    onPublish,
    cardClass
}) => {

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
            case 'PUBLISHED':
                return 'text-green-400 border-green-400/50 bg-green-400/10';
            case 'PUBLISHING':
                return 'text-sky-400 border-sky-400/50 bg-sky-400/10';
            case 'FAILED':
                return 'text-red-400 border-red-400/50 bg-red-400/10';
            default:
                return 'text-slate-400 border-slate-400/50 bg-slate-400/10';
        }
    };

    return (
        <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Your Ad Creatives</h2>
                <button
                    onClick={onGoToCreate}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-colors bg-sky-600 hover:bg-sky-500 text-white"
                >
                    <PlusIcon /> Create New Ad
                </button>
            </div>
            {isLoading ? (
                <div className="text-center py-10">
                    <LoadingSpinner className="h-8 w-8 text-sky-400 mx-auto" />
                    <p className="mt-4 text-slate-400">Loading your ad creatives...</p>
                </div>
            ) : ads.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg">
                    <p className="text-slate-400">You haven't created any ad creatives yet.</p>
                    <button
                        onClick={onGoToCreate}
                        className="mt-4 text-sm font-semibold text-sky-400 hover:text-sky-300"
                    >
                        + Create your first ad
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {ads.map(ad => (
                        <div key={ad.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <p className="text-lg font-semibold text-slate-100">{ad.campaign_name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusChip(ad.status)}`}>
                                        {ad.status}
                                    </span>
                                    <span className="text-sm text-slate-400">
                                        Platform: <span className="font-medium text-slate-300">{ad.platform}</span>
                                    </span>
                                </div>
                                {ad.status === 'FAILED' && ad.error_message && (
                                    <p className="text-xs text-red-400 mt-1.5">{ad.error_message}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onDelete(ad.id)}
                                    className="p-2 text-red-400 hover:bg-slate-600 rounded-md"
                                    title="Delete Draft"
                                >
                                    <TrashIcon />
                                </button>
                                {ad.status === 'DRAFT' && ad.platform === 'GOOGLE' && (
                                    <button
                                        onClick={() => onPublish(ad)}
                                        disabled={isPublishing === ad.id}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-colors bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                                        title="Publish to Google Ads (Test Account)"
                                    >
                                        {isPublishing === ad.id ? <LoadingSpinner className="w-4 h-4" /> : <PublishIcon />}
                                        {isPublishing === ad.id ? 'Publishing...' : 'Publish'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
