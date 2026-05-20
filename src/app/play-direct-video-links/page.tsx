import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Play Direct Video Links Online | fluxplays.live',
  description: 'Play direct video URLs effortlessly. Our web-based player supports direct video links and plays them without any required downloads or plugins.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/play-direct-video-links'
  }
};

export default function PlayDirectVideoLinksPage() {
  return <Home />;
}
