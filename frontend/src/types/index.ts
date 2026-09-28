export interface Location {
  id: number;
  name: string;
  slug: string;
  country: string;
  region?: string;
}

export interface Amenity {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  category: string;
}

export interface HouseMedia {
  id: number;
  media_url: string;
  media_type: 'image' | 'video' | 'floorplan' | '360';
  caption?: string;
}

export interface Room {
  id: number;
  house_id: number;
  name: string;
  slug: string;
  room_type: string;
  description: string;
  capacity: number;
  max_adults: number;
  max_children: number;
  base_price_per_night: number;
  currency: string;
  size_sqm?: number;
  hero_image?: string;
  status: string;
  house?: House;
  amenities?: Amenity[];
  media?: { id: number; media_url: string; caption?: string }[];
}

export interface House {
  id: number;
  location_id: number;
  estate_id?: number | null;
  name: string;
  slug: string;
  tagline?: string;
  house_type: string;
  short_description?: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  hero_image?: string;
  hero_video?: string;
  status: string;
  is_featured: boolean;
  sort_order?: number;
  rooms_count?: number;
  location?: Location;
  estate?: Estate | null;
  amenities?: Amenity[];
  media?: HouseMedia[];
  rooms?: Room[];
  events?: Event[];
}

export interface Estate {
  id: number;
  location_id: number;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  hero_image?: string;
  location?: Location;
  houses?: House[];
}

export interface Event {
  id: number;
  house_id: number;
  title: string;
  slug: string;
  event_type: string;
  short_description?: string;
  description: string;
  starts_at: string;
  ends_at: string;
  location_detail?: string;
  capacity: number;
  booked_count: number;
  available_seats?: number;
  price: number;
  currency: string;
  is_member_only: boolean;
  hero_image?: string;
  status: string;
  house?: House;
}

export interface MembershipPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  billing_period: string;
  guest_allowance: number;
  house_access_type: string;
  stay_discount_percent: number;
  perks?: string[];
  is_active: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  country?: string;
  member?: {
    id: number;
    membership_number: string;
    status: string;
    plan?: {
      name: string;
      slug: string;
      house_access_type: string;
    };
    expires_at?: string;
  } | null;
}

export interface Reservation {
  id: number;
  reservation_number: string;
  user_id: number;
  room_id: number;
  house_id: number;
  check_in: string;
  check_out: string;
  total_nights: number;
  guests_count: number;
  night_rate: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  room?: Room;
  house?: House;
}

export interface EventBooking {
  id: number;
  booking_reference: string;
  event_id: number;
  tickets_count: number;
  total_price: number;
  currency: string;
  status: string;
  event?: Event;
}

export interface JournalPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  author_name: string;
  reading_time_minutes: number;
  published_at?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Payment {
  id: number;
  transaction_id: string;
  amount: number;
  currency: string;
  provider: string;
  status: string;
  payment_method?: string;
  created_at: string;
  invoices?: { id: number; invoice_number: string; pdf_url?: string }[];
}

export type BookFormat = 'pdf' | 'epub';
export type BookStatus = 'draft' | 'published' | 'archived';
export type LoanType = 'purchase' | 'rental';
export type LoanStatus = 'active' | 'expired' | 'revoked';
export type AcquisitionMode = 'purchase' | 'rental';

export interface BookCollection {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  cover_image?: string | null;
  is_active: boolean;
  sort_order?: number;
  books_count?: number;
}

/** The reader's live entitlement for a single title. */
export interface BookAccess {
  loan_id: number;
  loan_type: LoanType;
  status: LoanStatus;
  granted_at?: string | null;
  expires_at?: string | null;
  days_remaining: number;
  download_count?: number;
}

export interface Book {
  id: number;
  collection_id?: number | null;
  collection?: BookCollection | null;
  collection_name?: string | null;
  title: string;
  slug: string;
  author: string;
  isbn?: string | null;
  format: BookFormat;
  language?: string | null;
  published_year?: string | null;
  page_count?: number | null;
  short_description?: string | null;
  description: string;
  cover_image?: string | null;
  purchase_price: number;
  rental_price: number;
  currency: string;
  /** Per-book override; null means the archive-wide default applies. */
  rental_days: number | null;
  /** Resolved server-side: the override when set, otherwise the default. */
  effective_rental_days: number;
  allow_purchase: boolean;
  allow_rental: boolean;
  status: BookStatus;
  is_featured: boolean;
  sort_order?: number;
  access?: BookAccess | null;
  /** Admin-only; never present in public responses. */
  file_url?: string | null;
  loans_count?: number;
}

export interface BookShelfEntry {
  id: number;
  loan_type: LoanType;
  status: LoanStatus;
  grants_access: boolean;
  granted_at?: string | null;
  expires_at?: string | null;
  days_remaining: number;
  download_count: number;
  last_downloaded_at?: string | null;
  book: Book | null;
}

export interface MyArchive {
  shelf: BookShelfEntry[];
  summary: {
    owned: number;
    active_rentals: number;
    expired: number;
  };
}

export interface LibraryConfig {
  purchase_enabled: boolean;
  rental_enabled: boolean;
  default_rental_days: number;
  max_rental_days: number;
  rental_terms: string;
  purchase_terms: string;
}

export interface BookCheckoutResult {
  success: boolean;
  gateway: 'flutterwave' | 'paystack' | 'manual';
  status?: string;
  message?: string;
  checkout_url?: string | null;
  authorization_url?: string | null;
  tx_ref?: string;
  reference?: string;
  payment_id?: number;
  amount?: number;
  currency?: string;
  exchange_rate?: number;
  rate_provider?: string;
  /** Issued for guests so they can reach the archive they just paid for. */
  token?: string | null;
  payment?: {
    id: number;
    transaction_id: string;
    amount: number;
    currency: string;
    status: string;
    transfer_reference?: string | null;
  };
}

export interface ArchiveLoan {
  id: number;
  loan_type: LoanType;
  status: LoanStatus;
  grants_access: boolean;
  granted_at?: string | null;
  expires_at?: string | null;
  days_remaining: number;
  download_count: number;
  book?: { id: number; title: string; slug: string } | null;
  reader?: { id: number; name: string; email: string } | null;
}

export interface AdminArchiveReference {
  data: {
    formats: BookFormat[];
    statuses: BookStatus[];
    loan_types: LoanType[];
    loan_statuses: LoanStatus[];
    settings: LibraryConfig;
    collections: Pick<BookCollection, 'id' | 'name' | 'slug' | 'is_active'>[];
    members: { id: number; name: string; email: string }[];
  };
}

export interface AuditLog {
  id: number;
  actor_name?: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  ip_address?: string;
  created_at: string;
  details?: Record<string, unknown>;
}

export interface HeaderNavItem {
  label: string;
  href: string;
  order: number;
  is_active: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface BrandSettings {
  logo_type?: 'text' | 'image';
  logo_text?: string;
  logo_image_url?: string;
  tagline?: string;
  concierge_email?: string;
  concierge_phone?: string;
  office_address?: string;
  address?: string;
  currency_symbol?: string;
}

export interface CmsBlock {
  id?: number;
  key: string;
  title?: string;
  subtitle?: string;
  body?: string;
  media_url?: string;
  payload?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

