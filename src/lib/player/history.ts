/**
 * Watch History Manager
 * Stores and retrieves playback progress, recently watched items, and resume positions in localStorage.
 */

export interface WatchHistoryItem {
  id: string; // IMDb ID, TMDB ID, or stream URL
  title: string;
  poster?: string | null;
  type?: 'movie' | 'series' | 'direct' | 'terabox' | string;
  season?: number;
  episode?: number;
  progress: number; // in seconds
  duration: number; // in seconds
  percent: number; // 0-100
  updatedAt: number;
}

const STORAGE_KEY = 'instantstream_watch_history';
const MAX_HISTORY_ITEMS = 20;

export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return [];
  } catch {
    return [];
  }
}

export function getWatchProgress(id: string, season?: number, episode?: number): WatchHistoryItem | null {
  const history = getWatchHistory();
  if (season !== undefined && episode !== undefined) {
    return history.find(h => h.id === id && h.season === season && h.episode === episode) || null;
  }
  return history.find(h => h.id === id) || null;
}

export function saveWatchProgress(item: Omit<WatchHistoryItem, 'updatedAt' | 'percent'>): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getWatchHistory();
    const percent = item.duration > 0 ? Math.min(100, Math.round((item.progress / item.duration) * 100)) : 0;
    
    // Key by ID and season/episode if TV
    const keyMatch = (h: WatchHistoryItem) => {
      if (item.season !== undefined && item.episode !== undefined) {
        return h.id === item.id && h.season === item.season && h.episode === item.episode;
      }
      return h.id === item.id;
    };

    const existingIndex = history.findIndex(keyMatch);
    const updatedItem: WatchHistoryItem = {
      ...item,
      percent,
      updatedAt: Date.now(),
    };

    let nextHistory: WatchHistoryItem[];
    if (existingIndex >= 0) {
      history[existingIndex] = updatedItem;
      nextHistory = history;
    } else {
      nextHistory = [updatedItem, ...history];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory.slice(0, MAX_HISTORY_ITEMS)));
    window.dispatchEvent(new Event('instantstream_history_updated'));
  } catch (err) {
    console.error('Failed to save watch history:', err);
  }
}

export function removeWatchHistory(id: string, season?: number, episode?: number): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getWatchHistory();
    const filtered = history.filter(h => {
      if (season !== undefined && episode !== undefined) {
        return !(h.id === id && h.season === season && h.episode === episode);
      }
      return h.id !== id;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('instantstream_history_updated'));
  } catch (err) {
    console.error('Failed to remove watch history:', err);
  }
}

export function clearWatchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('instantstream_history_updated'));
  } catch (err) {
    console.error('Failed to clear watch history:', err);
  }
}
