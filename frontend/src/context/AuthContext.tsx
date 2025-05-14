// D:\socialadify\frontend\src\context\AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } // Removed usePathname as it's not used
from 'next/navigation'; 
import {
  loginUser as apiLoginUser,
  signupUser as apiSignupUser,
  LoginFormData, // Should now be correctly imported
  SignupData,    // Should now be correctly imported
  UserPublic,    // Should now be correctly imported
} from '@/services/authService';

// 1. Define the shape of the context data
interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial loading & auth operations
  isAuthReady: boolean; // True once initial token load attempt is complete
  login: (credentials: LoginFormData) => Promise<void>;
  signup: (userData: SignupData) => Promise<UserPublic | undefined>;
  logout: () => void;
}

// 2. Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the AuthProvider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [isAuthReady, setIsAuthReady] = useState(false); 

  const router = useRouter();
  // const pathname = usePathname(); // REMOVED as it was unused

  // Effect for initial token and user loading
  useEffect(() => {
    const loadAuthData = async () => {
      console.log("AuthProvider: Checking for existing token...");
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        console.log("AuthProvider: Token found in localStorage.", storedToken);
        setToken(storedToken);
        // TODO: Implement a /users/me endpoint in the backend
        // to verify token and fetch full user details.
        // For now, `user` will remain null until explicitly set after login or a future /me call.
      } else {
        console.log("AuthProvider: No token found in localStorage.");
      }
      setIsAuthReady(true); 
      console.log("AuthProvider: Auth readiness set to true.");
    };
    loadAuthData();
  }, []); 


  // Login function
  const login = useCallback(async (credentials: LoginFormData) => {
    setIsLoading(true);
    try {
      const tokenResponse = await apiLoginUser(credentials);
      localStorage.setItem('authToken', tokenResponse.access_token);
      setToken(tokenResponse.access_token);
      // TODO: After login, fetch full user details.
      console.log("AuthProvider: Login successful. Token set.");

      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/dashboard';
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);

    } catch (err) {
      console.error("AuthProvider: Login failed", err);
      localStorage.removeItem('authToken'); 
      setToken(null);
      setUser(null);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Signup function
  const signup = useCallback(async (userData: SignupData): Promise<UserPublic | undefined> => {
    setIsLoading(true);
    try {
      const createdUser = await apiSignupUser(userData);
      console.log("AuthProvider: Signup successful.", createdUser);
      return createdUser;
    } catch (err) {
      console.error("AuthProvider: Signup failed", err);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  }, []); 

  // Logout function
  const logout = useCallback(() => {
    console.log("AuthProvider: Logging out.");
    localStorage.removeItem('authToken');
    localStorage.removeItem('redirectAfterLogin'); 
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!token;

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAuthReady, 
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Create a Custom Hook to consume the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
