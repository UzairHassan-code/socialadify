// D:\socialadify\frontend\src\app\(auth)\login\page.tsx
"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

// SVG Icons defined locally as per your provided code
const AppLogo = ({ className = "w-10 h-10 text-white" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 6C9.14344 6 6.79378 7.65981 5.64006 9.99995H8.04005C8.82681 8.78081 10.2993 8 12 8C13.7007 8 15.1732 8.78081 15.9599 9.99995H18.3599C17.2062 7.65981 14.8566 6 12 6ZM12 16C10.2993 16 8.82681 15.2191 8.04005 14H5.64006C6.79378 16.3401 9.14344 18 12 18C14.8566 18 17.2062 16.3401 18.3599 14H15.9599C15.1732 15.2191 13.7007 16 12 16ZM5 12C5 11.7181 5.01793 11.4402 5.05279 11.1667H18.9472C18.9821 11.4402 19 11.7181 19 12C19 12.2819 18.9821 12.5597 18.9472 12.8333H5.05279C5.01793 12.5597 5 12.2819 5 12Z"/>
    </svg>
);

const GoogleIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M21.805 10.034C21.805 9.389 21.744 8.763 21.624 8.16H12.155V11.69H17.57C17.343 12.915 16.605 13.965 15.511 14.713V17.11H18.954C20.798 15.461 21.805 12.989 21.805 10.034Z" fill="#4285F4"/><path d="M12.155 22.0001C15.011 22.0001 17.383 21.0531 18.954 19.5181L15.511 17.1101C14.605 17.7101 13.482 18.0701 12.155 18.0701C9.49801 18.0701 7.24201 16.3101 6.43101 13.8961L2.86801 13.8961V16.3771C4.44001 19.6571 7.99101 22.0001 12.155 22.0001Z" fill="#34A853"/><path d="M6.43101 13.8967C6.20401 13.2517 6.07601 12.5607 6.07601 11.8337C6.07601 11.1067 6.20401 10.4157 6.43101 9.77075V7.28875L2.86801 7.28875C2.13701 8.71675 1.73201 10.2217 1.73201 11.8337C1.73201 13.4457 2.13701 14.9507 2.86801 16.3787L6.43101 13.8967Z" fill="#FBBC05"/><path d="M12.155 6.5999C13.596 6.5999 14.702 7.0869 15.581 7.9239L19.029 4.6999C17.378 3.1679 15.006 2.2669 12.155 2.2669C7.99101 2.2669 4.44001 4.6109 2.86801 7.2889L6.43101 9.7709C7.24201 7.3569 9.49801 6.5999 12.155 6.5999Z" fill="#EA4335"/></svg>;


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { login, error: authErrorFromContext, isLoading: authIsLoading, isAuthenticated, isAuthReady, clearError } = useAuth(); 
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.push('/home'); 
    }
  }, [isAuthReady, isAuthenticated, router]);

  useEffect(() => {
    const signupSuccess = searchParams.get('signupSuccess');
    const passwordResetSuccess = searchParams.get('passwordResetSuccess'); // Check for password reset success

    if (signupSuccess === 'true') {
      setFormSuccessMessage('Signup successful! Please log in.');
      router.replace('/login', { scroll: false }); 
    }
    if (passwordResetSuccess === 'true') { // Handle password reset success message
      setFormSuccessMessage('Password reset successfully! Please log in with your new password.');
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    setFormError(authErrorFromContext);
  }, [authErrorFromContext]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null); 
    setFormSuccessMessage(null); // Clear success message on new submit attempt
    if (clearError) clearError();

    try {
      await login({ email, password });
    } catch (err: unknown) {
      console.error("LoginPage: Error during login attempt", err);
      // Error will be set by authErrorFromContext effect if it's an auth error
    }
  };

  if (!isAuthReady) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <p className="text-slate-300 text-lg">Loading SocialAdify...</p>
        </div>
    );
  }
   if (isAuthReady && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-slate-300 text-lg">Already logged in. Redirecting...</p>
      </div>
    );
  }

  // Using the UI structure you provided
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 lg:overflow-hidden">
      {/* Right Form Panel (Order changed to be on the left for lg screens) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 py-10 sm:p-10 md:p-16 bg-white order-first">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 lg:hidden">
                <AppLogo className="w-8 h-8 text-indigo-600" />
                <span className="text-2xl font-bold text-slate-800">SocialAdify</span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Welcome Back!
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                Create one now
              </Link>
            </p>
          </div>

          {formSuccessMessage && (
            <div className="p-3 text-sm text-green-700 bg-green-100 border border-green-200 rounded-lg shadow-sm">
              {formSuccessMessage}
            </div>
          )}
          {formError && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg shadow-sm">
              {formError}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide">
                Email Address
              </label>
              <input
                id="email-address" name="email" type="email" autoComplete="email" required
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-800 placeholder-slate-400 bg-slate-50"
                placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={authIsLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide">Password</label>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-800 placeholder-slate-400 bg-slate-50"
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={authIsLoading}
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-3">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-1" />
                    <label htmlFor="remember-me" className="ml-2 block text-slate-600">Remember me</label>
                </div>
                <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"> {/* Updated Link */}
                    Forgot password?
                </Link>
            </div>

            <button
              type="submit"
              disabled={authIsLoading}
              className="w-full py-3 mt-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed text-base"
            >
              {authIsLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="mx-3 text-xs font-medium text-slate-500">OR</span>
            <div className="flex-grow border-t border-slate-300"></div>
          </div>

          <button 
              type="button" 
              className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition shadow-sm disabled:opacity-70" 
              disabled={authIsLoading}
          >
              <GoogleIcon /> <span className="ml-2.5">Continue with Google</span>
          </button>
        </div>
      </div>
      
      {/* Left Branding Panel (Order changed to be on the right for lg screens) */}
      <div className="w-full lg:w-1/2 bg-slate-900 text-white p-8 sm:p-12 md:p-20 flex-col justify-center items-center lg:items-start text-center lg:text-left order-last relative overflow-hidden hidden lg:flex">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500 opacity-20 rounded-full -translate-x-1/2 -translate-y-1/2 filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600 opacity-20 rounded-full translate-x-1/2 translate-y-1/2 filter blur-3xl"></div>
        
        <div className="relative z-10 max-w-md xl:max-w-lg">
          <Link href="/" className="inline-flex items-center gap-3 mb-10 lg:mb-12">
            <AppLogo className="w-12 h-12 text-indigo-400"/>
            <span className="text-3xl lg:text-4xl font-bold tracking-tighter">SocialAdify</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            Unlock Your Ad Potential.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 opacity-90 mb-10 leading-relaxed">
            Log in to access AI-powered insights, streamline campaign management, and achieve remarkable results.
          </p>
            <div className="space-y-3 text-slate-300 text-sm">
            <p className="flex items-center"><span className="text-indigo-400 mr-2.5">✓</span> Smart Analytics & Reporting</p>
            <p className="flex items-center"><span className="text-purple-400 mr-2.5">✓</span> AI-Driven Ad Suggestions</p>
            <p className="flex items-center"><span className="text-pink-400 mr-2.5">✓</span> Effortless Campaign Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
