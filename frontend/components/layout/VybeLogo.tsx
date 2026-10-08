'use client';

import React from 'react';
import Link from 'next/link';

// Official VYBE Graphic Logo
export function VybeLogo({
  size = 'md',
  className = '',
  alt = 'VYBE Logo',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}) {
  const sizeClasses = {
    xs: 'h-6 sm:h-7',
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  return (
    <div className={`relative inline-flex items-center select-none group ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/vybe-logo.png"
        alt={alt}
        className={`${sizeClasses[size]} w-auto object-contain filter drop-shadow-[2.5px_2.5px_0px_#111111] transition-transform duration-200 group-hover:scale-105 group-hover:-rotate-2 active:scale-95`}
      />
    </div>
  );
}

// Icon representation
export function VybeIcon({
  size = 36,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none group ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/vybe-logo.png"
        alt="VYBE"
        className="w-full h-full object-contain filter drop-shadow-[1.5px_1.5px_0px_#111111] transition-transform group-hover:rotate-6 group-hover:scale-110"
      />
    </div>
  );
}

// Full Wordmark with optional tagline
export function VybeWordmark({
  size = 'md',
  showTagline = false,
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}) {
  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <VybeLogo size={size} />

      {showTagline && (
        <span className="font-mono font-black text-[10px] text-[#111111] uppercase tracking-wider mt-1 flex items-center gap-1">
          <span>YOUR MUSIC. YOUR VIBE.</span>
          <span className="text-[#FF5CA8]">✦</span>
        </span>
      )}
    </div>
  );
}

// Main Top/Sidebar Logo Link
export function LogoLink({
  size = 'md',
  showTagline = false,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}) {
  return (
    <Link
      href="/"
      className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] rounded-xl"
    >
      <VybeWordmark size={size} showTagline={showTagline} />
    </Link>
  );
}

// Backward compatibility aliases
export const LoopaWordmark = VybeWordmark;
export const LoopaIcon = VybeIcon;
