"use client";

import React from 'react';
import SmartPlayer, { SmartPlayerProps } from './player/SmartPlayer';

export interface CustomPlayerProps {
  src: string;
  poster?: string | null;
  title?: string;
  onFatalError?: (type: string, details: string) => void;
  onEnded?: () => void;
  mediaId?: string;
  season?: number;
  episode?: number;
  isSeries?: boolean;
  aspectRatio?: string;
  className?: string;
}

export default function CustomPlayer({
  src,
  poster,
  title,
  onFatalError,
  onEnded,
  mediaId,
  season,
  episode,
  isSeries,
  aspectRatio,
  className,
}: CustomPlayerProps) {
  return (
    <SmartPlayer
      src={src}
      poster={poster}
      title={title}
      onFatalError={onFatalError}
      onEnded={onEnded}
      mediaId={mediaId}
      season={season}
      episode={episode}
      isSeries={isSeries}
      aspectRatio={aspectRatio}
      className={className}
    />
  );
}
