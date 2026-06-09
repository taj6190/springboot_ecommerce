import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    email: string;
    fullName: string;
    roles: string[];
  } | null;
  isAuthenticated: boolean;
  setAuth: (data: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (data: AuthResponse) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: {
            email: data.email,
            fullName: data.fullName,
            roles: data.roles,
          },
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
