'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Check, Shield, Landmark, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { useIsSignedIn, storeToken } from '@/lib/auth';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPrice as formatFaceValue } from '@/components/archive/BookCard';
import { AcquisitionMode, Book, BookCheckoutResult, LibraryConfig } from '@/types';

interface Props {
  book: Book;
  mode: AcquisitionMode;
  config: LibraryConfig | null;
  onClose: () => void;
  onComplete: () => void;
}

type Gateway = 'flutterwave' | 'paystack' | 'manual';

/** Any reader profile left in local cache by a previous visit. */
function cachedProfile(): { email: string; name: string } {
  if (typeof window === 'undefined') return { email: '', name: '' };

  const stored = localStorage.getItem('hudorian_user');
  if (!stored) return { email: '', name: '' };

  try {
    const user = JSON.parse(stored) as { email?: string; name?: string };
    return { email: user.email || '', name: user.name || '' };
  } catch {
    // A malformed cache should not block checkout.
    return { email: '', name: '' };
  }
}

interface PaymentConfig {
  flutterwave?: { enabled: boolean; public_key?: string | null };
  paystack?: { enabled: boolean; public_key?: string | null };
  manual?: {
    enabled: boolean;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    iban?: string;
    swift_bic?: string;
    instructions?: string;
  };
  default_currency?: string;
}

export default function CheckoutDialog({ book, mode, config, onClose, onComplete }: Props) {
  const router = useRouter();
  const { currency, rateProvider, formatPrice } = useCurrency();
  const isSignedIn = useIsSignedIn();

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [gateway, setGateway] = useState<Gateway | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingManual, setPendingManual] = useState<BookCheckoutResult | null>(null);

  // Guest details — required only when not signed in. Seeded from any cached
  // reader profile at mount so the visitor need not retype their details.
  const [email, setEmail] = useState(() => cachedProfile().email);
  const [name, setName] = useState(() => cachedProfile().name);
  const [phone, setPhone] = useState('');

  // Manual transfer fields.
  const [wireReference, setWireReference] = useState('');
  const [wireBank, setWireBank] = useState('');
  const [wireNotes, setWireNotes] = useState('');

  useEffect(() => {
    api
      .getPaymentConfig()
      .then((res) => setPaymentConfig(res.data))
      .catch(() => undefined);
  }, []);

  const basePrice = mode === 'rental' ? book.rental_price : book.purchase_price;
  const isPurchase = mode === 'purchase';

  // The reader's currency converter works from the EUR base. A title priced in
  // another base currency is shown at face value, since converting it here
  // would require a second rate the client does not hold; the exact figure is
  // always the one the server quotes on checkout.
  const baseCurrency = (book.currency || 'EUR').toUpperCase();
  const isEuroPriced = baseCurrency === 'EUR';
  const displayedPrice = isEuroPriced
    ? formatPrice(basePrice)
    : formatFaceValue(basePrice, baseCurrency);

  const gateways: { id: Gateway; label: string; enabled: boolean }[] = [
    { id: 'flutterwave', label: 'Card · Flutterwave', enabled: Boolean(paymentConfig?.flutterwave?.enabled) },
    { id: 'paystack', label: 'Card · Paystack', enabled: Boolean(paymentConfig?.paystack?.enabled) },
    { id: 'manual', label: 'Bank Wire', enabled: paymentConfig?.manual?.enabled !== false },
  ];
  const available = gateways.filter((g) => g.enabled);

  const needsIdentity = !isSignedIn;

  const handleSubmit = async () => {
    if (needsIdentity && !email.trim()) {
      setError('An email address is required so we can open your archive.');
      return;
    }
    if (!gateway) {
      setError('Please choose how you wish to settle.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.initializeBookCheckout({
        book_id: book.id,
        mode,
        gateway,
        currency,
        redirect_url: `${window.location.origin}/royal-archive/my-archive`,
        email: needsIdentity ? email.trim() : undefined,
        name: needsIdentity ? name.trim() || undefined : undefined,
        phone: needsIdentity ? phone.trim() || undefined : undefined,
        transfer_reference: gateway === 'manual' ? wireReference || undefined : undefined,
        sender_bank: gateway === 'manual' ? wireBank || undefined : undefined,
        proof_notes: gateway === 'manual' ? wireNotes || undefined : undefined,
      });

      // A guest is issued a token so the archive is reachable after checkout.
      if (res.token) {
        storeToken(res.token);
        localStorage.setItem(
          'hudorian_user',
          JSON.stringify({ name: name || email.split('@')[0], email })
        );
      }

      if (gateway === 'flutterwave' && res.checkout_url) {
        window.location.href = res.checkout_url;
        return;
      }

      if (gateway === 'paystack' && res.authorization_url) {
        window.location.href = res.authorization_url;
        return;
      }

      if (gateway === 'manual') {
        setPendingManual(res);
        return;
      }

      onComplete();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'The archive could not complete this acquisition.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start md:items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#E8E2D8] rounded-xs shadow-2xl my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#141414]/40 hover:text-[#141414] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {pendingManual ? (
          <div className="p-8 md:p-10">
            <div className="w-12 h-12 rounded-full bg-[#C5A880]/20 flex items-center justify-center mb-6">
              <Check className="w-6 h-6 text-[#96754B]" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif-luxury text-3xl font-light text-[#141414] mb-3">
              Submitted for Clearance
            </h2>
            <p className="text-sm text-[#141414]/65 font-light leading-relaxed mb-7">
              {pendingManual.message ||
                'Your transfer has been submitted for Treasury clearance. Access is granted the moment the payment is confirmed.'}
            </p>

            <dl className="space-y-2.5 text-sm mb-8">
              {[
                ['Reference', pendingManual.payment?.transfer_reference],
                ['Amount', pendingManual.payment && `${pendingManual.payment.currency} ${pendingManual.payment.amount}`],
                ['Status', 'Pending clearance'],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-[#E8E2D8] pb-2.5">
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-[#141414]/45">{k}</dt>
                    <dd className="text-[#141414]/80 font-light text-right break-all">{v}</dd>
                  </div>
                ))}
            </dl>

            <button
              onClick={() => router.push('/royal-archive/my-archive')}
              className="w-full px-6 py-3.5 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors rounded-xs"
            >
              Go to My Archive
            </button>
          </div>
        ) : (
          <>
            <div className="p-8 md:p-10 pb-0">
              <span className="block text-[10px] uppercase tracking-[0.3em] text-[#96754B] mb-3">
                {isPurchase ? 'Perpetual Licence' : `${book.effective_rental_days}-Day Term`}
              </span>
              <h2 className="font-serif-luxury text-3xl font-light text-[#141414] mb-2 leading-snug">
                {book.title}
              </h2>
              <p className="text-sm text-[#141414]/55 font-light mb-7">{book.author}</p>

              <div className="flex items-end justify-between gap-4 pb-6 border-b border-[#E8E2D8] mb-7">
                <div>
                  <span className="block text-[9px] uppercase tracking-[0.2em] text-[#141414]/45 mb-1.5">
                    {isPurchase ? 'Outright' : 'Rental term'}
                  </span>
                  <span className="font-serif-luxury text-3xl text-[#141414]">{displayedPrice}</span>
                  {!isPurchase && (
                    <span className="block text-[11px] text-[#141414]/45 mt-1.5">
                      {book.effective_rental_days} days of reading access
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {rateProvider && isEuroPriced && (
                    <span className="block text-[10px] text-[#141414]/40 font-light">Rate via {rateProvider}</span>
                  )}
                  {currency !== baseCurrency && (
                    <span className="block text-[10px] text-[#141414]/40 font-light mt-0.5">
                      Charged in {currency}
                    </span>
                  )}
                </div>
              </div>

              {needsIdentity && (
                <div className="space-y-4 mb-7">
                  <p className="text-[11px] text-[#141414]/55 font-light">
                    We will open a reader account against this email so the volume reaches your archive.
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-3 bg-white border border-[#E8E2D8] rounded-xs text-sm font-light focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-3 bg-white border border-[#E8E2D8] rounded-xs text-sm font-light focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Telephone (optional)"
                    className="w-full px-4 py-3 bg-white border border-[#E8E2D8] rounded-xs text-sm font-light focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>
              )}

              <div className="space-y-2.5 mb-7">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#141414]/45 mb-1">
                  Settlement
                </span>
                {available.length === 0 ? (
                  <p className="text-sm text-[#141414]/55 font-light">
                    No payment method is currently enabled. Please contact the concierge.
                  </p>
                ) : (
                  available.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGateway(g.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 border rounded-xs text-left transition-colors ${
                        gateway === g.id
                          ? 'border-[#C5A880] bg-[#C5A880]/10'
                          : 'border-[#E8E2D8] bg-white hover:border-[#C5A880]/60'
                      }`}
                    >
                      {g.id === 'manual' ? (
                        <Landmark className="w-4 h-4 text-[#96754B] shrink-0" strokeWidth={1.5} />
                      ) : (
                        <CreditCard className="w-4 h-4 text-[#96754B] shrink-0" strokeWidth={1.5} />
                      )}
                      <span className="text-sm font-light text-[#141414] grow">{g.label}</span>
                      <span
                        className={`w-4 h-4 rounded-full border shrink-0 ${
                          gateway === g.id ? 'border-[#96754B] bg-[#96754B]' : 'border-[#D8D0C3]'
                        }`}
                      />
                    </button>
                  ))
                )}
              </div>

              {gateway === 'manual' && paymentConfig?.manual && (
                <div className="space-y-4 mb-7 p-5 border border-[#E8E2D8] bg-white rounded-xs">
                  <div className="space-y-1.5 text-xs">
                    {[
                      ['Bank', paymentConfig.manual.bank_name],
                      ['Account Name', paymentConfig.manual.account_name],
                      ['Account Number', paymentConfig.manual.account_number],
                      ['IBAN', paymentConfig.manual.iban],
                      ['SWIFT', paymentConfig.manual.swift_bic],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <span className="text-[#141414]/45 shrink-0">{k}</span>
                          <span className="text-[#141414]/80 font-light text-right break-all">{v}</span>
                        </div>
                      ))}
                  </div>

                  <p className="text-[11px] text-[#141414]/55 font-light leading-relaxed">
                    {paymentConfig.manual.instructions}
                  </p>

                  <input
                    type="text"
                    value={wireReference}
                    onChange={(e) => setWireReference(e.target.value)}
                    placeholder="Wire reference (optional)"
                    className="w-full px-4 py-2.5 border border-[#E8E2D8] rounded-xs text-sm font-light focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <input
                    type="text"
                    value={wireBank}
                    onChange={(e) => setWireBank(e.target.value)}
                    placeholder="Sending bank (optional)"
                    className="w-full px-4 py-2.5 border border-[#E8E2D8] rounded-xs text-sm font-light focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <textarea
                    value={wireNotes}
                    onChange={(e) => setWireNotes(e.target.value)}
                    placeholder="Notes for the treasury (optional)"
                    rows={2}
                    className="w-full px-4 py-2.5 border border-[#E8E2D8] rounded-xs text-sm font-light resize-none focus:outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-700 font-light mb-5 bg-red-50 border border-red-200 rounded-xs px-4 py-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || available.length === 0}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                    Processing
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    Confirm
                  </>
                )}
              </button>

              {config && (
                <p className="text-[11px] text-[#141414]/45 font-light leading-relaxed mt-5">
                  {isPurchase ? config.purchase_terms : config.rental_terms}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
