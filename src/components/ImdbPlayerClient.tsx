"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  Play,
  Pause,
  Search,
  AlertTriangle,
  ArrowLeft,
  Star,
  CalendarDays,
  Clock,
  ChevronRight,
  ChevronDown,
  Settings,
  Check,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import type { LandingPageData } from "@/app/landingPagesData";
import { useSearchParams } from "next/navigation";

interface MovieMeta {
  title: string;
  year: string;
  poster: string | null;
  rating: string;
  overview: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  runtime?: string;
  released?: string;
  language?: string;
  type?: string;
  totalSeasons?: string;
}

interface StreamResponse {
  imdbId: string;
  url: string;
  type: "hls" | "mp4";
  provider: string;
  movie: MovieMeta | null;
  playerUrl: string;
  playerSource: "Gemma" | "VixSrc";
  error?: string;
}

type NativeSettingsTab = "quality" | "language" | "subtitles";

interface NativeSubtitleTrack {
  file: string;
  label: string;
  language: string;
}

interface NativeHlsLevel {
  level: number;
  height: number;
  width: number;
  bitrate?: number;
}

interface NativeServerOption {
  id: string;
  label: string;
  reqTmdb: boolean;
  reqImdb: boolean;
  auto: boolean;
}

const NATIVE_SERVER_OPTIONS: NativeServerOption[] = [
  {
    id: "auto",
    label: "Shadow Auto",
    reqTmdb: false,
    reqImdb: false,
    auto: true,
  },
  {
    id: "moviebox",
    label: "Ghost",
    reqTmdb: true,
    reqImdb: false,
    auto: false,
  },
  { id: "holly", label: "Skull", reqTmdb: true, reqImdb: false, auto: false },
  { id: "air", label: "Wraith", reqTmdb: true, reqImdb: false, auto: false },
  { id: "net", label: "Demon", reqTmdb: true, reqImdb: false, auto: false },
  { id: "gemma", label: "Phantom", reqTmdb: false, reqImdb: true, auto: false },
];

const AUTO_NATIVE_SERVER_ORDER = ["moviebox", "holly", "air", "net", "gemma"];

const EXAMPLES = ["tt0111161", "tt0468569", "tt1375666", "tt0110912"];

const IMDbYellow = "#F5C518";

// ── HLS.js module cache (preloaded on mount to avoid import delay on first play) ──
let _hlsCache: any = null;
const getHls = async (): Promise<any> => {
  if (_hlsCache !== null) return _hlsCache;
  const mod = await import("hls.js");
  _hlsCache = mod.default ?? mod;
  return _hlsCache;
};

function fmtTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function nativeSourceQuality(source: any) {
  const raw = source?.quality || source?.resolution || source?.height || "Auto";
  const text = String(raw);
  if (/^\d+$/.test(text)) return `${text}p`;
  return text;
}

function nativeSourceLabel(source: any) {
  return nativeSourceQuality(source);
}

function dedupeNativeSources(sources: any[]) {
  const seen = new Set<string>();
  return sources.filter((source) => {
    const key = [
      source?.provider || "",
      nativeSourceQuality(source),
      source?.language || source?.lang || "",
      source?.type || "",
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function nativeHlsQualityLabel(level?: NativeHlsLevel) {
  if (!level) return "Auto";
  const width = level.width || 0;
  const height = level.height || 0;

  if (width >= 3800 || height >= 2000) return "2160p";
  if (width >= 1900 || height >= 1000) return "1080p";
  if (width >= 1200 || height >= 650) return "720p";
  if (width >= 800 || height >= 430) return "480p";
  if (width >= 600 || height >= 300) return "360p";
  if (height > 0) return `${height}p`;
  return "Auto";
}

function dedupeHlsLevels(levels: NativeHlsLevel[]) {
  const seen = new Set<string>();
  return levels.filter((level) => {
    const label = nativeHlsQualityLabel(level);
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}

function AnimatedLoaderText({ customPhrases }: { customPhrases?: string[] }) {
  const [index, setIndex] = useState(0);
  const defaultPhrases = [
    "Checking server speeds...",
    "Finding the highest quality stream...",
    "To provide an ad-free experience we do a lot of research...",
    "This makes the first load take a bit more time. Please stay with us...",
    "Bypassing restrictions...",
    "Almost there...",
    "Doing final checks...",
    "Preparing your movie...",
  ];
  const phrases = customPhrases || defaultPhrases;

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 relative w-full flex justify-center items-center h-[40px] sm:h-6">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-white/80 text-[10px] sm:text-xs font-mono font-bold tracking-wide absolute left-1/2 -translate-x-1/2 text-center w-full px-2"
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function ImdbPlayerClient({ data }: { data: LandingPageData }) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const autoPlayFired = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!!initialId);

  const [imdbId, setImdbId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streamData, setStreamData] = useState<StreamResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shake, setShake] = useState(false);
  const [tmdbId, setTmdbId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [selectedPlayerUrl, setSelectedPlayerUrl] = useState<string>("");
  const [selectedServerId, setSelectedServerId] = useState<string>("auto");
  const [thirdPartyOpen, setThirdPartyOpen] = useState(false);
  const [adminConfig, setAdminConfig] = useState<any>(null);
  const adminConfigRef = useRef<any>(null);

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
  const [episodeCount, setEpisodeCount] = useState<number>(0);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setAdminConfig(data);
        adminConfigRef.current = data;
        if (data && data.defaultServer && selectedServerId === "auto") {
          setSelectedServerId(data.defaultServer);
        }
      })
      .catch(() => {});
    // Preload HLS.js in the background so first play is instant
    getHls().catch(() => {});
  }, []);

  // Native Player States
  const [nativeData, setNativeData] = useState<any>(null);
  const [nativeLanguages, setNativeLanguages] = useState<string[]>([]);
  const [nativeLanguage, setNativeLanguage] = useState<string>("");
  const [nativeQualities, setNativeQualities] = useState<any[]>([]);
  const [nativeLoading, setNativeLoading] = useState(false);
  const [nativeError, setNativeError] = useState("");
  const [nativeSelectedSource, setNativeSelectedSource] = useState<any>(null);
  const [nativeSubtitles, setNativeSubtitles] = useState<NativeSubtitleTrack[]>(
    [],
  );
  const [nativeSubtitleIndex, setNativeSubtitleIndex] = useState(-1);
  const [nativeSettingsOpen, setNativeSettingsOpen] = useState(false);
  const [nativeSettingsTab, setNativeSettingsTab] =
    useState<NativeSettingsTab>("quality");
  const [nativePlaying, setNativePlaying] = useState(false);
  const [nativeBuffering, setNativeBuffering] = useState(false);
  const [nativeCurrent, setNativeCurrent] = useState(0);
  const [nativeDuration, setNativeDuration] = useState(0);
  const [nativeVolume, setNativeVolume] = useState(1);
  const [nativeMuted, setNativeMuted] = useState(false);
  const [nativeHlsLevels, setNativeHlsLevels] = useState<NativeHlsLevel[]>([]);
  const [nativeHlsLevel, setNativeHlsLevel] = useState(-1);
  const [nativeSubtitleRenderKey, setNativeSubtitleRenderKey] = useState(0);
  const [nativeCueText, setNativeCueText] = useState("");
  const [nativeAutoStatus, setNativeAutoStatus] = useState("");
  const [skipMessage, setSkipMessage] = useState<{
    text: string;
    side: "left" | "right";
    key: number;
  } | null>(null);

  useEffect(() => {
    if (skipMessage) {
      const timer = setTimeout(() => setSkipMessage(null), 800);
      return () => clearTimeout(timer);
    }
  }, [skipMessage]);

  const nativePlayerRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSearch = async (id = imdbId.trim()) => {
    if (!id) {
      setError("Please enter an IMDb ID.");
      triggerShake();
      return false;
    }
    if (!/^tt\d{7,8}$/.test(id)) {
      setError(
        "Invalid format. Use 'tt' followed by 7–8 digits, e.g. tt0111161",
      );
      triggerShake();
      return false;
    }
    setImdbId(id);
    setLoading(true);
    setError("");
    setStreamData(null);
    setIsPlaying(false);
    setTmdbId(null);
    try {
      let resolvedTmdbId = null;

      // Fetch TMDB (Wikidata) + OMDb in parallel — saves 1-3s vs sequential
      const sparqlQuery = `SELECT ?tmdbId WHERE { ?movie wdt:P345 "${id}". { ?movie wdt:P4947 ?tmdbId. } UNION { ?movie wdt:P4983 ?tmdbId. } } LIMIT 1`;
      const wdUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;

      const [wdResult, omdbResult] = await Promise.allSettled([
        fetch(wdUrl, {
          headers: { Accept: "application/sparql-results+json" },
        }).then((r) => r.json()),
        fetch(`/api/omdb?id=${id}`).then((r) => (r.ok ? r.json() : null)),
      ]);

      // Parse TMDB
      if (wdResult.status === "fulfilled") {
        try {
          const bindings = wdResult.value?.results?.bindings;
          if (bindings?.length > 0 && bindings[0].tmdbId) {
            resolvedTmdbId = bindings[0].tmdbId.value;
            setTmdbId(resolvedTmdbId);
          }
        } catch (e) {
          console.warn("Failed to parse TMDB", e);
        }
      }

      // Parse OMDb
      let omdbData: any = null;
      if (omdbResult.status === "fulfilled" && omdbResult.value) {
        const data = omdbResult.value;
        if (data.Response !== "False") {
          omdbData = data;
        }
      }

      const streamJson: StreamResponse = {
        imdbId: id,
        url: "",
        type: "hls",
        provider: "Frontend",
        movie: {
          title:
            omdbData?.Title && omdbData.Title !== "N/A"
              ? omdbData.Title
              : `IMDb: ${id}`,
          year: omdbData?.Year && omdbData.Year !== "N/A" ? omdbData.Year : "",
          poster:
            omdbData?.Poster && omdbData.Poster !== "N/A"
              ? omdbData.Poster
              : null,
          rating:
            omdbData?.imdbRating && omdbData.imdbRating !== "N/A"
              ? omdbData.imdbRating
              : "",
          overview:
            omdbData?.Plot && omdbData.Plot !== "N/A" ? omdbData.Plot : "",
          genre:
            omdbData?.Genre && omdbData.Genre !== "N/A"
              ? omdbData.Genre
              : undefined,
          director:
            omdbData?.Director && omdbData.Director !== "N/A"
              ? omdbData.Director
              : undefined,
          writer:
            omdbData?.Writer && omdbData.Writer !== "N/A"
              ? omdbData.Writer
              : undefined,
          actors:
            omdbData?.Actors && omdbData.Actors !== "N/A"
              ? omdbData.Actors
              : undefined,
          runtime:
            omdbData?.Runtime && omdbData.Runtime !== "N/A"
              ? omdbData.Runtime
              : undefined,
          released:
            omdbData?.Released && omdbData.Released !== "N/A"
              ? omdbData.Released
              : undefined,
          language:
            omdbData?.Language && omdbData.Language !== "N/A"
              ? omdbData.Language
              : undefined,
          type: omdbData?.Type,
          totalSeasons: omdbData?.totalSeasons,
        },
        playerUrl: `https://gemma416okl.com/play/${id}`,
        playerSource: "Gemma",
      };

      setStreamData(streamJson);
      setSelectedServerId(adminConfigRef.current?.defaultServer || "auto");
      return true;
    } catch {
      setError("Failed to fetch movie details. Please try again.");
      triggerShake();
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId && !autoPlayFired.current) {
      autoPlayFired.current = true;
      setImdbId(initialId);
      handleSearch(initialId).then((success) => {
        if (success) {
          setIsPlaying(true);
        }
        setIsInitialLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  useEffect(() => {
    if (
      streamData?.movie?.type === "series" &&
      selectedSeason &&
      (tmdbId || streamData?.imdbId)
    ) {
      const idParam = tmdbId ? `id=${tmdbId}` : `imdbId=${streamData.imdbId}`;
      fetch(`/api/tmdb-season?${idParam}&season=${selectedSeason}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.episodes) {
            setEpisodeCount(data.episodes);
          } else {
            setEpisodeCount(50); // Fallback
          }
        })
        .catch(() => setEpisodeCount(50));
    }
  }, [tmdbId, streamData?.imdbId, selectedSeason, streamData?.movie?.type]);

  useEffect(() => {
    if (isPlaying && playerRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        playerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  }, [isPlaying]);

  const baseExternalPlayerUrl =
    selectedPlayerUrl || (streamData ? streamData.playerUrl : "");
  const externalPlayerUrl = baseExternalPlayerUrl;

  useEffect(() => {
    if (streamData?.playerUrl) setSelectedPlayerUrl("");
  }, [streamData?.playerUrl]);

  const alternatePlayerUrl = streamData
    ? streamData.playerSource === "Gemma"
      ? `https://vixsrc.to/movie/${streamData.imdbId}`
      : `https://gemma416okl.com/play/${encodeURIComponent(streamData.imdbId)}`
    : "";

  const withThirdPartyAutoplay = (url: string) => {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("autoplay", "1");
      parsed.searchParams.set("autostart", "1");
      return parsed.toString();
    } catch {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}autoplay=1&autostart=1`;
    }
  };

  const playThirdPartyServer = (serverId: string) => {
    let nextUrl = "";

    if (serverId === "server1" && streamData?.playerUrl) {
      nextUrl = streamData.playerUrl;
    }
    if (serverId === "server2" && alternatePlayerUrl) {
      nextUrl = alternatePlayerUrl;
    }
    if (serverId === "server3" && tmdbId) {
      nextUrl = `https://player.videasy.net/movie/${tmdbId}`;
    }

    if (!nextUrl) return;
    setNativeError("");
    setNativeAutoStatus("");
    setSelectedPlayerUrl(withThirdPartyAutoplay(nextUrl));
    setSelectedServerId(serverId);
    setThirdPartyOpen(false);
  };

  const thirdPartyServerLabel =
    selectedServerId === "server1"
      ? "Server 1"
      : selectedServerId === "server2"
        ? "Server 2"
        : selectedServerId === "server3"
          ? "Server 3"
          : "Third party server contain ads";

  // ----------------------------------------------------
  // Native Player Logic
  // ----------------------------------------------------
  const resetNativePlayerState = () => {
    if (hlsRef.current) {
      try {
        hlsRef.current.removeAllListeners?.();
        hlsRef.current.detachMedia?.();
        hlsRef.current.destroy?.();
      } catch {}
      hlsRef.current = null;
    }
    if (nativePlayerRef.current) {
      try {
        nativePlayerRef.current.pause();
        nativePlayerRef.current.removeAttribute("src");
        nativePlayerRef.current.load();
      } catch {}
    }

    setSelectedPlayerUrl("native");
    setNativeError("");
    setNativeSettingsOpen(false);
    setNativeSelectedSource(null);
    setNativeSubtitleIndex(-1);
    setNativeCueText("");
    setNativePlaying(false);
    setNativeSubtitleRenderKey((key) => key + 1);
    setNativeHlsLevels([]);
    setNativeHlsLevel(-1);
    setNativeData(null);
    setNativeLanguages([]);
    setNativeQualities([]);
    setNativeSubtitles([]);
  };

  const buildNativeServerUrl = (serverId: string, isImdbRequired: boolean) => {
    let url =
      streamData?.movie?.type === "series" ||
      streamData?.movie?.type === "episode"
        ? `/api/test-server/api/tv/${tmdbId || 0}/${selectedSeason}/${selectedEpisode}?server=${serverId}`
        : `/api/test-server/api/movie/${tmdbId || 0}?server=${serverId}`;
    url += `&imdb=${encodeURIComponent(streamData?.imdbId || "")}`;
    return url;
  };

  const fetchNativeServerData = async (server: NativeServerOption) => {
    const startedAt = performance.now();
    const res = await fetch(buildNativeServerUrl(server.id, server.reqImdb));
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Server returned HTML instead of JSON");
    }
    if (!res.ok)
      throw new Error(data.message || data.error || `HTTP ${res.status}`);
    const elapsed = performance.now() - startedAt;
    return { server, data, elapsed };
  };

  const applyNativeServerData = (
    serverId: string,
    data: any,
    statusMessage?: string,
  ) => {
    setNativeData(data);
    if (!data.sources || !data.sources.length) {
      const serverLabel = getNativeServerLabel(serverId);
      const transientPhantom = serverId === "gemma" && data.transient;
      setNativeAutoStatus("");
      setNativeError(
        transientPhantom
          ? "Phantom is still confirming this title. Try Phantom again, or use Shadow Auto while it checks the other servers."
          : `No playable sources found on ${serverLabel}. Try Shadow Auto or another server.`,
      );
      return false;
    }

    const langs = [
      ...new Set(data.sources.map((s: any) => s.language || "Unknown")),
    ] as string[];
    const subtitles = normalizeSubtitleTracks(
      data.subtitles || data.captions || data.tracks || [],
    );
    setNativeLanguages(langs);
    setNativeSubtitles(subtitles);
    setNativeSubtitleRenderKey((key) => key + 1);
    if (langs.length > 0) setNativeLanguage(langs[0]);
    setNativeAutoStatus(
      statusMessage ??
        (serverId === "auto"
          ? ""
          : `Selected ${getNativeServerLabel(serverId)}`),
    );
    return true;
  };

  const scoreNativeServerResult = ({
    data,
    elapsed,
  }: {
    data: any;
    elapsed: number;
  }) => {
    const sources = data.sources || [];
    const languages = new Set(sources.map((s: any) => s.language || "Unknown"));
    const qualities = new Set(sources.map((s: any) => nativeSourceQuality(s)));
    const subtitles = data.subtitles || data.captions || data.tracks || [];
    return (
      sources.length * 12 +
      qualities.size * 18 +
      languages.size * 10 +
      subtitles.length * 4 -
      elapsed / 120
    );
  };

  const getNativeServerLabel = (serverId: string) =>
    NATIVE_SERVER_OPTIONS.find((server) => server.id === serverId)?.label ||
    serverId;

  const loadAutoNativeServer = async () => {
    setSelectedServerId("auto");
    resetNativePlayerState();
    setNativeLoading(true);
    setNativeAutoStatus("Finding the fastest server...");

    try {
      const candidates = AUTO_NATIVE_SERVER_ORDER.map((id) =>
        NATIVE_SERVER_OPTIONS.find((server) => server.id === id),
      ).filter(Boolean) as NativeServerOption[];

      const usableCandidates = candidates.filter((server) => {
        if (server.reqTmdb && !tmdbId) return false;
        if (server.reqImdb && !streamData?.imdbId) return false;
        if (adminConfigRef.current?.disabledServers?.[server.id]) return false;
        return true;
      });

      // ── "First good result + 700ms grace" strategy ──────────────────────────
      // Instead of waiting for ALL servers (slowest wins), we fire all in parallel,
      // pick the FIRST one that returns valid sources, then wait 700ms more to let
      // a potentially better server respond. This cuts wait time from worst-server
      // latency to fastest-server latency + 700ms.
      const goodResults: Array<{
        server: NativeServerOption;
        data: any;
        elapsed: number;
        order: number;
        score: number;
      }> = [];
      const failedResults: Array<{
        server: NativeServerOption;
        error: string;
      }> = [];
      let graceResolved = false;
      let graceResolve!: () => void;
      const gracePromise = new Promise<void>((res) => {
        graceResolve = res;
      });

      const fetchPromises = usableCandidates.map(async (server, order) => {
        try {
          const result = await fetchNativeServerData(server);
          const hasSources = Boolean(result.data.sources?.length);
          if (hasSources) {
            // Pre-warm the stream cache in the background!
            const firstSource = result.data.sources[0];
            if (firstSource) {
              const headers = encodeURIComponent(
                JSON.stringify(firstSource.headers || {}),
              );
              const isHls =
                firstSource.type === "hls" ||
                firstSource.url.includes(".m3u8") ||
                firstSource.url.includes("m3u8-proxy");
              let playUrl = `/api/test-server/mp4-proxy?provider=${firstSource.provider}&url=${encodeURIComponent(firstSource.url)}&headers=${headers}`;
              if (isHls) {
                playUrl = `/api/test-server/hls-proxy?provider=${firstSource.provider}&url=${encodeURIComponent(firstSource.url)}&headers=${headers}`;
              }
              fetch(playUrl).catch(() => {});
            }

            goodResults.push({
              server,
              data: result.data,
              elapsed: result.elapsed,
              order,
              score: scoreNativeServerResult(result) - order * 0.01,
            });
            // First good result triggers 700ms grace window then resolves
            if (!graceResolved) {
              graceResolved = true;
              setTimeout(() => graceResolve(), 700);
            }
          } else {
            failedResults.push({ server, error: "no sources" });
          }
        } catch (err: any) {
          failedResults.push({ server, error: err.message || "failed" });
        }
      });

      // Resolve as soon as first-good + 700ms grace OR all fetches done
      await Promise.race([gracePromise, Promise.all(fetchPromises)]);

      const best = goodResults.sort((a, b) => b.score - a.score)[0];

      if (!best) {
        // Wait for any stragglers if nothing good came yet
        await Promise.all(fetchPromises);
        const finalBest = goodResults.sort((a, b) => b.score - a.score)[0];
        if (!finalBest) {
          const errors = failedResults
            .map((f) => `${getNativeServerLabel(f.server.id)}: ${f.error}`)
            .join(" | ");
          setNativeError(
            `No server found sources: ${errors || "All providers unavailable"}`,
          );
          return;
        }
        const status = `Shadow Auto chose ${getNativeServerLabel(finalBest.server.id)} in ${Math.round(finalBest.elapsed)}ms`;
        setSelectedServerId(finalBest.server.id);
        applyNativeServerData(finalBest.server.id, finalBest.data, status);
        return;
      }

      const status = `Shadow Auto: ${getNativeServerLabel(best.server.id)} in ${Math.round(best.elapsed)}ms`;
      setSelectedServerId(best.server.id);
      applyNativeServerData(best.server.id, best.data, status);
    } finally {
      setNativeLoading(false);
    }
  };

  const loadNativeServer = async (
    serverId: string,
    isTmdbRequired: boolean,
    isImdbRequired: boolean,
  ) => {
    if (serverId === "auto") {
      await loadAutoNativeServer();
      return;
    }

    setSelectedServerId(serverId);
    resetNativePlayerState();

    if (isTmdbRequired && !tmdbId) {
      setNativeError("TMDB ID required for this server.");
      return;
    }
    if (isImdbRequired && !streamData?.imdbId) {
      setNativeError("IMDb ID required for this server.");
      return;
    }

    setNativeLoading(true);
    setNativeAutoStatus(
      `Confirming ${getNativeServerLabel(serverId)} sources...`,
    );

    try {
      const server = NATIVE_SERVER_OPTIONS.find(
        (item) => item.id === serverId,
      ) || {
        id: serverId,
        label: serverId,
        reqTmdb: isTmdbRequired,
        reqImdb: isImdbRequired,
        auto: false,
      };
      const result = await fetchNativeServerData(server);
      applyNativeServerData(serverId, result.data);
    } catch (err: any) {
      console.warn(err);
      setNativeError(err.message || "Failed to load native player sources");
    } finally {
      setNativeLoading(false);
    }
  };

  useEffect(() => {
    if (
      isPlaying &&
      streamData?.imdbId &&
      selectedServerId === "auto" &&
      selectedPlayerUrl !== "native" &&
      !nativeLoading &&
      !nativeData &&
      !nativeError
    ) {
      loadAutoNativeServer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isPlaying,
    streamData?.imdbId,
    tmdbId,
    selectedServerId,
    selectedPlayerUrl,
    selectedSeason,
    selectedEpisode,
  ]);

  const normalizeSubtitleTracks = (tracks: any[]): NativeSubtitleTrack[] => {
    return tracks
      .map((track: any, index: number) => {
        const file = track?.file || track?.url || track?.src;
        if (!file) return null;
        const language =
          track.language ||
          track.lang ||
          track.langCode ||
          track.srclang ||
          "en";
        return {
          file: file.startsWith("//") ? `https:${file}` : file,
          language,
          label:
            track.label || track.name || language || `Subtitle ${index + 1}`,
        };
      })
      .filter(Boolean) as NativeSubtitleTrack[];
  };

  useEffect(() => {
    if (nativeData && nativeLanguage && selectedPlayerUrl === "native") {
      const filtered = dedupeNativeSources(
        nativeData.sources.filter(
          (source: any) => (source.language || "Unknown") === nativeLanguage,
        ),
      );
      setNativeQualities(filtered);
      if (filtered.length > 0) {
        // autoplay=true: always start playing when a server resolves sources
        playNativeSource(filtered[0], true);
      }
    }
  }, [nativeData, nativeLanguage, selectedPlayerUrl]);

  useEffect(() => {
    applyNativeSubtitleTrack(nativeSubtitleIndex);
    const retry = window.setTimeout(
      () => applyNativeSubtitleTrack(nativeSubtitleIndex),
      250,
    );
    return () => window.clearTimeout(retry);
  }, [nativeSubtitleIndex, nativeSubtitles, nativeSubtitleRenderKey]);

  useEffect(() => {
    const player = nativePlayerRef.current;
    const track =
      nativeSubtitleIndex >= 0
        ? player?.textTracks?.[nativeSubtitleIndex]
        : null;
    if (!track) {
      setNativeCueText("");
      return;
    }

    const onCueChange = () => updateNativeCueText(nativeSubtitleIndex);
    track.addEventListener("cuechange", onCueChange);
    updateNativeCueText(nativeSubtitleIndex);
    return () => track.removeEventListener("cuechange", onCueChange);
  }, [nativeSubtitleIndex, nativeSubtitles, nativeSubtitleRenderKey]);

  const applyNativeSubtitleTrack = (index: number) => {
    const player = nativePlayerRef.current;
    if (!player?.textTracks) {
      setNativeCueText("");
      return;
    }

    for (let i = 0; i < player.textTracks.length; i++) {
      player.textTracks[i].mode = i === index ? "hidden" : "disabled";
    }
    updateNativeCueText(index);
  };

  const selectNativeSubtitle = (index: number) => {
    setNativeSubtitleIndex(index);
    setNativeSettingsOpen(false);
    if (index < 0) setNativeCueText("");
    window.setTimeout(() => applyNativeSubtitleTrack(index), 0);
    window.setTimeout(() => applyNativeSubtitleTrack(index), 300);
  };

  const updateNativeCueText = (index = nativeSubtitleIndex) => {
    const player = nativePlayerRef.current;
    const track = index >= 0 ? player?.textTracks?.[index] : null;
    if (!track?.activeCues?.length) {
      setNativeCueText("");
      return;
    }

    const text = Array.from(track.activeCues)
      .map((cue: any) => String(cue?.text || "").replace(/<[^>]+>/g, ""))
      .filter(Boolean)
      .join("\n");
    setNativeCueText(text);
  };

  const playNativeSource = async (source: any, autoplay = false) => {
    const player = nativePlayerRef.current;
    if (!player) return;

    // Save current playback position and state before switching source
    const resumeTime = player.currentTime > 0 ? player.currentTime : 0;
    const wasPlaying = !player.paused;
    // Autoplay on initial server selection OR if already playing (e.g. quality switch)
    const shouldPlay = autoplay || wasPlaying;

    setNativeSelectedSource(source);
    setNativeSettingsOpen(false);
    setNativeError("");
    setNativeHlsLevels([]);
    setNativeHlsLevel(-1);

    const headers = encodeURIComponent(JSON.stringify(source.headers || {}));
    const isHls =
      source.type === "hls" ||
      source.url.includes(".m3u8") ||
      source.url.includes("m3u8-proxy");
    let playUrl = `/api/test-server/mp4-proxy?provider=${source.provider}&url=${encodeURIComponent(source.url)}&headers=${headers}`;
    if (isHls) {
      playUrl = `/api/test-server/hls-proxy?provider=${source.provider}&url=${encodeURIComponent(source.url)}&headers=${headers}`;
    }

    if (hlsRef.current) {
      try {
        hlsRef.current.removeAllListeners?.();
        hlsRef.current.detachMedia?.();
        hlsRef.current.destroy?.();
      } catch {}
      hlsRef.current = null;
    }
    player.pause();
    player.removeAttribute("src");
    player.load();
    setNativePlaying(false);

    // Helper: seek to saved position and resume/autoplay once source is ready
    const onResumeReady = () => {
      if (resumeTime > 0) {
        player.currentTime = resumeTime;
        setNativeCurrent(resumeTime);
      }
      if (shouldPlay) {
        setNativeBuffering(true);
        player
          .play()
          .then(() => {
            setNativePlaying(true);
            setNativeBuffering(false);
          })
          .catch(() => {
            player.muted = true;
            setNativeMuted(true);
            player
              .play()
              .then(() => {
                setNativePlaying(true);
                setNativeBuffering(false);
              })
              .catch(() => {
                setNativeBuffering(false);
              });
          });
      }
    };

    if (source.type === "hls" || playUrl.includes("/hls-proxy")) {
      const Hls = await getHls(); // Uses preloaded/cached module — no import delay
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          debug: false,
          startFragPrefetch: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        hlsRef.current = hls;
        hls.loadSource(playUrl);
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, (_event: any, data: any) => {
          const levels = dedupeHlsLevels(
            (data?.levels || hls.levels || [])
              .map((level: any, index: number) => ({
                level: index,
                height: Number(level?.height) || 0,
                width: Number(level?.width) || 0,
                bitrate: Number(level?.bitrate) || undefined,
              }))
              .filter((level: NativeHlsLevel) => level.height > 0)
              .sort(
                (a: NativeHlsLevel, b: NativeHlsLevel) =>
                  (b.width || b.height) - (a.width || a.height),
              ),
          );
          setNativeHlsLevels(levels);
          setNativeHlsLevel(-1);
          hls.currentLevel = -1;
          onResumeReady();
        });
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (!data?.fatal) return;
          const detail =
            data?.details || data?.type || "Unable to play this HLS source";
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setNativeError(`Stream error: ${detail}`);
            setNativeHlsLevels([]);
            hls.destroy();
          }
        });
      } else {
        player.src = playUrl;
        player.load();
        player.addEventListener("loadedmetadata", onResumeReady, {
          once: true,
        });
      }
    } else {
      setNativeHlsLevels([]);
      player.src = playUrl;
      player.load();
      player.addEventListener("loadedmetadata", onResumeReady, { once: true });
    }
  };

  const nativeProgress =
    nativeDuration > 0
      ? Math.min(100, Math.max(0, (nativeCurrent / nativeDuration) * 100))
      : 0;

  const toggleNativePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const player = nativePlayerRef.current;
    if (!player) return;
    if (player.paused) {
      setNativeBuffering(true);
      player
        .play()
        .then(() => {
          setNativePlaying(true);
          setNativeBuffering(false);
        })
        .catch(() => {
          setNativeBuffering(false);
        });
    } else {
      player.pause();
      setNativePlaying(false);
      setNativeBuffering(false);
    }
  };

  const skipNative = (seconds: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const player = nativePlayerRef.current;
    if (!player || !nativeDuration) return;
    const nextTime = Math.max(
      0,
      Math.min(nativeDuration, player.currentTime + seconds),
    );
    player.currentTime = nextTime;
    setNativeCurrent(nextTime);
    setSkipMessage({
      text: seconds > 0 ? `+${seconds}s` : `${seconds}s`,
      side: seconds > 0 ? "right" : "left",
      key: Date.now(),
    });
  };

  const seekNative = (value: number) => {
    const player = nativePlayerRef.current;
    if (!player || !nativeDuration) return;
    const nextTime = (value / 100) * nativeDuration;
    player.currentTime = nextTime;
    setNativeCurrent(nextTime);
  };

  const setNativeVolumeLevel = (value: number) => {
    const player = nativePlayerRef.current;
    const nextValue = Math.min(1, Math.max(0, value));
    setNativeVolume(nextValue);
    setNativeMuted(nextValue === 0);
    if (player) {
      player.volume = nextValue;
      player.muted = nextValue === 0;
    }
  };

  const toggleNativeMute = () => {
    const player = nativePlayerRef.current;
    if (!player) return;
    player.muted = !player.muted;
    setNativeMuted(player.muted);
  };

  const fullscreenNativePlayer = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    playerRef.current?.requestFullscreen().catch(() => {});
  };

  const changeNativeHlsQuality = (level: number) => {
    const hls = hlsRef.current;
    if (!hls) return;
    hls.currentLevel = level;
    setNativeHlsLevel(level);
    setNativeSettingsOpen(false);
  };

  useEffect(() => {
    if (!isPlaying || selectedPlayerUrl !== "native") return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        target?.isContentEditable
      )
        return;

      const player = nativePlayerRef.current;
      if (!player) return;

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          toggleNativePlay();
          break;
        case "arrowright":
          event.preventDefault();
          player.currentTime = Math.min(
            player.duration || Infinity,
            player.currentTime + 10,
          );
          setNativeCurrent(player.currentTime || 0);
          break;
        case "arrowleft":
          event.preventDefault();
          player.currentTime = Math.max(0, player.currentTime - 10);
          setNativeCurrent(player.currentTime || 0);
          break;
        case "arrowup":
          event.preventDefault();
          setNativeVolumeLevel((nativeMuted ? 0 : nativeVolume) + 0.1);
          break;
        case "arrowdown":
          event.preventDefault();
          setNativeVolumeLevel((nativeMuted ? 0 : nativeVolume) - 0.1);
          break;
        case "m":
          event.preventDefault();
          toggleNativeMute();
          break;
        case "f":
          event.preventDefault();
          fullscreenNativePlayer();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isPlaying,
    selectedPlayerUrl,
    nativeMuted,
    nativeVolume,
    nativeDuration,
    nativePlaying,
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[#F5C518] selection:text-black font-sans relative overflow-hidden transition-colors duration-300">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F5C518] rounded-[100%] blur-[120px] mix-blend-screen" />
      </div>

      <AnimatePresence mode="wait">
        {isInitialLoading && (
          <motion.div
            key="loading-initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0B0B]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#E50914] blur-[40px] opacity-20 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-sora)] text-white mt-8 mb-2">Preparing Cinematic Stream</h2>
            <AnimatedLoaderText />
          </motion.div>
        )}
        {/* ═══════════════ SEARCH / RESULT STATE ═══════════════ */}
        {!isPlaying && !streamData && !isInitialLoading && (
          <motion.main
            key="search"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 md:px-8 max-w-[800px] mx-auto z-10"
          >
            <div className="text-center mb-10 w-full">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center justify-center bg-[#F5C518] text-black font-black text-xs px-3 py-1 mb-6 rounded uppercase tracking-wider shadow-[0_0_20px_rgba(245,197,24,0.3)]"
              >
                Pro Stream
              </motion.div>
              <h1
                className="font-bold text-[40px] sm:text-[56px] md:text-[72px] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6 transition-colors duration-300"
                style={{ fontFamily: "var(--font-sora)" }}
              >
                Watch from <span className="text-[#F5C518]">IMDb</span>
              </h1>
              <p
                className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto font-medium transition-colors duration-300"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Drop the IMDb ID below to bypass ads and instantly stream in
                cinematic HD. The ultimate cinema experience, right in your
                browser.
              </p>
            </div>

            <motion.div
              animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
              className="w-full max-w-2xl relative z-20"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F5C518]/50 to-[#F5C518]/10 rounded-[16px] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative flex flex-col sm:flex-row gap-2 sm:gap-3 w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] overflow-hidden p-2 shadow-2xl transition-colors duration-300">
                  <div className="relative flex items-center flex-1 ml-1 sm:ml-2">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-muted)] shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none focus:ring-0 shadow-none px-2 sm:px-4 py-3 sm:py-4 md:py-5 font-mono text-lg sm:text-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] w-full min-w-0 transition-colors duration-300"
                      placeholder="e.g. tt0111161"
                      value={imdbId}
                      onChange={(e) => {
                        setImdbId(e.target.value);
                        setError("");
                        if (!e.target.value) setStreamData(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading || !imdbId}
                    className="w-full sm:w-auto px-8 py-4 sm:py-0 sm:h-auto rounded-[12px] bg-[#F5C518] hover:bg-[#E3B514] text-black font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="text-[var(--text-muted)] text-sm font-medium transition-colors duration-300">
                Try it out:
              </span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleSearch(ex)}
                  className="px-4 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#F5C518] hover:bg-[#F5C518]/10 font-mono text-xs transition-all duration-300"
                >
                  {ex}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-8 p-4 px-6 w-full max-w-md bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center justify-center gap-3 backdrop-blur-md font-medium"
                >
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            
          </motion.main>
        )}

        {!isPlaying && streamData && !isInitialLoading && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#0B0B0B] text-white overflow-y-auto"
          >
            {/* Cinematic Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[#E50914]/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative min-h-screen px-4 md:px-12 py-8 md:py-16 max-w-7xl mx-auto flex flex-col">
              {/* Back Button */}
              <button
                onClick={() => {
                  setStreamData(null);
                  setImdbId("");
                }}
                className="self-start flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors text-sm font-medium mb-8 md:mb-16"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to search results
              </button>

              <div className="flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-24">
                {/* Left Column: Poster & Action */}
                <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 flex flex-col gap-6">
                  {streamData.movie?.poster ? (
                    <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                      <Image
                        src={streamData.movie.poster}
                        alt={streamData.movie.title || "Poster"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 380px"
                        priority
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                        {streamData.movie.type === "series" ? "Series" : "Movie"}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center">
                      <Film className="w-16 h-16 text-white/20" />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedServerId("auto");
                      setIsPlaying(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-[#E50914] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#b80710] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(229,9,20,0.3)]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Stream Now
                  </button>
                </div>

                {/* Right Column: Details */}
                <div className="flex-1 flex flex-col py-2">
                  <h1
                    className="font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-2 tracking-tight"
                    style={{ fontFamily: "var(--font-sora)" }}
                  >
                    {streamData.movie?.title ?? streamData.imdbId}
                    {streamData.movie?.year && (
                      <span className="text-white/40 font-medium ml-4">({streamData.movie.year})</span>
                    )}
                  </h1>

                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#a8a8a8] mb-8">
                    {streamData.movie?.rating && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5">
                        <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
                        {streamData.movie.rating}
                      </span>
                    )}
                    {streamData.movie?.runtime && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5">
                        <Clock className="w-3.5 h-3.5" />
                        {streamData.movie.runtime}
                      </span>
                    )}
                    {streamData.movie?.released && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {streamData.movie.released}
                      </span>
                    )}
                    <span className="px-3 py-1.5 rounded-md bg-[#1f1f1f] border border-white/5 font-mono">
                      IMDB: {streamData.imdbId}
                    </span>
                  </div>

                  {/* Overview */}
                  {streamData.movie?.overview && (
                    <p 
                      className="text-base md:text-lg text-white/70 leading-relaxed mb-12 max-w-3xl" 
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {streamData.movie.overview}
                    </p>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                    {streamData.movie?.actors && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5 sm:col-span-2">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">The Cast</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.actors}</span>
                      </div>
                    )}
                    {streamData.movie?.director && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">Director</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.director}</span>
                      </div>
                    )}
                    {streamData.movie?.writer && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">Writer</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.writer}</span>
                      </div>
                    )}
                    {streamData.movie?.genre && (
                      <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 flex flex-col gap-1.5 sm:col-span-2">
                        <span className="text-[10px] font-bold tracking-widest text-[#E50914] uppercase">Genres</span>
                        <span className="text-sm text-white/90 leading-relaxed">{streamData.movie.genre}</span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}


        {/* ═══════════════ WATCH PAGE (PLAYING) ═══════════════ */}
        {isPlaying && streamData?.imdbId && (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen bg-[#000000] text-white transition-colors duration-300"
          >
            <div className="w-full relative z-10 pt-[40px] pb-24 font-sans bg-[#000000]">
              <div className="max-w-[1500px] mx-auto px-4 md:px-8 mb-6">
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsPlaying(false);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#a8a8a8] hover:text-white transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Browse
                </Link>
              </div>

              <div className="max-w-[1500px] mx-auto px-4 md:px-8 w-full flex flex-col gap-6">
                {/* 1. The Video Player (Billboard Style) */}
                <div className="w-full relative bg-black shadow-2xl">
                  <div
                    ref={playerRef}
                    className="relative z-10 w-full aspect-video bg-black overflow-hidden rounded-[8px] border border-[#333333] shadow-2xl group/player transition-colors duration-300"
                  >
                    {selectedPlayerUrl === "native" ? (
                      <div className="w-full h-full relative">
                        {nativeLoading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                            <motion.div
                              animate={{
                                opacity: [0.65, 1, 0.65],
                                scale: [0.98, 1, 0.98],
                              }}
                              transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-4 sm:px-8 py-7 shadow-2xl backdrop-blur w-[90%] max-w-sm mx-auto text-center"
                            >
                              <span className="w-10 h-10 border-4 border-[#E50914]/25 border-t-[#E50914] rounded-full animate-spin" />
                              <p className="mt-4 max-w-sm text-center text-[#E50914] font-mono text-sm font-bold">
                                {nativeAutoStatus ||
                                  "Confirming playable sources..."}
                              </p>
                              <AnimatedLoaderText />
                              <p className="text-white/60 text-xs text-center mt-6 max-w-sm px-4 leading-relaxed font-medium">
                                To provide you an ad-free experience we do a lot of research. This means the first load takes a bit more time. Please stay with us!
                              </p>
                            </motion.div>
                          </div>
                        ) : nativeError ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black">
                            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="max-w-md text-red-500 font-bold">
                              {nativeError}
                            </p>
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                              <button
                                onClick={() =>
                                  loadNativeServer(
                                    selectedServerId,
                                    selectedServerId !== "gemma",
                                    selectedServerId === "gemma",
                                  )
                                }
                                className="rounded-md bg-[#E50914] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#ff1b25]"
                              >
                                Try Again
                              </button>
                              <button
                                onClick={loadAutoNativeServer}
                                className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
                              >
                                Use Shadow Auto
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <video
                              ref={nativePlayerRef}
                              playsInline
                              preload="auto"
                              className="h-full w-full bg-black object-contain outline-none"
                              onClick={toggleNativePlay}
                              onDoubleClick={(e) => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                const isRight =
                                  e.clientX > rect.left + rect.width / 2;
                                skipNative(isRight ? 5 : -5, e);
                              }}
                              onLoadedMetadata={(event) => {
                                const video = event.currentTarget;
                                setNativeDuration(video.duration || 0);
                                setNativeSubtitleIndex((idx) => idx);
                              }}
                              onDurationChange={(event) =>
                                setNativeDuration(
                                  event.currentTarget.duration || 0,
                                )
                              }
                              onTimeUpdate={(event) => {
                                setNativeCurrent(
                                  event.currentTarget.currentTime || 0,
                                );
                                if (nativeSubtitleIndex >= 0)
                                  updateNativeCueText(nativeSubtitleIndex);
                              }}
                              onWaiting={() => setNativeBuffering(true)}
                              onPlaying={() => {
                                setNativePlaying(true);
                                setNativeBuffering(false);
                              }}
                              onCanPlay={() => setNativeBuffering(false)}
                              onCanPlayThrough={() => setNativeBuffering(false)}
                              onPlay={() => {
                                setNativePlaying(true);
                                setNativeBuffering(false);
                              }}
                              onPause={() => {
                                setNativePlaying(false);
                                setNativeBuffering(false);
                              }}
                            >
                              {nativeSubtitles.map((track, index) => (
                                <track
                                  key={`${nativeSubtitleRenderKey}-${track.file}-${index}`}
                                  kind="subtitles"
                                  src={`/api/net/subtitle?url=${encodeURIComponent(track.file)}`}
                                  srcLang={track.language}
                                  label={track.label}
                                  onLoad={() =>
                                    applyNativeSubtitleTrack(
                                      nativeSubtitleIndex,
                                    )
                                  }
                                />
                              ))}
                            </video>

                            <AnimatePresence>
                              {skipMessage && (
                                <motion.div
                                  key={skipMessage.key}
                                  initial={{
                                    opacity: 0,
                                    scale: 0.8,
                                    x: skipMessage.side === "right" ? 20 : -20,
                                  }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 1.2 }}
                                  transition={{ duration: 0.4 }}
                                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center rounded-full bg-black/60 p-4 text-white backdrop-blur-sm ${
                                    skipMessage.side === "right"
                                      ? "right-1/4"
                                      : "left-1/4"
                                  }`}
                                >
                                  {skipMessage.side === "right" ? (
                                    <RotateCw className="mb-1 h-8 w-8" />
                                  ) : (
                                    <RotateCcw className="mb-1 h-8 w-8" />
                                  )}
                                  <span className="font-mono text-sm font-bold">
                                    {skipMessage.text}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {nativeCueText && (
                              <div className="pointer-events-none absolute inset-x-4 bottom-28 z-20 flex justify-center px-4 text-center md:bottom-32">
                                <div className="max-w-[85%] whitespace-pre-line rounded bg-black/75 px-3 py-1.5 text-base font-semibold leading-snug text-white shadow-[0_2px_10px_rgba(0,0,0,0.8)] md:text-xl">
                                  {nativeCueText}
                                </div>
                              </div>
                            )}

                            {nativeAutoStatus && (
                              <div className="pointer-events-none absolute left-4 top-4 z-20 rounded bg-black/65 px-3 py-1.5 text-[11px] font-mono font-bold text-white/70 backdrop-blur">
                                {nativeAutoStatus}
                              </div>
                            )}

                            {nativeBuffering ? (
                              <div 
                                className="absolute left-1/2 top-1/2 z-10 flex w-[90%] max-w-[320px] flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-black/40 px-4 sm:px-6 pt-5 pb-6 backdrop-blur-md cursor-pointer"
                                onClick={toggleNativePlay}
                              >
                                <span className="w-10 h-10 border-4 border-[#E50914]/30 border-t-[#E50914] rounded-full animate-spin mb-2" />
                                <AnimatedLoaderText
                                  customPhrases={[
                                    "Connecting to stream...",
                                    "Buffering video chunks...",
                                    "Optimizing playback...",
                                    "Almost there...",
                                    "Starting your movie...",
                                  ]}
                                />
                                <p className="text-white/60 text-xs text-center mt-8 max-w-xs leading-relaxed font-medium">
                                  To provide you an ad-free experience we do a lot of research. This means the first load takes a bit more time. Please stay with us!
                                </p>
                              </div>
                            ) : (
                              !nativePlaying && (
                                <button
                                  onClick={toggleNativePlay}
                                  className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                                  title="Play"
                                >
                                  <Play className="ml-1 h-10 w-10 fill-white" />
                                </button>
                              )
                            )}

                            <div
                              className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-4 pt-20 md:px-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="mb-3 flex items-center gap-3">
                                <span className="w-12 text-xs font-mono text-white">
                                  {fmtTime(nativeCurrent)}
                                </span>
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={nativeProgress}
                                  onChange={(event) =>
                                    seekNative(Number(event.target.value))
                                  }
                                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-[#E50914]"
                                  style={{
                                    background: `linear-gradient(to right, #E50914 ${nativeProgress}%, rgba(255,255,255,0.25) ${nativeProgress}%)`,
                                  }}
                                />
                                <span className="w-12 text-right text-xs font-mono text-white/70">
                                  {fmtTime(nativeDuration)}
                                </span>
                              </div>

                              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3">
                                <div className="flex items-center gap-1 sm:gap-3">
                                  <button
                                    onClick={(e) => skipNative(-5, e)}
                                    className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110"
                                    title="Skip Backward 5s"
                                  >
                                    <RotateCcw className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={toggleNativePlay}
                                    className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110"
                                    title={nativePlaying ? "Pause" : "Play"}
                                  >
                                    {nativePlaying ? (
                                      <Pause className="h-7 w-7 fill-white" />
                                    ) : (
                                      <Play className="ml-0.5 h-7 w-7 fill-white" />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => skipNative(5, e)}
                                    className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110"
                                    title="Skip Forward 5s"
                                  >
                                    <RotateCw className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={toggleNativeMute}
                                    className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110"
                                    title="Volume"
                                  >
                                    {nativeMuted || nativeVolume === 0 ? (
                                      <VolumeX className="h-6 w-6" />
                                    ) : (
                                      <Volume2 className="h-6 w-6" />
                                    )}
                                  </button>
                                  <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={nativeMuted ? 0 : nativeVolume}
                                    onChange={(event) =>
                                      setNativeVolumeLevel(
                                        Number(event.target.value),
                                      )
                                    }
                                    className="hidden h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/30 accent-white sm:block"
                                  />
                                </div>

                                <div className="relative flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      setNativeSettingsOpen((open) => !open)
                                    }
                                    className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10"
                                    title="Quality, language, and subtitles"
                                  >
                                    <Settings
                                      className={`h-5 w-5 transition-transform duration-200 ${nativeSettingsOpen ? "rotate-90" : "rotate-0"}`}
                                    />
                                  </button>
                                  <button
                                    onClick={fullscreenNativePlayer}
                                    className="flex h-10 w-10 items-center justify-center text-white transition hover:bg-white/10"
                                    title="Fullscreen"
                                  >
                                    <Maximize className="h-5 w-5" />
                                  </button>

                                  <AnimatePresence>
                                    {nativeSettingsOpen && (
                                      <motion.div
                                        initial={{
                                          opacity: 0,
                                          y: 8,
                                          scale: 0.96,
                                        }}
                                        animate={{
                                          opacity: 1,
                                          y: 0,
                                          scale: 1,
                                        }}
                                        exit={{
                                          opacity: 0,
                                          y: 8,
                                          scale: 0.96,
                                        }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute bottom-12 right-0 w-[min(20rem,calc(100vw-2rem))] sm:w-[20rem] overflow-hidden rounded-xl border border-white/10 bg-black/95 text-white shadow-2xl backdrop-blur-md"
                                      >
                                        <div className="flex border-b border-white/10">
                                          {(
                                            [
                                              "quality",
                                              "language",
                                              "subtitles",
                                            ] as NativeSettingsTab[]
                                          ).map((tab) => (
                                            <button
                                              key={tab}
                                              onClick={() =>
                                                setNativeSettingsTab(tab)
                                              }
                                              className={`flex-1 py-2.5 text-[11px] font-bold capitalize transition-colors ${nativeSettingsTab === tab ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
                                            >
                                              {tab === "language"
                                                ? "Audio"
                                                : tab}
                                            </button>
                                          ))}
                                        </div>

                                        <div className="max-h-56 overflow-y-auto py-1">
                                          {nativeSettingsTab === "quality" &&
                                            (nativeHlsLevels.length > 0 ? (
                                              <>
                                                <button
                                                  onClick={() =>
                                                    changeNativeHlsQuality(-1)
                                                  }
                                                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${nativeHlsLevel === -1 ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                >
                                                  {nativeHlsLevel === -1 && (
                                                    <Check className="h-3.5 w-3.5 shrink-0" />
                                                  )}
                                                  <span
                                                    className={
                                                      nativeHlsLevel === -1
                                                        ? ""
                                                        : "ml-5"
                                                    }
                                                  >
                                                    Auto Quality
                                                  </span>
                                                </button>
                                                {nativeHlsLevels.map(
                                                  (level) => {
                                                    const selected =
                                                      nativeHlsLevel ===
                                                      level.level;
                                                    return (
                                                      <button
                                                        key={`hls-${level.level}-${level.height}`}
                                                        onClick={() =>
                                                          changeNativeHlsQuality(
                                                            level.level,
                                                          )
                                                        }
                                                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                      >
                                                        {selected && (
                                                          <Check className="h-3.5 w-3.5 shrink-0" />
                                                        )}
                                                        <span
                                                          className={
                                                            selected
                                                              ? ""
                                                              : "ml-5"
                                                          }
                                                        >
                                                          {nativeHlsQualityLabel(
                                                            level,
                                                          )}
                                                        </span>
                                                      </button>
                                                    );
                                                  },
                                                )}
                                              </>
                                            ) : nativeQualities.length > 0 ? (
                                              nativeQualities.map(
                                                (source, idx) => {
                                                  const selected =
                                                    nativeSelectedSource ===
                                                    source;
                                                  return (
                                                    <button
                                                      key={`${source.provider}-${nativeSourceQuality(source)}-${idx}`}
                                                      onClick={() =>
                                                        playNativeSource(source)
                                                      }
                                                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                    >
                                                      {selected && (
                                                        <Check className="h-3.5 w-3.5 shrink-0" />
                                                      )}
                                                      <span
                                                        className={
                                                          selected ? "" : "ml-5"
                                                        }
                                                      >
                                                        {nativeSourceLabel(
                                                          source,
                                                        )}
                                                      </span>
                                                    </button>
                                                  );
                                                },
                                              )
                                            ) : (
                                              <p className="px-4 py-3 text-xs text-white/40">
                                                No quality variants available
                                              </p>
                                            ))}

                                          {nativeSettingsTab === "language" &&
                                            (nativeLanguages.length > 0 ? (
                                              nativeLanguages.map((lang) => {
                                                const selected =
                                                  nativeLanguage === lang;
                                                return (
                                                  <button
                                                    key={lang}
                                                    onClick={() => {
                                                      setNativeLanguage(lang);
                                                      setNativeSettingsOpen(
                                                        false,
                                                      );
                                                    }}
                                                    className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                  >
                                                    {selected && (
                                                      <Check className="h-3.5 w-3.5 shrink-0" />
                                                    )}
                                                    <span
                                                      className={
                                                        selected ? "" : "ml-5"
                                                      }
                                                    >
                                                      {lang}
                                                    </span>
                                                  </button>
                                                );
                                              })
                                            ) : (
                                              <p className="px-4 py-3 text-xs text-white/40">
                                                No alternate audio languages
                                              </p>
                                            ))}

                                          {nativeSettingsTab ===
                                            "subtitles" && (
                                            <>
                                              <button
                                                onClick={() => {
                                                  selectNativeSubtitle(-1);
                                                }}
                                                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${nativeSubtitleIndex === -1 ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                              >
                                                {nativeSubtitleIndex === -1 && (
                                                  <Check className="h-3.5 w-3.5 shrink-0" />
                                                )}
                                                <span
                                                  className={
                                                    nativeSubtitleIndex === -1
                                                      ? ""
                                                      : "ml-5"
                                                  }
                                                >
                                                  Off
                                                </span>
                                              </button>
                                              {nativeSubtitles.length > 0 ? (
                                                nativeSubtitles.map(
                                                  (track, index) => {
                                                    const selected =
                                                      nativeSubtitleIndex ===
                                                      index;
                                                    return (
                                                      <button
                                                        key={`${track.label}-${index}`}
                                                        onClick={() => {
                                                          selectNativeSubtitle(
                                                            index,
                                                          );
                                                        }}
                                                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                      >
                                                        {selected && (
                                                          <Check className="h-3.5 w-3.5 shrink-0" />
                                                        )}
                                                        <span
                                                          className={
                                                            selected
                                                              ? ""
                                                              : "ml-5"
                                                          }
                                                        >
                                                          {track.label}
                                                        </span>
                                                      </button>
                                                    );
                                                  },
                                                )
                                              ) : (
                                                <p className="px-4 py-3 text-xs text-white/40">
                                                  No subtitles available
                                                </p>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <iframe
                        key={externalPlayerUrl}
                        className="w-full h-full border-0"
                        src={externalPlayerUrl}
                        title="IMDb Movie Player"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                        {...(selectedServerId === "server1" ? { sandbox: "allow-scripts allow-same-origin allow-forms allow-presentation" } : {})}
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    )}
                  </div>
                </div>

                {/* 2. Stream Options Container */}
                {/* Stream Options Container */}
                <div className="flex flex-col gap-4 bg-[#141414] p-5 rounded-[4px] border border-[#2f2f2f]">
                  <h3 className="text-white text-lg font-bold mb-1">
                    Stream Options
                  </h3>

                  {/* Servers Row */}
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-[#808080]">
                      Select Server
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {NATIVE_SERVER_OPTIONS.filter(
                        (s) => adminConfigRef.current?.showAdFree !== false,
                      ).filter((s) => !adminConfigRef.current?.disabledServers?.[s.id]).map((server) => (
                        <button
                          key={server.id}
                          onClick={() =>
                            loadNativeServer(
                              server.id,
                              server.reqTmdb,
                              server.reqImdb,
                            )
                          }
                          className={`px-4 py-2 rounded-[4px] font-sans text-sm font-bold transition-all ${selectedServerId === server.id ? "bg-[#e50914] text-white" : "bg-[#2f2f2f] text-[#ffffff] hover:bg-[#404040]"}`}
                        >
                          {server.label}{" "}
                          {selectedServerId === server.id && "• Active"}
                        </button>
                      ))}

                      <div className="relative z-[100]">
                        <button
                          type="button"
                          onClick={() => setThirdPartyOpen((open) => !open)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-[4px] font-sans text-xs sm:text-sm font-bold transition-all outline-none ${["server1", "server2", "server3"].includes(selectedServerId) ? "bg-[#e50914] text-white" : "bg-[#2f2f2f] text-[#ffffff] hover:bg-[#404040]"}`}
                          title="Third party server contain ads"
                        >
                          <span>{thirdPartyServerLabel}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 opacity-70 transition-transform ${thirdPartyOpen ? "rotate-180" : "rotate-0"}`}
                          />
                        </button>

                        <AnimatePresence>
                          {thirdPartyOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98 }}
                              transition={{ duration: 0.14 }}
                              className="absolute left-0 top-full z-[200] mt-2 min-w-[200px] overflow-hidden rounded-[4px] border border-[#333333] bg-[#141414] py-1 shadow-2xl"
                            >
                              {streamData.playerUrl && !adminConfigRef.current?.disabledServers?.["server1"] && (
                                <button
                                  onClick={() =>
                                    playThirdPartyServer("server1")
                                  }
                                  className="block w-full whitespace-nowrap px-4 py-2.5 text-left font-sans text-sm font-bold text-[#a8a8a8] transition hover:bg-[#e50914] hover:text-white"
                                >
                                  Server 1
                                </button>
                              )}
                              {alternatePlayerUrl && !adminConfigRef.current?.disabledServers?.["server2"] && (
                                <button
                                  onClick={() =>
                                    playThirdPartyServer("server2")
                                  }
                                  className="block w-full whitespace-nowrap px-4 py-2.5 text-left font-sans text-sm font-bold text-[#a8a8a8] transition hover:bg-[#e50914] hover:text-white"
                                >
                                  Server 2
                                </button>
                              )}
                              {tmdbId && !adminConfigRef.current?.disabledServers?.["server3"] && (
                                <button
                                  onClick={() =>
                                    playThirdPartyServer("server3")
                                  }
                                  className="block w-full whitespace-nowrap px-4 py-2.5 text-left font-sans text-sm font-bold text-[#a8a8a8] transition hover:bg-[#e50914] hover:text-white"
                                >
                                  Server 3
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Episodes Row */}
                  {streamData.movie?.type === "series" && (
                    <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-[#333333]">
                      <span className="text-sm font-semibold text-[#808080]">
                        Episodes
                      </span>
                      <div className="flex flex-wrap gap-3 items-center">
                        <select
                          value={selectedSeason}
                          onChange={(e) => {
                            setSelectedSeason(Number(e.target.value));
                            setSelectedEpisode(1);
                          }}
                          className="bg-[#2f2f2f] text-white rounded-[4px] px-3 py-2 outline-none font-sans text-sm border border-[#333333] focus:border-[#e50914] transition-colors"
                        >
                          {Array.from({
                            length: Number(streamData.movie.totalSeasons) || 1,
                          }).map((_, i) => (
                            <option key={i} value={i + 1}>
                              Season {i + 1}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedEpisode}
                          onChange={(e) =>
                            setSelectedEpisode(Number(e.target.value))
                          }
                          className="bg-[#2f2f2f] text-white rounded-[4px] px-3 py-2 outline-none font-sans text-sm border border-[#333333] focus:border-[#e50914] transition-colors"
                        >
                          {Array.from({ length: episodeCount || 50 }).map(
                            (_, i) => (
                              <option key={i} value={i + 1}>
                                Episode {i + 1}
                              </option>
                            ),
                          )}
                        </select>
                        <button
                          onClick={() =>
                            loadNativeServer(
                              selectedServerId,
                              selectedServerId !== "gemma",
                              selectedServerId === "gemma",
                            )
                          }
                          className="px-6 py-2 rounded-[4px] bg-[#e50914] text-white font-bold text-sm hover:bg-[#b20710] transition"
                        >
                          Play Episode
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Details Section */}
                <div className="flex flex-col lg:flex-row gap-10 mt-6">
                  {/* Left Column (Title & Plot) */}
                  <div className="w-full lg:w-2/3 flex flex-col gap-5">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-[2px] bg-[#e50914] px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                        {streamData.movie?.type === "series"
                          ? "Series"
                          : "Film"}
                      </div>
                      <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-3 font-[family-name:var(--font-sora)]">
                        {streamData.movie?.title ?? streamData.imdbId}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-[#a8a8a8]">
                        {streamData.movie?.year && (
                          <span>{streamData.movie.year}</span>
                        )}
                        {streamData.movie?.rating && (
                          <span className="px-1.5 py-0.5 border border-[#333333] text-xs font-bold text-[#a8a8a8] uppercase rounded-sm">
                            {streamData.movie.rating}/10
                          </span>
                        )}
                        {streamData.movie?.totalSeasons && (
                          <span>{streamData.movie.totalSeasons} Seasons</span>
                        )}
                        {streamData.movie?.runtime && (
                          <span>{streamData.movie.runtime}</span>
                        )}
                        <span className="px-1.5 py-0.5 border border-[#333333] text-xs font-bold text-[#a8a8a8] uppercase rounded-[2px]">
                          HD
                        </span>
                      </div>
                    </div>

                    {streamData.movie?.overview && (
                      <p className="text-[15px] text-[#ffffff] leading-relaxed font-sans mt-2 mb-4">
                        {streamData.movie.overview}
                      </p>
                    )}
                  </div>

                  {/* Right Column (Cast & Metadata) */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-5">
                    <div className="flex flex-col gap-3 text-[14px] font-sans border-t border-[#333333] pt-4">
                      {streamData.movie?.actors && (
                        <div>
                          <span className="text-[#808080]">Cast: </span>
                          <span className="text-white">
                            {streamData.movie.actors}
                          </span>
                        </div>
                      )}
                      {streamData.movie?.director && (
                        <div>
                          <span className="text-[#808080]">Director: </span>
                          <span className="text-white">
                            {streamData.movie.director}
                          </span>
                        </div>
                      )}
                      {streamData.movie?.writer && (
                        <div>
                          <span className="text-[#808080]">Writer: </span>
                          <span className="text-white">
                            {streamData.movie.writer}
                          </span>
                        </div>
                      )}
                      {streamData.movie?.genre && (
                        <div>
                          <span className="text-[#808080]">Genres: </span>
                          <span className="text-white">
                            {streamData.movie.genre}
                          </span>
                        </div>
                      )}
                      {streamData.movie?.language && (
                        <div>
                          <span className="text-[#808080]">Language: </span>
                          <span className="text-white">
                            {streamData.movie.language}
                          </span>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-[#333333] flex gap-3">
                        <div className="inline-flex px-2 py-1 bg-[#141414] rounded-[4px] font-mono text-[10px] text-[#a8a8a8] border border-[#2f2f2f]">
                          IMDb: {streamData.imdbId}
                        </div>
                        {tmdbId && (
                          <div className="inline-flex px-2 py-1 bg-[#141414] rounded-[4px] font-mono text-[10px] text-[#a8a8a8] border border-[#2f2f2f]">
                            TMDB: {tmdbId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
