'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Track, Playlist } from '@/types/music';
import { PLAYLISTS } from '@/data/mockData';
import { fetchTrendingTracks } from '@/services/api';
import confetti from 'canvas-confetti';

interface MusicPlayerContextType {
  currentTrack: Track;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  queue: Track[];
  history: Track[];
  likedTrackIds: string[];
  likedTracks: Track[];
  userPlaylists: Playlist[];
  isNowPlayingOpen: boolean;
  lyricsOpen: boolean;
  activeMood: string | null;
  audioFrequencyData: number[]; // 16 frequency bands for visualizers

  // Controls
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (trackId: string, trackObj?: Track) => void;
  isLiked: (trackId: string) => boolean;
  setIsNowPlayingOpen: (open: boolean) => void;
  toggleLyrics: () => void;
  setActiveMood: (mood: string | null) => void;
  createPlaylist: (title: string, description: string) => Playlist;
  addTrackToPlaylist: (trackId: string, playlistId: string) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

const DEFAULT_TRACK: Track = {
  id: '',
  title: 'Select a Track',
  artist: 'VYBE Radio',
  artistId: 'vybe',
  album: 'Live Stream',
  duration: 180,
  durationFormatted: '3:00',
  accentColor: '#FF5CA8',
  illustration: 'vinyl',
  mood: 'mainchar',
  bpm: 120,
  playCount: '0',
  thumbnailUrl: '',
};

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track>(DEFAULT_TRACK);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>(PLAYLISTS);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [lyricsOpen, setLyricsOpen] = useState<boolean>(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [audioFrequencyData, setAudioFrequencyData] = useState<number[]>(Array(16).fill(20));

  // Initialize queue dynamically from backend real trending songs
  useEffect(() => {
    fetchTrendingTracks().then((tracks) => {
      if (tracks && tracks.length > 0) {
        setQueue(tracks);
        setCurrentTrack((curr) => (!curr || !curr.id ? tracks[0] : curr));
        setDuration((d) => (d === 0 || d === 180 ? tracks[0].duration : d));
      }
    });
  }, []);

  // Audio synthesis nodes & YouTube Player
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const noteIndexRef = useRef<number>(0);
  const ytPlayerRef = useRef<any>(null);

  // Initialize YouTube Iframe Player
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically create an isolated container outside of React JSX reconciliation
    let container = document.getElementById('vybe-yt-audio-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'vybe-yt-audio-container';
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
      const playerDiv = document.createElement('div');
      playerDiv.id = 'vybe-youtube-audio-player';
      container.appendChild(playerDiv);
      document.body.appendChild(container);
    }

    const setupPlayer = () => {
      if ((window as any).YT && (window as any).YT.Player) {
        try {
          if (!ytPlayerRef.current) {
            ytPlayerRef.current = new (window as any).YT.Player('vybe-youtube-audio-player', {
              height: '1',
              width: '1',
              videoId: currentTrack.youtubeId || '1a3REFH83WA',
              playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
              },
              events: {
                onReady: (e: any) => {
                  try {
                    e.target.setVolume(volume * 100);
                  } catch {}
                },
                onStateChange: (e: any) => {
                  // 0 = YT.PlayerState.ENDED
                  if (e.data === 0) {
                    nextTrack();
                  }
                },
              },
            });
          }
        } catch (e) {
          console.warn('YT player error:', e);
        }
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      (window as any).onYouTubeIframeAPIReady = setupPlayer;
      document.head.appendChild(tag);
    } else {
      setupPlayer();
    }
  }, []);

  // Initialize Web Audio Synth safely on user interaction
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const gain = ctx.createGain();
        gain.gain.value = isMuted ? 0 : volume * 0.15; // Pleasant listening volume
        gain.connect(ctx.destination);
        audioCtxRef.current = ctx;
        masterGainRef.current = gain;
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, [isMuted, volume]);

  // Real Synthesizer chord/beat sequence for track fallback
  const triggerTone = useCallback(() => {
    if (!audioCtxRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const now = ctx.currentTime;
      const baseFreq = currentTrack.freqKey || 261.63;
      // Arpeggiate in key
      const intervals = [1, 1.25, 1.5, 1.75, 1.5, 1.25, 1, 0.75];
      const step = intervals[noteIndexRef.current % intervals.length];
      noteIndexRef.current += 1;

      // Primary synth oscillator
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

      osc.type = currentTrack.synthWave || 'sine';
      osc.frequency.setValueAtTime(baseFreq * step, now);

      noteGain.gain.setValueAtTime(0.01, now);
      noteGain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGainRef.current);

      osc.start(now);
      osc.stop(now + 0.4);

      // Sub-bass thump for rhythm
      if (noteIndexRef.current % 2 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(baseFreq * 0.5, now);
        bassGain.gain.setValueAtTime(0.25, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        bassOsc.connect(bassGain);
        bassGain.connect(masterGainRef.current);
        bassOsc.start(now);
        bassOsc.stop(now + 0.26);
      }
    } catch {
      // Audio synth safety catch
    }
  }, [currentTrack]);

  // Frequency wave visualizer generator
  useEffect(() => {
    let active = true;
    const updateFreqs = () => {
      if (!active) return;
      if (isPlaying) {
        setAudioFrequencyData(() => {
          return Array.from({ length: 16 }, (_, i) => {
            const base = 25 + Math.sin(Date.now() / 200 + i) * 20;
            const variance = Math.random() * 55;
            return Math.min(100, Math.max(15, base + variance));
          });
        });
      } else {
        setAudioFrequencyData(Array(16).fill(15));
      }
      animFrameRef.current = requestAnimationFrame(updateFreqs);
    };

    animFrameRef.current = requestAnimationFrame(updateFreqs);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Handle Playback Interval & Synth loop
  useEffect(() => {
    if (isPlaying) {
      if (!currentTrack.youtubeId) {
        initAudio();
        const intervalMs = Math.max(180, Math.round(60000 / (currentTrack.bpm * 2)));

        synthTimerRef.current = setInterval(() => {
          triggerTone();
        }, intervalMs);
      }

      progressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (currentTrack.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
            try {
              const cur = Math.floor(ytPlayerRef.current.getCurrentTime());
              if (cur >= duration && duration > 0) {
                nextTrack();
                return 0;
              }
              if (cur > 0) return cur;
            } catch {}
          }

          if (prev >= duration) {
            nextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }

    return () => {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentTrack, duration, initAudio, triggerTone]);

  // Volume update
  const setVolume = (level: number) => {
    setVolumeState(level);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try { ytPlayerRef.current.setVolume(level * 100); } catch {}
    }
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : level * 0.15, audioCtxRef.current.currentTime);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (ytPlayerRef.current) {
        try {
          if (next) ytPlayerRef.current.mute();
          else ytPlayerRef.current.unMute();
        } catch {}
      }
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(next ? 0 : volume * 0.15, audioCtxRef.current.currentTime);
      }
      return next;
    });
  };

  // Play track
  const playTrack = (track: Track, newQueue?: Track[]) => {
    setCurrentTrack(track);
    setHistory((prev) => [track, ...prev.filter((t) => t.id !== track.id)].slice(0, 50));
    setDuration(track.duration);
    setProgress(0);
    setIsPlaying(true);
    if (newQueue) {
      setQueue(newQueue);
    }

    if (track.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(track.youtubeId);
        ytPlayerRef.current.playVideo();
      } catch (err) {
        console.warn('Failed to load video into YT player:', err);
      }
    } else {
      initAudio();
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (currentTrack.youtubeId && ytPlayerRef.current) {
        try {
          if (next && typeof ytPlayerRef.current.playVideo === 'function') {
            ytPlayerRef.current.playVideo();
          } else if (!next && typeof ytPlayerRef.current.pauseVideo === 'function') {
            ytPlayerRef.current.pauseVideo();
          }
        } catch {}
      } else {
        initAudio();
      }
      return next;
    });
  };

  const pause = () => {
    setIsPlaying(false);
    if (currentTrack.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try { ytPlayerRef.current.pauseVideo(); } catch {}
    }
  };

  const resume = () => {
    setIsPlaying(true);
    if (currentTrack.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try { ytPlayerRef.current.playVideo(); } catch {}
    } else {
      initAudio();
    }
  };

  const nextTrack = () => {
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (currentIndex < queue.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (isRepeat) {
      nextIndex = 0;
    }
    const nextT = queue[nextIndex] || queue[0];
    playTrack(nextT);
  };

  const prevTrack = () => {
    if (progress > 3) {
      seek(0);
      return;
    }
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    playTrack(queue[prevIndex]);
  };

  const seek = (seconds: number) => {
    const s = Math.min(duration, Math.max(0, seconds));
    setProgress(s);
    if (currentTrack.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(s, true); } catch {}
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);
  const toggleRepeat = () => setIsRepeat((prev) => !prev);

  // Like track with particle confetti burst
  const toggleLike = (trackId: string, trackObj?: Track) => {
    setLikedTrackIds((prev) => {
      const isAlreadyLiked = prev.includes(trackId);
      if (!isAlreadyLiked) {
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#FF5CA8', '#FFE229', '#55D6BE', '#8E7CFF'],
          });
        } catch {
          // confetti fallback
        }
        const target =
          trackObj ||
          queue.find((t) => t.id === trackId) ||
          (currentTrack.id === trackId ? currentTrack : null);

        if (target) {
          setLikedTracks((curr) => [...curr.filter((t) => t.id !== trackId), target]);
        }
        return [...prev, trackId];
      } else {
        setLikedTracks((curr) => curr.filter((t) => t.id !== trackId));
        return prev.filter((id) => id !== trackId);
      }
    });
  };

  const isLiked = (trackId: string) => likedTrackIds.includes(trackId);

  const toggleLyrics = () => setLyricsOpen((prev) => !prev);

  // Add track to playlist
  const addTrackToPlaylist = (trackId: string, playlistId: string) => {
    const track =
      queue.find((t) => t.id === trackId) ||
      (currentTrack.id === trackId ? currentTrack : null);
    if (!track) return;

    setUserPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          if (pl.tracks.some((t) => t.id === trackId)) return pl;
          return {
            ...pl,
            trackCount: pl.trackCount + 1,
            tracks: [track, ...pl.tracks],
          };
        }
        return pl;
      })
    );
  };

  // Create new playlist
  const createPlaylist = (title: string, description: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      title: title || 'My New Vibe',
      subtitle: `0 songs • by you`,
      description: description || 'Curated beats for good moments',
      accentColor: '#55D6BE',
      illustration: 'vinyl',
      trackCount: 0,
      duration: '0m',
      author: 'Lohith',
      tracks: [],
      isCurated: false,
    };
    setUserPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        queue,
        history,
        likedTrackIds,
        likedTracks,
        userPlaylists,
        isNowPlayingOpen,
        lyricsOpen,
        activeMood,
        audioFrequencyData,
        playTrack,
        togglePlay,
        pause,
        resume,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        isLiked,
        setIsNowPlayingOpen,
        toggleLyrics,
        setActiveMood,
        createPlaylist,
        addTrackToPlaylist,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}
