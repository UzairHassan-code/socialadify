// D:\socialadify\frontend\src\app\page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation'; // To handle button click navigation
import { useAuth } from '@/context/AuthContext'; // To redirect if already logged in
import { useEffect } from 'react';

// Placeholder AppLogo - you can replace this with your actual SVG component
const AppLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="socialAdifyLogoGradientLanding" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgb(96, 165, 250)'}} /> {/* blue-400 */}
                <stop offset="50%" style={{stopColor: 'rgb(129, 140, 248)'}} /> {/* indigo-400 */}
                <stop offset="100%" style={{stopColor: 'rgb(167, 139, 250)'}} /> {/* purple-400 */}
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


export default function GetStartedPage() {
    const router = useRouter();
    const { isAuthenticated, isAuthReady } = useAuth();

    useEffect(() => {
        // If auth state is ready and user is already logged in, redirect to home
        if (isAuthReady && isAuthenticated) {
            router.push('/home');
        }
    }, [isAuthReady, isAuthenticated, router]);

    // Show a loading state or nothing until auth status is confirmed
    if (!isAuthReady || (isAuthReady && isAuthenticated)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <p className="text-slate-300 text-lg">Loading SocialAdify...</p>
                {/* Or a more sophisticated loader */}
            </div>
        );
    }

    const handleGetStartedClick = () => {
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-gray-900 to-blue-950 text-slate-100 antialiased">
            {/* Header */}
            <header className="py-5 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 bg-slate-900/60 backdrop-blur-lg border-b border-slate-700/50">
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

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center text-center px-4 py-12 sm:py-20">
                <div className="max-w-3xl mx-auto">
                    <div className="relative mb-8">
                        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
                        <AppLogo className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative z-10 mb-6" />
                    </div>
                    
                    <h1 
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter mb-6
                                   text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400 
                                   [text-shadow:0_0_20px_rgba(56,189,248,0.3),_0_0_40px_rgba(96,165,250,0.2)]"
                    >
                        Amplify Your Ads with AI Precision
                    </h1>
                    <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                        SocialAdify is your intelligent partner for social media advertising. 
                        Leverage AI to create compelling captions, gain deep performance insights, 
                        and optimize your campaigns for maximum impact—all in one streamlined platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button
                            onClick={handleGetStartedClick}
                            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Get Started
                            <ArrowRightIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                        <Link 
                            href="/services" // Or a link to a features page
                            className="px-8 py-3.5 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer (optional, can be simpler for a landing page) */}
            <footer className="py-8 text-center border-t border-slate-700/50">
                <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} SocialAdify. Revolutionizing Ad Management.
                </p>
            </footer>
        </div>
    );
}
