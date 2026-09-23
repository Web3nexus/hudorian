'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import HouseCard from '@/components/public/HouseCard';
import { House } from '@/types';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';

const HOUSE_TYPES = ['All Types', 'House', 'Estate', 'Club', 'Retreat'];

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { getPageContent } = useCms();

  const heroContent = getPageContent('page_houses', {
    title: 'A Global Constellation of Sanctuaries',
    subtitle: 'From the Balearic cliffs of Ibiza to the cedar hills of Kyoto, discover our private houses, estates, and clubs crafted for member residency.',
    media_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
  });

  useEffect(() => {
    api.getHouses()
      .then((res) => {
        if (res.data) setHouses(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredHouses = houses.filter((h) => {
    const matchesType =
      selectedType === 'All Types' ||
      h.house_type.toLowerCase() === selectedType.toLowerCase();

    const matchesSearch =
      searchQuery === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location?.country.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Page Header (Managed by CMS Studio) */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
            THE HOUSES
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight mb-6">
            {heroContent.title || 'A Global Constellation of Sanctuaries'}
          </h1>
          <p className="text-base sm:text-lg text-[#141414]/70 font-light leading-relaxed">
            {heroContent.subtitle || 'From the Balearic cliffs of Ibiza to the cedar hills of Kyoto, discover our private houses, estates, and clubs crafted for member residency.'}
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-[#E8E2D8] mb-12">
          {/* House Types */}
          <div className="flex flex-wrap items-center gap-2">
            {HOUSE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition duration-300 ${
                  selectedType === type
                    ? 'bg-[#141414] text-white shadow-xs'
                    : 'bg-[#F4EFEA] text-[#141414]/80 hover:bg-[#E8E2D8]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by city, country or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-[#D8D0C3] rounded-full text-xs tracking-wider focus:outline-hidden focus:border-[#141414] placeholder:text-black/40"
            />
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs uppercase tracking-[0.2em] text-black/50">
            Loading constellation...
          </div>
        ) : filteredHouses.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-serif-luxury text-2xl text-[#141414]/60">
              No Houses matching your selected criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHouses.map((house) => (
              <HouseCard key={house.id} house={house} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

