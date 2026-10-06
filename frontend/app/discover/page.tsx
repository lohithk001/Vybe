'use client';

import React from 'react';
import Link from 'next/link';
import { PLAYLISTS, ARTISTS, TRACKS } from '@/data/mockData';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { SongRow } from '@/components/cards/SongRow';
import { DoodleCrown, DoodleStar, HandwrittenNote } from '@/components/doodles/Doodles';
import { Radio, Sparkles, Compass } from 'lucide-react';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';

export default function DiscoverPage() {
  const genres = [
    { name: 'SYNTHWAVE', color: '#8E7CFF', tracks: '240k tracks' },
    { name: 'LO-FI BEATS', color: '#55D6BE', tracks: '580k tracks' },
    { name: 'HYPERPOP', color: '#FF5CA8', tracks: '190k tracks' },
    { name: 'INDIE ROCK', color: '#FFE229', tracks: '410k tracks' },
    { name: 'BOLLYWOOD', color: '#FF8A3D', tracks: '820k tracks' },
    { name: 'ALT-POP', color: '#6DB7FF', tracks: '630k tracks' },
  ];

  return (
    <div className="space-y-10 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-[3px] border-[#111111]/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight text-[#111111]">
              DISCOVER
            </h1>
            <Compass className="w-8 h-8 text-[#FF5CA8]" />
          </div>
          <p className="font-sans font-bold text-xs md:text-sm text-[#111111]/70 mt-1">
            Fresh sonic radar, underground currents, and community favorites.
          </p>
        </div>

        <HandwrittenNote
          text="100% FRESH CURATION"
          color="#FFE229"
          rotation="-rotate-2"
          className="self-start md:self-auto"
        />
      </div>

      {/* Genre Grid */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#111111]/70">
            BROWSE BY GENRE
          </span>
          <DoodleStar className="w-4 h-4 fill-[#FFE229]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {genres.map((g) => (
            <Link
              key={g.name}
              href={`/search?q=${encodeURIComponent(g.name)}`}
              className="p-4 rounded-2xl border-[3px] border-[#111111] shadow-[3.5px_3.5px_0px_#111111] hover:shadow-[5px_5px_0px_#111111] hover:-translate-y-1 active:translate-y-0.5 active:shadow-none transition-all flex flex-col justify-between h-28 group"
              style={{ backgroundColor: g.color }}
            >
              <h3 className="font-display font-black text-base md:text-lg uppercase text-[#111111] leading-tight group-hover:scale-105 transition-transform origin-left">
                {g.name}
              </h3>
              <span className="font-mono text-[10px] font-bold uppercase text-[#111111]/80">
                {g.tracks}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Heavy Rotations Playlist Carousel */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-[#111111]">
              HEAVY ROTATIONS
            </h2>
            <Radio className="w-6 h-6 text-[#111111]" />
          </div>
          <span className="font-mono text-xs font-bold text-[#111111]/70">
            UPDATED DAILY
          </span>
        </div>

        <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-0.5 no-scrollbar snap-x snap-mandatory">
          {PLAYLISTS.map((pl) => (
            <div key={pl.id} className="snap-start flex-shrink-0">
              <PlaylistCard playlist={pl} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="bg-[#FFFDF9] border-[3px] sm:border-[3.5px] border-[#111111] shadow-brutal-md sm:shadow-brutal-lg rounded-[22px] sm:rounded-[28px] p-4 sm:p-6">
        <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b-2 border-[#111111]/20">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-[#111111]">
              POPULAR ARTISTS
            </h2>
            <DoodleCrown className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111]" />
          </div>
          <span className="font-mono text-[10px] sm:text-xs font-black bg-[#FFE229] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#111111]">
            GLOBAL TOP 10
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {ARTISTS.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl border-2 border-transparent hover:border-[#111111] hover:bg-[#F5F0E6] transition-all"
            >
              <div
                className="w-20 h-20 rounded-full border-[3px] border-[#111111] shadow-[3px_3px_0px_#111111] overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 group-hover:rotate-2 transition-transform"
                style={{ backgroundColor: artist.avatarColor }}
              >
                <TrackArtwork
                  type={artist.illustration}
                  color={artist.avatarColor}
                  className="w-full h-full scale-105"
                />
              </div>
              <h3 className="font-display font-black text-sm text-[#111111] mt-2.5 group-hover:underline truncate max-w-full">
                {artist.name}
              </h3>
              <p className="font-mono text-[11px] text-[#111111]/70 mt-0.5">
                {artist.monthlyListeners}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Fresh Underground Drops */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-[#111111] flex items-center gap-2">
            <span>FRESH DROPS</span>
            <Sparkles className="w-5 h-5 text-[#FF5CA8]" />
          </h2>
          <span className="font-mono text-xs font-bold text-[#111111]/60">
            THIS WEEK
          </span>
        </div>

        <div className="space-y-2">
          {TRACKS.slice(6, 12).map((track, idx) => (
            <SongRow
              key={track.id}
              track={track}
              index={idx}
              playlistQueue={TRACKS.slice(6, 12)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
