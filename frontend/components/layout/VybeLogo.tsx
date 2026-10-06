'use client';

import React from 'react';
import Link from 'next/link';

// Playful Vybe Crown / Music Vibe Wave Icon
export function VybeIcon({
  size = 36,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center bg-[#FFE229] border-[3px] border-[#111111] shadow-[3px_3px_0px_#111111] rounded-2xl select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4"
      >
        {/* Crown with loop shape */}
        <path
          d="M6 30L9 12L18 22L28 9L34 30H6Z"
          fill="#FF5CA8"
          stroke="#111111"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="12" r="2.5" fill="#111111" />
        <circle cx="18" cy="22" r="2.5" fill="#111111" />
        <circle cx="28" cy="9" r="2.5" fill="#111111" />
      </svg>
    </div>
  );
}

// Hand-drawn Neo-Brutalist "VYBE" wordmark
export function VybeWordmark({
  size = 'md',
  showTagline = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl md:text-6xl',
  };

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-2 group">
        <VybeIcon
          size={size === 'xl' ? 48 : size === 'lg' ? 42 : size === 'sm' ? 28 : 36}
          className="transition-transform group-hover:rotate-6 group-hover:scale-105"
        />

        {/* Hand-drawn neo-brutalist letters */}
        <span
          className={`font-black tracking-tight text-[#111111] uppercase font-display ${sizeClasses[size]} flex items-center drop-shadow-[2px_2px_0px_#FFE229]`}
        >
          <span className="inline-block transform -rotate-3 hover:rotate-0 transition-transform">V</span>
          <span className="inline-block transform rotate-2 text-[#FF5CA8] hover:scale-110 transition-transform">Y</span>
          <span className="inline-block transform -rotate-1 text-[#55D6BE] hover:scale-110 transition-transform">B</span>
          <span className="inline-block transform rotate-3 text-[#FF8A3D] hover:rotate-0 transition-transform">E</span>
        </span>
      </div>

      {showTagline && (
        <span className="font-bold text-[11px] text-[#111111] tracking-wide mt-0.5 ml-1 flex items-center gap-1 font-sans">
          <span>Your music. Your vibe.</span>
          <span className="text-xs">✦</span>
        </span>
      )}
    </div>
  );
}

export function LogoLink() {
  return (
    <Link href="/" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]">
      <VybeWordmark showTagline size="md" />
    </Link>
  );
}

// Aliases for compatibility
export const LoopaWordmark = VybeWordmark;
export const LoopaIcon = VybeIcon;
