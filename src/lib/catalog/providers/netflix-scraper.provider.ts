import type { NetflixCatalogProvider, CatalogItem, CatalogRow, CatalogHomepage, CatalogSearchResult } from "../types";

export class NetflixScraperProvider implements NetflixCatalogProvider {
  readonly name = "NetflixScraperProvider";

  private async fetchGenre(code: string): Promise<CatalogItem[]> {
    try {
      const res = await fetch(`/api/netflix/genre/${code}`);
      const data = await res.json();
      if (!data.results) return [];
      return data.results.map((r: any) => ({
        id: r.id,
        title: r.title,
        posterUrl: r.poster,
        backdropUrl: r.poster,
        isSeries: false, // genre endpoint doesn't strictly say, we will assume generic
      }));
    } catch {
      return [];
    }
  }

  async getTrending(): Promise<CatalogItem[]> {
    return this.fetchGenre("839338"); // Only on Netflix
  }

  async getMovies(genre?: string): Promise<CatalogItem[]> {
    return this.fetchGenre(genre || "1365"); // Action & Adventure
  }

  async getSeries(genre?: string): Promise<CatalogItem[]> {
    return this.fetchGenre(genre || "83"); // TV Shows
  }

  async search(query: string): Promise<CatalogSearchResult> {
    try {
      const res = await fetch(`/api/netflix/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      const items = (data || []).map((r: any) => ({
        id: String(r.id),
        title: r.t || r.title || "Unknown",
        posterUrl: r.img || r.poster || "",
        backdropUrl: r.img || r.poster || "",
      }));
      return { query, items };
    } catch {
      return { query, items: [] };
    }
  }

  async getHomepage(): Promise<CatalogHomepage> {
    const [trending, action, scifi, comedy, tv] = await Promise.all([
      this.getTrending(),
      this.fetchGenre("1365"), // Action
      this.fetchGenre("1492"), // Sci-Fi
      this.fetchGenre("6548"), // Comedies
      this.getSeries(), // TV Shows
    ]);

    const hero = trending.length > 0 ? { ...trending[0] } : null;

    if (hero && hero.id) {
      try {
        const titleRes = await fetch(`/api/netflix/title/${hero.id}`);
        if (titleRes.ok) {
          const titleData = await titleRes.json();
          if (titleData.backdrop) {
            hero.backdropUrl = titleData.backdrop;
          }
          if (titleData.synopsis) {
            hero.description = titleData.synopsis;
          }
        }
      } catch (e) {
        console.error("Failed to fetch hero title details", e);
      }
    }

    const trendingRowItems = trending.slice(1);

    const rows: CatalogRow[] = [
      { title: "Trending Now", items: trendingRowItems, variant: "default" },
      { title: "TV Shows", items: tv, variant: "default" },
      { title: "Action & Adventure", items: action, variant: "default" },
      { title: "Sci-Fi & Fantasy", items: scifi, variant: "default" },
      { title: "Comedies", items: comedy, variant: "default" },
    ];

    return { 
      hero: hero || { id: "80057281", title: "Stranger Things", posterUrl: "" }, 
      rows 
    };
  }
}
