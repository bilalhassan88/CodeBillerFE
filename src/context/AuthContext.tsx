import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import api from '../api/client';
import type { LoginResponse } from '../api/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  clinicId: string | null;
  email: string | null;
  role: number | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTokens: (data: LoginResponse) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const t = localStorage.getItem('accessToken');
    const r = localStorage.getItem('refreshToken');
    const c = localStorage.getItem('clinicId');
    const u = localStorage.getItem('userId');
    const e = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    return {
      accessToken: t,
      refreshToken: r,
      userId: u,
      clinicId: c,
      email: e,
      role: role != null ? parseInt(role, 10) : null,
      isAuthenticated: !!t,
    };
  });

  const setTokens = useCallback((data: LoginResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('clinicId', data.clinicId);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', String(data.role));
    setState({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.userId,
      clinicId: data.clinicId,
      email: data.email,
      role: data.role,
      isAuthenticated: true,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    setTokens(data);
  }, [setTokens]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('clinicId');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    setState({
      accessToken: null,
      refreshToken: null,
      userId: null,
      clinicId: null,
      email: null,
      role: null,
      isAuthenticated: false,
    });
  }, []);

  useEffect(() => {
    if (state.accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
    else delete api.defaults.headers.common['Authorization'];
  }, [state.accessToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
