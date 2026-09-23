'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, ArrowRight, Compass, Sparkles, HeartHandshake, Award, Landmark, ExternalLink } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function RoyalHousesPage() {
  const cadetHouses = [
    {
      id: 'reda-house',
      name: 'Reda House',
      founder: 'Founded by Prince Reda of Uzih',
      role: 'Princely Cadet House & Maritime Domain',
      tagline: 'A sovereign coastal sanctuary championing oceanic stewardship, naval architecture, and seafaring exploration.',
      description: 'Established under royal charter by Prince Reda, eldest royal son of the House of Uzih. Reda House stands atop majestic Mediterranean cliff lines, serving as the international headquarters for royal yachting regattas, deep-ocean ecological research, and high-level diplomatic assemblies.',
      hero_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
      location: 'The Reda Coastal Citadel, Balearic Isles',
      motto: 'Honor, Vision, Endurance',
      colors: 'Royal Azure & Burnished Gold',
      privileges: [
        'Private Superyacht Deep-Water Moorings',
        'Naval Architecture & Design Atelier',
        'Oceanic Conservation Research Trust',
        'Helipad & Sovereign Coastal Pavilion',
      ],
      emblem: 'Golden Falcon over Azure Crest',
    },
    {
      id: 'aria-house',
      name: 'Aria House',
      founder: 'Founded by Princess Aria of Uzih',
      role: 'Princely Cadet House of Fine Arts & Wellness',
      tagline: 'An ethereal sanctuary of classical symphony, rare botanical gardens, and restorative mind-body sanctuaries.',
      description: 'Curated under the patronage of Princess Aria, this house merges centuries-old botanical knowledge with acoustic perfection. Featuring an amphitheater carved from native stone and greenhouse conservatories housing endangered Mediterranean and Asian flora.',
      hero_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      location: 'The Aria Botanical Sanctuary, Andalusia',
      motto: 'Grace in Sovereignty',
      colors: 'Imperial Emerald & Silk Champagne',
      privileges: [
        'Acoustic Symphony Salon & Amphitheater',
        'Rare Medicinal Herb & Orchid Conservatories',
        'Hydrothermal Roman Spa & Thalassotherapy',
        'Literary & Classical Manuscript Archives',
      ],
      emblem: 'Silver Lotus over Silk Champagne',
    },
    {
      id: 'tarek-house',
      name: 'Tarek House',
      founder: 'Founded by Prince Tarek of Uzih',
      role: 'Princely Cadet House & Equestrian Domain',
      tagline: 'The ancestral equestrian seat dedicated to champion thoroughbred breeding, polo heritage, and highland stewardship.',
      description: 'Founded by Prince Tarek, this sprawling country domain is revered worldwide for its champion bloodstock stud, Olympic-standard jumping arenas, and historic hunting lodges set among rolling forested hills.',
      hero_image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80',
      location: 'The Tarek Equestrian Grounds, Sierra Foothills',
      motto: 'Strength Through Integrity',
      colors: 'Obsidian & Platinum',
      privileges: [
        'Championship International Polo Grounds',
        'Thoroughbred Pedigree Stud & Equestrian Arena',
        'Private Forest Trails & Wilderness Lodges',
        'Open-Fire Hearth Clubroom & Cellar',
      ],
      emblem: 'Black Stallion over Platinum Shield',
    },
  ];

  const dynasticAllies = [
    {
      id: 'family-of-victors',
      name: 'The Family of Victors',
      dynasty: 'House of Victor',
      alliance_type: 'Sovereign Treaty Alliance & Companions of Honor',
      tagline: 'An illustrious noble dynasty bound to the House of Uzih through generations of mutual covenant and global enterprise.',
      description: 'The Family of Victors represents one of the most storied aristocratic alliances of the realm. United with the Uzih royal dynasty by historic concordats, the Victors command venerable estates, private aviation fleet networks, and pioneering philanthropic foundations across five continents.',
      hero_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
      seat: 'The Citadel of Victors & Grand Estate',
      motto: 'Invictus in Aeternum (Victorious in Eternity)',
      alliance_pact: 'The Victor-Uzih Sovereign Concordat',
      allied_privileges: [
        'Bilateral Reciprocal Access across all Global Houses',
        'Joint Philanthropic Venture Endowments',
        'Private Aviation Terminal Privileges',
        'Annual Sovereign Ball & Executive Conclave',
      ],
    },
    {
      id: 'house-of-aurelius',
      name: 'The House of Aurelius',
      dynasty: 'Aurelius Imperial Lineage',
      alliance_type: 'Diplomatic & Classical Arts Alliance',
      tagline: 'Venerable custodians of Mediterranean antiquities, classical sculpture, and rare vintage vineyards.',
      description: 'Longtime allies in cultural diplomacy, the House of Aurelius partners with the House of Uzih to fund archaeology, curate fine art exhibitions in HUDORIAN houses, and host seasonal vintage harvest celebrations.',
      hero_image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1600&q=80',
      seat: 'Villa Aurelia & Vineyard Domain, Tuscany',
      motto: 'Virtus et Veritas (Virtue and Truth)',
      alliance_pact: 'The Tuscan Cultural Accord',
      allied_privileges: [
        'Private Private-Reserve Wine Cellar Allocation',
        'Curatorial Privileges at Royal Art Salons',
        'Exclusive Residency at Villa Aurelia',
      ],
    },
    {
      id: 'montclaire-dynasty',
      name: 'The Montclaire Dynasty',
      dynasty: 'House of Montclaire',
      alliance_type: 'Alpine & Maritime Stewardship Alliance',
      tagline: 'Stewards of European alpine retreats, winter skiing sanctuaries, and Riviera regattas.',
      description: 'Partnering in the acquisition of high-altitude chalets and private yachting pavilions, the Montclaires bring centuries of Continental nobility and hospitality mastery to the alliance.',
      hero_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
      seat: 'Château Montclaire, Swiss Alps',
      motto: 'Semper Excelsius (Always Higher)',
      alliance_pact: 'The Alpine & Riviera Accord',
      allied_privileges: [
        'Priority Access to Private Ski Slopes & Chalets',
        'Riviera Yachting Anchorage Privileges',
        'Alpine Sommelier & Fondue Cellars',
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full space-y-24">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
            <img
              src="/images/hudorian-seal.png"
              alt="HUDORIAN Royal Seal"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B8976C]/15 border border-[#B8976C]/30 text-[#96754B] text-xs font-mono font-medium uppercase tracking-[0.25em]">
            <Crown className="w-4 h-4 text-[#96754B]" />
            <span>Cadet Houses & Imperial Fellowships</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl font-light text-[#141414] tracking-tight">
            Royal Houses & Allies
          </h1>

          <p className="text-base sm:text-lg text-[#141414]/70 font-light leading-relaxed">
            The sovereign cadet houses established by the royal children of the Uzih dynasty and the historic allied families standing in eternal fellowship with the realm.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/royal-family"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md"
            >
              <span>The Uzih Royal Family</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#allies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#141414]/20 text-[#141414] text-xs uppercase tracking-[0.2em] font-medium hover:bg-black/5 transition"
            >
              <HeartHandshake className="w-4 h-4 text-[#96754B]" />
              <span>Royal Allies (Victors & More)</span>
            </a>
          </div>
        </div>

        {/* SECTION 1: Cadet Houses of the Royal Children */}
        <section className="space-y-12">
          <div className="border-b border-[#E8E2D8] pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#96754B] block mb-1">
                Dynastic Branches
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-4xl text-[#141414] tracking-wide">
                Cadet Houses of the Royal Children
              </h2>
            </div>
            <span className="text-xs uppercase font-mono tracking-widest text-black/40 hidden sm:inline-block">
              Uzih Heirs & Sovereign Seats
            </span>
          </div>

          <div className="space-y-16">
            {cadetHouses.map((house) => (
              <div
                key={house.id}
                id={house.id}
                className="bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 grid grid-cols-1 lg:grid-cols-12 scroll-mt-36"
              >
                <div className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-stone-900">
                  <img
                    src={house.hero_image}
                    alt={house.name}
                    className="w-full h-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#C5A880] text-[11px] font-mono uppercase tracking-wider">
                      {house.founder}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#141414] text-[10px] font-mono uppercase tracking-wider font-semibold">
                      {house.emblem}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{house.location}</span>
                    </div>

                    <h3 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] leading-snug">
                      {house.name}
                    </h3>

                    <p className="text-xs font-mono uppercase tracking-wider text-[#96754B]">
                      Motto: &quot;{house.motto}&quot;
                    </p>

                    <p className="text-sm text-[#141414]/75 font-light leading-relaxed">
                      {house.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-xs uppercase tracking-wider text-black/50 block mb-2 font-medium">
                        House Facilities & Patronages:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {house.privileges.map((p, i) => (
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

                  <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between">
                    <span className="text-xs text-black/60 font-light">
                      Colors: <strong className="text-[#141414]">{house.colors}</strong>
                    </span>
                    <Link
                      href="/membership/apply"
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
                    >
                      Inquire Fellowship <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: The Royal Family Allies (e.g. Family of Victors) */}
        <section id="allies" className="space-y-12 scroll-mt-36">
          <div className="border-b border-[#E8E2D8] pb-4 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[#96754B] block mb-1">
                Noble Treaties & Covenants
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-4xl text-[#141414] tracking-wide">
                Royal Family Allies
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#96754B] hidden sm:flex">
              <HeartHandshake className="w-4 h-4" />
              <span>Sovereign Alliances</span>
            </div>
          </div>

          <div className="space-y-16">
            {dynasticAllies.map((ally) => (
              <div
                key={ally.id}
                id={ally.id}
                className="bg-white rounded-xs border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition duration-500 grid grid-cols-1 lg:grid-cols-12"
              >
                <div className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-stone-900">
                  <img
                    src={ally.hero_image}
                    alt={ally.name}
                    className="w-full h-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-[#C5A880] text-[11px] font-mono uppercase tracking-wider border border-[#B8976C]/30 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{ally.alliance_pact}</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#96754B] font-medium">
                      <Landmark className="w-3.5 h-3.5" />
                      <span>{ally.seat}</span>
                    </div>

                    <h3 className="font-serif-luxury text-3xl md:text-4xl text-[#141414] leading-snug">
                      {ally.name}
                    </h3>

                    <p className="text-xs font-mono uppercase tracking-wider text-[#96754B]">
                      Motto: &quot;{ally.motto}&quot;
                    </p>

                    <p className="text-sm text-[#141414]/75 font-light leading-relaxed">
                      {ally.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-xs uppercase tracking-wider text-black/50 block mb-2 font-medium">
                        Allied Concordat Privileges:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {ally.allied_privileges.map((p, i) => (
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

                  <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between">
                    <span className="text-xs text-black/60 font-mono">
                      Status: <strong className="text-[#96754B]">Perpetual Treaty</strong>
                    </span>
                    <Link
                      href="/royal-family"
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
                    >
                      The Uzih Sovereign Court <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Navigation Banner */}
        <div className="p-8 md:p-12 rounded-xs bg-[#101014] text-white border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif-luxury text-2xl md:text-3xl text-[#FAF8F5]">
              Return to The Uzih Royal Family
            </h3>
            <p className="text-xs sm:text-sm text-white/60 font-light max-w-xl">
              Learn about the Sovereign Royal Head, the Queens and Consorts, and the royal history crowned by the Royal Seal.
            </p>
          </div>

          <Link
            href="/royal-family"
            className="shrink-0 px-8 py-4 rounded-full bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black text-xs uppercase tracking-[0.2em] font-semibold hover:opacity-95 transition shadow-lg flex items-center gap-2"
          >
            <span>The Sovereign Court</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
