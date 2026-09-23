'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, KeyRound, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function SecureGateLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('admin@hudorian.com');
  const [password, setPassword] = useState('password123');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.adminLogin(email, password);
      if (res.requires_mfa && res.mfa_token) {
        setMfaToken(res.mfa_token);
        setStep('mfa');
      } else {
        router.push('/securegate');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid SecureGate administrator credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaToken) return;
    setLoading(true);
    setError(null);

    try {
      await api.adminVerifyMfa(mfaToken, mfaCode);
      router.push('/securegate');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid MFA verification code.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminLogin('admin@hudorian.com', 'password123');
      if (res.requires_mfa && res.mfa_token) {
        await api.adminVerifyMfa(res.mfa_token, '888888');
        router.push('/securegate');
      } else {
        router.push('/securegate');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Quick sign-in failed. Please verify credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#FAF8F5] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#B8976C]/30 selection:text-white">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#B8976C]/10 via-[#B8976C]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 bg-[#101014]/90 backdrop-blur-2xl p-8 md:p-10 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 relative mb-2 flex items-center justify-center">
            <img
              src="/images/hudorian-seal.png"
              alt="HUDORIAN Royal Seal"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8976C]/15 border border-[#B8976C]/30 text-[#C5A880] text-[11px] font-mono font-medium uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>SecureGate Checkpoint</span>
          </div>
          <h1 className="font-serif-luxury text-3xl md:text-4xl tracking-[0.25em] uppercase text-white font-medium">
            HUDORIAN
          </h1>
          <p className="text-xs text-white/50 font-light max-w-xs mx-auto leading-relaxed">
            Restricted administrative command center. Multi-factor cryptographic clearance required.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Credentials */}
        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-2">
                Administrator Identifier
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hudorian.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition placeholder:text-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-2">
                Clearance Keyphrase
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] transition placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:opacity-95 transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#B8976C]/10 disabled:opacity-50"
            >
              {loading ? (
                <span>Validating Clearance...</span>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: MFA */
          <form onSubmit={handleMfaVerify} className="space-y-6">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-center space-y-2">
              <KeyRound className="w-6 h-6 text-[#C5A880] mx-auto" />
              <p className="text-xs text-white/80 font-medium">TOTP Token Verification</p>
              <p className="text-[11px] text-white/50">
                Enter the 6-digit cryptographic security code from your authenticator app.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-2 text-center">
                6-Digit Security Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="888888"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-[#C5A880] transition"
              />
              <p className="text-[10px] text-white/40 text-center mt-2 font-mono">
                Default sandbox bypass code: <span className="text-[#C5A880]">888888</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-[0.2em] hover:opacity-95 transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <span>Verifying Hardware MFA...</span> : <span>Confirm Clearance</span>}
            </button>
          </form>
        )}

        {/* 1-Click Demo Shortcut */}
        <div className="pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 hover:text-white text-xs font-mono tracking-wider transition flex items-center justify-center gap-2 group"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#C5A880] group-hover:scale-110 transition" />
            <span>1-Click Executive Demo Access</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] font-mono text-white/30 space-y-1">
          <p>HUDORIAN Security Architecture // SecureGate v2.6</p>
          <p>All administrative requests are cryptographically audited.</p>
        </div>
      </div>
    </div>
  );
}

