// D:\socialadify\frontend\src\app\page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { useAuth } from '@/context/AuthContext'; 
import { useEffect } from 'react';

// Placeholder AppLogo
const AppLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="socialAdifyLogoGradientLanding" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgb(96, 165, 250)'}} /> 
                <stop offset="50%" style={{stopColor: 'rgb(129, 140, 248)'}} /> 
                <stop offset="100%" style={{stopColor: 'rgb(167, 139, 250)'}} /> 
            </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" fill="url(#socialAdifyLogoGradientLanding)" />
        <path d="M30 60 Q40 40 50 50 T70 40 M30 60 L35 70 M70 40 L65 30" stroke="rgba(255,255,255,0.9)" strokeWidth="6" fill="none" strokeLinecap="round"/>
    </svg>
);

// Arrow icon for buttons
const ArrowRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

// Corrected CheckCircleIcon to properly merge classes
const CheckCircleIcon = ({ className: additionalClassName = "" }: { className?: string }) => {
    const baseClasses = "w-5 h-5 text-sky-400 flex-shrink-0"; // Default size, color, and shrink behavior
    return (
        <svg className={`${baseClasses} ${additionalClassName}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
};


export default function GetStartedPage() {
    const router = useRouter();
    const { isAuthenticated, isAuthReady } = useAuth();

    useEffect(() => {
        if (isAuthReady && isAuthenticated) {
            router.push('/home');
        }
    }, [isAuthReady, isAuthenticated, router]);

    if (!isAuthReady || (isAuthReady && isAuthenticated)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <p className="text-slate-300 text-lg">Loading SocialAdify...</p>
            </div>
        );
    }

    const handleGetStartedClick = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-blue-950 text-slate-100 antialiased">
            <header className="py-5 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 bg-slate-900/70 backdrop-blur-lg border-b border-slate-700/50">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <AppLogo className="h-8 w-8 sm:h-9 sm:w-9 transition-transform duration-300 group-hover:rotate-[6deg] group-hover:scale-105" />
                        <span className="text-xl sm:text-2xl font-semibold text-slate-100 group-hover:text-blue-400 transition-colors duration-300 tracking-tight">
                            SocialAdify
                        </span>
                    </Link>
                    <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                        Sign Up
                    </Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-12 md:py-16 lg:py-20 flex items-center">
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center w-full max-w-6xl mx-auto">
                    
                    <div className="bg-slate-800/60 backdrop-blur-xl p-8 lg:p-12 rounded-2xl shadow-2xl border border-slate-700/60 flex flex-col items-center text-center h-full justify-center">
                        <div className="relative mb-6">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-25 animate-pulse-slow"></div>
                            <AppLogo className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative z-10" />
                        </div>
                        <h1 
                            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-4
                                       text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400"
                        >
                            Amplify Your Ads with AI
                        </h1>
                        <p className="text-md lg:text-lg text-slate-300 max-w-sm mx-auto leading-relaxed mb-8">
                            Unlock insights, generate captions, and manage campaigns effortlessly with SocialAdify.
                        </p>
                        <button
                            onClick={handleGetStartedClick}
                            className="w-full max-w-xs inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-800"
                        >
                            Get Started Now
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-8 md:pt-8 lg:pt-0 flex flex-col justify-center h-full">
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-6 text-center md:text-left">
                                What SocialAdify Offers:
                            </h2>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    {/* Pass only layout-related classes here */}
                                    <CheckCircleIcon className="mr-3 mt-0.5" /> 
                                    <div>
                                        <h3 className="font-semibold text-slate-200">AI-Powered Insights</h3>
                                        <p className="text-sm text-slate-400">Gain deep analytics and actionable suggestions to boost ad performance.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleIcon className="mr-3 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-200">Smart Caption Generation</h3>
                                        <p className="text-sm text-slate-400">Craft engaging ad copy in seconds, saving time and captivating your audience.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircleIcon className="mr-3 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-200">Effortless Ad Management</h3>
                                        <p className="text-sm text-slate-400">Streamline campaign creation, organization, and (soon!) scheduling.</p>
                                    </div>
                                </li>
                                 <li className="flex items-start">
                                    <CheckCircleIcon className="mr-3 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-slate-200">Performance Analytics</h3>
                                        <p className="text-sm text-slate-400">Track key metrics and visualize trends to understand what drives success.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="text-center md:text-left pt-4">
                            <Link 
                                href="/services" 
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors group"
                            >
                                Learn More About All Features
                                <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center border-t border-slate-700/50">
                <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} SocialAdify. Revolutionizing Ad Management.
                </p>
            </footer>
        </div>
    );
}
