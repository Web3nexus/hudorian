'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/member';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.login(email, password);
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-40 pb-28 px-6 flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-md max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-[#96754B]">
              PRIVATE RESIDENCE ACCESS
            </span>
            <h1 className="font-serif-luxury text-3xl md:text-4xl text-[#141414]">
              Member Portal
            </h1>
            <p className="text-xs text-black/60 font-light">
              Enter your credentials to access your Digital Member Card, Stays, and Bookings.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] text-[#96754B] hover:underline">
                  Forgot Keyphrase?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition duration-300 shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#E8E2D8] text-center space-y-2 text-xs">
            <p className="text-black/60 font-light">
              Not yet a member?{' '}
              <Link href="/register" className="font-semibold text-black hover:underline">
                Create an account
              </Link>
              {' '}or{' '}
              <Link href="/membership/apply" className="font-semibold text-[#96754B] hover:underline">
                Apply for candidacy
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

