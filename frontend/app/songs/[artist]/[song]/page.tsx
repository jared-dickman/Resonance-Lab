'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiBaseUrl } from "@/lib/utils";
import { Song } from "@/lib/types";
import SongClient from "./SongClient";

export default function SongPage() {
  const params = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const artist = params.artist as string;
  const songSlug = params.song as string;

  useEffect(() => {
    async function fetchSong() {
      try {
        const url = `${apiBaseUrl()}/api/songs/${artist}/${songSlug}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to fetch song: ${res.status}`);
        }
        const data = await res.json();
        setSong(data.songJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load song');
      } finally {
        setLoading(false);
      }
    }
    fetchSong();
  }, [artist, songSlug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!song) return <div>Song not found.</div>;

  return <SongClient song={song} />;
}