    // D:\socialadify\frontend\src\app\account\page.tsx
    'use client';

    import { useAuth } from '@/context/AuthContext';
    import Link from 'next/link';
    // useRouter is not strictly needed here if logout() in AuthContext handles redirection
    // import { useRouter } from 'next/navigation';

    export default function AccountPage() {
      // Get user, logout function, and auth status from the AuthContext
      const { user, logout, isAuthenticated, isAuthReady } = useAuth();
      // const router = useRouter(); // For potential future use

      // Show a loading state until the initial authentication check is complete
      if (!isAuthReady) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-lg text-gray-700">Loading account information...</p>
          </div>
        );
      }

      // This should ideally not be hit if ProtectedRoute in layout.tsx works correctly,
      // but it's a good fallback.
      if (!isAuthenticated) {
        // ProtectedRoute should have already redirected.
        // If for some reason it didn't, this would be a fallback.
        // router.push('/login'); // This might cause hydration errors if called during initial render
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-lg text-gray-700">Redirecting to login...</p>
            </div>
        );
      }

      // Handler for the logout button
      const handleLogout = () => {
        logout(); // The logout function from AuthContext will handle token removal and redirection
      };

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center w-full max-w-lg">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              {/* Display user's first name if available, otherwise "User" */}
              Welcome, {user?.firstname || 'User'}!
            </h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">
              This is your account hub. Manage your preferences or dive into your ad insights.
            </p>

            <div className="space-y-4">
              <Link
                href="/dashboard" // Link to the insights dashboard
                className="block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-base"
              >
                View Insights Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-base"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      );
    }
    