'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (credentialResponse: any) => void;
  logout: () => void;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  authError: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setAuthError('Your session has expired. Please sign in again.');
        }
      } catch (error) {
        setAuthError('Session check failed. Please try again.');
        setIsAuthenticated(false);
        setUser(null);
        // Optionally, clear other sensitive/session data here
        console.error('Session check failed:', error);
      }
    };
    checkSession();
    // Periodically check session validity every 1 minute
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (credentialResponse: any) => {
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
        setAuthError(null);
      } else {
        setAuthError(data.error || 'Authentication failed.');
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('Google authentication failed. Please try again.');
      console.error('Google authentication failed:', error);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setUser(null);
      setAuthError(null);
    } catch (error) {
      setAuthError('Logout failed. Please try again.');
      console.error('Logout failed:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AuthContext.Provider
        value={{
          isAuthenticated,
          user,
          login,
          logout,
          authError,
        }}
      >
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}; 