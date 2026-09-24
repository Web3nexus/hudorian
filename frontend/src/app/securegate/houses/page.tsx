'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Eye, ExternalLink, X, Search, Sparkles } from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGateHousesPage() {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [inspectHouse, setInspectHouse] = useState<any | null>(null);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = (await api.getHouses()) as any;
        if (res && res.data) setHouses(res.data);
      } catch (err) {
        console.warn('Could not load houses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  const filteredHouses = houses.filter((h) => {
    const name = `${h.name || ''}`.toLowerCase();
    const loc = `${h.location?.name || h.address || ''} ${h.location?.country || ''}`.toLowerCase();
    const type = `${h.house_type || ''}`.toLowerCase();
    const q = filterQuery.toLowerCase();
    return name.includes(q) || loc.includes(q) || type.includes(q);
  });

  return (
    <SecureGateLayout
      title="Sanctuaries & Houses Portfolio"
      subtitle="Executive ledger of physical sanctuaries, private estates, and architectural suites across global capitals."
      actions={
        <Link
          href="/securegate/cms"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition flex items-center gap-2"
        >
          <span>Manage Editorial Lore in CMS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative grow max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by sanctuary name, country or type..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        {/* Executive Houses Table */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Synchronizing global sanctuary inventory from SecureGate vault...
            </div>
          ) : filteredHouses.length === 0 ? (
            <div className="p-16 text-center text-white/50 text-xs font-light">
              No sanctuary properties matched your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Sanctuary</th>
                    <th className="p-4">House Name & Key</th>
                    <th className="p-4">Terroir & Location</th>
                    <th className="p-4">Sanctuary Type</th>
                    <th className="p-4">Suites Configured</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredHouses.map((house) => (
                    <tr key={house.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 pl-6">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 bg-stone-900 shrink-0">
                          {house.hero_image ? (
                            <img src={house.hero_image} alt={house.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                        {house.name}
                        <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">/{house.slug}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                          <span>
                            {house.location?.name || house.address || 'Global'}, {house.location?.country || ''}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-[#C5A880] border border-white/10">
                          {house.house_type || 'House'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-white/70">
                        {house.rooms_count || (house.rooms ? house.rooms.length : 0)} Suites
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectHouse(house)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer"
                            title="Inspect Sanctuary"
                          >
                            <Eye className="w-3 h-3 text-[#C5A880]" />
                            <span>Inspect</span>
                          </button>
                          <Link
                            href={`/houses/${house.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                            title="Open Public Sanctuary Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Inspect House Modal */}
      {inspectHouse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">{inspectHouse.name}</h3>
              </div>
              <button
                onClick={() => setInspectHouse(null)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {inspectHouse.hero_image && (
                <div className="h-52 w-full rounded-xl overflow-hidden border border-white/10 relative">
                  <img
                    src={inspectHouse.hero_image}
                    alt={inspectHouse.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                    {inspectHouse.house_type || 'House'}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Location & Address</span>
                  <p className="text-xs text-white font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    {inspectHouse.location?.name || inspectHouse.address}, {inspectHouse.location?.country}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Accommodation Suites</span>
                  <p className="text-xs text-white font-medium">
                    {inspectHouse.rooms_count || (inspectHouse.rooms ? inspectHouse.rooms.length : 0)} Suites Configured
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 uppercase">Architectural Description</span>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {inspectHouse.description || inspectHouse.short_description || 'No detailed lore recorded.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#C5A880]">
                  Public Route: /houses/{inspectHouse.slug}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setInspectHouse(null)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                  >
                    Close
                  </button>
                  <Link
                    href={`/houses/${inspectHouse.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                  >
                    <span>View Live House</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SecureGateLayout>
  );
}
