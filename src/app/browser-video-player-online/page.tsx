import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Browser Video Player Online | Zero Installation | fluxplays.live',
  description: 'A powerful video player right in your browser. Supports MKV, WEBM, MP4, and more. Paste your link for a seamless playback experience.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/browser-video-player-online'
  }
};

export default function BrowserVideoPlayerPage() {
  return <Home />;
}
