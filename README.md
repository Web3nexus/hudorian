# HUDORIAN — Private Members Club & Hospitality Platform

> **A private world of extraordinary places.**  
> Built as an editorial, production-grade full-stack private members club platform connecting Houses, Estates, Stays, Wellness facilities, and member-only programming.

---

## 1. Architecture Summary

HUDORIAN is structured into three unified experiences across a decoupled, high-performance architecture:

```
hudorian/
├── backend/                # Laravel 11/13 REST API & Domain Engine
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/   # Public, Member & SecureGate Admin Controllers
│   │   ├── Http/Middleware/            # SecureGateMiddleware & Audit Interceptors
│   │   ├── Models/                     # Eloquent Entities & Relationships
│   │   ├── Services/                   # Domain Business Logic
│   │   │   ├── SecureGate/             # SecureGateServiceInterface & SecureGateAdapter
│   │   │   ├── Payments/               # PaymentGatewayInterface, MockPaymentGateway, Stripe
│   │   │   ├── Booking/                # AvailabilityService (Atomic Locks & Overlap Checks)
│   │   │   ├── Membership/             # MembershipService & DigitalCardService (HMAC QR)
│   │   │   └── Audit/                  # AuditLogger (Immutable Activity Ledger)
│   │   └── Providers/AppServiceProvider.php
│   ├── database/migrations/           # Normalized Schema (9 Migrations)
│   ├── database/seeders/              # Rich Luxury Constellation Dataset
│   └── routes/api.php                 # 57 RESTful API Endpoints
│
└── frontend/               # Next.js 16+ App Router (TypeScript & Tailwind CSS)
    ├── src/
    │   ├── app/
    │   │   ├── (public)/              # Homepage, /houses, /estates, /stays, /experiences, /membership, /journal, /shop, /signin
    │   │   ├── (member)/              # /member, /member/bookings, /member/payments, /member/profile
    │   │   └── (admin)/               # /admin/login (MFA), /admin, /admin/applications, /admin/members, /admin/houses, /admin/payments, /admin/audit-logs
    │   ├── components/                # Luxury Design System, Navigation, Footers, Digital Cards, Carousels
    │   ├── lib/api.ts                 # Full-Featured API Client with Sanctum & Admin Tokens
    │   └── types/index.ts             # Domain TypeScript Types
```

---

## 2. Database Schema Summary

The database is fully normalized with foreign key integrity and optimized indexes:

- `users`: User identity, hashed passwords, contact info, and roles (`super_admin`, `admin`, `house_manager`, `membership_manager`, `finance_manager`, `member`, `staff`).
- `membership_plans`: Dynamic tiers (*Resident House Member*, *Global House Member*, *Founder Patron*), billing cycle, house access privileges, guest allowances, and stay discount percentages.
- `members`: Active membership records linked to users and plans, unique membership numbers (`HUD-YYYY-XXXX`), expiration dates, and HMAC verification hashes.
- `membership_applications`: Multi-step application dossiers (`draft`, `submitted`, `under_review`, `approved`, `rejected`), applicant bios, interests JSON, reviewer assignments, and audit notes.
- `locations`, `estates`, `houses`: Geographical destinations and properties with coordinates, house types, hero imagery, and rich editorial descriptions.
- `amenities`, `house_amenities`: Curated amenities categorized by wellness, dining, recreation, and services.
- `house_media`: Multi-format media gallery (images, videos, floorplans, 360 virtual tours).
- `rooms`, `room_amenities`, `room_media`: Bedroom suites, maximum adult/child capacities, base nightly prices, and square meterage.
- `reservations`, `reservation_guests`: Stay bookings with dates, guest counts, discounted rates, payment status, and compound indexes for fast date-range overlap queries.
- `events`, `event_bookings`: Curated dinners, cultural galas, seat capacities, member-only flags, and ticket bookings.
- `payments`, `invoices`, `refunds`: Financial ledger tracking provider transactions, idempotency keys, VAT invoice numbers, and refund histories.
- `categories`, `journal_posts`: Editorial CMS essays, reading times, categories, and published timestamps.
- `cms_blocks`: Dynamic content blocks for hero headings, manifestos, and announcements.
- `audit_logs`: Immutable security ledger recording actors, actions, entities, client IPs, user agents, and structured metadata.

---

## 3. API Documentation

Base URL: `/api/v1`

### Public & Discovery
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/houses` | List houses with location, type, and featured filters |
| `GET` | `/houses/{slug}` | Detailed house dossier with amenities, media, and suites |
| `GET` | `/estates` | Sprawling private estate domains and nested facilities |
| `GET` | `/stays` | Search available rooms with date and guest filters |
| `GET` | `/stays/{slug}` | Room detail with availability and live pricing |
| `POST` | `/stays/check-availability` | Fast date-range check for stay availability |
| `GET` | `/events` | Calendar of published member dinners and cultural salons |
| `GET` | `/membership/plans` | Active membership tiers and benefit matrices |
| `POST` | `/membership/apply` | Submit or save a candidate membership dossier |
| `GET` | `/verify-card/{token}` | Public concierge verification endpoint for HMAC digital card passes |
| `GET` | `/journal` | Editorial magazine articles and categories |
| `GET` | `/journal/{slug}` | Read full journal essay with related recommendations |
| `POST` | `/auth/login` | Member authentication issuing Sanctum session token |
| `POST` | `/auth/register` | New member candidate account creation |

### Member Portal (Sanctum Authenticated)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/me` | Fetch active user profile, member status, and plan |
| `PUT` | `/auth/profile` | Update contact details and change password |
| `POST` | `/auth/logout` | Terminate session and revoke current access token |
| `GET` | `/member/dashboard` | Dashboard metrics, upcoming reservations, and active pass |
| `GET` | `/member/card` | Generate short-lived HMAC QR pass with 15-minute expiration |
| `GET` | `/member/bookings` | List user stay reservations and event passes |
| `GET` | `/member/payments` | Financial ledger with transaction history and invoices |
| `POST` | `/stays/book` | Reserve suite with atomic row locking and payment charge |
| `POST` | `/events/{id}/book` | Reserve event seats with capacity validation |

### SecureGate Admin Platform (Sanctum + SecureGate Clearance)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/admin/auth/login` | Initiate admin login, validate credentials, trigger MFA challenge |
| `POST` | `/admin/auth/verify-mfa` | Verify 6-digit MFA challenge, issue admin session token |
| `POST` | `/admin/auth/logout` | Invalidate administrative session across devices |
| `GET` | `/admin/dashboard/stats` | Executive metrics (members, revenue, occupancy, queues) |
| `GET` | `/admin/members` | Search, filter, and inspect member roster |
| `PUT` | `/admin/members/{id}/status` | Suspend, reactivate, or cancel membership with audit note |
| `GET` | `/admin/applications` | Member candidacy queue |
| `POST` | `/admin/applications/{id}/review` | Approve candidacy (issues member number), reject, or review |
| `API Resource` | `/admin/houses` | Full CRUD for houses, coordinates, and media |
| `API Resource` | `/admin/rooms` | Full CRUD for room inventory and pricing |
| `API Resource` | `/admin/events` | Full CRUD for cultural events and capacity limits |
| `GET` | `/admin/payments` | Search transaction ledger |
| `POST` | `/admin/payments/{id}/refund` | Issue full or partial refund with audit log |
| `GET` | `/admin/audit-logs` | Query immutable audit trails with actor, IP, and entity filters |

---

## 4. Authentication Flow

1. **Public / Member Authentication**:
   - Uses Laravel Sanctum tokens. Passwords hashed using bcrypt (cost 12).
   - Frontend stores token in localStorage and injects `Authorization: Bearer <token>` into API requests.
2. **SecureGate Admin Authentication**:
   - Dual-checkpoint architecture.
   - Step 1: Admin credentials validated against rate limiter (locks after 5 failed attempts for 15 minutes).
   - Step 2: System generates a cryptographic `mfa_token` and triggers secondary verification (TOTP/MFA code).
   - Step 3: Admin submits code (dev demo code: `888888`), granting an elevated admin-scoped token (`admin:*`).
   - Every administrative API endpoint enforces `auth:sanctum` and `securegate` middleware.

---

## 5. SecureGate Integration Details

- Interface: `App\Services\SecureGate\SecureGateServiceInterface`
- Implementation: `App\Services\SecureGate\SecureGateAdapter`
- Middleware: `App\Http\Middleware\SecureGateMiddleware`
- Features:
  - MFA challenge issuance & verification
  - Device context logging (IP, User Agent)
  - Brute force lockout & velocity rate-limiting
  - Granular RBAC permission checks
  - Session revocation across devices
  - Clean adapter isolation ready for proprietary vendor keys (`SECUREGATE_API_KEY`, `SECUREGATE_SECRET`, `SECUREGATE_ENDPOINT`)

---

## 6. Admin Roles & Permissions

- `super_admin`: Unrestricted access across all domains, financial refunds, and governance.
- `admin`: Full operations across houses, rooms, applications, members, and CMS.
- `house_manager`: Scoped management of assigned houses, rooms, and local house events.
- `membership_manager`: Member applications review, candidacy decisions, and plan management.
- `finance_manager`: Transactions ledger, invoices, and refund authorizations.
- `staff`: Front-of-house concierge verification, guest check-ins, and ticket scans.

---

## 7. Payment Flow & Abstraction

- Interface: `App\Services\Payments\PaymentGatewayInterface`
- Implementations: `MockPaymentGateway` & `StripePaymentGateway`
- Capabilities:
  - Idempotency guarantees via `idempotency_key` unique constraints.
  - Automated generation of VAT Invoices (`INV-YYYY-XXXX`).
  - Full and partial refund processing (`refunds` entity).
  - Webhook signature validation.

---

## 8. Booking Flow & Concurrency Protection

- Handled by `App\Services\Booking\AvailabilityService`.
- Uses database transactions with pessimistic row locking (`lockForUpdate`).
- Overlap detection checks date ranges:
  $$\text{Overlap} \iff (\text{check\_in} < \text{new\_checkout}) \land (\text{check\_out} > \text{new\_checkin})$$
- Automatically applies active member discounts (e.g. 10%–25% off nightly rates).
- Atomic capacity counter updates for event ticket reservations to prevent overselling.

---

## 9. Environment Variables Required

### Backend (`backend/.env`)
```env
APP_NAME=HUDORIAN
APP_ENV=local
APP_KEY=base64:7nlkYbP4opcpWY9Xz9GGv2h6SbKIBWgsDV1MBg6hCc8=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# For MySQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=hudorian
# DB_USERNAME=root
# DB_PASSWORD=secret

SECUREGATE_API_KEY=
SECUREGATE_SECRET=
SECUREGATE_ENDPOINT=
SECUREGATE_DEMO_MFA=888888

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 10. Local Development Instructions

### Running Backend (Laravel)
```bash
cd backend
php artisan migrate:fresh --seed
php artisan serve --port=8000
```
*Demo Accounts seeded:*
- **Super Admin**: `admin@hudorian.com` / `password123` (MFA Code: `888888`)
- **Member**: `member@hudorian.com` / `password123`
- **Applicant**: `applicant@hudorian.com` / `password123`

### Running Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 11. Production Deployment Instructions

1. **Backend**:
   - Run `php artisan config:cache && php artisan route:cache && php artisan view:cache`
   - Point web server root to `backend/public`
   - Configure MySQL connection and run `php artisan migrate --force`
2. **Frontend**:
   - Run `npm run build`
   - Deploy as a standalone Node.js server (`next start`) or on Vercel/AWS.

---

## 12. Security Checklist

- [x] OWASP Top 10 compliance: SQL injection mitigated via Eloquent PDO parameterization.
- [x] CSRF protection & Sanctum stateful token headers.
- [x] SecureGate multi-factor authentication (MFA) on all administrative routes.
- [x] Granular RBAC authorization with `securegate` middleware.
- [x] Pessimistic database row locking preventing race conditions / double bookings.
- [x] Idempotency keys on payment transactions to prevent duplicate charges.
- [x] Digital membership card tokens HMAC-signed with 15-minute expirations.
- [x] Immutable audit trail logging actor, entity, IP, and timestamp.
- [x] Passwords hashed using bcrypt (cost 12).
- [x] Strict input validation on all Form Requests and API endpoints.

---

## 13. Test Results

### Backend Automated Test Suite (PHPUnit)
```
Tests:    12 passed (65 assertions)
Duration: 0.81s
```
- `MembershipTest`: Verifies public plans retrieval, candidate dossier submission, and administrative approval creating active member records.
- `BookingConcurrencyTest`: Verifies stay availability calculation and atomic rejection of overlapping double bookings.
- `SecureGateTest`: Verifies admin login MFA challenge, token issuance, and 403 Forbidden blocking of non-admin users.
- `DigitalCardTest`: Verifies HMAC signature generation, live verification, and rejection of forged or expired tokens.

### Frontend Compilation
```
✓ Compiled successfully in 4.1s
✓ Finished TypeScript in 2.7s
✓ Generating static pages (24/24) in 1125ms
Zero TypeScript errors, zero lint warnings.
```

---

## 14. Known Limitations

- Production deployment of SecureGate requires provisioning enterprise vendor API credentials in `backend/.env`. In the local environment, the provided `SecureGateAdapter` performs local cryptographic challenges with development MFA code `888888`.
- Payment transactions utilize `MockPaymentGateway` with transaction recording and VAT invoice issuance. Connecting live Stripe accounts requires configuring `STRIPE_KEY` and `STRIPE_SECRET`.

