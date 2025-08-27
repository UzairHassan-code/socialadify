// D:\socialadify\frontend\src\app\history\page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useImageContext } from '@/context/ImageContext';
import { useRouter } from 'next/navigation';
import { fetchHistory, deleteVisualPost, HistoryItem, PostHistoryItem, CaptionHistoryItem } from '../../services/historyService';
import { updateSavedCaptionInDB, deleteSavedCaptionFromDB } from '@/services/captionService';
import Link from 'next/link';
import Image from 'next/image';

// --- (Icon Components remain the same) ---
const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> );
const DeleteIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> );
const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> );
const CancelIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> );
const LoadingSpinner = ({ className = "animate-spin h-5 w-5 text-slate-100" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const ClockIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const TagIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg> );
const CaptionIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-6.75 3h9m-9 3h9M3.375 3h17.25c1.034 0 1.875.841 1.875 1.875v17.25c0 1.034-.841 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 22.125V4.875C1.5 3.841 2.341 3 3.375 3z" /></svg> );

const API_BASE_URL_STATIC = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const CaptionHistoryCard: React.FC<{
    caption: CaptionHistoryItem;
    onEdit: (caption: CaptionHistoryItem) => void;
    onDelete: (id: string) => void;
    isEditing: boolean;
    editingText: string;
    onEditingTextChange: (text: string) => void;
    onSaveUpdate: () => void;
    onCancelEdit: () => void;
    isLoading: boolean;
}> = ({ caption, onEdit, onDelete, isEditing, editingText, onEditingTextChange, onSaveUpdate, onCancelEdit, isLoading }) => {
    return (
        <div className="bg-slate-800/70 backdrop-blur-md shadow-xl rounded-xl p-5 border border-slate-700">
            {isEditing ? (
                <div className="space-y-3">
                    <textarea value={editingText} onChange={(e) => onEditingTextChange(e.target.value)} className="w-full p-3 text-sm border border-sky-500 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-sky-400 outline-none min-h-[100px]" rows={4} />
                    <div className="flex justify-end space-x-2">
                        <button onClick={onCancelEdit} className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md" disabled={isLoading}><CancelIcon className="inline mr-1 w-3 h-3"/>Cancel</button>
                        <button onClick={onSaveUpdate} className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-md flex items-center" disabled={isLoading}>{isLoading ? <LoadingSpinner className="w-3 h-3 mr-1.5"/> : <SaveIcon className="inline mr-1 w-3 h-3"/>} Save</button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed mb-3">{caption.caption}</p>
                    <div className="text-xs text-slate-500 space-y-1 mb-3 pt-2 border-t border-slate-700">
                        <div className="flex items-center gap-1.5"><ClockIcon/> Saved: {formatDate(caption.created_at)}</div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => onEdit(caption)} className="p-1.5 text-slate-400 hover:text-sky-400 rounded-md hover:bg-slate-700" disabled={isLoading} title="Edit Caption"><EditIcon /></button>
                        <button onClick={() => onDelete(caption.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-700" disabled={isLoading} title="Delete Caption"><DeleteIcon /></button>
                    </div>
                </>
            )}
        </div>
    );
};

const PostHistoryCard: React.FC<{ post: PostHistoryItem; onDelete: (id: string) => void; onCreateCaption: (post: PostHistoryItem) => void; isLoading: boolean; }> = ({ post, onDelete, onCreateCaption, isLoading }) => {
    return (
        <div className="bg-slate-800/70 backdrop-blur-md shadow-xl rounded-xl p-5 border border-slate-700 flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-40 h-40 flex-shrink-0 relative rounded-lg overflow-hidden bg-slate-700">
                <Image 
                    src={`${API_BASE_URL_STATIC}${post.image_url}`} 
                    alt="Generated ad" 
                    fill 
                    sizes="(max-width: 640px) 100vw, 10rem"
                    priority={true}
                    className="object-cover"
                />
            </div>
            <div className="flex-grow flex flex-col">
                <p className="text-sm font-semibold text-slate-200 mb-2">Visual Post</p>
                <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-700 mt-auto">
                    <div className="flex items-center gap-1.5"><ClockIcon/> Saved: {formatDate(post.created_at)}</div>
                </div>
            </div>
            <div className="flex flex-col gap-2 items-center">
                <button onClick={() => onCreateCaption(post)} className="p-1.5 text-slate-400 hover:text-teal-400 rounded-md hover:bg-slate-700" disabled={isLoading} title="Create Caption for this Post">
                    <CaptionIcon />
                </button>
                <button onClick={() => onDelete(post.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-700" disabled={isLoading} title="Delete Post">
                    <DeleteIcon />
                </button>
            </div>
        </div>
    );
};


export default function HistoryPage() {
    const { token, logout, isAuthReady, isAuthenticated } = useAuth();
    const { setSharedImage } = useImageContext();
    const router = useRouter();

    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState("");

    const loadHistory = useCallback(async () => {
        if (!token) {
            setError("Authentication required.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchHistory(token);
            setHistoryItems(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load history.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) logout();
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        if (isAuthReady && isAuthenticated) {
            loadHistory();
        } else if (isAuthReady && !isAuthenticated) {
            setError("Please log in to view your history.");
            setIsLoading(false);
        }
    }, [isAuthReady, isAuthenticated, loadHistory]);

    const handleEditCaption = (caption: CaptionHistoryItem) => { setEditingCaptionId(caption.id); setEditingText(caption.caption); };
    const handleCancelEdit = () => { setEditingCaptionId(null); setEditingText(""); };
    const handleSaveUpdate = async () => {
        if (!token || !editingCaptionId) return;
        setIsLoading(true);
        try {
            await updateSavedCaptionInDB(token, editingCaptionId, { caption_text: editingText });
            setEditingCaptionId(null); setEditingText("");
            await loadHistory();
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to update caption."); } 
        finally { setIsLoading(false); }
    };
    const handleDeleteCaption = async (captionId: string) => {
        if (!window.confirm("Are you sure you want to delete this caption?")) return;
        if (!token) return;
        setIsLoading(true);
        try {
            await deleteSavedCaptionFromDB(token, captionId);
            await loadHistory();
        } catch (err) { setError(err instanceof Error ? err.message : "Failed to delete caption."); } 
        finally { setIsLoading(false); }
    };

    const handleDeletePost = async (postId: string) => {
        if (!window.confirm("Are you sure you want to delete this visual post?")) return;
        if (!token) return;
        setIsLoading(true);
        try {
            await deleteVisualPost(token, postId);
            await loadHistory();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete visual post.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCaptionFromHistory = async (post: PostHistoryItem) => {
        try {
            const response = await fetch(`${API_BASE_URL_STATIC}${post.image_url}`);
            const blob = await response.blob();
            const file = new File([blob], "saved-post.png", { type: blob.type });
            
            setSharedImage(file);
            router.push('/caption-generator');
        } catch (err) {
            setError("Failed to load image for captioning.");
        }
    };

    if (!isAuthReady) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><LoadingSpinner className="w-10 h-10 text-sky-400"/></div>;
    }

    const savedPosts = historyItems.filter((item): item is PostHistoryItem => item.item_type === 'post');
    const savedCaptions = historyItems.filter((item): item is CaptionHistoryItem => item.item_type === 'caption');

    return (
        <div className="space-y-8">
            <header className="text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">Content History</h1>
                <p className="mt-2 text-md text-slate-400">Review, edit, or delete your previously generated content.</p>
            </header>

            {isLoading && historyItems.length === 0 && (
                <div className="flex justify-center items-center py-20"><LoadingSpinner className="w-12 h-12 text-sky-400"/></div>
            )}
            {error && (
                <div className="bg-red-800/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}
            {!isLoading && !error && historyItems.length === 0 && (
                <div className="text-center py-10 bg-slate-800/50 rounded-xl shadow-lg">
                    <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-300">No Saved Content Yet</h3>
                    <p className="mt-1 text-sm text-slate-400">Start by generating some captions or visual posts!</p>
                </div>
            )}

            {!isLoading && historyItems.length > 0 && (
                <div className="space-y-12">
                    {savedPosts.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-200 mb-6 border-b border-slate-700 pb-3">Saved Visual Posts</h2>
                            <div className="space-y-6">
                                {savedPosts.map(item => (
                                    <PostHistoryCard 
                                        key={`post-${item.id}`} 
                                        post={item} 
                                        onDelete={handleDeletePost} 
                                        onCreateCaption={handleCreateCaptionFromHistory}
                                        isLoading={isLoading} 
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                    {savedCaptions.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-200 mb-6 border-b border-slate-700 pb-3">Saved Captions</h2>
                            <div className="space-y-6">
                                {savedCaptions.map(item => (
                                    <CaptionHistoryCard
                                        key={`caption-${item.id}`}
                                        caption={item}
                                        onEdit={handleEditCaption}
                                        onDelete={handleDeleteCaption}
                                        isEditing={editingCaptionId === item.id}
                                        editingText={editingText}
                                        onEditingTextChange={setEditingText}
                                        onSaveUpdate={handleSaveUpdate}
                                        onCancelEdit={handleCancelEdit}
                                        isLoading={isLoading}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
