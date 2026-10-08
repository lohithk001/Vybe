'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOODS, PLAYLISTS } from '@/data/mockData';
import { Track, MoodConfig } from '@/types/music';
import { fetchHomeFeed, fetchMoodSongs } from '@/services/api';
import { MoodCard } from '@/components/cards/MoodCard';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { SongRow } from '@/components/cards/SongRow';
import { AiDjSection } from '@/components/ai-dj/AiDjSection';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { HandwrittenNote, Sticker, DoodleSparkle, DoodleStar, DoodleSmiley, DoodleCrown } from '@/components/doodles/Doodles';
import { Sparkles, ArrowRight, Flame, Wand2, Zap, Play } from 'lucide-react';
import { DjMascot } from '@/components/doodles/OriginalIllustrations';

export default function HomePage() {
  const { playTrack } = useMusicPlayer();
  const [greeting, setGreeting] = useState<string>('WELCOME TO VYBE');
  const [banner, setBanner] = useState<any>(null);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [quickPicks, setQuickPicks] = useState<Track[]>([]);
  const [moods, setMoods] = useState<MoodConfig[]>(MOODS);
  const [showAllMoods, setShowAllMoods] = useState<boolean>(false);

  useEffect(() => {
    fetchHomeFeed().then((data) => {
      if (data) {
        if (data.greeting) setGreeting(data.greeting.toUpperCase());
        if (data.banner) setBanner(data.banner);
        if (data.trending && data.trending.length > 0) setTrendingTracks(data.trending);
        if (data.quickPicks && data.quickPicks.length > 0) setQuickPicks(data.quickPicks);
        if (data.moods && data.moods.length > 0) setMoods(data.moods);
      }
    });
  }, []);

  const handleTuneInBanner = async () => {
    if (banner?.actionTarget) {
      try {
        const tracks = await fetchMoodSongs(banner.actionTarget);
        if (tracks && tracks.length > 0) {
          playTrack(tracks[0], tracks);
        }
      } catch (err) {
        console.warn('Banner tune-in error:', err);
      }
    }
  };

  const displayedMoods = showAllMoods ? moods : moods.slice(0, 4);

  return (
    <div className="space-y-10 md:space-y-12">
      {/* Hero Section */}
      <section className="relative pt-2 pb-4">
        {/* Floating sticker badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vybe-logo.png"
              alt="VYBE"
              className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[2.5px_2.5px_0px_#111111]"
            />
          </Link>
          <Sticker color="#FFE229" rotation="-rotate-3">
            <span>{greeting}</span>
          </Sticker>
          <Sticker color="#FF5CA8" rotation="rotate-2">
            <span>✦ GEN-Z AUDIO OS</span>
          </Sticker>
          <Sticker color="#55D6BE" rotation="-rotate-1">
            <span>LIVE STREAMING</span>
          </Sticker>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight text-[#111111] leading-[0.92] drop-shadow-[2px_2px_0px_white]">
              WHAT ARE WE
              <br />
              <span className="text-[#111111] relative inline-block">
                FEELING TODAY?
                {/* Wobbly underline doodle */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#FF5CA8]"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 8C45 2 95 12 145 4C170 0 190 8 198 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="font-sans font-bold text-base md:text-xl text-[#111111]/80 mt-4 max-w-xl">
              Pick a vibe or search any artist. Real music on demand.
            </p>
          </div>

          {/* Quick AI DJ Teaser Box */}
          <Link
            href="/ai-dj"
            className="group flex items-center gap-3 p-3.5 rounded-2xl bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal hover:shadow-brutal-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all select-none self-start md:self-auto"
          >
            <DjMascot className="w-12 h-12 flex-shrink-0 group-hover:rotate-6 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5 font-display font-black text-xs uppercase text-[#8E7CFF]">
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI DJ STUDIO</span>
              </div>
              <p className="font-display font-black text-sm text-[#111111] leading-tight mt-0.5">
                Generate custom crates →
              </p>
            </div>
          </Link>
        </div>

        {/* Dynamic Curated Hero Banner if present */}
        {banner && (
          <div
            className="mt-6 p-4 md:p-5 rounded-[22px] border-[3.5px] border-[#111111] shadow-brutal-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none"
            style={{ backgroundColor: banner.accentColor || '#55D6BE' }}
          >
            <div className="flex items-center gap-3.5">
              <span className="font-mono text-xs font-black bg-[#111111] text-white px-2.5 py-1 rounded-md uppercase">
                {banner.badge || 'SPOTLIGHT'}
              </span>
              <div>
                <h3 className="font-display font-black text-lg md:text-xl uppercase text-[#111111]">
                  {banner.title}
                </h3>
                <p className="font-sans font-bold text-xs md:text-sm text-[#111111]/80">
                  {banner.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleTuneInBanner}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-[2.5px] border-[#111111] font-display font-black text-xs uppercase shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#FFE229] active:translate-y-0.5 transition-all"
            >
              <Play className="w-4 h-4 fill-[#111111]" />
              <span>TUNE IN NOW</span>
            </button>
          </div>
        )}

        {/* Mood Crates Grid */}
        <div className="mt-6 md:mt-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#111111]/70">
              EXPLORE MOOD CRATES
            </span>
            <button
              onClick={() => setShowAllMoods((prev) => !prev)}
              className="font-mono text-xs font-bold uppercase underline text-[#111111] hover:text-[#FF5CA8]"
            >
              {showAllMoods ? 'SHOW FEWER' : `VIEW ALL (${moods.length}) →`}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {displayedMoods.map((mood, index) => (
              <MoodCard key={mood.id} mood={mood} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* "MADE FOR YOU" Section (Horizontal Scrollable) */}
      <section className="relative pt-2 sm:pt-4">
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight text-[#111111]">
              MADE FOR YOU
            </h2>
            <DoodleStar className="w-5 h-5 sm:w-6 sm:h-6 fill-[#FFE229]" />
          </div>

          <Link
            href="/discover"
            className="group flex items-center gap-1 font-display font-black text-xs md:text-sm uppercase tracking-wider text-[#111111] hover:underline"
          >
            <span>EXPLORE ALL</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal Scrolling Cards */}
        <div className="flex items-stretch gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-3 pt-1 px-0.5 no-scrollbar select-none snap-x snap-mandatory">
          {PLAYLISTS.slice(0, 7).map((playlist) => (
            <div key={playlist.id} className="snap-start flex-shrink-0">
              <PlaylistCard playlist={playlist} layout="card" />
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING RN & QUICK PICKS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left (8 cols): TRENDING RN 🔥 */}
        <section className="lg:col-span-8 bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-lg rounded-[28px] p-5 md:p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#111111]/20">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-[#111111] flex items-center gap-2">
                <span>TRENDING RN</span>
                <Flame className="w-6 h-6 text-[#FF8A3D] fill-[#FF8A3D]" />
              </h2>
            </div>

            <Link
              href="/search?tab=trending"
              className="font-mono text-xs font-bold uppercase underline text-[#111111] hover:text-[#FF5CA8]"
            >
              SEE ALL →
            </Link>
          </div>

          {/* Compact Song Rows */}
          <div className="space-y-2.5">
            {trendingTracks.length > 0 ? (
              trendingTracks.slice(0, 8).map((track, idx) => (
                <SongRow
                  key={track.id}
                  track={track}
                  index={idx}
                  playlistQueue={trendingTracks}
                />
              ))
            ) : (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-14 bg-[#F5F0E6] rounded-xl border-2 border-[#111111]/20 animate-pulse" />
              ))
            )}
          </div>
        </section>

        {/* Right (4 cols): Quick Picks + Editorial Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Picks for You */}
          <div className="bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[24px] p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#111111]/15">
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-[#FFE229] fill-[#FFE229]" />
                <h3 className="font-display font-black text-lg uppercase text-[#111111]">
                  QUICK PICKS
                </h3>
              </div>
              <span className="font-mono text-[10px] font-black uppercase bg-[#8E7CFF] text-white px-2 py-0.5 rounded">
                FOR YOU
              </span>
            </div>

            <div className="space-y-2">
              {quickPicks.length > 0 ? (
                quickPicks.slice(0, 4).map((track, idx) => (
                  <SongRow
                    key={track.id}
                    track={track}
                    index={idx}
                    showIndex={false}
                    playlistQueue={quickPicks}
                  />
                ))
              ) : (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-[#F5F0E6] rounded-xl border-2 border-[#111111]/20 animate-pulse" />
                ))
              )}
            </div>
          </div>

          {/* Neo-brutalist Editorial Poster Card */}
          <div className="relative p-6 rounded-[26px] bg-[#FFE229] border-[3.5px] border-[#111111] shadow-brutal-lg flex flex-col justify-between overflow-hidden select-none -rotate-1">
            <div className="flex justify-between items-start">
              <DoodleCrown className="w-8 h-8 text-[#111111]" />
              <DoodleSmiley className="w-8 h-8" fill="#FFFDF9" />
            </div>

            <div className="my-5">
              <span className="font-mono text-[11px] font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#111111]">
                DAILY WISDOM
              </span>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight text-[#111111] leading-tight mt-2">
                &ldquo;Music Hits Different When It Matches Your Headspace.&rdquo;
              </h3>
              <p className="font-sans font-bold text-xs text-[#111111]/80 mt-2">
                Over 10,000 real songs synced with YouTube Music on VYBE.
              </p>
            </div>

            <Link
              href="/ai-dj"
              className="w-full py-2.5 px-4 rounded-xl border-[2.5px] border-[#111111] bg-white font-display font-black text-xs uppercase tracking-wider text-center shadow-[3px_3px_0px_#111111] hover:bg-[#FF5CA8] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              ASK AI DJ FOR BESPOKE CRATES →
            </Link>
          </div>
        </div>
      </div>

      {/* Autonomous AI DJ Studio Section */}
      <section className="pt-4">
        <AiDjSection />
      </section>
    </div>
  );
}
