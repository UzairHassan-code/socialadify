'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

// --- SVG Icons ---
// App Logo SVG component for consistent branding (copied from landing page)
const AppLogo = ({ className = "w-10 h-10 text-white" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 6C9.14344 6 6.79378 7.65981 5.64006 9.99995H8.04005C8.82681 8.78081 10.2993 8 12 8C13.7007 8 15.1732 8.78081 15.9599 9.99995H18.3599C17.2062 7.65981 14.8566 6 12 6ZM12 16C10.2993 16 8.82681 15.2191 8.04005 14H5.64006C6.79378 16.3401 9.14344 18 12 18C14.8566 18 17.2062 16.3401 18.3599 14H15.9599C15.1732 15.2191 13.7007 16 12 16ZM5 12C5 11.7181 5.01793 11.4402 5.05279 11.1667H18.9472C18.9821 11.4402 19 11.7181 19 12C19 12.2819 18.9821 12.5597 18.9472 12.8333H5.05279C5.01793 12.5597 5 12.2819 5 12Z"/>
    </svg>
);

const IconWrapper: React.FC<{children: React.ReactNode, colorClass: string, iconColorClass: string}> = ({ children, colorClass, iconColorClass }) => (
  <div className={`p-3.5 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xl ${colorClass}`}>
    {React.cloneElement(children as React.ReactElement, { className: `w-10 h-10 ${iconColorClass} group-hover:opacity-80 transition-opacity duration-300`})}
  </div>
);

const InsightIcon = () => (
  <IconWrapper colorClass="bg-sky-100 group-hover:bg-sky-200" iconColorClass="text-sky-600 group-hover:text-sky-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" />
    </svg>
  </IconWrapper>
);
const CaptionGenerationIcon = () => (
  <IconWrapper colorClass="bg-teal-100 group-hover:bg-teal-200" iconColorClass="text-teal-600 group-hover:text-teal-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      <path d="m15 5 4 4"></path>
    </svg>
  </IconWrapper>
);
const PostSchedulingIcon = () => ( // Icon for Post Scheduling
  <IconWrapper colorClass="bg-orange-100 group-hover:bg-orange-200" iconColorClass="text-orange-600 group-hover:text-orange-700">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
      <path d="M12 14l2 2"></path>
      <path d="M12 18l-2-2"></path> {/* Merged: Partner's change to this path */}
    </svg>
  </IconWrapper>
);
// NEW: Admin Icon (from your changes)
const AdminIcon = () => (
    <IconWrapper colorClass="bg-red-100 group-hover:bg-red-200" iconColorClass="text-red-600 group-hover:text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3-2.25V4.5M12 18.75a6 6 0 110-12 6 6 0 010 12z" />
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
    bg-white rounded-2xl
    transition-all duration-300 ease-in-out
    p-7 md:p-8 flex flex-col items-center text-center
    border border-gray-200
    shadow-lg group
  `;
  const cardHoverClasses = comingSoon
    ? 'opacity-60 cursor-not-allowed'
    : 'hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-gray-200/40 hover:border-gray-500'; // Changed to gray hover shadow and border

  const cardContent = (
    <>
      <div className="mb-6 transform group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-300 ease-out">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-600 transition-colors duration-300">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 flex-grow leading-relaxed min-h-[60px]">{description}</p>
      <div className="mt-auto w-full pt-2">
        {!comingSoon && (
          <span className="inline-block w-full max-w-[230px] px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-gray-600 hover:bg-gray-500 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform group-hover:scale-105"> {/* Changed button text and background to gray */}
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
    <Link href={link} className="block focus:outline-none focus:ring-4 focus:ring-gray-500/60 focus:ring-offset-4 focus:ring-offset-slate-900 rounded-2xl"> {/* Changed focus ring to gray */}
      <div className="group-hover:text-gray-600 transition-colors">
        <div className={`${cardBaseClasses} ${cardHoverClasses}`}>
          {cardContent}
        </div>
      </div>
    </Link>
  );
};

export default function HomePage() {
  const { user } = useAuth();

  // Define the common pattern style for dark backgrounds, consistent with landing page
  const darkPatternStyle = {
    backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 20px)',
    backgroundSize: '40px 40px',
  };

  return (
    <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 pt-0">
      {/* If you want the pattern only on the page content and not the whole layout, keep this: */}
      {/* <div className="absolute inset-0 z-0 opacity-20" style={darkPatternStyle}></div> */}

      <div className="text-center mb-16 md:mb-24">
        <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter pb-3 text-white"
        >
          Welcome to SocialAdify Hub, {user?.firstname || 'Innovator'}!
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
            title="Caption Generation"
            description="Generate engaging and effective ad captions with the power of AI. Save time and boost clicks."
            link="/caption-generator"
            icon={<CaptionGenerationIcon />}
            comingSoon={false}
            actionText="Generate Captions"
          />
          <ModuleCard
            title="Post Scheduling"
            description="Plan and automate your social media posts across multiple platforms with an intuitive calendar."
            link="/scheduler" 
            icon={<PostSchedulingIcon />}
            comingSoon={false} 
            actionText="Schedule Posts" 
          />
          {/* NEW: Admin Panel Card - visible only if user is an admin (from your changes) */}
          {user?.is_admin && (
              <ModuleCard
                  title="User Management"
                  description="Access administrative tools to manage users and platform settings."
                  link="/admin/dashboard"
                  icon={<AdminIcon />}
                  actionText="Manage Users"
                  comingSoon={false}
              />
          )}
        </div>
      </div>
    
  );
}
