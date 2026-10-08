'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ARTISTS } from '@/data/mockData';
import { Track } from '@/types/music';
import { searchTracks } from '@/services/api';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { SongRow } from '@/components/cards/SongRow';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';
import { DoodleCrown, DoodleStar, HandwrittenNote } from '@/components/doodles/Doodles';
import { Play, UserPlus, Check, ArrowLeft, Disc } from 'lucide-react';

export default function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { playTrack } = useMusicPlayer();
  const [following, setFollowing] = useState(false);

  const artist =
    ARTISTS.find((a) => a.id === id) ||
    ARTISTS[0];

  const [displayTracks, setDisplayTracks] = useState<Track[]>(artist.topTracks || []);

  useEffect(() => {
    searchTracks(artist.name, 'songs').then((results) => {
      if (results && results.length > 0) {
        setDisplayTracks(results);
      }
    });
  }, [artist.name]);

  const handlePlayArtist = () => {
    if (displayTracks.length > 0) {
      playTrack(displayTracks[0], displayTracks);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/discover"
          className="inline-flex items-center gap-2 font-display font-black text-xs md:text-sm uppercase tracking-wider text-[#111111] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          <span>BACK TO DISCOVERY</span>
        </Link>

        <HandwrittenNote
          text="OFFICIAL ARTIST PROFILE"
          color="#FF5CA8"
          rotation="rotate-2"
          className="text-xs"
        />
      </div>

      {/* Artist Hero Banner */}
      <div className="relative p-4 sm:p-6 md:p-8 rounded-[24px] sm:rounded-[32px] bg-[#FFFDF9] border-[3px] sm:border-[3.5px] border-[#111111] shadow-brutal-md sm:shadow-brutal-lg flex flex-col md:flex-row items-center md:items-center gap-5 sm:gap-6 md:gap-8">
        {/* Avatar */}
        <div
          className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-[3px] sm:border-[4px] border-[#111111] shadow-brutal-sm sm:shadow-brutal-md flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ backgroundColor: artist.avatarColor }}
        >
          <TrackArtwork
            type={artist.illustration}
            color={artist.avatarColor}
            className="w-full h-full scale-105"
          />
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 sm:mb-2">
            <span className="font-mono text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full bg-[#111111] text-white">
              VERIFIED ARTIST
            </span>
            <DoodleCrown className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFE229]" />
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl md:text-6xl uppercase tracking-tight text-[#111111] leading-none">
            {artist.name}
          </h1>

          <p className="font-mono text-xs md:text-sm font-black text-[#111111]/80 mt-1.5 sm:mt-2">
            {artist.monthlyListeners} MONTHLY LISTENERS
          </p>

          <p className="font-sans font-bold text-xs md:text-sm text-[#111111]/70 mt-2 sm:mt-3 max-w-xl">
            {artist.bio}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
            {artist.genres.map((g) => (
              <span
                key={g}
                className="font-mono text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#F5F0E6] rounded-md border border-[#111111]"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 mt-5 sm:mt-6 w-full sm:w-auto">
            <button
              onClick={handlePlayArtist}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-[2.5px] sm:border-[3px] border-[#111111] bg-[#FFE229] font-display font-black text-xs md:text-sm uppercase tracking-wider shadow-brutal-xs sm:shadow-brutal-sm hover:bg-[#FFE229]/90 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#111111]" />
              <span>PLAY ARTIST</span>
            </button>

            <button
              onClick={() => setFollowing(!following)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-[2px] sm:border-[2.5px] border-[#111111] font-display font-black text-xs md:text-sm uppercase tracking-wider transition-all ${
                following
                  ? 'bg-[#55D6BE] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white shadow-[2px_2px_0px_#111111] sm:shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#FF5CA8] hover:text-white'
              }`}
            >
              {following ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>FOLLOWING</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>FOLLOW</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      <section className="bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[28px] p-5 md:p-6">
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#111111]/20">
          <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-[#111111] flex items-center gap-2">
            <span>POPULAR TRACKS</span>
            <DoodleStar className="w-5 h-5 fill-[#FFE229]" />
          </h2>
        </div>

        <div className="space-y-2">
          {displayTracks.length > 0 ? (
            displayTracks.map((track, idx) => (
              <SongRow
                key={track.id}
                track={track}
                index={idx}
                playlistQueue={displayTracks}
              />
            ))
          ) : (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-[#F5F0E6] rounded-xl border-2 border-[#111111]/20 animate-pulse" />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
