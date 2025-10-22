import { apiBaseUrl } from "@/lib/utils";
import { Song } from "@/lib/types";
import SongClient from "./SongClient";

async function getSong(artist: string, song: string): Promise<Song> {
  try {
    const url = `${apiBaseUrl()}/api/songs/${artist}/${song}`;
    console.log('Fetching song from:', url);
    const res = await fetch(url, {
      cache: "no-store"
    });
    if (!res.ok) {
      console.error('API response not ok:', res.status, res.statusText);
      throw new Error(`Failed to fetch song: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.songJson;
  } catch (error) {
    console.error('Error fetching song:', error);
    throw error;
  }
}

interface SongPageProps {
  params: Promise<{
    artist: string
    song: string
  }>
}

export default async function SongPage({ params }: SongPageProps) {
  const { artist, song } = await params
  const songData = await getSong(artist, song);

  if (!songData) {
    return <div>Song not found.</div>;
  }

  return (
    <SongClient song={songData} />
  );
}