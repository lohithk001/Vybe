'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Sparkles, Library, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home, accent: '#FFE229' },
    { name: 'Search', href: '/search', icon: Search, accent: '#55D6BE' },
    { name: 'AI DJ', href: '/ai-dj', icon: Sparkles, accent: '#8E7CFF' },
    { name: 'Library', href: '/library', icon: Library, accent: '#FF5CA8' },
    { name: 'Profile', href: '/profile', icon: User, accent: '#6DB7FF' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9] border-t-[3.5px] border-[#111111] px-2 pt-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,4px))] flex items-center justify-around select-none shadow-[0px_-4px_0px_rgba(17,17,17,0.06)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 active:scale-90 ${
              isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl border-[2.5px] transition-all flex items-center justify-center ${
                isActive
                  ? 'border-[#111111] shadow-[2.5px_2.5px_0px_#111111] translate-y-[-2px]'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: isActive ? item.accent : 'transparent' }}
            >
              <Icon className="w-5 h-5 text-[#111111] stroke-[2.5]" />
            </div>
            <span
              className={`text-[10px] font-display uppercase tracking-tight mt-0.5 leading-tight ${
                isActive ? 'font-black text-[#111111]' : 'font-bold text-[#111111]'
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
