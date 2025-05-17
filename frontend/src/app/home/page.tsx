// D:\socialadify\frontend\src\app\home\page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// --- Icon Components - Refined Styling ---

const InsightIcon = ({ className }: { className?: string }) => (
  <div className="p-3 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors duration-300">
    <svg 
      className={className || "w-8 h-8 text-indigo-600 group-hover:text-indigo-700 transition-colors duration-300"} 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20V16" />
    </svg>
  </div>
);

// NEW Icon for Caption Generation (Example: Text/Edit style)
const CaptionGenerationIcon = ({ className }: { className?: string }) => (
  <div className="p-3 bg-sky-100 rounded-full group-hover:bg-sky-200 transition-colors duration-300">
    <svg 
        className={className || "w-8 h-8 text-sky-600 group-hover:text-sky-700 transition-colors duration-300"}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        <path d="m15 5 4 4"></path>
    </svg>
  </div>
);

// NEW Icon for Post Scheduling (Example: Calendar/Clock style)
const PostSchedulingIcon = ({ className }: { className?: string }) => (
  <div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors duration-300">
    <svg 
        className={className || "w-8 h-8 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300"}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M12 14l2 2"></path>
        <path d="M12 18l2-2"></path>
    </svg>
  </div>
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
    bg-white rounded-xl 
    transition-all duration-300 ease-in-out 
    p-6 md:p-8 flex flex-col items-center text-center 
    border border-slate-200 
  `;
  const cardHoverClasses = comingSoon 
    ? 'opacity-70 cursor-not-allowed shadow-lg'
    : 'hover:shadow-xl hover:scale-[1.03] hover:border-indigo-300 shadow-lg';

  const cardContent = (
    <>
      <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300 ease-out">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 flex-grow leading-relaxed">{description}</p>
      <div className="mt-auto w-full">
        {!comingSoon && (
          <span className="inline-block w-full max-w-xs px-6 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-all duration-300 ease-in-out">
            {actionText} &rarr;
          </span>
        )}
        {comingSoon && (
          <span className="inline-block px-4 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-300 rounded-full">
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
    <Link href={link} className="block focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-4 focus:ring-offset-slate-50 rounded-xl">
      <div className={`${cardBaseClasses} ${cardHoverClasses} group`}>
        {cardContent}
      </div>
    </Link>
  );
};

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-16 md:mb-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
          Welcome to Your <span className="text-indigo-600">SocialAdify Hub</span>
          {user?.firstname ? `, ${user.firstname}` : ''}!
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
          Empowering your ad strategies with AI. Select a module below to begin.
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
          title="Caption Generation" // UPDATED
          description="Generate engaging and effective ad captions with the power of AI. Save time and boost clicks." // UPDATED
          link="#" 
          icon={<CaptionGenerationIcon />} // UPDATED
          comingSoon={true}
        />
        <ModuleCard
          title="Post Scheduling" // UPDATED
          description="Plan and automate your social media posts across multiple platforms with an intuitive calendar." // UPDATED
          link="#"
          icon={<PostSchedulingIcon />} // UPDATED
          comingSoon={true}
        />
      </div>
    </div>
  );
}
