'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMusicPlayer } from '@/context/MusicPlayerContext';
import { PlaylistCard } from '@/components/cards/PlaylistCard';
import { SongRow } from '@/components/cards/SongRow';
import { ARTISTS } from '@/data/mockData';
import { Plus, Heart, ListMusic, Disc, Users, Clock, Sparkles, X } from 'lucide-react';
import { DoodleCrown } from '@/components/doodles/Doodles';
import Link from 'next/link';

function LibraryPageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'playlists';

  const { userPlaylists, likedTrackIds, likedTracks, createPlaylist, history, queue } = useMusicPlayer();
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked' | 'albums' | 'artists' | 'history'>(
    initialTab as 'playlists' | 'liked' | 'albums' | 'artists' | 'history'
  );

  const dynamicAlbums = React.useMemo(() => {
    const combined = [...likedTracks, ...history, ...queue];
    const seen = new Set<string>();
    const list: typeof combined = [];
    for (const t of combined) {
      if (t.album && !seen.has(t.album)) {
        seen.add(t.album);
        list.push(t);
      }
    }
    return list;
  }, [likedTracks, history, queue]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createPlaylist(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  const tabs = [
    { id: 'playlists', label: 'Playlists', icon: ListMusic, color: '#FFE229' },
    { id: 'liked', label: `Liked Songs (${likedTrackIds.length})`, icon: Heart, color: '#FF5CA8' },
    { id: 'albums', label: `Albums (${dynamicAlbums.length})`, icon: Disc, color: '#8E7CFF' },
    { id: 'artists', label: 'Artists', icon: Users, color: '#55D6BE' },
    { id: 'history', label: `History (${history.length})`, icon: Clock, color: '#FF8A3D' },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-[3px] border-[#111111]/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight text-[#111111]">
              MY LIBRARY
            </h1>
            <DoodleCrown className="w-8 h-8 text-[#FFE229]" />
          </div>
          <p className="font-sans font-bold text-xs md:text-sm text-[#111111]/70 mt-1">
            All your saved jams, personal crates, and sonic memories in one place.
          </p>
        </div>

        {/* Create Playlist Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-[3px] border-[#111111] bg-[#FFE229] shadow-brutal-sm hover:shadow-brutal hover:bg-[#FFE229]/90 active:translate-x-0.5 active:translate-y-0.5 font-display font-black text-xs md:text-sm uppercase tracking-wider transition-all"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>CREATE PLAYLIST</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl border-[2.5px] font-display font-black text-xs md:text-sm uppercase tracking-wider transition-all flex-shrink-0 ${
                isActive
                  ? 'border-[#111111] shadow-[3px_3px_0px_#111111] translate-y-[-2px]'
                  : 'border-transparent bg-white/70 hover:border-[#111111] text-[#111111]/70 hover:text-[#111111]'
              }`}
              style={{ backgroundColor: isActive ? tab.color : undefined }}
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {activeTab === 'playlists' && (
          <>
            {/* Mobile View: Compact rows like reference mockup */}
            <div className="sm:hidden space-y-2.5">
              {userPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} layout="compact" />
              ))}
            </div>

            {/* Desktop View: Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {userPlaylists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} layout="card" />
              ))}
            </div>
          </>
        )}

        {activeTab === 'liked' && (
          <div>
            {likedTracks.length === 0 ? (
              <div className="p-8 text-center bg-[#FFFDF9] border-[3px] border-[#111111] rounded-[24px] shadow-brutal">
                <Heart className="w-12 h-12 text-[#FF5CA8] mx-auto mb-3" />
                <h3 className="font-display font-black text-xl uppercase">NO LIKED SONGS YET</h3>
                <p className="font-sans font-bold text-xs text-[#111111]/70 mt-1">
                  Tap the heart icon on any song to save it here!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {likedTracks.map((track, idx) => (
                  <SongRow
                    key={track.id}
                    track={track}
                    index={idx}
                    playlistQueue={likedTracks}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {ARTISTS.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="group p-4 bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-sm hover:shadow-brutal rounded-2xl flex flex-col items-center text-center transition-all"
              >
                <div
                  className="w-20 h-20 rounded-full border-[2.5px] border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-display font-black text-2xl text-[#111111] mb-2 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: artist.avatarColor }}
                >
                  {artist.name[0]}
                </div>
                <h3 className="font-display font-black text-sm text-[#111111] group-hover:underline truncate w-full">
                  {artist.name}
                </h3>
                <p className="font-mono text-[11px] text-[#111111]/70 mt-0.5">
                  {artist.monthlyListeners}
                </p>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'albums' && (
          <div>
            {dynamicAlbums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {dynamicAlbums.map((track) => (
                  <div
                    key={`${track.id}-${track.album}`}
                    className="p-4 bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-sm rounded-2xl flex flex-col group hover:-translate-y-1 transition-transform"
                  >
                    <div
                      className="w-full aspect-square rounded-xl border-2 border-[#111111] shadow-[2px_2px_0px_#111111] overflow-hidden flex items-center justify-center font-display font-black text-2xl mb-3 relative"
                      style={{ backgroundColor: track.accentColor }}
                    >
                      {track.thumbnailUrl ? (
                        <img
                          src={track.thumbnailUrl}
                          alt={track.album}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{track.album[0]}</span>
                      )}
                    </div>
                    <h4 className="font-display font-black text-sm text-[#111111] truncate">
                      {track.album}
                    </h4>
                    <p className="font-sans text-xs text-[#111111]/70 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-sm rounded-2xl">
                <p className="font-display font-black text-lg text-[#111111]">NO ALBUMS IN YOUR VAULT YET</p>
                <p className="font-sans font-bold text-xs text-[#111111]/70 mt-1">
                  Start listening or liking tracks to automatically build your album collection.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2.5">
            <span className="font-mono text-xs font-black uppercase text-[#111111]/60 block mb-2">
              RECENTLY PLAYED SESSIONS:
            </span>
            {history.length > 0 ? (
              history.map((track, idx) => (
                <SongRow
                  key={`history-${track.id}-${idx}`}
                  track={track}
                  index={idx}
                  playlistQueue={history}
                />
              ))
            ) : (
              <div className="p-8 text-center bg-[#FFFDF9] border-[3px] border-[#111111] shadow-brutal-sm rounded-2xl">
                <p className="font-display font-black text-lg text-[#111111]">NO RECENT SESSIONS</p>
                <p className="font-sans font-bold text-xs text-[#111111]/70 mt-1">
                  Play any song from Home, Discover, or AI DJ to record your live listening history.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create Playlist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#F5F0E6] border-[4px] border-[#111111] shadow-brutal-xl rounded-[28px] p-6 select-none relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFE229]" />
                <h3 className="font-display font-black text-xl uppercase">CREATE NEW PLAYLIST</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5"
              >
                <X className="w-5 h-5 text-[#111111]" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="font-mono text-xs font-black uppercase text-[#111111] block mb-1">
                  PLAYLIST TITLE
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Midnight Drive Anthems"
                  className="w-full bg-[#FFFDF9] border-[2.5px] border-[#111111] rounded-xl px-3.5 py-2.5 font-bold text-sm text-[#111111] focus:outline-none focus:shadow-[3px_3px_0px_#FFE229]"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs font-black uppercase text-[#111111] block mb-1">
                  DESCRIPTION (OPTIONAL)
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this vibe for?"
                  rows={3}
                  className="w-full bg-[#FFFDF9] border-[2.5px] border-[#111111] rounded-xl px-3.5 py-2 font-medium text-sm text-[#111111] focus:outline-none focus:shadow-[3px_3px_0px_#FFE229]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-display font-black text-xs uppercase underline"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl border-[2.5px] border-[#111111] bg-[#FFE229] font-display font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#111111] hover:bg-[#FFE229]/90 active:translate-x-0.5 active:translate-y-0.5"
                >
                  CREATE CRATE ✦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="font-display font-black p-8 text-xl">Loading Library...</div>}>
      <LibraryPageContent />
    </Suspense>
  );
}
