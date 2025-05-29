// D:\socialadify\frontend\src\app\scheduler\page.tsx
'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
    createScheduledPost,
    fetchScheduledPosts,
    deleteScheduledPost,
    ScheduledPost,
} from '@/services/schedulerService';
import Link from 'next/link';
import EditScheduledPostModal from '../../components/EditScheduledPostModal';

// --- NEW: Placeholder for DeletePostConfirmationModal ---
// You will need to create this component in a file like:
// D:\socialadify\frontend\src\components\DeletePostConfirmationModal.tsx
// This modal should accept `isOpen`, `onClose`, `onConfirm`, and `post` props.
interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    post: ScheduledPost | null; // Pass the post to display its details in the modal
}

const DeletePostConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, post }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full text-center border border-slate-700">
                <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Deletion</h3>
                <p className="text-slate-300 mb-6">
                    Are you sure you want to delete the post scheduled for:
                    <br />
                    <span className="font-semibold text-orange-300">
                        {post ? new Date(post.scheduled_at).toLocaleString() : 'this post'}
                    </span>
                    ? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- END NEW: Placeholder for DeletePostConfirmationModal ---


// --- Icons (kept local as per user request) ---
const UploadIcon = ({ className = "w-10 h-10 text-slate-500 group-hover:text-orange-400 transition-colors" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg> );
const CalendarDaysIcon = ({ className = "w-5 h-5"}: { className?: string}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" /></svg> );
const LoadingSpinner = ({ className = "animate-spin h-5 w-5 text-white" }: {className?: string}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> );
const DeleteIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> );
const SparklesIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75M17 13.75L15.75 12M17 13.75L18.25 15M15.75 12L17 10.25" /></svg> );

// AppLogo and UserCircleIcon definitions (re-added for this page's local header)
const AppLogo = ({ className = "w-10 h-10 text-white" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 6C9.14344 6 6.79378 7.65981 5.64006 9.99995H8.04005C8.82681 8.78081 10.2993 8 12 8C13.7007 8 15.1732 8.78081 15.9599 9.99995H18.3599C17.2062 7.65981 14.8566 6 12 6ZM12 16C10.2993 16 8.82681 15.2191 8.04005 14H5.64006C6.79378 16.3401 9.14344 18 12 18C14.8566 18 17.2062 16.3401 18.3599 14H15.9599C15.1732 15.2191 13.7007 16 12 16ZM5 12C5 11.7181 5.01793 11.4402 5.05279 11.1667H18.9472C18.9821 11.4402 19 11.7181 19 12C19 12.2819 18.9821 12.5597 18.9472 12.8333H5.05279C5.01793 12.5597 5 12.2819 5 12Z"/>
    </svg>
);
const UserCircleIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
// --- End Icons ---

const API_BASE_URL_STATIC = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';


export default function SchedulerPage() {
    const { token, logout, isAuthReady, isAuthenticated, user } = useAuth();

    const [caption, setCaption] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [scheduledDateTime, setScheduledDateTime] = useState('');
    const [targetPlatform, setTargetPlatform] = useState('');

    const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingPosts, setIsFetchingPosts] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
    const [profileImageError, setProfileImageError] = useState(false); // State for profile image error

    // State for Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditingPost, setCurrentEditingPost] = useState<ScheduledPost | null>(null);

    // --- NEW: State for Delete Confirmation Modal ---
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<ScheduledPost | null>(null);
    // --- END NEW State ---

    const [currentPage, setCurrentPage] = useState(0);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const ITEMS_PER_PAGE = 5;

    // Define the common pattern style for dark backgrounds
    // NOTE: This style is likely applied by the layout now, consider removing if redundant.
    const darkPatternStyle = {
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)',
        backgroundSize: '40px 40px',
    };

    const loadScheduledPosts = useCallback(async (page: number, reset: boolean = false) => {
        if (!token) {
            setIsFetchingPosts(false);
            return;
        }
        setIsFetchingPosts(true);
        setError(null);
        try {
            const posts = await fetchScheduledPosts(token, page * ITEMS_PER_PAGE, ITEMS_PER_PAGE);
            if (reset || page === 0) {
                setScheduledPosts(posts);
            } else {
                setScheduledPosts(prev => [...prev, ...posts]);
            }
            setHasMorePosts(posts.length === ITEMS_PER_PAGE);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load scheduled posts.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) {
                logout();
            }
        } finally {
            setIsFetchingPosts(false);
        }
    }, [token, logout]);

    useEffect(() => {
        if (isAuthReady && isAuthenticated) {
            loadScheduledPosts(0, true);
        } else if (isAuthReady && !isAuthenticated) {
            setError("Please log in to manage scheduled posts.");
            setIsFetchingPosts(false);
        }
    }, [isAuthReady, isAuthenticated, loadScheduledPosts]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError("Image size should not exceed 10MB.");
                setImageFile(null);
                setImagePreviewUrl(null);
                return;
            }
            if (!file.type.startsWith("image/")) {
                setError("Invalid file type. Please upload an image.");
                setImageFile(null);
                setImagePreviewUrl(null);
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreviewUrl(null);
        }
    };

    const handleSchedulePost = async (event: FormEvent) => {
        event.preventDefault();
        if (!token || !imageFile || !caption || !scheduledDateTime) {
            setError("Image, caption, and schedule date/time are required.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const isoDateTime = new Date(scheduledDateTime).toISOString();
            await createScheduledPost(token, caption, isoDateTime, imageFile, targetPlatform || undefined);
            setSuccessMessage("Post scheduled successfully!");
            setCaption('');
            setImageFile(null);
            setImagePreviewUrl(null);
            setScheduledDateTime('');
            setTargetPlatform('');
            setCurrentPage(0);
            loadScheduledPosts(0, true);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to schedule post.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- MODIFIED: handleDeletePost to open modal ---
    const handleDeletePost = async (postId: string) => {
        if (!token) {
            setError("Authentication error. Please log in again.");
            logout();
            return;
        }
        // Set the post to be deleted and open the confirmation modal
        setPostToDelete(scheduledPosts.find(p => p.id === postId) || null);
        setIsDeleteConfirmModalOpen(true);
    };

    // --- NEW: confirmDeletePost function for modal callback ---
    const confirmDeletePost = async () => {
        if (!postToDelete || !token) {
            return; // Should not happen if modal is opened correctly
        }

        setIsDeleteConfirmModalOpen(false); // Close the modal immediately
        setDeletingPostId(postToDelete.id); // Show loading state for the specific post
        setError(null);
        setSuccessMessage(null);

        try {
            await deleteScheduledPost(token, postToDelete.id);
            setSuccessMessage("Post deleted successfully!");
            setScheduledPosts(prevPosts => prevPosts.filter(p => p.id !== postToDelete.id));
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete post.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) {
                logout();
            }
        } finally {
            setDeletingPostId(null);
            setPostToDelete(null); // Clear the post to delete
        }
    };
    // --- END NEW function ---


    const handleOpenEditModal = (post: ScheduledPost) => {
        setCurrentEditingPost(post);
        setIsEditModalOpen(true);
    };

    const handlePostUpdated = (updatedPost: ScheduledPost) => {
        setScheduledPosts(prevPosts =>
            prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
        );
        setSuccessMessage("Post updated successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const inputBaseClass = "w-full px-4 py-2.5 text-sm border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition bg-slate-700/50 text-slate-100 placeholder-slate-400";
    const labelBaseClass = "block text-sm font-medium text-slate-300 mb-1.5 tracking-wide";
    const buttonPrimaryClass = "w-full flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white";
    const cardBaseClass = "bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700/80";

    if (!isAuthReady) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <LoadingSpinner className="w-10 h-10 text-orange-400"/>
            </div>
        );
    }
    if (!isAuthenticated && isAuthReady) {
        return (
            <div className="text-center py-10 text-slate-400">
                Please <Link href="/login" className="text-orange-400 hover:underline">log in</Link> to use the scheduler.
            </div>
        );
    }

    return (
        <>
            {/* REMOVED: Header / Navigation Bar (Local to this page) - This is now handled by the layout */}
            {/* REMOVED: Main content wrapper with background and pattern - This is now handled by the layout */}

            {/* Content inside the main background wrapper - This div becomes the new root of the page's content */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 pt-0"> {/* Adjusted pt-0 */}
                <div className="space-y-10">
                    <header className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent pb-2">Post Scheduler</h1>
                        <p className="mt-3 text-md text-slate-400 max-w-2xl mx-auto">Plan and automate your social media content. Upload an image, write your caption, and set the schedule.</p>
                    </header>
                    <section className={`${cardBaseClass} max-w-2xl mx-auto`}>
                        <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">Schedule a New Post</h2>
                        <form onSubmit={handleSchedulePost} className="space-y-6">
                            <div>
                                <label htmlFor="imageUploadScheduler" className={labelBaseClass}>Upload Image*</label>
                                <label htmlFor="imageUploadScheduler" className="mt-1 flex flex-col items-center justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-slate-600/80 border-dashed rounded-xl group hover:border-orange-500 transition-colors bg-slate-700/30 cursor-pointer">
                                    {imagePreviewUrl ? ( <div className="relative w-full h-full max-h-40"><Image src={imagePreviewUrl} alt="Selected preview" fill style={{objectFit: "contain"}} className="rounded-md" sizes="30vw" /></div>)
                                    : ( <div className="space-y-1 text-center"><UploadIcon className="w-8 h-8 text-slate-500 group-hover:text-orange-400 transition-colors"/><p className="text-xs text-slate-400 group-hover:text-orange-300">Click to upload or drag & drop</p><p className="text-xs text-slate-500">PNG, JPG, GIF, WEBP up to 10MB</p></div> )}
                                </label>
                                <input id="imageUploadScheduler" name="imageUploadScheduler" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" required />
                            </div>
                            <div>
                                <label htmlFor="caption" className={labelBaseClass}>Caption*</label>
                                <textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} className={`${inputBaseClass} min-h-[100px]`} placeholder="Write your engaging caption here..." rows={4} required />
                            </div>
                            <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="scheduledDateTime" className={`${labelBaseClass} mb-0`}>Schedule Date & Time*</label>
                                    <button type="button" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" title="Get AI suggestion for optimal posting time (Coming Soon)" disabled>
                                        <SparklesIcon className="w-3.5 h-3.5"/> Get AI Suggestion (Soon)
                                    </button>
                                </div>
                                <input type="datetime-local" id="scheduledDateTime" value={scheduledDateTime} onChange={(e) => setScheduledDateTime(e.target.value)} className={inputBaseClass} required min={new Date().toISOString().slice(0, 16)} />
                            </div>
                            <div>
                                <label htmlFor="targetPlatform" className={labelBaseClass}>Target Platform </label>
                                <select id="targetPlatform" value={targetPlatform} onChange={(e) => setTargetPlatform(e.target.value)} className={inputBaseClass}>
                                    <option value="" className="bg-slate-700">Select Platform </option>
                                    <option value="Instagram" className="bg-slate-700">Instagram</option>
                                    <option value="Facebook" className="bg-slate-700">Facebook</option>
                                </select>
                                <p className="mt-1 text-xs text-slate-500">Platform-specific posting will be enabled later.</p>
                            </div>
                            {error && <p className="mt-2 text-sm text-red-400 bg-red-900/30 p-3 rounded-md border border-red-700/50 text-center">{error}</p>}
                            {successMessage && <p className="mt-2 text-sm text-green-400 bg-green-900/30 p-3 rounded-md border border-green-700/50 text-center">{successMessage}</p>}
                            <div className="pt-2">
                                <button type="submit" disabled={isLoading} className={buttonPrimaryClass}>
                                    {isLoading && <LoadingSpinner className="mr-2 h-5 w-5"/>}
                                    {isLoading ? 'Scheduling...' : 'Schedule Post'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className={`${cardBaseClass} max-w-4xl mx-auto`}>
                        <h2 className="text-xl font-semibold text-slate-100 mb-6">Your Scheduled Posts</h2>
                        {isFetchingPosts && scheduledPosts.length === 0 && ( <div className="flex justify-center items-center py-10"><LoadingSpinner className="w-8 h-8 text-orange-400"/></div> )}
                        {!isFetchingPosts && error && scheduledPosts.length === 0 && ( <p className="text-center text-red-400 py-10">{error}</p> )}
                        {!isFetchingPosts && !error && scheduledPosts.length === 0 && ( <p className="text-center text-slate-400 py-10">You have no posts scheduled yet. Use the form above to add some!</p> )}

                        {scheduledPosts.length > 0 && (
                            <div className="space-y-4">
                                {scheduledPosts.map(post => (
                                    <div key={post.id} className="bg-slate-700/50 p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-start border border-slate-600/70">
                                        <div className="w-full h-40 sm:w-32 sm:h-32 flex-shrink-0 relative rounded-md overflow-hidden bg-slate-600">
                                            {post.image_url && post.image_url.trim() !== '' ? (
                                                <Image src={`${API_BASE_URL_STATIC}${post.image_url}`} alt="Scheduled post image" fill sizes="(max-width: 640px) 100vw, 128px" style={{objectFit: "cover"}} className="rounded-md" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/128x128/404040/808080?text=Load+Error';}}/>
                                            ) : ( <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div> )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="text-sm text-slate-300 whitespace-pre-wrap mb-2 leading-relaxed">{post.caption}</p>
                                            <div className="text-xs text-orange-300 flex items-center gap-1.5 mb-1"><CalendarDaysIcon className="w-4 h-4"/> Scheduled for: {formatDate(post.scheduled_at)}</div>
                                            {post.target_platform && <p className="text-xs text-slate-400">Platform: {post.target_platform}</p>}
                                            <p className="text-xs text-slate-500">Status: <span className="font-medium text-slate-400">{post.status}</span></p>
                                        </div>
                                        <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0 flex-shrink-0">
                                            <button
                                                onClick={() => handleOpenEditModal(post)}
                                                className="p-1.5 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-700 disabled:opacity-50"
                                                title="Edit Scheduled Post"
                                                disabled={deletingPostId === post.id}
                                            >
                                                <EditIcon className="w-4 h-4"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.id)} // This now opens the custom modal
                                                disabled={deletingPostId === post.id}
                                                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Delete Scheduled Post"
                                            >
                                                {deletingPostId === post.id ? <LoadingSpinner className="w-4 h-4 text-red-400"/> : <DeleteIcon className="w-4 h-4"/>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {hasMorePosts && !isFetchingPosts && ( <div className="text-center mt-6"><button onClick={() => {setCurrentPage(prev => prev + 1); loadScheduledPosts(currentPage + 1);}} className="px-6 py-2 text-sm font-medium text-orange-200 bg-orange-700/50 hover:bg-orange-600/70 rounded-lg shadow-md transition-colors">Load More</button></div> )}
                                {isFetchingPosts && scheduledPosts.length > 0 && ( <div className="flex justify-center items-center py-4"><LoadingSpinner className="w-6 h-6 text-orange-400"/></div> )}
                            </div>
                        )}
                    </section>
                </div>
            </div>
            <EditScheduledPostModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                post={currentEditingPost}
                onPostUpdated={handlePostUpdated}
            />
            {/* NEW: Delete Confirmation Modal */}
            <DeletePostConfirmationModal
                isOpen={isDeleteConfirmModalOpen}
                onClose={() => {
                    setIsDeleteConfirmModalOpen(false);
                    setPostToDelete(null); // Clear selected post if user cancels
                }}
                onConfirm={confirmDeletePost}
                post={postToDelete}
            />
        </>
    );
}