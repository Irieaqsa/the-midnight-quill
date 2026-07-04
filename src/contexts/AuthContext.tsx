import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'MEMBER' | 'EDITOR' | 'ADMIN';
  bio?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (token: string, password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tmq_token', data.token);
        return data.token;
      }
    } catch (err) {
      console.error('Error refreshing token:', err);
    }
    return null;
  };

  // Helper to fetch user data with local token
  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token might have expired, try to refresh
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry with new token
          const retryRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${newToken}`,
            },
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            setUser(data.user);
            return;
          }
        }
        // If refresh fails, log out
        localStorage.removeItem('tmq_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('tmq_token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }

    // Refresh token every 10 minutes in the background
    const interval = setInterval(async () => {
      const currentToken = localStorage.getItem('tmq_token');
      if (currentToken) {
        await refreshAccessToken();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('tmq_token', data.token);
        setUser(data.user);
        return { error: null };
      } else {
        return { error: data.error || 'Signup failed' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Could not connect to the authentication server.' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('tmq_token', data.token);
        setUser(data.user);
        return { error: null };
      } else {
        return { error: data.error || 'Login failed' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Could not connect to the authentication server.' };
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('tmq_token');
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('tmq_token');
      setUser(null);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        return { error: null };
      } else {
        return { error: data.error || 'Request failed' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Could not connect to the authentication server.' };
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        return { error: null };
      } else {
        return { error: data.error || 'Reset failed' };
      }
    } catch (err) {
      console.error(err);
      return { error: 'Could not connect to the authentication server.' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      sendPasswordReset,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
