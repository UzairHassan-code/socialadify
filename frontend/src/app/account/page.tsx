// D:\socialadify\frontend\src\app\account\page.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import EditProfileModal from '@/components/EditProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import DeleteAccountModal from '@/components/DeleteAccountModal'; // New Import
import Image from 'next/image';

// Simple SVG Icons
const UserCircleIcon = ({ className }: { className?: string }) => ( <svg className={className || "w-6 h-6"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );
const EditIcon = ({ className }: { className?: string }) => ( <svg className={className || "w-5 h-5"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg> );
const HomeIcon = ({ className }: { className?: string }) => ( <svg className={className || "w-5 h-5"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125A2.25 2.25 0 0021 18.75V9.75M8.25 21h7.5" /> </svg> );
const LogoutIcon = ({ className }: { className?: string }) => ( <svg className={className || "w-5 h-5"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /> </svg> );
const HistoryIcon = ({ className = "w-6 h-6" }: { className?: string }) => ( 
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);
const AlertTriangleIcon = ({ className = "w-5 h-5 text-red-300" }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);


const API_BASE_URL_STATIC = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';


export default function AccountPage() {
  const { user, logout, isAuthenticated, isAuthReady } = useAuth(); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false); // New state

  useEffect(() => {
    if (user) {
      console.log("AccountPage - User data from context:", JSON.stringify(user, null, 2));
    } else {
      console.log("AccountPage - User data from context is null.");
    }
  }, [user]);

  if (!isAuthReady) { 
    return ( <div className="flex items-center justify-center min-h-screen"><p>Loading account...</p></div> ); 
  }
  if (!isAuthenticated && isAuthReady) { 
    return ( <div className="flex items-center justify-center min-h-screen"><p>Redirecting to login...</p></div> );
   }

  const handleLogout = () => { logout(); };

  const profilePicUrl = 
    user?.profile_picture_url && user.profile_picture_url.trim() !== '' 
      ? (user.profile_picture_url.startsWith('http') 
          ? user.profile_picture_url 
          : `${API_BASE_URL_STATIC}${user.profile_picture_url}`)
      : null;

  return (
    <>
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-10 md:mb-12 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-50 tracking-tight">
              My Account
            </h1>
            <p className="mt-3 text-md text-slate-300">
              Manage your profile, settings, and preferences.
            </p>
          </div>

          {/* Profile Info Card */}
          <div className="bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-2xl p-6 sm:p-8 mb-8 border border-slate-700">
            {/* ... (profile info content remains the same) ... */}
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0 mb-6 sm:mb-0 sm:mr-8 relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-indigo-500/30 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-indigo-400/50">
                  {profilePicUrl ? (
                    <Image 
                        key={profilePicUrl} 
                        src={profilePicUrl} 
                        alt={`${user?.firstname || ''} ${user?.lastname || ''}'s profile picture`} 
                        width={128} 
                        height={128}
                        className="rounded-full object-cover w-full h-full" 
                        onError={(e) => { 
                            console.error("Image onError triggered for URL:", profilePicUrl, e);
                            (e.target as HTMLImageElement).src = 'https://placehold.co/128x128/3730A3/E0E7FF?text=Error';
                        }}
                        unoptimized={process.env.NODE_ENV === 'development'} 
                    />
                  ) : (
                    <UserCircleIcon className="w-16 h-16 sm:w-20 sm:h-20 text-indigo-300" />
                  )}
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-100">
                  {user?.firstname || 'Valued'} {user?.lastname || 'User'}
                </h2>
                <p className="text-md text-slate-400 mt-1">{user?.email}</p>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="mt-4 inline-flex items-center text-xs px-3 py-1.5 bg-indigo-500/80 hover:bg-indigo-500 text-white rounded-md transition-colors group font-medium"
                >
                  <EditIcon className="w-3.5 h-3.5 mr-1.5 " />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* ... (Home Hub, Caption History links remain the same) ... */}
            <Link href="/home" className="group block p-6 bg-slate-800/60 backdrop-blur-md shadow-xl rounded-2xl hover:bg-slate-700/80 hover:border-indigo-500/70 border border-slate-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <div className="flex items-center mb-2">
                <HomeIcon className="w-6 h-6 text-indigo-400 mr-3 group-hover:text-indigo-300 transition-colors" />
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">Home Hub</h3>
              </div>
              <p className="text-sm text-slate-400">Return to the main application hub.</p>
            </Link>
            <Link href="/caption-history" className="group block p-6 bg-slate-800/60 backdrop-blur-md shadow-xl rounded-2xl hover:bg-slate-700/80 hover:border-sky-500/70 border border-slate-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
              <div className="flex items-center mb-2">
                <HistoryIcon className="w-6 h-6 text-sky-400 mr-3 group-hover:text-sky-300 transition-colors" />
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">Caption History</h3>
              </div>
              <p className="text-sm text-slate-400">View and manage your saved captions.</p>
            </Link>
            <button
              onClick={handleLogout}
              className="group w-full p-6 bg-slate-800/60 backdrop-blur-md shadow-xl rounded-2xl hover:bg-slate-700/80 hover:border-red-500/70 border border-slate-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-left md:col-span-2"
            >
              <div className="flex items-center mb-2">
                <LogoutIcon className="w-6 h-6 text-red-500 mr-3 group-hover:text-red-400 transition-colors" />
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-red-400 transition-colors">Log Out</h3>
              </div>
              <p className="text-sm text-slate-400">Sign out of your SocialAdify account.</p>
            </button>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            <div className="bg-slate-800/60 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-1">Security Settings</h3>
              <p className="text-sm text-slate-400 mb-4">Manage your password and account security.</p>
              <button 
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="px-4 py-2 text-xs font-medium text-indigo-200 bg-indigo-600/70 hover:bg-indigo-600/90 rounded-md transition-colors"
              >
                Change Password
              </button>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-700">
              <h3 className="text-lg font-semibold text-slate-100 mb-1">Notification Preferences</h3>
              <p className="text-sm text-slate-400">Customize how you receive notifications.</p>
              <p className="mt-4 text-xs text-slate-500 italic">Settings coming soon.</p>
            </div>

            {/* Delete Account Section - New */}
            <div className="bg-red-900/30 backdrop-blur-md shadow-xl rounded-2xl p-6 sm:p-8 border border-red-700/50">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0"/>
                <h3 className="text-lg font-semibold text-red-200">Delete Account</h3>
              </div>
              <p className="text-sm text-red-300 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button 
                onClick={() => setIsDeleteAccountModalOpen(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-900/30"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <DeleteAccountModal // Add the new modal instance
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </>
  );
}

