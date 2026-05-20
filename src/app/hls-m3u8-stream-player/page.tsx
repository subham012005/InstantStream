import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'HLS m3u8 Stream Player Web | fluxplays.live',
  description: 'The best online m3u8 player. Stream HLS video playlists directly in your browser. Paste your .m3u8 link and enjoy fast, buffer-free playback.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/hls-m3u8-stream-player'
  }
};

export default function HlsM3u8StreamPlayerPage() {
  return <Home />;
}
