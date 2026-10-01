# HUDORIAN — Deployment Guide

## Architecture Overview

| Layer | Technology | Lives in |
|---|---|---|
| Backend API | Laravel 11/13 (PHP 8.2+) | `backend/` |
| Frontend SPA | React 19, Vite, React Router, Tailwind CSS | `frontend/` |
| Build Output | Static SPA build (`npm run build`) | `frontend/dist/` (generated) |

The project is structured into two completely clean and decoupled tiers:
- **`frontend/`**: Pure React + Vite Single Page Application communicating with Laravel exclusively over `/api/v1` HTTP endpoints.
- **`backend/`**: Laravel REST API handling authentication, business logic, MySQL database operations, payment gateways, and security controls.

## Repository Layout

```
hudorian/
├── .gitignore        # Root ignore rules for frontend dist and backend storage
├── .htaccess         # Production web root config (Apache / LiteSpeed)
├── backend/          # Laravel API backend
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   ├── tests/
│   ├── artisan
│   └── composer.json
├── frontend/         # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── scripts/
│   └── deploy.sh     # Production build + publish script
├── README.md
└── DEPLOYMENT.md
```

## Local Development

### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env    # if .env does not exist
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The Vite development server runs on `http://localhost:3000` and automatically proxies `/api`, `/sanctum`, and `/storage` requests to `http://localhost:8000`.

## Production Deployment

### 1. Build and Publish Frontend
From repository root:
```bash
./scripts/deploy.sh ~/public_html
```
This command runs `npm run build` in `frontend/`, verifies `frontend/dist/index.html`, and publishes the assets and `.htaccess` to the target web root.

### 2. Backend Setup on Server
```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Configure `backend/.env` with your production database credentials and production URL.

### 3. Web Server Routing (.htaccess / Nginx)
The root `.htaccess` ensures:
1. Forced HTTPS
2. Lockdown of `backend/` source directories
3. Routing of `/api/*` and `/sanctum/*` to `backend/public/index.php`
4. Direct serving of static assets from disk
5. SPA fallback routing to `index.html` for client-side React Router navigation
