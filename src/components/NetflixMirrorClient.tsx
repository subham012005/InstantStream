"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ChevronLeft,
  Settings,
  Subtitles,
  Loader2,
  AlertCircle,
  Search,
  Film,
  Tv,
  Clock,
  ArrowLeft,
  Check,
  RefreshCw,
  Layers,
} from "lucide-react";
import NetflixHomepage from "./NetflixHomepage";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Episode {
  id: string;
  episode: number;
  title: string;
  season: string;
  time: string;
  description: string;
}

interface Season {
  season: number;
  seasonId: string;
  episodeCount: number;
  episodes: Episode[];
}

interface MetaData {
  title: string;
  seriesId: string;
  type: string;
  isSeries: boolean;
  seasons: Season[];
  defaultSeason: number | null;
}

/* ─────────────────────────────────────────────
   Netflix-style Volume Slider
───────────────────────────────────────────── */
function VolumeSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-20 h-1 accent-white cursor-pointer appearance-none bg-white/30 rounded-full"
      style={{
        background: `linear-gradient(to right, white ${value * 100}%, rgba(255,255,255,0.3) ${value * 100}%)`,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Progress Bar
───────────────────────────────────────────── */
function ProgressBar({
  current,
  duration,
  onSeek,
  buffered,
}: {
  current: number;
  duration: number;
  onSeek: (t: number) => void;
  buffered: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const pct = duration > 0 ? (current / duration) * 100 : 0;
  const bufPct = duration > 0 ? (buffered / duration) * 100 : 0;

  function handleClick(e: React.MouseEvent) {
    if (!barRef.current || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  }

  return (
    <div
      ref={barRef}
      onClick={handleClick}
      className="group relative w-full h-1 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all duration-150"
    >
      {/* Buffered */}
      <div
        className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
        style={{ width: `${bufPct}%` }}
      />
      {/* Progress */}
      <div
        className="absolute inset-y-0 left-0 bg-[#E50914] rounded-full transition-none"
        style={{ width: `${pct}%` }}
      />
      {/* Scrubber knob */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#E50914] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `calc(${pct}% - 6px)` }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Format time helper
───────────────────────────────────────────── */
function fmtTime(s: number) {
  if (!isFinite(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/* ─────────────────────────────────────────────
   HLS Video Player
───────────────────────────────────────────── */
function NetflixPlayer({
  masterUrl,
  externalTracks = [],
  title,
  onBack,
}: {
  masterUrl: string;
  externalTracks?: any[];
  title: string;
  onBack: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qualities, setQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [audioTracks, setAudioTracks] = useState<string[]>([]);
  const [currentAudio, setCurrentAudio] = useState(0);
  const [subtitleTracks, setSubtitleTracks] = useState<string[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"quality" | "audio" | "subtitles">("quality");

  /* ── Show controls, then hide after 3s ── */
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setControlsVisible(false);
    }, 3000);
  }, [playing]);

  /* ── HLS setup ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !masterUrl) return;

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    setLoading(true);
    setError("");
    setPlaying(false);
    setQualities([]);
    setAudioTracks([]);

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hlsRef.current = hls;
      hls.loadSource(masterUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        // Qualities
        const qs = ["Auto", ...hls.levels.map((l, i) => (l.height ? `${l.height}p` : `Level ${i + 1}`))];
        setQualities(qs);
        setCurrentQuality(-1);
        video.play().then(() => setPlaying(true)).catch(() => {});
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
        if (hls.audioTracks.length > 0) {
          setAudioTracks(hls.audioTracks.map((t: any) => t.name || t.lang || `Track ${t.id}`));
          setCurrentAudio(hls.audioTrack);
        }
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
        if (hls.subtitleTracks.length > 0) {
          setSubtitleTracks(hls.subtitleTracks.map((t: any) => t.name || t.lang || `Subtitle ${t.id}`));
          setCurrentSubtitle(hls.subtitleTrack);
        }
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("Stream error: " + data.details);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = masterUrl;
      video.addEventListener("loadedmetadata", () => { setLoading(false); video.play().then(() => setPlaying(true)).catch(() => {}); });
    } else {
      setError("HLS is not supported in this browser.");
    }

    return () => { hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [masterUrl]);

  /* ── Video events ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      setCurrent(video.currentTime);
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onDuration = () => setDuration(video.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDuration);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDuration);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  /* ── Fullscreen listener ── */
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      const video = videoRef.current;
      if (!video) return;
      if (e.code === "Space") { e.preventDefault(); video.paused ? video.play() : video.pause(); }
      if (e.code === "ArrowRight") { e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 10); }
      if (e.code === "ArrowLeft") { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); }
      if (e.code === "KeyM") { video.muted = !video.muted; setMuted(video.muted); }
      if (e.code === "KeyF") toggleFullscreen();
      showControls();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showControls]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
    setMuted(v === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleSeek = (t: number) => {
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const skip = (sec: number) => {
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, Math.min(duration, current + sec));
    showControls();
  };

  const changeQuality = (idx: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = idx;
    setCurrentQuality(idx);
    setShowSettings(false);
  };

  const changeAudio = (idx: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.audioTrack = idx;
    setCurrentAudio(idx);
    setShowSettings(false);
  };

  const changeSubtitle = (idx: number) => {
    setCurrentSubtitle(idx);
    setShowSettings(false);

    if (hlsRef.current) {
      if (idx >= 0 && idx < subtitleTracks.length) {
        hlsRef.current.subtitleTrack = idx;
      } else {
        hlsRef.current.subtitleTrack = -1;
      }
    }

    if (videoRef.current && videoRef.current.textTracks) {
      const vTracks = videoRef.current.textTracks;
      for (let i = 0; i < vTracks.length; i++) {
        vTracks[i].mode = "hidden";
      }
      if (idx >= subtitleTracks.length) {
        const trkIdx = idx - subtitleTracks.length;
        if (vTracks[trkIdx]) vTracks[trkIdx].mode = "showing";
      }
    }
  };

  const extCaptions = externalTracks || [];
  const totalSubtitles = subtitleTracks.length + extCaptions.length;

  return (
    <div
      ref={containerRef}
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      onClick={() => { if (!showSettings) togglePlay(); }}
      className="relative w-full aspect-video bg-black select-none overflow-hidden"
      style={{ cursor: controlsVisible ? "default" : "none" }}
    >
      {/* Video element */}
      <video ref={videoRef} className="w-full h-full object-contain" playsInline crossOrigin="anonymous">
        {extCaptions.map((t, i) => {
          const realUrl = t.file.startsWith("//") ? `https:${t.file}` : t.file;
          const proxyUrl = `/api/net/subtitle?url=${encodeURIComponent(realUrl)}`;
          return (
            <track
              key={i}
              kind="subtitles"
              src={proxyUrl}
              srcLang={t.language}
              label={t.label || t.language}
            />
          );
        })}
      </video>

      {/* Loading spinner */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
          >
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 gap-4 text-white">
          <AlertCircle className="w-12 h-12 text-[#E50914]" />
          <p className="text-sm text-white/70 max-w-xs text-center">{error}</p>
        </div>
      )}

      {/* ── Controls overlay ── */}
      <AnimatePresence>
        {controlsVisible && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div
              className="px-6 pt-5 pb-20"
              style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)" }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onBack(); }}
                className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <h2 className="text-white font-bold text-xl mt-2 drop-shadow-lg">{title}</h2>
            </div>

            {/* Center play/pause area — big click zone */}
            <div className="flex-1 flex items-center justify-center gap-16" onClick={togglePlay}>
              <button
                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                className="text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1"
              >
                <SkipBack className="w-8 h-8" />
                <span className="text-[10px] font-bold text-white/60">10s</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur transition-all"
              >
                {playing
                  ? <Pause className="w-8 h-8 text-white fill-white" />
                  : <Play className="w-8 h-8 text-white fill-white ml-1" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); skip(10); }}
                className="text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1"
              >
                <SkipForward className="w-8 h-8" />
                <span className="text-[10px] font-bold text-white/60">10s</span>
              </button>
            </div>

            {/* Bottom controls */}
            <div
              className="px-6 pb-5 pt-20"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
            >
              {/* Progress */}
              <div className="mb-3">
                <ProgressBar current={current} duration={duration} onSeek={handleSeek} buffered={buffered} />
                <div className="flex justify-between text-xs text-white/60 font-mono mt-1.5">
                  <span>{fmtTime(current)}</span>
                  <span>{fmtTime(duration)}</span>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                    {playing ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                  </button>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={toggleMute} className="text-white hover:scale-110 transition-transform">
                      {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <VolumeSlider value={muted ? 0 : volume} onChange={handleVolumeChange} />
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3 relative">
                  {/* Settings */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowSettings((v) => !v)}
                      className="text-white hover:scale-110 transition-transform"
                      title="Settings"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-10 right-0 w-56 bg-black/90 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md"
                        >
                          {/* Tabs */}
                          <div className="flex border-b border-white/10">
                            {(["quality", "audio", "subtitles"] as const).map((tab) => (
                              <button
                                key={tab}
                                onClick={() => setSettingsTab(tab)}
                                className={`flex-1 py-2.5 text-xs font-bold capitalize transition-colors ${settingsTab === tab ? "text-white bg-white/10" : "text-white/50 hover:text-white"}`}
                              >
                                {tab === "quality" ? "Quality" : tab === "audio" ? "Audio" : "Subtitles"}
                              </button>
                            ))}
                          </div>

                          <div className="max-h-48 overflow-y-auto">
                            {settingsTab === "quality" && qualities.map((q, i) => {
                              const qi = i === 0 ? -1 : i - 1;
                              return (
                                <button
                                  key={q}
                                  onClick={() => changeQuality(qi)}
                                  className={`w-full px-4 py-2.5 text-left text-xs flex items-center gap-2 transition-colors ${currentQuality === qi ? "text-[#E50914] bg-white/5 font-bold" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                                >
                                  {currentQuality === qi && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  <span className={currentQuality !== qi ? "ml-5" : ""}>{q}</span>
                                </button>
                              );
                            })}
                            {settingsTab === "audio" && (audioTracks.length > 0 ? audioTracks.map((t, i) => (
                              <button
                                key={`audio-${i}`}
                                onClick={() => changeAudio(i)}
                                className={`w-full px-4 py-2.5 text-left text-xs flex items-center gap-2 transition-colors ${currentAudio === i ? "text-[#E50914] bg-white/5 font-bold" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                              >
                                {currentAudio === i && <Check className="w-3.5 h-3.5 shrink-0" />}
                                <span className={currentAudio !== i ? "ml-5" : ""}>{t}</span>
                              </button>
                            )) : (
                              <p className="px-4 py-3 text-xs text-white/40">No audio tracks</p>
                            ))}
                            {settingsTab === "subtitles" && (totalSubtitles > 0 ? (
                              <>
                                <button
                                  onClick={() => changeSubtitle(-1)}
                                  className={`w-full px-4 py-2.5 text-left text-xs flex items-center gap-2 transition-colors ${currentSubtitle === -1 ? "text-[#E50914] bg-white/5 font-bold" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                                >
                                  {currentSubtitle === -1 && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  <span className={currentSubtitle !== -1 ? "ml-5" : ""}>Off</span>
                                </button>
                                {subtitleTracks.map((t, i) => (
                                  <button
                                    key={`hls-sub-${i}`}
                                    onClick={() => changeSubtitle(i)}
                                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center gap-2 transition-colors ${currentSubtitle === i ? "text-[#E50914] bg-white/5 font-bold" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                                  >
                                    {currentSubtitle === i && <Check className="w-3.5 h-3.5 shrink-0" />}
                                    <span className={currentSubtitle !== i ? "ml-5" : ""}>{t} (HLS)</span>
                                  </button>
                                ))}
                                {extCaptions.map((t, i) => {
                                  const idx = subtitleTracks.length + i;
                                  return (
                                    <button
                                      key={`ext-sub-${i}`}
                                      onClick={() => changeSubtitle(idx)}
                                      className={`w-full px-4 py-2.5 text-left text-xs flex items-center gap-2 transition-colors ${currentSubtitle === idx ? "text-[#E50914] bg-white/5 font-bold" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                                    >
                                      {currentSubtitle === idx && <Check className="w-3.5 h-3.5 shrink-0" />}
                                      <span className={currentSubtitle !== idx ? "ml-5" : ""}>{t.label || t.language}</span>
                                    </button>
                                  );
                                })}
                              </>
                            ) : (
                              <p className="px-4 py-3 text-xs text-white/40">No subtitles available</p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:scale-110 transition-transform"
                    title="Fullscreen (F)"
                  >
                    {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Netflix Mirror Page
───────────────────────────────────────────── */
export default function NetflixMirrorClient() {
  const [inputId, setInputId] = useState("");
  const [stage, setStage] = useState<"search" | "meta" | "player">("search");
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState("");
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [masterUrl, setMasterUrl] = useState("");
  const [externalTracks, setExternalTracks] = useState<any[]>([]);
  const [nowPlayingTitle, setNowPlayingTitle] = useState("");
  const [shake, setShake] = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  /* ── Load metadata ── */
  const loadMeta = async (id = inputId.trim()) => {
    if (!id) { setMetaError("Enter a Net player ID."); triggerShake(); return; }
    setMetaLoading(true);
    setMetaError("");
    setMeta(null);
    setSelectedSeason(null);
    setSelectedEpisode(null);
    setStreamError("");

    try {
      const res = await fetch(`/api/net/meta/${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMeta(data);
      setStage("meta");

      if (data.isSeries && data.seasons.length > 0) {
        const defaultIdx = data.defaultSeason
          ? data.seasons.findIndex((s: Season) => s.season === data.defaultSeason)
          : 0;
        const season = data.seasons[Math.max(0, defaultIdx)];
        setSelectedSeason(season);
        if (!season.episodes?.length) await loadEpisodes(data.seriesId, season);
      }
    } catch (e: any) {
      setMetaError(e.message || "Failed to load. Check the ID.");
      triggerShake();
    } finally {
      setMetaLoading(false);
    }
  };

  /* ── Load episodes for a season ── */
  const loadEpisodes = async (seriesId: string, season: Season) => {
    if (season.episodes?.length) return season;
    setEpisodesLoading(true);
    try {
      const res = await fetch(`/api/net/season/${seriesId}/${season.seasonId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const updated = { ...season, episodes: data.episodes || [] };
      setMeta((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          seasons: prev.seasons.map((s) => s.seasonId === season.seasonId ? updated : s),
        };
      });
      setSelectedSeason(updated);
      return updated;
    } catch (e: any) {
      setStreamError(e.message);
      return season;
    } finally {
      setEpisodesLoading(false);
    }
  };

  /* ── Select season tab ── */
  const onSelectSeason = async (season: Season) => {
    setSelectedSeason(season);
    setSelectedEpisode(null);
    if (!season.episodes?.length && meta) {
      await loadEpisodes(meta.seriesId, season);
    }
  };

  /* ── Play video (movie or episode) ── */
  const playVideo = async (videoId: string, title: string) => {
    setStreamLoading(true);
    setStreamError("");
    setNowPlayingTitle(title);
    try {
      const res = await fetch(`/api/net/play/${videoId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMasterUrl(data.masterUrl);
      setExternalTracks(data.subtitles || []);
      setStage("player");
    } catch (e: any) {
      setStreamError(e.message || "Could not fetch stream.");
    } finally {
      setStreamLoading(false);
    }
  };

  const exampleIds = ["82698051", "80126029", "80189123", "70136120"];

  /* ═══════════════════════════════════════════
     SEARCH STAGE
  ═══════════════════════════════════════════ */
  if (stage === "search") {
    return (
      <NetflixHomepage
        onSelectMovie={(id) => {
          setInputId(id);
          loadMeta(id);
        }}
        metaLoading={metaLoading}
        metaError={metaError}
      />
    );
  }

  /* ═══════════════════════════════════════════
     META / BROWSE STAGE
  ═══════════════════════════════════════════ */
  if (stage === "meta" && meta) {
    const episodes = selectedSeason?.episodes || [];

    return (
      <div className="min-h-screen bg-[#141414] text-white">
        {/* Hero banner */}
        <div className="relative h-[55vh] flex items-end overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
          {/* Red shimmer */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/20 via-transparent to-black/60" />
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#141414] to-transparent" />

          {/* Big icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
            {meta.isSeries ? <Tv className="w-64 h-64 text-[#E50914]" /> : <Film className="w-64 h-64 text-[#E50914]" />}
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 pb-8 w-full">
            <button
              onClick={() => { setStage("search"); setMeta(null); }}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to search
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-[#E50914] text-white rounded">
                {meta.isSeries ? "Series" : "Movie"}
              </span>
              <span className="text-white/40 text-xs font-mono">{meta.seriesId}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg mb-4" style={{ fontFamily: "var(--font-sora)" }}>
              {meta.title}
            </h1>

            <div className="flex items-center gap-4 flex-wrap">
              {!meta.isSeries && (
                <button
                  onClick={() => playVideo(meta.seriesId, meta.title)}
                  disabled={streamLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-white/90 text-black font-bold rounded-lg text-sm transition-all disabled:opacity-60"
                >
                  {streamLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
                  {streamLoading ? "Loading stream…" : "Play"}
                </button>
              )}
              {meta.isSeries && selectedSeason?.episodes?.[0] && (
                <button
                  onClick={() => {
                    const ep = selectedSeason.episodes[0];
                    playVideo(ep.id, `${meta.title} · S${selectedSeason.season} E${ep.episode} – ${ep.title}`);
                  }}
                  disabled={streamLoading}
                  className="flex items-center gap-2 px-8 py-3 bg-white hover:bg-white/90 text-black font-bold rounded-lg text-sm transition-all disabled:opacity-60"
                >
                  {streamLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
                  {streamLoading ? "Loading…" : "Play S1 E1"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {streamError && (
          <div className="max-w-6xl mx-auto px-6 mt-4">
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {streamError}
            </div>
          </div>
        )}

        {/* Series UI */}
        {meta.isSeries && meta.seasons.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 pb-16 mt-2">
            {/* Season tabs */}
            <div className="flex gap-2 flex-wrap mb-6">
              {meta.seasons.map((s) => (
                <button
                  key={s.seasonId}
                  onClick={() => onSelectSeason(s)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${selectedSeason?.seasonId === s.seasonId ? "bg-white text-black" : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"}`}
                >
                  Season {s.season}
                </button>
              ))}
            </div>

            {/* Episodes grid */}
            {episodesLoading ? (
              <div className="flex items-center gap-3 text-white/50 py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading episodes…
              </div>
            ) : episodes.length === 0 ? (
              <p className="text-white/30 text-sm py-8">No episodes found for this season.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {episodes.map((ep) => (
                  <motion.div
                    key={ep.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative bg-[#1f1f1f] hover:bg-[#2a2a2a] border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${selectedEpisode?.id === ep.id ? "border-[#E50914]/60 ring-1 ring-[#E50914]/30" : "border-white/5 hover:border-white/15"}`}
                    onClick={() => setSelectedEpisode(ep)}
                  >
                    {/* Episode placeholder thumbnail */}
                    <div className="h-32 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-white/20 font-black text-4xl font-mono">E{ep.episode}</span>
                      {/* Play button on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/40 text-xs font-mono">Episode {ep.episode}</span>
                        {ep.time && <span className="text-white/30 text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{ep.time}</span>}
                      </div>
                      <h3 className="text-white text-sm font-bold line-clamp-1 mb-1.5">{ep.title}</h3>
                      {ep.description && <p className="text-white/40 text-xs line-clamp-2 leading-relaxed">{ep.description}</p>}

                      {selectedEpisode?.id === ep.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playVideo(ep.id, `${meta.title} · S${selectedSeason?.season} E${ep.episode} – ${ep.title}`);
                          }}
                          disabled={streamLoading}
                          className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-[#E50914] hover:bg-[#f40612] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-60"
                        >
                          {streamLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                          {streamLoading ? "Loading…" : "Play Episode"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Movie — no episodes, just play */}
        {!meta.isSeries && (
          <div className="max-w-6xl mx-auto px-6 pb-16 mt-6">
            <div className="bg-[#1f1f1f] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Movie ID</div>
                <div className="text-white font-mono text-sm">{meta.seriesId}</div>
              </div>
              <button
                onClick={() => playVideo(meta.seriesId, meta.title)}
                disabled={streamLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#E50914] hover:bg-[#f40612] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-60"
              >
                {streamLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                {streamLoading ? "Fetching stream…" : "Stream Now"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     PLAYER STAGE
  ═══════════════════════════════════════════ */
  if (stage === "player" && masterUrl) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col">
        {/* Player */}
        <div className="w-full bg-black shadow-2xl">
          <NetflixPlayer
            masterUrl={masterUrl}
            externalTracks={externalTracks}
            title={nowPlayingTitle || meta?.title || ""}
            onBack={() => setStage(meta ? "meta" : "search")}
          />
        </div>

        {/* Below player info */}
        <div className="max-w-5xl mx-auto w-full px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-white font-bold text-2xl mb-1" style={{ fontFamily: "var(--font-sora)" }}>
                {nowPlayingTitle || meta?.title}
              </h2>
              <p className="text-white/40 text-sm font-mono">{meta?.seriesId}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStage(meta ? "meta" : "search")}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => { setStage("search"); setMeta(null); setMasterUrl(""); }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Search className="w-4 h-4" />
                New Search
              </button>
            </div>
          </div>

          {/* Info boxes */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Layers className="w-4 h-4" />, label: "Player", value: "HLS.js" },
              { icon: <Settings className="w-4 h-4" />, label: "Quality", value: "Adaptive" },
              { icon: <Volume2 className="w-4 h-4" />, label: "Audio", value: "Multi-track" },
              { icon: <RefreshCw className="w-4 h-4" />, label: "Source", value: "net52.cc" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-[#1f1f1f] border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-[#E50914] mb-2">{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div>
                <div className="text-white font-bold text-sm">{value}</div>
              </div>
            ))}
          </div>

          {/* Keyboard shortcuts */}
          <div className="mt-6 bg-[#1f1f1f] border border-white/5 rounded-2xl p-5">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Space", "Play / Pause"],
                ["← / →", "Seek 10s"],
                ["F", "Fullscreen"],
                ["M", "Mute / Unmute"],
              ].map(([key, action]) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white/10 text-white/70 text-[10px] font-mono rounded border border-white/10">{key}</kbd>
                  <span className="text-white/40 text-xs">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
