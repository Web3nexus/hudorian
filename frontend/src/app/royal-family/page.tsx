'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, Sparkles, ArrowRight, Compass, Award, BookOpen, Users, HeartHandshake } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function RoyalFamilyPage() {
  const royalHead = {
    title: 'His Royal Majesty',
    name: 'Sovereign Head of the Uzih Royal Dynasty',
    role: 'Patriarch & Custodian of the Imperial Lineage',
    heraldry: 'Lion Crest with Sovereign Solar Radiance',
    bio: 'Guiding the House of Uzih with steadfast honor and timeless wisdom. His Majesty has spearheaded the preservation of ancestral heritage, sovereign patronages in cultural arts, and the modern international expansion of the HUDORIAN sanctuaries across global capitals.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    attributes: [
      { label: 'Dynastic Seat', value: 'The Sovereign Palace of Uzih' },
      { label: 'Ancestral Motto', value: 'Per Dignitatem et Fortitudinem' },
      { label: 'Imperial Patronages', value: 'Heritage Architecture, Classical Arts, Global Philanthropy' },
      { label: 'Reign Focus', value: 'Dynastic Unity, Generational Stewardship' },
    ],
  };

  const queens = [
    {
      title: 'Her Royal Majesty',
      name: 'Queen Consort Aisha of Uzih',
      role: 'First Lady of the Realm & Patroness of Fine Arts',
      bio: 'Renowned for grace, cultural intellect, and devotion to dynastic traditions. Her Majesty directs the Uzih Royal Foundation for the Arts, commissioning classical music pavilions and restorative botanical conservatories across the royal properties.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      patronages: ['Royal Arts Foundation', 'Maternal Health Endowment', 'Botanical Conservation'],
      seat: 'The Emerald Pavilion, Marbella Domain',
    },
    {
      title: 'Her Royal Highness',
      name: 'Queen Consort Soraya of Uzih',
      role: 'Custodian of Royal Archives & Sovereign Philanthropist',
      bio: 'A distinguished scholar of international diplomacy and classical history. Her Highness oversees the imperial library, rare manuscript preservation, and educational fellowships empowering extraordinary young minds worldwide.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
      patronages: ['Imperial Library & Archives', 'Global Youth Fellowships', 'Equestrian Heritage'],
      seat: 'The Cedarwood Sanctuary, Kyoto',
    },
  ];

  const children = [
    {
      name: 'Prince Reda of Uzih',
      title: 'Founder & Heir to Reda House',
      role: 'Crown Prince & Maritime Patron',
      age_desc: 'Eldest Royal Son',
      bio: 'Educated in architecture and international trade. Prince Reda established Reda House as a beacon of maritime exploration, sustainable sanctuary design, and high-seas sailing fellowships.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      house: 'Reda House',
      house_link: '/royal-houses#reda-house',
      emblem: 'Golden Falcon over Azure Crest',
    },
    {
      name: 'Princess Aria of Uzih',
      title: 'Founder of Aria House',
      role: 'Royal Daughter & Cultural Envoy',
      age_desc: 'Eldest Royal Daughter',
      bio: 'Champion of contemporary aesthetics and classical symphony. Princess Aria curates the international cultural salon at HUDORIAN houses, bridging ancestral heritage with forward-looking artistic expression.',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
      house: 'Aria House',
      house_link: '/royal-houses#aria-house',
      emblem: 'Silver Lotus over Silk Champagne',
    },
    {
      name: 'Prince Tarek of Uzih',
      title: 'Founder of Tarek House',
      role: 'Princely Son & Equestrian Steward',
      age_desc: 'Cadet Prince',
      bio: 'Distinguished equestrian champion and steward of land conservation. Prince Tarek oversees the thoroughbred breeding stud and multi-generational agrarian sanctuaries of the family estates.',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80',
      house: 'Tarek House',
      house_link: '/royal-houses#tarek-house',
      emblem: 'Black Stallion over Platinum Shield',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full space-y-24">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="w-24 h-24 mx-auto mb-2 relative flex items-center justify-center">
            <img
              src="/images/hudorian-seal.png"
              alt="The Royal Seal of Uzih"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8976C]/15 border border-[#B8976C]/30 text-[#96754B] text-xs font-mono font-medium uppercase tracking-[0.25em]">
            <Crown className="w-4 h-4 text-[#96754B]" />
            <span>The Imperial Lineage & Sovereign Dynasty</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-light text-[#141414] tracking-tight">
            The Uzih Royal Family
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#141414]/70 font-light leading-relaxed max-w-3xl mx-auto">
            Anchoring the sovereign heritage of HUDORIAN through centuries of noble stewardship, patronages in the arts, and the enduring grace of the House of Uzih.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/royal-houses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md"
            >
              <span>Explore Royal Houses & Allies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#history"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#141414]/20 text-[#141414] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black/5 transition"
            >
              <BookOpen className="w-4 h-4 text-[#96754B]" />
              <span>Dynastic History & Seal</span>
            </a>
          </div>
        </div>

        {/* The Royal Head (Sovereign Patriarch) */}
        <section className="space-y-8">
          <div className="border-b border-[#E8E2D8] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-[#96754B]" />
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414] tracking-wide">
                The Sovereign Royal Head
              </h2>
            </div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#96754B] hidden sm:inline-block">
              Supreme Patriarch
            </span>
          </div>

          <div className="bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative aspect-4/5 lg:aspect-auto overflow-hidden bg-stone-900">
              <img
                src={royalHead.image}
                alt={royalHead.name}
                className="w-full h-full object-cover grayscale-[15%] contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C5A880] block">
                  {royalHead.title}
                </span>
                <p className="font-serif-luxury text-xl sm:text-2xl font-light">{royalHead.name}</p>
              </div>
            </div>

            <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium">
                  <Shield className="w-4 h-4 text-[#96754B]" />
                  <span>{royalHead.role}</span>
                </div>

                <h3 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] leading-snug">
                  Steering Dynastic Heritage with Sovereign Grace
                </h3>

                <p className="text-base text-[#141414]/75 font-light leading-relaxed">
                  {royalHead.bio}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8E2D8]">
                  {royalHead.attributes.map((attr, i) => (
                    <div key={i} className="p-4 bg-[#F4EFEA]/60 rounded-xs space-y-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-black/40 block">
                        {attr.label}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[#141414]">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-[#96754B]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sovereign Warrant Certified</span>
                </div>
                <Link
                  href="/royal-houses"
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
                >
                  View Dynastic Alliances <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Queens & Consorts */}
        <section className="space-y-8">
          <div className="border-b border-[#E8E2D8] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#96754B]" />
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414] tracking-wide">
                The Queens & Consorts
              </h2>
            </div>
            <span className="text-xs uppercase font-mono tracking-widest text-[#96754B] hidden sm:inline-block">
              Royal Matriarchs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {queens.map((queen, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/10 overflow-hidden bg-stone-200">
                    <img
                      src={queen.image}
                      alt={queen.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#C5A880] text-[11px] font-mono uppercase tracking-wider">
                        {queen.title}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 space-y-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium block">
                      {queen.role}
                    </span>

                    <h3 className="font-serif-luxury text-2xl text-[#141414]">
                      {queen.name}
                    </h3>

                    <p className="text-sm text-[#141414]/75 font-light leading-relaxed">
                      {queen.bio}
                    </p>

                    <div className="pt-2 space-y-2">
                      <span className="text-[11px] uppercase tracking-wider text-black/40 block font-medium">
                        Endowments & Patronages:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {queen.patronages.map((p, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 bg-[#F4EFEA] rounded-full text-black/70 font-light"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:px-8 border-t border-[#E8E2D8] bg-[#FAF8F5]/50 flex items-center justify-between text-xs">
                  <span className="text-black/50 font-light">{queen.seat}</span>
                  <span className="text-[#96754B] font-mono">Consort of Uzih</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The Royal Children & Heirs */}
        <section className="space-y-8">
          <div className="border-b border-[#E8E2D8] pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#96754B]" />
              <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414] tracking-wide">
                The Royal Children & Princely Heirs
              </h2>
            </div>
            <Link
              href="/royal-houses"
              className="text-xs uppercase font-mono tracking-widest text-[#96754B] hover:underline flex items-center gap-1"
            >
              <span>See Cadet Houses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {children.map((child, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/5 overflow-hidden bg-stone-200">
                    <img
                      src={child.image}
                      alt={child.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#C5A880] text-[10px] font-mono uppercase tracking-wider">
                        {child.age_desc}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#96754B] font-medium block">
                      {child.title}
                    </span>

                    <h3 className="font-serif-luxury text-xl sm:text-2xl text-[#141414]">
                      {child.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#141414]/75 font-light leading-relaxed">
                      {child.bio}
                    </p>

                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-black/40 block">
                        Cadet Seat:
                      </span>
                      <span className="text-xs font-semibold text-[#141414]">
                        {child.house} • {child.emblem}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-[#E8E2D8] bg-[#FAF8F5]/50 flex items-center justify-between">
                  <span className="text-[11px] text-black/50 font-mono">Royal Cadet</span>
                  <Link
                    href={child.house_link}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-[#96754B] hover:text-[#141414] transition"
                  >
                    Enter House <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynastic History & The Royal Seal Section */}
        <section id="history" className="bg-[#101014] text-[#FAF8F5] rounded-xs p-8 md:p-16 border border-white/10 relative overflow-hidden space-y-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#B8976C]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-6">
              <div className="w-48 h-48 relative p-4 rounded-full bg-white/[0.03] border border-[#B8976C]/40 shadow-2xl flex items-center justify-center">
                <img
                  src="/images/hudorian-seal.png"
                  alt="Imperial Royal Seal"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(184,151,108,0.3)]"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif-luxury text-2xl tracking-widest uppercase text-[#C5A880]">
                  The Imperial Seal of Uzih
                </h3>
                <p className="text-xs font-mono text-white/50 tracking-wider">
                  HERALDIC CODE: UZIH-ROYAL-SIGIL-01
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8976C]/20 text-[#C5A880] text-xs font-mono tracking-widest uppercase">
                <Award className="w-3.5 h-3.5" />
                <span>Centuries of Sovereign Heritage</span>
              </div>

              <h2 className="font-serif-luxury text-3xl sm:text-5xl text-white font-light tracking-tight leading-tight">
                The History & Heraldry of the Royal Dynasty
              </h2>

              <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
                The House of Uzih traces its origins through generations of noble custodianship, rooted in honor, sovereign valor, and benevolent community stewardship. Through diplomatic treaties and cultural alliances, the dynasty has stood as an unwavering pillar of stability and refined cultural patronage.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[#C5A880] font-mono uppercase tracking-wider block font-semibold">
                    The Golden Crest
                  </span>
                  <p className="text-white/60 font-light leading-relaxed">
                    Symbolizing sovereign endurance, divine enlightenment, and eternal loyalty to the realm.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[#C5A880] font-mono uppercase tracking-wider block font-semibold">
                    The Twin Pillars
                  </span>
                  <p className="text-white/60 font-light leading-relaxed">
                    Representing the harmony of strength and compassion, governing all dynastic treaties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA to Royal Houses and Allies */}
        <div className="p-8 md:p-12 rounded-xs bg-[#F4EFEA] border border-[#E8E2D8] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif-luxury text-2xl md:text-3xl text-[#141414]">
              Cadet Houses & Imperial Alliances
            </h3>
            <p className="text-sm text-[#141414]/70 font-light max-w-xl">
              Discover Reda House, Aria House, and the esteemed dynastic allies including the noble Family of Victors.
            </p>
          </div>

          <Link
            href="/royal-houses"
            className="shrink-0 px-8 py-4 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md flex items-center gap-2"
          >
            <span>Visit Royal Houses & Allies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

