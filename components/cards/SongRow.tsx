'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Track } from '@/types/music';
import { Play, Pause, Heart, MoreVertical, Plus, Disc, Mic2 } from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';

export function SongRow({
  track,
  index,
  showIndex = true,
  playlistQueue,
}: {
  track: Track;
  index: number;
  showIndex?: boolean;
  playlistQueue?: Track[];
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleLike, isLiked, userPlaylists, addTrackToPlaylist, toggleLyrics } = useMusicPlayer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

  const isCurrent = currentTrack.id === track.id;
  const isThisPlaying = isCurrent && isPlaying;
  const liked = isLiked(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, playlistQueue);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(track.id);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center justify-between gap-3 p-2.5 md:p-3 rounded-2xl border-[2.5px] border-[#111111] transition-all duration-150 cursor-pointer select-none ${
        isCurrent
          ? 'bg-[#FFE229] shadow-[4px_4px_0px_#111111] translate-x-0.5'
          : 'bg-[#FFFDF9] hover:bg-white hover:shadow-[3px_3px_0px_#111111] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#111111]'
      }`}
    >
      {/* Left: Index / Play & Artwork & Title */}
      <div className="flex items-center gap-3 min-w-0">
        {showIndex && (
          <span className="w-5 text-center font-mono font-bold text-xs text-[#111111]/70">
            {isThisPlaying ? (
              <span className="flex items-end justify-center gap-0.5 h-3.5">
                <span className="w-1 bg-[#111111] h-3 animate-pulse" />
                <span className="w-1 bg-[#111111] h-2 animate-bounce" />
                <span className="w-1 bg-[#111111] h-3.5 animate-pulse" />
              </span>
            ) : (
              String(index + 1).padStart(2, '0')
            )}
          </span>
        )}

        {/* Thumbnail artwork */}
        <div
          className="relative w-12 h-12 rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111] overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: track.accentColor }}
        >
          <TrackArtwork
            type={track.illustration}
            color={track.accentColor}
            isPlaying={isThisPlaying}
            className="w-full h-full scale-110"
          />

          {/* Hover overlay play icon */}
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isThisPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Titles */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              className={`font-display font-black text-sm md:text-base truncate leading-tight ${
                isCurrent ? 'text-[#111111] underline decoration-2' : 'text-[#111111]'
              }`}
            >
              {track.title}
            </h4>
            {isCurrent && (
              <span className="inline-block px-1.5 py-0.2 text-[9px] font-black uppercase bg-[#111111] text-white rounded">
                LIVE
              </span>
            )}
          </div>
          <p className="font-sans font-medium text-xs text-[#111111]/70 truncate mt-0.5">
            <Link
              href={`/artist/${track.artistId}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-[#111111] hover:underline"
            >
              {track.artist}
            </Link>
            <span className="mx-1">•</span>
            <span className="text-[#111111]/50">{track.album}</span>
          </p>
        </div>
      </div>

      {/* Right Controls: Duration, Heart, More Menu */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <span className="font-mono text-xs font-bold text-[#111111]/70 hidden sm:inline-block">
          {track.durationFormatted}
        </span>

        {/* Like Button */}
        <button
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
          className="p-1.5 rounded-lg border-2 border-transparent hover:border-[#111111] hover:bg-white active:scale-90 transition-transform"
        >
          <Heart
            className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
              liked ? 'fill-[#FF5CA8] text-[#FF5CA8]' : 'text-[#111111] hover:text-[#FF5CA8]'
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
              setShowPlaylistPicker(false);
            }}
            aria-label="More options"
            className="p-1.5 rounded-lg hover:bg-black/5 active:scale-95 transition-transform"
          >
            <MoreVertical className="w-4 h-4 text-[#111111]" />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 z-30 w-48 bg-[#FFFDF9] border-[2.5px] border-[#111111] shadow-[4px_4px_0px_#111111] rounded-xl p-1.5 text-xs font-bold animate-in fade-in zoom-in-95 duration-100"
            >
              <button
                onClick={() => {
                  setShowPlaylistPicker((prev) => !prev);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-[#FFE229] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Playlist...</span>
              </button>

              {showPlaylistPicker && (
                <div className="pl-3 pr-1 py-1 border-t border-b border-[#111111]/20 my-1 max-h-32 overflow-y-auto">
                  {userPlaylists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => {
                        addTrackToPlaylist(track.id, pl.id);
                        setMenuOpen(false);
                        setShowPlaylistPicker(false);
                      }}
                      className="w-full text-left py-1 text-[11px] truncate hover:text-[#FF5CA8]"
                    >
                      + {pl.title}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  toggleLyrics();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-[#55D6BE] transition-colors"
              >
                <Mic2 className="w-4 h-4" />
                <span>View Lyrics</span>
              </button>

              <Link
                href={`/artist/${track.artistId}`}
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:bg-[#8E7CFF] hover:text-white transition-colors"
              >
                <Disc className="w-4 h-4" />
                <span>View Artist</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
