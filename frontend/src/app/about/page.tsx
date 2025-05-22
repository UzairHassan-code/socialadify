// D:\socialadify\frontend\src\app\about\page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

// Placeholder icons
const MissionIcon = ({ className = "w-16 h-16 text-rose-400" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12H18M3.27 3.126A59.769 59.769 0 0121.485 12H18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9M12 6v6m-3 6h.008v.008H9v-.008zm0 0h.008v.008H9v-.008zm0 0h.008v.008H9v-.008zm0 0h.008v.008H9v-.008zM12 6h.008v.008H12V6zm0 0h.008v.008H12V6zm0 0h.008v.008H12V6zm0 0h.008v.008H12V6zm3 6h.008v.008H15v-.008zm0 0h.008v.008H15v-.008zm0 0h.008v.008H15v-.008zm0 0h.008v.008H15v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const TeamIcon = ({ className = "w-16 h-16 text-purple-400" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-3.741M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);


export default function AboutUsPage() {
  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent pb-2">
          About SocialAdify
        </h1>
        <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
          We are passionate about empowering businesses and individuals to achieve remarkable results with their social media advertising through intelligent, easy-to-use tools.
        </p>
      </header>

      <section className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-slate-700/60">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <MissionIcon />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-100 mb-3">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed mb-2">
              At SocialAdify, our mission is to demystify social media advertising and make cutting-edge AI accessible to everyone. We believe that powerful advertising tools shouldn't be complex or reserved for large corporations. 
            </p>
            <p className="text-slate-400 leading-relaxed">
              We strive to provide a comprehensive platform that simplifies ad management, offers actionable insights, and helps you create content that truly resonates with your target audience, ultimately driving growth and success.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-slate-700/60">
        <div className="flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="flex-shrink-0">
            <TeamIcon />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-100 mb-3">Meet the (Future) Team</h2>
            <p className="text-slate-400 leading-relaxed mb-2">
              SocialAdify is currently a project driven by innovation and a vision for the future of ad-tech. While our team is small, our ambitions are big! We are dedicated developers, marketers, and AI enthusiasts working to build a platform that makes a real difference.
            </p>
            <p className="text-slate-400 leading-relaxed">
              We are constantly learning, iterating, and exploring new ways to integrate AI for maximum impact. Stay tuned as we grow and evolve!
            </p>
          </div>
        </div>
      </section>

      <section className="text-center py-8">
        <h2 className="text-2xl font-semibold text-slate-200 mb-4">Have Questions or Feedback?</h2>
        <p className="text-slate-400 mb-6 max-w-xl mx-auto">
          We&apos;d love to hear from you. Your insights help us build a better SocialAdify.
        </p>
        <Link href="/contact" className="inline-block px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 rounded-lg shadow-lg transition-transform transform hover:scale-105">
            Contact Us (Coming Soon)
        </Link>
      </section>
    </div>
  );
}
