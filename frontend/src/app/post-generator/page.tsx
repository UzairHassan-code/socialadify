// D:\socialadify\frontend\src\app\post-generator\page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateVisualPost, PostGenerationPayload, PostGenerationResult } from '@/services/postGeneratorService';
import Image from 'next/image';
import Link from 'next/link';

// --- Icon Components ---
const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> );
const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.927a2.25 2.25 0 01-2.244-2.077L5.09 5.93c-.3-.058-.6-.117-.9-.176M4.5 5.25a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0112 5.25m-3 0h3.75m-3.75 0V7.5m-3-3h3.75m-3.75 0V7.5" /></svg> );
const WandIcon = ({ className = "w-5 h-5" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75M17 13.75L15.75 12M17 13.75L18.25 15M15.75 12L17 10.25" /></svg> );
const DownloadIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg> );
const HomeIcon = ({ className = "w-4 h-4" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125A2.25 2.25 0 0021 18.75V9.75M8.25 21h7.5" /></svg> );

// Loading animation component
const GeneratingAnimation = () => (
    <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-t-sky-400 border-slate-700 rounded-full animate-spin"></div>
            <div className="w-full h-full flex items-center justify-center">
                <WandIcon className="w-10 h-10 text-sky-400 animate-pulse" />
            </div>
        </div>
        <p className="mt-6 text-lg font-semibold text-slate-200">Generating Your Visual Ad...</p>
        <p className="mt-2 text-sm text-slate-400">This can take up to a minute. The AI is hard at work!</p>
    </div>
);

export default function PostGeneratorPage() {
    const { token, logout } = useAuth();
    
    // --- Form State ---
    const [productName, setProductName] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [keyFeatures, setKeyFeatures] = useState(['']);
    const [tone, setTone] = useState('Professional');
    const [platform, setPlatform] = useState('Instagram');
    const [callToAction, setCallToAction] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');

    // --- API & UI State ---
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PostGenerationResult | null>(null);

    // --- Form Handlers ---
    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...keyFeatures];
        newFeatures[index] = value;
        setKeyFeatures(newFeatures);
    };

    const addFeature = () => setKeyFeatures([...keyFeatures, '']);
    const removeFeature = (index: number) => {
        if (keyFeatures.length > 1) {
            setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!token) {
            setError("Authentication error. Please log in again.");
            logout();
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResult(null);

        const payload: PostGenerationPayload = {
            product_name: productName,
            target_audience: targetAudience,
            key_features: keyFeatures.filter(f => f.trim() !== ''),
            tone,
            platform,
            call_to_action: callToAction,
            aspect_ratio: aspectRatio,
        };

        try {
            const generatedResult = await generateVisualPost(token, payload);
            setResult(generatedResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes("unauthorized")) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --- Reusable Tailwind CSS classes ---
    const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";
    const inputClass = "w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition text-slate-100 placeholder-slate-400";
    const cardClass = "bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700/80";

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <header className="text-center mb-10">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <Link href="/home" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1.5">
                        <HomeIcon /> Back to Hub
                    </Link>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-300 via-sky-400 to-blue-400 bg-clip-text text-transparent pb-2">
                    AI Visual Ad Generator
                </h1>
                <p className="mt-3 text-md text-slate-400 max-w-2xl mx-auto">
                    Answer a few questions about your product, and our AI will generate a complete visual ad for your social media campaigns.
                </p>
            </header>

            <div className="max-w-2xl mx-auto">
                {!result && !isLoading && (
                    <form onSubmit={handleSubmit} className={`${cardClass} space-y-6`}>
                        {/* Product Name, Audience, Features... */}
                        <div>
                            <label htmlFor="productName" className={labelClass}>Product or Service Name*</label>
                            <input type="text" id="productName" value={productName} onChange={e => setProductName(e.target.value)} className={inputClass} placeholder="e.g., Aura Smart Watch" required />
                        </div>
                        <div>
                            <label htmlFor="targetAudience" className={labelClass}>Who is your Target Audience?*</label>
                            <input type="text" id="targetAudience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className={inputClass} placeholder="e.g., Fitness enthusiasts aged 25-45" required />
                        </div>
                        <div>
                            <label className={labelClass}>Key Features or Selling Points*</label>
                            <div className="space-y-2">
                                {keyFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input type="text" value={feature} onChange={e => handleFeatureChange(index, e.target.value)} className={inputClass} placeholder={`Feature #${index + 1}`} required />
                                        <button type="button" onClick={() => removeFeature(index)} disabled={keyFeatures.length <= 1} className="p-2 text-red-400 hover:text-red-300 bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addFeature} className="mt-2 text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5">
                                <PlusIcon /> Add another feature
                            </button>
                        </div>

                        {/* *** UPDATED DIMENSIONS FIELD & GRID *** */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                             <div>
                                <label htmlFor="aspectRatio" className={labelClass}>Dimensions*</label>
                                <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className={inputClass}>
                                    <option value="1:1">Square (1:1)</option>
                                    <option value="16:9">Landscape (16:9)</option>
                                    <option value="9:16">Portrait (9:16)</option>
                                    <option value="4:5">Vertical (4:5)</option>
                                    <option value="2:3">Photo (2:3)</option>
                                    <option value="21:9">Wide Banner (21:9)</option>
                                    <option value="9:21">Tall Banner (9:21)</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tone" className={labelClass}>Tone*</label>
                                <select id="tone" value={tone} onChange={e => setTone(e.target.value)} className={inputClass}>
                                    <option>Professional</option>
                                    <option>Inspirational</option>
                                    <option>Witty</option>
                                    <option>Playful</option>
                                    <option>Luxury</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="platform" className={labelClass}>Platform*</label>
                                <select id="platform" value={platform} onChange={e => setPlatform(e.target.value)} className={inputClass}>
                                    <option>Instagram</option>
                                    <option>Facebook</option>
                                    <option>X (Twitter)</option>
                                </select>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div>
                            <label htmlFor="callToAction" className={labelClass}>Call to Action Text*</label>
                            <input type="text" id="callToAction" value={callToAction} onChange={e => setCallToAction(e.target.value)} className={inputClass} placeholder="e.g., Shop Now & Get 15% Off" required />
                        </div>
                        
                        <div className="pt-4">
                            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed bg-sky-600 hover:bg-sky-500 text-white">
                                <WandIcon /> Generate Ad
                            </button>
                        </div>
                    </form>
                )}

                {isLoading && <GeneratingAnimation />}

                {error && (
                    <div className={`${cardClass} text-center`}>
                        <h3 className="text-lg font-semibold text-red-400">An Error Occurred</h3>
                        <p className="mt-2 text-sm text-slate-400 bg-slate-700/50 p-3 rounded-md">{error}</p>
                        <button onClick={() => { setError(null); setIsLoading(false); }} className="mt-4 px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-500 rounded-md">
                            Try Again
                        </button>
                    </div>
                )}

                {result && (
                    <div className={`${cardClass} text-center`}>
                        <h2 className="text-2xl font-bold text-slate-100 mb-4">Your AI-Generated Ad is Ready!</h2>
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-slate-700 mb-4">
                            <Image src={result.image_data_url} alt="Generated AI ad" layout="fill" objectFit="contain" />
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            <a href={result.image_data_url} download="socialadify-ad.png" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-md transition-colors bg-green-600 hover:bg-green-500 text-white">
                                <DownloadIcon /> Download
                            </a>
                            <button onClick={() => { setResult(null); }} className="px-5 py-2.5 text-sm font-medium bg-slate-600 hover:bg-slate-500 rounded-lg">
                                Create Another
                            </button>
                        </div>
                        <div className="mt-6 text-left">
                            <p className="text-xs text-slate-400 font-medium">Image Prompt Used:</p>
                            <p className="text-xs text-slate-500 bg-slate-700/50 p-2 rounded-md mt-1 font-mono">{result.prompt_used}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
