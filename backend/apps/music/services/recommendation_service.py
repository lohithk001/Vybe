import hashlib
import logging
from collections import Counter
from typing import Any
from apps.music.models import Song, LikedSong, Mood
from apps.music.serializers import SongSerializer
from apps.music.services.music_service import MusicService
from apps.music.services.cache_service import MusicCacheService
from apps.music.services.ytmusic import ytmusic_provider

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Gen-Z heuristic recommendation engine.
    Scores candidates based on:
      - Listener mood preferences & favorite genres
      - Liked songs affinity (artist & mood affinity)
      - Event-based listening history & completion signals
      - Discovery novelty bonus vs recency penalty (anti-fatigue)
      - Artist diversity cap
    """

    @classmethod
    def get_recommendations(
        cls,
        user=None,
        seed_song_id: str | None = None,
        mood_slug: str | None = None,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        limit = max(1, min(limit, 50))
        user_id = str(user.id) if user and user.is_authenticated else "anon"
        cache_key = cls._make_cache_key(user_id, seed_song_id, mood_slug, limit)

        # 1. Check Redis cache
        cached = MusicCacheService.get_recommendations(cache_key)
        if cached is not None:
            return MusicService.augment_tracks_with_liked_status(cached[:limit], user=user)

        # 2. Extract listener profile & history features
        features = cls._extract_listener_features(user)

        # 3. Gather candidate pool
        candidates = cls._gather_candidates(
            user=user,
            seed_song_id=seed_song_id,
            mood_slug=mood_slug,
            features=features,
        )

        # 4. Score and rank candidates
        scored_tracks = cls._score_and_rank_candidates(
            candidates=candidates,
            features=features,
            context_mood=mood_slug,
        )

        # 5. Apply artist diversity cap & slice limit
        final_tracks = cls._apply_diversity(scored_tracks, max_per_artist=3)[:limit]

        # 6. Save to cache
        MusicCacheService.set_recommendations(cache_key, final_tracks)

        # 7. Augment with isLiked flag for current user
        return MusicService.augment_tracks_with_liked_status(final_tracks, user=user)

    @classmethod
    def get_similar_tracks(
        cls,
        video_id: str,
        user=None,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        """Fetch similar tracks (track radio) for a specific song."""
        video_id = video_id.strip()
        limit = max(1, min(limit, 50))

        # Check cache
        cached = MusicCacheService.get_similar_tracks(video_id)
        if cached is None:
            # Query provider for related watch playlist tracks
            try:
                related = ytmusic_provider.get_related_songs(video_id, limit=limit + 10)
            except Exception as e:
                logger.warning(f"Failed to fetch related tracks for {video_id}: {e}")
                related = []

            if not related:
                # Fallback to trending
                related = MusicService.get_trending_songs(limit=limit)

            MusicCacheService.set_similar_tracks(video_id, related)
            cached = related

        # If user is authenticated, re-rank lightly based on user affinity
        if user and user.is_authenticated:
            features = cls._extract_listener_features(user)
            ranked = cls._score_and_rank_candidates(
                candidates=cached,
                features=features,
                context_mood=None,
            )
            final_tracks = cls._apply_diversity(ranked, max_per_artist=3)[:limit]
        else:
            final_tracks = cached[:limit]

        return MusicService.augment_tracks_with_liked_status(final_tracks, user=user)

    # ------------------ INTERNAL HEURISTICS ------------------

    @classmethod
    def _extract_listener_features(cls, user) -> dict[str, Any]:
        """Extract user taste vectors and historical listening signals."""
        features = {
            'preferred_moods': set(),
            'favorite_genres': set(),
            'liked_video_ids': set(),
            'liked_artist_names': set(),
            'recent_video_ids': set(),
            'completed_video_ids': set(),
            'played_artist_counts': Counter(),
        }

        if not user or not user.is_authenticated:
            return features

        # Profile preferences
        if hasattr(user, 'profile'):
            features['preferred_moods'] = set(m.lower() for m in (user.profile.preferred_moods or []))
            features['favorite_genres'] = set(g.lower() for g in (user.profile.favorite_genres or []))

        # Liked songs
        liked_entries = LikedSong.objects.filter(user=user).select_related('song', 'song__artist')[:100]
        for lk in liked_entries:
            features['liked_video_ids'].add(lk.song.youtube_video_id)
            if lk.song.artist:
                features['liked_artist_names'].add(lk.song.artist.name.lower())

        # Listening history
        from apps.history.models import ListeningHistory
        recent_history = (
            ListeningHistory.objects.filter(user=user)
            .select_related('song', 'song__artist')
            .order_by('-played_at')[:50]
        )
        for log in recent_history:
            vid = log.song.youtube_video_id
            features['recent_video_ids'].add(vid)
            if log.completed:
                features['completed_video_ids'].add(vid)
            if log.song.artist:
                features['played_artist_counts'][log.song.artist.name.lower()] += 1

        return features

    @classmethod
    def _gather_candidates(
        cls,
        user,
        seed_song_id: str | None,
        mood_slug: str | None,
        features: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """Collect diverse candidates from watch playlists, mood crates, and catalog."""
        candidates = []
        seen_ids = set()

        def add_batch(tracks):
            for t in tracks:
                vid = t.get('youtube_video_id') or t.get('youtubeVideoId')
                if vid and vid not in seen_ids:
                    seen_ids.add(vid)
                    candidates.append(t)

        # 1. Seed song related tracks
        if seed_song_id:
            try:
                related = ytmusic_provider.get_related_songs(seed_song_id, limit=25)
                add_batch(related)
            except Exception as e:
                logger.debug(f"Failed to fetch related for seed {seed_song_id}: {e}")

        # 2. Context mood tracks
        if mood_slug:
            try:
                mood_crate = MusicService.get_mood_songs(slug=mood_slug, user=user, limit=20)
                add_batch(mood_crate.get('tracks', []))
            except Exception:
                pass

        # 3. User preferred moods (if no specific context mood provided)
        elif features['preferred_moods']:
            for m in list(features['preferred_moods'])[:2]:
                try:
                    crate = MusicService.get_mood_songs(slug=m, user=user, limit=15)
                    add_batch(crate.get('tracks', []))
                except Exception:
                    pass

        # 4. User's liked artists seeds
        if features['liked_video_ids'] and len(candidates) < 30:
            sample_liked_vid = next(iter(features['liked_video_ids']))
            try:
                liked_related = ytmusic_provider.get_related_songs(sample_liked_vid, limit=15)
                add_batch(liked_related)
            except Exception:
                pass

        # 5. Top trending tracks
        trending = MusicService.get_trending_songs(user=user, limit=20)
        add_batch(trending)

        # 6. Active database catalog songs
        db_songs = Song.objects.filter(is_active=True).select_related('artist', 'album').order_by('-play_count')[:20]
        add_batch([SongSerializer(s).data for s in db_songs])

        return candidates

    @classmethod
    def _score_and_rank_candidates(
        cls,
        candidates: list[dict[str, Any]],
        features: dict[str, Any],
        context_mood: str | None,
    ) -> list[dict[str, Any]]:
        """Compute heuristic score for each candidate track."""
        scored = []
        for track in candidates:
            score = 50.0  # Base score
            vid = track.get('youtube_video_id') or track.get('youtubeVideoId') or ''

            # Extract artist name
            raw_artist = track.get('artist')
            artist_name = ""
            if isinstance(raw_artist, dict):
                artist_name = raw_artist.get('name', '').lower()
            elif isinstance(raw_artist, str):
                artist_name = raw_artist.lower()

            # 1. Liked Artist Boost (+35)
            if artist_name and artist_name in features['liked_artist_names']:
                score += 35.0

            # 2. Played Artist Affinity (+5 to +25)
            if artist_name and artist_name in features['played_artist_counts']:
                plays = features['played_artist_counts'][artist_name]
                score += min(25.0, plays * 5.0)

            # 3. Context Mood Boost (+30)
            if context_mood:
                track_mood = track.get('illustration', '').lower()
                if track_mood == context_mood.lower():
                    score += 30.0

            # 4. Profile Preferred Mood Boost (+20)
            track_illustration = track.get('illustration', '').lower()
            if track_illustration and track_illustration in features['preferred_moods']:
                score += 20.0

            # 5. Completion Bonus (+15)
            if vid in features['completed_video_ids']:
                score += 15.0

            # 6. Discovery Novelty Bonus (+12) vs Recency Fatigue Penalty (-35)
            if vid in features['recent_video_ids']:
                # Penalize recently heard songs to prevent repetition fatigue
                score -= 35.0
            else:
                # Reward newly discovered songs
                score += 12.0

            # 7. Familiarity Anchor for Liked Songs (+8)
            if vid in features['liked_video_ids']:
                score += 8.0

            scored.append((score, track))

        # Sort descending by score
        scored.sort(key=lambda x: x[0], reverse=True)
        return [t for _, t in scored]

    @classmethod
    def _apply_diversity(cls, tracks: list[dict[str, Any]], max_per_artist: int = 3) -> list[dict[str, Any]]:
        """Limit songs from the same artist to ensure genre and musical diversity."""
        diverse = []
        artist_counts = Counter()

        for t in tracks:
            raw_artist = t.get('artist')
            artist_id = ""
            if isinstance(raw_artist, dict):
                artist_id = raw_artist.get('id') or raw_artist.get('name') or ''
            elif isinstance(raw_artist, str):
                artist_id = raw_artist

            if artist_id:
                if artist_counts[artist_id] >= max_per_artist:
                    continue
                artist_counts[artist_id] += 1

            diverse.append(t)

        return diverse

    @classmethod
    def _make_cache_key(
        cls,
        user_id: str,
        seed_song_id: str | None,
        mood_slug: str | None,
        limit: int,
    ) -> str:
        raw = f"{user_id}:{seed_song_id or 'none'}:{mood_slug or 'none'}:{limit}"
        return hashlib.sha256(raw.encode('utf-8')).hexdigest()
