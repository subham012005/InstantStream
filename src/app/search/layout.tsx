import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search | FluxPlays',
  description: 'Search for articles, trends, and comparisons on FluxPlays.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
