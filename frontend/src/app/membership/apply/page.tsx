'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { MembershipPlan } from '@/types';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

const INTERESTS_OPTIONS = [
  'Architecture & Design',
  'Contemporary Art',
  'Fine Wine & Viticulture',
  'Open-Fire Gastronomy',
  'Equestrian Pursuits',
  'Somatic Wellness',
  'Ocean Sailing',
  'Literature & Philosophy',
];

function MembershipApplicationContent() {
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get('plan');
  const { currency, formatPrice, rateProvider, refreshRates } = useCurrency();

  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [paymentSettlement, setPaymentSettlement] = useState<'review_first' | 'flutterwave' | 'paystack' | 'manual'>('review_first');
  const [wireReference, setWireReference] = useState('');
  const [wireBank, setWireBank] = useState('');
  const [wireNotes, setWireNotes] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    membership_plan_id: initialPlanId ? parseInt(initialPlanId) : 0,
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    country: '',
    profession: '',
    company: '',
    bio: '',
    social_profile_url: '',
    interests: [] as string[],
  });

  useEffect(() => {
    // Load payment config
    api.getPaymentConfig()
      .then((res) => {
        if (res && res.data) setPaymentConfig(res.data);
      })
      .catch(() => {});
    // Load plans from API
    api.getMembershipPlans()
      .then((res) => {
        if (res.data) {
          setPlans(res.data);
          setFormData((prev) => {
            const hasValidPlan = res.data.some((p) => p.id === prev.membership_plan_id);
            if (!hasValidPlan && res.data.length > 0) {
              return { ...prev, membership_plan_id: res.data[0].id };
            }
            return prev;
          });
        }
      })
      .catch(() => {});

    // Restore saved progress from local storage if available
    const saved = localStorage.getItem('hudorian_app_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      localStorage.setItem('hudorian_app_progress', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleInterest = (interest: string) => {
    const exists = formData.interests.includes(interest);
    const updated = exists
      ? formData.interests.filter((i) => i !== interest)
      : [...formData.interests, interest];
    updateField('interests', updated);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setErrorMessage(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.submitApplication(formData);
      setSubmittedAppId(res.application.id);
      localStorage.removeItem('hudorian_app_progress');

      // If instant settlement was chosen, initialize payment
      if (paymentSettlement !== 'review_first') {
        const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/member/payments` : '';
        const payRes = await api.initializePayment({
          gateway: paymentSettlement,
          membership_plan_id: formData.membership_plan_id,
          currency: currency,
          redirect_url: currentUrl,
          email: formData.email,
          name: `${formData.first_name} ${formData.last_name}`,
          phone: formData.phone,
          transfer_reference: wireReference || undefined,
          sender_bank: wireBank || undefined,
          proof_notes: wireNotes || undefined,
        });

        if (paymentSettlement === 'flutterwave' && payRes.checkout_url) {
          window.location.href = payRes.checkout_url;
          return;
        }
        if (paymentSettlement === 'paystack' && payRes.authorization_url) {
          window.location.href = payRes.authorization_url;
          return;
        }
      }

      setStep(7); // Confirmation
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Application submission failed. Please verify your details.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === formData.membership_plan_id);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-4xl mx-auto w-full">
        {/* Progress Bar & Header */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
            MEMBERSHIP APPLICATION
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl font-light text-[#141414] tracking-tight">
            Candidate Dossier
          </h1>
          <p className="text-xs text-black/60 font-light mt-2">
            Step {step} of 6 • Confidential Membership Council Submission
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-12 max-w-xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                  step === s
                    ? 'bg-[#141414] text-white'
                    : step > s
                    ? 'bg-[#B8976C] text-white'
                    : 'bg-[#E8E2D8] text-black/50'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 6 && (
                <div
                  className={`w-6 sm:w-12 h-0.5 transition ${
                    step > s ? 'bg-[#B8976C]' : 'bg-[#E8E2D8]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xs text-xs">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Account Credentials */}
        {step === 1 && (
          <form onSubmit={handleNext} className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Step 1 — Member Account</h2>
            <p className="text-xs text-black/60">
              Provide your primary email address. This will be linked to your member portal and digital card.
            </p>

            <div className="space-y-4">
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
                  Create Member Password *
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
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition"
              >
                Continue to Personal Information →
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <form onSubmit={handleNext} className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Step 2 — Personal Profile</h2>
            <p className="text-xs text-black/60">
              Basic identification for House concierge and communications.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Primary Phone</label>
                <input
                  type="tel"
                  placeholder="+234 803 123 4567"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">City of Residence *</label>
                <input
                  type="text"
                  required
                  placeholder="Lagos"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Country *</label>
                <input
                  type="text"
                  required
                  placeholder="Nigeria"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-black/20 text-xs uppercase tracking-wider hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition"
              >
                Professional Experience →
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Professional Information */}
        {step === 3 && (
          <form onSubmit={handleNext} className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Step 3 — Professional Pursuits</h2>
            <p className="text-xs text-black/60">
              HUDORIAN brings together creative pioneers, enterprise builders, and cultural practitioners.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Profession / Discipline *</label>
                <input
                  type="text"
                  required
                  placeholder="Architect / Film Producer / Venture Partner"
                  value={formData.profession}
                  onChange={(e) => updateField('profession', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">Company / Studio</label>
                <input
                  type="text"
                  placeholder="Studio Vance Design"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                Candidate Bio & Creative Vision *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Share a brief overview of your background, your creative or professional focus, and why you feel HUDORIAN aligns with your lifestyle..."
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-1">
                Public Social Profile or Portfolio (Instagram / LinkedIn / Website)
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/yourhandle"
                value={formData.social_profile_url}
                onChange={(e) => updateField('social_profile_url', e.target.value)}
                className="w-full p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-xs focus:outline-hidden"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-black/20 text-xs uppercase tracking-wider hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition"
              >
                Select Interests →
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <form onSubmit={handleNext} className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Step 4 — Passions & Fellowships</h2>
            <p className="text-xs text-black/60">
              Select the cultural realms that matter most to you to assist our event curations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {INTERESTS_OPTIONS.map((interest) => {
                const selected = formData.interests.includes(interest);
                return (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`p-3.5 rounded-xs text-xs text-left font-medium border flex items-center justify-between transition ${
                      selected
                        ? 'border-[#141414] bg-[#141414] text-white'
                        : 'border-[#E8E2D8] bg-[#FAF8F5] text-black hover:border-black/40'
                    }`}
                  >
                    <span>{interest}</span>
                    {selected && <Check className="w-4 h-4 text-[#B8976C]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-black/20 text-xs uppercase tracking-wider hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition"
              >
                Choose Membership Tier →
              </button>
            </div>
          </form>
        )}

        {/* Step 5: Membership Plan Selection */}
        {step === 5 && (
          <form onSubmit={handleNext} className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Step 5 — Select Membership Tier</h2>
            <p className="text-xs text-black/60">
              Confirm your preferred tier. Membership fees are only charged after official committee approval.
            </p>

            <div className="space-y-4">
              {plans.map((p) => (
                <label
                  key={p.id}
                  className={`p-5 rounded-xs border block cursor-pointer transition ${
                    formData.membership_plan_id === p.id
                      ? 'border-[#141414] bg-[#F4EFEA]'
                      : 'border-[#E8E2D8] hover:border-black/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        checked={formData.membership_plan_id === p.id}
                        onChange={() => updateField('membership_plan_id', p.id)}
                        className="accent-black"
                      />
                      <div>
                        <h4 className="font-serif-luxury text-xl text-[#141414]">{p.name}</h4>
                        <p className="text-xs text-black/60 font-light mt-0.5">{p.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-serif-luxury text-xl">{formatPrice(p.price)}</span>
                      <span className="text-[10px] block text-black/50">/ {p.billing_period}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-black/20 text-xs uppercase tracking-wider hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#B8976C] transition"
              >
                Review & Submit Dossier →
              </button>
            </div>
          </form>
        )}

        {/* Step 6: Final Review & Submission */}
        {step === 6 && (
          <div className="bg-white p-8 md:p-12 rounded-xs border border-[#E8E2D8] shadow-xs space-y-6">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Step 6 — Dossier Review</h2>
            <p className="text-xs text-black/60">
              Please review your candidate submission before submitting it to the Membership Council.
            </p>

            <div className="space-y-4 text-xs divide-y divide-[#E8E2D8] bg-[#FAF8F5] p-6 rounded-xs">
              <div className="flex justify-between py-2">
                <span className="text-black/50 uppercase tracking-wider">Candidate</span>
                <span className="font-semibold text-black">{formData.first_name} {formData.last_name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-black/50 uppercase tracking-wider">Email</span>
                <span className="font-semibold text-black">{formData.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-black/50 uppercase tracking-wider">Location</span>
                <span className="font-semibold text-black">{formData.city}, {formData.country}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-black/50 uppercase tracking-wider">Profession</span>
                <span className="font-semibold text-black">{formData.profession} ({formData.company || 'Independent'})</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-black/50 uppercase tracking-wider">Requested Tier</span>
                <span className="font-semibold text-[#96754B]">
                  {selectedPlan?.name} {selectedPlan ? `(${formatPrice(selectedPlan.price)}/${selectedPlan.billing_period})` : ''}
                </span>
              </div>
              <div className="py-2 space-y-1">
                <span className="text-black/50 uppercase tracking-wider block">Bio</span>
                <p className="text-black/80 font-light leading-relaxed">{formData.bio}</p>
              </div>
            </div>

            {/* Payment Settlement Preference */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-wider text-black/60 font-medium block">
                Treasury Settlement Preference
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  onClick={() => setPaymentSettlement('review_first')}
                  className={`p-3.5 rounded-xs border block cursor-pointer transition ${
                    paymentSettlement === 'review_first'
                      ? 'border-[#141414] bg-[#F4EFEA]'
                      : 'border-[#E8E2D8] bg-[#FAF8F5] hover:border-black/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="settlement"
                      checked={paymentSettlement === 'review_first'}
                      onChange={() => setPaymentSettlement('review_first')}
                      className="accent-black"
                    />
                    <span className="font-semibold text-black">Committee Review First</span>
                  </div>
                  <p className="text-[11px] text-black/60 mt-1 pl-5">
                    Dues will only be charged after official Admissions Committee confirmation.
                  </p>
                </label>

                {paymentConfig?.flutterwave?.enabled !== false && (
                  <label
                    onClick={() => setPaymentSettlement('flutterwave')}
                    className={`p-3.5 rounded-xs border block cursor-pointer transition ${
                      paymentSettlement === 'flutterwave'
                        ? 'border-[#141414] bg-[#F4EFEA]'
                        : 'border-[#E8E2D8] bg-[#FAF8F5] hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="settlement"
                        checked={paymentSettlement === 'flutterwave'}
                        onChange={() => setPaymentSettlement('flutterwave')}
                        className="accent-black"
                      />
                      <span className="font-semibold text-black">Flutterwave Instant</span>
                    </div>
                    <p className="text-[11px] text-black/60 mt-1 pl-5">
                      Settle membership dues now via Card, Mobile Money, or Bank Transfer.
                    </p>
                  </label>
                )}

                {paymentConfig?.paystack?.enabled !== false && (
                  <label
                    onClick={() => setPaymentSettlement('paystack')}
                    className={`p-3.5 rounded-xs border block cursor-pointer transition ${
                      paymentSettlement === 'paystack'
                        ? 'border-[#141414] bg-[#F4EFEA]'
                        : 'border-[#E8E2D8] bg-[#FAF8F5] hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="settlement"
                        checked={paymentSettlement === 'paystack'}
                        onChange={() => setPaymentSettlement('paystack')}
                        className="accent-black"
                      />
                      <span className="font-semibold text-black">Paystack Instant</span>
                    </div>
                    <p className="text-[11px] text-black/60 mt-1 pl-5">
                      Settle membership dues now via Card, Apple Pay, or USSD.
                    </p>
                  </label>
                )}

                {paymentConfig?.manual?.enabled !== false && (
                  <label
                    onClick={() => setPaymentSettlement('manual')}
                    className={`p-3.5 rounded-xs border block cursor-pointer transition ${
                      paymentSettlement === 'manual'
                        ? 'border-[#141414] bg-[#F4EFEA]'
                        : 'border-[#E8E2D8] bg-[#FAF8F5] hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="settlement"
                        checked={paymentSettlement === 'manual'}
                        onChange={() => setPaymentSettlement('manual')}
                        className="accent-black"
                      />
                      <span className="font-semibold text-black">Manual Bank Wire</span>
                    </div>
                    <p className="text-[11px] text-black/60 mt-1 pl-5">
                      Direct wire to HUDORIAN Treasury with verification code.
                    </p>
                  </label>
                )}
              </div>

              {/* Dynamic Live Currency Conversion Rate Indicator */}
              {paymentSettlement !== 'review_first' && selectedPlan && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-[#F9F7F3] border border-[#E8E2D8] rounded-xs text-xs mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-black/60">Settlement Amount:</span>
                    <span className="font-serif-luxury text-sm font-semibold text-[#141414]">
                      {formatPrice(selectedPlan.price)}
                    </span>
                    <span className="text-[11px] text-black/50">({currency})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#DDD] text-[10px] tracking-wide text-black/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Conversion Engine: <strong className="font-medium text-black">
                        {paymentSettlement === 'manual' ? 'ExchangeRate-API (Live)' : paymentSettlement === 'flutterwave' ? 'Flutterwave Gateway FX' : 'Paystack Gateway FX'}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Manual Bank Wire Details if Selected */}
              {paymentSettlement === 'manual' && (
                <div className="bg-[#FAF8F5] p-4 rounded-xs border border-[#E8E2D8] space-y-3 text-xs mt-3">
                  <div className="space-y-1 font-mono text-[11px] text-black/80">
                    <div>Bank: <span className="font-semibold">{paymentConfig?.manual?.bank_name || 'Barclays Private Bank'}</span></div>
                    <div>Account: <span className="font-semibold">{paymentConfig?.manual?.account_name || 'HUDORIAN SANCTUARY LIMITED'}</span></div>
                    <div>IBAN: <span className="font-semibold">{paymentConfig?.manual?.iban || 'GB29BARC20000088291048'}</span></div>
                    <div>SWIFT / BIC: <span className="font-semibold">{paymentConfig?.manual?.swift_bic || 'BARCGB22'}</span></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-black/60 block mb-1">
                        Wire Transfer Reference Code *
                      </label>
                      <input
                        type="text"
                        required={paymentSettlement === 'manual'}
                        placeholder="e.g. WIRE-884920 or Full Name"
                        value={wireReference}
                        onChange={(e) => setWireReference(e.target.value)}
                        className="w-full p-2.5 rounded-xs bg-white border border-[#E8E2D8] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-black/60 block mb-1">
                        Sending Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UBS, Chase Private"
                        value={wireBank}
                        onChange={(e) => setWireBank(e.target.value)}
                        className="w-full p-2.5 rounded-xs bg-white border border-[#E8E2D8] text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F4EFEA] rounded-xs text-[11px] text-black/70 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#96754B] shrink-0 mt-0.5" />
              <span>
                {paymentSettlement === 'review_first'
                  ? 'By submitting, you agree to the HUDORIAN House Code and confirm that membership privileges will only be billed following committee approval.'
                  : 'By submitting, you authorize your membership dues settlement. Official digital pass and welcome dossier are issued upon Treasury confirmation.'}
              </span>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 rounded-full border border-black/20 text-xs uppercase tracking-wider hover:bg-black/5"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="px-10 py-4 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition disabled:opacity-50"
              >
                {submitting ? 'Transmitting Dossier...' : 'Submit Candidate Dossier'}
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Confirmation */}
        {step === 7 && (
          <div className="bg-white p-8 md:p-14 rounded-xs border border-[#E8E2D8] shadow-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-[#B8976C]" />
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#141414]">
              Dossier Transmitted Successfully
            </h2>

            <p className="text-sm text-black/75 max-w-lg mx-auto font-light leading-relaxed">
              Thank you, {formData.first_name}. Your candidacy (Reference #{submittedAppId}) has been assigned to the Membership Committee. You will receive an update at {formData.email}.
            </p>

            <div className="pt-6 flex justify-center gap-4">
              <Link
                href="/signin"
                className="px-8 py-3.5 rounded-full bg-[#141414] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#B8976C] transition"
              >
                Sign In to Member Portal
              </Link>
              <Link
                href="/"
                className="px-8 py-3.5 rounded-full border border-black/20 text-xs uppercase tracking-[0.2em] font-medium hover:bg-black/5 transition"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function MembershipApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">Loading...</div>}>
      <MembershipApplicationContent />
    </Suspense>
  );
}

