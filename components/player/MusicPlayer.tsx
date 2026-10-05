'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  Maximize2,
  Mic2,
  ListMusic,
  Plus,
} from 'lucide-react';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { TrackArtwork } from '@/components/doodles/OriginalIllustrations';

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    audioFrequencyData,
    queue,
    userPlaylists,
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
    setIsNowPlayingOpen,
    toggleLyrics,
    lyricsOpen,
    addTrackToPlaylist,
    playTrack,
  } = useMusicPlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const liked = isLiked(currentTrack.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* Desktop Persistent Bottom Player */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9] border-t-[3.5px] border-[#111111] shadow-[0px_-6px_0px_rgba(17,17,17,0.1)] px-6 py-3 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Left: Track Details */}
          <div className="flex items-center gap-3.5 min-w-[260px] max-w-[320px]">
            <div
              onClick={() => setIsNowPlayingOpen(true)}
              className="relative w-14 h-14 rounded-xl border-[2.5px] border-[#111111] shadow-[3px_3px_0px_#111111] cursor-pointer group flex-shrink-0 overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
              style={{ backgroundColor: currentTrack.accentColor }}
            >
              <TrackArtwork
                type={currentTrack.illustration}
                color={currentTrack.accentColor}
                isPlaying={isPlaying}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4
                onClick={() => setIsNowPlayingOpen(true)}
                className="font-display font-black text-base truncate text-[#111111] cursor-pointer hover:underline"
              >
                {currentTrack.title}
              </h4>
              <p className="font-sans font-bold text-xs text-[#111111]/70 truncate">
                <Link
                  href={`/artist/${currentTrack.artistId}`}
                  className="hover:underline hover:text-[#111111]"
                >
                  {currentTrack.artist}
                </Link>
              </p>
            </div>

            {/* Like button */}
            <button
              onClick={() => toggleLike(currentTrack.id)}
              aria-label={liked ? 'Unlike' : 'Like'}
              className="p-2 rounded-xl border-2 border-transparent hover:border-[#111111] hover:bg-white active:scale-90 transition-all flex-shrink-0"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  liked ? 'fill-[#FF5CA8] text-[#FF5CA8]' : 'text-[#111111] hover:text-[#FF5CA8]'
                }`}
              />
            </button>
          </div>

          {/* Center: Controls + Progress Bar */}
          <div className="flex-1 max-w-2xl flex flex-col items-center">
            {/* Control buttons */}
            <div className="flex items-center gap-5 mb-2">
              <button
                onClick={toggleShuffle}
                aria-label="Shuffle"
                className={`p-1.5 rounded-lg transition-transform hover:scale-110 active:scale-95 ${
                  isShuffle ? 'text-[#FF5CA8] font-bold' : 'text-[#111111]/60 hover:text-[#111111]'
                }`}
              >
                <Shuffle className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={prevTrack}
                aria-label="Previous"
                className="p-1.5 rounded-xl border-2 border-[#111111] bg-white shadow-[2px_2px_0px_#111111] hover:bg-[#FFE229] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <SkipBack className="w-4 h-4 fill-[#111111]" />
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="w-12 h-12 rounded-full border-[3px] border-[#111111] bg-[#FFE229] shadow-[3.5px_3.5px_0px_#111111] flex items-center justify-center hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#111111] transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-[#111111]" />
                ) : (
                  <Play className="w-6 h-6 fill-[#111111] ml-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                aria-label="Next"
                className="p-1.5 rounded-xl border-2 border-[#111111] bg-white shadow-[2px_2px_0px_#111111] hover:bg-[#FFE229] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <SkipForward className="w-4 h-4 fill-[#111111]" />
              </button>

              <button
                onClick={toggleRepeat}
                aria-label="Repeat"
                className={`p-1.5 rounded-lg transition-transform hover:scale-110 active:scale-95 ${
                  isRepeat ? 'text-[#8E7CFF] font-bold' : 'text-[#111111]/60 hover:text-[#111111]'
                }`}
              >
                <Repeat className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Seek Bar */}
            <div className="w-full flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#111111]/70 w-9 text-right">
                {formatTime(progress)}
              </span>

              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  seek(ratio * duration);
                }}
                className="relative flex-1 h-3 bg-[#E5DFC5] border-2 border-[#111111] rounded-full cursor-pointer shadow-[1.5px_1.5px_0px_#111111] overflow-hidden group"
              >
                <div
                  className="h-full bg-[#111111] transition-all duration-100 rounded-full relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Thumb indicator on hover */}
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#FFE229] border-2 border-[#111111] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-[#111111]/70 w-9">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Audio Waveform Visualizer + Volume + Queue */}
          <div className="flex items-center gap-4 min-w-[240px] justify-end">
            {/* Waveform Visualizer */}
            <div className="hidden xl:flex items-end gap-1 h-6 w-20 px-1 py-0.5 rounded-lg bg-black/5 border border-[#111111]/30">
              {audioFrequencyData.slice(0, 8).map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-[#111111] rounded-t-sm transition-all duration-75"
                  style={{ height: `${isPlaying ? (val / 100) * 18 : 3}px` }}
                />
              ))}
            </div>

            {/* Lyrics Toggle */}
            <button
              onClick={toggleLyrics}
              aria-label="Toggle Lyrics"
              className={`p-2 rounded-xl border-2 transition-all ${
                lyricsOpen
                  ? 'border-[#111111] bg-[#55D6BE] shadow-[2px_2px_0px_#111111]'
                  : 'border-transparent hover:border-[#111111] hover:bg-black/5'
              }`}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4 text-[#111111]" />
            </button>

            {/* Queue Toggle */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              aria-label="Toggle Queue"
              className={`p-2 rounded-xl border-2 transition-all ${
                showQueue
                  ? 'border-[#111111] bg-[#FFE229] shadow-[2px_2px_0px_#111111]'
                  : 'border-transparent hover:border-[#111111] hover:bg-black/5'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4 text-[#111111]" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="hover:scale-110 active:scale-95 transition-transform"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#111111]/70" />
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
                className="w-20 h-2 bg-[#E5DFC5] rounded-lg accent-[#111111] cursor-pointer"
              />
            </div>

            {/* Expand Poster Mode */}
            <button
              onClick={() => setIsNowPlayingOpen(true)}
              aria-label="Expand Now Playing Poster"
              className="p-2 rounded-xl border-2 border-[#111111] bg-[#FFFDF9] shadow-[2px_2px_0px_#111111] hover:bg-[#FFE229] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title="Poster Mode"
            >
              <Maximize2 className="w-4 h-4 text-[#111111]" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Queue Drawer */}
      {showQueue && (
        <div className="hidden lg:block fixed bottom-24 right-6 z-50 w-80 bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-xl rounded-[20px] p-4 max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-bottom-5 duration-150">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
            <h3 className="font-display font-black text-base uppercase">PLAYING QUEUE</h3>
            <span className="font-mono text-xs font-bold bg-[#FFE229] px-2 py-0.5 rounded-full border border-[#111111]">
              {queue.length} TRACKS
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {queue.map((track, idx) => {
              const isCur = track.id === currentTrack.id;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track)}
                  className={`flex items-center justify-between p-2 rounded-xl border-2 cursor-pointer transition-all ${
                    isCur
                      ? 'border-[#111111] bg-[#FFE229] shadow-[2px_2px_0px_#111111]'
                      : 'border-transparent hover:border-[#111111] hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#111111]/60 w-4">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-display font-black text-xs truncate text-[#111111]">
                        {track.title}
                      </p>
                      <p className="font-sans text-[11px] text-[#111111]/70 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#111111]/60">
                    {track.durationFormatted}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Lyrics Drawer */}
      {lyricsOpen && (
        <div className="hidden lg:block fixed bottom-24 right-96 z-50 w-80 bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-xl rounded-[20px] p-4 max-h-[420px] overflow-y-auto animate-in fade-in slide-in-from-bottom-5 duration-150">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
            <h3 className="font-display font-black text-base uppercase flex items-center gap-1.5">
              <Mic2 className="w-4 h-4 text-[#FF5CA8]" />
              <span>LYRICS</span>
            </h3>
            <button
              onClick={toggleLyrics}
              className="font-mono text-xs font-bold underline hover:text-[#FF5CA8]"
            >
              CLOSE
            </button>
          </div>
          <div className="mt-4 space-y-3 font-display font-bold text-sm text-[#111111] text-center leading-relaxed">
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, i) => (
                <p
                  key={i}
                  className={`py-1 transition-colors ${
                    i === 2 ? 'text-[#FF5CA8] font-black text-base scale-105' : 'text-[#111111]/70'
                  }`}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-[#111111]/50 italic">No lyrics available for this synth jam.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
