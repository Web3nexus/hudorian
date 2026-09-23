'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, ShieldCheck, Lock } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';

export default function MemberProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getMe()
      .then((res) => {
        if (res.user) {
          setName(res.user.name || '');
          setEmail(res.user.email || '');
          setPhone(res.user.phone || '');
          setCity(res.user.city || '');
          setCountry(res.user.country || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await api.updateProfile({
        name,
        phone,
        city,
        country,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
      });

      setStatusMsg(res.message || 'Profile and security preferences updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setStatusMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-4xl mx-auto w-full">
        <Link
          href="/member"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-black/60 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="border-b border-[#E8E2D8] pb-6 mb-12">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
            MEMBER SETTINGS
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#141414]">
            Profile & Security
          </h1>
        </div>

        {statusMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs">
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleUpdate} className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-8">
          {/* Identity */}
          <div className="space-y-4">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Member Identity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full p-3 bg-stone-100 border border-[#E8E2D8] rounded-xs text-xs text-black/50"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Primary City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="pt-6 border-t border-[#E8E2D8] space-y-4">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Password Security</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

