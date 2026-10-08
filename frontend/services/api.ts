import { Track, MoodConfig } from '@/types/music';
import { MOODS } from '@/data/mockData';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export function normalizeBackendTrack(raw: any, index: number = 0): Track {
  if (!raw) {
    return {
      id: `track-${index}`,
      title: 'Unknown Track',
      artist: 'Unknown Artist',
      artistId: 'unknown',
      album: 'Single',
      duration: 180,
      durationFormatted: '3:00',
      accentColor: '#FF5CA8',
      illustration: 'vinyl',
      mood: 'mainchar',
      bpm: 120,
      playCount: '1.0M',
      thumbnailUrl: '',
      synthWave: 'sawtooth',
      freqKey: 261.63,
    };
  }

  const id = raw.youtube_video_id || raw.youtubeVideoId || raw.id || `track-${index}`;
  const videoId = raw.youtube_video_id || raw.youtubeVideoId || (raw.id && !raw.id.includes('-') && raw.id.length === 11 ? raw.id : undefined);

  let artistName = 'Unknown Artist';
  let artistId = 'unknown';
  if (typeof raw.artist === 'object' && raw.artist !== null) {
    artistName = raw.artist.name || 'Unknown Artist';
    artistId = raw.artist.id || raw.artist.provider_id || 'unknown';
  } else if (typeof raw.artist === 'string') {
    artistName = raw.artist;
    artistId = raw.artist.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  let albumTitle = 'Single';
  if (typeof raw.album === 'object' && raw.album !== null) {
    albumTitle = raw.album.title || 'Single';
  } else if (typeof raw.album === 'string') {
    albumTitle = raw.album;
  }

  const durationSec = raw.duration_seconds || raw.duration || 180;
  let formatted = raw.durationFormatted;
  if (!formatted) {
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const thumb = raw.thumbnail_url || raw.thumbnailUrl || '';

  return {
    id: String(id),
    title: raw.title || 'Unknown Title',
    artist: artistName,
    artistId: String(artistId),
    album: albumTitle,
    duration: durationSec,
    durationFormatted: formatted,
    accentColor: raw.accentColor || raw.accent_color || '#FF5CA8',
    illustration: raw.illustration || 'vinyl',
    mood: raw.mood || 'mainchar',
    bpm: raw.bpm || 120,
    playCount: raw.playCount || raw.play_count_formatted || '1.5M',
    thumbnailUrl: thumb,
    youtubeId: videoId || id,
    synthWave: 'sawtooth',
    freqKey: 261.63,
  };
}

export async function fetchTrendingTracks(): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/music/trending/`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((item: any, i: number) => normalizeBackendTrack(item, i));
    }
  } catch (err) {
    console.warn('Failed to fetch trending from backend:', err);
  }
  return [];
}

export async function fetchHomeFeed(): Promise<{
  greeting: string;
  banner: any;
  trending: Track[];
  quickPicks: Track[];
  moods: MoodConfig[];
}> {
  try {
    const res = await fetch(`${API_BASE}/home/`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      const data = json.data;
      const trending = Array.isArray(data.trending)
        ? data.trending.map((t: any, i: number) => normalizeBackendTrack(t, i))
        : [];
      const quickPicks = Array.isArray(data.quickPicks)
        ? data.quickPicks.map((t: any, i: number) => normalizeBackendTrack(t, i))
        : [];
      const moods = Array.isArray(data.moods)
        ? data.moods.map((m: any) => ({
            id: m.slug,
            title: m.title,
            subtitle: m.subtitle || 'feel the sound',
            accentColor: m.accentColor || '#55D6BE',
            bgClass: m.bgClass || 'bg-[#55D6BE]',
            rotation: m.rotation || 'rotate-0',
            description: m.description || '',
            illustration: m.illustration || 'chill',
          }))
        : MOODS;

      return {
        greeting: data.greeting || 'WELCOME TO VYBE',
        banner: data.banner || null,
        trending,
        quickPicks,
        moods: moods.length > 0 ? moods : MOODS,
      };
    }
  } catch (err) {
    console.warn('Home feed fetch error:', err);
  }

  return {
    greeting: 'WELCOME TO VYBE',
    banner: null,
    trending: [],
    quickPicks: [],
    moods: MOODS,
  };
}

export async function fetchRecommendations(limit: number = 10): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/music/recommendations/?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((t: any, i: number) => normalizeBackendTrack(t, i));
    }
  } catch (err) {
    console.warn('Failed to fetch recommendations:', err);
  }
  return [];
}

export async function searchTracks(query: string, filterType: string = 'songs'): Promise<Track[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_BASE}/music/search/?q=${encodeURIComponent(query)}&filter=${filterType}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && json.data && Array.isArray(json.data.results)) {
      return json.data.results.map((item: any, i: number) => normalizeBackendTrack(item, i));
    }
  } catch (err) {
    console.warn('Backend search error:', err);
  }
  return [];
}

export async function fetchMoodSongs(moodSlug: string): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/music/moods/${moodSlug}/songs/`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((item: any, i: number) => normalizeBackendTrack(item, i));
    }
  } catch (err) {
    console.warn(`Failed to fetch mood tracks for ${moodSlug}:`, err);
  }
  return [];
}

export async function fetchMoods(): Promise<MoodConfig[]> {
  try {
    const res = await fetch(`${API_BASE}/music/moods/`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((m: any) => ({
        id: m.slug,
        title: m.title,
        subtitle: m.subtitle || '',
        accentColor: m.accentColor || '#55D6BE',
        bgClass: m.bgClass || 'bg-[#55D6BE]',
        rotation: m.rotation || 'rotate-0',
        description: m.description || '',
        illustration: m.illustration || 'chill',
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch moods from backend:', err);
  }
  return MOODS;
}

export async function generateAiDjCrate(prompt: string, mood?: string): Promise<{
  commentary: string;
  detectedMood: string;
  accentColor: string;
  tracks: Track[];
}> {
  try {
    const res = await fetch(`${API_BASE}/ai/dj/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mood }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      const tracks = (json.data.crate || []).map((t: any, i: number) => normalizeBackendTrack(t, i));
      return {
        commentary: json.data.commentary || "Dropping the freshest frequency for your headspace.",
        detectedMood: json.data.detected_mood || 'lockin',
        accentColor: json.data.accent_color || '#FFE229',
        tracks,
      };
    }
  } catch (err) {
    console.warn('AI DJ backend failed:', err);
  }
  return {
    commentary: "Locked into the wavelength! Loading fresh crate...",
    detectedMood: mood || 'lockin',
    accentColor: '#FFE229',
    tracks: [],
  };
}
