'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, Lock, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing security token. Please request a new recovery link.');
      return;
    }

    if (password.length < 8) {
      setError('Keyphrase must be at least 8 characters in length.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Keyphrase confirmations do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset keyphrase. The link may have expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Cryptographic Clearance
        </span>
        <h1 className="font-serif-luxury text-3xl font-light text-[#141414]">
          Set New Keyphrase
        </h1>
        <p className="text-xs text-[#141414]/60 font-light leading-relaxed">
          Establish a new clearance password for your HUDORIAN membership account.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="space-y-6 text-center">
          <div className="p-6 rounded-xs bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-serif-luxury text-lg font-medium text-emerald-900">
              Keyphrase Established
            </h3>
            <p className="text-xs text-emerald-800/80 font-light leading-relaxed">
              Your security clearance keyphrase has been updated successfully. All active sessions have been terminated.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/signin"
              className="w-full py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md inline-flex items-center justify-center gap-2"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-black/60 mb-2 font-medium">
              Registered Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patron@hudorian.com"
              className="w-full p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-none focus:border-[#96754B] transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-black/60 mb-2 font-medium">
              New Keyphrase (Min 8 Characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-none focus:border-[#96754B] transition"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-black/60 mb-2 font-medium">
              Confirm New Keyphrase
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-none focus:border-[#96754B] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#141414] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#96754B] transition duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Updating Credentials...</span>
            ) : (
              <>
                <span>Confirm & Update Keyphrase</span>
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
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow flex items-center justify-center py-36 px-6">
        <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading security checkpoint...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

