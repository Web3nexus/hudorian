# HUDORIAN - Production Deployment & Live Hosting Guide

This guide details how to deploy the HUDORIAN platform (Laravel Backend + Next.js Frontend) to live production environments, including **cPanel / LiteSpeed / Apache Shared Hosting**, **Linux VPS (Ubuntu / Nginx / Apache)**, and **Split Cloud Deployments**.

---

## 1. Hosting Architecture & `.htaccess` Files

HUDORIAN includes three hardened `.htaccess` configurations ready for Apache / LiteSpeed live servers:

| File Location | Purpose | Key Features |
|---|---|---|
| `/.htaccess` (Repository Root) | Root orchestrator for unified Apache / cPanel hosting | Enforces HTTPS, shields `.env` and `vendor`, routes `/api/*`, `/sanctum/*`, and `/storage/*` to Laravel `backend/public`, and proxies frontend traffic to Next.js (port 3000). |
| `backend/public/.htaccess` | Core Laravel front controller | Enforces HTTPS, passes Sanctum / Bearer Authorization tokens, configures CORS, injects security headers (`nosniff`, `SAMEORIGIN`), blocks sensitive files, enables Gzip compression (`mod_deflate`), and configures 1-year asset caching (`mod_expires`). |
| `backend/.htaccess` | Fail-safe directory protection | If server DocumentRoot is inadvertently configured to `backend/` instead of `backend/public/`, this silently rewrites all requests into `public/` while strictly blocking `.env`, `composer.json`, `app/`, `database/`, etc. |

---

## 2. Server Requirements

### Backend (Laravel 11+ / PHP 8.2+)
- **PHP Version**: 8.2 or 8.3+
- **PHP Extensions**: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `gd` or `imagick`, `json`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenizer`, `xml`, `zip`
- **Database**: MySQL 8.0+ or MariaDB 10.4+
- **Apache Modules**: `mod_rewrite`, `mod_headers`, `mod_ssl`, `mod_deflate`, `mod_expires`, `mod_proxy` (if reverse proxying to Node.js)

### Frontend (Next.js 15+ / React 19)
- **Node.js**: v18.18.0 or v20.x+ (LTS recommended)
- **Package Manager**: `npm` or `pnpm`
- **Process Manager**: PM2 (for persistent server daemon)

---

## 3. Deployment Method A: cPanel / Shared Hosting (All-in-One)

### Step 1: Upload Files
Upload the repository files to your `public_html` (or subdomain folder).

```text
public_html/
├── .htaccess                  <-- Root .htaccess (proxies /api to backend/public)
├── backend/
│   ├── .htaccess              <-- Backend safety guard
│   ├── .env                   <-- Production Laravel environment
│   ├── public/
│   │   ├── .htaccess          <-- Production API & asset config
│   │   └── index.php
│   └── ...
└── frontend/
    ├── .env                   <-- NEXT_PUBLIC_API_URL=/api/v1
    ├── ecosystem.config.js
    └── ...
```

### Step 2: Configure Backend Environment
1. In `backend/.env`, set:
   ```env
   APP_NAME="HUDORIAN"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://yourdomain.com/backend/public  # Or https://api.yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_cpanel_dbname
   DB_USERNAME=your_cpanel_dbuser
   DB_PASSWORD="your_db_password"

   SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
   SESSION_DOMAIN=.yourdomain.com
   ```

2. Run database migration and create storage link:
   ```bash
   cd backend
   php artisan key:generate
   php artisan migrate --force --seed
   php artisan storage:link
   php artisan optimize
   ```

3. Ensure correct file permissions:
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

### Step 3: Run Next.js on cPanel (Node.js Application Manager)
1. Open cPanel > **Setup Node.js App**.
2. **Node.js version**: 20.x.
3. **Application mode**: Production.
4. **Application root**: `public_html/frontend` (or path to frontend).
5. **Application startup file**: `node_modules/next/dist/bin/next` with argument `start`.
6. Click **Run NPM Install**, then click **Run JS script** > `build`.
7. Start the application.

---

## 4. Deployment Method B: Linux VPS (Ubuntu / Nginx + PM2)

Recommended for production scalability, high traffic, and optimal performance.

### Step 1: Backend Setup
```bash
cd /var/www/hudorian/backend
cp .env.example .env
# Edit .env with production DB credentials
nano .env

composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force --seed
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Step 2: Frontend Setup with PM2
```bash
cd /var/www/hudorian/frontend
npm ci
npm run build

# Start with PM2 using our preconfigured ecosystem
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Nginx Server Block Configuration
Create `/etc/nginx/sites-available/hudorian`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend (Next.js Node Daemon on port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Laravel API endpoints
    location /api {
        alias /var/www/hudorian/backend/public;
        try_files $uri $uri/ @backend;

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME /var/www/hudorian/backend/public/index.php;
            include fastcgi_params;
        }
    }

    # Laravel Public Storage (Uploaded logos, seals, hero media)
    location /storage {
        alias /var/www/hudorian/backend/public/storage;
        access_log off;
        expires 365d;
    }

    # Fallback to Laravel Front Controller
    location @backend {
        rewrite /api/(.*)$ /index.php?/$1 last;
    }

    # Deny access to sensitive files
    location ~ /\.(ht|env|git) {
        deny all;
    }
}
```

Enable site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/hudorian /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Cron Job & Task Scheduling

To enable automated booking expiration checks, journal publishing, and email reminders, add the Laravel scheduler to `crontab`:

```bash
crontab -e
```
Add line:
```cron
* * * * * cd /var/www/hudorian/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 6. Pre-Launch Verification Checklist

- [ ] HTTPS is active and enforced on all routes.
- [ ] Direct access to `https://yourdomain.com/backend/.env` returns **403 Forbidden**.
- [ ] Direct access to `https://yourdomain.com/.git` returns **403 Forbidden**.
- [ ] Next.js frontend loads successfully on `https://yourdomain.com`.
- [ ] API calls succeed against `/api/v1/cms-blocks` and return live Nigerian pricing in NGN (₦).
- [ ] Admin authentication succeeds via `/securegate`.
- [ ] Brand Seal and logos render properly without missing asset 404s.
- [ ] Storage symlink exists (`backend/public/storage -> storage/app/public`).
- [ ] `php artisan optimize` has cached configuration and routes for maximum speed.

