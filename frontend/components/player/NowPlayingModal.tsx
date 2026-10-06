'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Plus,
  Volume2,
  VolumeX,
  Mic2,
  Check,
} from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';
import { DoodleCrown, DoodleStar, DoodleSparkle, HandwrittenNote } from '@/components/doodles/Doodles';

export function NowPlayingContent({
  isModal = false,
  onClose,
}: {
  isModal?: boolean;
  onClose?: () => void;
}) {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    prevTrack,
    nextTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    isLiked,
    userPlaylists,
    addTrackToPlaylist,
    toggleLyrics,
    lyricsOpen,
  } = useMusicPlayer();

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const liked = isLiked(currentTrack.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleAddToPlaylist = (playlistId: string) => {
    addTrackToPlaylist(currentTrack.id, playlistId);
    setShowPlaylistMenu(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto bg-[#F5F0E6] p-4 md:p-7 rounded-[26px] sm:rounded-[32px] border-[3.5px] sm:border-[4px] border-[#111111] shadow-brutal-xl select-none flex flex-col justify-between overflow-y-auto max-h-[92vh] no-scrollbar">
      {/* Mobile top sheet handle */}
      <div className="w-12 h-1.5 bg-[#111111]/30 rounded-full mx-auto -mt-1 mb-2.5 sm:hidden" />

      {/* Background Decorative Doodles */}
      <div className="absolute top-4 left-6 pointer-events-none opacity-40">
        <DoodleSparkle className="w-5 h-5 text-[#111111]" />
      </div>
      <div className="absolute bottom-6 right-8 pointer-events-none opacity-40">
        <DoodleStar className="w-6 h-6 fill-[#FFE229]" />
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 z-10">
        {isModal ? (
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full border-[2.5px] border-[#111111] bg-white shadow-[2px_2px_0px_#111111] flex items-center justify-center hover:bg-[#FFE229] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <X className="w-5 h-5 text-[#111111]" />
          </button>
        ) : (
          <Link
            href="/"
            aria-label="Go Home"
            className="font-mono text-xs font-black uppercase underline hover:text-[#FF5CA8]"
          >
            ← BACK TO HOME
          </Link>
        )}

        <div className="flex items-center gap-1.5">
          <span className="font-display font-black text-lg uppercase tracking-tight text-[#111111]">
            Now Playing
          </span>
          <DoodleCrown className="w-5 h-5 text-[#111111]" />
        </div>

        {/* Lyrics Button */}
        <button
          onClick={toggleLyrics}
          aria-label="Toggle Lyrics"
          className={`p-2 rounded-xl border-2 transition-all ${
            lyricsOpen
              ? 'border-[#111111] bg-[#55D6BE] shadow-[2px_2px_0px_#111111]'
              : 'border-transparent hover:border-[#111111] hover:bg-black/5'
          }`}
        >
          <Mic2 className="w-5 h-5 text-[#111111]" />
        </button>
      </div>

      {/* Physical Poster Vinyl / Artwork Frame */}
      <div className="relative my-2 w-full max-w-[340px] md:max-w-[360px] mx-auto aspect-square rounded-[24px] border-[3.5px] border-[#111111] shadow-brutal-lg overflow-hidden p-3 flex items-center justify-center group transition-transform duration-300 hover:rotate-1"
        style={{ backgroundColor: currentTrack.accentColor }}
      >
        {/* Physical Poster Tape Tag */}
        <div className="absolute top-2 left-3 z-20">
          <HandwrittenNote
            text="VYBE POSTER EDITION"
            color="#FFE229"
            rotation="-rotate-3"
            className="text-[10px] py-0.5 px-2"
          />
        </div>

        {/* Corner Doodle Sticker */}
        <div className="absolute bottom-3 right-3 z-20">
          <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            {currentTrack.bpm} BPM ✦
          </span>
        </div>

        {/* Center Artwork */}
        <div className="relative w-full h-full flex items-center justify-center">
          <TrackArtwork
            type={currentTrack.illustration}
            color={currentTrack.accentColor}
            isPlaying={isPlaying}
            className="w-full h-full scale-105"
          />
        </div>

        {/* Overlay Lyrics Preview if open */}
        {lyricsOpen && (
          <div className="absolute inset-0 bg-[#FFFDF9]/95 p-6 flex flex-col justify-center items-center text-center z-30 animate-in fade-in duration-200">
            <span className="font-mono text-xs font-black uppercase text-[#FF5CA8] mb-2">
              ✦ LYRICS ON AIR ✦
            </span>
            <div className="space-y-3 font-display font-black text-sm md:text-base text-[#111111]">
              {currentTrack.lyrics?.slice(0, 4).map((line, i) => (
                <p key={i} className={i === 1 ? 'text-[#FF5CA8] text-lg' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Song Details & Heart Button */}
      <div className="flex items-center justify-between gap-4 mt-4 px-1">
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight text-[#111111] truncate leading-tight drop-shadow-[1px_1px_0px_white]">
            {currentTrack.title}
          </h2>
          <p className="font-sans font-bold text-sm md:text-base text-[#111111]/75 truncate mt-0.5">
            <Link
              href={`/artist/${currentTrack.artistId}`}
              className="hover:underline hover:text-[#111111]"
            >
              {currentTrack.artist}
            </Link>
          </p>
        </div>

        {/* Heart button */}
        <button
          onClick={() => toggleLike(currentTrack.id)}
          aria-label={liked ? 'Unlike' : 'Like'}
          className="w-12 h-12 rounded-full border-[2.5px] border-[#111111] bg-white shadow-[3px_3px_0px_#111111] flex items-center justify-center hover:bg-[#FFE229] active:scale-90 transition-all flex-shrink-0"
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              liked ? 'fill-[#FF5CA8] text-[#FF5CA8]' : 'text-[#111111]'
            }`}
          />
        </button>
      </div>

      {/* Progress Bar (Physical Offset Ruler Style) */}
      <div className="mt-5 px-1">
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            seek(ratio * duration);
          }}
          className="relative w-full h-3.5 bg-[#E5DFC5] border-[2.5px] border-[#111111] rounded-full cursor-pointer shadow-[2px_2px_0px_#111111] overflow-hidden"
        >
          <div
            className="h-full bg-[#111111] rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center font-mono text-xs font-black text-[#111111]/80 mt-1.5">
          <span>{formatTime(progress)}</span>
          <span className="text-[10px] text-[#111111]/50 tracking-widest">
            — — — — — — — — — — — — —
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls: Shuffle, Previous, PLAY/PAUSE, Next, Repeat */}
      <div className="flex items-center justify-between px-2 mt-4">
        <button
          onClick={toggleShuffle}
          aria-label="Shuffle"
          className={`p-2 rounded-xl transition-all ${
            isShuffle ? 'text-[#FF5CA8] scale-110 font-bold' : 'text-[#111111]/70 hover:text-[#111111]'
          }`}
        >
          <Shuffle className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={prevTrack}
          aria-label="Previous Track"
          className="w-11 h-11 rounded-full border-[2.5px] border-[#111111] bg-white shadow-[2.5px_2.5px_0px_#111111] flex items-center justify-center hover:bg-[#FFE229] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <SkipBack className="w-5 h-5 fill-[#111111]" />
        </button>

        {/* Big PLAY/PAUSE Button */}
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-16 h-16 rounded-full border-[3.5px] border-[#111111] bg-[#FFE229] shadow-brutal-md flex items-center justify-center hover:scale-105 active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_#111111] transition-all"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-[#111111]" />
          ) : (
            <Play className="w-8 h-8 fill-[#111111] ml-1" />
          )}
        </button>

        <button
          onClick={nextTrack}
          aria-label="Next Track"
          className="w-11 h-11 rounded-full border-[2.5px] border-[#111111] bg-white shadow-[2.5px_2.5px_0px_#111111] flex items-center justify-center hover:bg-[#FFE229] active:translate-x-0.5 active:translate-y-0.5 transition-all"
        >
          <SkipForward className="w-5 h-5 fill-[#111111]" />
        </button>

        <button
          onClick={toggleRepeat}
          aria-label="Repeat"
          className={`p-2 rounded-xl transition-all ${
            isRepeat ? 'text-[#8E7CFF] scale-110 font-bold' : 'text-[#111111]/70 hover:text-[#111111]'
          }`}
        >
          <Repeat className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Volume Bar inside Poster */}
      <div className="flex items-center justify-center gap-3 mt-4 px-4">
        <button onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-[#111111]/60" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#111111]" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-36 h-2 bg-[#E5DFC5] rounded-lg accent-[#111111] cursor-pointer"
        />
      </div>

      {/* "+ ADD TO PLAYLIST" Button */}
      <div className="relative mt-5 z-20">
        <button
          onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
          className={`w-full py-3 px-5 rounded-2xl border-[3px] border-[#111111] font-display font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
            addedSuccess
              ? 'bg-[#55D6BE] text-[#111111] shadow-[2px_2px_0px_#111111]'
              : 'bg-[#FFE229] hover:bg-[#FFE229]/90 shadow-brutal-sm hover:shadow-brutal active:translate-x-0.5 active:translate-y-0.5'
          }`}
        >
          {addedSuccess ? (
            <>
              <Check className="w-5 h-5" />
              <span>ADDED TO PLAYLIST!</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>+ ADD TO PLAYLIST</span>
            </>
          )}
        </button>

        {/* Playlist selection modal/dropdown */}
        {showPlaylistMenu && (
          <div className="absolute bottom-14 left-0 right-0 bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-lg rounded-2xl p-3 z-30 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="font-mono text-xs font-black uppercase pb-2 mb-1 border-b border-[#111111]/20">
              CHOOSE PLAYLIST:
            </div>
            {userPlaylists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id)}
                className="w-full text-left p-2 rounded-xl text-xs font-bold hover:bg-[#FFE229] transition-colors truncate flex items-center justify-between"
              >
                <span>{pl.title}</span>
                <span className="font-mono text-[10px] text-[#111111]/60">
                  {pl.trackCount} songs
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function NowPlayingModal() {
  const { isNowPlayingOpen, setIsNowPlayingOpen } = useMusicPlayer();

  if (!isNowPlayingOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg">
        <NowPlayingContent isModal onClose={() => setIsNowPlayingOpen(false)} />
      </div>
    </div>
  );
}
