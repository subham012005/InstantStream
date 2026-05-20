import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Watch Videos Online Without Saving | fluxplays.live',
  description: 'Keep your storage clean. Paste a URL to watch videos online without saving a single file to your local computer, tablet, or mobile phone.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/watch-videos-online-without-saving'
  }
};

export default function WatchVideosWithoutSavingPage() {
  return <Home />;
}
