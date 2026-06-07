/**
 * catalog/providers/netflix-scraper.provider.ts
 *
 * Live catalog provider backed by the Netflix public scraper.
 * Calls the Next.js API routes at /api/netflix/* — which in turn
 * hit Netflix genre pages and title pages.
 *
 * All caching is handled server-side by Next.js unstable_cache (7-day TTL).
 * This class is purely a thin HTTP client from the browser perspective.
 *
 * SWAP IN: Change one line in catalog/index.ts
 *   const activeProvider = new NetflixScraperProvider();
 */

import type {
  NetflixCatalogProvider,
  CatalogItem,
  CatalogRow,
  CatalogHomepage,
  CatalogSearchResult,
} from "../types";

/* ─────────────────────────────────────────────
   Shape adapters
   netflix-server shape → CatalogItem
───────────────────────────────────────────── */
function adaptItem(raw: any, rank?: number): CatalogItem {
  return {
    id:          String(raw.id || ""),
    title:       raw.title       || "Untitled",
    posterUrl:   raw.poster      || raw.posterUrl    || "/placeholder-poster.svg",
    backdropUrl: raw.backdrop    || raw.backdropUrl   || raw.poster || "",
    description: raw.description || "",
    year:        raw.year        || "",
    rating:      raw.rating      || raw.contentRating || "",
    duration:    raw.duration    || "",
    isSeries:    raw.type === "series" || raw.isSeries || false,
    categories:  raw.categories  || [],
    rank:        rank ?? raw.rank ?? undefined,
    matchScore:  raw.matchScore  || "",
  };
}

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */
export class NetflixScraperProvider implements NetflixCatalogProvider {
  readonly name = "NetflixScraperProvider";

  /** Base URL for API calls — works in both browser and SSR */
  private base(): string {
    if (typeof window !== "undefined") return "";           // browser: relative
    return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // SSR
  }

  private async get<T>(path: string): Promise<T> {
    const url = `${this.base()}${path}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
    return res.json();
  }

  /* ── Individual methods ── */

  async getTrending(): Promise<CatalogItem[]> {
    try {
      const data = await this.get<{ items: any[] }>("/api/netflix/genre?code=839338&limit=12");
      return (data.items || []).filter((i) => i.id).map((i) => adaptItem(i));
    } catch {
      return [];
    }
  }

  async getMovies(genre?: string): Promise<CatalogItem[]> {
    const code = genre || "1365"; // Action & Adventure as default movies row
    try {
      const data = await this.get<{ items: any[] }>(`/api/netflix/genre?code=${code}&limit=12`);
      return (data.items || []).filter((i) => i.id && i.type === "movie").map((i) => adaptItem(i));
    } catch {
      return [];
    }
  }

  async getSeries(genre?: string): Promise<CatalogItem[]> {
    const code = genre || "83"; // TV Shows
    try {
      const data = await this.get<{ items: any[] }>(`/api/netflix/genre?code=${code}&limit=12`);
      return (data.items || []).filter((i) => i.id && i.type === "series").map((i) => adaptItem(i));
    } catch {
      return [];
    }
  }

  async search(query: string): Promise<CatalogSearchResult> {
    const q = query.trim();
    if (!q) return { query: q, items: [] };
    try {
      const data = await this.get<{ results: any[] }>(`/api/netflix/search?q=${encodeURIComponent(q)}`);
      return {
        query: q,
        items: (data.results || []).filter((i) => i.id).map((i) => adaptItem(i)),
      };
    } catch {
      return { query: q, items: [] };
    }
  }

  /** Full homepage in one call via the aggregator endpoint */
  async getHomepage(): Promise<CatalogHomepage> {
    try {
      const data = await this.get<{ hero: any; rows: any[] }>("/api/netflix/homepage?limit=12");

      const hero: CatalogItem = data.hero
        ? adaptItem(data.hero)
        : {
            id: "80057281",
            title: "Stranger Things",
            posterUrl: "/placeholder-poster.svg",
            backdropUrl: "",
            description: "Browse and stream Netflix content by ID.",
            isSeries: true,
          };

      const rows: CatalogRow[] = (data.rows || [])
        .filter((r) => (r.items || []).some((i: any) => i.id || i.title))
        .map((r) => ({
          title:   r.title,
          variant: r.variant || "landscape",
          items:   (r.items || []).map((i: any) => adaptItem(i)),
        }));

      return { hero, rows };
    } catch (err) {
      console.error("[NetflixScraperProvider] getHomepage failed:", err);
      // Graceful fallback to demo data so the page never breaks
      const { DemoCatalogProvider } = await import("./demo.provider");
      return new DemoCatalogProvider().getHomepage();
    }
  }
}
