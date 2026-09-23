'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, QrCode } from 'lucide-react';
import { api } from '@/lib/api';

interface DigitalMemberCardProps {
  initialData?: {
    name: string;
    membership_number: string;
    plan_name: string;
    status: string;
    expires_at?: string;
  };
}

export default function DigitalMemberCard({ initialData }: DigitalMemberCardProps) {
  const [cardData, setCardData] = useState<{
    member: { name: string; membership_number: string; plan_name: string; status: string; expires_at?: string };
    card: { token: string; expires_at: string; verify_url: string };
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const fetchCard = () => {
    setLoading(true);
    api.getDigitalCard()
      .then((res) => {
        setCardData(res);
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic card, using initial info:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCard();
    // Auto-refresh token every 5 minutes
    const interval = setInterval(fetchCard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const memberName = cardData?.member?.name || initialData?.name || 'Member';
  const memberNumber = cardData?.member?.membership_number || initialData?.membership_number || 'Awaiting Allocation';
  const planName = cardData?.member?.plan_name || initialData?.plan_name || 'Membership Privilege';
  const status = cardData?.member?.status || initialData?.status || 'Active';
  const expiresAt = cardData?.member?.expires_at || initialData?.expires_at || 'Annual Renewal';

  const testVerify = async () => {
    if (!cardData?.card?.token) return;
    try {
      const res = await api.verifyCard(cardData.card.token);
      setVerificationResult(`✓ House Concierge: ${res.message}`);
    } catch {
      setVerificationResult('Verification failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Physical-Feel Luxury Card Container */}
      <div className="relative aspect-16/10 rounded-2xl bg-linear-to-tr from-[#141414] via-[#222222] to-[#141414] text-[#FAF8F5] p-7 shadow-2xl border border-white/15 overflow-hidden flex flex-col justify-between">
        {/* Subtle Gold Foil Accent Ribbon */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-linear-to-bl from-[#C5A880]/25 via-transparent to-transparent pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="font-serif-luxury text-xl md:text-2xl font-light tracking-[0.3em] uppercase block">
              HUDORIAN
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-medium">
              Private Members Club
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] uppercase tracking-wider font-semibold border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white">{status}</span>
          </div>
        </div>

        {/* Card Center: Plan Designation & Holographic Chip */}
        <div className="relative z-10 flex items-center justify-between my-2">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 block">Tier Privilege</span>
            <p className="font-serif-luxury text-lg md:text-xl text-[#FAF8F5] tracking-wide">
              {planName}
            </p>
          </div>

          {/* Micro QR / Concierge Code Icon */}
          <div className="p-2.5 rounded-xs bg-white text-black flex flex-col items-center justify-center shadow-md">
            <QrCode className="w-9 h-9" />
          </div>
        </div>

        {/* Card Footer: Member Name, Number, Expiration */}
        <div className="relative z-10 flex items-end justify-between border-t border-white/15 pt-4 text-xs">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 block">Member</span>
            <p className="font-medium tracking-wide text-white">{memberName}</p>
          </div>

          <div className="text-center">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 block">Member No.</span>
            <p className="font-mono text-white/90 tracking-wider text-[11px]">{memberNumber}</p>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 block">Expires</span>
            <p className="font-mono text-white/80 text-[11px]">{expiresAt}</p>
          </div>
        </div>
      </div>

      {/* Security Actions & Verification Scanner Preview */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <button
          onClick={fetchCard}
          disabled={loading}
          className="flex items-center gap-2 text-black/60 hover:text-black font-medium transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh cryptographic token</span>
        </button>

        <button
          onClick={testVerify}
          className="px-4 py-2 rounded-full border border-black/20 bg-white hover:bg-black hover:text-white transition duration-300 text-xs font-medium"
        >
          Test Concierge Scan
        </button>
      </div>

      {verificationResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{verificationResult}</span>
        </div>
      )}
    </div>
  );
}

