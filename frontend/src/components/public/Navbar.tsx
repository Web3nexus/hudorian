'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { useCms } from '@/lib/cms';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [member, setMember] = useState<{ name: string } | null>(null);
  const { brand, headerNav } = useCms();

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

  const activeNavItems = (headerNav || [])
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Split into left and right menus around center logo if desired
  const midPoint = Math.ceil(activeNavItems.length / 2);
  const leftNavItems = activeNavItems.slice(0, midPoint);
  const rightNavItems = activeNavItems.slice(midPoint);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-nav py-4 border-b border-[#E8E2D8]/60 shadow-xs'
            : 'bg-transparent py-7'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Left: Menu Trigger & Left Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open directory menu"
              className="p-2 -ml-2 rounded-full hover:bg-black/5 transition text-[#141414]"
            >
              <Menu className="w-5 h-5 stroke-[1.5]" />
            </button>
            <nav className="hidden lg:flex items-center space-x-7 text-xs uppercase tracking-[0.2em] font-medium text-[#141414]/80">
              {leftNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-black transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Brand Logo / Wordmark */}
          <div className="text-center absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="inline-flex items-center justify-center hover:opacity-85 transition group py-1"
            >
              {brand.logo_image_url ? (
                <img
                  src={brand.logo_image_url}
                  alt={brand.logo_text || 'HUDORIAN'}
                  className="h-11 md:h-14 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition duration-300"
                />
              ) : (
                <span className="font-serif-luxury text-2xl md:text-3xl font-medium tracking-[0.3em] uppercase text-[#141414]">
                  {brand.logo_text || 'HUDORIAN'}
                </span>
              )}
            </Link>
          </div>

          {/* Right: Right Links, Sign In / Member Dashboard */}
          <div className="flex items-center space-x-5 md:space-x-7">
            <nav className="hidden md:flex items-center space-x-7 text-xs uppercase tracking-[0.2em] font-medium text-[#141414]/80">
              {rightNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-black transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {member ? (
              <Link
                href="/member"
                className="flex items-center space-x-2 text-xs uppercase tracking-[0.15em] font-medium px-4 py-2 rounded-full border border-black/15 bg-black/5 hover:bg-black hover:text-white transition duration-300"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Member Portal</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/signin"
                  className="text-xs uppercase tracking-[0.15em] font-medium hover:text-black text-[#141414]/80 transition px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  href="/membership/apply"
                  className="hidden sm:inline-block text-xs uppercase tracking-[0.15em] font-medium px-4 py-2 rounded-full bg-[#141414] text-[#FAF8F5] hover:bg-[#2b2b2b] transition duration-300 shadow-xs"
                >
                  Apply
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile / Expandable Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-60 bg-[#121212] text-[#FAF8F5] flex flex-col justify-between p-8 md:p-14 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
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
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 my-auto">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B8976C] font-semibold block mb-4">
                Directory
              </span>
              <ul className="space-y-4 text-2xl md:text-3xl font-serif-luxury font-light">
                {activeNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-[#B8976C] transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 flex flex-col justify-end border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B8976C] font-semibold block">
                Sanctuary Concierge
              </span>
              <p className="text-sm text-white/70 font-light leading-relaxed">
                {brand.tagline || 'Private Members Club & Global Constellation of Houses.'}
              </p>
              <div className="text-xs space-y-2 text-white/60">
                <p>Private Line: {brand.concierge_phone || '+44 (0) 20 7946 0912'}</p>
                <p>Enquiries: {brand.concierge_email || 'concierge@hudorian.com'}</p>
                {brand.office_address && <p>{brand.office_address}</p>}
              </div>

              <div className="pt-4 flex gap-4">
                <Link
                  href="/membership/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 rounded-full bg-[#B8976C] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-[#c9a77c] transition"
                >
                  Apply for Membership
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-xs text-white/40 flex justify-between">
            <p>{brand.logo_text || 'HUDORIAN'} Private Members Club</p>
            <p>London • Ibiza • Marbella • Kyoto • Cape Town</p>
          </div>
        </div>
      )}
    </>
  );
}
