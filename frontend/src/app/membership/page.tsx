'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Award, Shield, Compass, ArrowRight, HelpCircle } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { MembershipPlan } from '@/types';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';
import { useCurrency } from '@/context/CurrencyContext';

const FAQS = [
  {
    q: 'How does the application and admission process work?',
    a: 'Prospective candidates submit a detailed dossier covering personal, professional, and cultural interests. Our Membership Committee reviews candidacies on a rolling quarterly basis to preserve the diversity, creative spirit, and stewardship of our community.',
  },
  {
    q: 'Can members bring guests to the Houses?',
    a: 'Yes. Resident Members may be accompanied by 1 guest, Global House Members by up to 2 guests, and Founder Patrons by up to 4 guests without pre-registration.',
  },
  {
    q: 'What is the policy for bedroom and suite reservations?',
    a: 'Members receive preferred member privileges ranging from 10% to 25% off standard rates, alongside guaranteed reservation priority and complimentary upgrades based on tier.',
  },
  {
    q: 'How is the digital membership card verified at House entrances?',
    a: 'Upon acceptance, members receive access to their Digital Member Card in the member app. The pass features a dynamic, short-lived HMAC QR code that refreshes every 15 minutes and is verified securely at House concierges without exposing personal data.',
  },
];

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { getPageContent } = useCms();
  const { formatPrice } = useCurrency();

  const heroContent = getPageContent('page_membership', {
    title: 'An International Patronage',
    subtitle: 'HUDORIAN membership connects global visionaries, artists, and leaders through shared spaces, extraordinary stays, and cultural gatherings.',
    media_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
  });

  useEffect(() => {
    api.getMembershipPlans()
      .then((res) => {
        if (res.data) setPlans(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Hero Header (Managed by CMS Studio) */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-3">
            FELLOWSHIP & RESIDENCY
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl font-light text-[#141414] tracking-tight mb-8">
            {heroContent.title || 'An International Patronage'}
          </h1>
          <p className="text-base sm:text-lg text-[#141414]/75 font-light leading-relaxed max-w-2xl mx-auto">
            {heroContent.subtitle || 'HUDORIAN membership connects global visionaries, artists, and leaders through shared spaces, extraordinary stays, and cultural gatherings.'}
          </p>
          <div className="mt-8">
            <Link
              href="/membership/apply"
              className="inline-block px-10 py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition duration-300 shadow-md"
            >
              Apply for membership
            </Link>
          </div>
        </div>

        {/* Membership Plans Tiers Grid */}
        <div className="mb-28">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#96754B] font-semibold block mb-2">
              CONFIGURABLE TIERS
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#141414]">
              Membership Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, idx) => {
              const isHighlight = idx === 1; // Global House Member
              return (
                <div
                  key={plan.id}
                  className={`relative p-8 md:p-10 rounded-xs flex flex-col justify-between transition duration-500 ${
                    isHighlight
                      ? 'bg-[#141414] text-white shadow-xl scale-102 border border-white/20'
                      : 'bg-white text-[#141414] border border-[#E8E2D8] shadow-xs'
                  }`}
                >
                  {isHighlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#B8976C] text-white text-[10px] uppercase tracking-[0.2em] font-semibold rounded-full shadow-xs">
                      Most Selected
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-serif-luxury text-2xl md:text-3xl font-medium mb-2">
                        {plan.name}
                      </h3>
                      <p className={`text-xs font-light leading-relaxed ${isHighlight ? 'text-white/70' : 'text-black/70'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="border-y border-current/15 py-4">
                      <span className="font-serif-luxury text-4xl">
                        {formatPrice(plan.price)}
                      </span>
                      <span className="text-xs tracking-wider opacity-70"> / {plan.billing_period}</span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[11px] uppercase tracking-[0.2em] font-semibold opacity-60 block">
                        Privileges Included:
                      </span>
                      {plan.perks && plan.perks.map((perk, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs font-light">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isHighlight ? 'text-[#B8976C]' : 'text-[#96754B]'}`} />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <Link
                      href={`/membership/apply?plan=${plan.id}`}
                      className={`w-full py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-semibold text-center block transition duration-300 ${
                        isHighlight
                          ? 'bg-[#B8976C] text-white hover:bg-white hover:text-black'
                          : 'bg-[#141414] text-[#FAF8F5] hover:bg-[#B8976C]'
                      }`}
                    >
                      Select Plan & Apply
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Matrix & Philosophy */}
        <div id="benefits" className="py-20 bg-[#F4EFEA] rounded-xs p-8 md:p-14 border border-[#E8E2D8] mb-28">
          <div className="max-w-3xl mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#96754B] font-semibold block mb-2">
              THE PATRONAGE CODE
            </span>
            <h3 className="font-serif-luxury text-3xl md:text-4xl text-[#141414]">
              House Access & Privileges
            </h3>
            <p className="text-sm text-[#141414]/70 font-light mt-3 leading-relaxed">
              Every detail of HUDORIAN is engineered to ensure seamless sanctuary access across continents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xs border border-[#E8E2D8] space-y-3">
              <Compass className="w-6 h-6 text-[#96754B]" />
              <h4 className="font-serif-luxury text-xl text-[#141414]">Global House Reciprocity</h4>
              <p className="text-xs text-black/70 font-light leading-relaxed">
                Seamless admittance into member salons, private dining spaces, and wellness sanctuaries worldwide.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xs border border-[#E8E2D8] space-y-3">
              <Award className="w-6 h-6 text-[#96754B]" />
              <h4 className="font-serif-luxury text-xl text-[#141414]">Bespoke Stay Upgrades</h4>
              <p className="text-xs text-black/70 font-light leading-relaxed">
                Preferred nightly rates, priority release windows on peak dates, and complimentary room upgrades.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xs border border-[#E8E2D8] space-y-3">
              <Shield className="w-6 h-6 text-[#96754B]" />
              <h4 className="font-serif-luxury text-xl text-[#141414]">Cryptographic Pass Vault</h4>
              <p className="text-xs text-black/70 font-light leading-relaxed">
                HMAC-secured digital membership pass with live dynamic tokens for discreet concierge validation.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div id="faq" className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <span className="text-xs uppercase tracking-[0.25em] text-[#96754B] font-semibold block mb-2">
              FREQUENT INQUIRIES
            </span>
            <h3 className="font-serif-luxury text-3xl text-[#141414]">
              Membership Questions
            </h3>
          </div>

          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="p-6 bg-white rounded-xs border border-[#E8E2D8] space-y-2">
                <h4 className="font-serif-luxury text-lg text-[#141414] font-medium flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#96754B] shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs text-black/70 font-light leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

