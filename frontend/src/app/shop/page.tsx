'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Lock } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

const PRODUCTS = [
  {
    id: 1,
    name: 'HUDORIAN Cast-Bronze Keyring',
    category: 'Home & Metalwork',
    price: 95,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    description: 'Forged from solid antiqued bronze with hand-stamped membership insignia.',
    memberOnly: true,
  },
  {
    id: 2,
    name: 'Sanctuary Linen Robe — Natural Sand',
    category: 'Sanctuary & Linen',
    price: 240,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Woven in Normandy from 100% organic stonewashed flax. Styled as found in our suites.',
    memberOnly: false,
  },
  {
    id: 3,
    name: 'Balearic Sunset Candle No. 4',
    category: 'Aromatics & Flame',
    price: 85,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    description: 'Notes of wild coastal rosemary, fig leaf, warm terracotta, and Balearic sea salt.',
    memberOnly: false,
  },
  {
    id: 4,
    name: 'The Architectural Monograph Vol. I',
    category: 'Editions & Print',
    price: 120,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'A 280-page clothbound retrospective documenting the creation of the first six Houses.',
    memberOnly: true,
  },
];

import { useCms } from '@/lib/cms';
import { useCurrency } from '@/context/CurrencyContext';

export default function ShopPage() {
  const { formatPrice } = useCurrency();
  const { getPageContent } = useCms();
  const heroContent = getPageContent('page_shop', {
    title: 'The Club Collection',
    subtitle: 'Every object in our shop is sourced directly from the artisans, weavers, and studios that furnish our Houses worldwide.',
    media_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85',
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Header (Managed by CMS Studio) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
            CURATED GOODS
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight mb-6">
            {heroContent.title || 'The Club Collection'}
          </h1>
          <p className="text-base text-[#141414]/70 font-light leading-relaxed">
            {heroContent.subtitle || 'Every object in our shop is sourced directly from the artisans, weavers, and studios that furnish our Houses worldwide.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="group bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {prod.memberOnly && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-white text-[10px] uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Members Exclusive
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#96754B] font-semibold block">
                    {prod.category}
                  </span>
                  <h3 className="font-serif-luxury text-xl text-[#141414] leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-black/60 font-light line-clamp-2">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between border-t border-[#E8E2D8] mt-4">
                <span className="font-serif-luxury text-lg text-[#141414]">{formatPrice(prod.price)}</span>
                <button
                  onClick={() => alert(`Pre-order placed for ${prod.name}. The Club concierge will contact your registered member profile.`)}
                  className="px-4 py-2 rounded-full bg-[#141414] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#B8976C] transition"
                >
                  Acquire
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

