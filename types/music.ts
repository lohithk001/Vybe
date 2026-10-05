export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  duration: number; // in seconds
  durationFormatted: string; // '3:20'
  accentColor: string; // '#55D6BE'
  illustration: 'chill' | 'lockin' | 'mainchar' | 'unhinged' | 'vinyl' | 'cassette' | 'lofi' | 'retro';
  mood: 'chill' | 'lockin' | 'mainchar' | 'unhinged' | 'focus' | 'party' | 'sad' | 'workout';
  bpm: number;
  freqKey: number; // Synth base frequency Hz
  synthWave: 'sine' | 'triangle' | 'sawtooth' | 'square';
  lyrics?: string[];
  youtubeId?: string;
  playCount: string;
}

export interface Playlist {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  illustration: 'chill' | 'lockin' | 'mainchar' | 'unhinged' | 'vinyl' | 'cassette' | 'lofi' | 'retro';
  trackCount: number;
  duration: string;
  author: string;
  tracks: Track[];
  isCurated?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  monthlyListeners: string;
  avatarColor: string;
  illustration: 'chill' | 'mainchar' | 'lockin' | 'unhinged';
  bio: string;
  topTracks: Track[];
  genres: string[];
}

export interface MoodConfig {
  id: string;
  title: string;
  subtitle: string;
  accentColor: string;
  bgClass: string;
  rotation: string;
  description: string;
  illustration: 'chill' | 'lockin' | 'mainchar' | 'unhinged';
}
