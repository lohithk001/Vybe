'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Track } from '@/types/music';
import { fetchTrendingTracks } from '@/services/api';
import { SongRow } from '@/components/cards/SongRow';
import { ARTISTS } from '@/data/mockData';
import {
  DoodleCrown,
  DoodleStar,
  DoodleSparkle,
  DoodleSmiley,
  DoodleLightning,
  HandwrittenNote,
  Sticker,
} from '@/components/doodles/Doodles';
import {
  Sparkles,
  Trophy,
  Flame,
  Clock,
  Radio,
  Zap,
  Volume2,
  Share2,
  Receipt,
  Heart,
  Play,
  RotateCcw,
  Check,
  Disc,
  Music2,
  Sliders,
  ExternalLink,
  X,
  VolumeX,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  tier: 'LEGENDARY' | 'EPIC' | 'RARE' | 'MYTHIC' | 'COMMON';
  tierColor: string;
  icon: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}

const AURAS = [
  {
    name: 'ELECTRIC HYPERPOP',
    mood: 'mainchar',
    color: '#FF5CA8',
    glow: 'from-[#FF5CA8] via-[#FFE229] to-[#8E7CFF]',
    desc: 'Euphoric 140+ BPM energy, main character confidence, unapologetic bass.',
  },
  {
    name: 'DEEP FLOW CYBER',
    mood: 'lockin',
    color: '#FFE229',
    glow: 'from-[#FFE229] via-[#55D6BE] to-[#111111]',
    desc: 'Uninterrupted terminal flow, dark synthwave arpeggios, zero distractions.',
  },
  {
    name: 'RAINY WINDOW LO-FI',
    mood: 'chill',
    color: '#55D6BE',
    glow: 'from-[#55D6BE] via-[#6DB7FF] to-[#F5F0E6]',
    desc: 'Tape-saturated electric piano, cozy rain sounds, midnight tea vibes.',
  },
  {
    name: 'UNHINGED SPEED DEMON',
    mood: 'unhinged',
    color: '#8E7CFF',
    glow: 'from-[#8E7CFF] via-[#FF8A3D] to-[#FF5CA8]',
    desc: 'Pure chaotic frequency, hardstyle phonk kicks, pure adrenaline rush.',
  },
];

export default function ProfilePage() {
  const { history, likedTracks, queue, playTrack } = useMusicPlayer();

  const [topSongs, setTopSongs] = useState<Track[]>([]);
  const [activeAuraIndex, setActiveAuraIndex] = useState(0);
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'progress'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [statusText, setStatusText] = useState('Coding in dark mode with 140 BPM phonk kicks ⚡');
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState(statusText);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSoundFx, setActiveSoundFx] = useState<string | null>(null);

  // Audio Context for the Soundboard
  const sfxAudioCtxRef = useRef<AudioContext | null>(null);

  // Load and calculate most listened songs
  useEffect(() => {
    // Combine history, liked tracks and trending fallback
    if (history.length > 0 || likedTracks.length > 0) {
      const merged = [...history, ...likedTracks];
      // Deduplicate by ID
      const uniqueMap = new Map<string, Track>();
      merged.forEach((t) => {
        if (!uniqueMap.has(t.id)) uniqueMap.set(t.id, t);
      });
      const uniqueList = Array.from(uniqueMap.values());
      if (uniqueList.length >= 5) {
        setTopSongs(uniqueList.slice(0, 5));
        return;
      }
    }

    // Fallback/enrich with live trending songs
    fetchTrendingTracks().then((trending) => {
      if (trending && trending.length > 0) {
        setTopSongs(trending.slice(0, 5));
      }
    });
  }, [history, likedTracks]);

  const activeAura = AURAS[activeAuraIndex];

  // Playful Soundboard Synthesis (Web Audio API)
  const playSoundEffect = (type: 'airhorn' | 'scratch' | 'subdrop' | 'rewind') => {
    setActiveSoundFx(type);
    setTimeout(() => setActiveSoundFx(null), 400);

    try {
      if (!sfxAudioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        sfxAudioCtxRef.current = new AudioCtx();
      }
      const ctx = sfxAudioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'airhorn') {
        // Dancehall Triple Airhorn blast
        const freqs = [466.16, 466.16, 466.16];
        [0, 0.12, 0.24].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freqs[idx], now + offset);
          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.2);
        });
      } else if (type === 'subdrop') {
        // 808 Sub drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.7);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.72);
      } else if (type === 'scratch') {
        // Vinyl Scratch
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.08);
        osc.frequency.linearRampToValueAtTime(180, now + 0.18);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.Q.setValueAtTime(4, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'rewind') {
        // Tape Rewind
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.35);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch (e) {
      console.warn('Sound effect error:', e);
    }
  };

  // Playful Gamified Badges
  const badges: BadgeItem[] = [
    {
      id: 'aux-god',
      title: 'AUX GOD 👑',
      description: 'Streamed 50+ songs without getting skipped once. Absolute playlist dictator.',
      tier: 'LEGENDARY',
      tierColor: '#FFE229',
      icon: '👑',
      unlocked: true,
    },
    {
      id: 'night-owl',
      title: '3 AM NIGHT OWL 🦉',
      description: 'Bumped beats past 2:30 AM while staring into the blue light matrix.',
      tier: 'RARE',
      tierColor: '#8E7CFF',
      icon: '🦉',
      unlocked: true,
    },
    {
      id: 'bass-goblin',
      title: 'BASS GOBLIN 🔊',
      description: 'Kept the master volume knob pinned at 100% on 15 high-octane tracks.',
      tier: 'RARE',
      tierColor: '#FF8A3D',
      icon: '🔊',
      unlocked: true,
    },
    {
      id: 'ai-dj-whisperer',
      title: 'AI DJ WHISPERER 🤖',
      description: 'Summoned 5 custom crates from VYBE BOT with hyper-specific prompts.',
      tier: 'EPIC',
      tierColor: '#55D6BE',
      icon: '🤖',
      unlocked: true,
    },
    {
      id: 'repeat-fiend',
      title: 'REPEAT OBSESSED 🔁',
      description: 'Put the exact same banger on repeat 10 times in a single session.',
      tier: 'EPIC',
      tierColor: '#FF5CA8',
      icon: '🔁',
      unlocked: false,
      progress: { current: 7, total: 10 },
    },
    {
      id: 'crate-digger',
      title: 'CRATE DIGGER 💿',
      description: 'Explored and played songs from all 8 distinct mood frequencies.',
      tier: 'LEGENDARY',
      tierColor: '#FFE229',
      icon: '💿',
      unlocked: true,
    },
    {
      id: 'early-adopter',
      title: 'ALPHA TESTER ✦',
      description: 'Joined VYBE audio platform in its pure early edition.',
      tier: 'MYTHIC',
      tierColor: '#6DB7FF',
      icon: '✦',
      unlocked: true,
    },
    {
      id: 'lofi-architect',
      title: 'LO-FI ARCHITECT ☕',
      description: 'Accumulated 120+ minutes of rainy lo-fi piano and chill vibes.',
      tier: 'COMMON',
      tierColor: '#55D6BE',
      icon: '☕',
      unlocked: false,
      progress: { current: 85, total: 120 },
    },
  ];

  const filteredBadges = useMemo(() => {
    if (badgeFilter === 'unlocked') return badges.filter((b) => b.unlocked);
    if (badgeFilter === 'progress') return badges.filter((b) => !b.unlocked);
    return badges;
  }, [badgeFilter]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#FFE229', '#FF5CA8', '#55D6BE', '#8E7CFF'],
        });
      } catch {}
    }
  };

  const handleBadgeClick = (badge: BadgeItem) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
          colors: [badge.tierColor, '#111111', '#FFFDF9'],
        });
      } catch {}
    }
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusDraft.trim()) {
      setStatusText(statusDraft.trim());
      setIsEditingStatus(false);
    }
  };

  const playHeavyRotation = () => {
    if (topSongs.length > 0) {
      playTrack(topSongs[0], topSongs);
    }
  };

  // Mock spin counts for ranked top songs
  const spinCounts = [58, 42, 31, 24, 19];

  return (
    <div className="space-y-10 pb-16 select-none">
      {/* 1. HERO PROFILE CARD */}
      <section className="relative p-6 sm:p-8 md:p-10 rounded-[32px] bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-lg overflow-hidden">
        {/* Dynamic Aura Gradient Splash in background */}
        <div
          className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${activeAura.glow} pointer-events-none transition-all duration-700`}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Avatar with Animated Mood Ring */}
          <div className="relative flex-shrink-0 group">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[4px] border-[#111111] shadow-brutal p-1.5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: activeAura.color }}
            >
              <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center overflow-hidden">
                <DoodleSmiley className="w-20 h-20 sm:w-24 sm:h-24" fill={activeAura.color} />
              </div>
            </div>

            {/* Level Badge Pill */}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#111111] text-[#FFE229] font-mono text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full border-2 border-white shadow-[2px_2px_0px_#111111] whitespace-nowrap">
              LVL 42 • SOUND PRO
            </span>
          </div>

          {/* User Details & Bio */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
              <span className="font-mono text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#111111] text-white">
                VERIFIED TASTEMAKER
              </span>
              <span
                className="font-mono text-xs font-black uppercase px-2.5 py-0.5 rounded-full border border-[#111111]"
                style={{ backgroundColor: activeAura.color }}
              >
                AURA: {activeAura.name}
              </span>
              <DoodleCrown className="w-5 h-5 text-[#FFE229]" />
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#111111]">
              LOHITH
            </h1>

            <p className="font-mono text-xs sm:text-sm font-bold text-[#111111]/70 mt-1">
              @lohith.vybe • Member since Alpha 2026
            </p>

            {/* Editable Status Sticker */}
            <div className="mt-3.5 flex items-center justify-center md:justify-start gap-2">
              {isEditingStatus ? (
                <form onSubmit={handleSaveStatus} className="flex items-center gap-2 max-w-md w-full">
                  <input
                    type="text"
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    maxLength={70}
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl border-2 border-[#111111] bg-white text-[#111111] outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#55D6BE] border-2 border-[#111111] font-display font-black text-xs uppercase rounded-xl shadow-[2px_2px_0px_#111111]"
                  >
                    SAVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingStatus(false)}
                    className="p-1.5 bg-white border-2 border-[#111111] rounded-xl text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div
                  onClick={() => setIsEditingStatus(true)}
                  className="cursor-pointer group/status inline-flex items-center gap-2 p-2 rounded-xl bg-[#F5F0E6] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#FFE229] transition-colors"
                >
                  <span className="font-sans font-bold text-xs text-[#111111]">
                    &ldquo;{statusText}&rdquo;
                  </span>
                  <span className="font-mono text-[10px] text-[#111111]/60 font-black uppercase group-hover/status:underline">
                    [EDIT]
                  </span>
                </div>
              )}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 mt-6">
              <button
                onClick={playHeavyRotation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-[2.5px] border-[#111111] bg-[#FFE229] shadow-brutal-sm hover:bg-[#FFE229]/90 active:translate-x-0.5 active:translate-y-0.5 font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all"
              >
                <Play className="w-4 h-4 fill-[#111111]" />
                <span>PLAY MY ROTATION</span>
              </button>

              <button
                onClick={() => setIsReceiptOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-[2.5px] border-[#111111] bg-[#FFFDF9] shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#55D6BE] active:translate-x-0.5 active:translate-y-0.5 font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all"
              >
                <Receipt className="w-4 h-4 stroke-[2.5]" />
                <span>RECEIPTIFY 🧾</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-[2.5px] border-[#111111] bg-[#FFFDF9] shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#FF5CA8] hover:text-white active:translate-x-0.5 active:translate-y-0.5 font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>LINK COPIED!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 stroke-[2.5]" />
                    <span>SHARE PROFILE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Aura Switcher Tabs */}
        <div className="mt-8 pt-6 border-t-2 border-[#111111]/15">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-mono text-xs font-black uppercase text-[#111111]/70 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8E7CFF]" />
              <span>ACTIVE SONIC AURA (CLICK TO SWITCH):</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {AURAS.map((aura, idx) => (
              <button
                key={aura.name}
                onClick={() => setActiveAuraIndex(idx)}
                className={`p-3 rounded-2xl border-[2.5px] border-[#111111] text-left transition-all ${
                  activeAuraIndex === idx
                    ? 'shadow-brutal-sm -translate-y-1 scale-[1.02]'
                    : 'bg-[#FFFDF9] shadow-[2px_2px_0px_#111111] opacity-75 hover:opacity-100 hover:bg-[#F5F0E6]'
                }`}
                style={{ backgroundColor: activeAuraIndex === idx ? aura.color : undefined }}
              >
                <div className="font-display font-black text-xs sm:text-sm uppercase text-[#111111] truncate">
                  {aura.name}
                </div>
                <div className="font-mono text-[10px] text-[#111111]/70 mt-1 line-clamp-1">
                  {aura.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW (4 BRUTALIST CARDS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFE229] border-[3px] border-[#111111] shadow-brutal-md flex flex-col justify-between -rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-black uppercase">STREAM TIME</span>
            <Clock className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="my-3">
            <h3 className="font-display font-black text-2xl sm:text-4xl text-[#111111]">
              2,840<span className="text-base sm:text-lg">m</span>
            </h3>
            <p className="font-sans font-bold text-xs text-[#111111]/80 mt-0.5">
              ≈ 47.3 Total Hours
            </p>
          </div>
          <div className="font-mono text-[10px] font-black text-[#111111] bg-white/70 px-2 py-0.5 rounded border border-[#111111] w-fit">
            TOP 2% LISTENER
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#55D6BE] border-[3px] border-[#111111] shadow-brutal-md flex flex-col justify-between rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-black uppercase">SONGS BUMPED</span>
            <Music2 className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="my-3">
            <h3 className="font-display font-black text-2xl sm:text-4xl text-[#111111]">
              184<span className="text-base sm:text-lg"> ✦</span>
            </h3>
            <p className="font-sans font-bold text-xs text-[#111111]/80 mt-0.5">
              {likedTracks.length} Saved in Liked
            </p>
          </div>
          <div className="font-mono text-[10px] font-black text-[#111111] bg-white/70 px-2 py-0.5 rounded border border-[#111111] w-fit">
            HEAVY CRATE ROTATION
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#FF5CA8] border-[3px] border-[#111111] shadow-brutal-md flex flex-col justify-between -rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-black uppercase text-white">GENRES UNLOCKED</span>
            <Disc className="w-4 h-4 text-white" />
          </div>
          <div className="my-3">
            <h3 className="font-display font-black text-2xl sm:text-4xl text-white">
              24<span className="text-base sm:text-lg"> VIBES</span>
            </h3>
            <p className="font-sans font-bold text-xs text-white/90 mt-0.5">
              Hyperpop, Phonk, Alt-Pop
            </p>
          </div>
          <div className="font-mono text-[10px] font-black text-[#111111] bg-white px-2 py-0.5 rounded border border-[#111111] w-fit">
            ECLECTIC PALETTE
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#8E7CFF] border-[3px] border-[#111111] shadow-brutal-md flex flex-col justify-between rotate-1 hover:rotate-0 transition-transform">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-black uppercase text-white">DAILY STREAK</span>
            <Flame className="w-4 h-4 text-[#FFE229] fill-[#FFE229]" />
          </div>
          <div className="my-3">
            <h3 className="font-display font-black text-2xl sm:text-4xl text-white">
              14<span className="text-base sm:text-lg"> DAYS</span>
            </h3>
            <p className="font-sans font-bold text-xs text-white/90 mt-0.5">
              Zero Days Skipped 🔥
            </p>
          </div>
          <div className="font-mono text-[10px] font-black text-[#111111] bg-[#FFE229] px-2 py-0.5 rounded border border-[#111111] w-fit">
            UNSTOPPABLE
          </div>
        </div>
      </section>

      {/* 3. HEAVY ROTATION & VIBE SPECTRUM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 cols): TOP SONGS / HEAVY ROTATION */}
        <section className="lg:col-span-7 bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-lg rounded-[28px] p-5 sm:p-6">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-[#111111]/20">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FFE229]" />
              <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#111111]">
                HEAVY ROTATION
              </h2>
            </div>
            <span className="font-mono text-[11px] font-black uppercase bg-[#FFE229] px-2.5 py-1 rounded-full border border-[#111111]">
              TOP 5 THIS MONTH
            </span>
          </div>

          <div className="space-y-2.5">
            {topSongs.map((track, idx) => (
              <div key={`top-${track.id}-${idx}`} className="relative group/top">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <span className="w-6 h-6 rounded-full bg-[#111111] text-[#FFE229] font-mono text-[11px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                    {idx + 1}
                  </span>
                </div>
                <div className="pl-4">
                  <SongRow track={track} index={idx} playlistQueue={topSongs} />
                </div>
              </div>
            ))}
          </div>

          {/* Heavy rotation callout */}
          <div className="mt-5 p-3.5 rounded-2xl bg-[#F5F0E6] border-2 border-[#111111] flex items-center justify-between">
            <span className="font-sans font-bold text-xs text-[#111111]">
              Top song holds <span className="font-black text-[#FF5CA8]">58 spins</span> this month.
            </span>
            <button
              onClick={playHeavyRotation}
              className="font-mono text-xs font-black uppercase text-[#111111] underline hover:text-[#8E7CFF]"
            >
              SPIN ALL →
            </button>
          </div>
        </section>

        {/* Right (5 cols): MOOD SPECTRUM & TEMPO RADAR */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mood Spectrum Breakdown */}
          <section className="bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#111111]/20">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#FF5CA8]" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#111111]">
                  MOOD SPECTRUM
                </h3>
              </div>
              <span className="font-mono text-[10px] font-black text-[#111111]/60 uppercase">
                LAST 30 DAYS
              </span>
            </div>

            {/* Segmented Color Bar */}
            <div className="h-6 w-full rounded-xl border-2 border-[#111111] overflow-hidden flex shadow-[2px_2px_0px_#111111] mb-4">
              <div style={{ width: '44%' }} className="bg-[#FF5CA8] h-full" title="Main Char: 44%" />
              <div style={{ width: '28%' }} className="bg-[#FFE229] h-full" title="Lock In: 28%" />
              <div style={{ width: '18%' }} className="bg-[#55D6BE] h-full" title="Chill: 18%" />
              <div style={{ width: '10%' }} className="bg-[#8E7CFF] h-full" title="Unhinged: 10%" />
            </div>

            <div className="space-y-2 font-mono text-xs font-bold">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5CA8] border border-[#111111]" />
                  <span>Main Character Pop</span>
                </span>
                <span className="font-black">44%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FFE229] border border-[#111111]" />
                  <span>Lock In Synthwave</span>
                </span>
                <span className="font-black">28%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#55D6BE] border border-[#111111]" />
                  <span>Chill Window Lo-Fi</span>
                </span>
                <span className="font-black">18%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#8E7CFF] border border-[#111111]" />
                  <span>Unhinged Hyperpop</span>
                </span>
                <span className="font-black">10%</span>
              </div>
            </div>
          </section>

          {/* Sonic Radar Stats */}
          <section className="bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-md rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#111111]/20">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#8E7CFF]" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-[#111111]">
                  SONIC RADAR
                </h3>
              </div>
              <DoodleStar className="w-4 h-4 fill-[#FFE229]" />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#111111]">
                <span className="text-[10px] text-[#111111]/60 uppercase block">AVG TEMPO</span>
                <span className="font-black text-base text-[#111111] block mt-0.5">128 BPM</span>
                <span className="text-[10px] text-[#111111]/80">Driving Tempo</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#111111]">
                <span className="text-[10px] text-[#111111]/60 uppercase block">PEAK HOURS</span>
                <span className="font-black text-base text-[#111111] block mt-0.5">1 AM - 3 AM</span>
                <span className="text-[10px] text-[#111111]/80">Night Owl Flow</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#111111]">
                <span className="text-[10px] text-[#111111]/60 uppercase block">TOP DECADE</span>
                <span className="font-black text-base text-[#111111] block mt-0.5">2020s & 90s</span>
                <span className="text-[10px] text-[#111111]/80">Futuristic Nostalgia</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F0E6] border border-[#111111]">
                <span className="text-[10px] text-[#111111]/60 uppercase block">ROOT KEY</span>
                <span className="font-black text-base text-[#111111] block mt-0.5">C Major / Am</span>
                <span className="text-[10px] text-[#111111]/80">440.0 Hz Harmonic</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 4. UNLOCKABLE BADGES & ACHIEVEMENTS */}
      <section className="bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-lg rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-[#111111]/20">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-7 h-7 text-[#FF8A3D]" />
              <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-[#111111]">
                UNLOCKABLE BADGES
              </h2>
            </div>
            <p className="font-sans font-bold text-xs sm:text-sm text-[#111111]/70 mt-1">
              Click any unlocked trophy for instant bragging rights & confetti.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setBadgeFilter('all')}
              className={`px-3 py-1 rounded-xl font-mono text-xs font-black uppercase border-2 border-[#111111] transition-all ${
                badgeFilter === 'all'
                  ? 'bg-[#111111] text-white shadow-[2px_2px_0px_#FFE229]'
                  : 'bg-white hover:bg-[#F5F0E6]'
              }`}
            >
              ALL ({badges.length})
            </button>
            <button
              onClick={() => setBadgeFilter('unlocked')}
              className={`px-3 py-1 rounded-xl font-mono text-xs font-black uppercase border-2 border-[#111111] transition-all ${
                badgeFilter === 'unlocked'
                  ? 'bg-[#55D6BE] text-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white hover:bg-[#F5F0E6]'
              }`}
            >
              UNLOCKED ({badges.filter((b) => b.unlocked).length})
            </button>
            <button
              onClick={() => setBadgeFilter('progress')}
              className={`px-3 py-1 rounded-xl font-mono text-xs font-black uppercase border-2 border-[#111111] transition-all ${
                badgeFilter === 'progress'
                  ? 'bg-[#FF5CA8] text-white shadow-[2px_2px_0px_#111111]'
                  : 'bg-white hover:bg-[#F5F0E6]'
              }`}
            >
              LOCKED ({badges.filter((b) => !b.unlocked).length})
            </button>
          </div>
        </div>

        {/* Badge Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`cursor-pointer p-5 rounded-2xl border-[3px] border-[#111111] transition-all select-none flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-[#FFFDF9] shadow-brutal-sm hover:shadow-brutal hover:-translate-y-1 active:translate-y-0.5'
                  : 'bg-[#F5F0E6] opacity-75 border-dashed hover:opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl filter drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
                    {badge.icon}
                  </span>
                  <span
                    className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-[#111111]"
                    style={{ backgroundColor: badge.tierColor }}
                  >
                    {badge.tier}
                  </span>
                </div>

                <h4 className="font-display font-black text-base uppercase text-[#111111]">
                  {badge.title}
                </h4>

                <p className="font-sans font-bold text-xs text-[#111111]/70 mt-1 leading-snug">
                  {badge.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#111111]/15">
                {badge.unlocked ? (
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-black text-[#55D6BE] uppercase">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>UNLOCKED & VERIFIED</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between font-mono text-[10px] font-black text-[#111111]/60 mb-1">
                      <span>PROGRESS</span>
                      <span>
                        {badge.progress?.current} / {badge.progress?.total}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full border border-[#111111] overflow-hidden">
                      <div
                        className="h-full bg-[#FF5CA8]"
                        style={{
                          width: `${((badge.progress?.current || 0) / (badge.progress?.total || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PLAYFUL LIVE SOUNDBOARD */}
      <section className="bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-lg rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-5 border-b-2 border-[#111111]/20">
          <div className="flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-[#FF5CA8]" />
            <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-[#111111]">
              PLAYFUL SOUNDBOARD 🔊
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-[#111111]/70">
            REAL WEB AUDIO SYNTH ENGINE • CLICK BUTTONS FOR INSTANT SFX
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => playSoundEffect('airhorn')}
            className={`p-4 rounded-2xl border-[3px] border-[#111111] flex flex-col items-center justify-center gap-2 transition-all font-display font-black text-xs sm:text-sm uppercase tracking-wider ${
              activeSoundFx === 'airhorn'
                ? 'bg-[#FFE229] translate-y-1 shadow-none'
                : 'bg-[#FFE229] shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal'
            }`}
          >
            <span className="text-2xl">📢</span>
            <span>AIR HORN 💥</span>
          </button>

          <button
            onClick={() => playSoundEffect('scratch')}
            className={`p-4 rounded-2xl border-[3px] border-[#111111] flex flex-col items-center justify-center gap-2 transition-all font-display font-black text-xs sm:text-sm uppercase tracking-wider ${
              activeSoundFx === 'scratch'
                ? 'bg-[#55D6BE] translate-y-1 shadow-none'
                : 'bg-[#55D6BE] shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal'
            }`}
          >
            <span className="text-2xl">💿</span>
            <span>VINYL SCRATCH</span>
          </button>

          <button
            onClick={() => playSoundEffect('subdrop')}
            className={`p-4 rounded-2xl border-[3px] border-[#111111] flex flex-col items-center justify-center gap-2 transition-all font-display font-black text-xs sm:text-sm uppercase tracking-wider ${
              activeSoundFx === 'subdrop'
                ? 'bg-[#FF8A3D] text-white translate-y-1 shadow-none'
                : 'bg-[#FF8A3D] text-white shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal'
            }`}
          >
            <span className="text-2xl">💣</span>
            <span>808 SUB DROP</span>
          </button>

          <button
            onClick={() => playSoundEffect('rewind')}
            className={`p-4 rounded-2xl border-[3px] border-[#111111] flex flex-col items-center justify-center gap-2 transition-all font-display font-black text-xs sm:text-sm uppercase tracking-wider ${
              activeSoundFx === 'rewind'
                ? 'bg-[#8E7CFF] text-white translate-y-1 shadow-none'
                : 'bg-[#8E7CFF] text-white shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal'
            }`}
          >
            <span className="text-2xl">⏪</span>
            <span>TAPE REWIND</span>
          </button>
        </div>
      </section>

      {/* 6. RECEIPTIFY MODAL (PRINTABLE / SHAREABLE VINTAGE RECEIPT) */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#FFFDF9] border-[4px] border-[#111111] shadow-brutal-xl rounded-2xl p-6 select-none font-mono text-[#111111] text-xs">
            {/* Close Button */}
            <button
              onClick={() => setIsReceiptOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border-2 border-[#111111] bg-white hover:bg-[#FF5CA8] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b-2 border-dashed border-[#111111]/40 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/vybe-logo.png"
                alt="VYBE"
                className="h-10 w-auto object-contain mb-1 filter drop-shadow-[1.5px_1.5px_0px_#111111]"
              />
              <p className="text-[10px] text-[#111111]/70 uppercase mt-0.5">
                STORE #001 • GEN-Z HEADQUARTERS
              </p>
              <p className="text-[10px] text-[#111111]/70 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                • 03:42 AM
              </p>
              <p className="text-[10px] font-black uppercase bg-[#FFE229] px-2 py-0.5 rounded border border-[#111111] inline-block mt-2">
                CUSTOMER: LOHITH (@lohith.vybe)
              </p>
            </div>

            {/* Line items: Top Tracks */}
            <div className="py-4 space-y-2.5 border-b-2 border-dashed border-[#111111]/40">
              <div className="flex justify-between font-black text-[11px] pb-1 border-b border-[#111111]/20">
                <span>ITEM (SONG)</span>
                <span>SPINS</span>
              </div>
              {topSongs.map((track, i) => (
                <div key={`receipt-${track.id}`} className="flex justify-between items-start gap-2">
                  <div className="truncate flex-1">
                    <span className="font-black">0{i + 1}. </span>
                    <span className="font-bold uppercase">{track.title}</span>
                    <div className="text-[10px] text-[#111111]/60 truncate">{track.artist}</div>
                  </div>
                  <span className="font-black flex-shrink-0">{spinCounts[i] || 15}X</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-3 space-y-1.5 border-b-2 border-dashed border-[#111111]/40">
              <div className="flex justify-between">
                <span>TOTAL MINUTES:</span>
                <span className="font-black">2,840 MINS</span>
              </div>
              <div className="flex justify-between">
                <span>DOPAMINE SURGE:</span>
                <span className="font-black">99.4%</span>
              </div>
              <div className="flex justify-between">
                <span>SLEEP SCHEDULE:</span>
                <span className="font-black text-[#FF5CA8]">COMPROMISED</span>
              </div>
              <div className="flex justify-between font-black text-sm pt-1 border-t border-[#111111]/20">
                <span>TOTAL VIBE:</span>
                <span className="text-[#55D6BE] bg-[#111111] px-1.5 py-0.5 rounded">
                  PRICELESS
                </span>
              </div>
            </div>

            {/* Barcode & Footer */}
            <div className="pt-4 text-center">
              <div className="font-mono text-[9px] tracking-[0.25em] font-black uppercase text-[#111111]/80">
                ||||| | |||| ||| |||||| | ||||| ||||
              </div>
              <p className="text-[9px] font-black uppercase text-[#111111]/60 mt-1">
                AUTH CODE: VYBE-9942-AUX-GOD
              </p>
              <p className="font-sans text-[10px] font-bold text-[#111111]/80 mt-2">
                &ldquo;THANK YOU FOR STREAMING REAL BEATS!&rdquo;
              </p>

              <button
                onClick={() => {
                  handleShare();
                  setIsReceiptOpen(false);
                }}
                className="mt-4 w-full py-2.5 rounded-xl border-2 border-[#111111] bg-[#FFE229] font-display font-black text-xs uppercase shadow-[2px_2px_0px_#111111] hover:bg-[#FFE229]/90 active:translate-y-0.5"
              >
                COPY & SAVE RECEIPT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
