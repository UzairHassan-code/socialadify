// D:\socialadify\frontend\src\context\AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  loginUser as apiLoginUser,
  signupUser as apiSignupUser,
  getUserProfile as apiGetUserProfile,
  LoginFormData,
  SignupData,
  UserPublic, // This interface from authService now includes profile_picture_url
  // apiUpdateUserProfileText, // We might call this directly from modal or here
  // apiUploadProfilePicture, // We might call this directly from modal or here
} from '@/services/authService';

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthReady: boolean;
  error: string | null;
  login: (credentials: LoginFormData) => Promise<void>;
  signup: (userData: SignupData) => Promise<UserPublic | undefined>;
  logout: () => void;
  clearError: () => void;
  fetchAndUpdateUser: (tokenToUse?: string) => Promise<void>; // Modified to accept optional token
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // General loading for login/signup
  const [isAuthReady, setIsAuthReady] = useState(false); // For initial token check
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => { setError(null); }, []);

  const fetchAndUpdateUser = useCallback(async (tokenToUse?: string) => {
    const currentToken = tokenToUse || localStorage.getItem('authToken'); // Use provided or stored token
    if (!currentToken) {
      setUser(null); setToken(null); localStorage.removeItem('authToken');
      setIsLoading(false); // Ensure loading is false if no token
      return;
    }
    console.log("AuthProvider: Attempting to fetch/update current user with token.");
    // setIsLoading(true); // Potentially set loading for user fetch
    try {
      const fetchedUser = await apiGetUserProfile(currentToken);
      setUser(fetchedUser); 
      setToken(currentToken); // Ensure token state is also set if using tokenToUse
      if (!localStorage.getItem('authToken')) { // If tokenToUse was provided and not in storage, store it
          localStorage.setItem('authToken', currentToken);
      }
      console.log("AuthProvider: Current user details fetched/updated and set:", fetchedUser);
    } catch (e) {
      console.error("AuthProvider: Failed to fetch/update current user details.", e);
      setUser(null); setToken(null); localStorage.removeItem('authToken');
      localStorage.removeItem('redirectAfterLogin');
      setError(e instanceof Error ? e.message : "Session expired or invalid.");
      // Only redirect if not already on login page to avoid loop
      if (router && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        router.push('/login');
      }
    } finally {
      // setIsLoading(false);
    }
  }, [router]); // Removed token from dependencies as we use currentToken

  useEffect(() => {
    const loadAuthData = async () => {
      clearError();
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        await fetchAndUpdateUser(storedToken);
      } else {
        setUser(null);
        setToken(null); // Ensure token state is also cleared
      }
      setIsAuthReady(true);
    };
    loadAuthData();
  }, [clearError, fetchAndUpdateUser]);

  const login = useCallback(async (credentials: LoginFormData) => {
    clearError(); setIsLoading(true);
    try {
      const tokenResponse = await apiLoginUser(credentials);
      // localStorage.setItem('authToken', tokenResponse.access_token); // fetchAndUpdateUser will handle this
      await fetchAndUpdateUser(tokenResponse.access_token); // Pass new token to immediately use and store
      const pathFromStorage = localStorage.getItem('redirectAfterLogin');
      const defaultRedirect = '/home';
      const redirectPath = pathFromStorage || defaultRedirect;
      if (pathFromStorage) localStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    } catch (err) {
      localStorage.removeItem('authToken'); setToken(null); setUser(null);
      setError(err instanceof Error ? err.message : 'Login failed.');
      throw err; // Re-throw for page-level handling if needed
    } finally { setIsLoading(false); }
  }, [router, clearError, fetchAndUpdateUser]);

  const signup = useCallback(async (userData: SignupData): Promise<UserPublic | undefined> => {
    clearError(); setIsLoading(true);
    try {
      const createdUser = await apiSignupUser(userData); return createdUser;
    } catch (err) { setError(err instanceof Error ? err.message : 'Signup failed.'); throw err; } 
    finally { setIsLoading(false); }
  }, [clearError]);

  const logout = useCallback(() => {
    clearError(); localStorage.removeItem('authToken'); localStorage.removeItem('redirectAfterLogin');
    setToken(null); setUser(null); router.push('/login');
  }, [router, clearError]);

  const isAuthenticated = !!token && !!user;

  const contextValue: AuthContextType = {
    user, token, isAuthenticated, isLoading, isAuthReady, error,
    login, signup, logout, clearError, fetchAndUpdateUser
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
};
