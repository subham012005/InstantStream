import { Metadata } from 'next';
import Home from '../page';

export const metadata: Metadata = {
  title: 'Google Drive Video Player Online | fluxplays.live',
  description: 'Watch Google Drive videos online instantly without downloading. Paste your shared Google Drive video link and stream it directly in your browser.',
  alternates: {
    canonical: 'https://fluxplays.vercel.app/google-drive-video-player'
  }
};

export default function GoogleDrivePlayerPage() {
  return <Home />;
}
