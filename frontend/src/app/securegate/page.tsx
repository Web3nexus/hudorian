'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  CreditCard,
  FileCheck,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Clock,
  ExternalLink,
  Coins,
  ChevronDown,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';

interface DashboardStats {
  total_members?: number;
  active_members?: number;
  pending_applications?: number;
  total_houses?: number;
  monthly_revenue?: number;
  total_revenue?: number;
  total_reservations?: number;
  upcoming_events?: number;
  recent_applications?: any[];
  recent_reservations?: any[];
}

export default function SecureGateDashboardPage() {
  const { currency, setCurrency, formatPrice, availableCurrencies, currencyConfig } = useCurrency();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('hudorian_admin_token');
        if (!token) return;

        const res = (await api.getAdminStats()) as any;
        if (res) {
          const metrics = res.metrics || res;
          setStats({
            active_members: metrics.active_members ?? 0,
            total_members: metrics.total_members ?? 0,
            pending_applications: metrics.pending_applications ?? 0,
            total_houses: metrics.total_houses ?? 0,
            monthly_revenue: metrics.monthly_revenue ?? metrics.total_revenue ?? 0,
            total_revenue: metrics.total_revenue ?? 0,
            total_reservations: metrics.total_reservations ?? 0,
            upcoming_events: metrics.upcoming_events ?? 0,
            recent_applications: res.recent_applications || [],
            recent_reservations: res.recent_reservations || [],
          });
        }
      } catch (err) {
        console.warn('Could not load live stats from server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <SecureGateLayout
      title="Sanctuary Stewardship & Governance"
      subtitle="Discreet oversight of member sanctuaries, admissions dossiers, and editorial publications."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition"
              title="Change Stewardship Currency"
            >
              <Coins className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{currencyConfig.flag} {currencyConfig.code} ({currencyConfig.symbol})</span>
              <ChevronDown className="w-3 h-3 text-white/50" />
            </button>

            {currencyMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#141418] border border-white/15 shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-mono text-white/40 uppercase tracking-widest border-b border-white/5">
                  Select Currency
                </div>
                {availableCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code as CurrencyCode);
                      setCurrencyMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition ${
                      currency === c.code ? 'text-[#C5A880] font-semibold bg-white/[0.03]' : 'text-white/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                      <span className="text-white/40 text-[11px]">({c.symbol})</span>
                    </span>
                    {currency === c.code && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/securegate/cms"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#B8976C]/10"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch CMS Studio</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Active Members */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-[#B8976C]/30 transition duration-300">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Active Members</span>
              <div className="p-2 rounded-lg bg-white/5 text-[#C5A880]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif-luxury text-3xl font-medium text-white">
                {loading ? '...' : (stats?.active_members ?? 0)}
              </span>
              <Link
                href="/securegate/members"
                className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                Members Directory <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: Pending Membership Applications */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-[#B8976C]/30 transition duration-300">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Membership Applications</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif-luxury text-3xl font-medium text-white">
                {loading ? '...' : (stats?.pending_applications ?? 0)}
              </span>
              <Link
                href="/securegate/applications"
                className="text-[11px] font-mono text-[#C5A880] hover:underline flex items-center gap-0.5"
              >
                Review Candidates <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Global Sanctuaries */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-[#B8976C]/30 transition duration-300">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Sanctuaries & Houses</span>
              <div className="p-2 rounded-lg bg-white/5 text-[#C5A880]">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif-luxury text-3xl font-medium text-white">
                {loading ? '...' : (stats?.total_houses ?? 0)}
              </span>
              <span className="text-[11px] font-mono text-white/40">Verified Enclaves</span>
            </div>
          </div>

          {/* Card 4: Dues & Transaction Volume (Currency Aware) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-[#B8976C]/30 transition duration-300">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Transaction Volume</span>
              <div className="p-2 rounded-lg bg-white/5 text-[#C5A880]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif-luxury text-3xl font-medium text-white">
                {loading ? '...' : formatPrice(stats?.monthly_revenue || stats?.total_revenue || 0)}
              </span>
              <Link
                href="/securegate/payments"
                className="text-[11px] font-mono text-[#C5A880] hover:underline flex items-center gap-0.5"
              >
                Treasury Ledger <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic CMS Quick Management Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#17171D] via-[#121217] to-[#0D0D11] border border-[#B8976C]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#B8976C]/20 border border-[#B8976C]/40 text-[#C5A880] text-[10px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
              <span>Editorial & Brand Engine Active</span>
            </div>
            <h3 className="font-serif-luxury text-xl md:text-2xl text-white">
              Instant Site Customization & Brand Management
            </h3>
            <p className="text-xs text-white/60 font-light leading-relaxed">
              Update the club emblem, royal houses, allies, private estates, legal charters, and hero imagery across all sanctuaries in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link
              href="/securegate/cms"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              <span>Open CMS Studio</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition flex items-center gap-1.5"
            >
              <span>Preview Live Sanctuary</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </Link>
          </div>
        </div>

        {/* Two-Column Section: Pending Vetting & Safeguards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Applications Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury text-xl text-white">
                  Admissions Dossiers
                </h2>
                <p className="text-xs text-white/50 font-light">
                  Awaiting Admissions Committee review
                </p>
              </div>
              <Link
                href="/securegate/applications"
                className="text-xs font-mono text-[#C5A880] hover:underline flex items-center gap-1"
              >
                View all queue <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="p-8 text-center text-xs text-white/40 font-mono">
                  Loading admissions records...
                </div>
              ) : (stats?.recent_applications || []).length === 0 ? (
                <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <p className="text-xs text-white/60">No pending admissions dossiers in queue.</p>
                  <p className="text-[11px] text-white/40 font-light">All membership inquiries have been reviewed.</p>
                </div>
              ) : (
                stats?.recent_applications?.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white">
                          {app.first_name} {app.last_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400 capitalize">
                          {(app.status || 'under_review').replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-light">
                        {app.profession || 'Patron Candidate'} {app.city ? `• ${app.city}, ${app.country}` : ''}
                      </p>
                    </div>

                    <Link
                      href={`/securegate/applications?id=${app.id}`}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#B8976C] hover:text-black border border-white/10 text-xs font-medium text-white/90 transition duration-200"
                    >
                      Review Dossier
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Vault Safeguards & Fast Links */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="font-serif-luxury text-xl text-white">
                Vault Safeguards & Patron Privacy
              </h2>
              <p className="text-xs text-white/50 font-light">
                Data protection integrity and confidential access controls
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs text-white/60">Steward Authentication</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Verified & Protected
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs text-white/60">Patron Digital Keys</span>
                <span className="text-xs font-mono text-[#C5A880] font-semibold">
                  HMAC Cryptographic Seal
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs text-white/60">Reservation Vault</span>
                <span className="text-xs font-mono text-white/80">
                  Concurrency Protected
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Governance & Activity Ledger</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Active & Monitored
                </span>
              </div>

              <div className="pt-2">
                <Link
                  href="/securegate/audit-logs"
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>Review Activity Ledger</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SecureGateLayout>
  );
}
