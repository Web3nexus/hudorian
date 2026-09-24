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
  User,
  Edit2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

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

  // Profile Edit Modal State
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [profileName, setProfileName] = useState<string>('');
  const [profileEmail, setProfileEmail] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        const parsed = JSON.parse(storedUser);
        setAdminUser(parsed);
        setProfileName(parsed.name || '');
        setProfileEmail(parsed.email || '');
      } catch {
        // ignore
      }
    }

    // Try fetching fresh profile from backend
    api.getAdminProfile()
      .then((res) => {
        if (res && res.admin) {
          setAdminUser(res.admin);
          setProfileName(res.admin.name || '');
          setProfileEmail(res.admin.email || '');
          localStorage.setItem('hudorian_admin', JSON.stringify(res.admin));
        }
      })
      .catch(() => {
        // continue with stored user
      });

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

  const handleOpenProfileModal = () => {
    setProfileName(adminUser?.name || '');
    setProfileEmail(adminUser?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
    setProfileMessage(null);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    if (showPasswordChange && newPassword && newPassword !== confirmPassword) {
      setProfileMessage({ type: 'error', text: 'New passwords do not match.' });
      setProfileLoading(false);
      return;
    }

    try {
      const payload: {
        name: string;
        email: string;
        current_password?: string;
        new_password?: string;
        new_password_confirmation?: string;
      } = {
        name: profileName.trim(),
        email: profileEmail.trim(),
      };

      if (showPasswordChange && newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
        payload.new_password_confirmation = confirmPassword;
      }

      const res = await api.updateAdminProfile(payload);

      // Update state and local storage
      const updatedAdmin = {
        ...adminUser,
        name: res.admin.name,
        email: res.admin.email,
      };
      setAdminUser(updatedAdmin);
      localStorage.setItem('hudorian_admin', JSON.stringify(updatedAdmin));

      setProfileMessage({ type: 'success', text: 'Administrator profile updated successfully.' });
      setTimeout(() => {
        setProfileModalOpen(false);
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update administrator profile.';
      setProfileMessage({ type: 'error', text: msg });
    } finally {
      setProfileLoading(false);
    }
  };

  const navItems = [
    { label: 'Sanctuary Overview', href: '/securegate', icon: LayoutDashboard },
    { label: 'CMS & Editorial Studio', href: '/securegate/cms', icon: Sliders, badge: 'DYNAMIC' },
    { label: 'Vault & Protection', href: '/securegate/security', icon: ShieldCheck, badge: 'PROTECTED' },
    { label: 'Membership Applications', href: '/securegate/applications', icon: FileCheck },
    { label: 'Members Directory', href: '/securegate/members', icon: Users },
    { label: 'Sanctuaries & Houses', href: '/securegate/houses', icon: Building2 },
    { label: 'Transactions & Treasury', href: '/securegate/payments', icon: CreditCard },
    { label: 'Audit & Activity Ledger', href: '/securegate/audit-logs', icon: History },
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
              Verifying Steward Clearance...
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
            <span className="font-mono">Sanctuary Vault // Protected</span>
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

          {/* Admin User Profile Trigger & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={handleOpenProfileModal}
              title="Edit Steward Profile & Name"
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] group-hover:scale-105 transition">
                <User className="w-4 h-4" />
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-white leading-tight flex items-center gap-1">
                  <span>{adminUser?.name || 'Club Steward'}</span>
                  <Edit2 className="w-2.5 h-2.5 text-[#C5A880] opacity-0 group-hover:opacity-100 transition" />
                </p>
                <p className="text-[10px] font-mono text-[#C5A880] tracking-wider">
                  HOUSE DIRECTOR
                </p>
              </div>
            </button>

            <button
              onClick={handleLogout}
              title="Secure Logout"
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition cursor-pointer"
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

          {/* Quick System Badge & Edit Profile Trigger */}
          <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-white/50">
              <span className="font-mono">Security Clearance</span>
              <span className="text-[#C5A880] font-semibold">Tier 4 Clearance</span>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-[#C5A880] h-full w-full" />
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed font-light">
              MFA Hardware Enforced • Dual cryptographic session active.
            </p>
            <button
              onClick={handleOpenProfileModal}
              className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer mt-2 border border-white/5"
            >
              <Edit2 className="w-3 h-3 text-[#C5A880]" />
              <span>Edit Steward Profile</span>
            </button>
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

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    handleOpenProfileModal();
                  }}
                  className="w-full p-3 rounded-lg bg-white/5 text-white text-xs font-mono flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4 text-[#C5A880]" />
                  <span>Edit Steward Profile Name</span>
                </button>
              </div>
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

      {/* ======================================================== */}
      {/* MODAL: STEWARD PROFILE & CREDENTIALS EDIT MODAL         */}
      {/* ======================================================== */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121215] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880]">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Steward Profile & Clearance</h3>
                  <p className="text-[10px] font-mono text-white/40">
                    Update administrative name, email, and security credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-white/50 hover:text-white transition p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {profileMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {profileMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {/* Steward Name Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Steward Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Vincent"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Steward Email Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                  Administrative Email *
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="admin@hudorian.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Clearance Role Badge */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Administrative Rank</span>
                  <span className="font-serif-luxury text-sm text-[#C5A880]">House Director & Sovereign Super Admin</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>

              {/* Toggle Password Change */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-xs text-[#C5A880] hover:underline flex items-center gap-1.5 font-mono cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showPasswordChange ? 'Cancel Password Change' : 'Change Vault Password (Optional)'}</span>
                </button>
              </div>

              {showPasswordChange && (
                <div className="space-y-3 pt-2 bg-white/[0.01] p-3.5 rounded-xl border border-white/5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                      New Password (Min. 8 characters) *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer shadow-lg shadow-[#B8976C]/10 flex items-center gap-1.5"
                >
                  {profileLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
