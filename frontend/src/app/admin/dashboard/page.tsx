// D:\socialadify\frontend\src\app\admin\dashboard\page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Icons for quick links (re-using from other files or defining new ones)
const UsersIcon = ({ className = "w-6 h-6" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /> </svg> );
const SettingsIcon = ({ className = "w-6 h-6" }: { className?: string }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.318.659.675.839.67.324 1.335.933 1.852 1.638.163.207.305.427.416.645l.128.279c.17.37.607.559 1.03.468A8.925 8.925 0 0022 12c0 .805-.066 1.592-.191 2.365-.127.75-.666 1.289-1.402 1.474l-.232.067c-.44.126-.73.51-.84.97l-.214 1.281c-.09.542-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.063-.374-.318-.659-.675-.839a9.75 9.75 0 00-1.852-1.638.75.75 0 01-.416-.645l-.128-.279c-.17-.37-.607-.559-1.03-.468A8.925 8.925 0 002 12c0-.805.066-1.592.191-2.365.127-.75.666-1.289 1.402-1.474l.232-.067c.44-.126.73-.51.84-.97l.214-1.281z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> );


export default function AdminDashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-10">
            <header className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-50 tracking-tight bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent pb-2">
                    Admin Dashboard
                </h1>
                <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
                    Welcome, <span className="font-semibold text-orange-300">{user?.firstname || 'Administrator'}</span>!
                    Manage your SocialAdify platform from here.
                </p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* User Management Card */}
                <Link href="/admin/users" className="group block">
                    <div className="bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-xl p-6 sm:p-8 border border-slate-700 hover:border-red-500/70 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-red-500/30">
                        <div className="flex justify-center mb-4">
                            <UsersIcon className="w-12 h-12 text-red-400 group-hover:text-red-300 transition-colors" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-100 mb-2 text-center group-hover:text-red-300 transition-colors">
                            User Management
                        </h2>
                        <p className="text-sm text-slate-400 text-center leading-relaxed">
                            View, search, and delete user accounts. Maintain platform integrity.
                        </p>
                    </div>
                </Link>

                {/* Placeholder for future Admin Settings */}
                <div className="group">
                    <div className="bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-xl p-6 sm:p-8 border border-slate-700 opacity-60 cursor-not-allowed">
                        <div className="flex justify-center mb-4">
                            <SettingsIcon className="w-12 h-12 text-yellow-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-100 mb-2 text-center">
                            Platform Settings
                        </h2>
                        <p className="text-sm text-slate-400 text-center leading-relaxed">
                            Configure global platform settings and integrations. (Coming Soon)
                        </p>
                    </div>
                </div>
            </section>

            {/* Optional: Add a quick overview of stats if desired */}
            {/* <section className="max-w-4xl mx-auto mt-10">
                <h2 className="text-2xl font-semibold text-slate-50 mb-6 text-center">Quick Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-slate-800/70 p-6 rounded-xl shadow-lg border border-slate-700">
                        <h3 className="text-lg font-medium text-slate-200">Total Users</h3>
                        <p className="text-3xl font-bold text-orange-400 mt-2">123</p>
                    </div>
                    <div className="bg-slate-800/70 p-6 rounded-xl shadow-lg border border-slate-700">
                        <h3 className="text-lg font-medium text-slate-200">Active Campaigns</h3>
                        <p className="text-3xl font-bold text-yellow-400 mt-2">45</p>
                    </div>
                </div>
            </section> */}
        </div>
    );
}
