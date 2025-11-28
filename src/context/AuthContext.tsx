'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@shared/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('verbocare_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiClient.get<User>('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('verbocare_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('verbocare_token', response.data.token);
    setUser(response.data.user);

    const roleRoutes = {
      patient: '/patient/dashboard',
      worker: '/worker/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard',
    };

    router.push(roleRoutes[response.data.user.role]);
  };

  const register = async (data: RegisterRequest) => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    localStorage.setItem('verbocare_token', response.data.token);
    setUser(response.data.user);

    const roleRoutes = {
      patient: '/patient/dashboard',
      worker: '/worker/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard',
    };

    router.push(roleRoutes[response.data.user.role]);
  };

  const logout = () => {
    localStorage.removeItem('verbocare_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
