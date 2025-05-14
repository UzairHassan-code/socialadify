// D:\socialadify\frontend\src\app\(auth)\login\page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function LoginPage() {
  const router = useRouter(); // Keep for non-auth related routing if needed, or for signupSuccess redirect
  const searchParams = useSearchParams();
  const { login, isLoading: authIsLoading, isAuthenticated } = useAuth(); // Use login and isLoading from context

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false); // Replaced by authIsLoading

  useEffect(() => {
    // If user is already authenticated, redirect them from login page
    if (isAuthenticated) {
      router.push('/dashboard'); // Or whatever your main authenticated page is
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (searchParams && searchParams.get('signupSuccess') === 'true') {
      setSuccessMessage('Signup successful! Please log in.');
      // Clean the URL by removing the query parameter without a full page reload
      // Make sure the path is correct for your route group structure
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null); // Clear success message on new login attempt

    try {
      // Call the login function from AuthContext
      // It now handles token storage and redirection internally
      await login({ email, password });
      // No need to router.push('/dashboard') here, AuthContext's login does it.
      // No need to localStorage.setItem('authToken', data.access_token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login.');
      }
    }
    // No finally block needed to set isLoading, as authIsLoading from context controls this
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="flex-1 hidden lg:flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-12">
        <div>
          <h1 className="text-5xl font-bold mb-6">SocialAdify</h1>
          <p className="text-xl">Manage your social ads efficiently.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Log in to your account
            </h2>
          </div>
          {successMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
              {successMessage}
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={authIsLoading} // Disable input when loading
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authIsLoading} // Disable input when loading
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={authIsLoading} // Use isLoading from AuthContext
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {authIsLoading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or</span>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                disabled={authIsLoading} // Also disable this if auth is loading
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Sign in with Google</span>
                {/* Google Icon Placeholder */}
                Sign in with Google
              </button>
            </div>
          </div>
          <p className="mt-6 text-sm text-center text-gray-600">
            New to SocialAdify?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
