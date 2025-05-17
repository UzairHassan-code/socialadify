    // D:\socialadify\frontend\src\app\home\layout.tsx
    'use client';

    import ProtectedRoute from '@/components/ProtectedRoute';
    import Link from 'next/link';
    import { useAuth } from '@/context/AuthContext'; // To get user info for display
    import { ReactNode } from 'react';

    // Simple User Icon SVG
    const UserIcon = ({ className }: { className?: string }) => (
      <svg className={className || "w-6 h-6"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 13.5997 4.50386 15.0774 5.34334 16.3099C6.71137 15.2006 8.55991 14.5 10.5 14.5H13.5C15.4401 14.5 17.2886 15.2006 18.6567 16.3099C19.4961 15.0774 20 13.5997 20 12C20 7.58172 16.4183 4 12 4ZM12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10C15 11.6569 13.6569 13 12 13ZM7.04979 18.3099C7.79979 17.373 8.96802 16.75 10.25 16.5521C10.4001 16.5209 10.5 16.3985 10.5 16.2431V16.2431C10.5 15.1385 11.3807 14.25 12.4853 14.25H13.5147C14.6193 14.25 15.5 15.1385 15.5 16.2431V16.2431C15.5 16.3985 15.5999 16.5209 15.75 16.5521C17.032 16.75 18.2002 17.373 18.9502 18.3099C17.5047 19.3667 15.702 20 13.75 20H10.25C8.29804 20 6.49531 19.3667 5.04979 18.3099L7.04979 18.3099Z"/>
      </svg>
    );
    // Simple Logo Icon SVG
    const LogoIcon = ({ className }: { className?: string }) => (
        <svg className={className || "w-8 h-8 text-indigo-600"} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM13 7H11V11H7V13H11V17H13V13H17V11H13V7Z"/>
        </svg>
    );


    export default function HomeLayout({
      children,
    }: {
      children: ReactNode;
    }) {
      const { user, isAuthenticated, isAuthReady } = useAuth();
      console.log("HomeLayout rendering. ProtectedRoute will apply.");

      return (
        <ProtectedRoute>
          <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-40">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Logo and App Name */}
                  <Link href="/home" className="flex items-center gap-2">
                    <LogoIcon className="h-7 w-7 text-indigo-600" />
                    <span className="text-xl font-bold text-gray-800">SocialAdify</span>
                  </Link>

                  {/* User Profile Link/Icon */}
                  {isAuthReady && isAuthenticated && (
                    <Link href="/account" className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <UserIcon className="h-7 w-7 text-gray-600 hover:text-indigo-600" />
                      {user?.firstname && (
                        <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                          {user.firstname}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow">
              {children} {/* This will be your home/page.tsx */}
            </main>

            {/* Optional Footer
            <footer className="bg-white border-t border-gray-200">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} SocialAdify. All rights reserved.
              </div>
            </footer>
            */}
          </div>
        </ProtectedRoute>
      );
    }
    