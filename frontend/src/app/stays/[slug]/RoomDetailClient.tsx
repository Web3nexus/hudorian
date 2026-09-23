'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { Room } from '@/types';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

export default function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { formatPrice } = useCurrency();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || '');
  const [guestsCount, setGuestsCount] = useState(parseInt(searchParams.get('guests') || '2'));
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.getRoomBySlug(slug)
      .then((res) => {
        if (res.data) setRoom(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const nights = calculateNights();
  const baseTotal = room ? room.base_price_per_night * (nights || 1) : 0;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;

    const token = localStorage.getItem('hudorian_token');
    if (!token) {
      router.push(`/signin?redirect=/stays/${slug}`);
      return;
    }

    if (!checkIn || !checkOut || nights < 1) {
      setBookingError('Please select valid check-in and check-out dates.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const res = await api.bookStay({
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestsCount,
        special_requests: specialRequests,
      });

      setBookingSuccess(
        `Reservation confirmed! Your booking reference is ${res.reservation.reservation_number}. A confirmation has been added to your Member Portal.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed. This room may be reserved for the selected dates.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#96754B] animate-pulse">
          Loading Suite Details...
        </span>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif-luxury text-3xl mb-4">Suite Not Found</h1>
        <Link href="/stays" className="text-xs uppercase tracking-[0.2em] underline">
          Return to Stays Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="mb-8 text-xs uppercase tracking-[0.2em] text-[#141414]/50 flex items-center gap-2">
          <Link href="/houses" className="hover:text-black">Houses</Link>
          <span>/</span>
          <Link href={`/houses/${room.house?.slug}`} className="hover:text-black">{room.house?.name}</Link>
          <span>/</span>
          <span className="text-black">{room.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Media & Suite Overview */}
          <div className="lg:col-span-7 space-y-10">
            <div className="relative aspect-16/10 rounded-xs overflow-hidden bg-stone-200 shadow-md">
              <img
                src={room.hero_image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80'}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[#96754B] font-semibold">
                {room.house?.name} • {room.house?.location?.country}
              </span>
              <h1 className="font-serif-luxury text-4xl sm:text-5xl text-[#141414] leading-tight">
                {room.name}
              </h1>

              <div className="flex items-center gap-6 text-xs uppercase tracking-wider text-black/60 pt-2 border-y border-[#E8E2D8] py-3">
                <span>Capacity: {room.capacity} Guests</span>
                {room.size_sqm && <span>Area: {room.size_sqm} m²</span>}
                <span className="capitalize">Type: {room.room_type}</span>
              </div>

              <div className="text-sm sm:text-base text-[#141414]/75 font-light leading-relaxed pt-2">
                {room.description}
              </div>
            </div>

            {/* Room Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="pt-6 border-t border-[#E8E2D8]">
                <h3 className="font-serif-luxury text-2xl text-[#141414] mb-4">
                  Suite Amenities & Inclusions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {room.amenities.map((am) => (
                    <div key={am.id} className="flex items-center gap-2 text-xs text-black/80">
                      <Check className="w-3.5 h-3.5 text-[#96754B]" />
                      <span>{am.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Reservation Card & Booking Engine */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white p-8 rounded-xs border border-[#E8E2D8] shadow-md space-y-6">
              <div className="flex items-baseline justify-between border-b border-[#E8E2D8] pb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-black/50 block">Nightly Member Privilege</span>
                  <span className="font-serif-luxury text-3xl md:text-4xl text-[#141414]">
                    {formatPrice(room.base_price_per_night)}
                  </span>
                  <span className="text-xs text-black/60 font-light"> / night</span>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] uppercase tracking-wider font-medium rounded-full">
                  Instant Verification
                </span>
              </div>

              {bookingSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> Confirmed
                  </div>
                  <p>{bookingSuccess}</p>
                  <Link href="/member/bookings" className="underline font-semibold block pt-1">
                    Go to My Member Bookings →
                  </Link>
                </div>
              )}

              {bookingError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xs text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <p>{bookingError}</p>
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-black/60 font-medium block mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-black/60 font-medium block mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-black/60 font-medium block mb-1">
                    Party Size
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                  >
                    {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-black/60 font-medium block mb-1">
                    Special Inquiries & Concierge Requests
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Dietary requests, late arrival, transfers..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                  />
                </div>

                {nights > 0 && (
                  <div className="pt-4 border-t border-[#E8E2D8] space-y-2 text-xs">
                    <div className="flex justify-between text-black/70">
                      <span>{formatPrice(room.base_price_per_night)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                      <span>{formatPrice(baseTotal)}</span>
                    </div>
                    <div className="flex justify-between text-black/70">
                      <span>House Concierge & Sanctuary Privileges</span>
                      <span className="text-emerald-700">Included</span>
                    </div>
                    <div className="flex justify-between font-serif-luxury text-xl pt-2 border-t border-[#E8E2D8] text-black">
                      <span>Total</span>
                      <span>{formatPrice(baseTotal)}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition duration-300 shadow-md disabled:opacity-50 mt-4"
                >
                  {bookingLoading ? 'Securing Suite...' : 'Reserve Suite with Member Vault'}
                </button>
              </form>

              <p className="text-[11px] text-center text-black/50 font-light">
                Secure transaction guaranteed with automated double-booking lock protection.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

