'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Room } from '@/types';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';
import { useCurrency } from '@/context/CurrencyContext';

export default function StaysPage() {
  const { formatPrice } = useCurrency();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [loading, setLoading] = useState(true);
  const { getPageContent } = useCms();

  const heroContent = getPageContent('page_stays', {
    title: 'Sanctuary Stays',
    subtitle: 'Reserve private quarters across the HUDORIAN houses. Members receive preferred rates, complimentary upgrades, and bespoke concierge itineraries.',
    media_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=85',
  });

  const fetchRooms = () => {
    setLoading(true);
    api.getStays({
      guests: guests ? parseInt(guests) : undefined,
      check_in: checkIn || undefined,
      check_out: checkOut || undefined,
    })
      .then((res) => {
        if (res.data) setRooms(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Header (Managed by CMS Studio) */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
            RESERVATIONS & SUITES
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight mb-6">
            {heroContent.title || 'Sanctuary Stays'}
          </h1>
          <p className="text-base text-[#141414]/70 font-light leading-relaxed">
            {heroContent.subtitle || 'Reserve private quarters across the HUDORIAN houses. Members receive preferred rates, complimentary upgrades, and bespoke concierge itineraries.'}
          </p>
        </div>

        {/* Live Stay Search Bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-4 md:p-6 rounded-xs border border-[#E8E2D8] shadow-xs mb-16 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#96754B]" /> Check-In
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full p-2.5 bg-[#F4EFEA] rounded-xs text-xs focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#96754B]" /> Check-Out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full p-2.5 bg-[#F4EFEA] rounded-xs text-xs focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#96754B]" /> Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full p-2.5 bg-[#F4EFEA] rounded-xs text-xs focus:outline-hidden"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="6">5+ Guests</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full p-3 rounded-xs bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition duration-300"
            >
              Check Availability
            </button>
          </div>
        </form>

        {/* Room Catalog */}
        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-[0.2em] text-black/50">
            Scanning house room availability...
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif-luxury text-2xl text-[#141414]/70 mb-2">
              No rooms currently available for the requested dates or party size.
            </p>
            <p className="text-xs text-black/50">
              Try adjusting your dates or exploring other houses.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 flex flex-col justify-between"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-stone-200">
                  <img
                    src={room.hero_image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/65 backdrop-blur-md rounded-full text-white text-xs">
                    {formatPrice(room.base_price_per_night)} / night
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium block mb-1">
                      {room.house?.name} • {room.capacity} Guests
                    </span>
                    <h3 className="font-serif-luxury text-2xl text-[#141414] leading-snug">
                      {room.name}
                    </h3>
                    <p className="text-xs text-[#141414]/70 font-light mt-2 line-clamp-2">
                      {room.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8E2D8] flex items-center justify-between">
                    <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Available to Reserve
                    </span>
                    <Link
                      href={`/stays/${room.slug}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`}
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
                    >
                      View & Book <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

