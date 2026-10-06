'use client';

import React from 'react';
import { NowPlayingContent } from '@/components/player/NowPlayingModal';

export default function NowPlayingPage() {
  return (
    <div className="py-4 flex justify-center">
      <NowPlayingContent isModal={false} />
    </div>
  );
}
