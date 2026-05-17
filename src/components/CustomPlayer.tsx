"use client";

import React, { useState, useRef, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Play, Pause, Volume2, VolumeX, FastForward, Rewind, Maximize, Minimize, Volume1, Zap } from 'lucide-react';

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
  const [isBoosted, setIsBoosted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initAudio = () => {
    try {
      if (!audioCtxRef.current && videoRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return false;
        
        audioCtxRef.current = new AudioContextClass();
        const source = audioCtxRef.current.createMediaElementSource(videoRef.current);
        gainNodeRef.current = audioCtxRef.current.createGain();
        source.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioCtxRef.current.destination);
      }
      // If audio context is suspended (browser policy), resume it
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return true;
    } catch (e) {
      console.warn("Audio Context initialization failed.", e);
      return false;
    }
  };

  useEffect(() => {
    if (isBoosted) {
      const success = initAudio();
      if (success && gainNodeRef.current) {
        gainNodeRef.current.gain.value = 2.0; // Boost to 200%
      } else {
        setIsBoosted(false);
      }
    } else if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = 1.0;
    }
  }, [isBoosted]);

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
    if (videoRef.current) {
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
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
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
      className="relative w-full h-full bg-black group/container flex items-center justify-center overflow-hidden font-body-md"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        crossOrigin="anonymous"
        className="w-full h-full object-contain absolute inset-0"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        autoPlay
      />

      {/* Play/Pause Center Animation (optional, adds to seamless feel) */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${!isPlaying && showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white">
          <Play fill="currentColor" size={40} className="ml-2" />
        </div>
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
                if (videoRef.current) {
                  videoRef.current.currentTime = val[0];
                  setProgress(val[0]);
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

              {/* Volume Boost Toggle */}
              <button 
                onClick={() => setIsBoosted(!isBoosted)} 
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded transition-colors drop-shadow-md ${isBoosted ? 'bg-primary text-white border border-primary/50 shadow-[0_0_10px_rgba(255,182,142,0.5)]' : 'bg-white/10 text-white/90 hover:bg-white/20 hover:text-white border border-white/10'}`}
                title="Boost Volume to 200%"
              >
                <Zap size={14} fill={isBoosted ? "currentColor" : "none"} />
                200% BOOST
              </button>
            </div>

            <div className="flex items-center gap-4">
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

              <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors focus:outline-none drop-shadow-md">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
