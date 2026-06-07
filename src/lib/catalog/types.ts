/**
 * catalog/types.ts
 *
 * Central type contracts for the Netflix-mirror catalog system.
 * All providers — Demo, TMDB, FlixPatrol, uNoGS, or any future source —
 * must conform to these interfaces. No UI component or playback logic
 * should ever import from a concrete provider file directly.
 */

/* ─────────────────────────────────────────────
   Core item shape
───────────────────────────────────────────── */
export interface CatalogItem {
  /** Netflix content ID, passed directly to loadMeta(id) */
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  description?: string;
  /** e.g. "97% Match" — shown on cards */
  matchScore?: string;
  year?: string;
  /** Content rating, e.g. "TV-MA", "PG-13" */
  rating?: string;
  /** e.g. "3 Seasons", "1h 48m" */
  duration?: string;
  categories?: string[];
  isSeries?: boolean;
  /** 0-100, used for rank badges in Top-10 rows */
  rank?: number;
}

/* ─────────────────────────────────────────────
   Row shape
───────────────────────────────────────────── */
export type RowVariant =
  | "default"       // standard poster cards
  | "top10"         // large rank-number overlay
  | "continue"      // progress-bar cards (watch history)
  | "landscape";    // wide 16:9 cards

export interface CatalogRow {
  /** Row heading shown on the homepage */
  title: string;
  items: CatalogItem[];
  variant?: RowVariant;
  /** Hint that this row is live / loading asynchronously */
  isLoading?: boolean;
}

/* ─────────────────────────────────────────────
   Full homepage data snapshot
───────────────────────────────────────────── */
export interface CatalogHomepage {
  hero: CatalogItem;
  rows: CatalogRow[];
}

/* ─────────────────────────────────────────────
   Search results
───────────────────────────────────────────── */
export interface CatalogSearchResult {
  query: string;
  items: CatalogItem[];
  /** True while more results are being fetched */
  isLoadingMore?: boolean;
}

/* ─────────────────────────────────────────────
   The Provider Interface
   ─────────────────────────────────────────────
   Any concrete catalog source MUST implement this interface.
   The UI wires exclusively to this contract.

   Future providers to plug in:
     - TmdbCatalogProvider     — posters, backdrops, metadata via TMDB API
     - FlixPatrolProvider      — Netflix Top-10 / trending rankings
     - UNoGSProvider           — Netflix catalog IDs from uNoGS
     - NetflixScraperProvider  — Direct catalog data if a scraper is built
───────────────────────────────────────────── */
export interface NetflixCatalogProvider {
  /** Display name, shown in dev tools / debug panel */
  readonly name: string;

  /**
   * Full homepage snapshot — hero + all rows.
   * Called once on mount. Providers may return rows with isLoading=true
   * and then resolve individual rows lazily via the methods below.
   */
  getHomepage(): Promise<CatalogHomepage>;

  /** Currently trending titles (row data) */
  getTrending(): Promise<CatalogItem[]>;

  /** Netflix / provider Top-10 list */
  getTop10(): Promise<CatalogItem[]>;

  /** Movies catalog */
  getMovies(genre?: string): Promise<CatalogItem[]>;

  /** Series catalog */
  getSeries(genre?: string): Promise<CatalogItem[]>;

  /**
   * Full-text search across the provider's catalog.
   * UI passes through the raw query; providers decide what fields to match.
   * Returns empty array (never throws) so the UI degrades gracefully.
   */
  search(query: string): Promise<CatalogSearchResult>;
}

/* ─────────────────────────────────────────────
   Re-export convenience alias kept for the
   legacy getCatalogData() import in old files.
───────────────────────────────────────────── */
/** @deprecated Use CatalogHomepage */
export type CatalogData = CatalogHomepage;
