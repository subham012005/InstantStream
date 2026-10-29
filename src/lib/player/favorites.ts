/**
 * Favorites Manager
 * Stores and manages bookmarked movies and shows in localStorage.
 */

export interface FavoriteItem {
  id: string; // IMDb ID or TMDB ID
  title: string;
  poster?: string | null;
  type?: 'movie' | 'series' | string;
  year?: string;
  rating?: string;
  addedAt: number;
}

const STORAGE_KEY = 'instantstream_favorites';

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.addedAt - a.addedAt);
    }
    return [];
  } catch {
    return [];
  }
}

export function isFavorite(id: string): boolean {
  if (!id || typeof window === 'undefined') return false;
  const list = getFavorites();
  return list.some(f => f.id === id);
}

export function toggleFavorite(item: Omit<FavoriteItem, 'addedAt'>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getFavorites();
    const existingIndex = list.findIndex(f => f.id === item.id);

    if (existingIndex >= 0) {
      // Remove
      list.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event('instantstream_favorites_updated'));
      return false;
    } else {
      // Add
      const updatedList = [{ ...item, addedAt: Date.now() }, ...list];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event('instantstream_favorites_updated'));
      return true;
    }
  } catch (err) {
    console.error('Failed to toggle favorite:', err);
    return false;
  }
}

export function removeFavorite(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getFavorites();
    const filtered = list.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('instantstream_favorites_updated'));
  } catch (err) {
    console.error('Failed to remove favorite:', err);
  }
}
