'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Download, Loader2, Library, LogIn, RefreshCw, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import CheckoutDialog from '@/components/archive/CheckoutDialog';
import { api } from '@/lib/api';
import { useIsSignedIn } from '@/lib/auth';
import { Book, BookShelfEntry, LibraryConfig, MyArchive } from '@/types';

type Tab = 'all' | 'purchase' | 'rental';

/**
 * The gateway return address is only known in the browser, so the shelf reads
 * it at runtime. Reading search params during a static export requires a
 * suspense boundary, so the shell falls back to the same quiet loading state.
 */
export default function MyArchivePage() {
  return (
    <Suspense fallback={<ArchiveShell />}>
      <MyArchiveShelf />
    </Suspense>
  );
}

function ArchiveShell() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />
      <main className="grow pt-40 pb-28 px-6 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-[#141414]/45">Opening your archive…</div>
      </main>
      <Footer />
    </div>
  );
}

function MyArchiveShelf() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<MyArchive | null>(null);
  const [config, setConfig] = useState<LibraryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [busyLoan, setBusyLoan] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // A lapsed rental is renewed by taking a fresh rental payment, so renewing
  // hands the reader back to the standard checkout.
  const [renewing, setRenewing] = useState<Book | null>(null);
  // Bumped after an action so the shelf re-reads from the server.
  const [refreshKey, setRefreshKey] = useState(0);

  // null until hydration, then whether a reader token is present.
  const authed = useIsSignedIn();

  // The return URL carries the outcome of a card payment. A declined or
  // abandoned charge is derived from it rather than stored, since the address
  // itself already describes what happened.
  const returnStatus = (searchParams?.get('status') || '').toLowerCase();
  const declinedReturn = ['failed', 'cancelled', 'canceled', 'abandoned'].includes(returnStatus);

  // Card gateways return the reader here after paying. Settle the payment so
  // the volume appears without waiting on the asynchronous webhook.
  const settledReturn = useRef(false);
  useEffect(() => {
    if (settledReturn.current || authed !== true || declinedReturn) return;

    const params = searchParams;
    if (!params) return;

    const flutterwaveRef = params.get('tx_ref') || params.get('txref');
    const paystackRef = params.get('reference');

    let gateway: 'flutterwave' | 'paystack' | null = null;
    let reference: string | null = null;

    if (flutterwaveRef) {
      gateway = 'flutterwave';
      reference = flutterwaveRef;
    } else if (paystackRef) {
      gateway = 'paystack';
      reference = paystackRef;
    }

    if (!gateway || !reference) return;
    // A cancelled or failed charge is reported from the URL itself, so there is
    // nothing to verify and nothing to write.

    settledReturn.current = true;
    api
      .verifyBookPayment(gateway, reference)
      .then((res) => {
        setNotice(res.message);
        setRefreshKey((k) => k + 1);
      })
      .catch((err: unknown) => {
        console.error(err);
        setNotice(
          err instanceof Error
            ? err.message
            : 'Your payment is still being confirmed. It will appear in your archive shortly.'
        );
      });
  }, [authed, searchParams, declinedReturn]);

  // The signed-out and hydrating views are both a spinner, so the fetch only
  // needs to run once the token is known to be present.
  useEffect(() => {
    if (authed !== true) return;

    let cancelled = false;
    api
      .getMyArchive()
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setConfig(res.config);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error(err);
        // A stale or revoked token should not strand the reader on a spinner.
        if (err instanceof Error && err.message.toLowerCase().includes('unauthenticated')) {
          setTokenInvalid(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed, refreshKey]);

  const handleDownload = async (entry: BookShelfEntry) => {
    setBusyLoan(entry.id);
    setNotice(null);
    try {
      const res = await api.getBookDownload(entry.id);
      // Fetch the signed URL so the browser receives a real download, then
      // release the object URL.
      const fileRes = await fetch(res.data.download_url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hudorian_token')}` },
      });

      if (!fileRes.ok) throw new Error('The archive could not release this volume.');

      const blob = await fileRes.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = res.data.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setNotice(`“${entry.book?.title}” is downloading. The link expires in ${res.data.expires_in_minutes} minutes.`);
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : 'The download could not be completed.');
    } finally {
      setBusyLoan(null);
    }
  };

  const handleRenew = async (entry: BookShelfEntry) => {
    setBusyLoan(entry.id);
    setNotice(null);
    try {
      const res = await api.renewBookRental(entry.id);
      if (entry.book) setRenewing(entry.book);
      setNotice(res.message);
    } catch (err: unknown) {
      setNotice(err instanceof Error ? err.message : 'The renewal could not be completed.');
    } finally {
      setBusyLoan(null);
    }
  };

  const shelf = data?.shelf || [];
  const filtered = shelf.filter((e) => {
    if (tab === 'purchase') return e.loan_type === 'purchase';
    if (tab === 'rental') return e.loan_type === 'rental';
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow max-w-7xl mx-auto w-full px-6 md:px-10 pt-36 pb-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.32em] text-[#96754B] mb-3">
              Your Holdings
            </span>
            <h1 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#141414] mb-3">
              My Archive
            </h1>
            <p className="text-sm text-[#141414]/60 font-light max-w-xl leading-relaxed">
              Every volume you hold, whether acquired outright or on loan. Downloads are released through
              short-lived links tied to your own access.
            </p>
          </div>

          <Link
            href="/royal-archive"
            className="inline-flex items-center gap-2.5 self-start px-7 py-3 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors rounded-xs shrink-0"
          >
            <Library className="w-4 h-4" strokeWidth={1.5} />
            Browse the Collection
          </Link>
        </div>

        {(notice || declinedReturn) && (
          <div className="mb-8 px-5 py-4 bg-[#C5A880]/10 border border-[#C5A880]/40 rounded-xs text-sm text-[#141414]/80 font-light flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-[#96754B] shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>
              {notice ||
                'That payment was not completed. Nothing has been taken from your archive — you may try again whenever you wish.'}
            </span>
          </div>
        )}

        {authed === false || tokenInvalid ? (
          <div className="text-center py-24 border border-dashed border-[#E8E2D8] rounded-xs">
            <LogIn className="w-10 h-10 text-[#141414]/20 mx-auto mb-5" strokeWidth={1} />
            <h2 className="font-serif-luxury text-2xl font-light text-[#141414] mb-2">Sign in to open your archive</h2>
            <p className="text-sm text-[#141414]/55 font-light mb-7 max-w-md mx-auto">
              Your holdings are tied to your reader account. Sign in with the email used at acquisition.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center gap-2.5 px-7 py-3 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors rounded-xs"
            >
              <LogIn className="w-4 h-4" strokeWidth={1.5} />
              Sign In
            </Link>
          </div>
        ) : authed === null || loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-[#E8E2D8] bg-white rounded-xs p-6 space-y-3">
                <div className="h-3 w-2/3 bg-[#F4EFEA] animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-[#F4EFEA] animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Summary */}
            {data && (
              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  ['Owned', data.summary.owned, 'perpetual'],
                  ['On Loan', data.summary.active_rentals, 'active terms'],
                  ['Lapsed', data.summary.expired, 'renewable'],
                ].map(([label, value, hint]) => (
                  <div key={label as string} className="bg-white border border-[#E8E2D8] rounded-xs p-5 text-center">
                    <span className="block font-serif-luxury text-3xl text-[#141414] mb-1">{value as number}</span>
                    <span className="block text-[9px] uppercase tracking-[0.2em] text-[#141414]/50">{label as string}</span>
                    <span className="block text-[10px] text-[#141414]/35 mt-0.5">{hint as string}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            {shelf.length > 0 && (
              <div className="flex gap-2.5 mb-8">
                {(
                  [
                    ['all', 'All Holdings'],
                    ['purchase', 'Owned'],
                    ['rental', 'On Loan'],
                  ] as [Tab, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-5 py-2 text-[10px] uppercase tracking-[0.18em] border rounded-full transition-colors ${
                      tab === key
                        ? 'bg-[#141414] text-[#FAF8F5] border-[#141414]'
                        : 'bg-white text-[#141414]/70 border-[#E8E2D8] hover:border-[#C5A880]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-[#E8E2D8] rounded-xs">
                <BookOpen className="w-10 h-10 text-[#141414]/20 mx-auto mb-5" strokeWidth={1} />
                <h2 className="font-serif-luxury text-2xl font-light text-[#141414] mb-2">
                  {shelf.length === 0 ? 'Your archive is empty' : 'Nothing in this view'}
                </h2>
                <p className="text-sm text-[#141414]/55 font-light mb-7 max-w-md mx-auto">
                  {shelf.length === 0
                    ? 'Acquire a volume outright or borrow it for a term, and it will appear here ready to read.'
                    : 'Try another view to see the rest of your holdings.'}
                </p>
                <Link
                  href="/royal-archive"
                  className="inline-flex items-center gap-2.5 px-7 py-3 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors rounded-xs"
                >
                  <Library className="w-4 h-4" strokeWidth={1.5} />
                  Enter the Archive
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((entry) => {
                  const book = entry.book;
                  const cover =
                    book?.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80';
                  const live = entry.grants_access;
                  const owned = entry.loan_type === 'purchase';

                  return (
                    <article
                      key={entry.id}
                      className="flex gap-5 bg-white border border-[#E8E2D8] rounded-xs p-5 hover:shadow-md transition-shadow"
                    >
                      <Link
                        href={`/royal-archive/${book?.slug}`}
                        className="shrink-0 w-20 aspect-3/4 rounded-xs overflow-hidden bg-[#F4EFEA]"
                      >
                        <img src={cover} alt={book?.title} className="w-full h-full object-cover" />
                      </Link>

                      <div className="flex flex-col grow min-w-0">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#96754B] mb-1.5">
                          {owned ? 'Owned' : live ? 'On Loan' : 'Lapsed'}
                        </span>

                        <Link href={`/royal-archive/${book?.slug}`}>
                          <h3 className="font-serif-luxury text-lg font-light text-[#141414] leading-snug mb-1 line-clamp-2 hover:text-[#96754B] transition-colors">
                            {book?.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-[#141414]/50 font-light mb-3 line-clamp-1">{book?.author}</p>

                        {!owned && entry.expires_at && (
                          <p className="text-[11px] text-[#141414]/55 font-light mb-3">
                            {live ? (
                              <>
                                <span className="text-[#96754B] font-medium">
                                  {entry.days_remaining} day{entry.days_remaining === 1 ? '' : 's'} left
                                </span>{' '}
                                · until{' '}
                                {new Date(entry.expires_at).toLocaleDateString(undefined, {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </>
                            ) : (
                              <>Lapsed {new Date(entry.expires_at).toLocaleDateString()}</>
                            )}
                          </p>
                        )}

                        {entry.download_count > 0 && (
                          <p className="text-[10px] text-[#141414]/35 font-light mb-3">
                            Downloaded {entry.download_count}× · last{' '}
                            {entry.last_downloaded_at
                              ? new Date(entry.last_downloaded_at).toLocaleDateString()
                              : '—'}
                          </p>
                        )}

                        <div className="mt-auto flex flex-wrap gap-2 pt-2">
                          {live ? (
                            <button
                              onClick={() => handleDownload(entry)}
                              disabled={busyLoan === entry.id}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#141414] text-[#FAF8F5] text-[9px] font-semibold uppercase tracking-[0.18em] hover:bg-[#222] disabled:opacity-50 transition-colors rounded-xs"
                            >
                              {busyLoan === entry.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                              ) : (
                                <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                              )}
                              Read
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRenew(entry)}
                              disabled={busyLoan === entry.id || !config?.rental_enabled}
                              className="inline-flex items-center gap-2 px-4 py-2 border border-[#C5A880] text-[#96754B] text-[9px] font-semibold uppercase tracking-[0.18em] hover:bg-[#C5A880]/10 disabled:opacity-40 transition-colors rounded-xs"
                            >
                              {busyLoan === entry.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
                              )}
                              Renew
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {renewing && (
        <CheckoutDialog
          book={renewing}
          mode="rental"
          config={config}
          onClose={() => setRenewing(null)}
          onComplete={() => {
            setRenewing(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
