from django.core.management.base import BaseCommand
from apps.music.models import Mood, Genre

class Command(BaseCommand):
    help = 'Seeds initial Moods and Genres for VYBE catalog'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding VYBE moods and genres...'))

        moods_data = [
            {
                'slug': 'chill',
                'title': 'CHILL',
                'subtitle': 'slow things down',
                'accent_color': '#55D6BE',
                'bg_class': 'bg-[#55D6BE]',
                'rotation': '-rotate-1',
                'description': 'Ambient keys, cozy lo-fi, slow drums for winding down',
                'illustration': 'chill',
            },
            {
                'slug': 'lockin',
                'title': 'LOCK IN',
                'subtitle': 'no distractions',
                'accent_color': '#FFE229',
                'bg_class': 'bg-[#FFE229]',
                'rotation': 'rotate-1',
                'description': 'Deep synthwave, driving 120-140 BPM, high focus flow state',
                'illustration': 'lockin',
            },
            {
                'slug': 'mainchar',
                'title': 'MAIN CHARACTER',
                'subtitle': 'you know the vibe',
                'accent_color': '#FF5CA8',
                'bg_class': 'bg-[#FF5CA8]',
                'rotation': '-rotate-2',
                'description': 'Euphoric pop, confident baselines, center-of-the-movie energy',
                'illustration': 'mainchar',
            },
            {
                'slug': 'unhinged',
                'title': 'UNHINGED',
                'subtitle': "don't ask questions",
                'accent_color': '#8E7CFF',
                'bg_class': 'bg-[#8E7CFF]',
                'rotation': 'rotate-2',
                'description': 'Chaotic hyperpop, maximum distortion, pure dopamine overload',
                'illustration': 'unhinged',
            },
            {
                'slug': 'focus',
                'title': 'FOCUS',
                'subtitle': 'pure flow',
                'accent_color': '#55D6BE',
                'bg_class': 'bg-[#55D6BE]',
                'rotation': 'rotate-0',
                'description': 'Binaural beats, minimalist piano, and deep cognitive resonance',
                'illustration': 'lofi',
            },
            {
                'slug': 'party',
                'title': 'PARTY',
                'subtitle': 'bass boosted',
                'accent_color': '#FFE229',
                'bg_class': 'bg-[#FFE229]',
                'rotation': 'rotate-1',
                'description': 'Heavy bass drops, dance floor anthems, peak festival momentum',
                'illustration': 'unhinged',
            },
            {
                'slug': 'sad',
                'title': 'SAD HOURS',
                'subtitle': '2 AM thoughts',
                'accent_color': '#6DB7FF',
                'bg_class': 'bg-[#6DB7FF]',
                'rotation': '-rotate-1',
                'description': 'Ceiling stare acoustic ballads and nostalgic heartbreak',
                'illustration': 'cassette',
            },
            {
                'slug': 'workout',
                'title': 'WORKOUT',
                'subtitle': 'PR energy',
                'accent_color': '#FF8A3D',
                'bg_class': 'bg-[#FF8A3D]',
                'rotation': 'rotate-2',
                'description': 'High octane tempo, relentless cardio 808s, zero excuses',
                'illustration': 'mainchar',
            },
        ]

        for m in moods_data:
            Mood.objects.update_or_create(slug=m['slug'], defaults=m)
        self.stdout.write(self.style.SUCCESS(f'Created/updated {len(moods_data)} moods.'))

        genres_data = [
            'Pop', 'Synth-pop', 'Hip-Hop', 'Trap', 'R&B', 'Neo-Soul',
            'Indie Rock', 'Garage Rock', 'Lo-Fi', 'Hyperpop', 'Alt-Pop',
            'Electronic', 'Bollywood', 'Country Rap', 'Post-Punk',
        ]

        for g in genres_data:
            Genre.objects.get_or_create(name=g)
        self.stdout.write(self.style.SUCCESS(f'Created/updated {len(genres_data)} genres.'))
