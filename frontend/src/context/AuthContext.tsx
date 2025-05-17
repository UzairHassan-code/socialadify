// D:\socialadify\frontend\src\context\AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loginUser as apiLoginUser,
  signupUser as apiSignupUser,
  LoginFormData,
  SignupData,
  UserPublic, // Assuming UserPublic includes at least id, firstname, lastname, email
} from '@/services/authService';

interface AuthContextType {
  user: UserPublic | null; // To store logged-in user's public details
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For active auth operations (login, signup)
  isAuthReady: boolean; // True once initial token load attempt is complete
  error: string | null;   // For storing auth-related errors
  login: (credentials: LoginFormData) => Promise<void>;
  signup: (userData: SignupData) => Promise<UserPublic | undefined>;
  logout: () => void;
  clearError: () => void; // To allow components to clear the error
  fetchAndUpdateUser: (token: string) => Promise<void>; // To fetch user details
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For login/signup operations
  const [isAuthReady, setIsAuthReady] = useState(false); // For initial token/user load
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Function to fetch user details using a token
  const fetchAndUpdateUser = useCallback(async (currentToken: string) => {
    if (!currentToken) {
        setUser(null);
        return;
    }
    // setIsLoading(true); // You might want a different loading state for this background fetch
    console.log("AuthProvider: Attempting to fetch user details with token.");
    try {
      // TODO: Implement an `apiGetUserMe` function in your authService.ts
      // This function would make a GET request to an endpoint like `/auth/users/me`
      // const fetchedUser = await apiGetUserMe(currentToken); 
      // setUser(fetchedUser);
      // console.log("AuthProvider: User details fetched and set:", fetchedUser);

      // Placeholder until /users/me is implemented:
      // If your token is a JWT and contains basic info (not recommended for sensitive data),
      // you could decode it here for non-critical display info.
      // For now, we'll leave user as null until proper fetching is in place.
      console.warn("AuthProvider: TODO - Implement fetchUserMe to get user details.");
      setUser(null); // Or set to a placeholder if you decode basic info from token

    } catch (e) {
      console.error("AuthProvider: Failed to fetch user details.", e);
      // If fetching user fails (e.g., token expired), log out the user
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      setError("Session invalid. Please log in again."); // Set an error
      // router.push('/login'); // Optionally force redirect
    } finally {
      // setIsLoading(false);
    }
  }, [/* router */]); // Add router if you use it in the catch block

  useEffect(() => {
    const loadAuthData = async () => { // Make it async to use await for fetchAndUpdateUser
      clearError();
      console.log("AuthProvider: Checking for existing token...");
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          console.log("AuthProvider: Token found. Attempting to fetch user details.");
          await fetchAndUpdateUser(storedToken); // Fetch user details if token exists
        } else {
          console.log("AuthProvider: No token found in localStorage.");
          setUser(null); // Ensure user is null if no token
        }
      } catch (e) {
          console.error("AuthProvider: Error accessing localStorage", e);
          setError("Could not access storage for authentication.");
      }
      setIsAuthReady(true);
      console.log("AuthProvider: Auth readiness check complete. isAuthReady:", true);
    };
    loadAuthData();
  }, [clearError, fetchAndUpdateUser]);


  const login = useCallback(async (credentials: LoginFormData) => {
    clearError();
    setIsLoading(true);
    console.log("AuthProvider: login called with", credentials.email);
    try {
      const tokenResponse = await apiLoginUser(credentials);
      localStorage.setItem('authToken', tokenResponse.access_token);
      setToken(tokenResponse.access_token);
      console.log("AuthProvider: Login successful. Token stored. Fetching user details...");
      await fetchAndUpdateUser(tokenResponse.access_token); // Fetch and set user details
      
      const pathFromStorage = localStorage.getItem('redirectAfterLogin');
      const defaultRedirect = '/home'; // MODIFIED: Default redirect to /home
      const redirectPath = pathFromStorage || defaultRedirect;
      console.log("AuthProvider: Determined redirectPath:", redirectPath);
      
      if (pathFromStorage) {
        localStorage.removeItem('redirectAfterLogin');
      }
      router.push(redirectPath);
      console.log("AuthProvider: router.push called with:", redirectPath);
    } catch (err) {
      console.error("AuthProvider: Login failed", err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setError(err instanceof Error ? err.message : 'Login failed due to an unknown error.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router, clearError, fetchAndUpdateUser]);

  const signup = useCallback(async (userData: SignupData): Promise<UserPublic | undefined> => {
    clearError();
    setIsLoading(true);
    console.log("AuthProvider: signup called for", userData.email);
    try {
      const createdUser = await apiSignupUser(userData);
      console.log("AuthProvider: Signup successful.");
      // User will be redirected to login page by the signup page component
      return createdUser;
    } catch (err) {
      console.error("AuthProvider: Signup failed", err);
      setError(err instanceof Error ? err.message : 'Signup failed due to an unknown error.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const logout = useCallback(() => {
    clearError();
    console.log("AuthProvider: logout called.");
    localStorage.removeItem('authToken');
    localStorage.removeItem('redirectAfterLogin');
    setToken(null);
    setUser(null); // Clear user state on logout
    router.push('/login');
    console.log("AuthProvider: Logged out. Navigated to /login.");
  }, [router, clearError]);

  const isAuthenticated = !!token;

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAuthReady,
    error,
    login,
    signup,
    logout,
    clearError,
    fetchAndUpdateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth error: context is undefined. AuthProvider likely missing in component tree.");
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
