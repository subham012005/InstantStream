"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture,
  SkipBack,
  SkipForward,
  AlertCircle,
  Check,
  Subtitles,
  Gauge,
  Radio,
  ExternalLink,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { isTeraBoxUrl, parseTeraBoxUrl } from '@/lib/streaming/terabox';
import { saveWatchProgress, getWatchProgress } from '@/lib/player/history';
import { isFavorite, toggleFavorite } from '@/lib/player/favorites';

export interface SmartSubtitleTrack {
  file: string;
  label: string;
  language?: string;
}

export interface SmartPlayerProps {
  src: string;
  poster?: string | null;
  title?: string;
  type?: 'auto' | 'hls' | 'mp4' | 'embed' | 'terabox';
  mediaId?: string; // IMDb or TMDB ID
  season?: number;
  episode?: number;
  isSeries?: boolean;
  hasPrevEpisode?: boolean;
  hasNextEpisode?: boolean;
  onPrevEpisode?: () => void;
  onNextEpisode?: () => void;
  subtitles?: SmartSubtitleTrack[];
  onFatalError?: (type: string, details: string) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

// Module-level Hls cache to prevent multiple loads
let hlsModuleCache: any = null;
const loadHls = async () => {
  if (hlsModuleCache) return hlsModuleCache;
  const mod = await import('hls.js');
  hlsModuleCache = mod.default ?? mod;
  return hlsModuleCache;
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SmartPlayer({
  src,
  poster,
  title = 'Video Stream',
  type = 'auto',
  mediaId,
  season,
  episode,
  isSeries = false,
  hasPrevEpisode = false,
  hasNextEpisode = false,
  onPrevEpisode,
  onNextEpisode,
  subtitles = [],
  onFatalError,
  onEnded,
  autoPlay = true,
}: SmartPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });

  // Detection
  const teraBoxInfo = useMemo(() => {
    if (type === 'terabox' || isTeraBoxUrl(src)) {
      return parseTeraBoxUrl(src);
    }
    return null;
  }, [src, type]);

  const isEmbed = useMemo(() => {
    if (type === 'embed') return true;
    if (teraBoxInfo?.isValid) return false;
    const lower = src.toLowerCase();
    return (
      lower.includes('slast430did.com') ||
      lower.includes('vixsrc.to') ||
      lower.includes('player.videasy.net') ||
      lower.includes('gemma416okl.com') ||
      lower.includes('/play/') ||
      lower.includes('/embed/')
    );
  }, [src, type, teraBoxInfo]);

  const isHls = useMemo(() => {
    if (isEmbed || teraBoxInfo) return false;
    const lower = src.toLowerCase();
    return (
      type === 'hls' ||
      lower.includes('.m3u8') ||
      lower.includes('hls-proxy')
    );
  }, [src, type, isEmbed, teraBoxInfo]);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<{ side: 'left' | 'right'; id: number } | null>(null);

  // Settings menu states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'speed' | 'quality' | 'audio' | 'subtitles'>('speed');
  const [qualityLevels, setQualityLevels] = useState<{ level: number; label: string }[]>([]);
  const [currentQualityLevel, setCurrentQualityLevel] = useState<number>(-1);
  const [audioTracks, setAudioTracks] = useState<string[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1); // -1 = off
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(true);
  const [favorited, setFavorited] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  // Check favorite status
  useEffect(() => {
    if (mediaId) {
      setFavorited(isFavorite(mediaId));
    }
  }, [mediaId]);

  const handleToggleFavorite = () => {
    if (!mediaId) return;
    const next = toggleFavorite({
      id: mediaId,
      title,
      poster: poster || null,
      type: isSeries ? 'series' : 'movie',
    });
    setFavorited(next);
  };

  // Auto-hide controls
  const triggerShowControls = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying && !settingsOpen) {
        setShowControls(false);
      }
    }, 3200);
  }, [isPlaying, settingsOpen]);

  // Resume Progress
  useEffect(() => {
    if (!mediaId || isEmbed || teraBoxInfo) return;
    const saved = getWatchProgress(mediaId, season, episode);
    if (saved && saved.progress > 5 && saved.duration > 0 && saved.percent < 95) {
      const vid = videoRef.current;
      if (vid) {
        vid.currentTime = saved.progress;
        setCurrentTime(saved.progress);
      }
    }
  }, [mediaId, season, episode, isEmbed, teraBoxInfo]);

  // Save Progress Interval
  useEffect(() => {
    if (!mediaId || isEmbed || teraBoxInfo) return;
    if (isPlaying && currentTime > 2 && duration > 0) {
      if (saveProgressTimerRef.current) clearTimeout(saveProgressTimerRef.current);
      saveProgressTimerRef.current = setTimeout(() => {
        saveWatchProgress({
          id: mediaId,
          title,
          poster: poster || null,
          type: isSeries ? 'series' : 'movie',
          season,
          episode,
          progress: Math.floor(currentTime),
          duration: Math.floor(duration),
        });
      }, 3000);
    }
    return () => {
      if (saveProgressTimerRef.current) clearTimeout(saveProgressTimerRef.current);
    };
  }, [currentTime, duration, isPlaying, mediaId, title, poster, isSeries, season, episode, isEmbed, teraBoxInfo]);

  // Video playback initialization
  useEffect(() => {
    if (isEmbed || teraBoxInfo) return;
    const video = videoRef.current;
    if (!video || !src) return;

    let destroyed = false;
    setIsBuffering(true);
    setErrorMessage(null);

    const initHls = async () => {
      try {
        const Hls = await loadHls();
        if (destroyed) return;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            startLevel: -1,
            maxBufferLength: 45,
            maxMaxBufferLength: 90,
          });
          hlsRef.current = hls;

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, (_e: any, data: any) => {
            if (destroyed) return;
            const levels = (data?.levels || hls.levels || []).map((l: any, i: number) => ({
              level: i,
              label: l.height ? `${l.height}p` : `Level ${i + 1}`,
            }));
            setQualityLevels(levels);
            setCurrentQualityLevel(-1);

            if (autoPlay) {
              video.play().catch(() => {
                video.muted = true;
                setIsMuted(true);
                video.play().catch(() => {});
              });
            }
          });

          hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, () => {
            if (hls.audioTracks.length > 0) {
              setAudioTracks(hls.audioTracks.map((t: any) => t.name || t.lang || `Track ${t.id}`));
              setCurrentAudioTrack(hls.audioTrack);
            }
          });

          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                setErrorMessage(`Stream error: ${data.details || 'Playback failed'}`);
                onFatalError?.(data.type, data.details);
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          if (autoPlay) video.play().catch(() => {});
        } else {
          setErrorMessage('HLS stream format is not natively supported in this browser.');
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error loading playback engine');
      }
    };

    if (isHls) {
      initHls();
    } else {
      // Direct MP4 / WebM video
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    }

    return () => {
      destroyed = true;
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, [src, isHls, isEmbed, teraBoxInfo, autoPlay, onFatalError]);

  // Video listeners
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Update buffer progress
    if (video.buffered.length > 0) {
      for (let i = video.buffered.length - 1; i >= 0; i--) {
        if (video.buffered.start(i) <= video.currentTime) {
          setBufferedTime(video.buffered.end(i));
          break;
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setIsBuffering(false);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
    triggerShowControls();
  };

  const skipSeconds = (sec: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const target = Math.max(0, Math.min(duration, video.currentTime + sec));
    video.currentTime = target;
    setCurrentTime(target);
    triggerShowControls();
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
    if (isMuted && volume === 0) {
      setVolume(0.8);
      video.volume = 0.8;
    }
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setSettingsOpen(false);
  };

  const handleQualityChange = (level: number) => {
    setCurrentQualityLevel(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
    setSettingsOpen(false);
  };

  const handleAudioChange = (trackIndex: number) => {
    setCurrentAudioTrack(trackIndex);
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackIndex;
    }
    setSettingsOpen(false);
  };

  const handleSubtitleChange = (index: number) => {
    setActiveSubtitle(index);
    const video = videoRef.current;
    if (video && video.textTracks) {
      for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = i === index ? 'showing' : 'hidden';
      }
    }
    setSettingsOpen(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch {}
  };

  // Mobile Double-Tap to Seek (10s back / 10s forward)
  const handleTouchScreen = (e: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const touch = e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = touch.clientX - rect.left;
    const width = rect.width;

    if (now - lastTapRef.current.time < 300) {
      // Double tap detected
      if (tapX < width * 0.4) {
        skipSeconds(-10);
        setDoubleTapFeedback({ side: 'left', id: now });
      } else if (tapX > width * 0.6) {
        skipSeconds(10);
        setDoubleTapFeedback({ side: 'right', id: now });
      } else {
        togglePlay();
      }
      setTimeout(() => setDoubleTapFeedback(null), 700);
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      lastTapRef.current = { time: now, x: tapX };
      triggerShowControls();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    if (isEmbed || teraBoxInfo) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          e.preventDefault();
          skipSeconds(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skipSeconds(-10);
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => {
            const nv = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = nv;
            return nv;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => {
            const nv = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = nv;
            return nv;
          });
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, isEmbed, teraBoxInfo]);

  // Handle Video Ended
  const handleVideoEnded = () => {
    setIsPlaying(false);
    onEnded?.();
    if (autoPlayNext && hasNextEpisode && onNextEpisode) {
      onNextEpisode();
    }
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER: TeraBox / Cloud Share Case
  ───────────────────────────────────────────────────────────── */
  if (teraBoxInfo) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl flex flex-col justify-center items-center"
      >
        {teraBoxInfo.isValid && teraBoxInfo.embedUrl ? (
          <>
            <iframe
              src={teraBoxInfo.embedUrl}
              className="w-full h-full border-0"
              title="TeraBox Public Player"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
            />
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/75 px-3 py-1.5 rounded-full text-xs text-white/90 backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>TeraBox Cloud Player</span>
            </div>
          </>
        ) : (
          <div className="p-8 text-center max-w-md flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-amber-400" />
            <h3 className="text-lg font-bold text-white">TeraBox Stream Notice</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {teraBoxInfo.error || 'This TeraBox link requires viewing through official public web access.'}
            </p>
            <a
              href={teraBoxInfo.rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-lg"
            >
              <span>Open in TeraBox</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER: Isolated Embed Player (e.g. Slast430 Server 1)
  ───────────────────────────────────────────────────────────── */
  if (isEmbed) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl"
      >
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#090909]">
            <div className="w-12 h-12 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mb-4" />
            <span className="text-sm font-bold text-white/80 font-mono tracking-wide">
              Connecting to High-Speed Stream Server…
            </span>
          </div>
        )}

        <iframe
          key={src}
          src={src}
          className="w-full h-full border-0"
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setIframeLoaded(true)}
        />

        {/* Top Control Bar for Server Switching & Favorite */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          {mediaId && (
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 transition-transform active:scale-90"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorited ? (
                <BookmarkCheck className="w-4 h-4 text-[#f5c518]" />
              ) : (
                <Bookmark className="w-4 h-4 text-white/80" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER: Unified Native Telegram-Style Player
  ───────────────────────────────────────────────────────────── */
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerShowControls}
      onTouchStart={handleTouchScreen}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl group select-none"
    >
      {/* Video HTML5 Element */}
      <video
        ref={videoRef}
        poster={poster || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={handleVideoEnded}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      >
        {subtitles.map((sub, idx) => (
          <track
            key={`${sub.file}-${idx}`}
            src={sub.file}
            label={sub.label}
            srcLang={sub.language || 'en'}
            kind="subtitles"
            default={idx === activeSubtitle}
          />
        ))}
      </video>

      {/* Double Tap Visual Indicator (Left / Right) */}
      {doubleTapFeedback && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center p-5 rounded-full bg-black/70 text-white backdrop-blur-md pointer-events-none transition-all ${
            doubleTapFeedback.side === 'left' ? 'left-1/4' : 'right-1/4'
          }`}
        >
          {doubleTapFeedback.side === 'left' ? (
            <>
              <RotateCcw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono font-bold mt-1">-10s</span>
            </>
          ) : (
            <>
              <RotateCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-mono font-bold mt-1">+10s</span>
            </>
          )}
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs z-20 pointer-events-none">
          <div className="w-12 h-12 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin mb-3" />
          <span className="text-xs font-mono text-white/80 font-bold tracking-wider">
            Buffering…
          </span>
        </div>
      )}

      {/* Error Overlay */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-40 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-[var(--accent)] mb-3" />
          <h4 className="text-base font-bold text-white mb-2">Playback Error</h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-4 leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={() => {
              setErrorMessage(null);
              videoRef.current?.load();
              videoRef.current?.play().catch(() => {});
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold transition-transform active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Playback</span>
          </button>
        </div>
      )}

      {/* Center Play Button Overlay when paused */}
      {!isPlaying && !isBuffering && !errorMessage && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-white/20 hover:bg-[var(--accent)] backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl"
          title="Play"
        >
          <Play className="w-7 h-7 fill-current ml-1" />
        </button>
      )}

      {/* Top Header Bar */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-30 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-white truncate max-w-md drop-shadow">
            {title}
          </h3>
          {isSeries && season && episode && (
            <span className="text-[11px] font-mono text-white/70">
              Season {season} · Episode {episode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mediaId && (
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-transform active:scale-95"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorited ? (
                <BookmarkCheck className="w-4 h-4 text-[#f5c518]" />
              ) : (
                <Bookmark className="w-4 h-4 text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Telegram-Style Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 pt-16 pb-4 px-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-30 flex flex-col gap-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Scrubber Progress Bar */}
        <div
          className="relative w-full h-1.5 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all duration-150 group/bar flex items-center"
          onClick={seekTo}
        >
          {/* Buffered track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/35 rounded-full pointer-events-none"
            style={{ width: `${Math.min(100, bufferPercent)}%` }}
          />
          {/* Played track */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-[var(--accent)] rounded-full pointer-events-none transition-all duration-75"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
          {/* Scrubber Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg pointer-events-none opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between mt-1">
          {/* Left Buttons: Play, Prev/Next, Skip 10s, Volume, Time */}
          <div className="flex items-center gap-3">
            {hasPrevEpisode && onPrevEpisode && (
              <button
                onClick={onPrevEpisode}
                className="text-white/80 hover:text-white transition-colors"
                title="Previous Episode"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={togglePlay}
              className="text-white hover:text-[var(--accent)] transition-colors p-1"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {hasNextEpisode && onNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="text-white/80 hover:text-white transition-colors"
                title="Next Episode"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => skipSeconds(-10)}
              className="text-white/80 hover:text-white transition-transform active:scale-90"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => skipSeconds(10)}
              className="text-white/80 hover:text-white transition-transform active:scale-90"
              title="Forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume & Slider */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-colors"
                title="Mute / Unmute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeSlider}
                className="w-16 h-1 accent-[var(--accent)] bg-white/20 rounded-full cursor-pointer transition-opacity opacity-70 group-hover/vol:opacity-100 hidden sm:block"
              />
            </div>

            {/* Time Stamp */}
            <span className="text-xs font-mono text-white/80 ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Buttons: Speed/Quality Settings, PiP, Fullscreen */}
          <div className="flex items-center gap-2 relative">
            {/* Speed / Quality Settings Button */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(prev => !prev)}
                className={`p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors ${
                  settingsOpen ? 'bg-white/20' : ''
                }`}
                title="Playback Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Dropdown Popover */}
              {settingsOpen && (
                <div className="absolute bottom-full right-0 mb-3 w-56 bg-[#161618] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50 text-white backdrop-blur-xl">
                  {/* Tabs */}
                  <div className="flex border-b border-white/10 text-[11px] font-bold">
                    <button
                      onClick={() => setSettingsTab('speed')}
                      className={`flex-1 py-2 text-center transition-colors ${
                        settingsTab === 'speed' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Speed
                    </button>
                    {qualityLevels.length > 0 && (
                      <button
                        onClick={() => setSettingsTab('quality')}
                        className={`flex-1 py-2 text-center transition-colors ${
                          settingsTab === 'quality' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Quality
                      </button>
                    )}
                    {audioTracks.length > 0 && (
                      <button
                        onClick={() => setSettingsTab('audio')}
                        className={`flex-1 py-2 text-center transition-colors ${
                          settingsTab === 'audio' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Audio
                      </button>
                    )}
                    {subtitles.length > 0 && (
                      <button
                        onClick={() => setSettingsTab('subtitles')}
                        className={`flex-1 py-2 text-center transition-colors ${
                          settingsTab === 'subtitles' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Subs
                      </button>
                    )}
                  </div>

                  {/* Tab Contents */}
                  <div className="max-h-52 overflow-y-auto py-1">
                    {/* Speed options */}
                    {settingsTab === 'speed' &&
                      [0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => handleSpeedChange(rate)}
                          className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                            playbackSpeed === rate ? 'font-bold text-[var(--accent)]' : 'text-white/80'
                          }`}
                        >
                          <span>{rate === 1 ? 'Normal (1x)' : `${rate}x`}</span>
                          {playbackSpeed === rate && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}

                    {/* Quality options */}
                    {settingsTab === 'quality' && (
                      <>
                        <button
                          onClick={() => handleQualityChange(-1)}
                          className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                            currentQualityLevel === -1 ? 'font-bold text-[var(--accent)]' : 'text-white/80'
                          }`}
                        >
                          <span>Auto</span>
                          {currentQualityLevel === -1 && <Check className="w-3.5 h-3.5" />}
                        </button>
                        {qualityLevels.map(ql => (
                          <button
                            key={ql.level}
                            onClick={() => handleQualityChange(ql.level)}
                            className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                              currentQualityLevel === ql.level ? 'font-bold text-[var(--accent)]' : 'text-white/80'
                            }`}
                          >
                            <span>{ql.label}</span>
                            {currentQualityLevel === ql.level && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </>
                    )}

                    {/* Audio track options */}
                    {settingsTab === 'audio' &&
                      audioTracks.map((trk, i) => (
                        <button
                          key={i}
                          onClick={() => handleAudioChange(i)}
                          className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                            currentAudioTrack === i ? 'font-bold text-[var(--accent)]' : 'text-white/80'
                          }`}
                        >
                          <span>{trk}</span>
                          {currentAudioTrack === i && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}

                    {/* Subtitle options */}
                    {settingsTab === 'subtitles' && (
                      <>
                        <button
                          onClick={() => handleSubtitleChange(-1)}
                          className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                            activeSubtitle === -1 ? 'font-bold text-[var(--accent)]' : 'text-white/80'
                          }`}
                        >
                          <span>Off</span>
                          {activeSubtitle === -1 && <Check className="w-3.5 h-3.5" />}
                        </button>
                        {subtitles.map((sub, i) => (
                          <button
                            key={i}
                            onClick={() => handleSubtitleChange(i)}
                            className={`w-full px-4 py-2 text-left text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                              activeSubtitle === i ? 'font-bold text-[var(--accent)]' : 'text-white/80'
                            }`}
                          >
                            <span>{sub.label}</span>
                            {activeSubtitle === i && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors hidden sm:block"
              title="Picture in Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
