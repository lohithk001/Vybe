'use client';

import React from 'react';
import { MoodConfig } from '@/types/music';
import { Play, Sparkles } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { fetchMoodSongs } from '@/services/api';
import {
  ChillCharacter,
  LockInCharacter,
  MainCharCharacter,
  UnhingedCharacter,
} from '@/components/doodles/OriginalIllustrations';

export function MoodCard({ mood, index }: { mood: MoodConfig; index: number }) {
  const { playTrack, currentTrack, isPlaying, setActiveMood } = useMusicPlayer();

  const isCurrentMoodPlaying = isPlaying && currentTrack.mood === mood.id;

  const handlePlayMood = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMood(mood.id);
    try {
      const realMoodTracks = await fetchMoodSongs(mood.id);
      if (realMoodTracks && realMoodTracks.length > 0) {
        playTrack(realMoodTracks[0], realMoodTracks);
      }
    } catch (err) {
      console.warn('Mood fetch error:', err);
    }
  };

  const renderIllustration = () => {
    switch (mood.illustration) {
      case 'chill':
        return <ChillCharacter className="w-full h-full transform hover:scale-105 transition-transform duration-300" />;
      case 'lockin':
        return <LockInCharacter className="w-full h-full transform hover:scale-105 transition-transform duration-300" />;
      case 'mainchar':
        return <MainCharCharacter className="w-full h-full transform hover:scale-105 transition-transform duration-300" />;
      case 'unhinged':
        return <UnhingedCharacter className="w-full h-full transform hover:scale-105 transition-transform duration-300" />;
      default:
        return <ChillCharacter className="w-full h-full" />;
    }
  };

  return (
    <div
      onClick={handlePlayMood}
      className={`group relative cursor-pointer select-none rounded-[20px] sm:rounded-[24px] border-[2.5px] sm:border-[3.5px] border-[#111111] p-3 sm:p-5 md:p-6 transition-all duration-200 hover:-translate-y-1 hover:translate-x-0.5 hover:shadow-[7px_7px_0px_#111111] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_#111111] ${mood.bgClass} ${mood.rotation} shadow-brutal sm:shadow-brutal-lg flex flex-col justify-between overflow-hidden min-h-[170px] sm:min-h-[220px] md:min-h-[260px]`}
    >
      {/* Decorative top-right badge */}
      <div className="flex items-center justify-between z-10">
        <span className="inline-flex items-center gap-0.5 sm:gap-1 font-mono text-[9px] sm:text-[11px] font-black uppercase tracking-wider bg-white/95 text-[#111111] px-1.5 sm:px-2.5 py-0.5 rounded-full border sm:border-2 border-[#111111] shadow-[1.5px_1.5px_0px_#111111]">
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#111111]" />
          <span>VIBE 0{index + 1}</span>
        </span>

        {/* Play Button */}
        <button
          onClick={handlePlayMood}
          aria-label={`Play ${mood.title} mood`}
          className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full border-2 sm:border-[3px] border-[#111111] flex items-center justify-center transition-all duration-150 shadow-[2px_2px_0px_#111111] sm:shadow-[3px_3px_0px_#111111] group-hover:scale-110 active:scale-95 ${
            isCurrentMoodPlaying ? 'bg-[#111111] text-white' : 'bg-white text-[#111111] hover:bg-[#FFE229]'
          }`}
        >
          <Play className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ml-0.5 ${isCurrentMoodPlaying ? 'fill-white' : 'fill-[#111111]'}`} />
        </button>
      </div>

      {/* Center Original Illustration */}
      <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 mx-auto my-1 sm:my-2 drop-shadow-[2px_2px_0px_#111111] sm:drop-shadow-[3px_3px_0px_#111111]">
        {renderIllustration()}
      </div>

      {/* Bottom Typography */}
      <div className="z-10 mt-auto pt-1 sm:pt-2">
        <h3 className="font-display font-black text-lg sm:text-2xl md:text-3xl text-[#111111] uppercase tracking-tight leading-none drop-shadow-[1px_1px_0px_white]">
          {mood.title}
        </h3>
        <p className="font-sans font-bold text-[10px] sm:text-xs md:text-sm text-[#111111]/80 mt-0.5 sm:mt-1 italic truncate sm:overflow-visible">
          &ldquo;{mood.subtitle}&rdquo;
        </p>
      </div>
    </div>
  );
}
