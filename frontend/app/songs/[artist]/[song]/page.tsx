import { apiBaseUrl } from "@/lib/utils";
import { Song } from "@/lib/types";
import SongClient from "./SongClient";

async function getSong(artist: string, song: string): Promise<Song> {
  const url = `${apiBaseUrl()}/api/songs/${artist}/${song}`;
  const res = await fetch(url, {
    cache: "no-store",
    // Disable SSL verification in Node.js for self-signed certs during development
    // Remove this in production once Let's Encrypt cert is fully propagated
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch song: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.songJson;
}

interface SongPageProps {
  params: Promise<{
    artist: string
    song: string
  }>
}

export default async function SongPage({ params }: SongPageProps) {
  const { artist, song } = await params;
  const songData = await getSong(artist, song);

  if (!songData) {
    return <div>Song not found.</div>;
  }

  return <SongClient song={songData} />;
}