// D:\socialadify\frontend\src\components\AdCreatorForm.tsx
'use client';

import React, { useState, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import {
    createAdCreative,
    getAIPlatformSuggestion,
    AdCreativePublic,
    // Use the new payload type from the service
    AdCreativeFormPayload, 
    GoogleAudience,
    AIPlatformSuggestionRequest
} from '@/services/adCreatorService'; // Use correct alias path

// --- Icons ---
const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> );
const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.927a2.25 2.25 0 01-2.244-2.077L5.09 5.93c-.3-.058-.6-.117-.9-.176M4.5 5.25a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0112 5.25m-3 0h3.75" /></svg> );
const WandIcon = ({ className = "w-5 h-5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75M17 13.75L15.75 12M17 13.75L18.25 15M15.75 12L17 10.25" /></svg> );
const LoadingSpinner = ({ className = "animate-spin h-5 w-5 text-white" }: {className?: string}) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);
const ImageIcon = ({ className = "w-5 h-5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> );

// --- Default States ---
const defaultAudience: GoogleAudience = {
    locations: [''],
    age_min: 18,
    age_max: 65,
    genders: [],
    interests: [''],
};

// Use the service payload type, which omits the file
const defaultAdCreative: AdCreativeFormPayload['ad_data'] = {
    campaign_name: '',
    ad_goal: 'TRAFFIC',
    headline: '',
    body_text: '',
    platform: 'GOOGLE',
    audience: defaultAudience,
};

interface AdCreatorFormProps {
    token: string | null;
    onDraftSaved: (newAd: AdCreativePublic) => void;
    onCancel: () => void;
    cardClass: string;
}

export const AdCreatorForm: React.FC<AdCreatorFormProps> = ({
    token,
    onDraftSaved,
    onCancel,
    cardClass
}) => {
    const [formState, setFormState] = useState(defaultAdCreative);
    const [productDescription, setProductDescription] = useState(''); // For AI suggestion
    
    // --- NEW: State for two images ---
    const [imageFileSquare, setImageFileSquare] = useState<File | null>(null);
    const [imagePreviewSquare, setImagePreviewSquare] = useState<string | null>(null);
    const [imageFileLandscape, setImageFileLandscape] = useState<File | null>(null);
    const [imagePreviewLandscape, setImagePreviewLandscape] = useState<string | null>(null);
    
    const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Form Styling Classes ---
    const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";
    const inputClass = "w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-slate-100 placeholder-slate-400 disabled:opacity-50";

    // --- Form Handlers ---
    const handleFormChange = (field: keyof typeof formState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleAudienceChange = (field: keyof GoogleAudience, value: any) => {
        setFormState(prev => ({
            ...prev,
            audience: { ...prev.audience, [field]: value }
        }));
    };

    const handleArrayInputChange = (type: 'locations' | 'interests', index: number, value: string) => {
        const newArray = [...formState.audience[type]];
        newArray[index] = value;
        handleAudienceChange(type, newArray);
    };
    const addArrayInput = (type: 'locations' | 'interests') => {
        handleAudienceChange(type, [...formState.audience[type], '']);
    };
    const removeArrayInput = (type: 'locations' | 'interests', index: number) => {
        if (formState.audience[type].length > 1) {
            handleAudienceChange(type, formState.audience[type].filter((_, i) => i !== index));
        }
    };
    
    const handleGenderChange = (gender: 'Male' | 'Female' | 'Unknown') => {
        const currentGenders = formState.audience.genders;
        const newGenders = currentGenders.includes(gender)
            ? currentGenders.filter(g => g !== gender)
            : [...currentGenders, gender];
        handleAudienceChange('genders', newGenders);
    };

    // --- NEW: Two separate image handlers ---
    const handleImageChangeSquare = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // ... (add size/type validation if needed) ...
            setImageFileSquare(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewSquare(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };
    
    const handleImageChangeLandscape = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // ... (add size/type validation if needed) ...
            setImageFileLandscape(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewLandscape(reader.result as string);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    // --- AI Suggestion Handler ---
    const handleGetAiSuggestion = async () => {
        if (!token) return;
        setIsGeneratingSuggestion(true);
        setAiSuggestion(null);
        setError(null);

        const payload: AIPlatformSuggestionRequest = {
            ad_goal: formState.ad_goal,
            audience: formState.audience,
            product_description: productDescription
        };

        try {
            const result = await getAIPlatformSuggestion(token, payload);
            setAiSuggestion(result.recommendation);
            handleFormChange('platform', result.recommended_platform);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get AI suggestion.");
        } finally {
            setIsGeneratingSuggestion(false);
        }
    };

    // --- Form Submission Handler (UPDATED) ---
    const handleSaveDraft = async (event: FormEvent) => {
        event.preventDefault();
        if (!token) return;

        // --- NEW: Validate both images ---
        if (!imageFileSquare || !imageFileLandscape) {
            setError("Please select both a square (1:1) and landscape (1.91:1) image.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const ad_data: AdCreativeFormPayload['ad_data'] = {
            ...formState,
            audience: {
                ...formState.audience,
                locations: formState.audience.locations.filter(l => l.trim() !== ''),
                interests: formState.audience.interests.filter(i => i.trim() !== ''),
            }
        };

        try {
            // Use the updated service function
            const newAd = await createAdCreative(token, {
                ad_data,
                image_file_square: imageFileSquare,
                image_file_landscape: imageFileLandscape
            });
            onDraftSaved(newAd); // Pass the new ad up to the parent
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save draft.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSaveDraft} className={`${cardClass} max-w-3xl mx-auto`}>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-slate-100">Create New Ad Draft</h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-slate-400 hover:text-slate-200"
                >
                    &larr; Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 text-center bg-red-900/50 border border-red-700 rounded-lg">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            )}

            {/* --- AI Suggestion Section --- */}
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 mb-8">
                <h3 className="text-lg font-semibold text-sky-300 mb-3">AI Platform Optimizer (FE-2)</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="productDescription" className={labelClass}>Product / Service Description</label>
                        <input
                            type="text"
                            id="productDescription"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            className={inputClass}
                            placeholder="e.g., High-fidelity wireless headphones for gamers"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleGetAiSuggestion}
                        disabled={isGeneratingSuggestion || !productDescription}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-colors bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                    >
                        {isGeneratingSuggestion ? <LoadingSpinner className="w-4 h-4" /> : <WandIcon className="w-4 h-4" />}
                        {isGeneratingSuggestion ? 'Analyzing...' : 'Get AI Platform Suggestion'}
                    </button>
                    {aiSuggestion && (
                        <div className="pt-2">
                            <p className="text-sm text-slate-300">{aiSuggestion}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- Ad Details Section --- */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2">Campaign Details (FE-1)</h3>
                <div>
                    <label htmlFor="campaign_name" className={labelClass}>Campaign Name*</label>
                    <input type="text" id="campaign_name" value={formState.campaign_name} onChange={e => handleFormChange('campaign_name', e.target.value)} className={inputClass} required />
                </div>
                
                {/* --- NEW: Two Image Uploads --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Square Image */}
                    <div>
                        <label className={labelClass}>Square Image (1:1)*</label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="w-24 h-24 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center overflow-hidden">
                                {imagePreviewSquare ? (
                                    <Image src={imagePreviewSquare} alt="Square preview" width={96} height={96} className="object-cover w-full h-full" />
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-slate-500" />
                                )}
                            </div>
                            <label
                                htmlFor="image-upload-square"
                                className="relative cursor-pointer rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-sky-400 shadow-sm hover:bg-slate-600 border border-slate-600"
                            >
                                <span>Change Image</span>
                                <input
                                    id="image-upload-square"
                                    type="file"
                                    className="sr-only"
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageChangeSquare}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">PNG or JPG, 1:1 ratio.</p>
                    </div>
                    
                    {/* Landscape Image */}
                    <div>
                        <label className={labelClass}>Landscape Image (1.91:1)*</label>
                        <div className="mt-2 flex items-center gap-4">
                            <div className="w-24 h-24 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center overflow-hidden">
                                {imagePreviewLandscape ? (
                                    <Image src={imagePreviewLandscape} alt="Landscape preview" width={96} height={96} className="object-cover w-full h-full" />
                                ) : (
                                    <ImageIcon className="w-10 h-10 text-slate-500" />
                                )}
                            </div>
                            <label
                                htmlFor="image-upload-landscape"
                                className="relative cursor-pointer rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-sky-400 shadow-sm hover:bg-slate-600 border border-slate-600"
                            >
                                <span>Change Image</span>
                                <input
                                    id="image-upload-landscape"
                                    type="file"
                                    className="sr-only"
                                    accept="image/png, image/jpeg"
                                    onChange={handleImageChangeLandscape}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">PNG or JPG, 1.91:1 ratio.</p>
                    </div>
                </div>
                {/* --- End Image Uploads --- */}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="ad_goal" className={labelClass}>Ad Goal*</label>
                        <select id="ad_goal" value={formState.ad_goal} onChange={e => handleFormChange('ad_goal', e.target.value)} className={inputClass}>
                            <option value="TRAFFIC">Website Traffic</option>
                            <option value="AWARENESS">Brand Awareness</option>
                            <option value="LEADS">Lead Generation</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="platform" className={labelClass}>Platform*</label>
                        <select id="platform" value={formState.platform} onChange={e => handleFormChange('platform', e.target.value)} className={inputClass} disabled={isGeneratingSuggestion}>
                            <option value="GOOGLE">Google Ads</option>
                            <option value="META">Meta (Facebook/Insta)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="headline" className={labelClass}>Ad Headline*</label>
                    <input type="text" id="headline" value={formState.headline} onChange={e => handleFormChange('headline', e.target.value)} className={inputClass} placeholder="e.g., Level Up Your Audio" required />
                </div>
                <div>
                    <label htmlFor="body_text" className={labelClass}>Ad Body Text*</label>
                    <textarea id="body_text" value={formState.body_text} onChange={e => handleFormChange('body_text', e.target.value)} className={inputClass} rows={3} placeholder="e.g., Experience crystal-clear audio..."></textarea>
                </div>

                {/* --- Audience Targeting Section (FE-3) --- */}
                <h3 className="text-xl font-semibold text-slate-200 border-b border-slate-700 pb-2 pt-4">Audience Targeting (FE-3)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="age_min" className={labelClass}>Min Age</label>
                        <input type="number" id="age_min" value={formState.audience.age_min ?? ''} onChange={e => handleAudienceChange('age_min', e.target.value ? parseInt(e.target.value) : null)} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="age_max" className={labelClass}>Max Age</label>
                        <input type="number" id="age_max" value={formState.audience.age_max ?? ''} onChange={e => handleAudienceChange('age_max', e.target.value ? parseInt(e.target.value) : null)} className={inputClass} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Genders</label>
                    <div className="flex flex-wrap gap-4">
                        {(['Male', 'Female', 'Unknown'] as const).map(gender => (
                            <label key={gender} className="flex items-center gap-2 text-slate-200">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
                                    checked={formState.audience.genders.includes(gender)}
                                    onChange={() => handleGenderChange(gender)}
                                />
                                {gender}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Locations</label>
                    <div className="space-y-2">
                        {formState.audience.locations.map((location, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={location} onChange={e => handleArrayInputChange('locations', index, e.target.value)} className={inputClass} placeholder="e.g., New York" />
                                <button type="button" onClick={() => removeArrayInput('locations', index)} disabled={formState.audience.locations.length <= 1} className="p-2 text-red-400 hover:text-red-300 bg-slate-700 rounded-md disabled:opacity-50">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => addArrayInput('locations')} className="mt-2 text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5">
                        <PlusIcon /> Add location
                    </button>
                </div>

                <div>
                    <label className={labelClass}>Interests</label>
                    <div className="space-y-2">
                        {formState.audience.interests.map((interest, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={interest} onChange={e => handleArrayInputChange('interests', index, e.target.value)} className={inputClass} placeholder="e.g., Gaming" />
                                <button type="button" onClick={() => removeArrayInput('interests', index)} disabled={formState.audience.interests.length <= 1} className="p-2 text-red-400 hover:text-red-300 bg-slate-700 rounded-md disabled:opacity-50">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => addArrayInput('interests')} className="mt-2 text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5">
                        <PlusIcon /> Add interest
                    </button>
                </div>

                {/* --- Submission --- */}
                <div className="pt-4">
                    <button type="submit" disabled={isSubmitting || !imageFileSquare || !imageFileLandscape} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition duration-150 ease-in-out bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50">
                        {isSubmitting ? <LoadingSpinner /> : 'Save Ad Draft'}
                    </button>
                    {(!imageFileSquare || !imageFileLandscape) && !isSubmitting && <p className="text-xs text-center text-yellow-400 mt-2">Please select both a square and landscape image to save.</p>}
                </div>
            </div>
        </form>
    );
};

