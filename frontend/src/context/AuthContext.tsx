// D:\socialadify\frontend\src\context\AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    loginUser as apiLoginUser,
    signupUser as apiSignupUser,
    getUserProfile as apiGetUserProfile,
    LoginFormData,
    SignupData,
    UserPublic,
} from '../services/authService';

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
    fetchAndUpdateUser: () => Promise<void>;
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
    const pathname = usePathname(); // Get current path

    const clearError = useCallback(() => { setError(null); }, []);

    // The fetchAndUpdateUser function is now stable and doesn't depend on changing values like `token`.
    // It reads directly from localStorage, making it safe to use in other callbacks.
    const fetchAndUpdateUser = useCallback(async () => {
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            return;
        }

        console.log("AuthProvider: Fetching user profile...");
        try {
            const fetchedUser = await apiGetUserProfile(storedToken);
            setUser(fetchedUser);
            setToken(storedToken);
            console.log("AuthProvider: User profile fetched and set:", fetchedUser);
        } catch (e) {
            console.error("AuthProvider: Failed to fetch user profile.", e);
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            setError(e instanceof Error ? e.message : "Session expired or invalid.");
            // Redirect to login if the user is not already on a public page
            if (pathname !== '/login' && pathname !== '/signup') {
                router.push('/login');
            }
        }
    }, [router, pathname]); // Dependencies are stable

    // This useEffect now runs ONLY ONCE when the component first mounts.
    // It checks for a token and validates it, setting the initial auth state.
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                await fetchAndUpdateUser();
            }
            setIsAuthReady(true);
        };
        initializeAuth();
        // The empty dependency array [] ensures this runs only once.
    }, [fetchAndUpdateUser]);

    const login = useCallback(async (credentials: LoginFormData) => {
        clearError();
        setIsLoading(true);
        try {
            const tokenResponse = await apiLoginUser(credentials);
            localStorage.setItem('authToken', tokenResponse.access_token);
            await fetchAndUpdateUser(); // This will now set the user and token state
            
            const redirectPath = localStorage.getItem('redirectAfterLogin') || '/home';
            localStorage.removeItem('redirectAfterLogin');
            router.push(redirectPath);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [router, clearError, fetchAndUpdateUser]);

    const signup = useCallback(async (userData: SignupData): Promise<UserPublic | undefined> => {
        clearError();
        setIsLoading(true);
        try {
            const createdUser = await apiSignupUser(userData);
            return createdUser;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [clearError]);

    const logout = useCallback(() => {
        clearError();
        localStorage.removeItem('authToken');
        localStorage.removeItem('redirectAfterLogin');
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router, clearError]);

    const contextValue: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAuthReady,
        error,
        login,
        signup,
        logout,
        clearError,
        fetchAndUpdateUser
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
