import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import { createResume } from '../api/resumes';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  pendingLocalResume: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  importLocalResume: () => Promise<void>;
  dismissLocalResume: () => void;
}

function hasLocalResume(): boolean {
  try {
    const data = localStorage.getItem('resume-data');
    return !!data;
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      pendingLocalResume: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.login(email, password);
          set({ user, token, isLoading: false });
          if (hasLocalResume()) {
            set({ pendingLocalResume: true });
          }
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Login failed', isLoading: false });
          throw err;
        }
      },

      register: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await authApi.register(email, password);
          set({ user, token, isLoading: false });
          if (hasLocalResume()) {
            set({ pendingLocalResume: true });
          }
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Registration failed', isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, pendingLocalResume: false });
      },

      clearError: () => {
        set({ error: null });
      },

      importLocalResume: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const dataStr = localStorage.getItem('resume-data');
          if (!dataStr) {
            set({ pendingLocalResume: false });
            return;
          }
          const parsed = JSON.parse(dataStr);
          const resumeData = parsed.state?.resume;
          if (resumeData) {
            await createResume(token, {
              title: resumeData.personalInfo?.name || '我的简历',
              templateId: resumeData.templateId || 'classic',
              data: resumeData,
            });
            localStorage.removeItem('resume-data');
          }
          set({ pendingLocalResume: false });
        } catch (err) {
          console.error('Import failed:', err);
          set({ pendingLocalResume: false });
        }
      },

      dismissLocalResume: () => {
        set({ pendingLocalResume: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
