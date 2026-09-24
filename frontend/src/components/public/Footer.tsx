'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Globe, ChevronDown, Check, Shield } from 'lucide-react';
import { useCms } from '@/lib/cms';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';

export default function Footer() {
  const { brand, footerNav } = useCms();
  const { currency, setCurrency, currencyConfig, availableCurrencies } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close currency dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter out any accidental administrative / SecureGate links from CMS payload
  const rawSections = footerNav.sections && footerNav.sections.length > 0 ? footerNav.sections : null;
  const sanitized = rawSections
    ? rawSections
        .filter((s) => !s.title.toLowerCase().includes('securegate'))
        .map((s) => ({
          ...s,
          links: s.links.filter(
            (l) =>
              !l.href.includes('securegate') &&
              !l.href.includes('admin') &&
              !l.label.toLowerCase().includes('securegate') &&
              !l.label.toLowerCase().includes('cms studio') &&
              !l.label.toLowerCase().includes('executive gate')
          ),
        }))
        .filter((s) => s.links.length > 0)
    : [];

  // Guarantee The Uzih Dynasty section is always present in footer
  let finalSections = sanitized;
  if (!finalSections.some((s) => s.title.toLowerCase().includes('uzih') || s.title.toLowerCase().includes('royal'))) {
    finalSections = [
      {
        title: 'The Uzih Dynasty',
        links: [
          { label: 'The Royal Family', href: '/royal-family' },
          { label: 'Royal Houses & Heirs', href: '/royal-houses' },
          { label: 'Reda House', href: '/royal-houses#reda-house' },
          { label: 'The Family of Victors', href: '/royal-houses#family-of-victors' },
        ],
      },
      ...finalSections,
    ];
  }

  return (
    <footer className="bg-[#121212] text-[#FAF8F5] pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Top Header: Philosophy & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center">
              {brand.logo_image_url ? (
                <img
                  src={brand.logo_image_url}
                  alt={brand.logo_text || 'HUDORIAN'}
                  className="h-16 md:h-20 w-auto object-contain"
                />
              ) : (
                <span className="font-serif-luxury text-3xl md:text-4xl tracking-[0.25em] uppercase font-light">
                  {brand.logo_text || 'HUDORIAN'}
                </span>
              )}
            </div>
            <p className="font-serif-luxury text-xl md:text-2xl text-[#FAF8F5]/80 italic font-light pt-2 max-w-md">
              &ldquo;{footerNav.tagline || 'Places for a richer life.'}&rdquo;
            </p>
            <p className="text-sm text-[#FAF8F5]/60 max-w-sm font-light leading-relaxed pt-2">
              {brand.tagline || 'A private constellation of Houses, Estates, and Sanctuaries crafted for contemplation, fellowship, and extraordinary stays across the world.'}
            </p>
            <div className="pt-2 text-xs space-y-1">
              <p className="text-[#B8976C] font-mono tracking-wider">
                Direct Concierge: {brand.concierge_phone || '+234 (0) 1 888 4836'} • {brand.concierge_email || 'concierge@hudorian.com'}
              </p>
              <p className="text-white/40 text-[11px] font-light">
                Headquarters: {brand.office_address || brand.address || 'Victoria Island, Lagos, Nigeria'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-end">
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#FAF8F5]/70 mb-3">
              The {brand.logo_text || 'HUDORIAN'} Dispatch
            </span>
            <p className="text-sm text-[#FAF8F5]/60 font-light mb-4">
              Receive private dispatches on new House openings, architectural essays, and cultural programming.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md">
              <input
                type="email"
                placeholder="Enter your email address"
                className="bg-white/5 border border-white/20 text-[#FAF8F5] px-4 py-3 text-sm focus:outline-hidden focus:border-[#B8976C] grow rounded-l-xs placeholder:text-white/40"
              />
              <button
                type="submit"
                className="bg-[#FAF8F5] text-[#121212] px-6 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] hover:text-white transition duration-300 rounded-r-xs"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-sm">
          {finalSections && finalSections.length > 0 ? (
            finalSections.map((section, idx) => (
              <div key={section.title || idx}>
                <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B8976C] mb-5">
                  {section.title}
                </h4>
                <ul className="space-y-3 font-light text-[#FAF8F5]/70">
                  {section.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="hover:text-white transition">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              {/* Column 1: Destinations */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B8976C] mb-5">
                  Destinations
                </h4>
                <ul className="space-y-3 font-light text-[#FAF8F5]/70">
                  <li><Link href="/houses" className="hover:text-white transition">Global Houses</Link></li>
                  <li><Link href="/estates" className="hover:text-white transition">Private Estates</Link></li>
                  <li><Link href="/stays" className="hover:text-white transition">Sanctuary Suites</Link></li>
                  <li><Link href="/experiences" className="hover:text-white transition">Cultural Gatherings</Link></li>
                </ul>
              </div>

              {/* Column 2: Membership */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B8976C] mb-5">
                  Membership
                </h4>
                <ul className="space-y-3 font-light text-[#FAF8F5]/70">
                  <li><Link href="/membership" className="hover:text-white transition">Tiers & Privileges</Link></li>
                  <li><Link href="/membership/apply" className="hover:text-white transition">Apply for Membership</Link></li>
                  <li><Link href="/member" className="hover:text-white transition">Member Portal</Link></li>
                  <li><Link href="/membership" className="hover:text-white transition">Private Concierge</Link></li>
                </ul>
              </div>

              {/* Column 3: The Gazette */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B8976C] mb-5">
                  The Gazette
                </h4>
                <ul className="space-y-3 font-light text-[#FAF8F5]/70">
                  <li><Link href="/journal" className="hover:text-white transition">Editorial Journal</Link></li>
                  <li><Link href="/shop" className="hover:text-white transition">Boutique Collection</Link></li>
                  <li><Link href="/experiences" className="hover:text-white transition">Salon Calendar</Link></li>
                  <li><Link href="/houses" className="hover:text-white transition">Architectural Terroirs</Link></li>
                </ul>
              </div>

              {/* Column 4: Governance & Legal */}
              <div>
                <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B8976C] mb-5">
                  Legal & Privacy
                </h4>
                <ul className="space-y-3 font-light text-[#FAF8F5]/70">
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="/privacy/data" className="hover:text-white transition">Data Privacy & Security</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">House Code & Terms</Link></li>
                  <li><Link href="/privacy#house-discretion" className="hover:text-white transition">Patron Confidentiality</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Bottom Line: Copyright, Currency Selector, and Socials */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#FAF8F5]/60 font-light gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <p>{footerNav.copyright || `© ${new Date().getFullYear()} HUDORIAN Private Members Club. All rights reserved.`}</p>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="text-white/40">Nigeria Data Protection Act (NDPA 2023) Compliant</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Top-Tier Luxury Currency & Region Selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#B8976C]/60 text-white transition text-xs font-medium"
                aria-haspopup="listbox"
                aria-expanded={currencyOpen}
              >
                <span className="text-sm">{currencyConfig.flag}</span>
                <span>{currencyConfig.code} ({currencyConfig.symbol})</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
              </button>

              {currencyOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-64 rounded-md bg-[#1A1A1A] border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#B8976C]">
                      Select Currency & Region
                    </span>
                    <Globe className="w-3.5 h-3.5 text-[#B8976C]" />
                  </div>
                  <div className="space-y-0.5">
                    {availableCurrencies.map((c) => {
                      const isSelected = c.code === currency;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCurrency(c.code);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs transition ${
                            isSelected
                              ? 'bg-white/15 text-white font-medium'
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{c.flag}</span>
                            <div className="text-left">
                              <span className="block font-medium text-white">{c.name}</span>
                              <span className="text-[10px] text-white/40">{c.region}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#B8976C]">{c.symbol}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#B8976C]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 px-2 text-[10px] text-white/40 text-center font-light">
                    Prices update automatically across all sanctuaries
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex space-x-5 text-white/60">
              <span className="hover:text-white cursor-pointer transition">Instagram</span>
              <span className="hover:text-white cursor-pointer transition">LinkedIn</span>
              <span className="hover:text-white cursor-pointer transition">Spotify Editorial</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
