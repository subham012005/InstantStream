"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as Slider from '@radix-ui/react-slider';
import type HlsType from 'hls.js';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Play, Pause, Volume2, VolumeX, FastForward, Rewind, Maximize, Minimize, Volume1, Settings, Info, PictureInPicture, Activity } from 'lucide-react';

type PlayerState = "preparing" | "buffering" | "ready" | "playing" | "stalled" | "error";

interface CustomPlayerProps {
  src: string;
  onFatalError?: (type: string, details: string) => void;
}

// Match real HLS manifest/segment extensions only (not ".ts" inside URL tokens)
function isHlsUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return pathname.endsWith('.m3u8') || pathname.endsWith('.ts');
  } catch {
    return /\.m3u8(\?|#|$)/i.test(url) || /\/[^/?#]+\.ts(\?|#|$)/i.test(url);
  }
}

// Signed CDN URLs that carry auth inside the URL itself — browser fetches these directly
// Proxying them strips the session context the CDN uses to validate the token
function isDirectPlayUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      host.endsWith('.googleusercontent.com') ||
      host.endsWith('.googlevideo.com') ||
      host.endsWith('.fbcdn.net') ||
      host.endsWith('.cdninstagram.com') ||
      host.endsWith('.twimg.com') ||
      host.endsWith('.dropboxusercontent.com') ||
      host.endsWith('.1drv.ms')
    );
  } catch {
    return false;
  }
}

// Wrap direct file URLs through our API to bypass CORS, but skip signed CDN URLs
function getProxiedUrl(src: string): string {
  if (isHlsUrl(src)) return src;
  if (isDirectPlayUrl(src)) return src; // signed CDN — play directly
  return `/api/proxy-video?url=${encodeURIComponent(src)}`;
}

function getUrlExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const dot = pathname.lastIndexOf('.');
    if (dot === -1) return '';
    return pathname.slice(dot + 1).toLowerCase();
  } catch {
    const match = url.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
    return match?.[1]?.toLowerCase() ?? '';
  }
}

// Get MIME type from URL extension
function getMimeType(url: string): string {
  const ext = getUrlExtension(url);
  if (ext === 'm3u8' || ext === 'ts') return 'application/x-mpegURL';
  if (ext === 'mkv') return 'video/x-matroska';
  if (ext === 'webm') return 'video/webm';
  if (ext === 'avi') return 'video/x-msvideo';
  if (ext === 'mov') return 'video/quicktime';
  if (ext === 'ogv' || ext === 'ogg') return 'video/ogg';
  if (ext === 'flv') return 'video/x-flv';
  if (ext === 'mpg' || ext === 'mpeg') return 'video/mpeg';
  if (ext === 'mp4') return 'video/mp4';
  return 'video/mp4';
}

export default function CustomPlayer({ src, onFatalError }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHlsSource = useMemo(() => isHlsUrl(src), [src]);
  const isDirectPlay = useMemo(() => isDirectPlayUrl(src), [src]);
  const playbackUrl = useMemo(() => getProxiedUrl(src), [src]);
  // isProxiedPlayback: true only when we're routing through /api/proxy-video
  const isProxiedPlayback = !isHlsSource && !isDirectPlay;
  
  // Player state machine
  const [playerState, setPlayerState] = useState<PlayerState>("preparing");
  const [bufferProgress, setBufferProgress] = useState(0); // 0-100%
  const [requiredBufferSeconds] = useState(8); // Start playback at 8s buffer (fast start)
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loadStage, setLoadStage] = useState<string>("Preparing stream…");
  const [loadElapsed, setLoadElapsed] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<{height: number, level: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [bandwidth, setBandwidth] = useState<number | null>(null);
  const [qualityLabel, setQualityLabel] = useState<string | null>(null);
  const [bufferHealth, setBufferHealth] = useState<number>(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  
  const loadStartRef = useRef<number>(0);
  const loadElapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bufferMonitorRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoPlayedRef = useRef(false);
  // Ref mirror of playerState — readable inside setInterval callbacks without stale closure
  const playerStateRef = useRef<PlayerState>("preparing");

  // Update player state and stage message
  const transitionState = (newState: PlayerState, stage: string) => {
    playerStateRef.current = newState;   // keep ref in sync for interval callbacks
    setPlayerState(newState);
    setLoadStage(stage);
    if (newState === "preparing" || newState === "buffering") {
      loadStartRef.current = Date.now();
      setLoadElapsed(0);
      if (loadElapsedTimerRef.current) clearInterval(loadElapsedTimerRef.current);
      loadElapsedTimerRef.current = setInterval(() => {
        setLoadElapsed(Math.floor((Date.now() - loadStartRef.current) / 1000));
      }, 1000);
    } else if (newState === "ready" || newState === "playing") {
      if (loadElapsedTimerRef.current) {
        clearInterval(loadElapsedTimerRef.current);
        loadElapsedTimerRef.current = null;
      }
    }
  };

  // Check how many seconds are buffered
  const getBufferedSeconds = (): number => {
    const video = videoRef.current;
    if (!video || video.duration === 0 || !isFinite(video.duration)) return 0;
    
    const buffered = video.buffered;
    const currentTime = video.currentTime;
    
    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
        return buffered.end(i) - currentTime;
      }
    }
    return 0;
  };

  // Monitor buffer and auto-play when ready
  const startBufferMonitor = () => {
    if (bufferMonitorRef.current) clearInterval(bufferMonitorRef.current);
    hasAutoPlayedRef.current = false;
    const startTime = Date.now();
    const maxBufferingTime = 15000; // 15 seconds max wait before error

    bufferMonitorRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      // Use ref — NOT the closed-over state value (which is always stale in intervals)
      const currentState = playerStateRef.current;

      const bufferedSeconds = getBufferedSeconds();
      const readyState = video.readyState; // 0=nothing, 1=metadata, 2=current, 3=future, 4=all
      const bufferedTotal = video.buffered.length > 0 ? video.buffered.end(0) : 0;
      const elapsedMs = Date.now() - startTime;

      // Timeout: if no buffer after 15s, show error
      if (bufferedSeconds === 0 && elapsedMs > maxBufferingTime && currentState === "buffering") {
        stopBufferMonitor();
        playerStateRef.current = "error";
        setPlayerState("error");
        setLoadStage("Network timeout: Video server not responding");
        onFatalError?.("timeout", "No data received after 15 seconds");
        return;
      }

      // Update buffer progress bar
      if (video.duration > 0) {
        setBufferProgress((bufferedTotal / video.duration) * 100);
      }

      // State machine: start playback when enough is buffered
      if (currentState === "buffering") {
        if (bufferedSeconds >= requiredBufferSeconds && readyState >= 2) {
          transitionState("ready", "Starting playback…");
          video.play().catch(() => {});
          setIsPlaying(true);
          hasAutoPlayedRef.current = true;
        } else if (readyState >= 3 && bufferedSeconds >= 2) {
          // Enough future data available — start quickly
          transitionState("ready", "Starting playback…");
          video.play().catch(() => {});
          setIsPlaying(true);
          hasAutoPlayedRef.current = true;
        } else if (readyState >= 4) {
          // canPlayThrough — all data available, play immediately
          transitionState("ready", "Starting playback…");
          video.play().catch(() => {});
          setIsPlaying(true);
          hasAutoPlayedRef.current = true;
        }
      }

      // Monitor for stalls during playback
      if (currentState === "playing") {
        if (bufferedSeconds < 2 && readyState >= 2) {
          playerStateRef.current = "stalled";
          setPlayerState("stalled");
          setLoadStage("Re-buffering…");
        }
      }

      // Exit stalled state
      if (currentState === "stalled" && bufferedSeconds >= 5) {
        playerStateRef.current = "playing";
        setPlayerState("playing");
      }
    }, 500);
  };

  const stopBufferMonitor = () => {
    if (bufferMonitorRef.current) {
      clearInterval(bufferMonitorRef.current);
      bufferMonitorRef.current = null;
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const throttleSeek = (time: number) => {
    const now = Date.now();
    const timeSinceLastSeek = now - lastSeekTimeRef.current;

    // Clear any pending debounced seek
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = null;
    }

    if (timeSinceLastSeek >= 250) {
      // Seek instantly for minimum possible latency on clicks and initial drag touches
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        videoRef.current.play().catch(() => {});
      }
      lastSeekTimeRef.current = now;
    } else {
      // Debounce during rapid dragging to prevent network request saturation
      seekTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
          videoRef.current.play().catch(() => {});
        }
        lastSeekTimeRef.current = Date.now();
      }, 150);
    }
  };

  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing && !videoRef.current.seeking) {
      setProgress(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const skip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVol = value[0];
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const changeSpeed = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const togglePip = async () => {
    try {
      if (videoRef.current !== document.pictureInPictureElement) {
        await videoRef.current?.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    } catch (err) {
      showToast("Picture-in-Picture is not supported or was blocked.");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: HlsType | undefined;
    let cancelled = false;
    setAvailableQualities([]);
    setCurrentQuality(-1);

    const setupPlayback = async () => {
      if (isHlsSource) {
        transitionState("buffering", "Loading stream manifest…");
        const { default: Hls } = await import('hls.js');
        if (cancelled) return;

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            progressive: true,
            startLevel: 0,
            abrEwmaDefaultEstimate: 500_000,
            maxBufferLength: 60,              // Target 60s buffer (background, after 8s start)
            maxMaxBufferLength: 120,          // Hard cap at 120s (don't over-buffer)
            highBufferWatchdogPeriod: 1,
            nudgeMaxRetry: 3,
            fragLoadingMaxRetry: 4,
            levelLoadingMaxRetry: 4,
            backBufferLength: 10,
            maxStarvationDelay: 1,
            appendErrorMaxRetry: 4,
            liveSyncDurationCount: 1,
            startFragPrefetch: true,          // Prefetch next fragments
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_LOADING, () => {
            transitionState("buffering", "Loading stream manifest…");
            startBufferMonitor();
          });
          hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
            const levels = data.levels
              .map((l: { height: number }, index: number) => ({ height: l.height, level: index }))
              .reverse();
            setAvailableQualities(levels);
            setLoadStage(`Buffering ${requiredBufferSeconds} seconds for smooth playback…`);
          });
          hls.on(Hls.Events.FRAG_LOADING, () => {
            if (playerState === "buffering") {
              setLoadStage(`Buffering ${requiredBufferSeconds} seconds for smooth playback…`);
            }
          });
          hls.on(Hls.Events.FRAG_LOADED, (_e, data) => {
            const bw = data.frag.stats.bwEstimate;
            if (bw && bw > 0) setBandwidth(bw / 1_000_000);
          });
          hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
            const level = hls?.levels[data.level];
            setQualityLabel(level?.height ? `${level.height}p` : "Auto");
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              stopBufferMonitor();
              setPlayerState("error");
              setLoadStage("Stream error: " + data.details);
              onFatalError?.(data.type, data.details);
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }
      }

      // For direct video URLs: either play directly (signed CDN) or proxy through API
      if (isDirectPlay) {
        // Signed CDN URLs (googleusercontent, etc.) — set src directly.
        // Do NOT use crossOrigin or a <source> element: the signed URL IS the credential
        // and adding CORS headers causes the CDN to reject the request.
        video.src = src;
        try { video.load(); } catch (e) { console.warn('video.load() failed:', e); }
      } else {
        // Proxied URL — use <source> element so we can set an explicit MIME type
        const proxiedUrl = playbackUrl;
        const mimeType = getMimeType(src);
        video.innerHTML = '';
        const sourceEl = document.createElement('source');
        sourceEl.src = proxiedUrl;
        sourceEl.type = mimeType;
        video.appendChild(sourceEl);
        try { video.load(); } catch (e) { console.warn('video.load() failed:', e); }
      }

      transitionState("buffering", `Buffering ${requiredBufferSeconds} seconds for smooth playback…`);
      startBufferMonitor();
    };

    void setupPlayback();

    return () => {
      cancelled = true;
      stopBufferMonitor();
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, isHlsSource, isDirectPlay, playbackUrl, requiredBufferSeconds, onFatalError]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      if (loadElapsedTimerRef.current) clearInterval(loadElapsedTimerRef.current);
      stopBufferMonitor();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        skip(5);
        showToast("Skipped 5s");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skip(-5);
        showToast("Rewound 5s");
      } else if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Buffer progress handler — updates bufferedPercent on video progress events
  const handleProgress = () => {
    const video = videoRef.current;
    if (!video || !isFinite(video.duration) || isNaN(video.duration) || video.duration === 0) {
      setBufferedPercent(0);
      return;
    }
    const buf = video.buffered;
    const ct = video.currentTime;
    let end = 0;
    for (let i = 0; i < buf.length; i++) {
      if (buf.start(i) <= ct && ct <= buf.end(i)) {
        end = buf.end(i);
        break;
      }
    }
    setBufferedPercent((end / video.duration) * 100);
  };

  // Buffer health interval — always active so stats are ready when overlay opens
  useEffect(() => {
    const id = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      const buf = video.buffered;
      const ct = video.currentTime;
      let health = 0;
      for (let i = 0; i < buf.length; i++) {
        if (buf.start(i) <= ct && ct <= buf.end(i)) {
          health = buf.end(i) - ct;
          break;
        }
      }
      setBufferHealth(health);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full bg-black group/container flex items-center justify-center overflow-hidden font-body-md"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className={`w-full h-full object-contain absolute inset-0 transition-all duration-500 ${
          (playerState === "buffering" || playerState === "stalled") ? 'blur-md scale-[0.99] opacity-70' : 'blur-0 scale-100 opacity-100'
        }`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => { setIsPlaying(true); playerStateRef.current = "playing"; setPlayerState("playing"); }}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => { if (playerStateRef.current !== "buffering") { playerStateRef.current = "stalled"; setPlayerState("stalled"); } }}
        onPlaying={() => { setIsPlaying(true); if (playerStateRef.current !== "playing") { playerStateRef.current = "playing"; setPlayerState("playing"); } }}
        onCanPlay={() => { if (playerStateRef.current === "buffering") setLoadStage(`Buffering ${requiredBufferSeconds} seconds for smooth playback…`); }}
        onCanPlayThrough={() => { /* covered by buffer monitor */ }}
        onSeeking={() => { /* minimize UI disruption */ }}
        onSeeked={() => { if (playerStateRef.current === "playing") { playerStateRef.current = "playing"; setPlayerState("playing"); } }}
        onLoadStart={() => { if (playerStateRef.current === "preparing") transitionState("buffering", `Buffering ${requiredBufferSeconds} seconds for smooth playback…`); }}
        onLoadedData={() => { /* buffering continues via monitor */ }}
        onStalled={() => { if (playerStateRef.current === "playing") { playerStateRef.current = "stalled"; setPlayerState("stalled"); } }}
        onProgress={handleProgress}
        onError={(e) => {
          const video = e.target as HTMLVideoElement;
          const error = video.error;
          let errorMsg = "Video error";
          if (error) {
            if (error.code === error.MEDIA_ERR_ABORTED) errorMsg = "Video loading aborted";
            else if (error.code === error.MEDIA_ERR_NETWORK) errorMsg = "Network error - check URL or CORS";
            else if (error.code === error.MEDIA_ERR_DECODE) errorMsg = "Video codec not supported";
            else if (error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED) errorMsg = "Video format not supported";
          }
          console.error("Video error:", errorMsg, error?.code, error?.message);
          stopBufferMonitor();
          playerStateRef.current = "error";
          setPlayerState("error");
          setLoadStage(errorMsg);
          onFatalError?.("video_error", errorMsg);
        }}
        onClick={togglePlay}
        preload="auto"
        {...(isHlsSource ? { crossOrigin: 'anonymous' as const } : {})}
        controlsList="nodownload"
      />

      {/* Stats Overlay — top-right, toggleable, z-30 */}
      {showStats && (
        <div
          className="absolute top-3 right-3 z-30 bg-black/70 rounded-lg px-3 py-2 text-white font-mono select-none pointer-events-none text-[11px] sm:text-xs leading-relaxed"
          style={{ maxWidth: "33%" }}
        >
          <div className="flex flex-col gap-0.5">
            <span>
              BW:{" "}
              {bandwidth !== null
                ? `${bandwidth.toFixed(2)} Mbps`
                : isHlsSource
                ? "—"
                : "N/A"}
            </span>
            <span>
              Q:{" "}
              {qualityLabel !== null
                ? qualityLabel
                : isHlsSource
                ? "—"
                : "N/A"}
            </span>
            <span className={bufferHealth < 2 ? "text-amber-400" : "text-white"}>
              Buf: {bufferHealth.toFixed(1)}s
            </span>
          </div>
        </div>
      )}

      {/* Loading / Buffering Overlay — shows stage + buffer progress + elapsed time */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 z-10 ${(playerState === "preparing" || playerState === "buffering" || playerState === "stalled") ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-center gap-4 px-6 max-w-xs text-center">
          {/* Spinner */}
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-white/10 rounded-full"></div>
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0 drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"></div>
          </div>
          {/* Stage label */}
          <span className="text-white font-semibold text-sm tracking-wide animate-pulse">
            {loadStage || "Loading…"}
          </span>
          
          {/* Buffer progress bar (only for buffering state) */}
          {(playerState === "buffering" || playerState === "preparing") && (
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-200"
                style={{ width: `${Math.min(bufferProgress, 100)}%` }}
              />
            </div>
          )}
          
          {/* Buffer percentage */}
          {(playerState === "buffering" || playerState === "preparing") && (
            <span className="text-white/70 text-xs font-mono">
              {Math.round(bufferProgress)}% buffered
            </span>
          )}
          
          {/* Elapsed time — only show after 3s so it doesn't flash on fast loads */}
          {loadElapsed >= 3 && (
            <span className="text-white/50 text-xs font-mono">
              {loadElapsed}s elapsed
            </span>
          )}
          {/* Slow connection hint after 8s */}
          {loadElapsed >= 8 && (
            <span className="text-amber-400 text-xs text-center leading-relaxed">
              Taking longer than usual — your connection may be slow or the source server is busy.
            </span>
          )}
          {/* Bandwidth if known */}
          {bandwidth !== null && (
            <span className="text-white/40 text-xs font-mono">
              {bandwidth.toFixed(2)} Mbps
            </span>
          )}
        </div>
      </div>

      {/* In-Platform Toast Notification */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest/90 backdrop-blur-xl border border-white/10 text-white px-5 py-3 rounded-2xl text-xs font-bold pointer-events-none transition-all duration-300 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Info size={16} className="text-primary" />
        {toastMessage}
      </div>

      {/* Center Interactive Overlay Controls (Skip & Play/Pause for Mobile & Desktop) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center gap-8 pointer-events-none transition-opacity duration-300 z-20 ${showControls && (playerState === "playing" || playerState === "ready") ? 'opacity-100' : 'opacity-0'}`}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); skip(-5); showToast("Rewound 5s"); }} 
          className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-primary/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-primary transition-all active:scale-90 hover:scale-105 shadow-lg"
          title="Rewind 5s"
        >
          <Rewind fill="currentColor" size={20} className="md:w-6 md:h-6" />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
          className="pointer-events-auto w-16 h-16 md:w-20 md:h-20 bg-black/50 hover:bg-black/70 border border-white/20 hover:border-primary/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-primary transition-all active:scale-90 hover:scale-105 shadow-xl"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause fill="currentColor" size={28} className="md:w-9 md:h-9" />
          ) : (
            <Play fill="currentColor" size={28} className="ml-1 md:w-9 md:h-9 md:ml-2" />
          )}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); skip(5); showToast("Skipped 5s"); }} 
          className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-primary/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-primary transition-all active:scale-90 hover:scale-105 shadow-lg"
          title="Skip 5s"
        >
          <FastForward fill="currentColor" size={20} className="md:w-6 md:h-6" />
        </button>
      </div>

      {/* Overlay controls */}
      <div 
        className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-300 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div 
          className="w-full px-6 pb-6 pt-12 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div className="flex items-center gap-4 w-full mb-4">
            <span className="text-white text-xs font-mono">{formatTime(progress)}</span>
            <Slider.Root 
              className="relative flex items-center select-none touch-none w-full h-5 group cursor-pointer"
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={(val) => {
                setIsScrubbing(true);
                setProgress(val[0]);
                throttleSeek(val[0]);
              }}
              onValueCommit={(val) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = val[0];
                  setProgress(val[0]);
                  videoRef.current.play().catch(() => {});
                }
                setIsScrubbing(false);
                if (seekTimeoutRef.current) {
                  clearTimeout(seekTimeoutRef.current);
                }
              }}
            >
              <Slider.Track className="bg-white/30 relative grow rounded-full h-1.5 transition-all group-hover:h-2">
                {/* Buffer Bar — hidden for live/infinite-duration streams */}
                {isFinite(duration) && !isNaN(duration) && duration > 0 && (
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-white/40 pointer-events-none"
                    style={{ width: `${bufferedPercent}%` }}
                  />
                )}
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] rounded-[10px] hover:bg-white focus:outline-none focus:scale-125 transition-transform" />
            </Slider.Root>
            <span className="text-white text-xs font-mono">{formatTime(duration)}</span>
          </div>

          {/* Controls Row — flex-wrap for mobile: row 1 = playback, row 2 = settings */}
          <div className="flex flex-wrap items-center gap-y-2">
            {/* Row 1: play/pause, rewind, skip, volume — always visible */}
            <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
              <button onClick={togglePlay} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md">
                {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
              </button>
              
              <button onClick={() => skip(-5)} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Rewind 5s">
                <Rewind fill="currentColor" size={20} />
              </button>
              
              <button onClick={() => skip(5)} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Skip 5s">
                <FastForward fill="currentColor" size={20} />
              </button>

              <div className="flex items-center gap-2 group/volume relative">
                <button onClick={toggleMute} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="w-0 overflow-hidden group-hover/volume:w-20 sm:group-hover/volume:w-24 transition-all duration-300 ease-out flex items-center">
                  <Slider.Root 
                    className="relative flex items-center select-none touch-none w-20 sm:w-24 h-5 cursor-pointer"
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  >
                    <Slider.Track className="bg-white/30 relative grow rounded-full h-1.5">
                      <Slider.Range className="absolute bg-white rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-3 h-3 bg-white shadow-sm rounded-[10px] focus:outline-none focus:scale-125 transition-transform" />
                  </Slider.Root>
                </div>
              </div>
            </div>

            {/* Row 2: quality, speed, stats, pip, fullscreen — wraps on mobile */}
            <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-wrap justify-end">
              {/* Video Quality Settings */}
              {availableQualities.length > 0 ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md gap-1 text-xs font-bold bg-white/10 px-2 rounded-lg border border-white/10">
                      <Settings size={16} />
                      {currentQuality === -1 ? 'Auto' : `${availableQualities.find(q => q.level === currentQuality)?.height}p`}
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content 
                      className="min-w-[120px] bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl p-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-black/10 animate-in fade-in zoom-in-95 font-body-md z-50 mb-2"
                      side="top"
                      align="end"
                      sideOffset={15}
                    >
                      <DropdownMenu.Item 
                        onClick={() => changeQuality(-1)}
                        className={`text-sm px-4 py-2 outline-none cursor-pointer rounded-lg transition-colors ${currentQuality === -1 ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-black/5'}`}
                      >
                        Auto Quality
                      </DropdownMenu.Item>
                      {availableQualities.map((q) => (
                        <DropdownMenu.Item 
                          key={q.level}
                          onClick={() => changeQuality(q.level)}
                          className={`text-sm px-4 py-2 outline-none cursor-pointer rounded-lg transition-colors ${currentQuality === q.level ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-black/5'}`}
                        >
                          {q.height}p
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <button 
                  onClick={() => showToast("Quality switching is fixed by the source for this format.")}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md gap-1 text-xs font-bold bg-white/5 px-2 rounded-lg border border-white/5 opacity-80"
                  title="Settings (Quality fixed)"
                >
                  <Settings size={16} />
                  Auto
                </button>
              )}

              {/* Playback Speed */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white text-xs font-bold bg-white/10 border border-white/10 hover:bg-white/20 px-2 rounded transition-colors focus:outline-none drop-shadow-md">
                    {playbackRate}x
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content 
                    className="min-w-[120px] bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl p-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-black/10 animate-in fade-in zoom-in-95 font-body-md z-50 mb-2"
                    side="top"
                    align="end"
                    sideOffset={15}
                  >
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <DropdownMenu.Item 
                        key={rate}
                        onClick={() => changeSpeed(rate)}
                        className={`text-sm px-4 py-2 outline-none cursor-pointer rounded-lg transition-colors ${playbackRate === rate ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-black/5'}`}
                      >
                        {rate === 1 ? "Normal (1x)" : `${rate}x`}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>

              {/* Stats Toggle */}
              <button
                onClick={() => setShowStats(s => !s)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors focus:outline-none drop-shadow-md ${showStats ? 'text-primary' : 'text-white hover:text-primary'}`}
                title="Toggle stats overlay"
              >
                <Activity size={20} />
              </button>

              <button onClick={togglePip} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Picture in Picture">
                <PictureInPicture size={20} />
              </button>

              <button onClick={toggleFullscreen} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Fullscreen">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
