import ArtistClient from '@/app/songs/[artist]/ArtistClient';

interface ArtistPageProps {
  params: Promise<{
    artist: string;
  }>;
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { artist } = await params;
  return <ArtistClient artistSlug={artist} />;
}
