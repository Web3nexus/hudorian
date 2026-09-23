import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { House } from '@/types';

interface HouseCardProps {
  house: House;
  priority?: boolean;
}

export default function HouseCard({ house }: HouseCardProps) {
  return (
    <Link
      href={`/houses/${house.slug}`}
      className="group relative flex flex-col overflow-hidden bg-[#FAF8F5] transition duration-500 rounded-sm"
    >
      {/* Media Container with architectural aspect ratio */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[#E8E2D8]">
        <img
          src={house.hero_image || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'}
          alt={house.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle Dark Vignette & Hover Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs tracking-[0.2em] uppercase text-white font-medium">
          <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
            {house.house_type}
          </span>
          <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Explore <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Bottom Content pinned inside Image Card */}
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] mb-1 font-medium">
            {house.location?.name}, {house.location?.country}
          </p>
          <h3 className="font-serif-luxury text-2xl md:text-3xl font-medium tracking-tight leading-snug">
            {house.name}
          </h3>
          <p className="text-xs text-white/80 line-clamp-1 font-light mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {house.tagline || house.short_description}
          </p>
        </div>
      </div>
    </Link>
  );
}

