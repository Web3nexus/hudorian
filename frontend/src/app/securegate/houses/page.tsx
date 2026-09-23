'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Eye, ExternalLink, Plus } from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGateHousesPage() {
  const [houses, setHouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await api.getHouses() as any;
        if (res && res.data) setHouses(res.data);
      } catch (err) {
        console.warn('Could not load houses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  return (
    <SecureGateLayout
      title="Sanctuaries & Houses"
      subtitle="Overview of global physical sanctuaries, private estates, and architectural suites."
      actions={
        <Link
          href="/securegate/cms"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition flex items-center gap-2"
        >
          <span>Manage House Hero & Copy in CMS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="p-16 text-center text-xs text-white/40 font-mono">
            Loading global sanctuary inventory...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {houses.map((house) => (
              <div
                key={house.id}
                className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden group hover:border-[#B8976C]/30 transition duration-300"
              >
                {house.hero_image ? (
                  <div className="h-44 w-full relative overflow-hidden">
                    <img
                      src={house.hero_image}
                      alt={house.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                      {house.house_type || 'House'}
                    </div>
                  </div>
                ) : (
                  <div className="h-44 w-full bg-white/[0.03] flex items-center justify-center text-white/20">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-serif-luxury text-xl text-white">
                      {house.name}
                    </h3>
                    <p className="text-xs text-white/50 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{house.location?.name || house.address}, {house.location?.country}</span>
                    </p>
                  </div>

                  <p className="text-xs text-white/60 font-light line-clamp-2">
                    {house.short_description || house.description}
                  </p>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#C5A880]">
                      {house.rooms_count || (house.rooms ? house.rooms.length : 0)} Suites Configured
                    </span>

                    <Link
                      href={`/houses/${house.slug}`}
                      target="_blank"
                      className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1"
                    >
                      View House <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SecureGateLayout>
  );
}

