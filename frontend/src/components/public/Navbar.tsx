'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User as UserIcon, Crown, Compass, Shield, ArrowRight } from 'lucide-react';
import { useCms } from '@/lib/cms';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [member, setMember] = useState<{ name: string } | null>(null);
  const { brand } = useCms();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    // Check user session
    const stored = localStorage.getItem('hudorian_user');
    if (stored) {
      try {
        setMember(JSON.parse(stored));
      } catch {
        // ignore
      }
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-nav py-4 border-b border-[#E8E2D8]/60 shadow-xs'
            : 'bg-transparent py-6 md:py-7'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Left Column: Menu Button & 3 Royal Top Links */}
          <div className="flex-1 flex items-center justify-start gap-3 xl:gap-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open directory menu"
              className="p-2 -ml-2 rounded-full hover:bg-black/5 transition text-[#141414] flex items-center gap-1.5 group cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5 stroke-[1.5] group-hover:scale-110 transition duration-300" />
              <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-black/70 hidden sm:inline">
                Menu
              </span>
            </button>

            <nav className="hidden lg:flex items-center space-x-3.5 xl:space-x-6 text-[11px] xl:text-xs uppercase tracking-[0.12em] xl:tracking-[0.18em] font-medium text-[#141414]/85">
              <Link
                href="/royal-family"
                className="hover:text-[#96754B] transition whitespace-nowrap"
              >
                The Royal Family
              </Link>
              <Link
                href="/royal-houses"
                className="hover:text-[#96754B] transition whitespace-nowrap"
              >
                Royal Houses
              </Link>
              <Link
                href="/royal-houses#allies"
                className="hover:text-[#96754B] transition whitespace-nowrap"
              >
                Royal Allies
              </Link>
            </nav>
          </div>

          {/* Center Column: Dedicated Brand Logo (Never Overlapped) */}
          <div className="shrink-0 px-3 md:px-6 xl:px-8 text-center flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center hover:opacity-85 transition group py-1"
            >
              {brand.logo_image_url ? (
                <img
                  src={brand.logo_image_url}
                  alt={brand.logo_text || 'HUDORIAN'}
                  className="h-10 md:h-12 xl:h-14 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition duration-300"
                />
              ) : (
                <span className="font-serif-luxury text-xl md:text-2xl xl:text-3xl font-medium tracking-[0.3em] uppercase text-[#141414]">
                  {brand.logo_text || 'HUDORIAN'}
                </span>
              )}
            </Link>
          </div>

          {/* Right Column: 3 Property & Membership Links + Actions */}
          <div className="flex-1 flex items-center justify-end gap-3 xl:gap-6">
            <nav className="hidden lg:flex items-center space-x-3.5 xl:space-x-6 text-[11px] xl:text-xs uppercase tracking-[0.12em] xl:tracking-[0.18em] font-medium text-[#141414]/85">
              <Link
                href="/houses"
                className="hover:text-[#96754B] transition whitespace-nowrap"
              >
                Houses
              </Link>
              <Link
                href="/estates"
                className="hover:text-[#96754B] transition whitespace-nowrap"
              >
                Estates
              </Link>
              <Link
                href="/membership"
                className="hover:text-[#96754B] transition whitespace-nowrap"
              >
                Membership
              </Link>
            </nav>

            {member ? (
              <Link
                href="/member"
                className="flex items-center space-x-2 text-xs uppercase tracking-[0.15em] font-medium px-4 py-2 rounded-full border border-black/15 bg-black/5 hover:bg-black hover:text-white transition duration-300 whitespace-nowrap shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Member Portal</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  href="/signin"
                  className="text-xs uppercase tracking-[0.15em] font-medium hover:text-black text-[#141414]/80 transition px-2 py-1 whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/membership/apply"
                  className="hidden sm:inline-block text-xs uppercase tracking-[0.15em] font-medium px-4 py-2 rounded-full bg-[#141414] text-[#FAF8F5] hover:bg-[#2b2b2b] transition duration-300 shadow-xs whitespace-nowrap"
                >
                  Apply
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Fullscreen Directory Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-60 bg-[#101014] text-[#FAF8F5] flex flex-col justify-between p-8 md:p-14 animate-fade-in overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 shrink-0">
            <div className="flex items-center">
              {brand.logo_image_url ? (
                <img
                  src={brand.logo_image_url}
                  alt={brand.logo_text || 'HUDORIAN'}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <span className="font-serif-luxury text-2xl tracking-[0.25em] uppercase">
                  {brand.logo_text || 'HUDORIAN'}
                </span>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 transition cursor-pointer"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          {/* Directory Content Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 py-10 my-auto">
            {/* Column 1: The Uzih Dynasty */}
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold flex items-center gap-2">
                <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>The Uzih Dynasty</span>
              </span>
              <ul className="space-y-4 text-xl sm:text-2xl font-serif-luxury font-light">
                <li>
                  <Link
                    href="/royal-family"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    The Royal Family
                  </Link>
                </li>
                <li>
                  <Link
                    href="/royal-houses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Royal Houses & Allies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/royal-houses#reda-house"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base text-white/70 hover:text-white transition flex items-center gap-2"
                  >
                    <ArrowRight className="w-3 h-3 text-[#C5A880]" />
                    <span>Reda House</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/royal-houses#family-of-victors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base text-white/70 hover:text-white transition flex items-center gap-2"
                  >
                    <ArrowRight className="w-3 h-3 text-[#C5A880]" />
                    <span>The Family of Victors</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Houses & Sanctuaries */}
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Sanctuaries & Stays</span>
              </span>
              <ul className="space-y-4 text-xl sm:text-2xl font-serif-luxury font-light">
                <li>
                  <Link
                    href="/houses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Global Houses
                  </Link>
                </li>
                <li>
                  <Link
                    href="/estates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Private Estates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stays"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Suites & Stays
                  </Link>
                </li>
                <li>
                  <Link
                    href="/experiences"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Curated Gatherings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Membership & Culture */}
            <div className="space-y-5">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Membership & Culture</span>
              </span>
              <ul className="space-y-4 text-xl sm:text-2xl font-serif-luxury font-light">
                <li>
                  <Link
                    href="/membership"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Tiers & Privileges
                  </Link>
                </li>
                <li>
                  <Link
                    href="/membership/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Apply for Candidacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/journal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Editorial Journal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-[#C5A880] transition block"
                  >
                    Boutique Collection
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Info in Drawer */}
          <div className="border-t border-white/10 pt-6 text-xs text-white/40 flex flex-col sm:flex-row justify-between gap-2 shrink-0">
            <p>{brand.logo_text || 'HUDORIAN'} Private Members Club & Dynasty</p>
            <p>London • Ibiza • Marbella • Kyoto • Cape Town</p>
          </div>
        </div>
      )}
    </>
  );
}
