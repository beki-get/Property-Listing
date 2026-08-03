'use client';
import { create } from 'zustand';
import { favoriteApi } from '../lib/api';

// Favorites store with:
// 1. Optimistic UI updates (add/remove instantly, roll back on error)
// 2. Cross-tab sync via BroadcastChannel
const useFavoritesStore = create((set, get) => ({
  favorites: [],      // Array of favorite objects from API
  favoriteIds: new Set(), // Set of propertyId strings for O(1) lookup
  loading: false,
  initialized: false,
  channel: null,

  // Call once on mount when user is logged in
  init: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const data = await favoriteApi.getAll();
      const favs = data.data?.favorites || [];
      const ids = new Set(favs.map((f) => f.propertyId));
      set({ favorites: favs, favoriteIds: ids, initialized: true });
    } catch {
      // Silent — user sees empty state, not an error
    } finally {
      set({ loading: false });
    }

    // Cross-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const ch = new BroadcastChannel('hr_favorites');
      ch.onmessage = (e) => {
        if (e.data?.type === 'SYNC') {
          const favs = e.data.favorites || [];
          const ids = new Set(favs.map((f) => f.propertyId));
          set({ favorites: favs, favoriteIds: ids });
        }
      };
      set({ channel: ch });
    }
  },

  // Broadcast to other tabs
  _broadcast: (favorites) => {
    const ch = get().channel;
    if (ch) ch.postMessage({ type: 'SYNC', favorites });
  },

  // Optimistic add
  add: async (propertyId, propertySnapshot) => {
    const prevFavs = get().favorites;
    const prevIds  = new Set(get().favoriteIds);

    // Optimistic update
    const tempFav = { id: `temp-${propertyId}`, propertyId, property: propertySnapshot };
    const newFavs = [...prevFavs, tempFav];
    const newIds  = new Set([...prevIds, propertyId]);
    set({ favorites: newFavs, favoriteIds: newIds });
    get()._broadcast(newFavs);

    try {
      const data = await favoriteApi.add(propertyId);
      // Replace temp with real record
      const realFav = data.data?.favorite || tempFav;
      const confirmed = [...prevFavs.filter((f) => f.id !== tempFav.id), realFav];
      set({ favorites: confirmed, favoriteIds: new Set(confirmed.map((f) => f.propertyId)) });
      get()._broadcast(confirmed);
    } catch {
      // Roll back
      set({ favorites: prevFavs, favoriteIds: prevIds });
      get()._broadcast(prevFavs);
      const errorMessage = error.response?.data?.message || 'Failed, try again'
      throw new Error('Could not save to favorites. Please try again.');
      toast.error(errorMessage)
    }
  },

  // Optimistic remove
  remove: async (propertyId) => {
    const prevFavs = get().favorites;
    const prevIds  = new Set(get().favoriteIds);

    const newFavs = prevFavs.filter((f) => f.propertyId !== propertyId);
    const newIds  = new Set(newFavs.map((f) => f.propertyId));
    set({ favorites: newFavs, favoriteIds: newIds });
    get()._broadcast(newFavs);

    try {
      await favoriteApi.remove(propertyId);
    } catch {
      set({ favorites: prevFavs, favoriteIds: prevIds });
      get()._broadcast(prevFavs);
      throw new Error('Could not remove from favorites. Please try again.');
    }
  },

  isFavorited: (propertyId) => get().favoriteIds.has(propertyId),

  reset: () => {
    const ch = get().channel;
    if (ch) ch.close();
    set({ favorites: [], favoriteIds: new Set(), initialized: false, channel: null });
  },
}));

export default useFavoritesStore;
