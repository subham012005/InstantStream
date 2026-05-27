import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Watch Videos Online Without Saving | FluxPlays',
  description: 'Keep your storage clean. Paste a URL to watch videos online without saving a single file to your local computer, tablet, or mobile phone.',
  keywords: [
    'watch videos online',
    'stream without saving',
    'no download video',
    'online video player',
    'browser video player',
    'instant streaming',
    'video streaming service',
    'free video player',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://fluxplays.live/watch-videos-online-without-saving'
  },
  openGraph: {
    title: 'Watch Videos Online Without Saving | FluxPlays',
    description: 'Stream videos without saving files. Keep your storage clean.',
    url: 'https://fluxplays.live/watch-videos-online-without-saving',
    type: 'website',
    siteName: 'FluxPlays',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watch Videos Online | FluxPlays',
    description: 'Stream videos without saving any files.',
  },
};

export default function WatchVideosWithoutSavingPage() {
  return <Home />;
}
