import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Telegram Video Player Online | fluxplays.live',
  description: 'Stream Telegram videos online in your browser. Paste any public Telegram CDN video link to watch it instantly without downloading it to your device.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/telegram-video-player'
  }
};

export default function TelegramVideoPlayerPage() {
  return <Home />;
}
