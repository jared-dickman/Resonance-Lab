import { createHash } from 'crypto';

const API_BASE = 'https://api.ultimate-guitar.com/api/v1';
const USER_AGENT = 'UGT_ANDROID/4.11.1 (Pixel; 8.1.0)';

interface TabResult {
  id: number;
  song_name: string;
  artist_name: string;
  type: string;
  rating: number;
  votes: number;
}

interface SearchResult extends TabResult {
  tab_url: string;
  score: number;
}

interface SearchResponse {
  tabs: TabResult[];
}

/**
 * Slugify text for URL (lowercase, hyphens)
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Build tab URL from search result
 * Type mapping: "Chords" -> "chords", "Bass Tabs" -> "bass", etc.
 */
function buildTabUrl(tab: TabResult): string {
  const artist = slugify(tab.artist_name);
  const song = slugify(tab.song_name);

  // Map type to URL slug
  const typeMap: Record<string, string> = {
    'Chords': 'chords',
    'Tabs': 'tabs',
    'Bass Tabs': 'bass',
    'Ukulele Chords': 'ukulele',
  };
  const type = typeMap[tab.type] ?? 'chords';

  return `https://tabs.ultimate-guitar.com/tab/${artist}/${song}-${type}-${tab.id}`;
}

/**
 * Generate UG API authentication headers
 * API key = MD5(deviceID + UTC timestamp + "createLog()")
 */
function getAuthHeaders(): Record<string, string> {
  // Generate random 16-char hex device ID (consistent per session)
  const deviceId = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  // UTC timestamp: YYYY-MM-DD:H (hour NOT zero-padded per UG API spec)
  const now = new Date();
  const timestamp = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}:${now.getUTCHours()}`;

  // API key = MD5(deviceID + timestamp + "createLog()")
  const apiKey = createHash('md5')
    .update(deviceId + timestamp + 'createLog()')
    .digest('hex');

  return {
    'X-UG-CLIENT-ID': deviceId,
    'X-UG-API-KEY': apiKey,
    'User-Agent': USER_AGENT,
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
  };
}

/**
 * Search UG for tabs by artist and title
 * Returns results sorted by score (Rating × ln(Votes))
 */
export async function searchUG(
  artist: string,
  title: string,
  type: 'Chords' | 'Tabs' = 'Chords'
): Promise<SearchResult[]> {
  const query = `${artist} ${title}`.trim();
  const url = `${API_BASE}/tab/search?title=${encodeURIComponent(query)}&type[]=${type}&page=1`;

  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error(`UG API error: ${response.status}`);
  }

  const data = (await response.json()) as SearchResponse;

  // Filter: match artist, exclude Pro+ content (Official, Pro, Power)
  const artistLower = artist.toLowerCase();
  const FREE_TYPES = ['Chords', 'Tabs', 'Bass Tabs', 'Ukulele Chords'];

  const results: SearchResult[] = data.tabs
    .filter(tab => FREE_TYPES.includes(tab.type))
    .filter(tab => !artist || tab.artist_name.toLowerCase().includes(artistLower))
    .map(tab => ({
      ...tab,
      tab_url: buildTabUrl(tab),
      score: tab.votes > 0 ? tab.rating * Math.log(tab.votes) : tab.rating,
    }))
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get the best tab URL for a song
 * Uses rating × ln(votes) ranking to find highest quality tab
 */
export async function getBestTabUrl(
  artist: string,
  title: string,
  type: 'Chords' | 'Tabs' = 'Chords'
): Promise<string | null> {
  const results = await searchUG(artist, title, type);
  return results[0]?.tab_url ?? null;
}

/**
 * Get tab info by ID
 */
export async function getTabById(tabId: number): Promise<unknown> {
  const url = `${API_BASE}/tab/info?tab_id=${tabId}&tab_access_type=private`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error(`UG API error: ${response.status}`);
  }

  return response.json();
}
