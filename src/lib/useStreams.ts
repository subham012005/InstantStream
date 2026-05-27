import { useState } from 'react';

export interface Stream {
  url: string;
  quality: string;
  proxyable: boolean;
  headers?: Record<string, string>;
  captions?: any[];
}

export interface StreamsResponse {
  streams: Stream[];
  type: string;
  imdbId: string;
  contentType: string;
}

export interface StreamsError {
  error: string;
}

export function useStreams() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);

  const fetchStreams = async (
    imdbId: string,
    type: 'movie' | 'series' = 'movie',
    season?: number,
    episode?: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      setStreams([]);

      const params = new URLSearchParams({
        type,
        ...(season && { season: String(season) }),
        ...(episode && { episode: String(episode) }),
      });

      const response = await fetch(`/api/streams/${imdbId}?${params.toString()}`);

      if (!response.ok) {
        const errorData = (await response.json()) as StreamsError;
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = (await response.json()) as StreamsResponse;
      setStreams(data.streams);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useStreams]', message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { fetchStreams, loading, error, streams };
}
