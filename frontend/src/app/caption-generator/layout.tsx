// D:\socialadify\frontend\src\app\caption-generator\layout.tsx
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

// Re-using Icon components
const UserIcon = ({ className }: { className?: string }) => ( <svg className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 13.5997 4.50386 15.0774 5.34334 16.3099C6.71137 15.2006 8.55991 14.5 10.5 14.5H13.5C15.4401 14.5 17.2886 15.2006 18.6567 16.3099C19.4961 15.0774 20 13.5997 20 12C20 7.58172 16.4183 4 12 4ZM12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13ZM7.04979 18.3099C7.79979 17.373 8.96802 16.75 10.25 16.5521C10.4001 16.5209 10.5 16.3985 10.5 16.2431V16.2431C10.5 15.1385 11.3807 14.25 12.4853 14.25H13.5147C14.6193 14.25 15.5 15.1385 15.5 16.2431V16.2431C15.5 16.3985 15.5999 16.5209 15.75 16.5521C17.032 16.75 18.2002 17.373 18.9502 18.3099C17.5047 19.3667 15.702 20 13.75 20H10.25C8.29804 20 6.49531 19.3667 5.04979 18.3099L7.04979 18.3099Z"/></svg> );
const SocialAdifyLogoIcon = ({ className = "w-8 h-8" }: {className?: string}) => ( <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> <defs> <linearGradient id="socialAdifyLogoGradientCaptionGenLayout" x1="0%" y1="0%" x2="100%" y2="100%"> <stop offset="0%" style={{stopColor: 'rgb(96, 165, 250)'}} /> <stop offset="50%" style={{stopColor: 'rgb(129, 140, 248)'}} /> <stop offset="100%" style={{stopColor: 'rgb(147, 51, 234)'}} /> </linearGradient> </defs> <circle cx="50" cy="50" r="45" fill="url(#socialAdifyLogoGradientCaptionGenLayout)" /> <path d="M35 65 L35 35 Q50 25 65 35 L65 65 Q50 75 35 65 Z M50 42 A8 8 0 0 1 50 58 A8 8 0 0 1 50 42 Z" fill="white" /> </svg> );
const LogoutIcon = ({className = "w-5 h-5"} : {className?: string}) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /> </svg> );

const NavLink: React.FC<{ href: string; children: ReactNode }> = ({ href, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>
            {children}
        </Link>
    );
};

export default function CaptionGeneratorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, isAuthenticated, isAuthReady, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-slate-100">
        <header className="bg-slate-900/80 backdrop-blur-md shadow-2xl sticky top-0 z-50 border-b border-slate-700/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center">
                  <Link href="/home" className="flex items-center gap-3 group">
                    <SocialAdifyLogoIcon className="h-8 w-8 sm:h-9 sm:w-9 transition-transform duration-300 group-hover:rotate-[8deg] group-hover:scale-105" />
                    <span className="text-xl sm:text-2xl font-bold text-slate-50 group-hover:text-blue-300 transition-colors duration-300 tracking-tight">
                      SocialAdify
                    </span>
                  </Link>
                  <nav className="hidden md:flex items-center space-x-3 ml-8 lg:ml-10">
                      <NavLink href="/home">Home</NavLink>
                      <NavLink href="/services">Services</NavLink>
                      <NavLink href="/about">About Us</NavLink>
                  </nav>
              </div>
              {isAuthReady && isAuthenticated && (
                <div className="flex items-center gap-3 sm:gap-4">
                  <Link 
                    href="/account" 
                    className="flex items-center p-2 rounded-lg hover:bg-slate-700/70 transition-colors group"
                    title="My Account"
                  >
                    <UserIcon className="h-6 w-6 sm:h-7 sm:w-7 text-slate-300 group-hover:text-blue-300 transition-colors" />
                    {user?.firstname && (
                      <span className="ml-2 text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors hidden md:block">
                        {user.firstname}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 rounded-lg hover:bg-slate-700/70 text-slate-400 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-60"
                    aria-label="Logout"
                  >
                    <LogoutIcon className="h-5 w-5 sm:h-6 sm:w-6"/>
                  </button>
                </div>
              )}
            </div>
            <div className="md:hidden flex items-center justify-center space-x-3 py-2 border-t border-slate-700/30">
                <NavLink href="/home">Home</NavLink>
                <NavLink href="/services">Services</NavLink>
                <NavLink href="/about">About Us</NavLink>
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </main>
        <footer className="bg-slate-900/60 border-t border-slate-700/60 text-center py-6 mt-auto">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SocialAdify. Caption Generation Module.
          </p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
