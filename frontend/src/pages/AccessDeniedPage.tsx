
import React from 'react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { ShieldAlert, ArrowRight, Lock, Key, ShieldCheck, Home, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function AccessDeniedPage() {
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

        <div className="relative z-10 max-w-3xl w-full mx-auto text-center space-y-8">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-600/20 text-[#96754B] text-[11px] uppercase tracking-[0.25em] font-medium shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-[#96754B]" />
            <span>403 • Access denied</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#141414] leading-[1.08]">
              Sign in required <br />
              <span className="italic font-serif text-[#96754B]">Access Denied</span>
            </h1>
            <p className="text-base sm:text-lg text-black/70 font-light max-w-xl mx-auto leading-relaxed">
              This page is restricted to signed-in members and administrators.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left pt-4">
            {/* 1. Member Sign In */}
            <div className="p-6 bg-white border border-[#E8E2D8] hover:border-[#96754B]/50 transition duration-300 rounded-xs shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[#141414] text-[#FAF8F5] flex items-center justify-center">
                  <Key className="w-4 h-4 text-[#B8976C]" />
                </div>
                <h2 className="font-serif-luxury text-xl text-[#141414] font-medium">
                  Member Portal
                </h2>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Sign in with your registered email and password to access your membership card, bookings, and account.
                </p>
              </div>
              <Link
                href="/signin"
                className="inline-flex items-center justify-between w-full pt-4 border-t border-[#E8E2D8] text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
              >
                <span>Authenticate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Membership Candidacy */}
            <div className="p-6 bg-white border border-[#E8E2D8] hover:border-[#96754B]/50 transition duration-300 rounded-xs shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-[#96754B]/10 text-[#96754B] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="font-serif-luxury text-xl text-[#141414] font-medium">
                  Apply for Candidacy
                </h2>
                <p className="text-xs text-black/60 font-light leading-relaxed">
                  Not yet a member? Apply for membership and our admissions team will review your application.
                </p>
              </div>
              <Link
                href="/membership/apply"
                className="inline-flex items-center justify-between w-full pt-4 border-t border-[#E8E2D8] text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
              >
                <span>Apply for membership</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Admin Console */}
            <div className="p-6 bg-[#141414] text-[#FAF8F5] border border-[#222] transition duration-300 rounded-xs shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#B8976C]" />
                </div>
                <h2 className="font-serif-luxury text-xl text-white font-medium">
                  Admin
                </h2>
                <p className="text-xs text-white/60 font-light leading-relaxed">
                  Management console for house managers and club staff.
                </p>
              </div>
              <Link
                href="/securegate/login"
                className="inline-flex items-center justify-between w-full pt-4 border-t border-white/10 text-xs uppercase tracking-[0.15em] font-semibold text-[#B8976C] hover:text-white transition"
              >
                <span>Console Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Return Home CTA */}
          <div className="pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-black/60 hover:text-[#141414] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Grounds</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

