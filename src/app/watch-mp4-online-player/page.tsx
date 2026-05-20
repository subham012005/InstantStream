import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Watch MP4 Online Player | Stream MP4 Instantly | fluxplays.live',
  description: 'Fast, secure online MP4 video player. Paste your direct MP4 URL to watch your videos directly in your browser without waiting for downloads.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/watch-mp4-online-player'
  }
};

export default function WatchMp4OnlinePlayerPage() {
  return <Home />;
}
