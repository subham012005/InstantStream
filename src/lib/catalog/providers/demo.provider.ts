/**
 * catalog/providers/demo.provider.ts
 *
 * DemoCatalogProvider — temporary, self-contained data source.
 *
 * DROP-IN REPLACEMENT STRATEGY:
 *   When a real provider is ready (TMDB, FlixPatrol, uNoGS …) create a new
 *   file in this directory, implement NetflixCatalogProvider, then change the
 *   single line in catalog/index.ts that calls `new DemoCatalogProvider()`.
 *   Nothing else in the codebase needs to change.
 */

import type {
  NetflixCatalogProvider,
  CatalogItem,
  CatalogRow,
  CatalogHomepage,
  CatalogSearchResult,
} from "../types";

/* ─────────────────────────────────────────────
   Static demo dataset
   All IDs are real Netflix content IDs.
   Posters are from TMDB CDN (public, no API key needed for images).
───────────────────────────────────────────── */
const HERO: CatalogItem = {
  id: "80057281",
  title: "Stranger Things",
  description:
    "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
  posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  backdropUrl: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  matchScore: "98% Match",
  year: "2016",
  rating: "TV-14",
  isSeries: true,
  categories: ["Sci-Fi TV", "Teen TV Shows", "TV Horror"],
};

const TRENDING: CatalogItem[] = [
  { id: "80192098", title: "Money Heist",         posterUrl: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg", matchScore: "95%", year: "2017", rating: "TV-MA", duration: "4 Seasons",  categories: ["Crime","Thriller"], isSeries: true },
  { id: "81040344", title: "Squid Game",          posterUrl: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg", matchScore: "99%", year: "2021", rating: "TV-MA", duration: "2 Seasons",  categories: ["Thriller","Drama"], isSeries: true },
  { id: "81231974", title: "Wednesday",           posterUrl: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczAjs.jpg", matchScore: "97%", year: "2022", rating: "TV-14", duration: "1 Season",   categories: ["Sci-Fi","Fantasy"], isSeries: true },
  { id: "81435684", title: "Arcane",              posterUrl: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg", matchScore: "98%", year: "2021", rating: "TV-14", duration: "2 Seasons",  categories: ["Animation","Action"], isSeries: true },
  { id: "80100172", title: "Dark",                posterUrl: "https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", matchScore: "92%", year: "2017", rating: "TV-MA", duration: "3 Seasons",  categories: ["Sci-Fi","Thriller"], isSeries: true },
  { id: "81054853", title: "Cyberpunk: Edgerunners", posterUrl: "https://image.tmdb.org/t/p/w500/k3Kp2kVP0dWsGMCJqhLMmIKjbLp.jpg", matchScore: "96%", year: "2022", rating: "TV-MA", duration: "1 Season", categories: ["Animation","Sci-Fi"], isSeries: true },
  { id: "81145566", title: "The Umbrella Academy", posterUrl: "https://image.tmdb.org/t/p/w500/scZlQQqnGScKdmm89tFCHCgJRDx.jpg", matchScore: "91%", year: "2019", rating: "TV-14", duration: "3 Seasons", categories: ["Sci-Fi","Action"], isSeries: true },
  { id: "70136120", title: "Breaking Bad",        posterUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGxs.jpg", matchScore: "99%", year: "2008", rating: "TV-MA", duration: "5 Seasons",  categories: ["Crime","Drama"], isSeries: true },
];

const MOVIES: CatalogItem[] = [
  { id: "81103141", title: "Extraction",          posterUrl: "https://image.tmdb.org/t/p/w500/qhWse2mCOAAgQOGCBR9JKBMpFPo.jpg", year: "2020", rating: "TV-MA", duration: "1h 56m", categories: ["Action","Thriller"] },
  { id: "80186864", title: "Bird Box",            posterUrl: "https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg", year: "2018", rating: "R",     duration: "2h 4m",  categories: ["Horror","Sci-Fi"] },
  { id: "81034</s>23", title: "The Gray Man",       posterUrl: "https://image.tmdb.org/t/p/w500/nV3pjMECj9uooPKRGjMgRvXrOvE.jpg", year: "2022", rating: "PG-13", duration: "2h 2m",  categories: ["Action","Thriller"] },
  { id: "80154239", title: "Mowgli: Legend of the Jungle", posterUrl: "https://image.tmdb.org/t/p/w500/sbGSVnKyVEJkiDTLJ4mEABGq5LA.jpg", year: "2018", rating: "PG-13", duration: "1h 44m", categories: ["Adventure","Drama"] },
  { id: "81077409", title: "The Irishman",        posterUrl: "https://image.tmdb.org/t/p/w500/mbm8k3GFhXS0Rock0PKAk9fk9Rj.jpg", year: "2019", rating: "R",     duration: "3h 29m", categories: ["Crime","Drama"] },
  { id: "81260428", title: "The Power of the Dog", posterUrl: "https://image.tmdb.org/t/p/w500/2k0dIqbBTcTxBAfmSMoFTMFOkSw.jpg", year: "2021", rating: "R",     duration: "2h 8m",  categories: ["Drama","Western"] },
  { id: "80219430", title: "Marriage Story",      posterUrl: "https://image.tmdb.org/t/p/w500/lEqFMo2MHbJMpnMGaDtvPNMVCOl.jpg", year: "2019", rating: "R",     duration: "2h 17m", categories: ["Drama","Romance"] },
  { id: "81167635", title: "Enola Holmes",        posterUrl: "https://image.tmdb.org/t/p/w500/riYInlsq2kf1AWoGm80JQW5dLKp.jpg", year: "2020", rating: "PG-13", duration: "2h 3m",  categories: ["Adventure","Mystery"] },
];

const SERIES: CatalogItem[] = [
  { id: "80189685", title: "The Witcher",         posterUrl: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg", matchScore: "90%", year: "2019", rating: "TV-MA", duration: "3 Seasons", categories: ["Fantasy","Action"], isSeries: true },
  { id: "80025172", title: "Narcos",              posterUrl: "https://image.tmdb.org/t/p/w500/rTmal9fDbwhEEzBp3DA6huYXg4e.jpg", matchScore: "95%", year: "2015", rating: "TV-MA", duration: "3 Seasons", categories: ["Crime","Drama"], isSeries: true },
  { id: "70264888", title: "Black Mirror",        posterUrl: "https://image.tmdb.org/t/p/w500/5UaYsGZ44xZ51m9UqFfB1bLhQ1L.jpg", matchScore: "96%", year: "2011", rating: "TV-MA", duration: "6 Seasons", categories: ["Sci-Fi","Drama"], isSeries: true },
  { id: "80115328", title: "Ozark",               posterUrl: "https://image.tmdb.org/t/p/w500/m73bD8VRIBJilJ8XoJv4W23XqK2.jpg", matchScore: "93%", year: "2017", rating: "TV-MA", duration: "4 Seasons", categories: ["Crime","Drama"], isSeries: true },
  { id: "80002479", title: "Peaky Blinders",      posterUrl: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", matchScore: "94%", year: "2013", rating: "TV-MA", duration: "6 Seasons", categories: ["Crime","Drama"], isSeries: true },
  { id: "81145566", title: "The Umbrella Academy", posterUrl: "https://image.tmdb.org/t/p/w500/scZlQQqnGScKdmm89tFCHCgJRDx.jpg", matchScore: "91%", year: "2019", rating: "TV-14", duration: "3 Seasons", categories: ["Sci-Fi","Action"], isSeries: true },
  { id: "80100172", title: "Dark",                posterUrl: "https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", matchScore: "92%", year: "2017", rating: "TV-MA", duration: "3 Seasons", categories: ["Sci-Fi","Thriller"], isSeries: true },
  { id: "81054853", title: "Cyberpunk: Edgerunners", posterUrl: "https://image.tmdb.org/t/p/w500/k3Kp2kVP0dWsGMCJqhLMmIKjbLp.jpg", matchScore: "96%", year: "2022", rating: "TV-MA", duration: "1 Season", categories: ["Animation","Sci-Fi"], isSeries: true },
];

const ACTION: CatalogItem[] = [
  { id: "81103141", title: "Extraction",          posterUrl: "https://image.tmdb.org/t/p/w500/qhWse2mCOAAgQOGCBR9JKBMpFPo.jpg", year: "2020", rating: "TV-MA", categories: ["Action"] },
  { id: "81435684", title: "Arcane",              posterUrl: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg", year: "2021", rating: "TV-14", categories: ["Action"], isSeries: true },
  { id: "80189685", title: "The Witcher",         posterUrl: "https://image.tmdb.org/t/p/w500/7vjaCdMw15FEbXyLQTVa04URsPm.jpg", year: "2019", rating: "TV-MA", categories: ["Action"], isSeries: true },
  { id: "81145566", title: "The Umbrella Academy", posterUrl: "https://image.tmdb.org/t/p/w500/scZlQQqnGScKdmm89tFCHCgJRDx.jpg", year: "2019", rating: "TV-14", categories: ["Action"], isSeries: true },
];

const CRIME_THRILLER: CatalogItem[] = [
  { id: "70136120", title: "Breaking Bad",        posterUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGxs.jpg", year: "2008", rating: "TV-MA", duration: "5 Seasons", isSeries: true },
  { id: "80002479", title: "Peaky Blinders",      posterUrl: "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg", year: "2013", rating: "TV-MA", duration: "6 Seasons", isSeries: true },
  { id: "80192098", title: "Money Heist",         posterUrl: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg", year: "2017", rating: "TV-MA", duration: "4 Seasons", isSeries: true },
  { id: "80115328", title: "Ozark",               posterUrl: "https://image.tmdb.org/t/p/w500/m73bD8VRIBJilJ8XoJv4W23XqK2.jpg", year: "2017", rating: "TV-MA", duration: "4 Seasons", isSeries: true },
  { id: "80025172", title: "Narcos",              posterUrl: "https://image.tmdb.org/t/p/w500/rTmal9fDbwhEEzBp3DA6huYXg4e.jpg", year: "2015", rating: "TV-MA", duration: "3 Seasons", isSeries: true },
];

const SCIFI: CatalogItem[] = [
  { id: "80100172", title: "Dark",                posterUrl: "https://image.tmdb.org/t/p/w500/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg", year: "2017", rating: "TV-MA", isSeries: true },
  { id: "70264888", title: "Black Mirror",        posterUrl: "https://image.tmdb.org/t/p/w500/5UaYsGZ44xZ51m9UqFfB1bLhQ1L.jpg", year: "2011", rating: "TV-MA", isSeries: true },
  { id: "80057281", title: "Stranger Things",     posterUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", year: "2016", rating: "TV-14", isSeries: true },
  { id: "81054853", title: "Cyberpunk: Edgerunners", posterUrl: "https://image.tmdb.org/t/p/w500/k3Kp2kVP0dWsGMCJqhLMmIKjbLp.jpg", year: "2022", rating: "TV-MA", isSeries: true },
  { id: "80186864", title: "Bird Box",            posterUrl: "https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg", year: "2018", rating: "R" },
];

/** All items in one flat array — used for search */
const ALL_ITEMS: CatalogItem[] = [
  HERO, ...TRENDING, ...MOVIES, ...SERIES, ...ACTION, ...CRIME_THRILLER, ...SCIFI,
].reduce<CatalogItem[]>((acc, item) => {
  if (!acc.find((i) => i.id === item.id)) acc.push(item);
  return acc;
}, []);

/* ─────────────────────────────────────────────
   Provider implementation
───────────────────────────────────────────── */
export class DemoCatalogProvider implements NetflixCatalogProvider {
  readonly name = "DemoCatalogProvider";

  /** Simulate network latency */
  private delay<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
  }

  async getTrending(): Promise<CatalogItem[]> {
    return this.delay(80, TRENDING);
  }

  async getMovies(_genre?: string): Promise<CatalogItem[]> {
    return this.delay(80, MOVIES);
  }

  async getSeries(_genre?: string): Promise<CatalogItem[]> {
    return this.delay(80, SERIES);
  }

  async search(query: string): Promise<CatalogSearchResult> {
    const q = query.toLowerCase().trim();
    const items = q
      ? ALL_ITEMS.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.id.includes(q) ||
            item.categories?.some((c) => c.toLowerCase().includes(q))
        )
      : [];
    return this.delay(50, { query, items });
  }

  async getHomepage(): Promise<CatalogHomepage> {
    const [trending, movies, series] = await Promise.all([
      this.getTrending(),
      this.getMovies(),
      this.getSeries(),
    ]);

    const rows: CatalogRow[] = [
      { title: "Trending Now",      items: trending,     variant: "default" },
      { title: "Popular Movies",    items: movies,       variant: "default" },
      { title: "Popular Series",    items: series,       variant: "default" },
      { title: "Action & Adventure",items: ACTION,       variant: "default" },
      { title: "Crime & Thriller",  items: CRIME_THRILLER, variant: "default" },
      { title: "Sci-Fi & Fantasy",  items: SCIFI,        variant: "default" },
    ];

    return { hero: HERO, rows };
  }
}
