import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  college?: string;
  branch?: string;
  yearOfGraduation?: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Validate token with backend before setting isAuthenticated
      set({
        token,
        isAuthenticated: true,
      });
    } else {
      set({
        token: null,
        isAuthenticated: false,
      });
    }
  },
}));
