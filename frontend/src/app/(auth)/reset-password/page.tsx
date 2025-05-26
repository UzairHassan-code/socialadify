// D:\socialadify\frontend\src\app\(auth)\reset-password\page.tsx
'use client';

import { FormEvent, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/services/authService';
// Removed: import { AppLogo } from '@/components/ui/icons'; 

// Define AppLogo directly in the file as a placeholder
const AppLogo = ({ className = "w-10 h-10 text-indigo-600 dark:text-indigo-400" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* Using a generic circle as a placeholder logo */}
        <circle cx="12" cy="12" r="10" />
        {/* You can replace this with a more specific SVG path for your logo later */}
        {/* Example path from other pages (adjust fill/colors as needed):
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 6C9.14344 6 6.79378 7.65981 5.64006 9.99995H8.04005C8.82681 8.78081 10.2993 8 12 8C13.7007 8 15.1732 8.78081 15.9599 9.99995H18.3599C17.2062 7.65981 14.8566 6 12 6ZM12 16C10.2993 16 8.82681 15.2191 8.04005 14H5.64006C6.79378 16.3401 9.14344 18 12 18C14.8566 18 17.2062 16.3401 18.3599 14H15.9599C15.1732 15.2191 13.7007 16 12 16ZM5 12C5 11.7181 5.01793 11.4402 5.05279 11.1667H18.9472C18.9821 11.4402 19 11.7181 19 12C19 12.2819 18.9821 12.5597 18.9472 12.8333H5.05279C5.01793 12.5597 5 12.2819 5 12Z"/>
        */}
    </svg>
);


// Password validation states for UI feedback
const PasswordValidationDisplay = ({ password }: { password: string }) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    };
  
    const CheckIcon = ({className="w-4 h-4 text-green-500"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>;
    const CrossIcon = ({className="w-4 h-4 text-red-500"}: {className?: string}) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M4.28 3.22a.75.75 0 00-1.06 1.06L8.94 10l-5.72 5.72a.75.75 0 101.06 1.06L10 11.06l5.72 5.72a.75.75 0 101.06-1.06L11.06 10l5.72-5.72a.75.75 0 00-1.06-1.06L10 8.94 4.28 3.22z" clipRule="evenodd" /></svg>;

    return (
        <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p className={`flex items-center ${validations.length ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {validations.length ? <CheckIcon className="mr-1.5"/> : <CrossIcon className="mr-1.5"/>} At least 8 characters
            </p>
            <p className={`flex items-center ${validations.uppercase ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {validations.uppercase ? <CheckIcon className="mr-1.5"/> : <CrossIcon className="mr-1.5"/>} At least one uppercase letter
            </p>
            <p className={`flex items-center ${validations.lowercase ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {validations.lowercase ? <CheckIcon className="mr-1.5"/> : <CrossIcon className="mr-1.5"/>} At least one lowercase letter
            </p>
            <p className={`flex items-center ${validations.digit ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {validations.digit ? <CheckIcon className="mr-1.5"/> : <CrossIcon className="mr-1.5"/>} At least one digit
            </p>
            <p className={`flex items-center ${validations.specialChar ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {validations.specialChar ? <CheckIcon className="mr-1.5"/> : <CrossIcon className="mr-1.5"/>} At least one special character
            </p>
        </div>
    );
};


function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);


  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  useEffect(() => {
    const validations = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      digit: /[0-9]/.test(newPassword),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword),
    };
    setIsPasswordValid(Object.values(validations).every(Boolean));
  }, [newPassword]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    if (!isPasswordValid) {
        setError('Password does not meet all requirements.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await resetPassword({ token, new_password: newPassword });
      setMessage(response.message + " You can now log in.");
      setTimeout(() => router.push('/login?passwordResetSuccess=true'), 3000); // Added query param
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputClasses = "w-full px-4 py-3 text-sm border rounded-lg shadow-sm outline-none transition text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-700";
  const defaultBorderClasses = "border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400";
  const validInputClasses = "border-green-500 dark:border-green-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400";
  const passwordInputDynamicClasses = isPasswordValid && newPassword.length > 0 ? validInputClasses : defaultBorderClasses;


  if (!token && !isLoading) { // Show error only if not loading and token is definitively missing
    return (
        <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl text-center">
            <Link href="/" className="inline-block mb-6">
                <AppLogo className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Invalid Link
            </h2>
            <p className="p-3 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/30 border border-red-200 dark:border-red-700 rounded-lg shadow-sm">
                {error || 'The password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <Link href="/forgot-password" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">
                Request a new link
            </Link>
        </div>
    );
  }


  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-slate-800 shadow-xl rounded-2xl">
      <div className="text-center">
        <Link href="/" className="inline-block mb-6">
          <AppLogo className="w-12 h-12 text-indigo-600 dark:text-indigo-400 mx-auto" />
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your new password below.
        </p>
      </div>

      {message && (
        <div className="p-3 text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-800/30 border border-green-200 dark:border-green-700 rounded-lg shadow-sm">
          {message}
        </div>
      )}
      {error && !message && ( // Only show error if there's no success message
        <div className="p-3 text-sm text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/30 border border-red-200 dark:border-red-700 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      {!message && ( 
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 tracking-wide">
              New Password
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              required
              className={`${inputClasses} ${passwordInputDynamicClasses}`}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
            />
            <PasswordValidationDisplay password={newPassword} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 tracking-wide">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              className={`${inputClasses} ${newPassword === confirmPassword && newPassword.length > 0 && isPasswordValid ? validInputClasses : defaultBorderClasses}`}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed text-base"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}
       <div className="text-sm text-center mt-4">
          <Link href="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:underline">
            Back to Log In
          </Link>
        </div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen dark:bg-slate-900 dark:text-slate-300">Loading...</div>}>
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
                <ResetPasswordPageContent />
            </div>
        </Suspense>
    );
}
