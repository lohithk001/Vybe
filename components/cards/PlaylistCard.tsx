'use client';

import React from 'react';
import Link from 'next/link';
import { Playlist } from '@/types/music';
import { Play, MoreVertical } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';

export function PlaylistCard({
  playlist,
  layout = 'card', // 'card' | 'compact'
}: {
  playlist: Playlist;
  layout?: 'card' | 'compact';
}) {
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  const isPlaylistActive =
    playlist.tracks.some((t) => t.id === currentTrack.id) && isPlaying;

  const handlePlayPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  if (layout === 'compact') {
    return (
      <Link
        href={`/playlist/${playlist.id}`}
        className="group flex items-center justify-between gap-3 p-3 bg-[#FFFDF9] border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] rounded-2xl hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#111111] active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_#111111] transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ backgroundColor: playlist.accentColor }}
          >
            <TrackArtwork
              type={playlist.illustration}
              color={playlist.accentColor}
              isPlaying={isPlaylistActive}
              className="w-full h-full scale-105"
            />
          </div>
          <div className="min-w-0">
            <h4 className="font-display font-black text-sm sm:text-base truncate text-[#111111] group-hover:underline">
              {playlist.title}
            </h4>
            <p className="font-sans font-medium text-xs text-[#111111]/70 truncate">
              {playlist.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handlePlayPlaylist}
            aria-label={`Play ${playlist.title}`}
            className="w-9 h-9 rounded-full border-2 border-[#111111] bg-white group-hover:bg-[#FFE229] shadow-[2px_2px_0px_#111111] flex items-center justify-center active:scale-90 transition-all"
          >
            <Play className="w-4 h-4 fill-[#111111] text-[#111111] ml-0.5" />
          </button>
          <button
            aria-label="More options"
            className="p-1.5 rounded-lg text-[#111111]/60 hover:text-[#111111]"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="group relative flex flex-col justify-between p-3 sm:p-4 bg-[#FFFDF9] border-[2.5px] sm:border-[3px] border-[#111111] shadow-brutal-sm sm:shadow-brutal-md rounded-[20px] sm:rounded-[22px] transition-all duration-200 hover:-translate-y-1 hover:shadow-brutal-lg active:translate-y-0.5 active:shadow-brutal-xs flex-shrink-0 w-[156px] sm:w-[195px] md:w-[220px]"
    >
      {/* Artwork Box */}
      <div
        className="relative w-full aspect-square rounded-xl border-[2px] sm:border-[2.5px] border-[#111111] shadow-[2.5px_2.5px_0px_#111111] overflow-hidden p-2 flex items-center justify-center transition-transform group-hover:rotate-1"
        style={{ backgroundColor: playlist.accentColor }}
      >
        <TrackArtwork
          type={playlist.illustration}
          color={playlist.accentColor}
          isPlaying={isPlaylistActive}
          className="w-full h-full scale-100"
        />

        {/* Floating Play Button */}
        <button
          onClick={handlePlayPlaylist}
          aria-label={`Play ${playlist.title}`}
          className="absolute right-2 bottom-2 sm:right-2.5 sm:bottom-2.5 w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 sm:border-[2.5px] border-[#111111] bg-[#FFE229] shadow-[2.5px_2.5px_0px_#111111] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-90"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-[#111111] text-[#111111] ml-0.5" />
        </button>
      </div>

      {/* Playlist Meta */}
      <div className="mt-2.5 sm:mt-3">
        <h3 className="font-display font-black text-sm sm:text-base md:text-lg text-[#111111] truncate leading-tight group-hover:underline">
          {playlist.title}
        </h3>
        <p className="font-sans font-medium text-[11px] sm:text-xs text-[#111111]/70 truncate mt-0.5 sm:mt-1">
          {playlist.subtitle}
        </p>
      </div>
    </Link>
  );
}
