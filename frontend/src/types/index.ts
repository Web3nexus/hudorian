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
  location?: Location;
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

