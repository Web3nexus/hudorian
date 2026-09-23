'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Ticket, ArrowRight, Check } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Event } from '@/types';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';
import { useCurrency } from '@/context/CurrencyContext';

export default function ExperiencesPage() {
  const { formatPrice } = useCurrency();
  const [events, setEvents] = useState<Event[]>([]);
  const [bookingEvent, setBookingEvent] = useState<Event | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { getPageContent } = useCms();

  const heroContent = getPageContent('page_experiences', {
    title: 'Experiences & Events',
    subtitle: 'Intimate chef dinners over open wood fire, acoustic sound baths, contemporary gallery vernissages, and thought salons created exclusively for HUDORIAN members.',
    media_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=85',
  });

  useEffect(() => {
    api.getEvents()
      .then((res) => {
        if (res.data) setEvents(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingEvent) return;

    const token = localStorage.getItem('hudorian_token');
    if (!token) {
      window.location.href = `/signin?redirect=/experiences`;
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const res = await api.bookEvent(bookingEvent.id, ticketCount);
      setBookingSuccess(`Tickets reserved! Reference: ${res.booking.booking_reference}`);
      setTimeout(() => {
        setBookingEvent(null);
        setBookingSuccess(null);
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reservation failed.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
            CULTURAL PROGRAMME
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight mb-6">
            {heroContent.title || 'Experiences & Events'}
          </h1>
          <p className="text-base text-[#141414]/70 font-light leading-relaxed">
            {heroContent.subtitle || 'Intimate chef dinners over open wood fire, acoustic sound baths, contemporary gallery vernissages, and thought salons created exclusively for HUDORIAN members.'}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-[0.2em] text-black/50">
            Gathering international calendar...
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif-luxury text-2xl text-black/60">
              No public events scheduled currently.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-200">
                    <img
                      src={event.hero_image || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] uppercase tracking-wider">
                      {event.event_type}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-black text-[11px] font-semibold">
                      {event.price > 0 ? formatPrice(event.price) : 'Complimentary'}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-[#96754B] uppercase tracking-wider font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{event.house?.name}</span>
                      </div>
                      <h3 className="font-serif-luxury text-2xl text-[#141414] leading-snug">
                        {event.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-black/60 pt-2 border-t border-[#E8E2D8]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#96754B]" />
                        {new Date(event.starts_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#96754B]" />
                        {event.available_seats !== undefined ? `${event.available_seats} spots left` : `${event.capacity} capacity`}
                      </span>
                    </div>

                    <p className="text-xs text-[#141414]/70 font-light line-clamp-3 leading-relaxed">
                      {event.short_description || event.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => setBookingEvent(event)}
                    className="w-full py-3 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition duration-300"
                  >
                    Reserve Place
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Ticket Booking Modal */}
        {bookingEvent && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF8F5] max-w-md w-full p-8 rounded-xs shadow-2xl border border-[#E8E2D8] space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between border-b border-[#E8E2D8] pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#96754B] font-semibold block mb-1">
                    MEMBER INVITATION
                  </span>
                  <h3 className="font-serif-luxury text-2xl text-[#141414]">
                    {bookingEvent.title}
                  </h3>
                  <p className="text-xs text-black/60 mt-1">
                    {bookingEvent.house?.name} • {formatPrice(bookingEvent.price)} / ticket
                  </p>
                </div>
                <button
                  onClick={() => setBookingEvent(null)}
                  className="text-black/50 hover:text-black p-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {bookingSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xs text-xs">
                  {bookingSuccess}
                </div>
              )}

              {bookingError && (
                <div className="p-4 bg-rose-50 text-rose-900 border border-rose-200 rounded-xs text-xs">
                  {bookingError}
                </div>
              )}

              <form onSubmit={handleBookTicket} className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                    Number of Seats
                  </label>
                  <select
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-white border border-[#D8D0C3] rounded-xs text-xs"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Seat' : 'Seats'} (Total: {formatPrice(bookingEvent.price * n)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-white border border-[#E8E2D8] rounded-xs text-[11px] text-black/70 space-y-1">
                  <p className="font-semibold text-black">Member Pass Verification:</p>
                  <p>Your active digital card status will be validated automatically at check-in.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingEvent(null)}
                    className="w-1/2 py-3 rounded-full border border-black/20 text-xs uppercase tracking-wider font-medium hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-1/2 py-3 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold hover:bg-[#B8976C] transition disabled:opacity-50"
                  >
                    {bookingLoading ? 'Confirming...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

