import { House, Room, Event, MembershipPlan, User, Reservation, EventBooking, JournalPost, CmsBlock } from '../types';

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/api/v1';
    }
  }
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getBaseUrl();

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('hudorian_token');
  }

  private getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('hudorian_admin_token');
  }

  private getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api/v1';
      }
    }
    return 'http://localhost:8000/api/v1';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAdminToken: boolean = false
  ): Promise<T> {
    const token = useAdminToken ? this.getAdminToken() : this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const baseUrl = this.getBaseUrl();
      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          if (useAdminToken && typeof window !== 'undefined') {
            localStorage.removeItem('hudorian_admin_token');
            localStorage.removeItem('hudorian_admin');
            const path = window.location.pathname;
            if ((path.startsWith('/admin') || path.startsWith('/securegate')) && !path.endsWith('/login')) {
              window.location.href = '/securegate/login';
            }
          }
        }
        throw new Error(data.message || data.error || `HTTP error ${res.status}`);
      }

      return data as T;
    } catch (err: unknown) {
      // If server is not running during client preview, log and rethrow or fallback
      console.warn(`API request to ${endpoint} failed:`, err);
      throw err;
    }
  }

  // --- Discovery ---
  async getHouses(params?: { location?: string; type?: string; featured?: boolean }): Promise<{ data: House[] }> {
    const searchParams = new URLSearchParams();
    if (params?.location) searchParams.append('location', params.location);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.featured) searchParams.append('featured', '1');
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ data: House[] }>(`/houses${qs}`);
  }

  async getHouseBySlug(slug: string): Promise<{ data: House }> {
    return this.request<{ data: House }>(`/houses/${slug}`);
  }

  async getStays(params?: { house_id?: number; guests?: number; check_in?: string; check_out?: string }): Promise<{ data: Room[] }> {
    const searchParams = new URLSearchParams();
    if (params?.house_id) searchParams.append('house_id', params.house_id.toString());
    if (params?.guests) searchParams.append('guests', params.guests.toString());
    if (params?.check_in) searchParams.append('check_in', params.check_in);
    if (params?.check_out) searchParams.append('check_out', params.check_out);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{ data: Room[] }>(`/stays${qs}`);
  }

  async getRoomBySlug(slug: string): Promise<{ data: Room }> {
    return this.request<{ data: Room }>(`/stays/${slug}`);
  }

  async checkAvailability(roomId: number, checkIn: string, checkOut: string): Promise<{ available: boolean }> {
    return this.request<{ available: boolean }>('/stays/check-availability', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, check_in: checkIn, check_out: checkOut }),
    });
  }

  async bookStay(data: { room_id: number; check_in: string; check_out: string; guests_count: number; special_requests?: string }): Promise<{ reservation: Reservation }> {
    return this.request<{ reservation: Reservation }>('/stays/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEvents(): Promise<{ data: Event[] }> {
    return this.request<{ data: Event[] }>('/events');
  }

  async bookEvent(eventId: number, ticketsCount: number = 1): Promise<{ booking: EventBooking }> {
    return this.request<{ booking: EventBooking }>(`/events/${eventId}/book`, {
      method: 'POST',
      body: JSON.stringify({ tickets_count: ticketsCount }),
    });
  }

  // --- Membership ---
  async getMembershipPlans(): Promise<{ data: MembershipPlan[] }> {
    return this.request<{ data: MembershipPlan[] }>('/membership/plans');
  }

  async submitApplication(data: Record<string, unknown>): Promise<{ application: { id: number; status: string } }> {
    return this.request<{ application: { id: number; status: string } }>('/membership/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDigitalCard(): Promise<{
    member: { name: string; membership_number: string; plan_name: string; status: string; expires_at?: string };
    card: { token: string; expires_at: string; verify_url: string };
  }> {
    return this.request('/member/card');
  }

  async verifyCard(token: string): Promise<{ valid: boolean; status: string; message: string; member?: unknown }> {
    return this.request(`/verify-card/${token}`);
  }

  // --- Member Auth & Portal ---
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    city?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('hudorian_token', res.token);
      localStorage.setItem('hudorian_user', JSON.stringify(res.user));
    }
    return res;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('hudorian_token', res.token);
      localStorage.setItem('hudorian_user', JSON.stringify(res.user));
    }
    return res;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(data: {
    name?: string;
    phone?: string;
    city?: string;
    country?: string;
    current_password?: string;
    new_password?: string;
  }): Promise<{ message: string; user: User }> {
    const res = await this.request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (typeof window !== 'undefined' && res.user) {
      localStorage.setItem('hudorian_user', JSON.stringify(res.user));
    }
    return res;
  }

  async getMemberDashboard(): Promise<unknown> {
    return this.request('/member/dashboard');
  }

  async getMemberBookings(): Promise<{ stays: Reservation[]; events: EventBooking[] }> {
    return this.request<{ stays: Reservation[]; events: EventBooking[] }>('/member/bookings');
  }

  async getMemberPayments(): Promise<{ data: unknown[] }> {
    return this.request('/member/payments');
  }

  // --- Journal ---
  async getJournal(): Promise<{ data: JournalPost[] }> {
    return this.request<{ data: JournalPost[] }>('/journal');
  }

  async getJournalPost(slug: string): Promise<{ data: JournalPost; related: JournalPost[] }> {
    return this.request<{ data: JournalPost; related: JournalPost[] }>(`/journal/${slug}`);
  }

  // --- Security & Bot Protection ---
  async getSecurityConfig(): Promise<{
    captcha_provider: 'none' | 'cloudflare_turnstile' | 'google_recaptcha';
    cloudflare_site_key?: string | null;
    google_recaptcha_site_key?: string | null;
  }> {
    return this.request('/security/config');
  }

  async getAdminSecuritySettings(): Promise<{
    settings: {
      captcha_provider: 'none' | 'cloudflare_turnstile' | 'google_recaptcha';
      cloudflare_site_key?: string;
      cloudflare_secret_key?: string;
      google_recaptcha_site_key?: string;
      google_recaptcha_secret_key?: string;
    };
    current_admin_2fa: {
      enabled: boolean;
      confirmed_at?: string | null;
    };
  }> {
    return this.request('/admin/security/settings', {}, true);
  }

  async updateAdminSecuritySettings(data: {
    captcha_provider: string;
    cloudflare_site_key?: string;
    cloudflare_secret_key?: string;
    google_recaptcha_site_key?: string;
    google_recaptcha_secret_key?: string;
  }): Promise<{ message: string; settings: unknown }> {
    return this.request('/admin/security/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async setupAdmin2fa(): Promise<{ secret: string; otpauth_uri: string; qr_code_url: string }> {
    return this.request('/admin/security/2fa/setup', {
      method: 'POST',
    }, true);
  }

  async confirmAdmin2fa(secret: string, code: string): Promise<{ message: string; google2fa_enabled: boolean }> {
    return this.request('/admin/security/2fa/confirm', {
      method: 'POST',
      body: JSON.stringify({ secret, code }),
    }, true);
  }

  async disableAdmin2fa(password: string): Promise<{ message: string; google2fa_enabled: boolean }> {
    return this.request('/admin/security/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }, true);
  }

  // --- SecureGate Admin ---
  async adminLogin(email: string, password: string, captchaToken?: string): Promise<{
    status?: string;
    requires_mfa: boolean;
    mfa_token?: string;
    token?: string;
    admin?: User;
  }> {
    const res = await this.request<{
      status?: string;
      requires_mfa: boolean;
      mfa_token?: string;
      token?: string;
      admin?: User;
    }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, captcha_token: captchaToken }),
    });

    if (!res.requires_mfa && res.token && res.admin) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hudorian_admin_token', res.token);
        localStorage.setItem('hudorian_admin', JSON.stringify(res.admin));
      }
    }

    return res;
  }

  async adminVerifyMfa(mfaToken: string, code: string): Promise<{ token: string; admin: User }> {
    const res = await this.request<{ token: string; admin: User }>('/admin/auth/verify-mfa', {
      method: 'POST',
      body: JSON.stringify({ mfa_token: mfaToken, code }),
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('hudorian_admin_token', res.token);
      localStorage.setItem('hudorian_admin', JSON.stringify(res.admin));
    }
    return res;
  }

  async getAdminStats(): Promise<unknown> {
    return this.request('/admin/dashboard/stats', {}, true);
  }

  async getAdminMembers(): Promise<unknown> {
    return this.request('/admin/members', {}, true);
  }

  async updateMemberStatus(id: number, status: string, internalNotes?: string): Promise<unknown> {
    return this.request(`/admin/members/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, internal_notes: internalNotes }),
    }, true);
  }

  async getAdminApplications(status?: string): Promise<unknown> {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/admin/applications${qs}`, {}, true);
  }

  async reviewApplication(id: number, decision: 'approved' | 'rejected' | 'under_review', notes?: string): Promise<unknown> {
    return this.request(`/admin/applications/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    }, true);
  }

  async getAdminAuditLogs(): Promise<unknown> {
    return this.request('/admin/audit-logs', {}, true);
  }

  // --- CMS & Site Content ---
  async getCmsBlocks(): Promise<{ data: Record<string, CmsBlock> }> {
    return this.request<{ data: Record<string, CmsBlock> }>('/cms/blocks');
  }

  async getCmsBlock(key: string): Promise<{ data: CmsBlock }> {
    return this.request<{ data: CmsBlock }>(`/cms/blocks/${key}`);
  }

  async updateCmsBlock(key: string, data: Partial<CmsBlock>): Promise<{ message: string; data: CmsBlock }> {
    return this.request<{ message: string; data: CmsBlock }>(`/admin/cms/blocks/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async batchUpdateCmsBlocks(blocks: Partial<CmsBlock>[]): Promise<{ message: string; data: Record<string, CmsBlock> }> {
    return this.request<{ message: string; data: Record<string, CmsBlock> }>('/admin/cms/batch', {
      method: 'POST',
      body: JSON.stringify({ blocks }),
    }, true);
  }

  // --- Payment Gateways & Membership Checkout ---
  async getPaymentConfig(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/payments/config');
  }

  async initializePayment(data: {
    gateway: 'flutterwave' | 'paystack' | 'manual';
    membership_plan_id: number;
    currency?: string;
    redirect_url?: string;
    email?: string;
    name?: string;
    phone?: string;
    transfer_reference?: string;
    sender_bank?: string;
    sender_account_name?: string;
    transfer_date?: string;
    proof_notes?: string;
  }): Promise<any> {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: {
    gateway: 'flutterwave' | 'paystack';
    reference?: string;
    transaction_id?: string;
  }): Promise<any> {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Real-Time Currency Rates & FX Engine ---
  async getCurrencyRates(gateway: string = 'manual', base: string = 'EUR'): Promise<{
    status: string;
    data: {
      base: string;
      provider: string;
      rates: Record<string, number>;
      updated_at: string;
      is_live: boolean;
    };
  }> {
    return this.request(`/currency/rates?gateway=${encodeURIComponent(gateway)}&base=${encodeURIComponent(base)}`);
  }

  async convertCurrency(amount: number, from: string, to: string, gateway: string = 'manual'): Promise<{
    status: string;
    data: {
      original_amount: number;
      original_currency: string;
      target_amount: number;
      target_currency: string;
      rate: number;
      provider: string;
      is_live: boolean;
    };
  }> {
    return this.request(`/currency/convert?amount=${amount}&from=${from}&to=${to}&gateway=${gateway}`);
  }

  // --- Admin Financials & Payment Settings ---
  async getAdminPayments(params?: { status?: string; provider?: string; search?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.provider) searchParams.append('provider', params.provider);
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/admin/payments${qs}`, {}, true);
  }

  async exportAdminPayments(params?: { status?: string; provider?: string; search?: string }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.provider) searchParams.append('provider', params.provider);
    if (params?.search) searchParams.append('search', params.search);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const token = typeof window !== 'undefined' ? localStorage.getItem('hudorian_admin_token') : null;
    const res = await fetch(`${this.getBaseUrl()}/admin/payments/export${qs}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.blob();
  }

  async getAdminPaymentSettings(): Promise<{ settings: any }> {
    return this.request<{ settings: any }>('/admin/payments/settings', {}, true);
  }

  async updateAdminPaymentSettings(settings: any): Promise<{ message: string; settings: any }> {
    return this.request<{ message: string; settings: any }>('/admin/payments/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }, true);
  }

  async approveManualPayment(id: number, notes?: string): Promise<any> {
    return this.request(`/admin/payments/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }, true);
  }

  async rejectManualPayment(id: number, reason: string): Promise<any> {
    return this.request(`/admin/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, true);
  }

  async refundPayment(id: number, reason?: string): Promise<unknown> {
    return this.request(`/admin/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }, true);
  }

  async getAdminHouses(): Promise<unknown> {
    return this.request('/admin/houses', {}, true);
  }

  // --- Admin Profile Management ---
  async getAdminProfile(): Promise<{ admin: { id: number; name: string; email: string; role: string; google2fa_enabled: boolean } }> {
    return this.request('/admin/profile', {}, true);
  }

  async updateAdminProfile(data: {
    name: string;
    email: string;
    current_password?: string;
    new_password?: string;
    new_password_confirmation?: string;
  }): Promise<{ message: string; admin: { id: number; name: string; email: string; role: string; google2fa_enabled: boolean } }> {
    return this.request('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }
}

export const api = new ApiClient();

