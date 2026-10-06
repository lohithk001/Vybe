from django.test import TestCase
from django.db.utils import IntegrityError
from apps.music.models import Genre, Mood, Artist, Album, Song
from apps.music.serializers import SongSerializer, ArtistDetailSerializer

class MusicModelTests(TestCase):
    def setUp(self):
        self.genre_synth = Genre.objects.create(name='Synthwave')
        self.genre_pop = Genre.objects.create(name='Pop')

        self.mood_lockin = Mood.objects.create(
            slug='lockin',
            title='LOCK IN',
            subtitle='no distractions',
            accent_color='#FFE229',
            illustration='lockin',
        )
        self.mood_chill = Mood.objects.create(
            slug='chill',
            title='CHILL',
            subtitle='slow things down',
            accent_color='#55D6BE',
            illustration='chill',
        )

        self.artist = Artist.objects.create(
            provider_id='UC_the_weeknd_channel_id',
            name='The Weeknd',
            avatar_color='#FF5CA8',
            monthly_listeners='112.5M',
            bio='Canadian singer-songwriter.',
        )
        self.artist.genres.add(self.genre_pop, self.genre_synth)

        self.album = Album.objects.create(
            provider_id='MPREb_after_hours_id',
            title='After Hours',
            artist=self.artist,
            year=2020,
        )

        self.song = Song.objects.create(
            youtube_video_id='4NRXx6U8ABQ',
            title='Blinding Lights',
            artist=self.artist,
            album=self.album,
            thumbnail_url='https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
            duration_seconds=200,
            accent_color='#FF5CA8',
            illustration='mainchar',
            bpm=171,
            play_count=4200000000,
        )
        self.song.genres.add(self.genre_pop, self.genre_synth)
        self.song.moods.add(self.mood_lockin)

    def test_genre_creation_and_auto_slug(self):
        genre = Genre.objects.create(name='Neo Soul')
        self.assertEqual(genre.slug, 'neo-soul')

    def test_mood_creation(self):
        mood = Mood.objects.get(slug='lockin')
        self.assertEqual(mood.title, 'LOCK IN')
        self.assertEqual(mood.accent_color, '#FFE229')

    def test_artist_creation(self):
        self.assertEqual(self.artist.name, 'The Weeknd')
        self.assertEqual(self.artist.genres.count(), 2)
        self.assertIsNotNone(self.artist.id)

    def test_album_relationship(self):
        self.assertEqual(self.album.artist, self.artist)
        self.assertEqual(self.artist.albums.count(), 1)

    def test_song_creation_and_computed_properties(self):
        self.assertEqual(self.song.title, 'Blinding Lights')
        self.assertEqual(self.song.duration_formatted, '3:20')
        self.assertEqual(self.song.play_count_formatted, '4.2B')
        self.assertEqual(self.song.genres.count(), 2)
        self.assertEqual(self.song.moods.count(), 1)

    def test_song_youtube_video_id_unique_constraint(self):
        with self.assertRaises(IntegrityError):
            Song.objects.create(
                youtube_video_id='4NRXx6U8ABQ',  # Duplicate video ID
                title='Another Song',
                artist=self.artist,
                duration_seconds=180,
            )

    def test_song_serializer_normalized_contract(self):
        serializer = SongSerializer(self.song)
        data = serializer.data

        # Verify strict normalized contract fields
        self.assertEqual(data['youtube_video_id'], '4NRXx6U8ABQ')
        self.assertEqual(data['youtubeVideoId'], '4NRXx6U8ABQ')
        self.assertEqual(data['title'], 'Blinding Lights')
        self.assertEqual(data['thumbnail_url'], 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg')
        self.assertEqual(data['duration_seconds'], 200)
        self.assertEqual(data['durationFormatted'], '3:20')
        self.assertEqual(data['accentColor'], '#FF5CA8')
        self.assertEqual(data['illustration'], 'mainchar')
        self.assertEqual(data['bpm'], 171)

        # Check nested normalized artist summary
        self.assertEqual(data['artist']['name'], 'The Weeknd')
        self.assertEqual(data['artist']['providerId'], 'UC_the_weeknd_channel_id')

        # Check nested normalized album summary
        self.assertEqual(data['album']['title'], 'After Hours')
        self.assertEqual(data['album']['providerId'], 'MPREb_after_hours_id')
        self.assertEqual(data['album']['year'], 2020)

        # Check moods
        self.assertEqual(len(data['moods']), 1)
        self.assertEqual(data['moods'][0]['slug'], 'lockin')

    def test_artist_detail_serializer_top_songs(self):
        serializer = ArtistDetailSerializer(self.artist)
        data = serializer.data

        self.assertEqual(data['name'], 'The Weeknd')
        self.assertEqual(len(data['topSongs']), 1)
        self.assertEqual(data['topSongs'][0]['title'], 'Blinding Lights')
