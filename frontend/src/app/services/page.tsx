// D:\socialadify\frontend\src\app\services\page.tsx
'use client';

import React from 'react';
import Link from 'next/link'; // Added missing import

// Placeholder icons (replace with actual icons if desired)
const AdManagementIcon = ({ className = "w-12 h-12 text-sky-400" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
);
const AnalyticsIcon = ({ className = "w-12 h-12 text-teal-400" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
const AICaptionIcon = ({ className = "w-12 h-12 text-indigo-400" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75M17 13.75L15.75 12M17 13.75L18.25 15M15.75 12L17 10.25" />
    </svg>
);


const ServiceCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-slate-800/60 backdrop-blur-md shadow-xl rounded-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30 border border-slate-700/70">
        <div className="flex justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-100 mb-2 text-center">{title}</h3>
        <p className="text-sm text-slate-400 text-center leading-relaxed">{description}</p>
    </div>
);

export default function ServicesPage() {
  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight bg-gradient-to-r from-green-400 via-blue-400 to-sky-400 bg-clip-text text-transparent pb-2">
          Our Services
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
          SocialAdify offers a suite of AI-powered tools designed to elevate your social media advertising and content strategy.
        </p>
      </header>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard 
            title="AI Ad Insights & Optimization"
            description="Unlock deep insights into your ad performance. Get data-driven recommendations from our AI to maximize ROI and campaign effectiveness across platforms."
            icon={<AnalyticsIcon />}
          />
          <ServiceCard 
            title="Intelligent Caption Generation"
            description="Never stare at a blank text box again. Our AI crafts compelling, engaging captions tailored to your audience, tone, and campaign goals in seconds."
            icon={<AICaptionIcon />}
          />
          <ServiceCard 
            title="Comprehensive Ad Management"
            description="Streamline your entire ad workflow. From creation and organization to (soon) scheduling, manage all your social media ads from one intuitive dashboard."
            icon={<AdManagementIcon />}
          />
          {/* Add more service cards as features grow */}
        </div>
      </section>

      <section className="text-center py-8">
        <h2 className="text-2xl font-semibold text-slate-200 mb-4">Ready to Transform Your Ad Strategy?</h2>
        <p className="text-slate-400 mb-6 max-w-xl mx-auto">
          Join SocialAdify today and experience the future of social media advertising.
        </p>
        <Link href="/signup" className="inline-block px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 rounded-lg shadow-lg transition-transform transform hover:scale-105">
            Get Started for Free
        </Link>
      </section>
    </div>
  );
}
