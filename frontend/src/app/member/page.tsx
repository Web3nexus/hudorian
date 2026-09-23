'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Calendar, CreditCard, User as UserIcon, LogOut, ArrowRight, Building2 } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import DigitalMemberCard from '@/components/member/DigitalMemberCard';
import { api } from '@/lib/api';
import { User } from '@/types';

export default function MemberDashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);

  const [upcomingStays, setUpcomingStays] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hudorian_token');
    if (!token) {
      router.push('/signin?redirect=/member');
      return;
    }

    // Load member profile & dashboard
    api.getMe()
      .then((res) => {
        if (res.user) setUserData(res.user);
      })
      .catch(() => {
        // Fallback to local stored user
        const stored = localStorage.getItem('hudorian_user');
        if (stored) setUserData(JSON.parse(stored));
      });

    api.getMemberBookings()
      .then((res) => {
        if (res.stays) setUpcomingStays(res.stays.slice(0, 2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('hudorian_token');
    localStorage.removeItem('hudorian_user');
    router.push('/');
  };

  const memberName = userData?.name || (loading ? 'Loading...' : 'Member');
  const planName = userData?.member?.plan?.name || (loading ? '...' : (userData?.role === 'admin' ? 'Administrator Clearance' : 'Pending Membership'));
  const memberNumber = userData?.member?.membership_number || (loading ? '...' : 'Awaiting Allocation');

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-7xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E8E2D8] pb-10 mb-14 gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
              RESIDENCY DASHBOARD
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#141414] leading-tight">
              Welcome Back, {memberName}
            </h1>
            <p className="text-xs text-black/60 font-light mt-2">
              {planName} • Member #{memberNumber}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/member/profile"
              className="px-5 py-2.5 rounded-full border border-black/20 text-xs uppercase tracking-wider font-medium hover:bg-black hover:text-white transition"
            >
              Profile Settings
            </Link>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full border border-black/20 hover:bg-rose-50 text-rose-700 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Digital Member Card Pass */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#141414]">
                  Digital Member Pass
                </span>
                <span className="text-[11px] text-[#96754B] font-medium">Valid Across All Houses</span>
              </div>

              <DigitalMemberCard
                initialData={{
                  name: userData?.name || (loading ? 'Loading...' : 'Member'),
                  membership_number: userData?.member?.membership_number || 'Awaiting Allocation',
                  plan_name: userData?.member?.plan?.name || (userData?.role === 'admin' ? 'Administrator' : 'Pending Membership'),
                  status: userData?.member?.status || (userData?.role === 'admin' ? 'active' : 'pending'),
                  expires_at: userData?.member?.expires_at || undefined,
                }}
              />
            </div>
          </div>

          {/* Right Column: Quick Navigation & Stays */}
          <div className="lg:col-span-7 space-y-8">
            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/houses"
                className="p-5 bg-white rounded-xs border border-[#E8E2D8] shadow-xs hover:border-black transition duration-300 text-center space-y-2 group"
              >
                <Compass className="w-5 h-5 mx-auto text-[#96754B] group-hover:scale-110 transition" />
                <span className="text-xs uppercase tracking-wider font-semibold block text-[#141414]">
                  Houses
                </span>
              </Link>

              <Link
                href="/stays"
                className="p-5 bg-white rounded-xs border border-[#E8E2D8] shadow-xs hover:border-black transition duration-300 text-center space-y-2 group"
              >
                <Building2 className="w-5 h-5 mx-auto text-[#96754B] group-hover:scale-110 transition" />
                <span className="text-xs uppercase tracking-wider font-semibold block text-[#141414]">
                  Book Stay
                </span>
              </Link>

              <Link
                href="/experiences"
                className="p-5 bg-white rounded-xs border border-[#E8E2D8] shadow-xs hover:border-black transition duration-300 text-center space-y-2 group"
              >
                <Calendar className="w-5 h-5 mx-auto text-[#96754B] group-hover:scale-110 transition" />
                <span className="text-xs uppercase tracking-wider font-semibold block text-[#141414]">
                  Events
                </span>
              </Link>

              <Link
                href="/member/payments"
                className="p-5 bg-white rounded-xs border border-[#E8E2D8] shadow-xs hover:border-black transition duration-300 text-center space-y-2 group"
              >
                <CreditCard className="w-5 h-5 mx-auto text-[#96754B] group-hover:scale-110 transition" />
                <span className="text-xs uppercase tracking-wider font-semibold block text-[#141414]">
                  Billing
                </span>
              </Link>
            </div>

            {/* Upcoming Reservations */}
            <div className="bg-white p-8 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4">
                <h3 className="font-serif-luxury text-2xl text-[#141414]">
                  Upcoming Stays & Itineraries
                </h3>
                <Link
                  href="/member/bookings"
                  className="text-xs uppercase tracking-wider text-[#96754B] font-semibold hover:underline"
                >
                  All Bookings →
                </Link>
              </div>

              {upcomingStays.length > 0 ? (
                <div className="space-y-4">
                  {upcomingStays.map((stay: any) => (
                    <div
                      key={stay.id}
                      className="p-5 bg-[#FAF8F5] rounded-xs border border-[#E8E2D8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#96754B] font-semibold block">
                          {stay.house?.name || 'HUDORIAN Sanctuary'}
                        </span>
                        <h4 className="font-serif-luxury text-xl text-[#141414]">
                          {stay.room?.name || 'Horizon Suite'}
                        </h4>
                        <p className="text-xs text-black/60 font-light mt-1">
                          {stay.check_in} — {stay.check_out} ({stay.total_nights} nights)
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-semibold rounded-full">
                          {stay.status}
                        </span>
                        <p className="text-xs font-mono text-black/60 mt-2">Ref: {stay.reservation_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-4">
                  <p className="text-sm text-black/60 font-light">
                    You currently have no scheduled stays.
                  </p>
                  <Link
                    href="/stays"
                    className="inline-block px-6 py-2.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#B8976C] transition"
                  >
                    Reserve a Suite
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

