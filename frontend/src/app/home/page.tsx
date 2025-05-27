// D:\socialadify\frontend\src\app\home\page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

// --- Icon Components ---
const IconWrapper: React.FC<{children: React.ReactNode, colorClass: string, iconColorClass: string}> = ({ children, colorClass, iconColorClass }) => (
  <div className={`p-3.5 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xl ${colorClass}`}>
    {React.cloneElement(children as React.ReactElement, { className: `w-10 h-10 ${iconColorClass} group-hover:opacity-80 transition-opacity duration-300`})}
  </div>
);

const InsightIcon = () => (
  <IconWrapper colorClass="bg-sky-600/20 group-hover:bg-sky-600/30" iconColorClass="text-sky-300 group-hover:text-sky-200">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" />
    </svg>
  </IconWrapper>
);
const CaptionGenerationIcon = () => (
  <IconWrapper colorClass="bg-teal-500/20 group-hover:bg-teal-500/30" iconColorClass="text-teal-300 group-hover:text-teal-200">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        <path d="m15 5 4 4"></path>
    </svg>
  </IconWrapper>
);
const PostSchedulingIcon = () => ( // Icon for Post Scheduling
  <IconWrapper colorClass="bg-orange-500/20 group-hover:bg-orange-500/30" iconColorClass="text-orange-300 group-hover:text-orange-200">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M12 14l2 2"></path> {/* Simple clock/check mark indication */}
        <path d="M12 18l-2-2"></path>
    </svg>
  </IconWrapper>
);
// --- End Icon Components ---

interface ModuleCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  actionText?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ 
  title, 
  description, 
  link, 
  icon, 
  comingSoon,
  actionText = "Explore Module"
}) => {
  const cardBaseClasses = `
    bg-slate-800/75 backdrop-blur-xl rounded-2xl 
    transition-all duration-300 ease-in-out 
    p-7 md:p-8 flex flex-col items-center text-center 
    border border-slate-700/60
    shadow-2xl group 
  `;
  const cardHoverClasses = comingSoon 
    ? 'opacity-60 cursor-not-allowed' 
    : 'hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-blue-500/40 hover:border-blue-500/70';

  const cardContent = (
    <>
      <div className="mb-6 transform group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300 ease-out">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-50 mb-3 group-hover:text-blue-300 transition-colors duration-300">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 flex-grow leading-relaxed min-h-[60px]">{description}</p>
      <div className="mt-auto w-full pt-2">
        {!comingSoon && (
          <span className="inline-block w-full max-w-[230px] px-6 py-3 text-xs sm:text-sm font-semibold text-blue-100 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform group-hover:scale-105">
            {actionText} &rarr;
          </span>
        )}
        {comingSoon && (
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-slate-300 bg-slate-700/80 border border-slate-600 rounded-full">
            Coming Soon
          </span>
        )}
      </div>
    </>
  );

  if (comingSoon) {
    return <div className={`${cardBaseClasses} ${cardHoverClasses}`} title="This module is under development.">{cardContent}</div>;
  }

  return (
    <Link href={link} className="block focus:outline-none focus:ring-4 focus:ring-blue-500/60 focus:ring-offset-4 focus:ring-offset-slate-900 rounded-2xl">
      <div className={`${cardBaseClasses} ${cardHoverClasses}`}>
        {cardContent}
      </div>
    </Link>
  );
};

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-16 md:mb-24">
        <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tighter pb-3
                       text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400 
                       [text-shadow:0_0_30px_rgba(56,189,248,0.4),_0_0_50px_rgba(96,165,250,0.3),_0_0_75px_rgba(129,140,248,0.25)]"
        >
          SocialAdify Hub, {user?.firstname || 'Innovator'}!
        </h1>
        <p className="mt-8 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Empowering your ad strategies with AI-driven insights and tools. Select a module below to begin your journey.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        <ModuleCard
          title="Ad Insight & AI Optimizer"
          description="Analyze performance, view trends, and get AI-powered suggestions to boost your campaigns."
          link="/dashboard" 
          icon={<InsightIcon />}
          actionText="View Dashboard"
        />
        <ModuleCard
          title="AI Caption Generator"
          description="Generate engaging ad captions with AI. Save time, view history, and boost clicks."
          link="/caption-generator" 
          icon={<CaptionGenerationIcon />}
          actionText="Generate Captions"
        />
        <ModuleCard
          title="Post Scheduling"
          description="Plan and automate your social media posts across multiple platforms with an intuitive calendar."
          link="/scheduler"  // UPDATED LINK
          icon={<PostSchedulingIcon />}
          comingSoon={false} // UPDATED: Module is now active
          actionText="Open Scheduler" // UPDATED: Action text
        />
      </div>
    </div>
  );
}
