import { create } from 'zustand';
import { authApi } from '../api/auth';

interface User {
  id: number;
  username: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    localStorage.setItem('token', res.token);
    set({
      token: res.token,
      user: { id: 0, username: res.username, displayName: res.displayName },
      isAuthenticated: true,
    });
    // Fetch full profile
    try {
      const profile = await authApi.getProfile();
      set({ user: profile });
    } catch {
      // Profile fetch failed, but login succeeded
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    try {
      const profile = await authApi.getProfile();
      set({ user: profile, isAuthenticated: true, token });
    } catch {
      localStorage.removeItem('token');
      set({ isAuthenticated: false, user: null, token: null });
    }
  },
}));
