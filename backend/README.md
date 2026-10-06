# VYBE Backend 🎧

Modular monolith backend for **VYBE** — a Gen-Z music discovery engine.

## Tech Stack (Phase 1)
- **Framework**: Python 3.12+ / Django 5.x / Django REST Framework
- **Architecture**: Modular monolith (`apps/core`, `apps/users`, `apps/music`, etc.)
- **Database**: PostgreSQL (Neon in production, SQLite in local development fallback)
- **Caching**: Redis (Upstash in production, LocMemCache in local development fallback)
- **API Documentation**: OpenAPI 3.0 via `drf-spectacular` (Swagger & Redoc)
- **Deployment**: Render-ready with Gunicorn & WhiteNoise

---

## Directory Structure
```
backend/
├── manage.py
├── Procfile
├── build.sh
├── .env.example
├── .env
├── .gitignore
├── config/
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── __init__.py
│   └── core/
│       ├── __init__.py
│       ├── apps.py
│       ├── responses.py
│       ├── exceptions.py
│       ├── pagination.py
│       ├── views.py
│       └── urls.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
└── tests/
    ├── __init__.py
    └── test_health.py
```

---

## Getting Started

### 1. Environment Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements/development.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local variables:
- `DEBUG=True`
- `DATABASE_URL=sqlite:///db.sqlite3`
- `REDIS_URL=` (falls back to local memory cache)
- `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,capacitor://localhost,http://localhost`

### 3. Run Migrations & System Check
```bash
python manage.py check
python manage.py migrate
```

### 4. Run Development Server
```bash
python manage.py runserver 8000
```

### 5. Run Automated Tests
```bash
python manage.py test tests
```

---

## API Endpoints (Phase 1)

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/health/` | `GET` | Health check verifying database and cache latency |
| `/api/v1/schema/` | `GET` | OpenAPI 3.0 JSON/YAML schema |
| `/api/v1/docs/` | `GET` | Interactive Swagger UI API documentation |
| `/api/v1/redoc/` | `GET` | ReDoc API documentation |

### Response Envelope Convention

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation",
    "details": null
  }
}
```

---

## Production Deployment (Render)
1. **Root Directory**: Set to `backend`
2. **Build Command**: `./build.sh` (or `pip install -r requirements/production.txt && python manage.py collectstatic --no-input && python manage.py migrate`)
3. **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
4. **Environment Variables**:
   - `DJANGO_SETTINGS_MODULE`: `config.settings.production`
   - `SECRET_KEY`: `<production-secret>`
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `.onrender.com,yourdomain.com`
   - `DATABASE_URL`: `postgresql://<user>:<password>@<neon-endpoint>/<dbname>?sslmode=require`
   - `REDIS_URL`: `rediss://default:<token>@<upstash-endpoint>:6379`
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app,capacitor://localhost,http://localhost`
