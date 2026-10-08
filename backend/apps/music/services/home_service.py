import datetime
from typing import Any
from apps.music.models import Song, Mood
from apps.music.serializers import SongSerializer, MoodSerializer
from apps.music.services.music_service import MusicService
from apps.music.services.cache_service import MusicCacheService

BANNER_PRESETS = [
    {
        'id': 'banner-lockin',
        'title': 'LOCK IN & ZONE OUT',
        'subtitle': 'Driving synthwave beats for peak flow state',
        'accentColor': '#FFE229',
        'illustration': 'lockin',
        'badge': 'FEATURED CRATE',
        'actionType': 'mood',
        'actionTarget': 'lockin',
    },
    {
        'id': 'banner-chill',
        'title': 'CHILL LO-FI HOURS',
        'subtitle': 'Slow rhythms and coffeehouse textures',
        'accentColor': '#55D6BE',
        'illustration': 'chill',
        'badge': 'CURATED MOOD',
        'actionType': 'mood',
        'actionTarget': 'chill',
    },
    {
        'id': 'banner-mainchar',
        'title': 'MAIN CHARACTER ENERGY',
        'subtitle': 'Euphoric hooks and confidence anthems',
        'accentColor': '#FF5CA8',
        'illustration': 'mainchar',
        'badge': 'HOT RIGHT NOW',
        'actionType': 'mood',
        'actionTarget': 'mainchar',
    },
    {
        'id': 'banner-unhinged',
        'title': 'PURE UNHINGED NOISE',
        'subtitle': 'Distorted hyperpop and maximum velocity',
        'accentColor': '#8E7CFF',
        'illustration': 'unhinged',
        'badge': 'VIRAL',
        'actionType': 'mood',
        'actionTarget': 'unhinged',
    },
]


class HomeService:
    """
    Composes full home dashboard screen payload.
    Merges cached public catalog crates (trending, moods, banner) with
    personalized user context (greeting, history, quick picks, playlists).
    """

    @classmethod
    def get_greeting(cls, user=None) -> str:
        hour = datetime.datetime.now().hour
        if 5 <= hour < 12:
            period = "GOOD MORNING"
        elif 12 <= hour < 17:
            period = "GOOD AFTERNOON"
        elif 17 <= hour < 22:
            period = "GOOD EVENING"
        else:
            period = "LATE NIGHT VIBES"

        if user and user.is_authenticated:
            name = user.display_name or user.username
            return f"{period}, {name.upper()}"
        return period

    @classmethod
    def get_featured_banner(cls) -> dict[str, Any]:
        day = datetime.datetime.now().timetuple().tm_yday
        return BANNER_PRESETS[day % len(BANNER_PRESETS)]

    @classmethod
    def get_home_feed(cls, user=None) -> dict[str, Any]:
        is_auth = user is not None and user.is_authenticated

        # 1. Anonymous cache lookup
        if not is_auth:
            cached_public = MusicCacheService.get_home("public")
            if cached_public is not None:
                # Update greeting dynamically in case time period changed
                cached_public['greeting'] = cls.get_greeting(user=None)
                return cached_public

        # 2. Public / Shared Catalog Sections
        banner = cls.get_featured_banner()
        moods = MusicService.get_moods()
        trending_tracks = MusicService.get_trending_songs(user=user, limit=10)

        # 3. Personalized Context Sections
        greeting = cls.get_greeting(user=user)
        user_info = None
        recently_played = []
        quick_picks = []
        playlists = []

        if is_auth:
            user_info = {
                'id': str(user.id),
                'username': user.username,
                'displayName': user.display_name,
                'avatarColor': user.avatar_color,
            }

            # Recently played tracks from ListeningHistory
            from apps.history.models import ListeningHistory
            recent_logs = (
                ListeningHistory.objects.filter(user=user)
                .select_related('song', 'song__artist', 'song__album')
                .order_by('-played_at')[:10]
            )
            seen_song_ids = set()
            for log in recent_logs:
                if log.song_id not in seen_song_ids:
                    seen_song_ids.add(log.song_id)
                    s_data = SongSerializer(log.song).data
                    s_data['isLiked'] = True  # or checked
                    recently_played.append(s_data)
                if len(recently_played) >= 6:
                    break

            # User playlists
            from apps.playlists.models import Playlist
            from apps.playlists.serializers import PlaylistSummarySerializer
            user_pls = Playlist.objects.filter(user=user).order_by('-created_at')[:6]
            playlists = PlaylistSummarySerializer(user_pls, many=True).data

            # Quick picks tailored to preferred moods
            preferred_moods = user.profile.preferred_moods if hasattr(user, 'profile') else []
            if preferred_moods:
                first_pref = preferred_moods[0]
                try:
                    mood_crate = MusicService.get_mood_songs(slug=first_pref, user=user, limit=6)
                    quick_picks = mood_crate.get('tracks', [])
                except Exception:
                    quick_picks = trending_tracks[:6]
            else:
                quick_picks = trending_tracks[:6]
        else:
            # Anonymous fallback
            from apps.playlists.models import Playlist
            from apps.playlists.serializers import PlaylistSummarySerializer
            public_pls = Playlist.objects.filter(is_public=True).order_by('-created_at')[:6]
            playlists = PlaylistSummarySerializer(public_pls, many=True).data
            quick_picks = trending_tracks[:6]

        payload = {
            'greeting': greeting,
            'user': user_info,
            'banner': banner,
            'trending': trending_tracks,
            'moods': moods,
            'recentlyPlayed': recently_played,
            'quickPicks': quick_picks,
            'playlists': playlists,
        }

        # Cache public payload for anonymous users
        if not is_auth:
            MusicCacheService.set_home("public", payload)

        return payload
