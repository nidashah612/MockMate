import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { loginApi, registerApi, resetPasswordApi, fetchCurrentAuthUser } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (email: string, name: string, password?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mockmate_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mockmate_user');
      }
    }

    // Sync with backend
    fetchCurrentAuthUser()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('mockmate_user', JSON.stringify(res.user));
        }
      })
      .catch(() => {
        // Fallback default demo user if offline
        const defaultUser: UserProfile = {
          id: 'demo-user',
          email: 'alex.candidate@example.com',
          name: 'Alex Rivera',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString()
        };
        setUser(defaultUser);
        localStorage.setItem('mockmate_user', JSON.stringify(defaultUser));
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      setUser(res.user);
      localStorage.setItem('mockmate_user', JSON.stringify(res.user));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, name: string, password?: string) => {
    setLoading(true);
    try {
      const res = await registerApi(email, name, password);
      setUser(res.user);
      localStorage.setItem('mockmate_user', JSON.stringify(res.user));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const res = await resetPasswordApi(email);
    return res.message;
  };

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    try {
      const email = customEmail || 'google.candidate@gmail.com';
      const name = customName || 'Google Candidate';
      let res;
      try {
        res = await registerApi(email, name);
      } catch (e) {
        res = await loginApi(email);
      }
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('mockmate_user', JSON.stringify(res.user));
      }
    } catch (e: any) {
      console.warn('Google sign in error, fallback to demo user:', e);
      const googleUser: UserProfile = {
        id: 'demo-user',
        email: customEmail || 'google.candidate@gmail.com',
        name: customName || 'Google Candidate',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      };
      setUser(googleUser);
      localStorage.setItem('mockmate_user', JSON.stringify(googleUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockmate_user');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, resetPassword, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
