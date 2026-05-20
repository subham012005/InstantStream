import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Stream Videos Without Downloading | fluxplays.live',
  description: 'Watch any video online without downloading it. Paste MP4, Google Drive or Telegram video links and stream instantly in your browser.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/stream-videos-without-downloading'
  }
};

export default function StreamWithoutDownloadingPage() {
  return <Home />;
}
