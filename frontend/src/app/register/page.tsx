'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, ArrowRight, Lock } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';

function RegisterContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    country: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.register(formData);
      router.push('/member');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-40 pb-28 px-6 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-md max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#96754B]">
              RESIDENCE ENROLLMENT
            </span>
            <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#141414]">
              Create Patron Account
            </h1>
            <p className="text-xs text-black/60 font-light max-w-sm mx-auto">
              Register to access private estate reserves, concierge bookings, and your sanctuary credentials.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Lord / Lady / Alexander Montgomery"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="alexander@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="London, Geneva, Lagos..."
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="United Kingdom, Nigeria..."
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+44 20 7946 0991"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition duration-300 shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Enroll Account'}
              </button>
            </div>
          </form>

          {/* Candidacy Banner */}
          <div className="p-4 bg-[#F4EFEA] rounded-xs text-xs text-black/70 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#96754B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-black block">Seeking Official Club Fellowship?</span>
              <p className="text-[11px] leading-relaxed">
                If you wish to apply for formal admission across House tiers (Resident, Global House, Founder Patron), submit a full candidate dossier.
              </p>
              <Link
                href="/membership/apply"
                className="inline-flex items-center gap-1 font-semibold text-black hover:text-[#96754B] pt-1"
              >
                Apply for Full Candidacy →
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2D8] text-center space-y-2 text-xs">
            <p className="text-black/60 font-light">
              Already have an account?{' '}
              <Link href="/signin" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
