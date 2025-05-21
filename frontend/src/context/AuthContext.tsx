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
      UserPublic, // This interface no longer has profilePictureUrl
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
      fetchAndUpdateUser: (token: string) => Promise<void>;
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    interface AuthProviderProps {
      children: ReactNode;
    }

    export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
      const [user, setUser] = useState<UserPublic | null>(null);
      const [token, setToken] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState(false);
      const [isAuthReady, setIsAuthReady] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const router = useRouter();

      const clearError = useCallback(() => { setError(null); }, []);

      const fetchAndSetCurrentUser = useCallback(async (currentToken: string) => {
        if (!currentToken) {
          setUser(null); setToken(null); localStorage.removeItem('authToken'); return;
        }
        console.log("AuthProvider: Attempting to fetch current user with token.");
        try {
          const fetchedUser = await apiGetUserProfile(currentToken);
          setUser(fetchedUser); // User object will not have profilePictureUrl
          setToken(currentToken);
          console.log("AuthProvider: Current user details fetched and set:", fetchedUser);
        } catch (e) {
          console.error("AuthProvider: Failed to fetch current user details.", e);
          setUser(null); setToken(null); localStorage.removeItem('authToken');
          localStorage.removeItem('redirectAfterLogin');
          setError(e instanceof Error ? e.message : "Session expired or invalid.");
          if (router && typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      }, [router]);

      useEffect(() => {
        const loadAuthData = async () => {
          clearError();
          const storedToken = localStorage.getItem('authToken');
          if (storedToken) {
            await fetchAndSetCurrentUser(storedToken);
          } else {
            setUser(null);
          }
          setIsAuthReady(true);
        };
        loadAuthData();
      }, [clearError, fetchAndSetCurrentUser]);

      const login = useCallback(async (credentials: LoginFormData) => {
        clearError(); setIsLoading(true);
        try {
          const tokenResponse = await apiLoginUser(credentials);
          localStorage.setItem('authToken', tokenResponse.access_token);
          await fetchAndSetCurrentUser(tokenResponse.access_token);
          const pathFromStorage = localStorage.getItem('redirectAfterLogin');
          const defaultRedirect = '/home';
          const redirectPath = pathFromStorage || defaultRedirect;
          if (pathFromStorage) localStorage.removeItem('redirectAfterLogin');
          router.push(redirectPath);
        } catch (err) {
          localStorage.removeItem('authToken'); setToken(null); setUser(null);
          setError(err instanceof Error ? err.message : 'Login failed.');
          throw err;
        } finally { setIsLoading(false); }
      }, [router, clearError, fetchAndSetCurrentUser]);

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
        login, signup, logout, clearError, fetchAndUpdateUser: fetchAndSetCurrentUser
      };

      return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
    };

    export const useAuth = (): AuthContextType => {
      const context = useContext(AuthContext);
      if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
      return context;
    };
    