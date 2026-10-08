'use client';

import React from 'react';

// Sticker with physical neo-brutalist feel
export function Sticker({
  children,
  color = '#FFE229',
  rotation = 'rotate-[-2deg]',
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  rotation?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold text-xs uppercase tracking-wider text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] rounded-full transition-transform hover:scale-105 select-none ${rotation} ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}

// Handwritten annotation badge (sticky tape / label look)
export function HandwrittenNote({
  text,
  color = '#FFE229',
  rotation = 'rotate-[-3deg]',
  className = '',
}: {
  text: string;
  color?: string;
  rotation?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-block px-3 py-1 font-black text-sm tracking-tight text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] ${rotation} ${className}`}
      style={{ backgroundColor: color }}
    >
      {/* Tape strip effect on top */}
      <span className="absolute -top-2 left-3 w-8 h-3 bg-white/70 border border-[#111111]/40 rotate-2 pointer-events-none" />
      <span className="relative z-10 font-bold uppercase">{text}</span>
    </div>
  );
}

// Doodle Crown
export function DoodleCrown({ className = 'w-6 h-6 text-[#111111]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M3 26L7 8L18 19L31 5L37 26H3Z"
        fill="#FFE229"
        stroke="#111111"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="8" r="3" fill="#111111" />
      <circle cx="18" cy="19" r="3" fill="#111111" />
      <circle cx="31" cy="5" r="3" fill="#111111" />
    </svg>
  );
}

// Doodle Star
export function DoodleStar({ className = 'w-5 h-5 text-[#111111]', fill = '#FFE229' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M16 2L19.5 11.5L29 12.5L21.5 19L24 28.5L16 23.5L8 28.5L10.5 19L3 12.5L12.5 11.5L16 2Z"
        fill={fill}
        stroke="#111111"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Doodle Sparkle
export function DoodleSparkle({ className = 'w-4 h-4', color = '#111111' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M12 2V22M2 12H22M5 5L19 19M5 19L19 5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Doodle Smiley
export function DoodleSmiley({ className = 'w-6 h-6', fill = '#FFE229' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="18" cy="18" r="16" fill={fill} stroke="#111111" strokeWidth="3" />
      <circle cx="12.5" cy="13.5" r="2.5" fill="#111111" />
      <circle cx="23.5" cy="13.5" r="2.5" fill="#111111" />
      <path
        d="M11 22C13 26 23 26 25 22"
        stroke="#111111"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Audio Wave Doodle
export function DoodleWave({ className = 'h-5', color = '#111111' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 50 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M2 8C5 2 9 14 13 8C17 2 21 14 25 8C29 2 33 14 37 8C41 2 45 14 48 8"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Doodle Music Note
export function DoodleNote({ className = 'w-5 h-5', fill = '#FF5CA8' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="9" cy="22" r="5" fill={fill} stroke="#111111" strokeWidth="2.8" />
      <circle cx="22" cy="18" r="5" fill={fill} stroke="#111111" strokeWidth="2.8" />
      <path
        d="M14 22V7L27 3V18"
        stroke="#111111"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11L27 7"
        stroke="#111111"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Doodle Lightning Bolt
export function DoodleLightning({ className = 'w-5 h-5', fill = '#FFE229' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M13 2L3 14H11L9 26L21 12H13L15 2H13Z"
        fill={fill}
        stroke="#111111"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

