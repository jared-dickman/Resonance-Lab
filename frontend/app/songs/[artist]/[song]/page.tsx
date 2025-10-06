
import { SongControls } from "@/components/SongControls";
import { apiBaseUrl } from "@/lib/utils";
import { Song } from "@/lib/types";

async function getSong(artist: string, song: string): Promise<Song> {
  const res = await fetch(`${apiBaseUrl()}/api/v1/songs/${artist}/${song}`);
  if (!res.ok) {
    throw new Error('Failed to fetch song');
  }
  const data = await res.json();
  return data.songJson;
}

export default async function SongPage({ params }: { params: { artist: string, song: string } }) {
  const song = await getSong(params.artist, params.song);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">{song.title}</h1>
      <h2 className="text-xl text-gray-500">{song.artist}</h2>
      <SongControls song={song} />
      <div className="mt-4">
        {song.sections.map((section, i) => (
          <div key={i} className="mt-4">
            <h3 className="text-lg font-semibold">{section.name}</h3>
            {section.lines.map((line, j) => (
              <div key={j} className="flex items-center">
                {line.chord && <div className="w-16 font-mono text-purple-400">{line.chord.name}</div>}
                <div>{line.lyric}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
