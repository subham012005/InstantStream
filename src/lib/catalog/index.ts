/**
 * catalog/index.ts
 *
 * ── HOW TO SWAP PROVIDERS ───────────────────────────────────────────────────
 *
 *   Change the TWO lines marked below.
 *   Nothing else in the codebase needs to change — not the UI, not the player,
 *   not loadMeta(id), not any API route except /api/netflix/*.
 *
 * ── PROVIDERS AVAILABLE ─────────────────────────────────────────────────────
 *
 *   NetflixScraperProvider  ← ACTIVE
 *     Calls /api/netflix/* which scrape Netflix genre pages.
 *     7-day server-side cache. Falls back to demo on error.
 *
 *   DemoCatalogProvider
 *     Static curated dataset. Zero network calls. Good for local dev / testing.
 *
 *   (future)
 *     TmdbCatalogProvider       — TMDB API for richer metadata/images
 *     FlixPatrolProvider        — FlixPatrol.com trending rankings
 *     UNoGSProvider             — uNoGS Netflix catalog IDs
 */

import type { NetflixCatalogProvider } from "./types";

// ── Active provider (change these two lines to swap) ─────────────────────────
import { NetflixScraperProvider } from "./providers/netflix-scraper.provider";
const activeProvider: NetflixCatalogProvider = new NetflixScraperProvider();
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the currently active catalog provider singleton. */
export function getCatalogProvider(): NetflixCatalogProvider {
  return activeProvider;
}

// Re-export all types so consumers import from one place
export type {
  NetflixCatalogProvider,
  CatalogItem,
  CatalogRow,
  CatalogHomepage,
  CatalogSearchResult,
  RowVariant,
  CatalogData,   // legacy alias
} from "./types";
