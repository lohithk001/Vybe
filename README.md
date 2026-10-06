# VYBE Technologies ✦ Next-Generation Audio OS

<div align="center">

![VYBE Banner](https://img.shields.io/badge/VYBE-Audio%20OS-FFE229?style=for-the-badge&logoColor=111111)
![License](https://img.shields.io/badge/License-Proprietary-FF5CA8?style=for-the-badge)
![Status](https://img.shields.io/badge/Platform-Production%20Ready-55D6BE?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Modular%20Monolith-8E7CFF?style=for-the-badge)

**Your Music. Your Vibe. Recalibrating how the next generation experiences sound.**

[Product Overview](#-product-overview) • [Core Features](#-core-features) • [Engineering Architecture](#-engineering-architecture) • [Security & Compliance](#-security--compliance) • [Developer Runbook](#-developer-runbook)

</div>

---

## ⚡ Executive Summary

**VYBE** is an autonomous music discovery engine and mood-reactive audio platform built specifically for Gen-Z and digital natives. 

Modern streaming services suffer from **algorithmic stagnation** — trapping listeners in repetitive genre silos, static charts, and sterile user interfaces. VYBE breaks this paradigm by replacing rigid genre taxonomies with **real-time affective computing**: matching music directly to a listener's emotional headspace, current activity, and sonic energy.

Whether locked into a deep-focus late-night coding sprint, chasing a gym PR, or drifting through a 2 AM melancholic drive, VYBE orchestrates the soundtrack in real time.

---

## 🎯 The Problem We Solve

| Traditional Streaming Platforms | The VYBE Experience |
|---|---|
| **Genre-Locked Silos**: Forces tracks into dated categories (Pop, Rock, Hip-Hop). | **Mood-First Curation**: Categorizes sound by emotional frequency and tempo dynamics. |
| **Algorithmic Repetition**: Re-plays tracks you already know; zero organic discovery. | **Autonomous AI DJ**: Interprets raw natural language prompts into bespoke track queues. |
| **Sterile Corporate UI**: Flat, uninspired dark cards with zero tactile joy. | **Neo-Brutalist Visual Identity**: Vibrant stickers, dynamic doodle art, and analog tactility. |
| **Bloated Native Footprint**: Gigabyte downloads, invasive tracking cookies. | **Ultra-Light Hybrid Footprint**: Single web/PWA/Capacitor code-base with zero client bloat. |

---

## ✨ Core Product Features

### 1. 🤖 Autonomous AI DJ Studio
VYBE Bot is an intelligent audio companion powered by multi-layered semantic analysis and Google Gemini. Users simply type or speak what they are feeling (*e.g., "give me heavy bass synthwave for debugging non-stop at 3 AM"*). The AI DJ translates psychological intent into sonic parameters (BPM range, acoustic density, emotional valence) and synthesizes a tailor-made listening crate.

### 2. 🎛️ Real-Time Audio Synthesis & Spectrum Visualizer
Built-in Web Audio API synthesizer oscillators generate live frequency tones, allowing interactive auditory feedback with customizable waveforms (Sine, Triangle, Sawtooth, Square) and dynamic frequency bar spectrums.

### 3. 📱 Cross-Platform Accessibility (Web + Mobile APK)
VYBE is engineered for ubiquity. The frontend runs as a blazing-fast Next.js web application and compiles directly into a native Android APK using Capacitor — delivering zero-latency native performance without maintaining dual frontend codebases.

### 4. 🗂️ Dynamic Thematic Crates & Playlists
Curated by in-house sound architects and algorithmically adapted to trending cultural movements. Users can craft, edit, re-order, and save personalized crates with one-tap synchronization.

---

## 🏗️ Engineering Architecture

VYBE is organized as a high-velocity **Monorepo** ensuring synchronization between frontend client releases and backend platform services.

```
VYBE/
├── frontend/                  # Next.js Client App (Web & Capacitor Android APK)
│   ├── app/                   # App Router (Pages, Layouts, Routing)
│   ├── components/            # Neo-Brutalist UI Component Library
│   ├── context/               # Global Audio Player & State Engine
│   └── types/                 # Universal TypeScript Contracts
├── backend/                   # High-Throughput REST API (Django Modular Monolith)
│   ├── config/                # Environment-aware settings split (base, dev, prod)
│   ├── apps/
│   │   ├── core/              # Shared envelopes, exceptions, and health monitoring
│   │   ├── users/             # Custom auth, JWT credentials & listener profiles
│   │   ├── music/             # Provider abstraction, track metadata & normalization
│   │   ├── playlists/         # Playlist crate lifecycle & track sequencing
│   │   ├── history/           # Event-driven listening analytics
│   │   ├── recommendations/   # Heuristic affinity & mood scoring engine
│   │   └── ai/                # Gemini neural intent parser & AI DJ pipeline
│   ├── requirements/          # Environment-isolated dependency manifests
│   └── tests/                 # Automated test suite (Mocked external dependencies)
├── .gitignore                 # Enterprise workspace exclusion rules
└── README.md                  # Company product & platform documentation
```

### Technology Matrix

- **Frontend Client**: Next.js 16, React 19, Tailwind CSS, Framer Motion, HTML5 Web Audio API, Capacitor.
- **Backend API**: Python 3.12+, Django 5.x, Django REST Framework, SimpleJWT, WhiteNoise, Gunicorn.
- **Cloud Infrastructure**: 
  - **Relational Storage**: Neon Serverless PostgreSQL with connection pooling.
  - **Distributed Cache**: Upstash Serverless Redis (Namespaced TTL keys for sub-10ms metadata reads).
  - **PaaS Deployment**: Render (Backend Web Service) + Vercel (Frontend Web Edge).
- **API Standards**: Strict OpenAPI 3.0 via `drf-spectacular` with interactive Swagger & ReDoc consoles.

---

## 🔒 Security, Privacy & Compliance

1. **Zero-Audio-Proxy Copyright Compliance**:
   VYBE **never** downloads, transcodes, scrapes, or proxies copyrighted audio files on server hardware. All streaming audio is orchestrated on the client device through official unauthenticated YouTube iframe embed players.
2. **Zero Cookie Tracking**:
   VYBE never requests, captures, or persists user Google or YouTube cookies. Music metadata is retrieved via an unauthenticated provider abstraction layer (`MusicProvider` interface).
3. **Stateless JWT Security**:
   Client authentication is fully decoupled from cookies and CSRF dependencies via short-lived JSON Web Tokens passed in standard `Authorization: Bearer` headers.
4. **Resilient Rate Limiting**:
   Throttling guards sensitive endpoints (authentication, metadata search, and AI DJ generation) to protect upstream providers and database availability.

---

## 🚀 Developer Runbook

### Prerequisites
- Python 3.12+
- Node.js 18+ & npm
- Git

### 1. Backend Service Launch
```bash
# Navigate to platform service
cd backend

# Create and activate isolated environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install development dependencies
pip install -r requirements/development.txt

# Configure environment
cp .env.example .env

# Validate system architecture & apply migrations
python manage.py check
python manage.py migrate

# Execute unit and contract tests
python manage.py test tests

# Start local API gateway
python manage.py runserver 8000
```
- **Service Health Check**: `http://localhost:8000/api/v1/health/`
- **Swagger Documentation**: `http://localhost:8000/api/v1/docs/`
- **ReDoc Specification**: `http://localhost:8000/api/v1/redoc/`

### 2. Frontend Client Launch
```bash
# In a separate terminal, navigate to the client
cd frontend

# Install client packages
npm install

# Start Next.js local server
npm run dev
```
- **Web Client Access**: `http://localhost:3000`

---

## 🌐 Production Deployment Guide

### Deploying Backend to Render
1. Create a new **Web Service** linked to the `VYBE` GitHub repository.
2. Configure **Root Directory**: `backend` *(ensures Render isolates the Python stack)*.
3. Set **Runtime**: Python 3.
4. **Build Command**: `./build.sh`
5. **Start Command**: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
6. Add Environment Variables:
   - `DJANGO_SETTINGS_MODULE`: `config.settings.production`
   - `DEBUG`: `False`
   - `SECRET_KEY`: `<enterprise-grade-random-secret>`
   - `ALLOWED_HOSTS`: `.onrender.com`
   - `DATABASE_URL`: `<neon-postgresql-connection-string>`
   - `REDIS_URL`: `<upstash-redis-connection-string>`
   - `CORS_ALLOWED_ORIGINS`: `https://your-vybe-domain.vercel.app,capacitor://localhost,http://localhost`

---

<div align="center">

**VYBE Technologies Inc.**  
*Autonomous Music Intelligence for the Next Generation.*  
Built with passion by the VYBE Engineering Team.

</div>
