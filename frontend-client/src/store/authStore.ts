import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  fullName: string;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  getToken: () => string | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      getToken: () => get().user?.accessToken ?? null,
    }),
    { name: 'bd-auth' }
  )
);
