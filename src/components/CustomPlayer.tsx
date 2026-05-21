"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import type HlsType from 'hls.js';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Play, Pause, Volume2, VolumeX, FastForward, Rewind, Maximize, Minimize, Volume1, Settings, Info, PictureInPicture } from 'lucide-react';

interface CustomPlayerProps {
  src: string;
}

export default function CustomPlayer({ src }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<{height: number, level: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeekTimeRef = useRef<number>(0);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const isHlsSource = src.includes('.m3u8') || src.includes('.ts');

      if (isHlsSource) {
        const { default: Hls } = await import('hls.js');
        if (cancelled) return;

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            progressive: true,
            maxBufferLength: 4,
            maxMaxBufferLength: 8,
            backBufferLength: 5,
            maxStarvationDelay: 1,
            appendErrorMaxRetry: 8,
            liveSyncDurationCount: 2,
            fragLoadingMaxRetry: 5,
            levelLoadingMaxRetry: 5,
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
            const levels = data.levels
              .map((l: { height: number }, index: number) => ({ height: l.height, level: index }))
              .reverse();
            setAvailableQualities(levels);
            video.play().catch(() => {});
            setIsPlaying(true);
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }
      }

      video.src = src;
    };

    void setupPlayback();

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
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
          isBuffering ? 'blur-md scale-[0.99] opacity-70' : 'blur-0 scale-100 opacity-100'
        }`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => { setIsPlaying(true); setIsBuffering(false); }}
        onCanPlay={() => setIsBuffering(false)}
        onCanPlayThrough={() => setIsBuffering(false)}
        onSeeking={() => setIsBuffering(true)}
        onSeeked={() => setIsBuffering(false)}
        onLoadStart={() => setIsBuffering(true)}
        onLoadedData={() => setIsBuffering(false)}
        onStalled={() => setIsBuffering(true)}
        onClick={togglePlay}
        autoPlay
        crossOrigin="anonymous"
        preload="metadata"
      />

      {/* Buffering Animation */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300 z-10 ${isBuffering ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white/10 rounded-full animate-pulse"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0 drop-shadow-[0_0_15px_rgba(255,182,142,0.6)]"></div>
          </div>
          <span className="text-white/90 font-bold tracking-widest text-xs uppercase animate-pulse select-none bg-black/60 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
            Buffering
          </span>
        </div>
      </div>

      {/* In-Platform Toast Notification */}
      <div className={`absolute top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest/90 backdrop-blur-xl border border-white/10 text-white px-5 py-3 rounded-2xl text-xs font-bold pointer-events-none transition-all duration-300 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <Info size={16} className="text-primary" />
        {toastMessage}
      </div>

      {/* Center Interactive Overlay Controls (Skip & Play/Pause for Mobile & Desktop) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center gap-8 pointer-events-none transition-opacity duration-300 z-20 ${showControls && !isBuffering ? 'opacity-100' : 'opacity-0'}`}
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
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.5)] rounded-[10px] hover:bg-white focus:outline-none focus:scale-125 transition-transform" />
            </Slider.Root>
            <span className="text-white text-xs font-mono">{formatTime(duration)}</span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button onClick={togglePlay} className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md">
                {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
              </button>
              
              <button onClick={() => skip(-5)} className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Rewind 5s">
                <Rewind fill="currentColor" size={20} />
              </button>
              
              <button onClick={() => skip(5)} className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Skip 5s">
                <FastForward fill="currentColor" size={20} />
              </button>

              <div className="flex items-center gap-2 group/volume relative ml-2">
                <button onClick={toggleMute} className="text-white hover:text-primary transition-colors focus:outline-none w-8 flex justify-center drop-shadow-md">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out flex items-center">
                  <Slider.Root 
                    className="relative flex items-center select-none touch-none w-24 h-5 cursor-pointer"
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

            <div className="flex items-center gap-5">
              {/* Video Quality Settings */}
              {availableQualities.length > 0 ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md flex items-center gap-1 text-xs font-bold bg-white/10 px-2 py-1.5 rounded-lg border border-white/10">
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
                  className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md flex items-center gap-1 text-xs font-bold bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 opacity-80"
                  title="Settings (Quality fixed)"
                >
                  <Settings size={16} />
                  Auto
                </button>
              )}

              {/* Playback Speed */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-white text-xs font-bold bg-white/10 border border-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors focus:outline-none drop-shadow-md">
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

              <button onClick={togglePip} className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Picture in Picture">
                <PictureInPicture size={20} />
              </button>

              <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md" title="Fullscreen">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
