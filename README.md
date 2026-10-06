# VYBE ✦ Monorepo

Gen-Z audio OS and music discovery engine.

```
VYBE/
├── frontend/    # Existing Next.js app (Exportable to Capacitor Android APK & Web)
├── backend/     # Django REST Framework API (Modular Monolith)
├── .gitignore
└── README.md
```

---

## Architecture Overview

- **Frontend**: Next.js (React 19, Tailwind CSS, Framer Motion, HTML5 Web Audio Synthesizer, Capacitor mobile ready).
- **Backend**: Django 5.x, Django REST Framework, PostgreSQL (Neon), Redis (Upstash), WhiteNoise, Gunicorn, OpenAPI 3.0 via drf-spectacular.
- **Data & Streaming**: ytmusicapi provider (unauthenticated client-side YouTube iframe audio playback, zero server audio proxying) & Google Gemini AI DJ.

---

## Quick Start

### 1. Backend (Django)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements/development.txt
python manage.py migrate
python manage.py runserver 8000
```
- API Health Check: `http://localhost:8000/api/v1/health/`
- Interactive Swagger UI: `http://localhost:8000/api/v1/docs/`
- ReDoc: `http://localhost:8000/api/v1/redoc/`

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## Deployment Configuration

### Deploying Backend on Render
- **Repository**: `VYBE` (this repository)
- **Root Directory**: `backend` *(Render only watches and builds files in `backend/`)*
- **Environment**: Python 3
- **Build Command**: `./build.sh`
- **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- **Key Environment Variables**:
  - `DJANGO_SETTINGS_MODULE`: `config.settings.production`
  - `DEBUG`: `False`
  - `SECRET_KEY`: `<generated-secret>`
  - `ALLOWED_HOSTS`: `.onrender.com`
  - `DATABASE_URL`: `<neon-postgresql-url>`
  - `REDIS_URL`: `<upstash-redis-url>`
  - `CORS_ALLOWED_ORIGINS`: `https://<your-vercel-domain>.vercel.app,capacitor://localhost,http://localhost`

### Deploying Frontend on Vercel
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://<your-render-backend>.onrender.com/api/v1`
