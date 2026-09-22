import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserPermissions } from '../types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: UserPermissions;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'manualhub_auth_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    // Verify session token against /api/auth/me
    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      throw new Error(data.error || 'Falha na autenticação. Verifique usuário e senha.');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
