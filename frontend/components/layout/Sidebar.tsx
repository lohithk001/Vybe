'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Compass,
  Sparkles,
  Library,
  Heart,
  ListMusic,
  Disc,
  Users,
  Clock,
  User,
} from 'lucide-react';
import { LogoLink } from './VybeLogo';
import { HandwrittenNote, DoodleCrown } from '@/components/doodles/Doodles';
import { useMusicPlayer } from '@/context/MusicPlayerContext';

export function Sidebar() {
  const pathname = usePathname();
  const { likedTrackIds } = useMusicPlayer();

  const mainNav = [
    { name: 'Home', href: '/', icon: Home, accent: '#FFE229' },
    { name: 'Search', href: '/search', icon: Search, accent: '#55D6BE' },
    { name: 'Discover', href: '/discover', icon: Compass, accent: '#FF5CA8' },
    { name: 'AI DJ', href: '/ai-dj', icon: Sparkles, accent: '#8E7CFF', badge: '✦ NEW' },
    { name: 'Library', href: '/library', icon: Library, accent: '#FF8A3D' },
    { name: 'Profile', href: '/profile', icon: User, accent: '#6DB7FF' },
  ];

  const libraryItems = [
    {
      name: 'Liked Songs',
      href: '/library?tab=liked',
      icon: Heart,
      count: likedTrackIds.length,
      color: '#FF5CA8',
    },
    { name: 'Playlists', href: '/library?tab=playlists', icon: ListMusic },
    { name: 'Albums', href: '/library?tab=albums', icon: Disc },
    { name: 'Artists', href: '/library?tab=artists', icon: Users },
    { name: 'History', href: '/library?tab=history', icon: Clock },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#FFFDF9] border-r-[3.5px] border-[#111111] h-screen sticky top-0 p-5 overflow-y-auto select-none z-30">
      {/* Brand Header */}
      <div className="mb-6 pt-1 flex items-center justify-between">
        <LogoLink />
        <DoodleCrown className="w-6 h-6 text-[#111111] -rotate-6" />
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1.5">
        {mainNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border-[2.5px] font-display font-black text-sm uppercase tracking-wide transition-all ${
                isActive
                  ? 'border-[#111111] shadow-[3.5px_3.5px_0px_#111111] translate-x-1'
                  : 'border-transparent text-[#111111]/80 hover:border-[#111111] hover:bg-black/5 hover:text-[#111111]'
              }`}
              style={{
                backgroundColor: isActive ? item.accent : 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 stroke-[2.5]" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#111111] text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-6 border-b-[2.5px] border-[#111111]/20" />

      {/* Library Section */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#111111]/60">
            YOUR LIBRARY
          </span>
          <Link
            href="/library"
            className="font-mono text-[11px] font-bold text-[#111111] underline hover:text-[#FF5CA8]"
          >
            VIEW ALL
          </Link>
        </div>

        <ul className="space-y-1">
          {libraryItems.map((lib) => {
            const Icon = lib.icon;
            return (
              <li key={lib.name}>
                <Link
                  href={lib.href}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#111111]/80 hover:text-[#111111] hover:bg-black/5 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{lib.name}</span>
                  </div>
                  {typeof lib.count === 'number' && (
                    <span
                      className="px-2 py-0.5 rounded-full font-mono text-[10px] font-black border border-[#111111]"
                      style={{ backgroundColor: lib.color || '#FFE229' }}
                    >
                      {lib.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Handwritten Annotation Sticker Footer */}
      <div className="mt-auto pt-6 text-center">
        <HandwrittenNote
          text="GOOD MUSIC. BAD DECISIONS."
          color="#FFE229"
          rotation="-rotate-2"
          className="text-xs"
        />
        <div className="mt-3 font-mono text-[10px] text-[#111111]/50 font-bold">
          VYBE AUDIO OS v2.4 ✦ GEN-Z
        </div>
      </div>
    </aside>
  );
}
