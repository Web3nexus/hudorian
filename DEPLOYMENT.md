# HUDORIAN — Deployment Guide

## What this stack actually is

| Layer | Technology | Lives in |
|---|---|---|
| API | Laravel 11 (PHP 8.2+) | `backend/` |
| Website | Next.js 16 App Router, bundled with webpack | `frontend/` |
| Output | Static export (`output: 'export'`), `trailingSlash: true` | `frontend/out/` (generated) |

**There is no Node process on the server and no port 3000.** The Next.js build
emits plain HTML, hashed `.js` chunks, and React Server Component payloads, and
Apache serves them as static files. This is what makes shared hosting viable.

`backend/vite.config.js` exists only because every Laravel install ships Vite
scaffolding for its Blade templates. The Blade welcome page is not part of this
site and `backend/public/build` is never built — ignore it.

## Repository layout

```
/
├── .gitignore        ignores generated output
├── .htaccess         web root config (Apache / LiteSpeed)
├── backend/          Laravel API
├── frontend/         Next.js source — the only editable frontend directory
│   ├── src/          pages, components, API client
│   └── public/       static assets copied verbatim into the export
├── scripts/deploy.sh build + publish
├── README.md
└── DEPLOYMENT.md
```

`frontend/out/` and `frontend/.next/` are **generated and git-ignored**. They are
not in the repository, and must not be committed.

> Earlier revisions committed the built site to the repository root *and* kept
> `frontend/out/` *and* `frontend/.next/` — three copies of the same build. They
> drifted apart, and a stale bundle ended up being served with hard-coded admin
> credentials in it. One generated copy, published at deploy time, is the fix.

## Target layout on the server

```
public_html/
├── .htaccess          copy of the repo root .htaccess
├── index.html         ┐
├── _next/             │ published from frontend/out by scripts/deploy.sh
├── images/            │
├── securegate/ …      ┘
└── backend/           uploaded separately from backend/
```

The web root is the **parent** of `backend/`, which is why the root
`.htaccess` has to lock down `backend/` itself — `backend/.htaccess` only
applies when the document root points *inside* `backend/`.

## Deploying

### 1. Build and publish

From the repository root:

```bash
./scripts/deploy.sh ~/public_html
```

This runs `npm run build` in `frontend/`, verifies the export, then rsyncs
`frontend/out/` into the target and copies `.htaccess` across.

- `--delete` removes chunks from the previous build, so stale hashes cannot
  linger. This is what prevents the drift described above.
- `backend/` is excluded from the sync and must be uploaded separately.
- Run `./scripts/deploy.sh` with no argument to build and review the output
  without publishing.

### 2. Backend

```bash
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
```

Create `backend/.env` on the server:

```env
APP_NAME="HUDORIAN"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.example

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hudorian
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

SANCTUM_STATEFUL_DOMAINS=your-domain.example
SESSION_DOMAIN=your-domain.example
CORS_ALLOWED_ORIGINS=https://your-domain.example

CACHE_STORE=file
QUEUE_CONNECTION=database
```

Generate an application key once: `php artisan key:generate`.

**Never commit `backend/.env`.** It is git-ignored.

### 3. Frontend API base URL

`frontend/src/lib/api.ts` resolves the API host in this order:

1. `NEXT_PUBLIC_API_URL`, if set at build time
2. `/api/v1` on any non-localhost host
3. `http://localhost:8000/api/v1` in development

For a normal same-origin deployment, set nothing — `/api/v1` is correct and the
root `.htaccess` forwards it to Laravel.

### 4. Seeding the first administrator

The seeder refuses to run in production without explicit passwords:

```bash
SEED_ADMIN_PASSWORD='<strong-password>' php artisan db:seed --class=DatabaseSeeder
```

The same applies to `SEED_MEMBER_PASSWORD` and `SEED_APPLICANT_PASSWORD`.
The fallback value used in development is documented in `README.md`; never rely
on it in production.

## How requests are routed

`/.htaccess`, in order:

1. **Force HTTPS** — must precede everything; the fallback rule ends the
   rewrite pass with `[L]`, so a later redirect would never match.
2. **Deny `backend/` source** — `.env`, `composer.json`, `app/`, `storage/`,
   `vendor/` and friends return 403.
3. **`/api/*` and `/sanctum/*`** → `backend/public/index.php`. The original
   `REQUEST_URI` is preserved so Laravel resolves `/api/v1/...` from its route
   table.
4. **Static files** that exist on disk are served untouched. `MultiViews` is
   disabled — with `trailingSlash: true` every route is already a real
   directory, and MultiViews would rewrite `/houses` into
   `/houses/index.html.html`.
5. **Fallback** to `index.html`.

### Nginx

Nginx ignores `.htaccess`. Translate sections 1–5 into `location` blocks:

```nginx
root /home/USER/public_html;

location ^~ /backend {
    # allow only the Laravel front controller through
    location ~ ^/backend/public/index\.php$ { ... }
    return 403;
}

location /api   { try_files $uri /backend/public/index.php?$query_string; }
location /sanctum { try_files $uri /backend/public/index.php?$query_string; }

location / {
    try_files $uri $uri/ /index.html;
}
```

## Troubleshooting

**Stale page after deploy** — hard-refresh; hashed chunk filenames mean a stale
`index.html` is the usual culprit. Confirm with
`grep -o 'Edit details' public_html/_next/static/chunks/app/securegate/houses/*.js`.

**`404` on every route** — `MultiViews` is on, or `.htaccess` was not copied.
Verify `Options -MultiViews` is present in section 5.

**API returns HTML instead of JSON** — `/api` is not reaching Laravel. Check
that `backend/public/index.php` exists on the server and that `mod_rewrite` is
enabled.

**API returns 500 and the log mentions `.env`** — `backend/.env` is missing or
unreadable on the server.
