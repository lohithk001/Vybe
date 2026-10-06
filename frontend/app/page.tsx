'use client';

import React from 'react';
import Link from 'next/link';
import { MOODS, PLAYLISTS, TRACKS } from '@/data/mockData';
import { MoodCard } from '@/components/cards/MoodCard';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { SongRow } from '@/components/cards/SongRow';
import { HandwrittenNote, Sticker, DoodleSparkle, DoodleStar, DoodleSmiley, DoodleCrown } from '@/components/doodles/Doodles';
import { Sparkles, ArrowRight, Flame, Wand2 } from 'lucide-react';
import { DjMascot } from '@/components/doodles/OriginalIllustrations';

export default function HomePage() {
  const trendingTracks = TRACKS.slice(0, 6);
  const madeForYouPlaylists = PLAYLISTS.slice(0, 7);

  return (
    <div className="space-y-10 md:space-y-12">
      {/* Hero Section */}
      <section className="relative pt-2 pb-4">
        {/* Floating sticker badges */}
        <div className="hidden sm:flex items-center gap-3 mb-4">
          <Sticker color="#FFE229" rotation="-rotate-3">
            <span>YOUR MUSIC. YOUR VIBE.</span>
          </Sticker>
          <Sticker color="#FF5CA8" rotation="rotate-2">
            <span>✦ GEN-Z AUDIO OS</span>
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
              Pick a vibe. We&apos;ll handle the music.
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
                <span>AI DJ WAITING</span>
              </div>
              <p className="font-display font-black text-sm text-[#111111] leading-tight mt-0.5">
                Build a playlist with AI →
              </p>
            </div>
          </Link>
        </div>

        {/* 4 Large Asymmetric Mood Cards in 2x2 grid on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-6 md:mt-8">
          {MOODS.map((mood, index) => (
            <MoodCard key={mood.id} mood={mood} index={index} />
          ))}
        </div>
      </section>

      {/* "MADE FOR YOU" Section (Horizontal Scrollable) */}
      <section className="relative pt-2 sm:pt-4">
        {/* Section Header */}
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
          {madeForYouPlaylists.map((playlist) => (
            <div key={playlist.id} className="snap-start flex-shrink-0">
              <PlaylistCard playlist={playlist} layout="card" />
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING RN & VIBE BANNER Grid */}
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
            {trendingTracks.map((track, idx) => (
              <SongRow
                key={track.id}
                track={track}
                index={idx}
                playlistQueue={trendingTracks}
              />
            ))}
          </div>
        </section>

        {/* Right (4 cols): Editorial Sticker Poster & Mascot Quote */}
        <div className="lg:col-span-4 space-y-6">
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
              <h3 className="font-display font-black text-3xl uppercase tracking-tight text-[#111111] leading-tight mt-2">
                &ldquo;Same Songs? Nah.&rdquo;
              </h3>
              <p className="font-sans font-bold text-xs text-[#111111]/80 mt-2">
                Different moods. Same you. Stream what hits right this second.
              </p>
            </div>

            <Link
              href="/ai-dj"
              className="w-full py-2.5 px-4 rounded-xl border-[2.5px] border-[#111111] bg-white font-display font-black text-xs uppercase tracking-wider text-center shadow-[3px_3px_0px_#111111] hover:bg-[#FF5CA8] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              ASK AI DJ FOR FRESH BEATS
            </Link>
          </div>

          {/* Quick Tape Annotation Note */}
          <div className="text-center p-4 bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-sm rounded-2xl">
            <HandwrittenNote
              text="MUSIC MAKES LIFE BETTER <3"
              color="#55D6BE"
              rotation="rotate-2"
              className="text-xs"
            />
            <p className="font-sans font-bold text-xs text-[#111111]/70 mt-3">
              Over 10,000 synth loops & trending hits updated hourly on VYBE.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
