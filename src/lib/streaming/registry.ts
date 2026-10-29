/**
 * Centralized Streaming Provider Registry
 * Manages streaming server definitions, URL generation, source resolution, and server switching.
 */

export interface ServerOption {
  id: string;
  name: string;
  badge?: string;
  description: string;
  type: 'embed' | 'native' | 'terabox';
  isDefault?: boolean;
  reqImdb: boolean;
  reqTmdb: boolean;
  supportsSeries: boolean;
  getUrl: (params: {
    imdbId?: string;
    tmdbId?: string;
    season?: number;
    episode?: number;
    isSeries?: boolean;
    rawUrl?: string;
  }) => string | null;
}

/**
 * Validates IMDb identifier format: 'tt' followed by 7-8 digits
 */
export function isValidImdbId(id?: string | null): boolean {
  if (!id) return false;
  return /^tt\d{7,8}$/.test(id.trim());
}

/**
 * Central registry of all supported streaming servers
 */
export const STREAMING_SERVERS: ServerOption[] = [
  {
    id: 'server1',
    name: 'Server 1 (Primary - Slast)',
    badge: 'Fast & HD',
    description: 'Direct high-speed streaming via Slast430',
    type: 'embed',
    isDefault: true,
    reqImdb: true,
    reqTmdb: false,
    supportsSeries: true,
    getUrl: ({ imdbId, season, episode, isSeries }) => {
      if (!isValidImdbId(imdbId)) return null;
      const cleanImdb = imdbId!.trim();
      if (isSeries && season && episode) {
        return `https://slast430did.com/play/${cleanImdb}?s=${season}&e=${episode}`;
      }
      return `https://slast430did.com/play/${cleanImdb}`;
    },
  },
  {
    id: 'server2',
    name: 'Server 2 (VixSrc)',
    badge: 'Mirror 1',
    description: 'Alternative HD stream mirror with subtitle options',
    type: 'embed',
    reqImdb: true,
    reqTmdb: false,
    supportsSeries: true,
    getUrl: ({ imdbId, season, episode, isSeries }) => {
      if (!isValidImdbId(imdbId)) return null;
      const cleanImdb = imdbId!.trim();
      if (isSeries && season && episode) {
        return `https://vixsrc.to/tv/${cleanImdb}/${season}/${episode}`;
      }
      return `https://vixsrc.to/movie/${cleanImdb}`;
    },
  },
  {
    id: 'server3',
    name: 'Server 3 (Videasy)',
    badge: 'Mirror 2',
    description: 'High compatibility multi-server source (requires TMDB ID)',
    type: 'embed',
    reqImdb: false,
    reqTmdb: true,
    supportsSeries: true,
    getUrl: ({ tmdbId, season, episode, isSeries }) => {
      if (!tmdbId || !/^\d+$/.test(String(tmdbId).trim())) return null;
      const cleanTmdb = String(tmdbId).trim();
      if (isSeries && season && episode) {
        return `https://player.videasy.net/tv/${cleanTmdb}/${season}/${episode}`;
      }
      return `https://player.videasy.net/movie/${cleanTmdb}`;
    },
  },
  {
    id: 'server-native',
    name: 'Server 4 (Ad-Free Native)',
    badge: 'Native Player',
    description: 'Telegram-style custom player with HLS quality & audio selectors',
    type: 'native',
    reqImdb: false,
    reqTmdb: true,
    supportsSeries: true,
    getUrl: () => 'native',
  },
];

export const DEFAULT_SERVER_ID = 'server1';

/**
 * Returns a server configuration by ID
 */
export function getServerById(id: string): ServerOption {
  const found = STREAMING_SERVERS.find(s => s.id === id);
  return found || STREAMING_SERVERS[0];
}

/**
 * Resolves the playback URL for a specific server and movie/series parameters
 */
export function resolveServerUrl(
  serverId: string,
  params: {
    imdbId?: string;
    tmdbId?: string;
    season?: number;
    episode?: number;
    isSeries?: boolean;
    rawUrl?: string;
  }
): string | null {
  const server = getServerById(serverId);
  return server.getUrl(params);
}
