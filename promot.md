You are the lead software architect, senior Next.js engineer, Laravel engineer, UI/UX engineer, database architect, security engineer and QA engineer responsible for building the complete HUDORIAN platform.

DO NOT create a simple landing page.

DO NOT create a static mockup.

DO NOT hard-code houses, membership plans, prices, events, rooms or content into the frontend.

Build a production-ready full-stack private members club platform.

==================================================
PROJECT
==================================================

Brand:
HUDORIAN

Concept:
HUDORIAN is a premium private members club built around a collection of Houses, Estates, Clubs, Stays, Experiences, Wellness facilities and member-only events.

The website should feel like a sophisticated private members club and luxury hospitality platform.

The provided HUDORIAN design image is the primary visual reference.

The visual inspiration is the editorial/luxury approach of sites such as Soho House, but DO NOT copy their branding, assets, exact layouts, text, trademarks or design. Create an original HUDORIAN identity.

The result should feel:

- Premium
- Editorial
- Architectural
- Minimal
- Sophisticated
- Cinematic
- International
- Exclusive
- Warm
- Image-driven
- Highly interactive

==================================================
CORE TECHNOLOGY
==================================================

Frontend:

Next.js
TypeScript
React
Tailwind CSS
Framer Motion and/or GSAP
Next Image
Next Font

Use the current stable Next.js architecture.

Prefer:

App Router
Server Components where appropriate
Client Components only where interaction is required
Server-side rendering for public content
Static generation/revalidation where appropriate
Dynamic rendering for authenticated areas

Backend:

Laravel
PHP
REST API architecture
Laravel Sanctum or another secure token/session architecture appropriate for the application
Laravel Policies
Laravel Gates
Form Requests
API Resources
Events/Listeners
Queues where appropriate
Notifications
Jobs

Database:

MySQL

Storage:

S3-compatible object storage for:
- Images
- Videos
- House media
- Room media
- Event media
- Member documents
- Admin uploads

Payments:

Create a provider abstraction layer.

Do not hard-code a single payment provider into the business logic.

The system must support:
- Membership payments
- Membership renewals
- Refunds
- Failed payments
- Payment history
- Invoices/receipts

==================================================
SECURITY
==================================================

The ADMIN AREA MUST be protected using SecureGate.

IMPORTANT:

Do not invent SecureGate APIs, SDK methods or configuration.

First inspect the existing project/repository and determine how SecureGate is intended to be integrated.

If SecureGate has an official SDK/API:
- integrate it properly
- follow its documented authentication flow
- use its recommended middleware
- use its recommended MFA/security controls

If SecureGate is already installed in the project:
- inspect the existing configuration
- preserve the existing integration
- extend it rather than replacing it

If SecureGate integration is not yet available:
- create a clean SecurityGateAdapter/SecureGate integration layer
- isolate the integration behind an interface
- document the exact integration points
- do NOT fake SecureGate functionality

ADMIN SECURITY REQUIREMENTS:

- SecureGate-protected admin authentication
- MFA where supported
- Role-based access control
- Permission-based authorization
- Session security
- CSRF protection
- Rate limiting
- Login attempt protection
- Secure password policies
- Secure session invalidation
- Audit logging
- Admin activity logging
- IP/device/session visibility where supported
- Re-authentication for sensitive operations
- Secure file upload validation
- API authorization
- Server-side authorization for every protected action

NEVER rely only on frontend route protection.

Every sensitive operation must be authorized server-side.

==================================================
PRODUCT ARCHITECTURE
==================================================

Build THREE primary experiences:

1. PUBLIC HUDORIAN WEBSITE
2. MEMBER PORTAL
3. SECURE ADMIN PLATFORM

Architecture:

PUBLIC WEBSITE
      |
      v
NEXT.JS
      |
      v
LARAVEL API
      |
      v
MYSQL

MEMBER PORTAL
      |
      v
NEXT.JS
      |
      v
LARAVEL API
      |
      v
MYSQL

ADMIN
      |
      v
NEXT.JS ADMIN
      |
SecureGate
      |
      v
LARAVEL
      |
      v
MYSQL

==================================================
PUBLIC WEBSITE
==================================================

Create the following primary navigation:

HUDORIAN logo

About
Membership
Houses
Estates
Stays
Experiences
Journal
Shop

Right side:

Sign In
Become a Member

Include a small menu/grid icon on the left.

The navigation should become sticky intelligently while scrolling.

On mobile:
- animated full-screen navigation
- large typography
- touch-friendly controls
- smooth transitions

==================================================
HOMEPAGE
==================================================

Build an immersive editorial homepage.

SECTION 1 — HERO

Full-width cinematic image/video.

Headline:

"A private world of extraordinary places."

Supporting text:

"Exclusive houses, estates and clubs in the world's most inspiring destinations. For members only."

CTA:

Apply for membership

Secondary action:

Explore Houses

Hero should support:
- image
- video
- autoplay muted video
- pause/play
- mobile fallback
- CMS-controlled media

Add subtle animation.

Do not make animations excessive.

==================================================
SECTION 2 — MEMBERSHIP INTRO
==================================================

Centered editorial section.

Eyebrow:

MEMBERSHIP

Headline:

"More than places.
A global community."

Description explaining HUDORIAN membership.

CTA:

Explore membership

==================================================
SECTION 3 — FEATURED HOUSES
==================================================

Create a large horizontal property carousel.

Example:

HUDORIAN IBIZA
HUDORIAN MARBELLA
HUDORIAN LAGOS
HUDORIAN CAPE TOWN

Each card:

Large image
House name
Location
House type

Hover:
- image movement
- subtle overlay
- CTA
- location information

Desktop:
4 cards visible

Tablet:
2 cards

Mobile:
1 card

Include:
- drag interaction
- arrows
- keyboard navigation
- touch/swipe
- accessible labels

==================================================
SECTION 4 — STAYS
==================================================

Large asymmetric editorial section.

Image on one side.

Text on the other:

"Extraordinary stays
in exceptional places."

CTA:

Explore stays

==================================================
SECTION 5 — EXPERIENCES
==================================================

Create an editorial carousel for:

Member dinners
Exclusive events
Wellness
Journeys
Culture
Private experiences

==================================================
SECTION 6 — COMMUNITY CTA
==================================================

Large minimal section:

"Join a global community."

CTA:

Apply for membership

==================================================
FOOTER
==================================================

HUDORIAN

Places for a richer life.

Links:

Company
About
Careers
Partners
Press
Contact

Membership
Membership types
Benefits
Application
FAQs

Support
Help
Terms
Privacy
Cookies

Newsletter

Social links

==================================================
HOUSES
==================================================

Create:

/houses

This is a complete property discovery experience.

Filters:

Location
Country
Region
House type
Amenities
Availability

House types:

House
Estate
Club
Retreat
Villa
City House

Property cards must be dynamic.

Data must come from Laravel API.

Never hard-code properties into Next.js.

==================================================
HOUSE DETAIL
==================================================

Create:

/houses/[slug]

Example:

/houses/hudorian-ibiza

Structure:

Hero
House introduction
Gallery
Spaces
Amenities
Rooms
Experiences
Events
Location
Availability
Membership CTA

Example:

HUDORIAN IBIZA

Ibiza, Spain

Private coastal house for HUDORIAN members.

Amenities:

Pool
Restaurant
Bar
Spa
Gym
Garden
Private dining
Events

Use cinematic transitions between sections.

Create gallery lightbox.

Support:
- images
- video
- 360 media if available
- floor plans if uploaded

==================================================
ESTATES
==================================================

Create:

/estates

Estates are larger properties and destinations.

Each Estate can contain:

Multiple houses
Rooms
Restaurants
Clubs
Wellness facilities
Event spaces
Activities

Create hierarchical relationships in the database.

==================================================
STAYS
==================================================

Create:

/stays

Search:

Destination
Check-in
Check-out
Guests

Display available rooms.

Each room:

Image
Name
Description
Capacity
Amenities
Price
Availability

Do not expose unavailable rooms as bookable.

==================================================
ROOM DETAIL
==================================================

Create:

/stays/[slug]

Include:

Gallery
Room description
Amenities
Capacity
Availability
Pricing
Booking CTA

==================================================
BOOKING SYSTEM
==================================================

Implement real booking architecture.

Entities:

Reservations
Rooms
Availability
Guests
Booking status
Payment status

Statuses:

Pending
Confirmed
Cancelled
Completed
No-show

Prevent double booking.

Availability must be checked server-side.

Never trust frontend availability.

Use database transactions and locking where appropriate.

==================================================
MEMBERSHIP
==================================================

Create:

/membership

Sections:

Hero
Membership benefits
Membership types
Pricing
House access
Experiences
Wellness
Events
FAQ
Application CTA

Membership plans must be managed through admin.

Do not hard-code:

Prices
Benefits
Billing periods
Eligibility
Guest limits
House access

==================================================
MEMBERSHIP TYPES
==================================================

Create configurable plans.

Example:

Individual
Duo
Family
Corporate
Founder

These are examples only.

Admin must be able to create/edit/delete plans.

Each plan can define:

Name
Description
Price
Currency
Billing period
Benefits
Guest allowance
House access
Event access
Wellness access
Stay privileges
Eligibility
Status

==================================================
MEMBERSHIP APPLICATION
==================================================

Create a real application workflow.

Steps:

1. Account
2. Personal information
3. Professional information
4. Interests
5. Membership type
6. Review
7. Payment
8. Confirmation

Allow users to save progress.

Application statuses:

Draft
Submitted
Under review
Approved
Rejected
Payment pending
Active
Expired
Cancelled

Admin must be able to review applications.

==================================================
PAYMENTS
==================================================

Implement payment abstraction.

Payment records:

Transaction ID
User
Membership
Amount
Currency
Provider
Status
Payment date
Refund status
Metadata

Statuses:

Pending
Paid
Failed
Refunded
Partially refunded

Never trust payment success from the frontend.

Payment confirmation must be verified server-side/webhook-side.

Implement idempotency.

Prevent duplicate charges.

==================================================
MEMBER PORTAL
==================================================

Create:

/member

Dashboard.

Example:

WELCOME BACK

Member name

Membership:

HUDORIAN MEMBER

Status:
Active

Expiration date

Digital membership card.

Quick actions:

Explore Houses
Book a Stay
Events
Membership
Payments
Profile

==================================================
MEMBER PROFILE
==================================================

Member can manage:

Name
Email
Phone
Profile photo
Country
Preferences
Communication settings
Password
Security settings

Sensitive changes require appropriate verification.

==================================================
MEMBERSHIP MANAGEMENT
==================================================

Member can see:

Current plan
Benefits
Renewal date
Payment history
Invoices
Upgrade/downgrade where permitted
Cancellation options
Membership status

==================================================
DIGITAL MEMBERSHIP CARD
==================================================

Create a beautiful digital member card.

Include:

HUDORIAN
Member name
Membership number
Membership type
Expiration date
QR code

QR code must NOT contain sensitive personal data directly.

Use a secure short-lived verification token.

Create server-side membership verification.

==================================================
EVENTS
==================================================

Create:

/experiences
/events

Events include:

Name
Description
Location
House
Date
Time
Capacity
Price
Member-only flag
Images
Status

Members can reserve/book events.

Prevent capacity overbooking.

==================================================
JOURNAL
==================================================

Create:

/journal

CMS-driven editorial content.

Articles:

Title
Slug
Excerpt
Content
Cover image
Author
Category
Published date
SEO metadata

Categories can include:

Travel
Culture
Food
Wellness
Design
People
Houses
Experiences

==================================================
SHOP
==================================================

Create a flexible shop architecture.

Do not necessarily build a complete ecommerce system in phase one.

Prepare the architecture for:

Products
Categories
Inventory
Orders
Payments

==================================================
ADMIN PLATFORM
==================================================

Create a separate secure admin experience.

Suggested route:

/admin

Admin should be protected by SecureGate.

ADMIN DASHBOARD:

Metrics:

Total members
Active members
Pending applications
Membership revenue
Upcoming renewals
Houses
Bookings
Upcoming events

Charts:

Membership growth
Revenue
Bookings
Applications
House utilization

==================================================
ADMIN MEMBERS
==================================================

Admin can:

View members
Search
Filter
Sort
View member profile
View membership
View payments
View bookings
Suspend membership
Reactivate membership
Cancel membership
Renew membership
Add internal notes

All sensitive actions must be logged.

==================================================
ADMIN APPLICATIONS
==================================================

Application queue.

Admin can:

Review
Approve
Reject
Request information
Assign reviewer
Add internal notes

Every status change should create an audit event.

==================================================
ADMIN HOUSES
==================================================

CRUD:

Create House
Edit House
Archive House

Fields:

Name
Slug
Location
Country
Region
Description
Short description
Coordinates
House type
Status

Media:

Hero
Gallery
Videos
Floorplans

Amenities:

Pool
Gym
Spa
Restaurant
Bar
Garden
Beach
Parking
Events
etc.

Amenities must be configurable.

==================================================
ADMIN ESTATES
==================================================

Manage:

Estate
Buildings
Houses
Rooms
Facilities
Events

Allow relationships between properties.

==================================================
ADMIN ROOMS
==================================================

CRUD rooms.

Fields:

Name
Slug
Description
Capacity
Amenities
Price
Currency
Images
Availability
Status

==================================================
ADMIN MEMBERSHIP
==================================================

Manage:

Plans
Pricing
Benefits
Eligibility
House access
Guest rules
Billing cycle

Admin must be able to activate/deactivate plans.

Changes must be audited.

==================================================
ADMIN PAYMENTS
==================================================

View:

Transactions
Successful payments
Failed payments
Refunds
Invoices

Search by:

Member
Transaction ID
Membership
Date
Status

==================================================
ADMIN EVENTS
==================================================

CRUD:

Events
Locations
Capacity
Tickets
Member access
Pricing

==================================================
ADMIN CONTENT CMS
==================================================

Create a CMS so administrators can manage:

Homepage sections
Hero media
House content
Membership content
Experiences
Journal
Footer
Navigation

Do not require developers to modify code for normal content changes.

==================================================
MEDIA MANAGEMENT
==================================================

Create media library.

Support:

Images
Videos
Documents

Generate appropriate image sizes.

Use optimized formats where possible.

Implement:

Lazy loading
Responsive images
Blur placeholders
CDN-ready URLs

==================================================
DATABASE
==================================================

Design a normalized MySQL schema.

Minimum entities:

users
members
membership_plans
membership_benefits
memberships
membership_applications

houses
estates
locations
amenities
house_amenities
house_media

rooms
room_media
room_amenities
room_availability

reservations
reservation_guests

events
event_bookings

payments
invoices
refunds

journal_posts
categories
media

notifications

audit_logs

admin_users
roles
permissions

==================================================
API
==================================================

Create clean REST API endpoints.

Example:

GET /api/houses
GET /api/houses/{slug}

GET /api/estates
GET /api/estates/{slug}

GET /api/rooms
GET /api/rooms/{slug}

GET /api/membership/plans

POST /api/membership/applications

GET /api/member/profile
GET /api/member/membership
GET /api/member/bookings

POST /api/bookings

GET /api/events
POST /api/events/{event}/book

GET /api/payments

Admin:

GET /api/admin/members
GET /api/admin/applications
GET /api/admin/houses
GET /api/admin/rooms
GET /api/admin/events
GET /api/admin/payments

Use:

API Resources
Form Requests
Policies
Validation
Pagination
Filtering
Sorting
Consistent error responses

==================================================
AUTHENTICATION
==================================================

Public/member authentication:

Email/password

Prepare architecture for:

Google
Apple
Other OAuth providers

Use secure session/token handling.

Do not store raw passwords.

Use Laravel's secure password hashing.

==================================================
AUTHORIZATION
==================================================

Roles:

Super Admin
Admin
House Manager
Membership Manager
Finance Manager
Content Manager
Event Manager
Staff
Member

Use least privilege.

House Managers should only be able to manage houses they are assigned to.

Finance managers should not automatically have access to member private data unless required.

==================================================
AUDIT LOGGING
==================================================

Log:

Login
Logout
Failed login
Membership creation
Membership changes
Payment actions
Refunds
Admin changes
House changes
Content changes
Role changes
Permission changes
Sensitive profile changes

Audit entries:

User
Actor
Action
Entity
Entity ID
Timestamp
IP
User agent
Metadata

Audit logs must be immutable from normal admin interfaces.

==================================================
SECURITY HARDENING
==================================================

Perform a security pass against:

OWASP Top 10.

Check:

SQL injection
XSS
CSRF
Broken access control
IDOR
Authentication vulnerabilities
Session vulnerabilities
Mass assignment
File upload vulnerabilities
SSRF
Rate-limit bypass
Webhook spoofing
Payment manipulation
Privilege escalation

Never trust:

Frontend prices
Frontend membership status
Frontend permissions
Frontend availability
Frontend booking status
Frontend payment status

Everything important must be validated server-side.

==================================================
PERFORMANCE
==================================================

The public site is heavily image/video driven.

Optimize aggressively.

Use:

Next Image
Responsive images
Lazy loading
Preloading only critical assets
Code splitting
Dynamic imports
Server rendering
Caching
ISR/revalidation
CDN-compatible assets

Avoid enormous JavaScript bundles.

Animations must not destroy performance.

Respect:

prefers-reduced-motion

==================================================
SEO
==================================================

Every public page must have:

Title
Description
Canonical URL
OpenGraph
Twitter/X metadata
Structured data where appropriate

Create:

Sitemap
Robots.txt
Dynamic metadata

House pages must be indexable.

Member/admin pages must NOT be publicly indexable.

==================================================
DESIGN SYSTEM
==================================================

Use the provided HUDORIAN visual reference.

Primary visual language:

Cream / off-white background
Black typography
Subtle warm neutrals
Editorial serif headlines
Clean sans-serif body
Large imagery
Thin borders
Small pill buttons
Large whitespace

Do not make every section look like a card grid.

Use:

Editorial layouts
Asymmetry
Full-width photography
Horizontal galleries
Large typography
Overlapping media
Image/text compositions
Scroll-driven storytelling

==================================================
ANIMATION
==================================================

The website must feel alive.

Implement:

Page transitions
Image reveal animations
Text reveal
Scroll-based parallax
Horizontal image movement
Hover image zoom
Cursor interactions where appropriate
Menu transitions
Modal transitions
Gallery transitions
Carousel transitions

But:

DO NOT over-animate.

Animation should communicate hierarchy and luxury.

Use GSAP/Framer Motion intelligently.

Respect reduced-motion settings.

==================================================
RESPONSIVE
==================================================

Fully support:

Desktop
Laptop
Tablet
Mobile

Do not simply shrink desktop.

Create intentional mobile layouts.

Especially:

Navigation
Hero
Carousels
House galleries
Membership application
Member dashboard
Admin tables

==================================================
ACCESSIBILITY
==================================================

Target WCAG 2.2 AA where practical.

Include:

Keyboard navigation
ARIA labels
Visible focus states
Semantic HTML
Accessible forms
Accessible modals
Alt text
Color contrast
Reduced motion
Screen reader support

==================================================
ERROR HANDLING
==================================================

Create proper:

404
500
API errors
Payment errors
Booking errors
Authentication errors
Authorization errors
Validation errors
Network errors

Never expose:

Stack traces
Database errors
Secrets
Internal implementation details

==================================================
ENVIRONMENT
==================================================

Use environment variables.

Never hard-code:

API keys
Database passwords
Payment secrets
SecureGate credentials
Storage credentials
JWT/session secrets

Provide:

.env.example

==================================================
DEVELOPMENT WORKFLOW
==================================================

Before coding:

1. Inspect the repository.
2. Inspect existing files.
3. Inspect existing dependencies.
4. Inspect existing SecureGate integration.
5. Determine what already exists.
6. Do not overwrite working functionality unnecessarily.
7. Create an architecture plan.
8. Create database schema.
9. Create API structure.
10. Create frontend structure.

Then implement incrementally.

==================================================
AGENTIC REQUIREMENT
==================================================

You are expected to ACT.

Do not simply tell me what should be built.

Inspect the project.

Create the files.

Implement the components.

Implement the API.

Implement database migrations.

Implement authentication.

Implement authorization.

Implement admin.

Implement the UI.

Run tests.

Fix errors.

Run linting.

Run type checking.

Run database migration tests.

Perform security review.

Perform responsive review.

Perform accessibility review.

Continue fixing issues until the application is in a coherent working state.

==================================================
PHASED EXECUTION
==================================================

PHASE 1

Foundation

- Project architecture
- Next.js
- Laravel
- MySQL
- Authentication
- SecureGate integration
- Base UI system
- Database
- API foundation

PHASE 2

Public website

- Homepage
- Houses
- Estates
- Stays
- Experiences
- Membership
- Journal

PHASE 3

Membership

- Application
- Plans
- Benefits
- Payments
- Membership lifecycle

PHASE 4

Member portal

- Dashboard
- Digital membership card
- Profile
- Membership
- Bookings
- Payments
- Events

PHASE 5

Booking system

- Rooms
- Availability
- Reservations
- Events
- Capacity management

PHASE 6

Admin

- Dashboard
- Members
- Applications
- Houses
- Estates
- Rooms
- Membership
- Payments
- Events
- CMS
- Media
- Audit logs

PHASE 7

Security

- SecureGate verification
- Authorization review
- OWASP review
- Payment security
- Webhook security
- File upload security
- Rate limiting
- Audit logging

PHASE 8

Performance and production

- SEO
- Image optimization
- Caching
- CDN compatibility
- Accessibility
- Mobile optimization
- Error handling
- Production configuration

==================================================
IMPORTANT UI RULE
==================================================

Do NOT build the website as:

Hero
4 cards
4 cards
CTA
Footer

That is NOT the desired design.

Use the provided reference image as the visual direction.

The homepage should feel like an editorial luxury publication combined with a premium private club.

Use varied section compositions.

Some sections should be:

Full width.

Some centered.

Some asymmetric.

Some horizontal scrolling.

Some image dominant.

Some typography dominant.

Some immersive.

The website should have visual rhythm.

==================================================
IMPORTANT BUSINESS RULE
==================================================

HUDORIAN is a membership platform, not simply a hotel website.

The core relationship is:

USER
 ↓
MEMBERSHIP
 ↓
ACCESS
 ↓
HOUSES / ESTATES / CLUBS
 ↓
STAYS / EVENTS / EXPERIENCES

A member's permissions should determine what they can access.

Example:

Membership Plan
        |
        +---- House Access
        |
        +---- Event Access
        |
        +---- Stay Benefits
        |
        +---- Guest Allowance
        |
        +---- Wellness Access
        |
        +---- Discounts

This must be represented properly in the database and authorization layer.

==================================================
FINAL REQUIREMENT
==================================================

At the end of implementation provide:

1. Architecture summary
2. Database schema summary
3. API documentation
4. Authentication flow
5. SecureGate integration details
6. Admin roles/permissions
7. Payment flow
8. Booking flow
9. Environment variables required
10. Local development instructions
11. Production deployment instructions
12. Security checklist
13. Test results
14. Known limitations

Do not claim something is implemented if it is not.

If a third-party integration requires credentials or external configuration, clearly identify it.

Build HUDORIAN as a real production-grade platform, not a visual prototype.