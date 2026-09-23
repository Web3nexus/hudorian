'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Building2,
  CreditCard,
  History,
  ShieldCheck,
  LogOut,
  Sliders,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Clock,
  Database,
} from 'lucide-react';

interface SecureGateLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function SecureGateLayout({
  children,
  title,
  subtitle,
  actions,
}: SecureGateLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ name?: string; email?: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    // 1. Verify admin token
    const token = localStorage.getItem('hudorian_admin_token');
    const storedUser = localStorage.getItem('hudorian_admin');

    if (!token) {
      router.replace('/securegate/login');
      return;
    }

    if (storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }

    setIsAuthenticated(true);
    setIsVerifying(false);

    // 2. Real-time clock ticker
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('hudorian_admin_token');
    localStorage.removeItem('hudorian_admin');
    router.push('/securegate/login');
  };

  const navItems = [
    { label: 'Executive Overview', href: '/securegate', icon: LayoutDashboard },
    { label: 'CMS & Site Studio', href: '/securegate/cms', icon: Sliders, badge: 'DYNAMIC' },
    { label: 'Security & Auth Keys', href: '/securegate/security', icon: ShieldCheck, badge: 'PROTECTION' },
    { label: 'Membership Queue', href: '/securegate/applications', icon: FileCheck },
    { label: 'Member Registry', href: '/securegate/members', icon: Users },
    { label: 'Houses & Inventory', href: '/securegate/houses', icon: Building2 },
    { label: 'Financial Vault', href: '/securegate/payments', icon: CreditCard },
    { label: 'Audit Trail', href: '/securegate/audit-logs', icon: History },
  ];

  if (isVerifying || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#B8976C]/20 to-white/10 border border-[#B8976C]/40 flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-6 h-6 text-[#C5A880]" />
          </div>
          <div className="text-center space-y-1">
            <span className="font-serif-luxury text-xl tracking-[0.3em] uppercase block text-white/90">
              HUDORIAN
            </span>
            <p className="text-xs text-white/40 font-mono tracking-widest uppercase">
              Verifying SecureGate Perimeter...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAF8F5] flex flex-col antialiased selection:bg-[#B8976C]/30 selection:text-white">
      {/* Top Atmospheric Ambient Glow */}
      <div className="fixed top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#B8976C]/5 via-transparent to-transparent pointer-events-none z-0" />

      {/* Modern Executive Header */}
      <header className="sticky top-0 z-40 bg-[#0E0E11]/85 backdrop-blur-xl border-b border-white/5 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white/70"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/securegate" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition duration-300">
              <img
                src="/images/hudorian-seal.png"
                alt="HUDORIAN Seal"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-lg font-medium tracking-[0.25em] uppercase text-white">
                  HUDORIAN
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-sm bg-[#B8976C]/15 text-[#C5A880] border border-[#B8976C]/30 tracking-widest">
                  SECUREGATE
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center / Right Executive Status Indicators */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Live UTC Clock */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[11px] font-mono text-white/60">
            <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{currentTime || 'SYNCHRONIZING'}</span>
          </div>

          {/* Database Health Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3 h-3 text-emerald-400/80" />
            <span className="font-mono">Vault 3306 // Online</span>
          </div>

          {/* Public Portal Switcher */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition"
          >
            <ExternalLink className="w-3 h-3 text-white/50" />
            <span>Live Sanctuary</span>
          </Link>

          {/* Admin User Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-white leading-tight">
                {adminUser?.name || 'Alexander Vance'}
              </p>
              <p className="text-[10px] font-mono text-[#C5A880] tracking-wider">
                SUPER ADMIN
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Secure Logout"
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex relative z-10 max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 py-8 pr-6 border-r border-white/5">
          <div className="space-y-1 mb-8">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-white/40 px-3 block mb-3">
              Core Command
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/securegate'
                  ? pathname === '/securegate'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#B8976C]/20 to-transparent text-[#FAF8F5] border-l-2 border-[#C5A880]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-[#C5A880]'
                          : 'text-white/40 group-hover:text-white/80'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-[#B8976C]/20 text-[#C5A880] border border-[#B8976C]/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && !item.badge && (
                    <ChevronRight className="w-3.5 h-3.5 text-[#C5A880]/70" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick System Badge */}
          <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span className="font-mono">Security Tier</span>
              <span className="text-[#C5A880] font-semibold">Tier 4 Clearance</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-[#C5A880] h-full w-full" />
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed font-light">
              MFA Hardware Enforced • Dual cryptographic session active.
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <span className="font-serif-luxury text-xl tracking-[0.2em] text-white">
                HUDORIAN // SECUREGATE
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-lg bg-white/10 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/securegate'
                    ? pathname === '/securegate'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                      isActive
                        ? 'bg-[#B8976C]/20 text-white font-medium border-l-2 border-[#C5A880]'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#C5A880]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#B8976C]/20 text-[#C5A880]">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 py-8 md:pl-8 px-4 md:px-0">
          {(title || actions) && (
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
              <div>
                {title && (
                  <h1 className="font-serif-luxury text-2xl md:text-3xl text-white tracking-wide">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xs text-white/50 font-light mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

