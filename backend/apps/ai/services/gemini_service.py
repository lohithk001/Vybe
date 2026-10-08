import hashlib
import json
import logging
import re
from typing import Any
from django.conf import settings
from django.core.cache import cache

from apps.music.services.music_service import MusicService
from apps.music.services.ytmusic import ytmusic_provider

logger = logging.getLogger(__name__)

AI_DJ_CACHE_TTL = 7200  # 2 hours

SYSTEM_INSTRUCTION = """You are DJ VYBE, a charismatic, taste-making Gen-Z music curator and DJ.
The listener will share their current vibe, activity, feeling, or scenario.
Analyze their prompt and create an electrifying AI DJ session.

Output must be raw JSON (no markdown formatting, no code blocks) matching this exact schema:
{
  "sessionTitle": "string (uppercase 2-4 words, e.g. 'CYBERPUNK CODE SPRINT')",
  "djCommentary": "string (2-3 sentences of witty, charismatic Gen-Z DJ speech introducing the set)",
  "detectedMood": "string (must be one of: 'chill', 'lockin', 'mainchar', 'unhinged', 'focus', 'party', 'sad', 'workout')",
  "accentColor": "string (hex color from: '#FFE229', '#FF5CA8', '#55D6BE', '#8E7CFF', '#FF8A3D', '#6DB7FF')",
  "illustration": "string (one of: 'chill', 'lockin', 'mainchar', 'unhinged', 'vinyl', 'cassette', 'lofi', 'retro')",
  "searchQueries": ["string", "string", "string"],
  "suggestedArtists": ["string", "string", "string"]
}
"""

MOOD_PALETTE = {
    'chill': {'accent': '#55D6BE', 'illustration': 'chill'},
    'lockin': {'accent': '#FFE229', 'illustration': 'lockin'},
    'mainchar': {'accent': '#FF5CA8', 'illustration': 'mainchar'},
    'unhinged': {'accent': '#8E7CFF', 'illustration': 'unhinged'},
    'focus': {'accent': '#55D6BE', 'illustration': 'lofi'},
    'party': {'accent': '#FFE229', 'illustration': 'unhinged'},
    'sad': {'accent': '#6DB7FF', 'illustration': 'cassette'},
    'workout': {'accent': '#FF8A3D', 'illustration': 'mainchar'},
}


class GeminiService:
    """
    Coordinates Google Gemini LLM queries for the AI DJ experience.
    Extracts mood, dynamic Gen-Z commentary, queries upstream music provider,
    and returns an assembled playable session with Redis caching.
    """

    @classmethod
    def generate_dj_session(
        cls,
        prompt: str,
        mood_override: str | None = None,
        limit: int = 10,
        user=None,
    ) -> dict[str, Any]:
        prompt = prompt.strip()
        limit = max(1, min(limit, 25))

        cache_key = cls._make_cache_key(prompt, mood_override, limit)
        cached = cache.get(cache_key)
        if cached is not None:
            # Clone and augment tracks with user liked status
            augmented_tracks = MusicService.augment_tracks_with_liked_status(
                cached.get('tracks', []),
                user=user,
            )
            res = dict(cached)
            res['tracks'] = augmented_tracks
            return res

        # 1. Generate session metadata via Gemini LLM or heuristic fallback
        session_meta = cls._call_gemini_or_fallback(prompt, mood_override)

        # 2. Retrieve tracks using the AI search queries
        tracks = cls._gather_session_tracks(session_meta, limit=limit)

        # 3. Assemble response payload
        payload = {
            'sessionTitle': session_meta.get('sessionTitle', 'VYBE SESSION'),
            'djCommentary': session_meta.get('djCommentary', "Let's turn up the frequencies."),
            'detectedMood': session_meta.get('detectedMood', 'chill'),
            'accentColor': session_meta.get('accentColor', '#FF5CA8'),
            'illustration': session_meta.get('illustration', 'vinyl'),
            'suggestedArtists': session_meta.get('suggestedArtists', []),
            'tracks': tracks,
        }

        # 4. Save to Redis cache
        cache.set(cache_key, payload, timeout=AI_DJ_CACHE_TTL)

        # 5. Augment with user isLiked flags
        payload['tracks'] = MusicService.augment_tracks_with_liked_status(tracks, user=user)
        return payload

    @classmethod
    def _call_gemini_or_fallback(cls, prompt: str, mood_override: str | None) -> dict[str, Any]:
        api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if not api_key:
            logger.info("No GEMINI_API_KEY set; using AI DJ heuristic engine.")
            return cls._heuristic_dj_session(prompt, mood_override)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            model_name = getattr(settings, 'GEMINI_MODEL', 'gemini-2.5-flash')

            user_content = f"Listener Prompt: '{prompt}'"
            if mood_override:
                user_content += f"\nMood requirement: '{mood_override}'"

            response = client.models.generate_content(
                model=model_name,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.7,
                ),
            )

            raw_text = response.text.strip()
            # Clean possible markdown fence
            if raw_text.startswith("```"):
                raw_text = re.sub(r"^```(?:json)?\n?", "", raw_text)
                raw_text = re.sub(r"\n?```$", "", raw_text)

            parsed = json.loads(raw_text)
            # Validate required keys
            if 'sessionTitle' in parsed and 'djCommentary' in parsed and 'searchQueries' in parsed:
                return parsed
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Falling back to heuristic generator.")

        return cls._heuristic_dj_session(prompt, mood_override)

    @classmethod
    def _heuristic_dj_session(cls, prompt: str, mood_override: str | None) -> dict[str, Any]:
        """High-fidelity Gen-Z heuristic DJ generator for resilience and testing."""
        p_lower = prompt.lower()

        # Keyword based mood classification
        if mood_override and mood_override.lower() in MOOD_PALETTE:
            mood = mood_override.lower()
        elif any(w in p_lower for w in ['gym', 'workout', 'pr', 'lift', 'cardio', 'pump', 'beast']):
            mood = 'workout'
        elif any(w in p_lower for w in ['lock', 'code', 'study', 'focus', 'flow', 'grind', 'night shift', 'deep']):
            mood = 'lockin'
        elif any(w in p_lower for w in ['sad', 'cry', 'tears', 'heartbreak', 'alone', 'miss', 'breakup', 'late night']):
            mood = 'sad'
        elif any(w in p_lower for w in ['party', 'club', 'dance', 'drunk', 'weekend', 'bass', 'turn up']):
            mood = 'party'
        elif any(w in p_lower for w in ['main char', 'main character', 'ego', 'slay', 'pop', 'anthem', 'confident']):
            mood = 'mainchar'
        elif any(w in p_lower for w in ['crazy', 'unhinged', 'rage', 'hyper', 'chaos', 'screaming', 'distort']):
            mood = 'unhinged'
        else:
            mood = 'chill'

        palette_info = MOOD_PALETTE.get(mood, {'accent': '#55D6BE', 'illustration': 'chill'})

        commentaries = {
            'workout': "Dialing up the adrenaline. 150 BPM heavy bass drops incoming. Zero excuses, hit that PR right now.",
            'lockin': "Flow state activated. Cutting the noise and locking in with driving synthwave frequencies. Let's cook.",
            'sad': "2 AM thoughts taking over. Ceiling stare acoustic melodies and bittersweet nostalgia queued up. I got you.",
            'party': "Bumping the master volume all the way up. Pure serotonin and heavy club anthems on deck. Let's ride.",
            'mainchar': "Cue the cinematic spotlight. You're center screen right now—pure euphoric anthems and top-tier energy.",
            'unhinged': "Zero rules, pure chaotic dopamine. Distortion dialed to max velocity. Don't ask questions, just vibe.",
            'chill': "Slowing the tempo down to room temperature. Ambient keys and soothing lo-fi textures coming through.",
            'focus': "Deep cognitive resonance engaged. Minimalist rhythm patterns for uninterrupted mental clarity.",
        }

        titles = {
            'workout': "HIGH VOLTAGE PR",
            'lockin': "SYNTHWAVE FLOW STATE",
            'sad': "CEILING STARE HOURS",
            'party': "PEAK Dopamine DROP",
            'mainchar': "MAIN CHARACTER ENERGY",
            'unhinged': "MAXIMUM VELOCITY RAGE",
            'chill': "COFFEEHOUSE DRIFT",
            'focus': "DEEP FLOW MATRIX",
        }

        # Build search queries
        base_query = f"{prompt} {mood}"
        queries = [
            prompt,
            f"{mood} playlist hits",
            f"best {mood} songs 2025",
        ]

        return {
            'sessionTitle': titles.get(mood, "NEON FREQUENCIES"),
            'djCommentary': commentaries.get(mood, "Spinning the freshest tracks tailored to your exact wavelength."),
            'detectedMood': mood,
            'accentColor': palette_info['accent'],
            'illustration': palette_info['illustration'],
            'searchQueries': queries,
            'suggestedArtists': ['The Weeknd', 'Fred again..', 'Charli XCX'],
        }

    @classmethod
    def _gather_session_tracks(cls, session_meta: dict[str, Any], limit: int) -> list[dict[str, Any]]:
        """Collect and normalize candidate tracks matching the AI search queries."""
        queries = session_meta.get('searchQueries', [])
        detected_mood = session_meta.get('detectedMood', 'chill')

        collected = []
        seen_ids = set()

        for q in queries:
            if len(collected) >= limit:
                break
            try:
                results = ytmusic_provider.search(query=q, filter_type='songs', limit=limit)
                for t in results:
                    vid = t.get('youtube_video_id')
                    if vid and vid not in seen_ids:
                        seen_ids.add(vid)
                        collected.append(t)
                    if len(collected) >= limit:
                        break
            except Exception as e:
                logger.debug(f"Search query '{q}' failed: {e}")

        # If still under limit, fallback to mood crate tracks
        if len(collected) < limit:
            try:
                mood_crate = MusicService.get_mood_songs(slug=detected_mood, limit=limit)
                for t in mood_crate.get('tracks', []):
                    vid = t.get('youtube_video_id')
                    if vid and vid not in seen_ids:
                        seen_ids.add(vid)
                        collected.append(t)
                    if len(collected) >= limit:
                        break
            except Exception:
                pass

        return collected[:limit]

    @classmethod
    def _make_cache_key(cls, prompt: str, mood_override: str | None, limit: int) -> str:
        raw = f"{prompt.lower()}:{mood_override or 'none'}:{limit}"
        return f"vybe:ai:dj:{hashlib.sha256(raw.encode('utf-8')).hexdigest()}"
