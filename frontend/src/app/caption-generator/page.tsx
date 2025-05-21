// D:\socialadify\frontend\src\app\caption-generator\page.tsx
'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

// Icons
const UploadIcon = ({ className = "w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
);
const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
const CancelIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const CopyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
);
const RegenerateIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2.086a7.962 7.962 0 01-1.182 4.045M4 4v5h.582m15.356 2.086a7.962 7.962 0 01-1.182 4.045M4.582 15H4a1 1 0 01-1-1V5a1 1 0 011-1h15a1 1 0 011 1v5a1 1 0 01-1 1h-.582m0 0A7.963 7.963 0 0012 13.5a7.963 7.963 0 00-7.418 2.086m14.836-4.172a7.963 7.963 0 00-14.836 0M12 13.5V9.25m0 4.25A2.625 2.625 0 1012 8.25V9.25"></path></svg>
);
const LoadingSpinner = ({ className = "animate-spin h-5 w-5 text-white" }: {className?: string}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const AlertTriangleIcon = ({ className = "w-5 h-5 text-yellow-400" }: {className?: string}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);
const CookingPotLoader = ({ className = "w-12 h-12 text-indigo-400" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 10H5C3.89543 10 3 10.8954 3 12V17C3 18.6569 4.34315 20 6 20H18C19.6569 20 21 18.6569 21 17V12C21 10.8954 20.1046 10 19 10Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 10V8C7 6.89543 7.89543 6 9 6H15C16.1046 6 17 6.89543 17 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="d" values="M9 5 C9 4 8 3 7 4; M9 5 C9 3 8 2 7 3; M9 5 C9 4 8 3 7 4" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M12 5C12 4.44772 12.4477 4 13 4C13.5523 4 14 4.44772 14 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="d" values="M14 5 C14 4 13 3 12 4; M14 5 C14 3 13 2 12 3; M14 5 C14 4 13 3 12 4" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
        </path>
        <path d="M17 5C17 4.44772 17.4477 4 18 4C18.5523 4 19 4.44772 19 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <animate attributeName="d" values="M19 5 C19 4 18 3 17 4; M19 5 C19 3 18 2 17 3; M19 5 C19 4 18 3 17 4" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
        </path>
    </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

const toneOptions = ["Professional", "Casual", "Witty", "Urgent", "Empathetic", "Luxury", "Playful", "Informative", "Storytelling", "Friendly", "Humorous", "Serious", "Inspirational", "Conversational"];
const categoryOptions = ["Product Launch", "Sale/Promotion", "Brand Story", "Event Announcement", "Educational Content", "Behind the Scenes", "User-Generated Feature", "Holiday/Seasonal", "Question/Poll", "Tip/Tutorial", "New Feature", "Company Update", "Testimonial", "Contest/Giveaway"];

interface CaptionItem {
    id: string; 
    text: string;
    originalText: string; 
    isEditing: boolean;
}

export default function CaptionGeneratorPage() {
    const { isAuthReady, isAuthenticated, token, logout } = useAuth(); 
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [postCategory, setPostCategory] = useState<string>(categoryOptions[0]);
    const [tone, setTone] = useState<string>(toneOptions[0]);
    const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
    const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);

    const [generatedCaptions, setGeneratedCaptions] = useState<CaptionItem[]>([]); 
    const [editingCaptionText, setEditingCaptionText] = useState<string>(""); 
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);
    
    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null); 
        setInfoMessage(null);
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                setError("Image size should not exceed 5MB.");
                setImageFile(null); setImagePreviewUrl(null);
                return;
            }
            if (!file.type.startsWith("image/")) {
                setError("Invalid file type. Please upload an image (PNG, JPG, GIF, WEBP).");
                setImageFile(null); setImagePreviewUrl(null);
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreviewUrl(reader.result as string); };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null); setImagePreviewUrl(null);
        }
    };

    const handleGenerateCaptions = async (event: FormEvent) => {
        event.preventDefault();
        if (!token) {
            setError("Authentication required. Please log in.");
            return;
        }
        setIsLoading(true); setError(null); setGeneratedCaptions([]); setInfoMessage(null);

        const formData = new FormData();
        if (imageFile) {
            formData.append('image_file', imageFile);
        }
        formData.append('category', postCategory);
        formData.append('tone', tone);
        formData.append('include_hashtags', String(includeHashtags));
        formData.append('include_emojis', String(includeEmojis));

        try {
            const response = await fetch(`${API_BASE_URL}/captions/generate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (response.status === 401) { 
                setError("Your session has expired. Please log in again.");
                logout(); 
                setIsLoading(false);
                return; 
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: `Server error: ${response.status}` }));
                throw new Error(errorData.detail || `Failed to generate captions. Status: ${response.status}`);
            }

            const result = await response.json();
            const captionsFromApi: string[] = result.captions || [];
            setGeneratedCaptions(
                captionsFromApi.map((text, index) => ({
                    id: `caption-${Date.now()}-${index}`, 
                    text: text,
                    originalText: text, 
                    isEditing: false,
                }))
            );

            if (result.image_description_used) {
                // Display the description as is, without adding extra quotes
                const descriptionToDisplay = String(result.image_description_used);
                setInfoMessage(`Image description used by AI: ${descriptionToDisplay}`);
            } else if (imageFile && !result.image_description_used) {
                setInfoMessage("Image was uploaded, but an automatic description could not be obtained or used. Captions generated based on preferences only.");
            }

        } catch (err: unknown) {
            console.error("Caption generation error:", err);
            if (!(err instanceof Error && err.message.includes("401"))) { 
                 setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            }
            setGeneratedCaptions([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setInfoMessage(`Caption ${index + 1} copied to clipboard!`);
            setTimeout(() => setInfoMessage(null), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setError('Failed to copy caption.');
        });
    };

    const handleStartEdit = (captionId: string) => {
        setGeneratedCaptions(prevCaptions =>
            prevCaptions.map(cap => {
                if (cap.id === captionId) {
                    setEditingCaptionText(cap.text); 
                    return { ...cap, isEditing: true };
                }
                return { ...cap, isEditing: false }; 
            })
        );
    };

    const handleSaveEdit = (captionId: string) => {
        setGeneratedCaptions(prevCaptions =>
            prevCaptions.map(cap =>
                cap.id === captionId ? { ...cap, text: editingCaptionText, isEditing: false, originalText: editingCaptionText } : cap
            )
        );
        setEditingCaptionText(""); 
    };

    const handleCancelEdit = (captionId: string) => {
        setGeneratedCaptions(prevCaptions =>
            prevCaptions.map(cap =>
                cap.id === captionId ? { ...cap, text: cap.originalText, isEditing: false } : cap
            )
        );
        setEditingCaptionText(""); 
    };


    const inputBaseClass = "w-full px-4 py-2.5 text-sm border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition bg-slate-700/50 text-slate-100 placeholder-slate-400";
    const labelBaseClass = "block text-xs font-medium text-slate-300 mb-1.5 tracking-wide";
    const buttonPrimaryClass = "w-full flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white";
    const buttonSecondaryClass = "px-3 py-1.5 text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-800 transition duration-150 ease-in-out disabled:opacity-60";
    const cardBaseClass = "bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700/80";

    if (!isAuthReady) {
        return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-slate-300">Loading SocialAdify...</p></div>;
    }

    return (
        <div className="py-8 md:py-12 space-y-10">
            <header className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent pb-2">
                    AI Caption Generator
                </h1>
                <p className="mt-3 text-md text-slate-400 max-w-2xl mx-auto">
                    Craft compelling social media captions in seconds. Upload an image (optional), set your preferences, and let AI do the magic!
                </p>
            </header>

            <section className={`${cardBaseClass} max-w-2xl mx-auto`}>
                <h2 className="text-xl font-semibold text-slate-100 mb-5 text-center">1. Upload Your Image (Optional)</h2>
                <label htmlFor="imageUpload" className="mt-1 flex flex-col items-center justify-center w-full h-64 px-6 pt-5 pb-6 border-2 border-slate-600/80 border-dashed rounded-xl group hover:border-indigo-500 transition-colors bg-slate-700/30 cursor-pointer">
                    {imagePreviewUrl ? (
                        <div className="relative w-full h-full max-h-52">
                            <Image src={imagePreviewUrl} alt="Selected preview" layout="fill" objectFit="contain" className="rounded-md" />
                        </div>
                    ) : (
                        <div className="space-y-2 text-center">
                            <UploadIcon />
                            <div className="flex text-sm text-slate-400 group-hover:text-indigo-300 transition-colors">
                                <span className="font-medium text-indigo-400 group-hover:text-indigo-300">Upload a file</span>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                        </div>
                    )}
                </label>
                <input id="imageUpload" name="imageUpload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                {error && imageFile && <p className="mt-2 text-xs text-red-400">{error}</p>}
            </section>

            <section className={`${cardBaseClass} max-w-2xl mx-auto`}>
                <h2 className="text-xl font-semibold text-slate-100 mb-6 text-center">2. Describe Your Post</h2>
                <form onSubmit={handleGenerateCaptions} className="space-y-5">
                    {/* Form inputs remain the same */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="postCategory" className={labelBaseClass}>Post Category</label>
                            <select id="postCategory" value={postCategory} onChange={(e) => setPostCategory(e.target.value)} className={inputBaseClass}>
                                {categoryOptions.map(opt => <option key={opt} value={opt} className="bg-slate-700 text-slate-100">{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tone" className={labelBaseClass}>Tone/Style</label>
                            <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className={inputBaseClass}>
                                {toneOptions.map(opt => <option key={opt} value={opt} className="bg-slate-700 text-slate-100">{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <fieldset className="space-y-3 pt-2">
                        <legend className={`${labelBaseClass} mb-1`}>Include:</legend>
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center"><input id="includeHashtags" type="checkbox" checked={includeHashtags} onChange={(e) => setIncludeHashtags(e.target.checked)} className="h-4 w-4 rounded border-slate-500 text-indigo-500 focus:ring-indigo-400 bg-slate-600" /></div>
                            <div className="ml-3 text-sm"><label htmlFor="includeHashtags" className="font-medium text-slate-200">Hashtags</label></div>
                        </div>
                        <div className="relative flex items-start">
                            <div className="flex h-5 items-center"><input id="includeEmojis" type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} className="h-4 w-4 rounded border-slate-500 text-indigo-500 focus:ring-indigo-400 bg-slate-600" /></div>
                            <div className="ml-3 text-sm"><label htmlFor="includeEmojis" className="font-medium text-slate-200">Emojis</label></div>
                        </div>
                    </fieldset>
                    <div className="pt-3">
                        <button type="submit" disabled={isLoading || !isAuthenticated} className={buttonPrimaryClass}>
                            {isLoading && <LoadingSpinner />}
                            {isLoading ? 'Generating...' : '✨ Generate Captions'}
                        </button>
                    </div>
                     {error && <p className="mt-3 text-sm text-red-400 bg-red-900/30 p-3 rounded-md border border-red-700/50 text-center">{error}</p>}
                </form>
            </section>

            {(generatedCaptions.length > 0 || isLoading || infoMessage) && (
                <section className={`${cardBaseClass} max-w-3xl mx-auto`}>
                    <h2 className="text-xl font-semibold text-slate-100 mb-6 text-left">3. Your AI Captions</h2>
                    {isLoading && (
                        <div className="flex flex-col justify-center items-center h-40 space-y-3">
                            <CookingPotLoader /> 
                            <p className="text-slate-400 text-sm">Cooking your caption...</p> 
                        </div>
                    )}
                    {infoMessage && !isLoading && (
                         <div className="p-3 mb-4 text-sm text-sky-200 bg-sky-700/40 border border-sky-600/60 rounded-md flex items-center gap-2">
                            <AlertTriangleIcon className="w-5 h-5 text-sky-300 flex-shrink-0" />
                            {infoMessage}
                        </div>
                    )}
                    {!isLoading && generatedCaptions.length === 0 && !error && !infoMessage && (
                        <p className="text-slate-400 text-center py-10">Click Generate Caption to see results here.</p>
                    )}
                    {!isLoading && generatedCaptions.length > 0 && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {generatedCaptions.map((captionItem, index) => (
                                <div key={captionItem.id} className="p-4 bg-slate-700/70 rounded-lg border border-slate-600/90 shadow-lg">
                                    {captionItem.isEditing ? (
                                        <textarea
                                            value={editingCaptionText}
                                            onChange={(e) => setEditingCaptionText(e.target.value)}
                                            className="w-full p-2 text-sm border border-indigo-500 rounded-md bg-slate-600 text-slate-100 focus:ring-1 focus:ring-indigo-400 outline-none min-h-[80px]"
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-slate-100 text-sm mb-3 whitespace-pre-wrap leading-relaxed">{captionItem.text}</p>
                                    )}
                                    <div className="flex justify-end items-center space-x-2.5 mt-2 border-t border-slate-600/70 pt-2.5">
                                        {captionItem.isEditing ? (
                                            <>
                                                <button 
                                                    title="Save Changes" 
                                                    onClick={() => handleSaveEdit(captionItem.id)}
                                                    className={`${buttonSecondaryClass} bg-green-600/80 hover:bg-green-500/80 text-white`}
                                                >
                                                    <SaveIcon />
                                                </button>
                                                <button 
                                                    title="Cancel Edit" 
                                                    onClick={() => handleCancelEdit(captionItem.id)}
                                                    className={`${buttonSecondaryClass} bg-slate-500/80 hover:bg-slate-400/80 text-white`}
                                                >
                                                    <CancelIcon />
                                                </button>
                                            </>
                                        ) : (
                                            <button 
                                                title="Edit Caption" 
                                                onClick={() => handleStartEdit(captionItem.id)}
                                                className={`${buttonSecondaryClass} bg-slate-600/60 hover:bg-slate-500/60 text-slate-300 hover:text-sky-300`}
                                            >
                                                <EditIcon/>
                                            </button>
                                        )}
                                        <button 
                                            title="Copy" 
                                            onClick={() => copyToClipboard(captionItem.text, index)} 
                                            className={`${buttonSecondaryClass} bg-slate-600/60 hover:bg-slate-500/60 text-slate-300 hover:text-green-400`}
                                            disabled={captionItem.isEditing} 
                                        >
                                            <CopyIcon/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 text-center">
                                <button onClick={handleGenerateCaptions} disabled={isLoading || !isAuthenticated} className={`${buttonSecondaryClass} bg-sky-600/90 hover:bg-sky-500/90 text-sky-50 inline-flex items-center gap-2`}>
                                    <RegenerateIcon /> Regenerate
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

