/**
 * MusicBrainz API integration for album metadata
 * Rate limit: 1 req/sec - caller must handle throttling
 */

const MB_API = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'JamiumMusicApp/1.0 (https://jamium.com)';

interface MBRecording {
  id: string;
  title: string;
  'artist-credit'?: Array<{ name: string }>;
  releases?: Array<{
    id: string;
    title: string;
    'release-group'?: {
      'primary-type'?: string;
      title: string;
    };
  }>;
}

interface MBResponse {
  recordings?: MBRecording[];
}

/**
 * Fetch album name from MusicBrainz for a given artist + title
 * Returns null if not found or on error (non-blocking)
 */
export async function fetchAlbum(
  artist: string,
  title: string
): Promise<string | null> {
  try {
    const query = `artist:"${artist}" AND recording:"${title}"`;
    const url = `${MB_API}/recording?query=${encodeURIComponent(query)}&fmt=json&limit=5`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`MusicBrainz API error: ${response.status}`);
      return null;
    }

    const data = (await response.json()) as MBResponse;

    // Find first recording with an Album release (not Single, EP, etc.)
    for (const recording of data.recordings ?? []) {
      for (const release of recording.releases ?? []) {
        const releaseGroup = release['release-group'];
        if (releaseGroup?.['primary-type'] === 'Album') {
          return releaseGroup.title;
        }
      }
    }

    // Fallback: return first release title if no Album type found
    const firstRelease = data.recordings?.[0]?.releases?.[0];
    return firstRelease?.['release-group']?.title ?? firstRelease?.title ?? null;
  } catch (err) {
    console.warn('MusicBrainz fetch failed:', err);
    return null;
  }
}
