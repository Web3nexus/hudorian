'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FeaturedHousesCarousel from '@/components/public/FeaturedHousesCarousel';
import { House, Event } from '@/types';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';

// Fallback initial data in case backend is initializing
const FALLBACK_HOUSES: House[] = [
  {
    id: 1,
    location_id: 1,
    name: 'HUDORIAN Ibiza',
    slug: 'hudorian-ibiza',
    tagline: 'Cliffside coastal sanctuary overlooking the Balearic horizon.',
    house_type: 'retreat',
    description: 'Carved into the untouched northern cliffs of Ibiza.',
    address: 'Sant Joan de Labritja, Ibiza',
    hero_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    is_featured: true,
    location: { id: 1, name: 'Ibiza', slug: 'ibiza', country: 'Spain' },
  },
  {
    id: 2,
    location_id: 2,
    name: 'HUDORIAN Marbella',
    slug: 'hudorian-marbella',
    tagline: 'Mediterranean estate set within ancient olive groves.',
    house_type: 'estate',
    description: 'An Andalusian estate with clay courts and Roman baths.',
    address: 'Carretera de Istán, Marbella',
    hero_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    is_featured: true,
    location: { id: 2, name: 'Marbella', slug: 'marbella', country: 'Spain' },
  },
  {
    id: 3,
    location_id: 3,
    name: 'HUDORIAN Lagos',
    slug: 'hudorian-lagos',
    tagline: 'Waterfront modernist club on Victoria Island lagoon.',
    house_type: 'club',
    description: 'An architectural landmark on Five Cowries Creek.',
    address: 'Ozumba Mbadiwe Avenue, Lagos',
    hero_image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    is_featured: true,
    location: { id: 3, name: 'Lagos', slug: 'lagos', country: 'Nigeria' },
  },
  {
    id: 4,
    location_id: 4,
    name: 'HUDORIAN Cape Town',
    slug: 'hudorian-cape-town',
    tagline: 'Atlantic grandeur framed by the Twelve Apostles.',
    house_type: 'house',
    description: 'A dramatic cliffside manor in Camps Bay.',
    address: 'Victoria Road, Camps Bay, Cape Town',
    hero_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    status: 'active',
    is_featured: true,
    location: { id: 4, name: 'Cape Town', slug: 'cape-town', country: 'South Africa' },
  },
];

export default function HomePage() {
  const [houses, setHouses] = useState<House[]>(FALLBACK_HOUSES);
  const [events, setEvents] = useState<Event[]>([]);
  const { getPageContent, brand } = useCms();

  const heroContent = getPageContent('page_home', {
    title: 'A private world of extraordinary places.',
    subtitle: "Exclusive houses, estates and clubs in the world's most inspiring destinations. For members only.",
    media_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2400&q=85',
    payload: {
      cta_text: 'Apply for membership',
      cta_link: '/membership/apply',
    },
  });

  useEffect(() => {
    // Fetch dynamic houses from API
    api.getHouses({ featured: true })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setHouses(res.data);
        }
      })
      .catch(() => {
        // Fallback maintained
      });

    api.getEvents()
      .then((res) => {
        if (res.data) setEvents(res.data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      {/* ==================================================
          SECTION 1 — HERO (Managed by CMS Studio)
          ================================================== */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Cinematic Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroContent.media_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2400&q=85"}
            alt="HUDORIAN Sanctuary"
            className="w-full h-full object-cover object-center scale-102 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/45 via-black/30 to-[#FAF8F5]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-16">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs uppercase tracking-[0.25em] font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] inline-block shadow-xs" />
            {brand.tagline || 'Private Members Constellation'}
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-light tracking-tight leading-[1.08] mb-6">
            {heroContent.title || 'A private world of extraordinary places.'}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            {heroContent.subtitle || "Exclusive houses, estates and clubs in the world's most inspiring destinations. For members only."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href={heroContent.payload?.cta_link || "/membership/apply"}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition duration-300 shadow-md"
            >
              {heroContent.payload?.cta_text || 'Apply for membership'}
            </Link>
            <Link
              href="/houses"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-white/20 transition duration-300"
            >
              Explore Houses
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 2 — MEMBERSHIP INTRO
          ================================================== */}
      <section className="py-28 md:py-36 px-6 md:px-10 max-w-5xl mx-auto text-center">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-4">
          MEMBERSHIP
        </span>

        <h2 className="font-serif-luxury text-3xl sm:text-5xl md:text-6xl font-light text-[#141414] tracking-tight leading-tight mb-8">
          More than places.<br />
          <span className="italic font-normal">A global community.</span>
        </h2>

        <p className="text-base sm:text-lg text-[#141414]/70 font-light leading-relaxed max-w-3xl mx-auto mb-10">
          HUDORIAN is an international collective forged around a shared appreciation for architecture, thoughtful fellowship, and sensory respite. Our membership unlocks private residency across six continents, curated salons with world-renowned creators, and restorative sanctuaries designed to be your home across the globe.
        </p>

        <Link
          href="/membership"
          className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-[#141414] border-b border-[#141414] pb-1 hover:text-[#96754B] hover:border-[#96754B] transition duration-300"
        >
          Explore membership privileges <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ==================================================
          SECTION 3 — FEATURED HOUSES CAROUSEL
          ================================================== */}
      <section className="py-16 md:py-24 border-t border-[#E8E2D8]">
        <FeaturedHousesCarousel houses={houses} />
      </section>

      {/* ==================================================
          SECTION 4 — STAYS (Asymmetric Editorial Section)
          ================================================== */}
      <section className="py-24 md:py-36 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Asymmetric Imagery */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-4/3 overflow-hidden rounded-xs bg-[#E8E2D8] shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
                alt="Extraordinary Stays"
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Small Overlapping Inset Image */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 w-1/2 aspect-4/3 overflow-hidden rounded-xs shadow-xl border-4 border-[#FAF8F5]">
              <img
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                alt="Suite Detail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Editorial Text */}
          <div className="lg:col-span-5 space-y-6 lg:pl-6">
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B]">
              SANCTUARIES & SUITES
            </span>

            <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#141414] tracking-tight leading-tight">
              Extraordinary stays in exceptional places.
            </h2>

            <p className="text-base text-[#141414]/75 font-light leading-relaxed">
              Every bedroom across our Houses is conceived as an architectural refuge. Built with natural linens, local stones, open wood-burning hearths, and private terraces that orient you toward the horizon.
            </p>

            <div className="pt-4">
              <Link
                href="/stays"
                className="inline-block px-7 py-3.5 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition duration-300"
              >
                Explore stays & suites
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 5 — EXPERIENCES & EVENTS
          ================================================== */}
      <section className="py-24 bg-[#F4EFEA] border-y border-[#E8E2D8] px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
                THE PROGRAMME
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-light text-[#141414] tracking-tight">
                Curated Member Experiences
              </h2>
            </div>
            <Link
              href="/experiences"
              className="text-xs uppercase tracking-[0.2em] font-medium text-[#141414] hover:text-[#96754B] transition"
            >
              View complete calendar →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Solstice Gastronomic Dinner & Wine Pairing',
                house: 'HUDORIAN Ibiza',
                date: 'Next Saturday • 19:30',
                type: 'Dining & Terroir',
                image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: 'Sound Sanctuary & Somatic Breathwork',
                house: 'HUDORIAN Kyoto',
                date: 'Bi-Weekly • 10:00',
                type: 'Restorative Wellness',
                image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80',
              },
              {
                title: 'Contemporary African Sculpture Vernissage',
                house: 'HUDORIAN Lagos',
                date: 'First Friday • 18:00',
                type: 'Arts & Culture',
                image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
              },
            ].map((exp, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col bg-white rounded-xs overflow-hidden shadow-xs hover:shadow-md transition duration-500"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-[#E8E2D8]">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] uppercase tracking-[0.2em]">
                    {exp.type}
                  </span>
                </div>
                <div className="p-6 flex flex-col justify-between grow space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium block mb-1">
                      {exp.house} • {exp.date}
                    </span>
                    <h3 className="font-serif-luxury text-xl font-medium text-[#141414] leading-snug">
                      {exp.title}
                    </h3>
                  </div>
                  <Link
                    href="/experiences"
                    className="text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] group-hover:text-[#96754B] transition flex items-center gap-1.5"
                  >
                    Reserve seat <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          SECTION 6 — COMMUNITY CTA
          ================================================== */}
      <section className="py-28 md:py-36 px-6 md:px-10 text-center max-w-4xl mx-auto">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
          AN INVITATION
        </span>
        <h2 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight mb-8">
          Join a global community.
        </h2>
        <p className="text-base sm:text-lg text-[#141414]/75 font-light leading-relaxed max-w-2xl mx-auto mb-10">
          Our Membership Committee reviews applications on a rolling quarterly cadence. We welcome individuals who value creativity, kindness, and stewardship.
        </p>
        <Link
          href="/membership/apply"
          className="inline-block px-10 py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition duration-300 shadow-md"
        >
          Apply for membership
        </Link>
      </section>

      <Footer />
    </div>
  );
}
