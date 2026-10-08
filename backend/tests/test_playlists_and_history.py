from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.users.models import User
from apps.music.models import Artist, Song, LikedSong
from apps.playlists.models import Playlist, PlaylistSong
from apps.history.models import ListeningHistory

MOCK_SONG_METADATA = {
    'id': 'video_xyz_123',
    'youtube_video_id': 'video_xyz_123',
    'youtubeVideoId': 'video_xyz_123',
    'title': 'Midnight Resonance',
    'artist': {
        'id': 'channel_synth_boy',
        'name': 'Synth Boy',
    },
    'album': None,
    'thumbnail_url': 'https://example.com/thumb.jpg',
    'duration_seconds': 240,
    'accentColor': '#8E7CFF',
    'illustration': 'lockin',
}


class PlaylistsLikesAndHistoryTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create two test users
        self.user1 = User.objects.create_user(
            email='user1@vybe.fm',
            username='user1',
            password='TestPassword123!',
            display_name='Listener One',
        )
        self.user2 = User.objects.create_user(
            email='user2@vybe.fm',
            username='user2',
            password='TestPassword123!',
            display_name='Listener Two',
        )

        # Authenticate as user1 by default
        self.client.force_authenticate(user=self.user1)

        # Pre-create an artist and song for direct tests
        self.artist = Artist.objects.create(
            provider_id='channel_pre_existing',
            name='Local Artist',
        )
        self.song1 = Song.objects.create(
            youtube_video_id='vid_local_001',
            title='Neon Nights',
            artist=self.artist,
            duration_seconds=180,
        )

    # ==========================
    # PLAYLIST TESTS
    # ==========================

    def test_create_and_get_playlist(self):
        response = self.client.post('/api/v1/playlists/', {
            'title': 'Late Night Focus',
            'description': 'Pure flow state vibes.',
            'accentColor': '#55D6BE',
            'illustration': 'lockin',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertTrue(data['success'])
        playlist_id = data['data']['id']

        # Get details
        detail_resp = self.client.get(f'/api/v1/playlists/{playlist_id}/')
        self.assertEqual(detail_resp.status_code, status.HTTP_200_OK)
        detail_data = detail_resp.json()['data']
        self.assertEqual(detail_data['title'], 'Late Night Focus')
        self.assertEqual(detail_data['trackCount'], 0)
        self.assertEqual(len(detail_data['tracks']), 0)

    @patch('apps.music.services.music_service.MusicService.get_song')
    def test_add_song_persists_to_postgres_and_prevents_duplicates(self, mock_get_song):
        mock_get_song.return_value = MOCK_SONG_METADATA

        playlist = Playlist.objects.create(user=self.user1, title='Chill Crates')

        # Add song 1
        resp = self.client.post(f'/api/v1/playlists/{playlist.id}/songs/', {
            'youtube_video_id': 'video_xyz_123'
        }, format='json')

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        data = resp.json()['data']
        self.assertEqual(len(data['tracks']), 1)
        self.assertEqual(data['tracks'][0]['title'], 'Midnight Resonance')

        # Verify song was persisted into Postgres DB
        self.assertTrue(Song.objects.filter(youtube_video_id='video_xyz_123').exists())

        # Attempt to add DUPLICATE song to the same playlist
        dup_resp = self.client.post(f'/api/v1/playlists/{playlist.id}/songs/', {
            'youtube_video_id': 'video_xyz_123'
        }, format='json')
        self.assertEqual(dup_resp.status_code, status.HTTP_400_BAD_REQUEST)
        dup_data = dup_resp.json()
        self.assertFalse(dup_data['success'])

    def test_remove_song_and_reorder_playlist(self):
        playlist = Playlist.objects.create(user=self.user1, title='Workout Mix')
        ps1 = PlaylistSong.objects.create(playlist=playlist, song=self.song1, position=0)

        song2 = Song.objects.create(
            youtube_video_id='vid_local_002',
            title='Bass Drop',
            artist=self.artist,
            duration_seconds=200,
        )
        ps2 = PlaylistSong.objects.create(playlist=playlist, song=song2, position=1)

        # Reorder: song2 first, then song1
        reorder_resp = self.client.post(f'/api/v1/playlists/{playlist.id}/reorder/', {
            'songIds': [str(song2.id), str(self.song1.id)]
        }, format='json')

        self.assertEqual(reorder_resp.status_code, status.HTTP_200_OK)
        tracks = reorder_resp.json()['data']['tracks']
        self.assertEqual(tracks[0]['id'], str(song2.id))
        self.assertEqual(tracks[1]['id'], str(self.song1.id))

        # Remove song1
        del_resp = self.client.delete(f'/api/v1/playlists/{playlist.id}/songs/{self.song1.id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_200_OK)
        remaining_tracks = del_resp.json()['data']['tracks']
        self.assertEqual(len(remaining_tracks), 1)
        self.assertEqual(remaining_tracks[0]['id'], str(song2.id))

    def test_owner_only_permissions_forbidden_for_other_user(self):
        # Playlist owned by user1
        playlist = Playlist.objects.create(user=self.user1, title='User1 Private Crate', is_public=False)

        # Authenticate as user2
        self.client.force_authenticate(user=self.user2)

        # Try to modify user1's playlist
        patch_resp = self.client.patch(f'/api/v1/playlists/{playlist.id}/', {
            'title': 'Hacked Title'
        }, format='json')
        self.assertEqual(patch_resp.status_code, status.HTTP_403_FORBIDDEN)

        # Try to delete user1's playlist
        del_resp = self.client.delete(f'/api/v1/playlists/{playlist.id}/')
        self.assertEqual(del_resp.status_code, status.HTTP_403_FORBIDDEN)

    # ==========================
    # LIKES TESTS
    # ==========================

    @patch('apps.music.services.music_service.MusicService.get_song')
    def test_like_and_unlike_song(self, mock_get_song):
        mock_get_song.return_value = MOCK_SONG_METADATA

        # Like song (which automatically persists it)
        like_resp = self.client.post('/api/v1/music/songs/video_xyz_123/like/')
        self.assertEqual(like_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(like_resp.json()['data']['isLiked'])

        # Verify in DB
        song = Song.objects.get(youtube_video_id='video_xyz_123')
        self.assertTrue(LikedSong.objects.filter(user=self.user1, song=song).exists())

        # List liked songs
        liked_resp = self.client.get('/api/v1/me/liked-songs/')
        self.assertEqual(liked_resp.status_code, status.HTTP_200_OK)
        liked_songs = liked_resp.json()['data']['results']
        self.assertEqual(len(liked_songs), 1)
        self.assertEqual(liked_songs[0]['title'], 'Midnight Resonance')

        # Unlike song
        unlike_resp = self.client.delete('/api/v1/music/songs/video_xyz_123/like/')
        self.assertEqual(unlike_resp.status_code, status.HTTP_200_OK)
        self.assertFalse(unlike_resp.json()['data']['isLiked'])
        self.assertFalse(LikedSong.objects.filter(user=self.user1, song=song).exists())

    # ==========================
    # HISTORY TESTS
    # ==========================

    @patch('apps.music.services.music_service.MusicService.get_song')
    def test_record_listening_history_and_clear(self, mock_get_song):
        mock_get_song.return_value = MOCK_SONG_METADATA

        initial_mins = self.user1.profile.listening_time_minutes

        # Record event-based play
        play_resp = self.client.post('/api/v1/history/', {
            'youtube_video_id': 'video_xyz_123',
            'duration_listened_seconds': 180,
            'completed': True,
        }, format='json')

        self.assertEqual(play_resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(play_resp.json()['success'])

        # Check song play count incremented
        song = Song.objects.get(youtube_video_id='video_xyz_123')
        self.assertEqual(song.play_count, 1)

        # Check listener profile minutes increased
        self.user1.profile.refresh_from_db()
        self.assertEqual(self.user1.profile.listening_time_minutes, initial_mins + 3)

        # Get history list
        hist_list = self.client.get('/api/v1/history/')
        self.assertEqual(hist_list.status_code, status.HTTP_200_OK)
        results = hist_list.json()['data']['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['song']['title'], 'Midnight Resonance')

        # Clear history
        clear_resp = self.client.delete('/api/v1/history/')
        self.assertEqual(clear_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(ListeningHistory.objects.filter(user=self.user1).count(), 0)
