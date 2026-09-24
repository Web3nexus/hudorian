'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, ArrowRight, Home, Key, MapPin, BookOpen, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#141414]">
      <Navbar />

      <main className="grow pt-36 pb-24 px-6 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Subtle Luxury Watermark Crest in Background */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.035]">
          <div className="relative w-[500px] h-[500px] sm:w-[650px] sm:h-[650px]">
            <Image
              src="/images/hudorian-seal.png"
              alt="HUDORIAN Crest Watermark"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="relative z-10 max-w-3xl w-full mx-auto text-center space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#96754B]/10 border border-[#96754B]/20 text-[#96754B] text-[11px] uppercase tracking-[0.25em] font-medium shadow-xs">
            <Compass className="w-3.5 h-3.5 text-[#96754B] animate-spin-slow" />
            <span>404 • Registry Exception</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#141414] leading-[1.08]">
              The Sanctuary Path <br />
              <span className="italic font-serif text-[#96754B]">Remains Uncharted</span>
            </h1>
            <p className="text-base sm:text-lg text-black/70 font-light max-w-xl mx-auto leading-relaxed">
              The private chamber, estate archive, or journal publication you are seeking does not exist or has been relocated within the sanctuary registry.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md group"
            >
              <Home className="w-4 h-4 text-[#FAF8F5]/80 group-hover:text-white" />
              <span>Return to Sanctuary</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-[#141414]/20 hover:border-[#141414] text-[#141414] bg-white/60 hover:bg-white text-xs uppercase tracking-[0.2em] font-semibold transition duration-300 shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-[#96754B]" />
              <span>Member Sign In</span>
            </Link>
          </div>

          {/* Directory Checkpoints */}
          <div className="pt-10 border-t border-[#E8E2D8] mt-12">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#96754B] font-semibold mb-6">
              Verified Destinations & Concierge Portals
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <Link
                href="/houses"
                className="group p-5 bg-white/70 hover:bg-white border border-[#E8E2D8] hover:border-[#96754B]/50 transition duration-300 rounded-xs shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-[#96754B]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-mono text-black/40 group-hover:text-[#96754B]">01</span>
                </div>
                <h3 className="font-serif-luxury text-lg text-[#141414] font-medium group-hover:text-[#96754B] transition-colors">
                  Private Houses
                </h3>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Private members clubs and social grounds worldwide.
                </p>
              </Link>

              <Link
                href="/stays"
                className="group p-5 bg-white/70 hover:bg-white border border-[#E8E2D8] hover:border-[#96754B]/50 transition duration-300 rounded-xs shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-[#96754B]">
                  <Home className="w-4 h-4" />
                  <span className="text-[10px] font-mono text-black/40 group-hover:text-[#96754B]">02</span>
                </div>
                <h3 className="font-serif-luxury text-lg text-[#141414] font-medium group-hover:text-[#96754B] transition-colors">
                  Stays & Suites
                </h3>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Architectural villas, boutique residences, and retreats.
                </p>
              </Link>

              <Link
                href="/journal"
                className="group p-5 bg-white/70 hover:bg-white border border-[#E8E2D8] hover:border-[#96754B]/50 transition duration-300 rounded-xs shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-[#96754B]">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] font-mono text-black/40 group-hover:text-[#96754B]">03</span>
                </div>
                <h3 className="font-serif-luxury text-lg text-[#141414] font-medium group-hover:text-[#96754B] transition-colors">
                  The Journal
                </h3>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Curated essays on art, architecture, and gastronomy.
                </p>
              </Link>

              <Link
                href="/membership/apply"
                className="group p-5 bg-white/70 hover:bg-white border border-[#E8E2D8] hover:border-[#96754B]/50 transition duration-300 rounded-xs shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between text-[#96754B]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-mono text-black/40 group-hover:text-[#96754B]">04</span>
                </div>
                <h3 className="font-serif-luxury text-lg text-[#141414] font-medium group-hover:text-[#96754B] transition-colors">
                  Membership
                </h3>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Submit candidacy dossier for global house admission.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
