'use client';

import React from 'react';
import { AiDjSection } from '@/components/ai-dj/AiDjSection';
import { HandwrittenNote, DoodleCrown, DoodleStar } from '@/components/doodles/Doodles';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { Sliders, Activity, Zap } from 'lucide-react';

export default function AiDjPage() {
  const { currentTrack, isPlaying, audioFrequencyData } = useMusicPlayer();

  return (
    <div className="space-y-10 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-[3px] border-[#111111]/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight text-[#111111]">
              AI DJ STUDIO ✦
            </h1>
            <DoodleCrown className="w-8 h-8 text-[#FFE229]" />
          </div>
          <p className="font-sans font-bold text-xs md:text-sm text-[#111111]/70 mt-1">
            Autonomous neural mood-matching powered by VYBE&apos;s real-time synth engine.
          </p>
        </div>

        <HandwrittenNote
          text="NO BORING PLAYLISTS"
          color="#FF5CA8"
          rotation="rotate-1"
          className="self-start md:self-auto"
        />
      </div>

      {/* Main Interactive AI DJ Section */}
      <AiDjSection />

      {/* Live Audio Synthesis Specs & Visualizer Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Live Waveform */}
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]/20">
            <span className="font-display font-black text-sm uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#FF5CA8]" />
              <span>LIVE FREQUENCY SPECTRUM</span>
            </span>
            <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-[#55D6BE] rounded-full border border-[#111111]">
              {isPlaying ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>

          <div className="h-28 flex items-end gap-1.5 my-4 p-2 bg-[#F5F0E6] rounded-xl border-2 border-[#111111]">
            {audioFrequencyData.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-[#111111] rounded-t transition-all duration-75"
                style={{
                  height: `${isPlaying ? (val / 100) * 88 : 6}px`,
                  backgroundColor: idx % 2 === 0 ? '#111111' : '#8E7CFF',
                }}
              />
            ))}
          </div>

          <div className="font-mono text-[11px] font-bold text-[#111111]/70 flex justify-between">
            <span>KEY: {currentTrack.freqKey.toFixed(1)} Hz</span>
            <span>BPM: {currentTrack.bpm}</span>
          </div>
        </div>

        {/* Card 2: Neural Mood Matcher */}
        <div className="p-5 rounded-2xl bg-[#FFE229] border-[3px] border-[#111111] shadow-brutal-md flex flex-col justify-between rotate-1">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-[#111111]" />
              <h3 className="font-display font-black text-lg uppercase">
                VYBE BOT&apos;S RULE #1
              </h3>
            </div>
            <p className="font-sans font-bold text-sm text-[#111111] leading-snug">
              &ldquo;No bad music exists. Only bad mood alignment. Give me 3 words about your headspace and I&apos;ll recalibrate your reality.&rdquo;
            </p>
          </div>

          <div className="mt-4 pt-3 border-t-2 border-[#111111]/30 flex items-center justify-between font-mono text-xs font-black">
            <span>VERSION: 3.2</span>
            <span>NEURAL SYNC: 99.4%</span>
          </div>
        </div>

        {/* Card 3: Synth Engine Specs */}
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]/20">
            <span className="font-display font-black text-sm uppercase flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#8E7CFF]" />
              <span>SYNTH ENGINE STATUS</span>
            </span>
            <DoodleStar className="w-4 h-4 fill-[#FFE229]" />
          </div>

          <div className="space-y-2.5 my-3 font-mono text-xs font-bold text-[#111111]">
            <div className="flex justify-between py-1 border-b border-[#111111]/10">
              <span className="text-[#111111]/60">CURRENT TRACK:</span>
              <span className="truncate max-w-[140px]">{currentTrack.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#111111]/10">
              <span className="text-[#111111]/60">OSCILLATOR:</span>
              <span className="uppercase text-[#FF5CA8]">{currentTrack.synthWave}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#111111]/60">WEB AUDIO CONTEXT:</span>
              <span className="text-[#55D6BE]">ONLINE ✦</span>
            </div>
          </div>

          <p className="font-sans font-bold text-[11px] text-[#111111]/60 text-center">
            Zero latency algorithmic audio synthesis in your browser
          </p>
        </div>
      </div>
    </div>
  );
}
