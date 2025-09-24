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
    UserPublic,
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
    fetchAndUpdateUser: (tokenToUse?: string) => Promise<void>;
    // HIGHLIGHTED CHANGE START
    loginWithToken: (token: string) => Promise<void>; // New function for direct token login
    // HIGHLIGHTED CHANGE END
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

    const fetchAndUpdateUser = useCallback(async (tokenToUse?: string) => {
        const currentToken = tokenToUse || localStorage.getItem('authToken');
        if (!currentToken) {
            setUser(null); setToken(null); localStorage.removeItem('authToken');
            setIsLoading(false);
            return;
        }
        console.log("AuthProvider: Attempting to fetch/update current user with token.");
        setIsLoading(true);
        try {
            const fetchedUser = await apiGetUserProfile(currentToken);
            setUser(fetchedUser);
            setToken(currentToken);
            if (!localStorage.getItem('authToken')) {
                localStorage.setItem('authToken', currentToken);
            }
            console.log("AuthProvider: Current user details fetched/updated and set:", fetchedUser);
        } catch (e) {
            console.error("AuthProvider: Failed to fetch/update current user details.", e);
            setUser(null); setToken(null); localStorage.removeItem('authToken');
            localStorage.removeItem('redirectAfterLogin');
            setError(e instanceof Error ? e.message : "Session expired or invalid.");
            if (router && typeof window !== 'undefined' && window.location.pathname !== '/login') {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const loadAuthData = async () => {
            clearError();
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                await fetchAndUpdateUser(storedToken);
            } else {
                setUser(null);
                setToken(null);
            }
            setIsAuthReady(true);
        };
        loadAuthData();
    }, [clearError, fetchAndUpdateUser]);

    const login = useCallback(async (credentials: LoginFormData) => {
        clearError(); setIsLoading(true);
        try {
            const tokenResponse = await apiLoginUser(credentials);
            await fetchAndUpdateUser(tokenResponse.access_token);
            const pathFromStorage = localStorage.getItem('redirectAfterLogin');
            const defaultRedirect = '/home';
            const redirectPath = pathFromStorage || defaultRedirect;
            if (pathFromStorage) localStorage.removeItem('redirectAfterLogin');
            router.push(redirectPath);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed.');
            throw err;
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

    // HIGHLIGHTED CHANGE START
    const loginWithToken = useCallback(async (accessToken: string) => {
        clearError();
        setIsLoading(true);
        try {
            // Directly set the token and fetch user data without going through loginUser
            localStorage.setItem('authToken', accessToken);
            await fetchAndUpdateUser(accessToken);
            // Redirection will be handled by the useEffect watching isAuthenticated
            console.log("AuthContext: User logged in directly with token (e.g., Google).");
        } catch (err) {
            console.error("AuthContext: Failed to log in with external token.", err);
            setError(err instanceof Error ? err.message : 'Authentication failed.');
            setUser(null);
            setToken(null);
            localStorage.removeItem('authToken');
            localStorage.removeItem('redirectAfterLogin');
            // Do not re-throw here, as the component handling Google login might not expect it
        } finally {
            setIsLoading(false);
        }
    }, [clearError, fetchAndUpdateUser]);
    // HIGHLIGHTED CHANGE END

    const isAuthenticated = !!token && !!user;

    const contextValue: AuthContextType = {
        user, token, isAuthenticated, isLoading, isAuthReady, error,
        login, signup, logout, clearError, fetchAndUpdateUser,
        // HIGHLIGHTED CHANGE START
        loginWithToken // Expose the new function
        // HIGHLIGHTED CHANGE END
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) { throw new Error('useAuth must be used within an AuthProvider'); }
    return context;
};