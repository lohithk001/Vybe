'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, Volume2, VolumeX, Flame, Disc, Radio, Wand2, Zap } from 'lucide-react';
import { DoodleCrown, DoodleStar, DoodleSparkle, DoodleLightning } from '@/components/doodles/Doodles';

export function AppOpeningSplash() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [stickerBounced, setStickerBounced] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const tickerPhrases = [
    'NO BORING PLAYLISTS',
    'REAL YOUTUBE MUSIC STREAMS',
    'AUTONOMOUS AI DJ CRATES',
    'TAP TO ENTER THE VYBE ✦',
  ];

  // Helper to ensure AudioContext is initialized and resumed safely
  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return ctx;
    } catch {
      return null;
    }
  };

  // Sound synthesis for explosive entrance: Synth Riser Chord + Heavy 808 Sub Thump
  const playEntranceSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Polyphonic Synth Riser: Cmaj9 chord (C4, E4, G4, B4, D5) ramping up
      const chord = [261.63, 329.63, 392.0, 493.88, 587.33];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Sawtooth & Triangle blended for punchy warm synth
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        const startOffset = now + idx * 0.03;
        osc.frequency.setValueAtTime(freq, startOffset);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.85, startOffset + 0.55);

        gain.gain.setValueAtTime(0.001, startOffset);
        gain.gain.linearRampToValueAtTime(0.12, startOffset + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, startOffset + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startOffset);
        osc.stop(startOffset + 0.7);
      });

      // 808 Sub-Bass Impact Thump
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(150, now);
      bassOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6);

      bassGain.gain.setValueAtTime(0.35, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.62);
    } catch {
      // Audio safety catch for restricted mobile environments
    }
  };

  // Sound synthesis for playful sticker taps
  const playPopSound = (freq = 700) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    // Show splash once per session (unless replayed manually)
    const hasSeenSplash = sessionStorage.getItem('vybe_splash_seen_v3');
    if (!hasSeenSplash) {
      setIsVisible(true);
    }

    // Expose global trigger for replaying from Profile page anytime
    (window as any).replayVybeSplash = () => {
      setIsVisible(true);
      setIsZooming(false);
      setTickerIndex(0);
      setActiveReaction(null);
    };
  }, []);

  // Smooth ticker cycling - NEVER AUTO ENTERS! User stays in full control.
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerPhrases.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isVisible, tickerPhrases.length]);

  // Main Action: Camera Hyper-Zoom Directly into the "VYBE" Word
  const handleEnterApp = () => {
    if (isZooming) return;
    setIsZooming(true);

    playEntranceSound();

    try {
      // High-performance canvas confetti with capped particle count
      confetti({
        particleCount: 75,
        spread: 85,
        origin: { y: 0.5 },
        colors: ['#FFE229', '#FF5CA8', '#55D6BE', '#8E7CFF', '#111111'],
        disableForReducedMotion: true,
      });
    } catch {}

    sessionStorage.setItem('vybe_splash_seen_v3', 'true');

    // Smooth warp transition timing
    setTimeout(() => {
      setIsVisible(false);
      setIsZooming(false);
    }, 700);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem('vybe_splash_seen_v3', 'true');
    setIsVisible(false);
  };

  const handleStickerTap = (name: string, reactionText: string, soundFreq = 700) => {
    setStickerBounced(name);
    setActiveReaction(reactionText);
    playPopSound(soundFreq);
    setTimeout(() => setStickerBounced(null), 350);
    setTimeout(() => setActiveReaction(null), 1400);
  };

  if (!mounted || !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] select-none overflow-hidden touch-manipulation transition-all duration-700 ease-out ${
        isZooming
          ? 'opacity-0 scale-150 pointer-events-none'
          : 'opacity-100 scale-100 bg-[#F5F0E6]'
      }`}
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        minHeight: '100dvh',
        backgroundImage: `radial-gradient(#111111 1.2px, transparent 1.2px)`,
        backgroundSize: '22px 22px',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Radiant Animated Aura Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] xs:w-[380px] sm:w-[540px] md:w-[680px] h-[300px] xs:h-[380px] sm:h-[540px] md:h-[680px] rounded-full blur-3xl opacity-40 bg-gradient-to-tr from-[#FF5CA8] via-[#FFE229] to-[#55D6BE] pointer-events-none transition-transform duration-1000 animate-pulse-glow" />

      {/* Floating Background Doodles (Music Notes & Sparkles) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span
          className="absolute top-[18%] left-[8%] text-[#111111]/30 font-display font-black text-2xl animate-float-upward"
          style={{ animationDelay: '0.2s' }}
        >
          ♪
        </span>
        <span
          className="absolute top-[35%] right-[10%] text-[#FF5CA8]/40 font-display font-black text-xl animate-float-upward"
          style={{ animationDelay: '1.2s' }}
        >
          ♫
        </span>
        <span
          className="absolute bottom-[24%] left-[12%] text-[#FFE229] font-display font-black text-3xl animate-float-upward"
          style={{ animationDelay: '2.1s' }}
        >
          ✦
        </span>
        <span
          className="absolute bottom-[28%] right-[14%] text-[#55D6BE] font-display font-black text-xl animate-float-upward"
          style={{ animationDelay: '3.0s' }}
        >
          ⚡
        </span>
      </div>

      {/* Comic Warp Speed Lines (Appears during Entrance Zoom) */}
      {isZooming && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="w-[180vw] h-[180vw] rounded-full border-[10px] border-[#FFE229] animate-comic-shockwave" />
          <div className="absolute w-[140vw] h-[140vw] rounded-full border-[6px] border-[#FF5CA8] animate-comic-shockwave" style={{ animationDelay: '0.1s' }} />
        </div>
      )}

      {/* Floating Reaction Bubble when stickers are tapped */}
      {activeReaction && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <span className="inline-block px-3 py-1 rounded-full bg-[#111111] text-[#FFE229] font-display font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-white shadow-brutal-sm">
            {activeReaction}
          </span>
        </div>
      )}

      {/* Main Responsive Flex Layout - Fits Strictly within 100dvh */}
      <div className="relative z-10 w-full h-full max-w-xl mx-auto flex flex-col justify-between p-3 xs:p-4 sm:p-6 pt-[max(10px,env(safe-area-inset-top))] pb-[max(14px,env(safe-area-inset-bottom))]">
        {/* Top Header Bar: SFX Toggle and Skip Button */}
        <div className="flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-[10px] xs:text-[11px] font-black text-[#111111] active:translate-y-0.5 transition-all"
            aria-label="Toggle Sound Effects"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#111111]" />
                <span>SFX: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#111111]/50" />
                <span>SFX: OFF</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-[10px] xs:text-[11px] font-black text-[#111111] hover:bg-[#FF5CA8] hover:text-white active:translate-y-0.5 transition-all"
          >
            <span>SKIP</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Center Hero Area: Vinyl Turntable + Official Logo + Kinetic Typography */}
        <div className="flex-1 flex flex-col items-center justify-center my-auto px-1 py-1 sm:py-2">
          {/* Top Interactive Crown Pill */}
          <div
            onClick={() => handleStickerTap('crown', '👑 AUX GOD STATUS UNLOCKED', 800)}
            className={`cursor-pointer mb-2 sm:mb-4 transition-transform duration-200 flex-shrink-0 ${
              stickerBounced === 'crown' ? 'scale-125 rotate-6' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 font-display font-black text-xs xs:text-sm uppercase tracking-wider text-[#111111] bg-[#FFE229] border-2 border-[#111111] shadow-[2.5px_2.5px_0px_#111111] rounded-full -rotate-1">
              <DoodleCrown className="w-4 h-4 text-[#111111]" />
              <span>GEN-Z AUDIO OS</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FF5CA8]" />
            </div>
          </div>

          {/* LOGO STAGE: Spinning Vinyl + Official Comic Logo + Floating Stickers */}
          <div className="relative flex items-center justify-center my-1 sm:my-3">
            {/* Spinning Vinyl Turntable with Grooves & Sheen Reflection */}
            <div
              className={`relative w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-full border-[3.5px] border-[#111111] bg-[#111111] shadow-brutal flex items-center justify-center transition-all duration-700 pointer-events-none overflow-hidden ${
                isZooming ? 'scale-[8] opacity-0' : 'animate-spin-slow'
              }`}
            >
              {/* Dynamic Vinyl Sheen Light Reflection Sweep */}
              <div
                className="absolute inset-0 animate-vinyl-sheen pointer-events-none"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.18) 60deg, transparent 120deg, rgba(255,255,255,0.18) 240deg, transparent 300deg)',
                }}
              />

              {/* Outer Groove */}
              <div className="w-[84%] h-[84%] rounded-full border border-white/20 flex items-center justify-center">
                {/* Middle Groove */}
                <div className="w-[70%] h-[70%] rounded-full border border-white/15 flex items-center justify-center">
                  {/* Inner Groove */}
                  <div className="w-[52%] h-[52%] rounded-full border border-white/15 flex items-center justify-center">
                    {/* Yellow Turntable Center Label */}
                    <div className="w-11 h-11 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFE229] border-2 border-[#111111] shadow-[1.5px_1.5px_0px_#111111] flex flex-col items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#111111]" />
                      <span className="font-mono text-[7px] font-black text-[#111111] mt-0.5 tracking-tighter">
                        45 RPM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Turntable Tone Arm Needle resting on Vinyl */}
            <div
              className={`absolute -top-3 -right-3 xs:-top-4 xs:-right-4 w-12 xs:w-16 h-12 xs:h-16 pointer-events-none transition-all duration-500 z-10 ${
                isZooming ? 'opacity-0 scale-50' : 'opacity-100'
              }`}
            >
              <div className="relative w-full h-full">
                {/* Tone arm base pivot */}
                <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#FFFDF9] border-2 border-[#111111] shadow-[1.5px_1.5px_0px_#111111]" />
                {/* Metal tone arm line */}
                <div className="absolute top-2 right-2 w-8 xs:w-10 h-1 bg-[#111111] origin-top-right rotate-45 rounded-full" />
                {/* Cartridge head */}
                <div className="absolute bottom-2 left-2 w-3.5 h-2 bg-[#FF5CA8] border border-[#111111] rounded-sm rotate-45 shadow-[1px_1px_0px_#111111]" />
              </div>
            </div>

            {/* Official Comic Graffiti Logo (Tapping zooms straight into the word) */}
            <div
              onClick={handleEnterApp}
              className={`relative z-20 cursor-pointer p-2 transition-all duration-700 ease-out will-change-transform ${
                isZooming
                  ? 'scale-[24] sm:scale-[32] rotate-3 opacity-0'
                  : 'animate-float-gentle active:scale-95 hover:scale-105'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/vybe-logo.png"
                alt="VYBE"
                className="h-24 xs:h-28 sm:h-38 md:h-48 w-auto object-contain filter drop-shadow-[5px_5px_0px_#111111] transition-transform duration-200"
              />

              {/* Floating Star Sticker */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleStickerTap('star', '✦ 100% REAL MUSIC SYNCED', 900);
                }}
                className={`absolute -top-2 -right-1 xs:-top-3 xs:-right-2 sm:-top-4 sm:-right-4 transition-transform duration-200 cursor-pointer ${
                  stickerBounced === 'star' ? 'scale-150 rotate-45' : 'hover:scale-115 active:scale-90'
                }`}
              >
                <DoodleStar className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 fill-[#FFE229]" />
              </div>

              {/* Floating "100% REAL" Sticker */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleStickerTap('real', '⚡ ZERO AUDIO ADS EVER', 650);
                }}
                className={`absolute -bottom-1 -left-2 xs:-bottom-2 xs:-left-3 sm:-bottom-3 sm:-left-4 transition-transform duration-200 cursor-pointer ${
                  stickerBounced === 'real' ? 'scale-125 -rotate-12' : 'hover:scale-110 active:scale-90'
                }`}
              >
                <span className="inline-block px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FF5CA8] text-white font-mono text-[9px] sm:text-[11px] font-black border-2 border-[#111111] shadow-[2px_2px_0px_#111111] -rotate-6">
                  100% REAL
                </span>
              </div>
            </div>
          </div>

          {/* Kinetic Typography Title: "GET INTO THE VYBE" */}
          <div className="mt-2 xs:mt-3 sm:mt-4 text-center flex-shrink-0">
            <div className="inline-block">
              <h1 className="font-display font-black text-2xl xs:text-3xl sm:text-4xl uppercase tracking-tight text-[#111111] drop-shadow-[2px_2px_0px_#FFE229]">
                GET INTO THE VYBE
              </h1>
              <div className="h-1.5 w-full bg-[#FF5CA8] rounded-full border border-[#111111] shadow-[2px_2px_0px_#111111] mt-0.5 sm:mt-1" />
            </div>

            {/* Cycling Interactive Feature Pill */}
            <div className="h-6 xs:h-7 mt-2 flex items-center justify-center">
              <span
                key={tickerIndex}
                className="font-mono text-[10px] xs:text-[11px] sm:text-xs font-black uppercase text-[#111111] bg-white/95 px-3 py-0.5 rounded-full border border-[#111111] shadow-[1.5px_1.5px_0px_#111111] animate-in fade-in duration-200"
              >
                ✦ {tickerPhrases[tickerIndex]}
              </span>
            </div>
          </div>

          {/* Dynamic 16-Bar Audio Frequency Visualizer (Animated waves) */}
          <div className="flex items-end justify-center gap-1 xs:gap-1.5 mt-3 xs:mt-4 h-6 xs:h-7 sm:h-8 flex-shrink-0">
            {[0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0, 1, 2, 0].map((type, i) => (
              <div
                key={i}
                className={`w-1 xs:w-1.5 rounded-full border border-[#111111] ${
                  type === 0 ? 'animate-eq-a' : type === 1 ? 'animate-eq-b' : 'animate-eq-c'
                }`}
                style={{
                  backgroundColor:
                    i % 4 === 0
                      ? '#FFE229'
                      : i % 4 === 1
                      ? '#FF5CA8'
                      : i % 4 === 2
                      ? '#55D6BE'
                      : '#8E7CFF',
                  animationDelay: `${(i * 0.06).toFixed(2)}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA Area: Ergonomic Mobile-Optimized Action Target */}
        <div className="w-full pt-2 flex flex-col items-center flex-shrink-0">
          <button
            onClick={handleEnterApp}
            className="w-full max-w-sm group relative py-3.5 sm:py-4 px-6 rounded-2xl bg-[#FFE229] border-[3.5px] border-[#111111] shadow-brutal-md hover:shadow-brutal-lg active:translate-y-1 active:shadow-brutal-xs font-display font-black text-base sm:text-xl uppercase tracking-wider text-[#111111] flex items-center justify-center gap-2.5 transition-all"
          >
            <Sparkles className="w-5 h-5 text-[#FF5CA8] group-hover:rotate-12 transition-transform" />
            <span>ENTER THE VYBE</span>
            <ArrowRight className="w-5 h-5 text-[#111111] group-hover:translate-x-1.5 transition-transform" />
          </button>

          <p className="font-mono text-[9px] xs:text-[10px] font-bold text-[#111111]/70 text-center mt-2 tracking-tight">
            TAP BUTTON OR LOGO TO DIVE IN • NO AUTO-FORWARD
          </p>
        </div>
      </div>
    </div>
  );
}
