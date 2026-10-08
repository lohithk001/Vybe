'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Sparkles, Volume2 } from 'lucide-react';
import { VybeWordmark } from './VybeLogo';
import { DoodleSmiley } from '@/components/doodles/Doodles';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

export function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { isPlaying, audioFrequencyData } = useMusicPlayer();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#F5F0E6]/95 backdrop-blur-md border-b-[3px] border-[#111111] px-3.5 sm:px-4 md:px-8 py-2.5 sm:py-3.5 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Mobile Left: VYBE Logo */}
        <div className="lg:hidden flex items-center">
          <Link href="/">
            <VybeWordmark size="sm" />
          </Link>
        </div>

        {/* Desktop Left: Greeting */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl text-[#111111] tracking-tight">
              Hey Lohith
            </span>
            <span className="text-xl">👋</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#FFE229] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Sparkles className="w-3 h-3 text-[#111111]" />
            <span>DAILY RADAR READY</span>
          </span>
        </div>

        {/* Search Bar - Center */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md hidden md:flex items-center relative"
        >
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111111]/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, moods..."
              className="w-full bg-[#FFFDF9] border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] rounded-full pl-10 pr-4 py-2 font-sans font-bold text-xs md:text-sm text-[#111111] placeholder:text-[#111111]/50 focus:outline-none focus:shadow-[4px_4px_0px_#FFE229]"
            />
          </div>
        </form>

        {/* Right Section: Mini Visualizer, Search shortcut on mobile, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Quick Search Button */}
          <Link
            href="/search"
            aria-label="Search"
            className="md:hidden p-2 rounded-xl bg-[#FFFDF9] border-[2.5px] border-[#111111] shadow-[2.5px_2.5px_0px_#111111] active:scale-95 transition-transform"
          >
            <Search className="w-4 h-4 text-[#111111]" />
          </Link>

          {/* Audio Engine Live Badge (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-[#FF5CA8] animate-pulse' : 'text-[#111111]/50'}`} />
            <div className="flex items-end gap-0.5 h-3.5 w-12">
              {audioFrequencyData.slice(0, 6).map((val, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-[#111111] rounded-t-sm transition-all duration-75"
                  style={{ height: `${isPlaying ? (val / 100) * 14 : 3}px` }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] font-black uppercase text-[#111111]">
              {isPlaying ? 'ON AIR' : 'SYNTH'}
            </span>
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="relative p-2 rounded-xl bg-[#FFFDF9] border-[2.5px] border-[#111111] shadow-[2.5px_2.5px_0px_#111111] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
            >
              <Bell className="w-4 h-4 text-[#111111]" />
              {/* Unread badge dot */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF5CA8] border-2 border-[#111111] rounded-full" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-11 z-50 w-72 bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-md rounded-2xl p-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111]/20">
                  <span className="font-display font-black text-sm uppercase">NOTIFICATIONS</span>
                  <span className="font-mono text-[10px] font-bold bg-[#FFE229] px-2 py-0.5 rounded-full border border-[#111111]">
                    2 NEW
                  </span>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="p-2 rounded-xl bg-[#55D6BE]/30 border border-[#111111] text-xs">
                    <p className="font-bold text-[#111111]">New AI DJ Drop 🎧</p>
                    <p className="text-[11px] text-[#111111]/80 mt-0.5">
                      &quot;Late Night Coding Flow&quot; generated for your vibe.
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FF5CA8]/20 border border-[#111111] text-xs">
                    <p className="font-bold text-[#111111]">Trending Alert 🔥</p>
                    <p className="text-[11px] text-[#111111]/80 mt-0.5">
                      The Weeknd &quot;Blinding Lights&quot; is trending #1 today.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Badge */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 md:pr-3 rounded-full bg-[#FFFDF9] border-[2.5px] border-[#111111] shadow-[2.5px_2.5px_0px_#111111] hover:-translate-y-0.5 active:translate-y-0.5 transition-transform"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFE229] border-2 border-[#111111] flex items-center justify-center overflow-hidden">
              <DoodleSmiley className="w-7 h-7" fill="#FFE229" />
            </div>
            <span className="hidden md:inline font-display font-black text-xs text-[#111111] tracking-wide">
              LOHITH
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
