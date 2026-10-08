'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PLAYLISTS, ARTISTS } from '@/data/mockData';
import { Track, Playlist } from '@/types/music';
import { fetchTrendingTracks, fetchRecommendations } from '@/services/api';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { SongRow } from '@/components/cards/SongRow';
import { DoodleCrown, DoodleStar, HandwrittenNote } from '@/components/doodles/Doodles';
import { Radio, Sparkles, Compass, Flame } from 'lucide-react';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';

export default function DiscoverPage() {
  const [freshDrops, setFreshDrops] = useState<Track[]>([]);
  const [viralRadar, setViralRadar] = useState<Track[]>([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState<Playlist[]>(PLAYLISTS);

  useEffect(() => {
    // Fetch live trending tracks
    fetchTrendingTracks().then((items) => {
      if (items && items.length > 0) {
        setFreshDrops(items.slice(0, 8));
        setViralRadar(items.slice(8, 16).length > 0 ? items.slice(8, 16) : items.slice(0, 8));
      }
    });

    // Fetch real recommendations to enrich playlist crates
    fetchRecommendations(20).then((recs) => {
      if (recs && recs.length > 5) {
        setCuratedPlaylists((prev) =>
          prev.map((pl, idx) => {
            const start = (idx * 4) % recs.length;
            const slice = recs.slice(start, start + 5);
            return {
              ...pl,
              tracks: slice.length > 0 ? slice : pl.tracks,
            };
          })
        );
      }
    });
  }, []);

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
            Fresh sonic radar, underground currents, and live YouTube Music crates.
          </p>
        </div>

        <HandwrittenNote
          text="100% REAL LIVE CURATION"
          color="#FFE229"
          rotation="-rotate-2"
          className="text-xs self-start md:self-auto"
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
                SEARCH →
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
            UPDATED HOURLY
          </span>
        </div>

        <div className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-0.5 no-scrollbar snap-x snap-mandatory">
          {curatedPlaylists.map((pl) => (
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

      {/* Grid: VIRAL RADAR & FRESH DROPS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (6 cols): VIRAL RADAR 🔥 */}
        <section className="lg:col-span-6 bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[26px] p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#111111]/15">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF8A3D] fill-[#FF8A3D]" />
              <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-[#111111]">
                VIRAL RADAR
              </h2>
            </div>
            <span className="font-mono text-[10px] font-black uppercase bg-[#FFE229] px-2 py-0.5 rounded border border-[#111111]">
              TOP CHARTS
            </span>
          </div>

          <div className="space-y-2">
            {viralRadar.length > 0 ? (
              viralRadar.map((track, idx) => (
                <SongRow
                  key={`viral-${track.id}`}
                  track={track}
                  index={idx}
                  playlistQueue={viralRadar}
                />
              ))
            ) : (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-[#F5F0E6] rounded-xl border-2 border-[#111111]/20 animate-pulse" />
              ))
            )}
          </div>
        </section>

        {/* Right (6 cols): FRESH DROPS ✦ */}
        <section className="lg:col-span-6 bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[26px] p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#111111]/15">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF5CA8]" />
              <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight text-[#111111]">
                FRESH DROPS
              </h2>
            </div>
            <span className="font-mono text-[10px] font-black uppercase bg-[#55D6BE] px-2 py-0.5 rounded border border-[#111111]">
              THIS WEEK
            </span>
          </div>

          <div className="space-y-2">
            {freshDrops.length > 0 ? (
              freshDrops.map((track, idx) => (
                <SongRow
                  key={`fresh-${track.id}`}
                  track={track}
                  index={idx}
                  playlistQueue={freshDrops}
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
    </div>
  );
}
