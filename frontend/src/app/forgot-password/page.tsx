'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to dispatch reset instructions. Please verify your email.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow flex items-center justify-center py-36 px-6">
        <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto mb-2 relative flex items-center justify-center">
              <img
                src="/images/hudorian-seal.png"
                alt="HUDORIAN Royal Seal"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <span className="text-[11px] uppercase tracking-[0.25em] font-mono text-[#96754B] block">
              Security Protocol
            </span>
            <h1 className="font-serif-luxury text-3xl font-light text-[#141414]">
              Reset Keyphrase
            </h1>
            <p className="text-xs text-[#141414]/60 font-light leading-relaxed">
              Enter the email address registered with your HUDORIAN member dossier to receive a secure single-use recovery link.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-xs bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-serif-luxury text-lg font-medium text-emerald-900">
                  Recovery Dispatch Initiated
                </h3>
                <p className="text-xs text-emerald-800/80 font-light leading-relaxed">
                  If <strong>{email}</strong> is recorded in our registry, a secure clearance link has been dispatched. Please review your inbox and spam folder.
                </p>
                <p className="text-[11px] font-mono text-emerald-700/70 pt-1">
                  Valid for 60 minutes from issuance.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold text-[#141414] hover:text-[#96754B] transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-black/60 mb-2 font-medium">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patron@hudorian.com"
                    className="w-full p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-none focus:border-[#96754B] transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Dispatching Protocol...</span>
                ) : (
                  <>
                    <span>Dispatch Recovery Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-[#E8E2D8] text-center">
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-1.5 text-xs text-black/60 hover:text-black font-light transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Remembered your keyphrase? Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

