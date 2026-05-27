# Stremio Addon Integration into InstantStream

## Overview
Successfully integrated stremio-addon-streamimdb streaming logic into the InstantStream Next.js application as API routes. The entire app now runs with a single `npm run dev` command on Vercel.

## What Was Done

### 1. **Dependencies Added** (package.json)
- `@movie-web/providers` - Movie/series streaming provider library
- `axios` - HTTP client for API calls

### 2. **New Library Files Created**

#### `/src/lib/providers.ts`
Converts movie-web providers library to work with Next.js:
- `createFetcher()` - Creates a standard fetcher for providers
- `searchStreams()` - Searches for streams via TMDB ID
- `fetchFromProviders()` - Main export for fallback provider lookup
- Implements TMDB ID conversion from IMDb IDs

#### `/src/lib/scraper.ts`
Core streaming scraping logic from the addon:
- **Caching system** - 5-minute TTL cache for streams
- **Queue management** - Prevents overload (max 8 concurrent requests)
- **Stream resolution** - Tests and validates M3U8 playlists
- **Master playlist parsing** - Extracts quality variants from HLS streams
- **Fallback mechanism** - Uses movie-web providers if primary fails

**Key functions:**
- `fetchVideoSource()` - Main function to fetch streams for IMDb ID
- `resolveStream()` - Validates M3U8 URLs
- `getStatus()` - Returns cache status and active requests

#### `/src/lib/useStreams.ts`
React hook for frontend integration:
```typescript
const { fetchStreams, loading, error, streams } = useStreams();
await fetchStreams('tt0068646', 'movie'); // IMDb ID, type
```

### 3. **API Routes Created**

#### `/api/streams/[imdbId]/route.ts` 
Main streaming API endpoint:
- **GET** - Fetch streams for a movie/series
  - Query params: `type`, `season`, `episode`
  - Returns: Stream objects with quality, URL, headers
  
- **POST** - Cache invalidation (ready for implementation)

#### `/api/status/route.ts`
Cache status monitoring endpoint:
- Returns active scrapes, cache size, TTL info

### 4. **What Was Removed**
- ❌ `server.js` - No longer needed
- ❌ `addon.js` - Stremio-specific wrapper removed
- ❌ `health.js` - Health checks moved to runtime logs
- ❌ `build.sh` - Express server startup script
- ❌ Stremio addon SDK dependency

## API Usage Examples

### Fetch Movie Streams
```bash
GET /api/streams/tt0068646?type=movie
```

**Response:**
```json
{
  "streams": [
    {
      "url": "https://...",
      "quality": "1080p",
      "proxyable": false,
      "headers": {...}
    }
  ],
  "type": "direct",
  "imdbId": "tt0068646",
  "contentType": "movie"
}
```

### Fetch Series Streams
```bash
GET /api/streams/tt0944947?type=series&season=1&episode=1
```

### Get Cache Status
```bash
GET /api/status
```

**Response:**
```json
{
  "activeScrapes": 0,
  "maxQueue": 8,
  "cache": {
    "size": 2,
    "ttlSeconds": 300,
    "entries": [...]
  }
}
```

## Frontend Integration

### Using the Hook
```typescript
import { useStreams } from '@/lib/useStreams';

function VideoPlayer({ imdbId }) {
  const { fetchStreams, loading, error, streams } = useStreams();

  useEffect(() => {
    fetchStreams(imdbId, 'movie');
  }, [imdbId]);

  if (loading) return <div>Loading streams...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!streams.length) return <div>No streams found</div>;

  return (
    <div>
      {streams.map((stream, i) => (
        <button key={i} onClick={() => playStream(stream.url)}>
          {stream.quality}
        </button>
      ))}
    </div>
  );
}
```

## Running the Application

### Development
```bash
cd instantstream
npm run dev
```
- Server runs on `http://localhost:3000`
- All streaming API endpoints available at `/api/streams/[imdbId]`

### Production (Vercel)
```bash
npm run build
npm start
```
- Single deployment works on Vercel
- No separate server process needed
- All requests handled by Next.js API routes

## Environment Variables

Optional configuration:
```env
# Custom streaming API URL
VAPLAYER_API_URL=https://streamdata.vaplayer.ru/api.php

# Cache TTL in milliseconds (default: 300000 = 5 min)
CACHE_TTL_MS=300000

# Max concurrent requests (default: 8)
MAX_QUEUE=8
```

## Architecture

```
instantstream/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── streams/[imdbId]/route.ts    ← Main API endpoint
│   │   │   └── status/route.ts              ← Cache monitoring
│   │   └── ...
│   └── lib/
│       ├── providers.ts                      ← Movie-web integration
│       ├── scraper.ts                        ← Core streaming logic
│       └── useStreams.ts                     ← React hook
└── package.json
```

## Files Modified
- ✏️ `package.json` - Added `@movie-web/providers` and `axios`

## Files Created
- ✨ `src/lib/providers.ts` - 120 lines
- ✨ `src/lib/scraper.ts` - 250 lines
- ✨ `src/lib/useStreams.ts` - 50 lines
- ✨ `src/app/api/streams/[imdbId]/route.ts` - 60 lines
- ✨ `src/app/api/status/route.ts` - 15 lines

## Testing Status
✅ Build successful: `npm run build`
✅ Dev server running: `npm run dev`
✅ TypeScript types validated
✅ Ready for Vercel deployment

## Next Steps (Optional)
1. Add stream proxy endpoint for CORS/header handling
2. Implement subtitle support
3. Add analytics for popular streams
4. Create admin dashboard for cache management
5. Add rate limiting per IP address
6. Implement stream quality auto-detection

## Summary
The stremio-addon-streamimdb is now fully integrated into instantstream. Users access streams through the website, with the streaming logic running as Next.js API routes. Everything deploys as a single application on Vercel with `npm run dev` during development.
