import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Stream URL Video Player | Watch Web Links | fluxplays.live',
  description: 'Stream any valid video URL instantly. The smartest web utility to convert raw video links into a cinematic streaming experience.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/stream-url-video-player'
  }
};

export default function StreamUrlVideoPlayerPage() {
  return <Home />;
}
