'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { PLAYLISTS } from '@/data/mockData';
import { Track } from '@/types/music';
import { searchTracks, fetchMoodSongs } from '@/services/api';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { SongRow } from '@/components/cards/SongRow';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';
import { DoodleCrown, DoodleStar, HandwrittenNote } from '@/components/doodles/Doodles';
import { Play, Shuffle, Download, Check, ArrowLeft, Heart } from 'lucide-react';

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { playTrack, toggleShuffle, userPlaylists } = useMusicPlayer();

  const [isSaved, setIsSaved] = useState(false);

  // Find playlist from mock or user created playlists
  const playlist =
    userPlaylists.find((p) => p.id === id) ||
    PLAYLISTS.find((p) => p.id === id) ||
    PLAYLISTS[0];

  const [tracks, setTracks] = useState<Track[]>(playlist.tracks || []);

  useEffect(() => {
    // If it's a mood playlist, fetch mood songs, otherwise search playlist title
    const titleLower = playlist.title.toLowerCase();
    const moodSlugs = ['chill', 'workout', 'sad', 'focus', 'party'];
    const matchedMood = moodSlugs.find((m) => titleLower.includes(m));

    if (matchedMood) {
      fetchMoodSongs(matchedMood).then((res) => {
        if (res && res.length > 0) setTracks(res);
      });
    } else {
      searchTracks(playlist.title, 'songs').then((res) => {
        if (res && res.length > 0) setTracks(res);
      });
    }
  }, [id, playlist.title]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const handleShufflePlay = () => {
    toggleShuffle();
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[randomIndex], tracks);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 font-display font-black text-xs md:text-sm uppercase tracking-wider text-[#111111] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK TO LIBRARY</span>
        </Link>

        <HandwrittenNote
          text="VERIFIED VYBE PLAYLIST"
          color="#FFE229"
          rotation="-rotate-2"
          className="text-xs"
        />
      </div>

      {/* Hero Header: Large Playlist Artwork + Meta + Buttons */}
      <div className="relative p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[32px] bg-[#FFFDF9] border-[3px] sm:border-[3.5px] border-[#111111] shadow-brutal-md sm:shadow-brutal-lg flex flex-col md:flex-row items-center md:items-end gap-5 sm:gap-6 md:gap-8">
        {/* Large Artwork */}
        <div
          className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-[20px] sm:rounded-[24px] border-[3px] sm:border-[3.5px] border-[#111111] shadow-brutal-sm sm:shadow-brutal-md flex items-center justify-center p-2.5 sm:p-3 flex-shrink-0"
          style={{ backgroundColor: playlist.accentColor }}
        >
          <TrackArtwork
            type={playlist.illustration}
            color={playlist.accentColor}
            className="w-full h-full scale-105"
          />
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 sm:mb-2">
            <span className="font-mono text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full bg-[#111111] text-white">
              PLAYLIST
            </span>
            <DoodleCrown className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE229]" />
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#111111] leading-none">
            {playlist.title}
          </h1>

          <p className="font-sans font-bold text-xs sm:text-sm md:text-base text-[#111111]/80 mt-1.5 sm:mt-2 max-w-xl">
            {playlist.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 font-mono text-[11px] sm:text-xs font-black text-[#111111]/70 mt-2 sm:mt-3">
            <span>By {playlist.author}</span>
            <span>•</span>
            <span>{playlist.trackCount} songs</span>
            <span>•</span>
            <span>{playlist.duration}</span>
          </div>

          {/* Action Buttons: PLAY, SHUFFLE, DOWNLOAD / SAVE */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mt-5 sm:mt-6">
            <button
              onClick={handlePlayAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-[2.5px] sm:border-[3px] border-[#111111] bg-[#FFE229] font-display font-black text-xs md:text-sm uppercase tracking-wider shadow-brutal-xs sm:shadow-brutal-sm hover:bg-[#FFE229]/90 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#111111]" />
              <span>PLAY</span>
            </button>

            <button
              onClick={handleShufflePlay}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-[2px] sm:border-[2.5px] border-[#111111] bg-white font-display font-black text-xs md:text-sm uppercase tracking-wider shadow-[2px_2px_0px_#111111] sm:shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#55D6BE] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span>SHUFFLE</span>
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-[2px] sm:border-[2.5px] border-[#111111] font-display font-black text-xs md:text-sm uppercase tracking-wider transition-all ${
                isSaved
                  ? 'bg-[#55D6BE] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white shadow-[2px_2px_0px_#111111] sm:shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#FF5CA8] hover:text-white'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>SAVED</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>SAVE / DOWNLOAD</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Song List */}
      <section className="bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[28px] p-5 md:p-6">
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#111111]/20 font-mono text-xs font-black uppercase text-[#111111]/60">
          <span># TITLE</span>
          <span className="hidden sm:inline">DURATION</span>
        </div>

        <div className="space-y-2">
          {tracks.length > 0 ? (
            tracks.map((track, idx) => (
              <SongRow
                key={`${track.id}-${idx}`}
                track={track}
                index={idx}
                playlistQueue={tracks}
              />
            ))
          ) : (
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-[#F5F0E6] rounded-xl border-2 border-[#111111]/20 animate-pulse" />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
