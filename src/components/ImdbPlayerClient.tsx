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
  CheckCircle2,
  CalendarDays,
  Info,
  Clock,
  ChevronRight,
  ChevronDown,
  Settings,
  Check,
  Volume2,
  VolumeX,
  Maximize
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
  { id: "auto", label: "Shadow Auto", reqTmdb: false, reqImdb: false, auto: true },
  { id: "moviebox", label: "Ghost", reqTmdb: true, reqImdb: false, auto: false },
  { id: "holly", label: "Skull", reqTmdb: true, reqImdb: false, auto: false },
  { id: "air", label: "Wraith", reqTmdb: true, reqImdb: false, auto: false },
  { id: "net", label: "Demon", reqTmdb: true, reqImdb: false, auto: false },
  { id: "gemma", label: "Phantom", reqTmdb: false, reqImdb: true, auto: false }
];

const AUTO_NATIVE_SERVER_ORDER = ["moviebox", "holly", "air", "net", "gemma"];

const EXAMPLES = ["tt0111161", "tt0468569", "tt1375666", "tt0110912"];

const IMDbYellow = "#F5C518";

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
      source?.type || ""
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

export default function ImdbPlayerClient({ data }: { data: LandingPageData }) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const autoPlayFired = useRef(false);

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

  // Native Player States
  const [nativeData, setNativeData] = useState<any>(null);
  const [nativeLanguages, setNativeLanguages] = useState<string[]>([]);
  const [nativeLanguage, setNativeLanguage] = useState<string>("");
  const [nativeQualities, setNativeQualities] = useState<any[]>([]);
  const [nativeLoading, setNativeLoading] = useState(false);
  const [nativeError, setNativeError] = useState("");
  const [nativeSelectedSource, setNativeSelectedSource] = useState<any>(null);
  const [nativeSubtitles, setNativeSubtitles] = useState<NativeSubtitleTrack[]>([]);
  const [nativeSubtitleIndex, setNativeSubtitleIndex] = useState(-1);
  const [nativeSettingsOpen, setNativeSettingsOpen] = useState(false);
  const [nativeSettingsTab, setNativeSettingsTab] = useState<NativeSettingsTab>("quality");
  const [nativePlaying, setNativePlaying] = useState(false);
  const [nativeCurrent, setNativeCurrent] = useState(0);
  const [nativeDuration, setNativeDuration] = useState(0);
  const [nativeVolume, setNativeVolume] = useState(1);
  const [nativeMuted, setNativeMuted] = useState(false);
  const [nativeHlsLevels, setNativeHlsLevels] = useState<NativeHlsLevel[]>([]);
  const [nativeHlsLevel, setNativeHlsLevel] = useState(-1);
  const [nativeSubtitleRenderKey, setNativeSubtitleRenderKey] = useState(0);
  const [nativeCueText, setNativeCueText] = useState("");
  const [nativeAutoStatus, setNativeAutoStatus] = useState("");
  
  const nativePlayerRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleSearch = async (id = imdbId.trim()) => {
    if (!id) { setError("Please enter an IMDb ID."); triggerShake(); return false; }
    if (!/^tt\d{7,8}$/.test(id)) {
      setError("Invalid format. Use 'tt' followed by 7–8 digits, e.g. tt0111161");
      triggerShake(); return false;
    }
    setImdbId(id);
    setLoading(true); setError(""); setStreamData(null); setIsPlaying(false); setTmdbId(null);
    try {
      let resolvedTmdbId = null;

      // 1. Fetch TMDB ID from Wikidata
      try {
        const sparqlQuery = `SELECT ?tmdbId WHERE { ?movie wdt:P345 "${id}". ?movie wdt:P4947 ?tmdbId. } LIMIT 1`;
        const wdUrl = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparqlQuery)}`;
        const wdRes = await fetch(wdUrl, { headers: { 'Accept': 'application/sparql-results+json' } });
        const wdData = await wdRes.json();
        const bindings = wdData.results.bindings;
        if (bindings.length > 0 && bindings[0].tmdbId) {
          resolvedTmdbId = bindings[0].tmdbId.value;
          setTmdbId(resolvedTmdbId);
        }
      } catch (e) {
        console.warn("Failed to fetch TMDB ID", e);
      }

      // 2. Fetch OMDb data
      let omdbData: any = null;
      try {
        const omdbRes = await fetch(`/api/omdb?id=${id}`);
        if (omdbRes.ok) {
          const data = await omdbRes.json();
          if (data.Response !== "False") {
            omdbData = data;
          } else {
            console.warn("OMDb API returned False:", data.Error);
          }
        } else {
          console.warn("OMDb API failed with status:", omdbRes.status);
        }
      } catch (err) {
        console.warn("OMDb fetch exception:", err);
      }

      const streamJson: StreamResponse = {
        imdbId: id,
        url: "",
        type: "hls",
        provider: "Frontend",
        movie: {
          title: omdbData?.Title && omdbData.Title !== "N/A" ? omdbData.Title : `IMDb: ${id}`,
          year: omdbData?.Year && omdbData.Year !== "N/A" ? omdbData.Year : "",
          poster: omdbData?.Poster && omdbData.Poster !== "N/A" ? omdbData.Poster : null,
          rating: omdbData?.imdbRating && omdbData.imdbRating !== "N/A" ? omdbData.imdbRating : "",
          overview: omdbData?.Plot && omdbData.Plot !== "N/A" ? omdbData.Plot : "",
          genre: omdbData?.Genre && omdbData.Genre !== "N/A" ? omdbData.Genre : undefined,
          director: omdbData?.Director && omdbData.Director !== "N/A" ? omdbData.Director : undefined,
          writer: omdbData?.Writer && omdbData.Writer !== "N/A" ? omdbData.Writer : undefined,
          actors: omdbData?.Actors && omdbData.Actors !== "N/A" ? omdbData.Actors : undefined,
          runtime: omdbData?.Runtime && omdbData.Runtime !== "N/A" ? omdbData.Runtime : undefined,
          released: omdbData?.Released && omdbData.Released !== "N/A" ? omdbData.Released : undefined,
          language: omdbData?.Language && omdbData.Language !== "N/A" ? omdbData.Language : undefined
        },
        playerUrl: `https://gemma416okl.com/play/${id}`,
        playerSource: "Gemma"
      };

      setStreamData(streamJson);
      setSelectedServerId("auto");
      return true;
    } catch {
      setError("Failed to fetch movie details. Please try again.");
      triggerShake();
      return false;
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (initialId && !autoPlayFired.current) {
      autoPlayFired.current = true;
      setImdbId(initialId);
      handleSearch(initialId).then((success) => {
        if (success) {
          setIsPlaying(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  useEffect(() => {
    if (isPlaying && playerRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [isPlaying]);

  const baseExternalPlayerUrl = selectedPlayerUrl || (streamData ? streamData.playerUrl : "");
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
    let url = `/api/test-server/api/movie/${tmdbId || 0}?server=${serverId}`;
    if (serverId === "gemma" || isImdbRequired) {
      url += `&imdb=${encodeURIComponent(streamData?.imdbId || "")}`;
    }
    return url;
  };

  const fetchNativeServerData = async (server: NativeServerOption) => {
    const startedAt = performance.now();
    const res = await fetch(buildNativeServerUrl(server.id, server.reqImdb));
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error("Server returned HTML instead of JSON"); }
    if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
    const elapsed = performance.now() - startedAt;
    return { server, data, elapsed };
  };

  const applyNativeServerData = (serverId: string, data: any, statusMessage?: string) => {
    setNativeData(data);
    if (!data.sources || !data.sources.length) {
      const serverLabel = getNativeServerLabel(serverId);
      const transientPhantom = serverId === "gemma" && data.transient;
      setNativeAutoStatus("");
      setNativeError(
        transientPhantom
          ? "Phantom is still confirming this title. Try Phantom again, or use Shadow Auto while it checks the other servers."
          : `No playable sources found on ${serverLabel}. Try Shadow Auto or another server.`
      );
      return false;
    }

    const langs = [...new Set(data.sources.map((s: any) => s.language || "Unknown"))] as string[];
    const subtitles = normalizeSubtitleTracks(data.subtitles || data.captions || data.tracks || []);
    setNativeLanguages(langs);
    setNativeSubtitles(subtitles);
    setNativeSubtitleRenderKey((key) => key + 1);
    if (langs.length > 0) setNativeLanguage(langs[0]);
    setNativeAutoStatus(statusMessage ?? (serverId === "auto" ? "" : `Selected ${getNativeServerLabel(serverId)}`));
    return true;
  };

  const scoreNativeServerResult = ({ data, elapsed }: { data: any; elapsed: number }) => {
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

  const getNativeServerLabel = (serverId: string) => (
    NATIVE_SERVER_OPTIONS.find((server) => server.id === serverId)?.label || serverId
  );

  const loadAutoNativeServer = async () => {
    setSelectedServerId("auto");
    resetNativePlayerState();
    setNativeLoading(true);
    setNativeAutoStatus("Confirming the fastest sources across Ghost, Skull, Wraith, Demon, and Phantom...");

    try {
      const candidates = AUTO_NATIVE_SERVER_ORDER
        .map((id) => NATIVE_SERVER_OPTIONS.find((server) => server.id === id))
        .filter(Boolean) as NativeServerOption[];

      const usableCandidates = candidates.filter((server) => {
        if (server.reqTmdb && !tmdbId) return false;
        if (server.reqImdb && !streamData?.imdbId) return false;
        return true;
      });

      const results = await Promise.all(
        usableCandidates.map(async (server, order) => {
          try {
            const result = await fetchNativeServerData(server);
            const hasSources = Boolean(result.data.sources?.length);
            return {
              ...result,
              order,
              ok: hasSources,
              score: hasSources ? scoreNativeServerResult(result) - order * 0.01 : -Infinity,
              error: hasSources ? "" : "no sources"
            };
          } catch (err: any) {
            return { server, data: null, elapsed: Infinity, order, ok: false, score: -Infinity, error: err.message || "failed" };
          }
        })
      );

      const best = results
        .filter((result) => result.ok)
        .sort((a, b) => b.score - a.score)[0];

      if (!best) {
        const errors = results.map((result) => `${getNativeServerLabel(result.server.id)}: ${result.error}`).join(" | ");
        setNativeError(`Auto server failed: ${errors || "No providers available"}`);
        return;
      }

      const status = `Shadow Auto chose ${getNativeServerLabel(best.server.id)} in ${Math.round(best.elapsed)}ms`;
      setSelectedServerId(best.server.id);
      applyNativeServerData(best.server.id, best.data, status);
    } finally {
      setNativeLoading(false);
    }
  };

  const loadNativeServer = async (serverId: string, isTmdbRequired: boolean, isImdbRequired: boolean) => {
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
    setNativeAutoStatus(`Confirming ${getNativeServerLabel(serverId)} sources...`);
    
    try {
      const server = NATIVE_SERVER_OPTIONS.find((item) => item.id === serverId) || { id: serverId, label: serverId, reqTmdb: isTmdbRequired, reqImdb: isImdbRequired, auto: false };
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
  }, [isPlaying, streamData?.imdbId, tmdbId, selectedServerId, selectedPlayerUrl]);

  const normalizeSubtitleTracks = (tracks: any[]): NativeSubtitleTrack[] => {
    return tracks
      .map((track: any, index: number) => {
        const file = track?.file || track?.url || track?.src;
        if (!file) return null;
        const language = track.language || track.lang || track.langCode || track.srclang || "en";
        return {
          file: file.startsWith("//") ? `https:${file}` : file,
          language,
          label: track.label || track.name || language || `Subtitle ${index + 1}`
        };
      })
      .filter(Boolean) as NativeSubtitleTrack[];
  };

  useEffect(() => {
    if (nativeData && nativeLanguage && selectedPlayerUrl === "native") {
      const filtered = dedupeNativeSources(
        nativeData.sources.filter((source: any) => (source.language || "Unknown") === nativeLanguage)
      );
      setNativeQualities(filtered);
      if (filtered.length > 0) {
        playNativeSource(filtered[0]);
      }
    }
  }, [nativeData, nativeLanguage, selectedPlayerUrl]);

  useEffect(() => {
    applyNativeSubtitleTrack(nativeSubtitleIndex);
    const retry = window.setTimeout(() => applyNativeSubtitleTrack(nativeSubtitleIndex), 250);
    return () => window.clearTimeout(retry);
  }, [nativeSubtitleIndex, nativeSubtitles, nativeSubtitleRenderKey]);

  useEffect(() => {
    const player = nativePlayerRef.current;
    const track = nativeSubtitleIndex >= 0 ? player?.textTracks?.[nativeSubtitleIndex] : null;
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

  const playNativeSource = async (source: any) => {
    const player = nativePlayerRef.current;
    if (!player) return;
    setNativeSelectedSource(source);
    setNativeSettingsOpen(false);
    setNativeError("");
    setNativeHlsLevels([]);
    setNativeHlsLevel(-1);

    const headers = encodeURIComponent(JSON.stringify(source.headers || {}));
    const isHls = source.type === "hls" || source.url.includes(".m3u8") || source.url.includes("m3u8-proxy");
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
    player.pause(); player.removeAttribute("src"); player.load();
    setNativePlaying(false);
    setNativeCurrent(0);

    if (source.type === "hls" || playUrl.includes("/hls-proxy")) {
      const { default: Hls } = await import("hls.js");
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false, debug: false });
        hlsRef.current = hls;
        hls.loadSource(playUrl); hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const levels = dedupeHlsLevels((data?.levels || hls.levels || [])
            .map((level: any, index: number) => ({
              level: index,
              height: Number(level?.height) || 0,
              width: Number(level?.width) || 0,
              bitrate: Number(level?.bitrate) || undefined
            }))
            .filter((level: NativeHlsLevel) => level.height > 0)
            .sort((a: NativeHlsLevel, b: NativeHlsLevel) => (b.width || b.height) - (a.width || a.height)));
          setNativeHlsLevels(levels);
          setNativeHlsLevel(-1);
          hls.currentLevel = -1;
          player.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (!data?.fatal) return;
          const detail = data?.details || data?.type || "Unable to play this HLS source";
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
      } else { player.src = playUrl; player.load(); player.play().catch(() => {}); }
    } else {
      setNativeHlsLevels([]);
      player.src = playUrl; player.load(); player.play().catch(() => {});
    }
  };

  const nativeProgress = nativeDuration > 0 ? Math.min(100, Math.max(0, (nativeCurrent / nativeDuration) * 100)) : 0;

  const toggleNativePlay = () => {
    const player = nativePlayerRef.current;
    if (!player) return;
    if (player.paused) {
      player.play().then(() => setNativePlaying(true)).catch(() => {});
    } else {
      player.pause();
      setNativePlaying(false);
    }
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
      if (tagName === "input" || tagName === "textarea" || target?.isContentEditable) return;

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
          player.currentTime = Math.min(player.duration || Infinity, player.currentTime + 10);
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
  }, [isPlaying, selectedPlayerUrl, nativeMuted, nativeVolume, nativeDuration, nativePlaying]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[#F5C518] selection:text-black font-sans relative overflow-hidden transition-colors duration-300">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F5C518] rounded-[100%] blur-[120px] mix-blend-screen" />
      </div>

      <AnimatePresence mode="wait">
        {/* ═══════════════ SEARCH / RESULT STATE ═══════════════ */}
        {!isPlaying && (
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
              <h1 className="font-bold text-[56px] md:text-[72px] leading-[1.1] tracking-tight text-[var(--text-primary)] mb-6 transition-colors duration-300" style={{ fontFamily: "var(--font-sora)" }}>
                Watch from <span className="text-[#F5C518]">IMDb</span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto font-medium transition-colors duration-300" style={{ fontFamily: "var(--font-dm-sans)" }}>
                Drop the IMDb ID below to bypass ads and instantly stream in cinematic HD. The ultimate cinema experience, right in your browser.
              </p>
            </div>

            <motion.div animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}} className="w-full max-w-2xl relative z-20">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F5C518]/50 to-[#F5C518]/10 rounded-[16px] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative flex flex-col sm:flex-row gap-3 w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[16px] overflow-hidden p-2 shadow-2xl transition-colors duration-300">
                  <div className="relative flex items-center flex-1 ml-2">
                    <Search className="w-6 h-6 text-[var(--text-muted)] shrink-0" />
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none focus:ring-0 shadow-none px-4 py-4 md:py-5 font-mono text-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] w-full transition-colors duration-300"
                      placeholder="e.g. tt0111161"
                      value={imdbId}
                      onChange={(e) => { setImdbId(e.target.value); setError(''); if (!e.target.value) setStreamData(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={loading || !imdbId}
                    className="w-full sm:w-auto px-8 py-4 sm:py-0 sm:h-auto rounded-[12px] bg-[#F5C518] hover:bg-[#E3B514] text-black font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <span className="text-[var(--text-muted)] text-sm font-medium transition-colors duration-300">Try it out:</span>
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

            <AnimatePresence>
              {(streamData?.url || streamData?.playerUrl) && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mt-16 w-full max-w-3xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-[24px] overflow-hidden flex flex-col sm:flex-row relative group shadow-2xl transition-colors duration-300"
                >
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#F5C518]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {streamData.movie?.poster ? (
                    <div className="relative w-full sm:w-[240px] aspect-[2/3] sm:aspect-auto shrink-0 border-r border-[var(--border)] overflow-hidden transition-colors duration-300">
                      <Image 
                        src={streamData.movie.poster} 
                        alt={streamData.movie.title || "Poster"} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        sizes="(max-width: 640px) 100vw, 240px"
                      />
                    </div>
                  ) : (
                    <div className="w-full sm:w-[240px] aspect-[2/3] sm:aspect-auto flex items-center justify-center bg-[var(--bg-elevated)] border-r border-[var(--border)] transition-colors duration-300">
                      <Film className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col justify-center text-left relative z-10">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="px-3 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs font-bold font-mono border border-[var(--border)] shadow-inner transition-colors duration-300">
                          {streamData.imdbId}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Stream Ready
                        </span>
                      </div>
                      
                      <h2 className="font-bold text-[32px] md:text-[40px] text-[var(--text-primary)] mb-3 leading-tight font-serif transition-colors duration-300" style={{ fontFamily: "var(--font-sora)" }}>
                        {streamData.movie?.title ?? streamData.imdbId}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-5 text-sm text-[var(--text-muted)] font-medium mb-6 transition-colors duration-300">
                        {streamData.movie?.year && (
                          <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-[var(--text-muted)]" /> {streamData.movie.year}</span>
                        )}
                        {streamData.movie?.runtime && (
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--text-muted)]" /> {streamData.movie.runtime}</span>
                        )}
                        {streamData.movie?.genre && (
                          <span className="px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">{streamData.movie.genre.split(', ')[0]}</span>
                        )}
                        {streamData.movie?.rating && (
                          <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold text-lg"><Star className="w-5 h-5 fill-[#F5C518] text-[#F5C518]" /> {streamData.movie.rating} <span className="text-[var(--text-muted)] text-sm font-normal">/10</span></span>
                        )}
                      </div>

                      {streamData.movie?.overview && (
                        <p className="text-[13px] md:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-5 border-l-2 border-[#F5C518] pl-3">
                          {streamData.movie.overview}
                        </p>
                      )}

                      <div className="flex flex-col gap-1.5 mb-8 text-[13px] md:text-sm">
                        {streamData.movie?.director && (
                          <div className="flex items-start gap-2">
                             <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px] w-20 shrink-0 mt-0.5">Director</span>
                             <span className="text-[var(--text-primary)] font-medium">{streamData.movie.director}</span>
                          </div>
                        )}
                        {streamData.movie?.actors && (
                          <div className="flex items-start gap-2">
                             <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px] w-20 shrink-0 mt-0.5">Starring</span>
                             <span className="text-[var(--text-primary)] font-medium line-clamp-1">{streamData.movie.actors}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => { setSelectedServerId("auto"); setIsPlaying(true); }}
                      className="group/btn w-full sm:w-auto relative inline-flex items-center justify-center gap-3 bg-[#F5C518] text-black px-8 py-4 rounded-[12px] font-bold text-lg overflow-hidden transition-transform active:scale-95"
                    >
                      <div className="absolute inset-0 w-full h-full bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                      <Play className="w-5 h-5 fill-current relative z-10" /> 
                      <span className="relative z-10">Play Movie</span>
                      <ChevronRight className="w-5 h-5 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300 relative z-10" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        )}

        {/* ═══════════════ WATCH PAGE (PLAYING) ═══════════════ */}
        {isPlaying && streamData?.imdbId && (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen bg-[#141414] text-white transition-colors duration-300"
          >
            {/* Cinematic Backdrop */}
            <div className="absolute top-0 inset-x-0 h-[70vh] bg-gradient-to-b from-black via-[#141414] to-transparent opacity-90 pointer-events-none z-0 transition-colors duration-300" />
            
            {streamData.movie?.poster && (
               <div 
                 className="absolute top-0 inset-x-0 h-[60vh] opacity-20 blur-3xl pointer-events-none z-0"
                 style={{ backgroundImage: `url(${streamData.movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center 20%' }}
               />
            )}

            <div className="max-w-[1500px] mx-auto px-4 md:px-8 pt-[72px] pb-[80px] relative z-10">

              <Link
                href="#"
                onClick={(e) => { e.preventDefault(); setIsPlaying(false); }}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/55 hover:text-white transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Return to Search
              </Link>

              <div className="flex flex-col gap-10">
                {/* Main Player Section */}
                <div className="w-full">
                    
                  {/* Player Title & Rating & Server Selection */}
                  <div className="flex flex-col gap-5 mb-5">
                    <div>
                      <div className="mb-3 inline-flex items-center gap-2 rounded bg-[#E50914] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                        IMDb Stream
                      </div>
                      <h1 className="font-black text-[30px] md:text-[52px] text-white leading-tight transition-colors duration-300" style={{ fontFamily: "var(--font-sora)" }}>
                        {streamData.movie?.title ?? streamData.imdbId}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-medium text-white/65 transition-colors duration-300">
                        {streamData.movie?.year && <span>{streamData.movie.year}</span>}
                        {streamData.movie?.runtime && <span className="hidden sm:inline text-white/35">•</span>}
                        {streamData.movie?.runtime && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-white/45" />{streamData.movie.runtime}</span>}
                        {streamData.movie?.genre && <span className="hidden sm:inline text-white/35">•</span>}
                        {streamData.movie?.genre && <span>{streamData.movie.genre.split(', ')[0]}</span>}
                        {streamData.movie?.genre?.includes(', ') && <span className="px-2 py-0.5 rounded border border-white/15 text-xs text-white/65">{streamData.movie.genre.split(', ')[1]}</span>}
                        <span className="px-2 py-0.5 rounded bg-[#E50914] text-xs font-bold text-white">HD</span>
                        <span className="flex items-center gap-1.5 text-white"><Star className="w-4 h-4 fill-[#E50914] text-[#E50914]" /> <span className="text-lg font-bold">{streamData.movie?.rating || '?'}</span> <span className="text-white/45 font-normal">/10</span></span>
                      </div>
                    </div>
                    
                    {/* Server Selection */}
                    <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-black/35 p-2 backdrop-blur">
                      {NATIVE_SERVER_OPTIONS.map((server) => (
                        <button
                          key={server.id}
                          onClick={() => loadNativeServer(server.id, server.reqTmdb, server.reqImdb)}
                          className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all shadow-sm ${selectedServerId === server.id ? 'bg-[#E50914] text-white ring-2 ring-[#E50914]/40' : 'bg-white/5 text-white/65 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                        >
                          {server.label} {selectedServerId === server.id && '• Active'}
                        </button>
                      ))}

                      {/* Existing IFrame Servers */}
                      <div className="relative z-30">
                        <button
                          type="button"
                          onClick={() => setThirdPartyOpen((open) => !open)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all shadow-sm outline-none ${['server1', 'server2', 'server3'].includes(selectedServerId) ? 'bg-[#E50914] text-white ring-2 ring-[#E50914]/40' : 'bg-white/5 text-white/65 border border-white/10 hover:bg-white/10 hover:text-white'}`}
                          title="Third party server contain ads"
                        >
                          <span>{thirdPartyServerLabel}</span>
                          <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform ${thirdPartyOpen ? "rotate-180" : "rotate-0"}`} />
                        </button>

                        <AnimatePresence>
                          {thirdPartyOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.98 }}
                              transition={{ duration: 0.14 }}
                              className="absolute right-0 top-full mt-2 min-w-full overflow-hidden rounded-lg border border-white/10 bg-[#050505] py-1 shadow-2xl ring-1 ring-black/60"
                            >
                              {streamData.playerUrl && (
                                <button onClick={() => playThirdPartyServer("server1")} className="block w-full whitespace-nowrap px-4 py-2.5 text-left font-mono text-xs font-bold text-white/75 transition hover:bg-[#E50914] hover:text-white">
                                  Server 1
                                </button>
                              )}
                              {alternatePlayerUrl && (
                                <button onClick={() => playThirdPartyServer("server2")} className="block w-full whitespace-nowrap px-4 py-2.5 text-left font-mono text-xs font-bold text-white/75 transition hover:bg-[#E50914] hover:text-white">
                                  Server 2
                                </button>
                              )}
                              {tmdbId && (
                                <button onClick={() => playThirdPartyServer("server3")} className="block w-full whitespace-nowrap px-4 py-2.5 text-left font-mono text-xs font-bold text-white/75 transition hover:bg-[#E50914] hover:text-white">
                                  Server 3
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    {streamData.movie?.poster && (
                      <div
                        className="pointer-events-none absolute -inset-5 rounded-[28px] opacity-35 blur-2xl"
                        style={{
                          backgroundImage: `url(${streamData.movie.poster})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }}
                      />
                    )}
                    <div className="pointer-events-none absolute -inset-3 rounded-[24px] bg-[#E50914]/10 blur-xl" />
                    <div
                      ref={playerRef}
                      className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.72)] group/player transition-colors duration-300"
                    >
                    {selectedPlayerUrl === "native" ? (
                      <div className="w-full h-full relative">
                        {nativeLoading ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                              <motion.div
                                animate={{ opacity: [0.65, 1, 0.65], scale: [0.98, 1, 0.98] }}
                                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                                className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-7 shadow-2xl backdrop-blur"
                              >
                                <span className="w-10 h-10 border-4 border-[#E50914]/25 border-t-[#E50914] rounded-full animate-spin" />
                                <p className="mt-4 max-w-sm text-center text-[#E50914] font-mono text-sm font-bold">
                                  {nativeAutoStatus || "Confirming playable sources..."}
                                </p>
                                <div className="mt-3 flex gap-1.5">
                                  {[0, 1, 2].map((dot) => (
                                    <motion.span
                                      key={dot}
                                      animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                                      transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                                      className="h-1.5 w-1.5 rounded-full bg-white/70"
                                    />
                                  ))}
                                </div>
                              </motion.div>
                           </div>
                        ) : nativeError ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black">
                              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                              <p className="max-w-md text-red-500 font-bold">{nativeError}</p>
                              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                <button
                                  onClick={() => loadNativeServer(selectedServerId, selectedServerId !== "gemma", selectedServerId === "gemma")}
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
                               onLoadedMetadata={(event) => {
                                 const video = event.currentTarget;
                                 setNativeDuration(video.duration || 0);
                                 setNativeSubtitleIndex((idx) => idx);
                               }}
                               onDurationChange={(event) => setNativeDuration(event.currentTarget.duration || 0)}
                              onTimeUpdate={(event) => {
                                setNativeCurrent(event.currentTarget.currentTime || 0);
                                if (nativeSubtitleIndex >= 0) updateNativeCueText(nativeSubtitleIndex);
                              }}
                               onPlay={() => setNativePlaying(true)}
                               onPause={() => setNativePlaying(false)}
                             >
                               {nativeSubtitles.map((track, index) => (
                                 <track
                                   key={`${nativeSubtitleRenderKey}-${track.file}-${index}`}
                                   kind="subtitles"
                                   src={`/api/net/subtitle?url=${encodeURIComponent(track.file)}`}
                                   srcLang={track.language}
                                   label={track.label}
                                   onLoad={() => applyNativeSubtitleTrack(nativeSubtitleIndex)}
                                 />
                               ))}
                             </video>

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

                             {!nativePlaying && (
                               <button
                                 onClick={toggleNativePlay}
                                 className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
                                 title="Play"
                               >
                                 <Play className="ml-1 h-10 w-10 fill-white" />
                               </button>
                             )}

                             <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-4 pt-20 md:px-6" onClick={(e) => e.stopPropagation()}>
                               <div className="mb-3 flex items-center gap-3">
                                 <span className="w-12 text-xs font-mono text-white">{fmtTime(nativeCurrent)}</span>
                                 <input
                                   type="range"
                                   min={0}
                                   max={100}
                                   value={nativeProgress}
                                   onChange={(event) => seekNative(Number(event.target.value))}
                                   className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-[#E50914]"
                                   style={{ background: `linear-gradient(to right, #E50914 ${nativeProgress}%, rgba(255,255,255,0.25) ${nativeProgress}%)` }}
                                 />
                                 <span className="w-12 text-right text-xs font-mono text-white/70">{fmtTime(nativeDuration)}</span>
                               </div>

                               <div className="flex items-center justify-between gap-3">
                                 <div className="flex items-center gap-3">
                                   <button onClick={toggleNativePlay} className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110" title={nativePlaying ? "Pause" : "Play"}>
                                     {nativePlaying ? <Pause className="h-7 w-7 fill-white" /> : <Play className="ml-0.5 h-7 w-7 fill-white" />}
                                   </button>
                                   <button onClick={toggleNativeMute} className="flex h-10 w-10 items-center justify-center text-white transition hover:scale-110" title="Volume">
                                     {nativeMuted || nativeVolume === 0 ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                                   </button>
                                   <input
                                     type="range"
                                     min={0}
                                     max={1}
                                     step={0.01}
                                     value={nativeMuted ? 0 : nativeVolume}
                                     onChange={(event) => setNativeVolumeLevel(Number(event.target.value))}
                                     className="hidden h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/30 accent-white sm:block"
                                   />
                                 </div>

                                 <div className="relative flex items-center gap-2">
                                   <button
                                     onClick={() => setNativeSettingsOpen((open) => !open)}
                                     className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10"
                                     title="Quality, language, and subtitles"
                                   >
                                     <Settings className={`h-5 w-5 transition-transform duration-200 ${nativeSettingsOpen ? "rotate-90" : "rotate-0"}`} />
                                   </button>
                                   <button onClick={fullscreenNativePlayer} className="flex h-10 w-10 items-center justify-center text-white transition hover:bg-white/10" title="Fullscreen">
                                     <Maximize className="h-5 w-5" />
                                   </button>

                                   <AnimatePresence>
                                     {nativeSettingsOpen && (
                                       <motion.div
                                         initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                         animate={{ opacity: 1, y: 0, scale: 1 }}
                                         exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                         transition={{ duration: 0.15 }}
                                         className="absolute bottom-12 right-0 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-xl border border-white/10 bg-black/95 text-white shadow-2xl backdrop-blur-md"
                                       >
                                         <div className="flex border-b border-white/10">
                                           {(["quality", "language", "subtitles"] as NativeSettingsTab[]).map((tab) => (
                                             <button
                                               key={tab}
                                               onClick={() => setNativeSettingsTab(tab)}
                                               className={`flex-1 py-2.5 text-[11px] font-bold capitalize transition-colors ${nativeSettingsTab === tab ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}
                                             >
                                               {tab === "language" ? "Audio" : tab}
                                             </button>
                                           ))}
                                         </div>

                                         <div className="max-h-56 overflow-y-auto py-1">
                                           {nativeSettingsTab === "quality" && (
                                             nativeHlsLevels.length > 0 ? (
                                               <>
                                                 <button
                                                   onClick={() => changeNativeHlsQuality(-1)}
                                                   className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${nativeHlsLevel === -1 ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                 >
                                                   {nativeHlsLevel === -1 && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                   <span className={nativeHlsLevel === -1 ? "" : "ml-5"}>Auto Quality</span>
                                                 </button>
                                                 {nativeHlsLevels.map((level) => {
                                                   const selected = nativeHlsLevel === level.level;
                                                   return (
                                                     <button
                                                       key={`hls-${level.level}-${level.height}`}
                                                       onClick={() => changeNativeHlsQuality(level.level)}
                                                       className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                     >
                                                       {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                      <span className={selected ? "" : "ml-5"}>{nativeHlsQualityLabel(level)}</span>
                                                     </button>
                                                   );
                                                 })}
                                               </>
                                             ) : nativeQualities.length > 0 ? nativeQualities.map((source, idx) => {
                                               const selected = nativeSelectedSource === source;
                                               return (
                                                 <button
                                                   key={`${source.provider}-${nativeSourceQuality(source)}-${idx}`}
                                                   onClick={() => playNativeSource(source)}
                                                   className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                 >
                                                   {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                   <span className={selected ? "" : "ml-5"}>{nativeSourceLabel(source)}</span>
                                                 </button>
                                               );
                                             }) : (
                                               <p className="px-4 py-3 text-xs text-white/40">No quality variants available</p>
                                             )
                                           )}

                                           {nativeSettingsTab === "language" && (nativeLanguages.length > 0 ? nativeLanguages.map((lang) => {
                                             const selected = nativeLanguage === lang;
                                             return (
                                               <button
                                                 key={lang}
                                                 onClick={() => {
                                                   setNativeLanguage(lang);
                                                   setNativeSettingsOpen(false);
                                                 }}
                                                 className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                               >
                                                 {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                 <span className={selected ? "" : "ml-5"}>{lang}</span>
                                               </button>
                                             );
                                           }) : (
                                             <p className="px-4 py-3 text-xs text-white/40">No alternate audio languages</p>
                                           ))}

                                           {nativeSettingsTab === "subtitles" && (
                                             <>
                                               <button
                                                 onClick={() => {
                                                   selectNativeSubtitle(-1);
                                                 }}
                                                 className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${nativeSubtitleIndex === -1 ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                               >
                                                 {nativeSubtitleIndex === -1 && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                 <span className={nativeSubtitleIndex === -1 ? "" : "ml-5"}>Off</span>
                                               </button>
                                               {nativeSubtitles.length > 0 ? nativeSubtitles.map((track, index) => {
                                                 const selected = nativeSubtitleIndex === index;
                                                 return (
                                                   <button
                                                     key={`${track.label}-${index}`}
                                                     onClick={() => {
                                                       selectNativeSubtitle(index);
                                                     }}
                                                     className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors ${selected ? "bg-white/5 font-bold text-[#E50914]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}
                                                   >
                                                     {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                                     <span className={selected ? "" : "ml-5"}>{track.label}</span>
                                                   </button>
                                                 );
                                               }) : (
                                                 <p className="px-4 py-3 text-xs text-white/40">No subtitles available</p>
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
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    )}
                    </div>
                  </div>
                </div>

                {/* Below Player Info */}
                <div className="w-full">
                   <div className="bg-[#181818] border border-white/10 p-6 md:p-8 transition-colors duration-300">
                     <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2">
                       <Info className="w-5 h-5 text-[#E50914]" /> About Title
                     </h3>
                     
                     <div className="flex flex-col md:flex-row gap-8">
                        {streamData.movie?.poster && (
                           <div className="hidden md:block w-[200px] shrink-0 aspect-[2/3] relative rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-xl transition-colors duration-300">
                              <Image src={streamData.movie.poster} alt="Poster" fill className="object-cover" />
                           </div>
                        )}

                        <div className="flex-1 space-y-6">
                           <div>
                             <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 transition-colors duration-300">Plot Summary</div>
                             <p className="text-[14px] leading-relaxed text-white/70 font-medium transition-colors duration-300">
                               {streamData.movie?.overview || 'No plot description available for this title.'}
                             </p>
                           </div>

                           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2 transition-colors duration-300">
                             {streamData.movie?.director && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Director</h4>
                                 <p className="text-[13px] text-white font-medium break-words">{streamData.movie.director}</p>
                               </div>
                             )}
                             {streamData.movie?.writer && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Writer</h4>
                                 <p className="text-[13px] text-white font-medium break-words">{streamData.movie.writer}</p>
                               </div>
                             )}
                             {streamData.movie?.actors && (
                               <div className="col-span-2 md:col-span-1">
                                 <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Actors</h4>
                                 <p className="text-[13px] text-white font-medium leading-tight">{streamData.movie.actors}</p>
                               </div>
                             )}
                             {streamData.movie?.released && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Released</h4>
                                 <p className="text-[13px] text-white font-medium">{streamData.movie.released}</p>
                               </div>
                             )}
                             {streamData.movie?.language && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Language</h4>
                                 <p className="text-[13px] text-white font-medium">{streamData.movie.language}</p>
                               </div>
                             )}
                             {streamData.movie?.runtime && (
                               <div>
                                 <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Runtime</h4>
                                 <p className="text-[13px] text-white font-medium">{streamData.movie.runtime}</p>
                               </div>
                             )}
                           </div>

                           <div className="pt-4 border-t border-white/10 transition-colors duration-300">
                             <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 transition-colors duration-300">Registry IDs</div>
                             <div className="flex gap-3">
                               <div className="inline-flex px-3 py-1.5 bg-[#E50914]/10 border border-[#E50914]/30 rounded-md font-mono text-xs text-[#E50914] font-bold">
                                  IMDb: {streamData.imdbId}
                               </div>
                               {tmdbId && (
                                 <div className="inline-flex px-3 py-1.5 bg-[#01b4e4]/10 border border-[#01b4e4]/30 rounded-md font-mono text-xs text-[#01b4e4] font-bold shadow-[0_0_10px_rgba(1,180,228,0.1)]">
                                    TMDB: {tmdbId}
                                 </div>
                               )}
                             </div>
                           </div>
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




