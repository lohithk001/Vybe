# VYBE Backend Platform ✦ Engineering Guide & Runbook

This directory contains the production-grade Django modular monolith REST API powering the **VYBE** Gen-Z music discovery application.

---

## 🏛️ System Architecture

The backend is built as a clean modular monolith adhering strictly to the `View -> Serializer -> Service` pattern:

```
backend/
├── config/                  # Core project configuration
│   ├── settings/            # Environment split
│   │   ├── base.py          # Universal configuration, JWT, throttles, OpenAPI
│   │   ├── development.py   # Local dev overrides (SQLite / LocMemCache)
│   │   └── production.py    # Production hardening (SSL, HSTS, Logging, WhiteNoise)
│   ├── wsgi.py              # WSGI entrypoint for Gunicorn
│   └── urls.py              # Root router (versioned /api/v1/ endpoints)
│
├── apps/
│   ├── core/                # System health check, standard responses, global exceptions
│   ├── users/               # Custom UUID User, Profile, SimpleJWT auth lifecycle
│   ├── music/               # Providers (ytmusicapi), search, trending, moods, catalog models
│   ├── playlists/           # User & curated playlist crates, song ordering
│   ├── history/             # Event-driven play logger, play counts & listener analytics
│   └── ai/                  # Google Gemini AI DJ engine & semantic prompt parsing
│
├── requirements/            # Dependency manifests (base, development, production)
├── tests/                   # Automated unit & end-to-end integration test suite
├── openapi-schema.yaml      # Exported OpenAPI 3.0 specification
├── build.sh                 # Render build script (pip, collectstatic, migrate, seed)
└── Procfile                 # Production WSGI process declaration
```

---

## ⚡ Core API Endpoints (`/api/v1/`)

All API responses follow the strict unified JSON envelope:
- **Success**: `{"success": true, "data": ..., "message": "..."}`
- **Error**: `{"success": false, "error": {"code": "...", "message": "...", "details": ...}}`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/health/` | Health check with DB and Redis latency ping | Public |
| `POST` | `/api/v1/auth/register/` | Register listener account + JWT credentials | Public |
| `POST` | `/api/v1/auth/login/` | Authenticate listener with email + password | Public |
| `POST` | `/api/v1/auth/refresh/` | Refresh expired access token | Public |
| `POST` | `/api/v1/auth/logout/` | Blacklist refresh token | Authenticated |
| `GET`/`PATCH` | `/api/v1/auth/me/` | Fetch & update listener profile & preferences | Authenticated |
| `GET` | `/api/v1/home/` | Composed home dashboard (greeting, banner, trending, moods) | Optional |
| `GET` | `/api/v1/music/search/?q=&filter=` | Search songs, artists, or albums with Redis caching | Public |
| `GET` | `/api/v1/music/trending/` | Top charts & trending tracks (2h Redis cache) | Public |
| `GET` | `/api/v1/music/moods/` | All Gen-Z mood crates with illustrations & accents | Public |
| `GET` | `/api/v1/music/moods/<slug>/songs/` | Tracks for a specific mood crate | Public |
| `GET` | `/api/v1/music/songs/<pk>/` | Normalized song details by YouTube video ID | Public |
| `POST`/`DELETE` | `/api/v1/music/songs/<pk>/like/` | Like or unlike track (persists to Postgres on like) | Authenticated |
| `GET` | `/api/v1/music/songs/<pk>/similar/` | Track radio / Up Next queue | Public |
| `GET` | `/api/v1/music/recommendations/` | Heuristic personalized track recommendations | Optional |
| `GET` | `/api/v1/me/liked-songs/` | Paginated listener liked songs library | Authenticated |
| `GET`/`POST` | `/api/v1/playlists/` | List and create playlist crates | Authenticated |
| `GET`/`PATCH`/`DEL` | `/api/v1/playlists/<id>/` | Manage single playlist crate | Owner Only |
| `POST` | `/api/v1/playlists/<id>/songs/` | Add song to playlist crate | Owner Only |
| `DELETE` | `/api/v1/playlists/<id>/songs/<song_id>/` | Remove song from playlist crate | Owner Only |
| `POST` | `/api/v1/playlists/<id>/reorder/` | Reorder tracks inside playlist crate | Owner Only |
| `POST` | `/api/v1/history/` | Log completed/partial play event | Authenticated |
| `GET`/`DELETE` | `/api/v1/history/` | List or clear listener play history | Authenticated |
| `POST` | `/api/v1/ai/dj/` | AI DJ session generation powered by Google Gemini | Optional |

---

## 🔒 Copyright & Compliance Architecture

1. **Zero Audio Proxying**: The VYBE backend **never** downloads, extracts, proxies, or stores audio streams. Audio playback occurs client-side using the unauthenticated YouTube iframe embed player with the stored `youtube_video_id`.
2. **Unauthenticated ytmusicapi**: The platform queries YouTube Music exclusively in unauthenticated mode. No user cookies or Google account tokens are ever collected, processed, or persisted.
3. **Lazy Persistence**: Songs are only saved to PostgreSQL when a user explicitly interacts with them (liking a track, adding to a playlist, or recording listening history), preventing database bloat from raw search queries.

---

## 🚢 Render Deployment Walkthrough

Deploying VYBE to Render requires configuring Render to target the `backend` directory in this monorepo.

### 1. Create a New Web Service on Render
- Log in to your [Render Dashboard](https://dashboard.render.com/).
- Click **New +** &rarr; **Web Service**.
- Connect your GitHub repository (`VYBE`).

### 2. Configure Service Settings
- **Name**: `vybe-backend`
- **Region**: Choose the region closest to your Neon and Upstash databases (e.g., `Ohio (US East)`).
- **Branch**: `main`
- **Root Directory**: `backend` *(CRITICAL: Forces Render to ignore `frontend/` and build only Django)*
- **Runtime**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 --access-logfile - --error-logfile -`
- **Instance Type**: `Free` or `Starter`

### 3. Configure Environment Variables

Under the **Environment** tab, set the following keys:

| Key | Example Value | Description |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` | Enables production SSL, security headers & WhiteNoise |
| `SECRET_KEY` | `generate-a-random-50-character-secret` | High-entropy production secret key |
| `DEBUG` | `False` | Disables debug mode in production |
| `ALLOWED_HOSTS` | `.onrender.com` | Allows your Render domain and subdomains |
| `DATABASE_URL` | `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require` | Neon Serverless PostgreSQL connection string |
| `REDIS_URL` | `rediss://default:token@xyz.upstash.io:6379` | Upstash Serverless Redis connection URL |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app,capacitor://localhost,http://localhost` | Allowed frontend origins (Vercel, Android Capacitor) |
| `CORS_ALLOW_ALL_ORIGINS` | `False` | Strict origin enforcement |
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio API key for Phase 8 AI DJ |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model for AI DJ generation |

### 4. Deploy!
- Click **Create Web Service**.
- Render will automatically execute `./build.sh`:
  1. Installs production dependencies (`requirements/production.txt`)
  2. Compresses static assets with WhiteNoise (`collectstatic`)
  3. Executes database migrations on Neon (`migrate`)
  4. Seeds initial Gen-Z moods & genres catalog (`seed_moods`)
  5. Boots Gunicorn on port `$PORT`

Verify deployment by opening:
`https://your-service.onrender.com/api/v1/health/`

---

## 🧪 Automated Test Suite

All external dependencies (`ytmusicapi`, `google.genai`, external network calls) are strictly mocked in the test suite to ensure deterministic, offline test runs:

```bash
# Run all tests across all phases
python manage.py test tests

# Validate OpenAPI schema with strict zero-warning enforcement
python manage.py spectacular --validate --fail-on-warn
```

---

## 📖 Interactive Documentation

When running locally or in production:
- **Swagger UI**: `http://localhost:8000/api/v1/docs/`
- **ReDoc**: `http://localhost:8000/api/v1/redoc/`
- **Raw OpenAPI Schema**: `http://localhost:8000/api/v1/schema/`
- **Static Schema Export**: `openapi-schema.yaml`
