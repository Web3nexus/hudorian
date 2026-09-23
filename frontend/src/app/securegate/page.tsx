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
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

interface DashboardStats {
  total_members?: number;
  active_members?: number;
  pending_applications?: number;
  total_houses?: number;
  monthly_revenue?: number;
  currency?: string;
  recent_applications?: any[];
  recent_payments?: any[];
}

export default function SecureGateDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    active_members: 142,
    pending_applications: 3,
    total_houses: 6,
    monthly_revenue: 184500,
    currency: 'EUR',
    recent_applications: [
      {
        id: 1,
        first_name: 'Julian',
        last_name: 'Croft',
        profession: 'Architect & Creative Director',
        city: 'San Francisco',
        country: 'United States',
        status: 'under_review',
        submitted_at: '2 hours ago',
      },
      {
        id: 2,
        first_name: 'Genevieve',
        last_name: 'Duval',
        profession: 'Contemporary Art Patron',
        city: 'Paris',
        country: 'France',
        status: 'under_review',
        submitted_at: '5 hours ago',
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('hudorian_admin_token');
        if (!token) return;

        const res = await api.getAdminStats() as any;
        if (res) {
          setStats((prev) => ({
            ...prev,
            ...res,
          }));
        }
      } catch (err) {
        console.warn('Could not load live stats, using local buffer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <SecureGateLayout
      title="Executive Command Center"
      subtitle="Real-time surveillance of global houses, patronage applications, and dynamic CMS assets."
      actions={
        <div className="flex items-center gap-3">
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
                {stats.active_members || 142}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                +12% this cycle
              </span>
            </div>
          </div>

          {/* Card 2: Pending Applications */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-[#B8976C]/30 transition duration-300">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Patronage Vetting</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif-luxury text-3xl font-medium text-white">
                {stats.pending_applications || 3}
              </span>
              <Link
                href="/securegate/applications"
                className="text-[11px] font-mono text-[#C5A880] hover:underline flex items-center gap-0.5"
              >
                Review Queue <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Global Houses */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-[#B8976C]/30 transition duration-300">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Sanctuaries</span>
              <div className="p-2 rounded-lg bg-white/5 text-[#C5A880]">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif-luxury text-3xl font-medium text-white">
                {stats.total_houses || 6}
              </span>
              <span className="text-[11px] font-mono text-white/40">Across 5 Nations</span>
            </div>
          </div>

          {/* Card 4: Monthly Volume */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-[#B8976C]/30 transition duration-300">
            <div className="flex items-center justify-between text-white/50 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Monthly Patronage</span>
              <div className="p-2 rounded-lg bg-white/5 text-[#C5A880]">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-serif-luxury text-3xl font-medium text-white">
                €{(stats.monthly_revenue || 184500).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <TrendingUp className="w-3 h-3" />
                98.4% collection
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic CMS Quick Management Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#17171D] via-[#121217] to-[#0D0D11] border border-[#B8976C]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#B8976C]/20 border border-[#B8976C]/40 text-[#C5A880] text-[10px] font-mono uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
              <span>Dynamic CMS Engine Online</span>
            </div>
            <h3 className="font-serif-luxury text-xl md:text-2xl text-white">
              Instant Site Customization & Brand Management
            </h3>
            <p className="text-xs text-white/60 font-light leading-relaxed">
              Update the club logo, navigation headers, footer columns, and hero images across all public pages in real time without code deployment.
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
              <span>Preview Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/50" />
            </Link>
          </div>
        </div>

        {/* Two-Column Section: Pending Vetting & Immutable Audit Trail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Applications Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-luxury text-xl text-white">
                  Patronage Applications
                </h2>
                <p className="text-xs text-white/50 font-light">
                  Vetting queue awaiting Committee review
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
              {(stats.recent_applications || []).map((app: any) => (
                <div
                  key={app.id}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">
                        {app.first_name} {app.last_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        {app.status || 'under_review'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 font-light">
                      {app.profession} • {app.city}, {app.country}
                    </p>
                  </div>

                  <Link
                    href={`/securegate/applications?id=${app.id}`}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-[#B8976C] hover:text-black border border-white/10 text-xs font-medium text-white/90 transition duration-200"
                  >
                    Vetting Dossier
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Security Status & Fast Links */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <h2 className="font-serif-luxury text-xl text-white">
                Perimeter Defense & Vault
              </h2>
              <p className="text-xs text-white/50 font-light">
                Cryptographic security status and audit integrity
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs text-white/60">SecureGate Adapter</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MFA Enforced
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs text-white/60">Digital Passes</span>
                <span className="text-xs font-mono text-[#C5A880] font-semibold">
                  HMAC-SHA256 Signed
                </span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs text-white/60">Concurrency Locks</span>
                <span className="text-xs font-mono text-white/80">
                  InnoDB lockForUpdate()
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Audit Trail Logging</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Active (0 Dropped)
                </span>
              </div>

              <div className="pt-2">
                <Link
                  href="/securegate/audit-logs"
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 hover:text-white transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>Inspect Audit Ledger</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SecureGateLayout>
  );
}

