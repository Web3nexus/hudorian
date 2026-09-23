'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollText, ShieldAlert, Award, Camera, HeartHandshake } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28">
        {/* Header */}
        <section className="max-w-4xl mx-auto px-6 md:px-10 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#96754B]/10 text-[#96754B] text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
            <ScrollText className="w-3.5 h-3.5" />
            House Rules & Code of Fellowship
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl text-[#141414] font-light tracking-tight leading-[1.1] mb-6">
            Membership Terms & By-Laws
          </h1>

          <p className="text-base sm:text-lg text-black/70 font-light leading-relaxed">
            HUDORIAN is conceived as an oasis of creative freedom, privacy, and civil discourse. To preserve the sanctuary character of our Houses and Estates, every candidate and patron agrees to abide by this House Code.
          </p>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-6 md:px-10 space-y-12 text-sm text-black/80 font-light leading-relaxed">
          <div className="p-6 bg-white border border-[#E8E2D8] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#96754B]">
              <Camera className="w-4 h-4" />
              1. The No-Photography Principle
            </div>
            <p className="text-xs text-black/70 leading-relaxed">
              Photography and commercial videography in shared living salons, dining terraces, pool enclosures, and library chambers are prohibited. Members may capture discreet mementos strictly within their private suites.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E2D8] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#96754B]">
              <HeartHandshake className="w-4 h-4" />
              2. Fellowship & Guest Conduct
            </div>
            <p className="text-xs text-black/70 leading-relaxed">
              Members are held responsible for the comportment of their accompanied guests at all times. Discrimination, harassment, uninvited solicitations, or disruption of the sanctuary peace will result in immediate committee review and revocation of privileges.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E2D8] rounded-xs space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#96754B]">
              <Award className="w-4 h-4" />
              3. Patronage Dues & Reservation Settlements
            </div>
            <p className="text-xs text-black/70 leading-relaxed">
              Annual membership contributions are billed upon official committee approval. Suite bookings, culinary tabs, and bespoke wellness treatments must be settled prior to check-out in preferred currency (NGN, USD, EUR, GBP).
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

