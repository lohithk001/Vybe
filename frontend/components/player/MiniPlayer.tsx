'use client';

import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    toggleLike,
    isLiked,
    setIsNowPlayingOpen,
  } = useMusicPlayer();

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      onClick={() => setIsNowPlayingOpen(true)}
      className="lg:hidden fixed bottom-[calc(66px+env(safe-area-inset-bottom,4px))] left-3 right-3 z-40 bg-[#FFFDF9] border-[3px] border-[#111111] shadow-[4px_4px_0px_#111111] rounded-2xl p-2.5 flex items-center justify-between cursor-pointer select-none active:scale-[0.98] transition-transform overflow-hidden"
    >
      {/* Top Edge Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#111111]/15">
        <div
          className="h-full bg-[#FF5CA8] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Thumbnail & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
        <div
          className="w-11 h-11 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111] overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: currentTrack.accentColor }}
        >
          {currentTrack.thumbnailUrl ? (
            <img
              src={currentTrack.thumbnailUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <TrackArtwork
              type={currentTrack.illustration}
              color={currentTrack.accentColor}
              isPlaying={isPlaying}
              className="w-full h-full scale-105"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="font-display font-black text-sm truncate text-[#111111] leading-tight">
              {currentTrack.title}
            </h4>
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5CA8] animate-ping flex-shrink-0" />
            )}
          </div>
          <p className="font-sans font-bold text-xs text-[#111111]/70 truncate mt-0.5">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Right: Heart & Play/Pause */}
      <div
        className="flex items-center gap-1.5 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => toggleLike(currentTrack.id)}
          aria-label={liked ? 'Unlike' : 'Like'}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              liked ? 'fill-[#FF5CA8] text-[#FF5CA8]' : 'text-[#111111]'
            }`}
          />
        </button>

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-10 h-10 rounded-full border-[2.5px] border-[#111111] bg-[#FFE229] shadow-[2px_2px_0px_#111111] flex items-center justify-center active:scale-90 active:translate-x-0.5 active:translate-y-0.5 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-[#111111]" />
          ) : (
            <Play className="w-5 h-5 fill-[#111111] ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
