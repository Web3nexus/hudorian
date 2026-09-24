'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, RefreshCw, Home, Mail, ArrowRight } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function ServerErrorPage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#141414]">
      <Navbar />

      <main className="grow pt-36 pb-24 px-6 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Crest Watermark */}
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

        <div className="relative z-10 max-w-2xl w-full mx-auto text-center space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-800 text-[11px] uppercase tracking-[0.25em] font-medium shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            <span>500 • Vault Interruption</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#141414] leading-[1.08]">
              Sanctuary Vault <br />
              <span className="italic font-serif text-[#96754B]">Interruption</span>
            </h1>
            <p className="text-base sm:text-lg text-black/70 font-light max-w-lg mx-auto leading-relaxed">
              Our private servers encountered an unexpected condition while fulfilling this request. The Sanctuary technical stewards and concierge have been notified.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={handleReload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md group cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-[#FAF8F5]/80" />
              <span>Retry Chamber</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-[#141414]/20 hover:border-[#141414] text-[#141414] bg-white/60 hover:bg-white text-xs uppercase tracking-[0.2em] font-semibold transition duration-300 shadow-xs"
            >
              <Home className="w-3.5 h-3.5 text-[#96754B]" />
              <span>Sanctuary Home</span>
            </Link>
          </div>

          {/* Concierge Assistance Card */}
          <div className="pt-8 border-t border-[#E8E2D8] mt-10">
            <div className="p-6 bg-white/80 border border-[#E8E2D8] rounded-xs shadow-2xs max-w-md mx-auto text-center space-y-3">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#96754B] block">
                Direct Dispatch & Assistance
              </span>
              <p className="text-xs text-black/60 font-light leading-relaxed">
                If you were in the middle of a private booking or dues settlement, our concierge team is available to assist immediately.
              </p>
              <a
                href="mailto:concierge@hudorian.com"
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#141414] hover:text-[#96754B] transition pt-1"
              >
                <Mail className="w-3.5 h-3.5 text-[#96754B]" />
                <span>concierge@hudorian.com</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

