import type { Metadata } from 'next';
import './globals.css';
import { MusicPlayerProvider } from '@/context/MusicPlayerContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { MusicPlayer } from '@/components/player/MusicPlayer';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { NowPlayingModal } from '@/components/player/NowPlayingModal';
import { AppOpeningSplash } from '@/components/splash/AppOpeningSplash';

export const metadata: Metadata = {
  title: 'VYBE ✦ Your music. Your vibe.',
  description: 'Neo-brutalist Gen-Z music streaming. Your music. Your vibe.',
  icons: {
    icon: '/vybe-logo.png',
    shortcut: '/vybe-logo.png',
    apple: '/vybe-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F0E6] text-[#111111] min-h-screen flex flex-col antialiased selection:bg-[#FFE229] selection:text-[#111111]">
        <MusicPlayerProvider>
          {/* App Opening Splash Animation */}
          <AppOpeningSplash />

          <div className="flex min-h-screen w-full">
            {/* Desktop Left Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-44 lg:pb-28">
              <Navbar />
              <main className="flex-1 px-3.5 sm:px-4 md:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>

          {/* Desktop Persistent Bottom Player */}
          <MusicPlayer />

          {/* Mobile Sticky Mini-Player */}
          <MiniPlayer />

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          {/* Fullscreen Now Playing Poster Modal */}
          <NowPlayingModal />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
