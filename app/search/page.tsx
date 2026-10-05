'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Flame, Music, Users, Disc, ListMusic } from 'lucide-react';
import { TRACKS, PLAYLISTS, ARTISTS } from '@/data/mockData';
import { SongRow } from '@/components/cards/SongRow';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { DoodleSparkle } from '@/components/doodles/Doodles';
import Link from 'next/link';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') || 'trending';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'trending' | 'songs' | 'artists' | 'albums' | 'playlists'>(
    initialTab as 'trending' | 'songs' | 'artists' | 'albums' | 'playlists'
  );

  const trendingSearches = [
    'The Weeknd',
    'Arijit Singh',
    'Taylor Swift',
    'Drake',
    'Lo-fi',
    'Frank Ocean',
    'Shaboozey',
    'Sabrina Carpenter',
  ];

  const filteredTracks = useMemo(() => {
    if (!query.trim()) return TRACKS;
    const q = query.toLowerCase();
    return TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredPlaylists = useMemo(() => {
    if (!query.trim()) return PLAYLISTS;
    const q = query.toLowerCase();
    return PLAYLISTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const filteredArtists = useMemo(() => {
    if (!query.trim()) return ARTISTS;
    const q = query.toLowerCase();
    return ARTISTS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    );
  }, [query]);

  const tabs = [
    { id: 'trending', label: 'Trending', icon: Flame, color: '#FFE229' },
    { id: 'songs', label: 'Songs', icon: Music, color: '#FF5CA8' },
    { id: 'artists', label: 'Artists', icon: Users, color: '#55D6BE' },
    { id: 'albums', label: 'Albums', icon: Disc, color: '#8E7CFF' },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, color: '#FF8A3D' },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b-[3px] border-[#111111]/20">
        <div>
          <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight text-[#111111]">
            SEARCH
          </h1>
          <p className="font-sans font-bold text-xs md:text-sm text-[#111111]/70 mt-1">
            Find your favorite beats, artists, and playlists.
          </p>
        </div>
        <DoodleSparkle className="w-8 h-8 text-[#111111]" />
      </div>

      {/* Big Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#111111]/70" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Songs, artists, albums..."
          className="w-full bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[20px] pl-14 pr-5 py-4 font-sans font-bold text-base md:text-lg text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:shadow-brutal-lg transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-black uppercase px-2 py-1 bg-[#111111] text-white rounded-lg hover:bg-[#FF5CA8] transition-colors"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-[2.5px] font-display font-black text-xs md:text-sm uppercase tracking-wider transition-all flex-shrink-0 ${
                isActive
                  ? 'border-[#111111] shadow-[3px_3px_0px_#111111] translate-y-[-2px]'
                  : 'border-transparent bg-white/70 hover:border-[#111111] text-[#111111]/70 hover:text-[#111111]'
              }`}
              style={{ backgroundColor: isActive ? tab.color : undefined }}
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Trending Search Pills */}
      <div>
        <span className="font-mono text-xs font-black uppercase text-[#111111]/60 block mb-2">
          TRENDING SEARCHES:
        </span>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                setActiveTab('songs');
              }}
              className="px-3 py-1.5 rounded-full bg-[#FFFDF9] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-sans font-bold text-xs text-[#111111] hover:bg-[#FFE229] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Display */}
      <div className="pt-2">
        {activeTab === 'artists' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="group p-4 bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-sm hover:shadow-brutal rounded-2xl flex items-center gap-3.5 transition-all"
              >
                <div
                  className="w-14 h-14 rounded-full border-[2.5px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-display font-black text-xl text-[#111111] flex-shrink-0"
                  style={{ backgroundColor: artist.avatarColor }}
                >
                  {artist.name[0]}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-black text-base truncate text-[#111111] group-hover:underline">
                    {artist.name}
                  </h3>
                  <p className="font-mono text-xs text-[#111111]/70">
                    {artist.monthlyListeners} listeners
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : activeTab === 'playlists' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} layout="compact" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className="font-mono text-xs font-black uppercase text-[#111111]/70">
                  {query ? `${filteredTracks.length} TRACKS FOUND` : 'TRENDING NOW 🔥'}
                </span>
                {!query && (
                  <span className="font-mono text-xs font-bold text-[#111111] underline">
                    SEE ALL →
                  </span>
                )}
              </div>
              {filteredTracks.slice(0, query ? 20 : 5).map((track, idx) => (
                <SongRow
                  key={track.id}
                  track={track}
                  index={idx}
                  playlistQueue={filteredTracks}
                />
              ))}
            </div>

            {/* Popular Artists Horizontal Pill Row (Matching Reference Screen) */}
            {!query && (
              <div className="pt-2">
                <span className="font-mono text-xs font-black uppercase text-[#111111]/70 block mb-3">
                  POPULAR ARTISTS
                </span>
                <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {ARTISTS.map((artist) => (
                    <Link
                      key={artist.id}
                      href={`/artist/${artist.id}`}
                      className="group flex flex-col items-center text-center flex-shrink-0"
                    >
                      <div
                        className="w-16 h-16 rounded-full border-[2.5px] border-[#111111] shadow-[2.5px_2.5px_0px_#111111] flex items-center justify-center font-display font-black text-xl text-[#111111] group-hover:scale-105 active:scale-95 transition-transform"
                        style={{ backgroundColor: artist.avatarColor }}
                      >
                        {artist.name[0]}
                      </div>
                      <span className="font-display font-black text-xs text-[#111111] mt-1.5 truncate max-w-[76px] group-hover:underline">
                        {artist.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="font-display font-black p-8 text-xl">Loading Search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
