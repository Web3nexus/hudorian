'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, Check, ArrowRight, X } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { House } from '@/types';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

export default function HouseDetailPage() {
  const { formatPrice } = useCurrency();
  const params = useParams();
  const slug = params?.slug as string;

  const [house, setHouse] = useState<House | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api.getHouseBySlug(slug)
      .then((res) => {
        if (res.data) setHouse(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <span className="text-xs uppercase tracking-[0.3em] text-[#96754B] animate-pulse">
          Loading House Dossier...
        </span>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-serif-luxury text-3xl mb-4">House Not Found</h1>
        <Link href="/houses" className="text-xs uppercase tracking-[0.2em] underline">
          Return to Constellation
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-end overflow-hidden pb-16">
        <div className="absolute inset-0 z-0">
          <img
            src={house.hero_image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2400&q=85'}
            alt={house.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full text-white">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A880] mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{house.location?.name}, {house.location?.country}</span>
            <span>•</span>
            <span className="capitalize">{house.house_type}</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-light tracking-tight mb-4">
            {house.name}
          </h1>

          <p className="text-base sm:text-lg text-white/85 font-light max-w-2xl leading-relaxed mb-8">
            {house.tagline || house.short_description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/stays"
              className="px-8 py-3.5 rounded-full bg-[#FAF8F5] text-[#141414] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C5A880] hover:text-white transition duration-300"
            >
              Book a Suite
            </Link>
            <Link
              href="/membership/apply"
              className="px-8 py-3.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/20 transition duration-300"
            >
              Apply for Access
            </Link>
          </div>
        </div>
      </section>

      {/* House Introduction & Materiality */}
      <section className="py-24 px-6 md:px-10 max-w-5xl mx-auto">
        <div className="text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B]">
            THE SANCTUARY
          </span>
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-light tracking-tight text-[#141414] leading-snug">
            {house.tagline || 'An architectural refuge forged in harmony with nature.'}
          </h2>
          <div className="text-base sm:text-lg text-[#141414]/75 font-light leading-relaxed space-y-4 max-w-3xl mx-auto pt-4 text-left sm:text-center whitespace-pre-line">
            {house.description}
          </div>
        </div>
      </section>

      {/* Gallery Section with Lightbox */}
      {house.media && house.media.length > 0 && (
        <section className="py-16 bg-[#F4EFEA] border-y border-[#E8E2D8] px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif-luxury text-2xl md:text-3xl text-[#141414]">
                The Spaces & Atmosphere
              </h3>
              <span className="text-xs uppercase tracking-[0.2em] text-[#96754B]">
                Click image to expand
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {house.media.map((media) => (
                <div
                  key={media.id}
                  onClick={() => setActiveImage(media.media_url)}
                  className="group relative aspect-4/3 overflow-hidden rounded-xs cursor-pointer bg-stone-200"
                >
                  <img
                    src={media.media_url}
                    alt={media.caption || house.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {media.caption && (
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-xs text-white uppercase tracking-wider">{media.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Amenities & House Features */}
      {house.amenities && house.amenities.length > 0 && (
        <section className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
                PRIVILEGES & SPACES
              </span>
              <h3 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] font-light">
                House Amenities
              </h3>
              <p className="text-sm text-[#141414]/70 font-light mt-4">
                Available exclusively to resident members and staying guests.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {house.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center space-x-4 p-5 bg-white rounded-xs border border-[#E8E2D8] shadow-xs"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F4EFEA] flex items-center justify-center text-[#96754B] shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#141414]">{amenity.name}</h4>
                    <p className="text-xs text-[#141414]/50 capitalize">{amenity.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bedrooms & Suites Available */}
      {house.rooms && house.rooms.length > 0 && (
        <section className="py-20 bg-[#FAF8F5] border-t border-[#E8E2D8] px-6 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
                  RESIDENCY
                </span>
                <h3 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] font-light">
                  Suites & Private Quarters
                </h3>
              </div>
              <Link
                href="/stays"
                className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414] hover:text-[#96754B] transition"
              >
                View all global stays →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {house.rooms.map((room) => (
                <div
                  key={room.id}
                  className="group bg-white rounded-xs overflow-hidden border border-[#E8E2D8] shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-200">
                    <img
                      src={room.hero_image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs">
                      {formatPrice(room.base_price_per_night)} / night
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium block mb-1">
                        Capacity: {room.capacity} Guests {room.size_sqm ? `• ${room.size_sqm} m²` : ''}
                      </span>
                      <h4 className="font-serif-luxury text-2xl text-[#141414]">{room.name}</h4>
                      <p className="text-xs text-[#141414]/70 font-light mt-2 line-clamp-2">
                        {room.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-between">
                      <span className="text-xs text-[#141414]/60">Member privileges apply</span>
                      <Link
                        href={`/stays/${room.slug}`}
                        className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
                      >
                        Reserve Suite <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Address & House Concierge */}
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto w-full border-t border-[#E8E2D8]">
        <div className="bg-[#F4EFEA] p-8 md:p-14 rounded-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#96754B] font-semibold block mb-2">
              HOUSE LOCATION
            </span>
            <h4 className="font-serif-luxury text-2xl md:text-3xl text-[#141414] mb-2">{house.name}</h4>
            <p className="text-sm text-[#141414]/70 font-light max-w-md">{house.address}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/membership/apply"
              className="px-8 py-3.5 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition duration-300"
            >
              Apply for Membership
            </Link>
          </div>
        </div>
      </section>

      {/* Image Lightbox Modal */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300"
        >
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 p-3 text-white/80 hover:text-white rounded-full bg-white/10"
            aria-label="Close image lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt="Expanded view"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xs shadow-2xl"
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

