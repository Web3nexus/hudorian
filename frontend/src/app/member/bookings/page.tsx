'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Building2, Ticket } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';
import { Reservation, EventBooking } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

export default function MemberBookingsPage() {
  const { formatPrice } = useCurrency();
  const [stays, setStays] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMemberBookings()
      .then((res) => {
        if (res.stays) setStays(res.stays);
        if (res.events) setEvents(res.events);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-6xl mx-auto w-full">
        <Link
          href="/member"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-black/60 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Member Dashboard
        </Link>

        <div className="border-b border-[#E8E2D8] pb-6 mb-12">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
            ITINERARIES & RESERVATIONS
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#141414]">
            My Stays & Event Passes
          </h1>
        </div>

        {/* Section 1: Bedroom Stays */}
        <section className="space-y-6 mb-16">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#96754B]" />
            <h2 className="font-serif-luxury text-2xl text-[#141414]">House Stays & Suites</h2>
          </div>

          {loading ? (
            <p className="text-xs text-black/50">Loading stays...</p>
          ) : stays.length === 0 ? (
            <div className="p-8 bg-white border border-[#E8E2D8] rounded-xs text-center space-y-3">
              <p className="text-sm text-black/60">No stay reservations on record.</p>
              <Link
                href="/stays"
                className="inline-block px-6 py-2.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-wider font-semibold"
              >
                Explore Stays
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stays.map((stay) => (
                <div
                  key={stay.id}
                  className="p-6 bg-white border border-[#E8E2D8] rounded-xs shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-[#96754B] font-semibold">
                      {stay.house?.name || 'HUDORIAN House'}
                    </span>
                    <h3 className="font-serif-luxury text-2xl text-[#141414]">
                      {stay.room?.name || 'Suite'}
                    </h3>
                    <p className="text-xs text-black/60">
                      {stay.check_in} to {stay.check_out} ({stay.total_nights} nights • {stay.guests_count} guests)
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-semibold rounded-full">
                      {stay.status}
                    </span>
                    <p className="text-xs font-mono text-black/60 mt-2">Ref: {stay.reservation_number}</p>
                    <p className="text-xs font-medium text-black mt-1">Total: {formatPrice(stay.total_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Events */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#96754B]" />
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Member Event Bookings</h2>
          </div>

          {events.length === 0 ? (
            <div className="p-8 bg-white border border-[#E8E2D8] rounded-xs text-center space-y-3">
              <p className="text-sm text-black/60">No event passes reserved.</p>
              <Link
                href="/experiences"
                className="inline-block px-6 py-2.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-wider font-semibold"
              >
                Browse Experiences
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-6 bg-white border border-[#E8E2D8] rounded-xs shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-[#96754B] font-semibold">
                      {evt.event?.house?.name}
                    </span>
                    <h3 className="font-serif-luxury text-2xl text-[#141414]">
                      {evt.event?.title || 'Cultural Salon'}
                    </h3>
                    <p className="text-xs text-black/60">
                      Seats reserved: {evt.tickets_count} • Status: {evt.status}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-mono text-black/60">Pass Ref: {evt.booking_reference}</p>
                    <p className="text-xs font-medium text-black mt-1">
                      {evt.total_price > 0 ? formatPrice(evt.total_price) : 'Complimentary'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

