'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Play, Wand2 } from 'lucide-react';
import { DjMascot } from '@/components/doodles/OriginalIllustrations';
import { generateAiDjCrate } from '@/services/api';
import { Track } from '@/types/music';
import { SongRow } from '@/components/cards/SongRow';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import confetti from 'canvas-confetti';

export function AiDjSection() {
  const { playTrack, isPlaying } = useMusicPlayer();
  const [prompt, setPrompt] = useState('Give me songs for a late-night coding session');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('LATE NIGHT CODING FLOW');
  const [generatedTracks, setGeneratedTracks] = useState<Track[]>([]);

  const suggestedMoods = [
    { label: 'FOCUS', color: '#FFE229', query: 'Deep focus binaural beats for nonstop programming' },
    { label: 'CHILL', color: '#55D6BE', query: 'Rainy window lo-fi and soft acoustic vibes' },
    { label: 'MOTIVATION', color: '#FF8A3D', query: 'High-octane gym motivation and PR energy' },
    { label: 'SAD', color: '#6DB7FF', query: 'Melancholic 2 AM ceiling stare indie songs' },
    { label: 'HAPPY', color: '#FFE229', query: 'Pure sunshine dopamine upbeat pop classics' },
    { label: 'PARTY', color: '#FF5CA8', query: 'Unhinged chaotic bass boosted dance bangers' },
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const activeQuery = customPrompt || prompt;
    if (!activeQuery.trim()) return;

    if (customPrompt) setPrompt(customPrompt);
    setIsGenerating(true);

    try {
      const res = await generateAiDjCrate(activeQuery);
      setGeneratedTitle(res.commentary);
      if (res.tracks && res.tracks.length > 0) {
        setGeneratedTracks(res.tracks);
      }
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFE229', '#8E7CFF', '#55D6BE', '#FF5CA8'],
        });
      } catch {
        // confetti fallback
      }
    } catch (err) {
      console.warn('AI DJ error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    handleGenerate('Give me songs for a late-night coding session');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayAllGenerated = () => {
    if (generatedTracks.length > 0) {
      playTrack(generatedTracks[0], generatedTracks);
    }
  };

  return (
    <div className="relative bg-[#FFFDF9] border-[3.5px] border-[#111111] shadow-brutal-lg rounded-[28px] p-6 md:p-8 overflow-hidden select-none">
      {/* Decorative top badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-[2.5px] border-[#111111]/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-3xl md:text-4xl uppercase tracking-tight text-[#111111]">
              AI DJ ✦
            </h2>
            <span className="font-mono text-xs font-black bg-[#8E7CFF] text-white px-2.5 py-1 rounded-full border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              VYBE BOT
            </span>
          </div>
          <p className="font-sans font-bold text-sm md:text-base text-[#111111]/70 mt-1">
            Tell me your mood. I&apos;ll build the playlist.
          </p>
        </div>

        {/* Mascot Robot */}
        <div className="flex items-center gap-3">
          <DjMascot
            className="w-20 h-20 md:w-24 md:h-24 hover:rotate-3 transition-transform cursor-pointer"
            isThinking={isGenerating}
            isPlaying={isPlaying}
          />
          <div className="hidden sm:block p-3 rounded-2xl bg-[#FFE229] border-2 border-[#111111] shadow-[2.5px_2.5px_0px_#111111] max-w-[200px] text-xs font-bold leading-tight -rotate-1">
            &ldquo;Feed me your vibe, human! I don&apos;t sleep anyway.&rdquo;
          </div>
        </div>
      </div>

      {/* Interactive Input Form */}
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Give me songs for a late-night coding session..."
              className="w-full bg-[#F5F0E6] border-[3px] border-[#111111] shadow-[3.5px_3.5px_0px_#111111] rounded-2xl px-4 py-3.5 font-sans font-bold text-sm md:text-base text-[#111111] placeholder:text-[#111111]/40 focus:outline-none focus:bg-white focus:shadow-[4.5px_4.5px_0px_#8E7CFF] transition-all"
            />
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating}
            className="px-6 py-3.5 rounded-2xl border-[3px] border-[#111111] bg-[#FFE229] shadow-brutal-sm hover:shadow-brutal hover:bg-[#FFE229]/90 active:translate-x-0.5 active:translate-y-0.5 font-display font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-5 h-5 animate-spin" />
                <span>COOKING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>GENERATE</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Mood Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="font-mono text-xs font-black uppercase text-[#111111]/60 mr-1">
            SUGGESTED VIBES:
          </span>
          {suggestedMoods.map((m) => (
            <button
              key={m.label}
              onClick={() => {
                setPrompt(m.query);
                handleGenerate(m.query);
              }}
              className="px-3 py-1 rounded-xl border-2 border-[#111111] font-display font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#111111] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#111111] active:translate-y-0.5 active:shadow-none transition-all"
              style={{ backgroundColor: m.color }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Results Area */}
      <div className="mt-8 pt-6 border-t-[2.5px] border-[#111111]/20">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#8E7CFF]">
              ✦ CURATED BY VYBE BOT ✦
            </span>
            <h3 className="font-display font-black text-xl md:text-2xl text-[#111111] uppercase tracking-tight">
              {generatedTitle}
            </h3>
          </div>

          <button
            onClick={handlePlayAllGenerated}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-[2.5px] border-[#111111] bg-[#55D6BE] shadow-[2.5px_2.5px_0px_#111111] hover:bg-[#55D6BE]/90 font-display font-black text-xs md:text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-[#111111]" />
            <span>PLAY SET</span>
          </button>
        </div>

        {generatedTracks.length > 0 ? (
          <div className="space-y-2">
            {generatedTracks.map((track, idx) => (
              <SongRow
                key={track.id}
                track={track}
                index={idx}
                playlistQueue={generatedTracks}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#F5F0E6] rounded-2xl border-2 border-dashed border-[#111111]/30">
            <p className="font-display font-black text-sm uppercase text-[#111111]">
              {isGenerating ? 'SUMMONING LIVE TRACKS FROM THE SOUND MATRIX...' : 'CLICK GENERATE TO DROP YOUR CUSTOM CRATE'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
