// D:\socialadify\frontend\src\app\caption-history\page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    fetchUserCaptionHistory,
    updateSavedCaptionInDB,
    deleteSavedCaptionFromDB,
    SavedCaption,
    CaptionUpdateData
} from '@/services/captionService';
import Link from 'next/link';

// Icons
const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> );
const DeleteIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> );
const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> );
const CancelIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> );
const LoadingSpinner = ({ className = "animate-spin h-5 w-5 text-slate-100" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const ClockIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const TagIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => ( 
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg> 
);
const PlusCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const ITEMS_PER_PAGE = 10;

export default function CaptionHistoryPage() {
    const { token, logout, isAuthReady, isAuthenticated } = useAuth();
    const [captions, setCaptions] = useState<SavedCaption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0); 
    const [totalCaptions, setTotalCaptions] = useState(0); 

    const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");

    const fetchCaptions = useCallback(async (page: number) => {
        if (!token) {
            setError("Authentication required.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true); setError(null);
        try {
            const data = await fetchUserCaptionHistory(token, page * ITEMS_PER_PAGE, ITEMS_PER_PAGE);
            setCaptions(data);
            if (data.length > 0 && page === 0) { 
                setTotalCaptions(data.length < ITEMS_PER_PAGE ? (page * ITEMS_PER_PAGE) + data.length : (page + 2) * ITEMS_PER_PAGE);
            } else if (data.length === 0 && page > 0) { 
                setTotalCaptions(page * ITEMS_PER_PAGE);
            } else if (data.length === 0 && page === 0) {
                setTotalCaptions(0); // No captions at all
            }


        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load caption history.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) logout();
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        if (isAuthReady && isAuthenticated) {
            fetchCaptions(currentPage);
        } else if (isAuthReady && !isAuthenticated) {
            setError("Please log in to view caption history.");
            setIsLoading(false);
        }
    }, [isAuthReady, isAuthenticated, fetchCaptions, currentPage]);

    const handleEdit = (caption: SavedCaption) => {
        setEditingCaptionId(caption.id);
        setEditingText(caption.caption_text);
    };

    const handleCancelEdit = () => {
        setEditingCaptionId(null);
        setEditingText("");
    };

    const handleSaveUpdate = async () => {
        if (!token || !editingCaptionId) return;
        setIsLoading(true); 
        try {
            const updateData: CaptionUpdateData = { caption_text: editingText };
            const updatedCaption = await updateSavedCaptionInDB(token, editingCaptionId, updateData);
            setCaptions(prev => prev.map(c => c.id === editingCaptionId ? updatedCaption : c));
            setEditingCaptionId(null);
            setEditingText("");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update caption.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) logout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (captionId: string) => {
        if (!window.confirm("Are you sure you want to delete this caption? This action cannot be undone.")) return;
        
        if (!token) return;
        setIsLoading(true); 
        try {
            await deleteSavedCaptionFromDB(token, captionId);
            setCaptions(prev => prev.filter(c => c.id !== captionId));
            if (captions.length === 1 && currentPage > 0) {
                setCurrentPage(prev => prev -1); 
            } else {
                fetchCaptions(currentPage); 
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete caption.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) logout();
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (!isAuthReady) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><LoadingSpinner className="w-10 h-10 text-sky-400"/></div>;
    }
    if (!isAuthenticated && isAuthReady) {
         return <div className="text-center py-10 text-slate-400">Please <Link href="/login" className="text-sky-400 hover:underline">log in</Link> to view your caption history.</div>;
    }


    return (
        <div className="space-y-8">
            <header className="text-left flex justify-between items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
                        My Saved Captions
                    </h1>
                    <p className="mt-2 text-md text-slate-400">
                        Review, edit, or delete your previously generated and saved captions.
                    </p>
                </div>
                <Link 
                    href="/caption-generator"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    Generate New Captions
                </Link>
            </header>

            {isLoading && captions.length === 0 && (
                <div className="flex justify-center items-center py-20">
                    <LoadingSpinner className="w-12 h-12 text-sky-400"/>
                </div>
            )}
            {error && (
                <div className="bg-red-800/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            {!isLoading && !error && captions.length === 0 && (
                <div className="text-center py-10 bg-slate-800/50 rounded-xl shadow-lg">
                    <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-300">No Saved Captions Yet</h3>
                    <p className="mt-1 text-sm text-slate-400">Start by generating some captions and saving your favorites!</p>
                    {/* The button below is now part of the header */}
                </div>
            )}

            {!isLoading && captions.length > 0 && (
                <div className="space-y-6">
                    {captions.map(caption => (
                        <div key={caption.id} className="bg-slate-800/70 backdrop-blur-md shadow-xl rounded-xl p-5 border border-slate-700">
                            {editingCaptionId === caption.id ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        className="w-full p-3 text-sm border border-sky-500 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-sky-400 outline-none min-h-[100px]"
                                        rows={4}
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={handleCancelEdit} className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:opacity-50" disabled={isLoading}>
                                            <CancelIcon className="inline mr-1 w-3 h-3"/>Cancel
                                        </button>
                                        <button onClick={handleSaveUpdate} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors disabled:opacity-50 flex items-center" disabled={isLoading}>
                                            {isLoading && editingCaptionId === caption.id ? <LoadingSpinner className="w-3 h-3 mr-1.5"/> : <SaveIcon className="inline mr-1 w-3 h-3"/>}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed mb-3">{caption.caption_text}</p>
                                    <div className="text-xs text-slate-500 space-y-1 mb-3 pt-2 border-t border-slate-700">
                                        <div className="flex items-center gap-1.5"><ClockIcon/> Saved: {formatDate(caption.created_at)} {caption.is_edited && `(Edited: ${formatDate(caption.updated_at)})`}</div>
                                        {caption.preferences_category && <div className="flex items-center gap-1.5"><TagIcon/> Category: {caption.preferences_category}</div>}
                                        {caption.preferences_tone && <div className="flex items-center gap-1.5"><TagIcon/> Tone: {caption.preferences_tone}</div>}
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => handleEdit(caption)} className="p-1.5 text-slate-400 hover:text-sky-400 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50" disabled={isLoading} title="Edit Caption">
                                            <EditIcon className="w-4 h-4"/>
                                        </button>
                                        <button onClick={() => handleDelete(caption.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50" disabled={isLoading} title="Delete Caption">
                                            <DeleteIcon className="w-4 h-4"/>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-4">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0 || isLoading}
                            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-400">Page {currentPage + 1}</span>
                        <button 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={captions.length < ITEMS_PER_PAGE || isLoading || (currentPage + 1) * ITEMS_PER_PAGE >= totalCaptions}
                            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
