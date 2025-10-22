import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setToken, loadTokenFromStorage, api } from '../api/client';
import type { LoginResponse, User } from '../api/types';

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setTok] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const t = loadTokenFromStorage();
    if (t) {
      setTok(t);
      setToken(t);
      // opcional: fetch /me
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<LoginResponse>('/auth/login', { email, password }, false);
    setTok(res.token);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = () => {
    setTok(null);
    setUser(null);
    setToken(null);
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};