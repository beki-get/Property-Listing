'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Persisted to localStorage under 'hr_auth' key.
// Token is also written separately as 'hr_token' so the API client
// (which runs outside React) can read it without importing the store.
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('hr_token', token);
        }
        set({ user, token });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hr_token');
        }
        set({ user: null, token: null });
      },

      setHydrated: () => set({ isHydrated: true }),

      // Derived helpers
      isLoggedIn: () => Boolean(get().user && get().token),
      isOwner:    () => get().user?.role === 'owner',
      isAdmin:    () => get().user?.role === 'admin',
      isUser:     () => get().user?.role === 'user',
    }),
    {
      name: 'hr_auth',
      // Only persist user + token, not isHydrated
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sync token to localStorage for the API client
          if (state.token && typeof window !== 'undefined') {
            localStorage.setItem('hr_token', state.token);
          }
          state.setHydrated();
        }
      },
    }
  )
);

export default useAuthStore;
