import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { serverErrorTracker } from '@/app/utils/error-tracker.server';
import { validateApiAuth } from '@/lib/auth/apiAuth';
import { savedSongSchema } from '@/app/features/songs/dto/song-response.schema';
import { toSongsListView } from '@/app/features/songs/transformers/song-view.transformer';
import { songsListViewSchema } from '@/app/features/songs/dto/song-view.schema';
import { z } from 'zod';

// Songs directory - relative to project root
const SONGS_DIR = path.join(process.cwd(), '..', 'songs');

const GENERIC_ERRORS = {
  FETCH: 'Failed to fetch songs',
  SAVE: 'Failed to save song',
  VALIDATION: 'Invalid request data',
} as const;

// Schema for song.json files
const songFileSchema = z.object({
  artist: z.string(),
  title: z.string(),
  key: z.string().optional(),
  album: z.string().optional(),
  sections: z.array(z.any()),
});

function slugify(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

async function getAllSongs() {
  const songs: z.infer<typeof savedSongSchema>[] = [];

  try {
    const artists = await fs.readdir(SONGS_DIR);

    for (const artistDir of artists) {
      const artistPath = path.join(SONGS_DIR, artistDir);
      const stat = await fs.stat(artistPath);
      if (!stat.isDirectory()) continue;

      const songDirs = await fs.readdir(artistPath);

      for (const songDir of songDirs) {
        const songPath = path.join(artistPath, songDir, 'song.json');

        try {
          const content = await fs.readFile(songPath, 'utf-8');
          const songData = songFileSchema.parse(JSON.parse(content));
          const fileStat = await fs.stat(songPath);

          songs.push({
            artist: songData.artist,
            artistSlug: artistDir,
            title: songData.title,
            songSlug: songDir,
            key: songData.key ?? '',
            album: songData.album,
            hasChords: true,
            hasTab: false,
            updatedAt: fileStat.mtime.toISOString(),
          });
        } catch {
          // Skip invalid song files
        }
      }
    }
  } catch {
    // Songs dir doesn't exist or can't be read
  }

  return songs;
}

export async function GET(request: NextRequest) {
  const authResult = validateApiAuth(request);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  try {
    const songs = await getAllSongs();
    const viewData = toSongsListView(songs);
    return NextResponse.json(songsListViewSchema.parse(viewData));
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'get-songs',
    });
    return NextResponse.json({ error: GENERIC_ERRORS.FETCH }, { status: 500 });
  }
}

// POST expects a complete song object from the UG skill
const saveSongSchema = z.object({
  artist: z.string(),
  title: z.string(),
  key: z.string().optional(),
  album: z.string().optional(),
  originalKey: z.string().optional(),
  performer: z.string().optional(),
  capo: z.number().optional(),
  sections: z.array(z.any()),
  sourceUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authResult = validateApiAuth(request);
  if (!authResult.authorized) {
    return authResult.response!;
  }

  try {
    const body = await request.json();
    const validationResult = saveSongSchema.safeParse(body);

    if (!validationResult.success) {
      serverErrorTracker.captureApiError(
        new Error('Request validation failed'),
        {
          service: 'songs-api',
          operation: 'save-song',
          validationErrors: validationResult.error.flatten(),
        }
      );
      return NextResponse.json({ error: GENERIC_ERRORS.VALIDATION }, { status: 400 });
    }

    const song = validationResult.data;
    const artistSlug = slugify(song.artist);
    const songSlug = slugify(song.title);

    const songDir = path.join(SONGS_DIR, artistSlug, songSlug);
    await fs.mkdir(songDir, { recursive: true });

    const songPath = path.join(songDir, 'song.json');
    await fs.writeFile(songPath, JSON.stringify(song, null, 2));

    const now = new Date().toISOString();

    return NextResponse.json({
      artist: song.artist,
      artistSlug,
      title: song.title,
      songSlug,
      key: song.key ?? '',
      album: song.album,
      hasChords: true,
      hasTab: false,
      updatedAt: now,
    });
  } catch (err) {
    serverErrorTracker.captureApiError(err, {
      service: 'songs-api',
      operation: 'save-song',
    });
    return NextResponse.json({ error: GENERIC_ERRORS.SAVE }, { status: 500 });
  }
}
