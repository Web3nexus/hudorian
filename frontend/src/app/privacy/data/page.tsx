'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Key, Server, Cpu, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function DataPrivacyArchitecturePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28">
        {/* Header */}
        <section className="max-w-4xl mx-auto px-6 md:px-10 mb-14">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-black/60 hover:text-black mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Privacy Charter
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            Security & Cryptographic Architecture
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl text-[#141414] font-light tracking-tight leading-[1.1] mb-6">
            Data Privacy & Technical Safeguards
          </h1>

          <p className="text-base sm:text-lg text-black/70 font-light leading-relaxed">
            A comprehensive overview of HUDORIAN&apos;s digital infrastructure: end-to-end tokenized passes, vault-grade encryption, and zero-exposure patron privacy engineering.
          </p>
        </section>

        {/* Technical Architecture Blocks */}
        <section className="max-w-4xl mx-auto px-6 md:px-10 space-y-12">
          {/* Card 1: Cryptographic Digital Pass */}
          <div className="bg-white p-8 md:p-10 border border-[#E8E2D8] rounded-xs shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#141414] text-[#C5A880] flex items-center justify-center mb-2">
              <Key className="w-6 h-6" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#96754B] block">
              FEATURE 01
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              HMAC-SHA256 Ephemeral Member Tokens
            </h2>
            <p className="text-sm text-black/75 font-light leading-relaxed">
              Every digital member pass rendered in the HUDORIAN app relies on rotating, short-lived cryptographic tokens signed with server-side secrets. The QR and barcode passes expire every five minutes and automatically self-refresh.
            </p>
            <ul className="text-xs space-y-2 text-black/70 pt-2 font-mono">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Zero replay capability: intercepted or photographed passes cannot be reused.
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Offline biometric authentication support for concierge tablet stations.
              </li>
            </ul>
          </div>

          {/* Card 2: Vault Architecture & Data Residency */}
          <div className="bg-white p-8 md:p-10 border border-[#E8E2D8] rounded-xs shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#141414] text-[#C5A880] flex items-center justify-center mb-2">
              <Server className="w-6 h-6" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#96754B] block">
              FEATURE 02
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Encrypted Relational Vault & Data Residency
            </h2>
            <p className="text-sm text-black/75 font-light leading-relaxed">
              Our central databases are protected with AES-256 encryption at rest and TLS 1.3 in transit. Financial ledger data is stored separately from social and hospitality preference registries, guaranteeing segmented privilege tiers across all management systems.
            </p>
            <div className="p-4 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs space-y-1 font-mono text-black/70">
              <p>• Data Controller Jurisdiction: Lagos, Federal Republic of Nigeria</p>
              <p>• Redundant Mirror: ISO/IEC 27001 Certified Tier-IV Data Centers</p>
              <p>• Regulated by: Nigeria Data Protection Commission (NDPC)</p>
            </div>
          </div>

          {/* Card 3: Concierge Privacy Boundary */}
          <div className="bg-white p-8 md:p-10 border border-[#E8E2D8] rounded-xs shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#141414] text-[#C5A880] flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#96754B] block">
              FEATURE 03
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Zero Knowledge Concierge Boundaries
            </h2>
            <p className="text-sm text-black/75 font-light leading-relaxed">
              House staff and sommeliers only receive necessary contextual information during an active stay (such as allergies, room preparation preferences, and preferred name). Once a member departs, active staff terminals purge local operational caches.
            </p>
          </div>

          {/* Self-Service Data Rights Box */}
          <div className="p-8 bg-[#141414] text-white rounded-xs space-y-4">
            <h3 className="font-serif-luxury text-2xl text-white">Member Data Requests</h3>
            <p className="text-xs text-white/70 font-light leading-relaxed">
              If you wish to export your reservation records or request data rectification or complete deletion under NDPA 2023, contact our compliance office or log in to your Member Portal settings.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/member/profile"
                className="px-6 py-3 rounded-full bg-[#FAF8F5] text-[#141414] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] hover:text-white transition"
              >
                Member Portal Settings
              </Link>
              <a
                href="mailto:privacy@hudorian.com"
                className="px-6 py-3 rounded-full border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/10 transition"
              >
                Email Compliance Desk
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

