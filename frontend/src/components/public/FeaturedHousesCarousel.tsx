'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { House } from '@/types';
import HouseCard from './HouseCard';

interface FeaturedHousesCarouselProps {
  houses: House[];
}

export default function FeaturedHousesCarousel({ houses }: FeaturedHousesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      scroll('right');
    }
  };

  return (
    <div
      className="relative focus:outline-hidden"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Featured Houses Carousel"
    >
      {/* Navigation Controls Header */}
      <div className="flex items-center justify-between mb-8 px-6 md:px-10 max-w-7xl mx-auto">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#96754B] font-semibold block mb-2">
            The Constellation
          </span>
          <h2 className="font-serif-luxury text-3xl md:text-5xl font-light tracking-tight text-[#141414]">
            Featured Houses
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous houses"
            className="w-11 h-11 rounded-full border border-[#D8D0C3] flex items-center justify-center hover:bg-[#141414] hover:text-white hover:border-[#141414] transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-[#D8D0C3]"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next houses"
            className="w-11 h-11 rounded-full border border-[#D8D0C3] flex items-center justify-center hover:bg-[#141414] hover:text-white hover:border-[#141414] transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-[#D8D0C3]"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto space-x-6 px-6 md:px-10 no-scrollbar snap-x snap-mandatory scroll-smooth pb-6"
      >
        {houses.map((house) => (
          <div
            key={house.id}
            className="snap-start shrink-0 w-[85vw] sm:w-[45vw] lg:w-[22vw] min-w-[280px]"
          >
            <HouseCard house={house} />
          </div>
        ))}
      </div>
    </div>
  );
}

