import { apiBaseUrl } from "@/lib/utils";
import { Song } from "@/lib/types";
import SongClient from "./SongClient";

async function getSong(artist: string, song: string): Promise<Song> {
  const res = await fetch(`${apiBaseUrl()}/api/songs/${artist}/${song}`);
  if (!res.ok) {
    throw new Error('Failed to fetch song');
  }
  const data = await res.json();
  // The actual song data is nested in the response
  return data.songJson;
}

export default async function SongPage({ params }: { params: { artist: string, song: string } }) {
  const songData = await getSong(params.artist, params.song);

  if (!songData) {
    return <div>Song not found.</div>;
  }

  return (
    <SongClient song={songData} />
  );
}