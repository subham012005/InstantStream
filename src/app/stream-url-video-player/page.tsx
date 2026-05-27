import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Stream URL Video Player | Watch Web Links | FluxPlays',
  description: 'Stream any valid video URL instantly. The smartest web utility to convert raw video links into a cinematic streaming experience.',
  keywords: [
    'stream URL video player',
    'video URL streaming',
    'stream video links',
    'online video player',
    'browser video player',
    'instant video playback',
    'video URL player',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://fluxplays.live/stream-url-video-player'
  },
  openGraph: {
    title: 'Stream URL Video Player | FluxPlays',
    description: 'Stream any valid video URL instantly in your browser.',
    url: 'https://fluxplays.live/stream-url-video-player',
    type: 'website',
    siteName: 'FluxPlays',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stream URL Video Player | FluxPlays',
    description: 'Convert video URLs into instant streams.',
  },
};

export default function StreamUrlVideoPlayerPage() {
  return <Home />;
}
