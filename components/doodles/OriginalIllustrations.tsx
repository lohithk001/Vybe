'use client';

import React from 'react';

// CHILL CHARACTER: Original relaxed character with oversized headphones and chill clouds
export function ChillCharacter({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background aura shapes */}
      <circle cx="100" cy="100" r="85" fill="#55D6BE" stroke="#111111" strokeWidth="3.5" />
      <path d="M40 70C25 70 20 85 35 90C15 95 20 115 40 112C45 125 70 125 75 112H130C140 125 165 120 165 108C175 105 175 88 158 85C165 70 145 65 135 72C125 60 95 62 90 72C80 62 50 62 40 70Z" fill="#FFFDF9" stroke="#111111" strokeWidth="3" />
      
      {/* Character Face / Body */}
      <ellipse cx="100" cy="115" rx="42" ry="38" fill="#FCEBD2" stroke="#111111" strokeWidth="3.5" />
      {/* Cool Beanie / Hair */}
      <path d="M60 102C58 75 80 62 100 62C122 62 142 75 140 102C130 96 115 98 100 95C85 98 70 96 60 102Z" fill="#111111" stroke="#111111" strokeWidth="2" />
      
      {/* Closed Smiling Eyes */}
      <path d="M80 112C84 116 90 116 94 112" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M106 112C110 116 116 116 120 112" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />
      {/* Chill Gentle Smile */}
      <path d="M92 126C97 131 103 131 108 126" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="75" cy="120" r="5" fill="#FF5CA8" opacity="0.8" />
      <circle cx="125" cy="120" r="5" fill="#FF5CA8" opacity="0.8" />

      {/* Oversized Teal Headphones */}
      <path d="M54 115C54 80 75 60 100 60C125 60 146 80 146 115" stroke="#111111" strokeWidth="8" strokeLinecap="round" />
      <path d="M54 115C54 80 75 60 100 60C125 60 146 80 146 115" stroke="#55D6BE" strokeWidth="4" strokeLinecap="round" />
      {/* Left Ear cup */}
      <rect x="42" y="98" width="18" height="34" rx="9" fill="#111111" />
      <rect x="44" y="100" width="14" height="30" rx="7" fill="#FFE229" stroke="#111111" strokeWidth="2" />
      {/* Right Ear cup */}
      <rect x="140" y="98" width="18" height="34" rx="9" fill="#111111" />
      <rect x="142" y="100" width="14" height="30" rx="7" fill="#FFE229" stroke="#111111" strokeWidth="2" />

      {/* Floating Chill Zzz / Music Note */}
      <path d="M142 55L154 55L144 67L156 67" stroke="#111111" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="150" cy="40" r="3" fill="#111111" />
    </svg>
  );
}

// LOCK IN CHARACTER: Focused coder/producer with cyber visor, code brackets and hyper focus
export function LockInCharacter({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background aura */}
      <rect x="20" y="20" width="160" height="160" rx="24" fill="#FFE229" stroke="#111111" strokeWidth="3.5" />
      
      {/* Grid lines in background for tech feel */}
      <path d="M20 70H180M20 120H180M70 20V180M120 20V180" stroke="#111111" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
      
      {/* Character Head */}
      <rect x="62" y="70" width="76" height="78" rx="20" fill="#F7D3A6" stroke="#111111" strokeWidth="3.5" />
      {/* Spiky Dark Hair */}
      <path d="M60 76L65 52L82 66L100 48L118 66L135 52L140 76Z" fill="#111111" stroke="#111111" strokeWidth="2" />
      
      {/* Cyber Visor / Smart Glasses */}
      <rect x="56" y="88" width="88" height="26" rx="8" fill="#111111" />
      <rect x="60" y="91" width="80" height="20" rx="6" fill="#8E7CFF" stroke="#111111" strokeWidth="2" />
      {/* Glowing pixel code reflection */}
      <path d="M72 98L68 101L72 104M82 104L86 101L82 98M94 98H106M94 104H102" stroke="#FFFDF9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="124" cy="101" r="3" fill="#FFE229" />

      {/* Serious mouth line */}
      <line x1="90" y1="130" x2="110" y2="130" stroke="#111111" strokeWidth="3.5" strokeLinecap="round" />

      {/* Big Chunky Orange Headphones */}
      <path d="M48 95C48 64 72 45 100 45C128 45 152 64 152 95" stroke="#111111" strokeWidth="9" strokeLinecap="round" />
      <rect x="36" y="85" width="20" height="42" rx="10" fill="#FF8A3D" stroke="#111111" strokeWidth="3" />
      <rect x="144" y="85" width="20" height="42" rx="10" fill="#FF8A3D" stroke="#111111" strokeWidth="3" />

      {/* Floating brackets */}
      <text x="30" y="55" fontFamily="monospace" fontSize="20" fontWeight="bold" fill="#111111">&lt;&gt;</text>
      <text x="148" y="165" fontFamily="monospace" fontSize="20" fontWeight="bold" fill="#111111">&#123;&#125;</text>
    </svg>
  );
}

// MAIN CHARACTER: Confident star with dark shades, swagger, sparkles and pop energy
export function MainCharCharacter({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background shape */}
      <circle cx="100" cy="100" r="85" fill="#FF5CA8" stroke="#111111" strokeWidth="3.5" />
      
      {/* Retro Starburst in background */}
      <path d="M100 20L110 75L165 50L135 95L185 115L132 125L150 175L105 140L80 185L80 135L25 150L60 110L15 85L70 80L50 25L95 65Z" fill="#FFFDF9" stroke="#111111" strokeWidth="2.5" opacity="0.35" />

      {/* Head & Neck */}
      <rect x="88" y="136" width="24" height="24" fill="#F2C19B" stroke="#111111" strokeWidth="3" />
      <circle cx="100" cy="108" r="42" fill="#F2C19B" stroke="#111111" strokeWidth="3.5" />

      {/* Afro / Voluminous Curly Hair */}
      <circle cx="70" cy="80" r="22" fill="#111111" />
      <circle cx="100" cy="70" r="26" fill="#111111" />
      <circle cx="130" cy="80" r="22" fill="#111111" />
      <circle cx="62" cy="104" r="18" fill="#111111" />
      <circle cx="138" cy="104" r="18" fill="#111111" />

      {/* Cool Dark Sunglasses */}
      <path d="M72 100H128V115C128 122 122 128 114 128H86C78 128 72 122 72 115V100Z" fill="#111111" />
      <path d="M76 104H96V116C96 120 92 124 88 124H84C80 124 76 120 76 116V104Z" fill="#111111" stroke="#FFE229" strokeWidth="2" />
      <path d="M104 104H124V116C124 120 120 124 116 124H112C108 124 104 120 104 116V104Z" fill="#111111" stroke="#FFE229" strokeWidth="2" />
      {/* Sun reflection glare on shades */}
      <line x1="80" y1="106" x2="88" y2="120" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" />
      <line x1="108" y1="106" x2="116" y2="120" stroke="#FFFDF9" strokeWidth="2" strokeLinecap="round" />

      {/* Confident Smirk */}
      <path d="M96 135C102 138 109 136 113 133" stroke="#111111" strokeWidth="3" strokeLinecap="round" />

      {/* Gold Chain / Collar */}
      <path d="M78 152C88 165 112 165 122 152" stroke="#FFE229" strokeWidth="5" strokeLinecap="round" />
      <path d="M78 152C88 165 112 165 122 152" stroke="#111111" strokeWidth="2" strokeLinecap="round" />

      {/* Sparkles around */}
      <path d="M165 42L167 52L177 54L167 56L165 66L163 56L153 54L163 52Z" fill="#FFE229" stroke="#111111" strokeWidth="1.5" />
      <path d="M35 130L37 138L45 140L37 142L35 150L33 142L25 140L33 138Z" fill="#FFE229" stroke="#111111" strokeWidth="1.5" />
    </svg>
  );
}

// UNHINGED CHARACTER: Wild playful dancing monster with goofy energy and neon lightning
export function UnhingedCharacter({ className = 'w-full h-full' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Wild Background polygon */}
      <path d="M25 50L85 18L175 40L185 135L145 185L50 175L15 120Z" fill="#8E7CFF" stroke="#111111" strokeWidth="3.5" />

      {/* Crazy Lightning Bolts */}
      <path d="M35 30L45 48H35L48 70" stroke="#FFE229" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M160 140L170 158H160L172 180" stroke="#FFE229" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Wobbly Fuzzy Body */}
      <ellipse cx="100" cy="110" rx="55" ry="50" fill="#FF5CA8" stroke="#111111" strokeWidth="3.5" />

      {/* Huge Googly Wobbly Eyes */}
      <circle cx="80" cy="95" r="18" fill="#FFFDF9" stroke="#111111" strokeWidth="3" />
      <circle cx="82" cy="98" r="8" fill="#111111" />
      <circle cx="85" cy="95" r="3" fill="#FFFDF9" />

      <circle cx="122" cy="92" r="15" fill="#FFFDF9" stroke="#111111" strokeWidth="3" />
      <circle cx="120" cy="89" r="6" fill="#111111" />
      <circle cx="122" cy="87" r="2.5" fill="#FFFDF9" />

      {/* Big Derpy Open Smile */}
      <path d="M72 122C72 144 128 144 128 122Z" fill="#111111" stroke="#111111" strokeWidth="3" />
      {/* Tongue */}
      <path d="M90 135C95 142 105 142 110 135C105 130 95 130 90 135Z" fill="#55D6BE" stroke="#111111" strokeWidth="1.5" />
      {/* Funny tooth */}
      <rect x="85" y="122" width="8" height="7" fill="#FFFDF9" stroke="#111111" strokeWidth="1.5" />

      {/* Crazy Hair / Antenna */}
      <path d="M98 60C92 40 108 30 100 15" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="15" r="7" fill="#FFE229" stroke="#111111" strokeWidth="2" />

      {/* Waving Party Hands */}
      <path d="M48 115C30 100 20 85 30 75" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
      <path d="M152 115C170 100 180 85 170 75" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// AI DJ MASCOT: "Loopa Bot" — playful music robot with LED face, headphones & turntable controls
export function DjMascot({
  className = 'w-24 h-24',
  isThinking = false,
  isPlaying = false,
}: {
  className?: string;
  isThinking?: boolean;
  isPlaying?: boolean;
}) {
  return (
    <div className={`relative ${className} select-none`}>
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[4px_4px_0px_#111111]">
        {/* Antenna */}
        <line x1="80" y1="42" x2="80" y2="18" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="15" r="8" fill="#FFE229" stroke="#111111" strokeWidth="3" />
        {/* Pulsing signal waves from antenna */}
        <path d="M68 8C74 3 86 3 92 8" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />

        {/* Robot Head Body */}
        <rect x="36" y="42" width="88" height="74" rx="22" fill="#55D6BE" stroke="#111111" strokeWidth="4" />
        
        {/* LED Screen Face */}
        <rect x="48" y="54" width="64" height="48" rx="14" fill="#111111" />

        {/* LED Eyes */}
        {isThinking ? (
          // Thinking spiral eyes
          <g>
            <path d="M60 74C64 68 70 72 68 78C66 82 60 80 62 76" stroke="#FFE229" strokeWidth="3" strokeLinecap="round" />
            <path d="M92 74C96 68 102 72 100 78C98 82 92 80 94 76" stroke="#FFE229" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : isPlaying ? (
          // Musical equalizer bars in eyes
          <g>
            <rect x="58" y="70" width="4" height="14" rx="2" fill="#FF5CA8" />
            <rect x="64" y="64" width="4" height="20" rx="2" fill="#FFE229" />
            <rect x="92" y="66" width="4" height="18" rx="2" fill="#FFE229" />
            <rect x="98" y="72" width="4" height="12" rx="2" fill="#FF5CA8" />
          </g>
        ) : (
          // Happy oval eyes
          <g>
            <circle cx="64" cy="74" r="6" fill="#FFE229" />
            <circle cx="96" cy="74" r="6" fill="#FFE229" />
            <path d="M72 88C76 93 84 93 88 88" stroke="#FFE229" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* Big Over-Ear Purple Headphones */}
        <path d="M36 78C36 45 56 32 80 32C104 32 124 45 124 78" stroke="#111111" strokeWidth="8" strokeLinecap="round" />
        <rect x="22" y="64" width="16" height="34" rx="8" fill="#8E7CFF" stroke="#111111" strokeWidth="3.5" />
        <rect x="122" y="64" width="16" height="34" rx="8" fill="#8E7CFF" stroke="#111111" strokeWidth="3.5" />
        <circle cx="30" cy="81" r="3" fill="#FFE229" />
        <circle cx="130" cy="81" r="3" fill="#FFE229" />

        {/* DJ Robot Chest / Turntable Base */}
        <path d="M48 116L40 148H120L112 116H48Z" fill="#FFFDF9" stroke="#111111" strokeWidth="3.5" />
        {/* Knobs & Vinyl buttons */}
        <circle cx="64" cy="132" r="7" fill="#FF8A3D" stroke="#111111" strokeWidth="2.5" />
        <circle cx="96" cy="132" r="7" fill="#FFE229" stroke="#111111" strokeWidth="2.5" />
        <line x1="77" y1="128" x2="83" y2="128" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        <line x1="77" y1="134" x2="83" y2="134" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// TURNTABLE VINYL ARTWORK: Physical rotating vinyl record
export function VinylArtwork({
  color = '#FF5CA8',
  isPlaying = false,
  className = 'w-full h-full',
}: {
  color?: string;
  isPlaying?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className} flex items-center justify-center p-3`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${isPlaying ? 'animate-spin-slow' : ''}`}
      >
        {/* Outer Vinyl Body */}
        <circle cx="80" cy="80" r="74" fill="#111111" stroke="#111111" strokeWidth="4" />
        
        {/* Vinyl Grooves */}
        <circle cx="80" cy="80" r="64" stroke="#2A2A2A" strokeWidth="2" strokeDasharray="6 3" />
        <circle cx="80" cy="80" r="54" stroke="#2A2A2A" strokeWidth="2" strokeDasharray="8 4" />
        <circle cx="80" cy="80" r="44" stroke="#2A2A2A" strokeWidth="2" strokeDasharray="10 5" />
        
        {/* Center Label */}
        <circle cx="80" cy="80" r="28" fill={color} stroke="#111111" strokeWidth="3.5" />
        {/* Spindle hole */}
        <circle cx="80" cy="80" r="6" fill="#F5F0E6" stroke="#111111" strokeWidth="3" />

        {/* Small sticker smile on label */}
        <circle cx="75" cy="74" r="1.5" fill="#111111" />
        <circle cx="85" cy="74" r="1.5" fill="#111111" />
        <path d="M76 86C78 89 82 89 84 86" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// CASSETTE TAPE ARTWORK
export function CassetteArtwork({
  color = '#8E7CFF',
  className = 'w-full h-full',
}: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className} flex items-center justify-center p-2`}>
      <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Cassette Shell */}
        <rect x="8" y="10" width="144" height="100" rx="14" fill={color} stroke="#111111" strokeWidth="4" />
        
        {/* White Mixtape Label */}
        <rect x="22" y="24" width="116" height="52" rx="8" fill="#FFFDF9" stroke="#111111" strokeWidth="3" />
        <line x1="28" y1="36" x2="132" y2="36" stroke="#111111" strokeWidth="2" strokeDasharray="3 3" />
        
        {/* Center Tape Window */}
        <rect x="42" y="44" width="76" height="24" rx="6" fill="#111111" />
        {/* Spools */}
        <circle cx="56" cy="56" r="8" fill="#FFFDF9" stroke="#FFE229" strokeWidth="2.5" />
        <circle cx="104" cy="56" r="8" fill="#FFFDF9" stroke="#FFE229" strokeWidth="2.5" />
        <line x1="64" y1="56" x2="96" y2="56" stroke="#444" strokeWidth="4" />

        {/* Bottom Trapeze Notch */}
        <path d="M30 110L42 90H118L130 110H30Z" fill="#111111" />
        <circle cx="52" cy="100" r="3" fill="#FFFDF9" />
        <circle cx="108" cy="100" r="3" fill="#FFFDF9" />
      </svg>
    </div>
  );
}

// ARTWORK ROUTER: Picks appropriate vector art based on illustration type or fallback
export function TrackArtwork({
  type,
  color = '#FF5CA8',
  isPlaying = false,
  className = 'w-full h-full',
}: {
  type: string;
  color?: string;
  isPlaying?: boolean;
  className?: string;
}) {
  switch (type) {
    case 'chill':
      return <ChillCharacter className={className} />;
    case 'lockin':
      return <LockInCharacter className={className} />;
    case 'mainchar':
      return <MainCharCharacter className={className} />;
    case 'unhinged':
      return <UnhingedCharacter className={className} />;
    case 'vinyl':
      return <VinylArtwork color={color} isPlaying={isPlaying} className={className} />;
    case 'cassette':
      return <CassetteArtwork color={color} className={className} />;
    case 'lofi':
      return <ChillCharacter className={className} />;
    case 'retro':
    default:
      return <VinylArtwork color={color} isPlaying={isPlaying} className={className} />;
  }
}
