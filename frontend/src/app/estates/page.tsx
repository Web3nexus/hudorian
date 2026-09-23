'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

import { useCms } from '@/lib/cms';

export default function EstatesPage() {
  const { getPageContent } = useCms();
  const heroContent = getPageContent('page_estates', {
    title: 'The HUDORIAN Estates',
    subtitle: 'Sprawling country landscapes and historic lands preserved for member retreats, equestrian pursuits, and multi-generational residency.',
    media_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
  });

  const estates = [
    {
      name: 'The Andalusian Domain',
      location: 'Marbella, Andalusia, Spain',
      tagline: 'A 40-hectare private estate nestled between the Mediterranean and Sierra Blanca.',
      description: 'Encompassing three heritage fincas, private olive groves, equestrian stables, clay tennis pavilions, and subterranean Roman thermal baths.',
      hero_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
      housesCount: 3,
      roomsCount: 28,
      facilities: ['Clay Tennis Pavilion', 'Subterranean Roman Baths', 'Equestrian Trails', 'Open-Fire Hearth Dining'],
    },
    {
      name: 'Sanctuary of the Arashiyama Hills',
      location: 'Kyoto, Kansai, Japan',
      tagline: 'An ancient cedarwood estate along the Oi River surrounded by bamboo forests.',
      description: 'A secluded private retreat with centuries-old gardens, tea ceremony pavilions, traditional hot spring onsen, and private residences.',
      hero_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
      housesCount: 2,
      roomsCount: 16,
      facilities: ['Natural Geothermal Onsen', 'Tea Ceremony Pavilion', 'Zen Rock Gardens', 'Seasonal Kaiseki Cellar'],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Page Header (Managed by CMS Studio) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
            PRIVATE DOMAINS
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight mb-6">
            {heroContent.title || 'The HUDORIAN Estates'}
          </h1>
          <p className="text-base sm:text-lg text-[#141414]/70 font-light leading-relaxed">
            {heroContent.subtitle || 'Sprawling country landscapes and historic lands preserved for member retreats, equestrian pursuits, and multi-generational residency.'}
          </p>
        </div>

        <div className="space-y-16">
          {estates.map((estate, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 grid grid-cols-1 lg:grid-cols-12"
            >
              <div className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-stone-200">
                <img
                  src={estate.hero_image}
                  alt={estate.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{estate.location}</span>
                  </div>

                  <h2 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] leading-snug">
                    {estate.name}
                  </h2>

                  <p className="text-sm text-[#141414]/75 font-light leading-relaxed">
                    {estate.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-xs uppercase tracking-wider text-black/50 block mb-2 font-medium">
                      Estate Facilities:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {estate.facilities.map((f, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-[#F4EFEA] rounded-full text-black/70">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between">
                  <span className="text-xs text-black/60 font-light">
                    {estate.housesCount} Houses • {estate.roomsCount} Suites
                  </span>
                  <Link
                    href="/houses"
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
                  >
                    Explore Houses in Estate <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

