'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  Download,
  ShieldCheck,
  Landmark,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { MembershipPlan } from '@/types';

function MemberPaymentsContent() {
  const { currency, formatPrice, rateProvider, refreshRates } = useCurrency();
  const searchParams = useSearchParams();

  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
  const [selectedGateway, setSelectedGateway] = useState<'flutterwave' | 'paystack' | 'manual'>('flutterwave');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const handleGatewayChange = (gw: 'flutterwave' | 'paystack' | 'manual') => {
    setSelectedGateway(gw);
    refreshRates(gw);
  };

  // Manual Transfer Form Fields
  const [transferReference, setTransferReference] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchLedger = () => {
    setLoading(true);
    api.getMemberPayments()
      .then((res: any) => {
        if (res && res.data) setPayments(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLedger();

    api.getMembershipPlans()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setPlans(res.data);
          setSelectedPlanId(res.data[0].id);
        }
      })
      .catch((err) => console.warn('Could not load plans:', err));

    api.getPaymentConfig()
      .then((res) => {
        if (res.data) {
          setPaymentConfig(res.data);
          if (res.data.flutterwave?.enabled) setSelectedGateway('flutterwave');
          else if (res.data.paystack?.enabled) setSelectedGateway('paystack');
          else setSelectedGateway('manual');
        }
      })
      .catch((err) => console.warn('Could not load payment config:', err));

    // Handle return callbacks from Flutterwave or Paystack
    const flwTxId = searchParams.get('transaction_id') || searchParams.get('tx_ref');
    const pstkRef = searchParams.get('reference') || searchParams.get('trxref');
    const status = searchParams.get('status');

    if (flwTxId && (status === 'successful' || status === 'completed')) {
      api.verifyPayment({
        gateway: 'flutterwave',
        transaction_id: flwTxId,
      })
        .then(() => {
          setFeedbackMsg({
            type: 'success',
            text: 'Your payment via Flutterwave was verified. Membership dues recorded and active!',
          });
          fetchLedger();
        })
        .catch(() => {});
    } else if (pstkRef && (status === 'success' || !status)) {
      api.verifyPayment({
        gateway: 'paystack',
        reference: pstkRef,
      })
        .then(() => {
          setFeedbackMsg({
            type: 'success',
            text: 'Your payment via Paystack was verified. Membership dues recorded and active!',
          });
          fetchLedger();
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setFeedbackMsg(null);

    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';
      const res = await api.initializePayment({
        gateway: selectedGateway,
        membership_plan_id: selectedPlanId,
        currency: currency,
        redirect_url: currentUrl,
        transfer_reference: transferReference || undefined,
        sender_bank: senderBank || undefined,
        proof_notes: proofNotes || undefined,
      });

      if (selectedGateway === 'manual') {
        setFeedbackMsg({
          type: 'success',
          text: 'Your manual bank wire details have been submitted to HUDORIAN Treasury. Clearance will be reflected upon bank confirmation.',
        });
        setPayModalOpen(false);
        fetchLedger();
      } else if (selectedGateway === 'flutterwave' && res.checkout_url) {
        window.location.href = res.checkout_url;
      } else if (selectedGateway === 'paystack' && res.authorization_url) {
        window.location.href = res.authorization_url;
      } else {
        setFeedbackMsg({
          type: 'success',
          text: 'Payment initiated successfully.',
        });
        setPayModalOpen(false);
        fetchLedger();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to complete payment request.';
      setFeedbackMsg({ type: 'error', text: msg });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const pendingManual = payments.find((p) => p.status === 'pending' && p.provider === 'manual_transfer');

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28 px-6 md:px-10 max-w-6xl mx-auto w-full">
        <Link
          href="/member"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-black/60 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Member Dashboard
        </Link>

        {/* Header with Call to Action */}
        <div className="border-b border-[#E8E2D8] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
              FINANCIAL LEDGER & CLEARANCE
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#141414]">
              Membership Dues & Receipts
            </h1>
          </div>

          <button
            onClick={() => setPayModalOpen(true)}
            className="px-6 py-3 rounded-full bg-[#141414] hover:bg-[#B8976C] text-[#FAF8F5] text-xs uppercase tracking-[0.2em] font-medium transition duration-300 shadow-md flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-[#B8976C]" />
            Pay / Renew Dues
          </button>
        </div>

        {/* Notification Alert */}
        {feedbackMsg && (
          <div
            className={`mb-6 p-4 rounded-xs text-xs flex items-center gap-2 border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Pending Clearance Card */}
        {pendingManual && (
          <div className="mb-8 p-6 bg-amber-50/70 border border-amber-200/80 rounded-xs flex items-start gap-4">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <span className="font-semibold uppercase tracking-wider block">
                Wire Transfer Clearance Pending (Ref: {pendingManual.metadata?.transfer_reference || pendingManual.transaction_id})
              </span>
              <p className="font-light text-amber-800">
                Your manual bank transfer of {formatPrice(Number(pendingManual.amount))} is currently under review with the HUDORIAN Treasury. Once settled on our account ledger, your digital credentials and VAT invoice will be issued automatically.
              </p>
            </div>
          </div>
        )}

        {/* Payment History Table */}
        <div className="bg-white rounded-xs border border-[#E8E2D8] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#E8E2D8] flex items-center justify-between">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Transaction Records</h2>
            <span className="text-xs text-black/50">Protected by HUDORIAN Pay Vault</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-black/50 font-mono">Loading ledger...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-black/60 font-light">
              No transactions currently recorded. Click "Pay / Renew Dues" above to submit annual membership dues.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-black/60 uppercase tracking-wider border-b border-[#E8E2D8]">
                  <tr>
                    <th className="p-4">Transaction ID / Ref</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Provider / Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D8]">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="p-4 font-mono font-medium text-black">
                        <div>{p.transaction_id}</div>
                        {p.metadata?.transfer_reference && (
                          <div className="text-[10px] text-amber-800 font-mono">
                            Wire Ref: {p.metadata.transfer_reference}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-serif-luxury text-base text-black">
                        {formatPrice(Number(p.amount))}
                      </td>
                      <td className="p-4">
                        <span className="uppercase text-[11px] font-mono px-2 py-0.5 rounded-xs bg-stone-100 text-stone-700">
                          {p.provider === 'manual_transfer' ? 'Manual Bank Wire' : p.provider}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            p.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : p.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-black/60">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {p.status === 'paid' ? (
                          <button
                            onClick={() => alert(`Official VAT Invoice downloaded for transaction ${p.transaction_id}`)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#96754B] font-semibold hover:underline"
                          >
                            <Download className="w-3 h-3" /> PDF Receipt
                          </button>
                        ) : (
                          <span className="text-[11px] text-black/40 italic">Awaiting clearance</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Pay Membership Dues Modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#96754B] font-semibold block">
                  TREASURY SETTLEMENT
                </span>
                <h3 className="font-serif-luxury text-2xl text-[#141414]">Annual Membership Contribution</h3>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-black/50 hover:text-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-6">
              {/* Step 1: Select Plan Tier */}
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-2">
                  Select Membership Tier
                </label>
                <div className="space-y-2">
                  {plans.map((pl) => (
                    <label
                      key={pl.id}
                      onClick={() => setSelectedPlanId(pl.id)}
                      className={`p-3.5 rounded-xs border block cursor-pointer transition ${
                        selectedPlanId === pl.id
                          ? 'border-[#141414] bg-white shadow-xs'
                          : 'border-[#E8E2D8] bg-[#FAF8F5] hover:border-black/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="membership_tier"
                            checked={selectedPlanId === pl.id}
                            onChange={() => setSelectedPlanId(pl.id)}
                            className="accent-black"
                          />
                          <span className="font-serif-luxury text-sm font-medium text-black">{pl.name}</span>
                        </div>
                        <span className="font-serif-luxury text-sm text-[#96754B] font-semibold">
                          {formatPrice(Number(pl.price))} / {pl.billing_period}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Payment Gateway */}
              <div>
                <label className="text-xs uppercase tracking-wider text-black/60 font-medium block mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {paymentConfig?.flutterwave?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => handleGatewayChange('flutterwave')}
                      className={`p-3 rounded-xs border text-left transition ${
                        selectedGateway === 'flutterwave'
                          ? 'border-[#141414] bg-[#141414] text-white'
                          : 'border-[#E8E2D8] bg-white text-black hover:border-black/30'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Flutterwave</span>
                      <span className="text-[10px] opacity-75">Cards, Mobile, Transfer</span>
                    </button>
                  )}

                  {paymentConfig?.paystack?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => handleGatewayChange('paystack')}
                      className={`p-3 rounded-xs border text-left transition ${
                        selectedGateway === 'paystack'
                          ? 'border-[#141414] bg-[#141414] text-white'
                          : 'border-[#E8E2D8] bg-white text-black hover:border-black/30'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Paystack</span>
                      <span className="text-[10px] opacity-75">Cards, Apple Pay, USSD</span>
                    </button>
                  )}

                  {paymentConfig?.manual?.enabled !== false && (
                    <button
                      type="button"
                      onClick={() => handleGatewayChange('manual')}
                      className={`p-3 rounded-xs border text-left transition ${
                        selectedGateway === 'manual'
                          ? 'border-[#141414] bg-[#141414] text-white'
                          : 'border-[#E8E2D8] bg-white text-black hover:border-black/30'
                      }`}
                    >
                      <span className="block text-xs font-semibold">Manual Wire</span>
                      <span className="text-[10px] opacity-75">Direct Bank Wire</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Bank Wire Instructions & Form */}
              {selectedGateway === 'manual' && (
                <div className="bg-white p-5 rounded-xs border border-[#E8E2D8] space-y-4 text-xs">
                  <div className="flex items-center gap-2 border-b border-[#E8E2D8] pb-2 text-black/80 font-medium">
                    <Landmark className="w-4 h-4 text-[#96754B]" />
                    <span>HUDORIAN Treasury Banking Coordinates</span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px] bg-[#FAF8F5] p-3 rounded-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-black/50">Bank:</span>
                      <span className="text-black font-semibold">
                        {paymentConfig?.manual?.bank_name || 'Coutts & Co / Barclays Private Bank'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-black/50">Beneficiary:</span>
                      <span className="text-black font-semibold">
                        {paymentConfig?.manual?.account_name || 'HUDORIAN SANCTUARY LIMITED'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-black/50">IBAN:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(paymentConfig?.manual?.iban || 'GB29BARC20000088291048', 'iban')}
                        className="inline-flex items-center gap-1 font-semibold text-black hover:text-[#96754B]"
                      >
                        <span>{paymentConfig?.manual?.iban || 'GB29BARC20000088291048'}</span>
                        {copiedField === 'iban' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-black/40" />}
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-black/50">SWIFT / BIC:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(paymentConfig?.manual?.swift_bic || 'BARCGB22', 'bic')}
                        className="inline-flex items-center gap-1 font-semibold text-black hover:text-[#96754B]"
                      >
                        <span>{paymentConfig?.manual?.swift_bic || 'BARCGB22'}</span>
                        {copiedField === 'bic' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-black/40" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider text-black/60 font-medium block mb-1">
                        Your Wire Transfer Reference Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. WIRE-884920 or Your Full Name"
                        value={transferReference}
                        onChange={(e) => setTransferReference(e.target.value)}
                        className="w-full p-2.5 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] text-xs font-mono focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-black/60 font-medium block mb-1">
                          Sending Institution
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. UBS, Chase Private"
                          value={senderBank}
                          onChange={(e) => setSenderBank(e.target.value)}
                          className="w-full p-2.5 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] uppercase tracking-wider text-black/60 font-medium block mb-1">
                          Notes / Memo (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Reference details"
                          value={proofNotes}
                          onChange={(e) => setProofNotes(e.target.value)}
                          className="w-full p-2.5 rounded-xs bg-[#FAF8F5] border border-[#E8E2D8] text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Live Conversion Engine Notice */}
              {selectedPlan && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs text-[11px] text-black/70">
                  <div className="flex items-center gap-1.5">
                    <span className="text-black/50">Settlement Currency:</span>
                    <strong className="text-black">{currency}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Rate Engine:</span>
                    <strong className="text-black font-medium">
                      {selectedGateway === 'manual' ? 'ExchangeRate-API (Live)' : selectedGateway === 'flutterwave' ? 'Flutterwave Gateway FX' : 'Paystack Gateway FX'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Total & Submit */}
              <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-black/50 uppercase tracking-wider block">Due Amount</span>
                  <span className="font-serif-luxury text-2xl text-black">
                    {selectedPlan ? formatPrice(Number(selectedPlan.price)) : '—'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-black/20 text-xs uppercase tracking-wider hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="px-7 py-2.5 rounded-full bg-[#141414] hover:bg-[#B8976C] text-white text-xs uppercase tracking-[0.2em] font-medium transition duration-300 shadow-md disabled:opacity-50"
                  >
                    {submittingPayment
                      ? 'Processing...'
                      : selectedGateway === 'manual'
                      ? 'Submit Wire Notice'
                      : `Proceed with ${selectedGateway === 'flutterwave' ? 'Flutterwave' : 'Paystack'}`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function MemberPaymentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center font-mono text-xs">Loading ledger...</div>}>
      <MemberPaymentsContent />
    </Suspense>
  );
}
