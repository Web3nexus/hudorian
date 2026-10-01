import React, { useEffect, useState } from 'react';
import { useRouter } from '@/hooks/useRouter';
import Link from '@/components/common/Link';
import { ArrowLeft, BookOpen, Check, Download, Shield } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import CheckoutDialog from '@/components/archive/CheckoutDialog';
import { formatPrice } from '@/components/archive/BookCard';
import { api } from '@/lib/api';
import { Book, LibraryConfig } from '@/types';

interface Props {
  slug: string;
}

export default function BookDetail({ slug }: Props) {
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [config, setConfig] = useState<LibraryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'purchase' | 'rental' | null>(null);

  useEffect(() => {
    if (!slug) return;

    // Loading is already true from the initial state, so setting it again
    // here would be a redundant cascading render.
    api
      .getBook(slug)
      .then((res) => {
        setBook(res.data);
        setConfig(res.config);
      })
      .catch((err) => {
        console.error(err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <main className="grow pt-40 pb-28 px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-[#141414]/45">Retrieving volume…</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Navbar />
        <main className="grow pt-40 pb-28 px-6 text-center max-w-xl mx-auto">
          <BookOpen className="w-12 h-12 text-[#141414]/20 mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-serif-luxury text-4xl font-light text-[#141414] mb-4">Volume not found</h1>
          <p className="text-sm text-[#141414]/60 font-light mb-8">
            This title is not in the catalogue, or has been withdrawn by the archivists.
          </p>
          <Link
            href="/royal-archive"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors rounded-xs"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Return to the Archive
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const cover = book.cover_image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80';
  const access = book.access;
  const owned = access?.loan_type === 'purchase';

  const canPurchase = config?.purchase_enabled && book.allow_purchase && !owned;
  const canRent = config?.rental_enabled && book.allow_rental && !owned;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-10 pt-32 pb-24">
          <button
            onClick={() => router.push('/royal-archive')}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#141414]/50 hover:text-[#96754B] transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            The Collection
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Cover */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <div className="relative aspect-3/4 rounded-xs overflow-hidden border border-[#E8E2D8] shadow-xl bg-[#F4EFEA]">
                  <img src={cover} alt={book.title} className="w-full h-full object-cover" />
                </div>
                <dl className="mt-6 space-y-2.5 text-xs">
                  {[
                    ['Author', book.author],
                    ['Edition', book.format.toUpperCase()],
                    ['Published', book.published_year || '—'],
                    ['Extent', book.page_count ? `${book.page_count} pages` : '—'],
                    ['ISBN', book.isbn || '—'],
                  ]
                    .filter(([, v]) => v && v !== '—')
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-[#E8E2D8] pb-2.5">
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-[#141414]/45 shrink-0">{k}</dt>
                        <dd className="text-[#141414]/80 font-light text-right">{v}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-8">
              {book.collection?.name && (
                <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#96754B] mb-4">
                  {book.collection.name}
                </span>
              )}

              <h1 className="font-serif-luxury text-4xl sm:text-5xl font-light text-[#141414] leading-tight mb-4">
                {book.title}
              </h1>
              <p className="text-lg font-light text-[#141414]/60 mb-8">{book.author}</p>

              {book.short_description && (
                <p className="text-lg font-serif-luxury italic text-[#141414]/75 leading-relaxed mb-8 pb-8 border-b border-[#E8E2D8]">
                  {book.short_description}
                </p>
              )}

              {/* Access status */}
              {access && (
                <div
                  className={`flex items-start gap-4 p-5 mb-8 rounded-xs border ${
                    access.status === 'active' ? 'border-[#C5A880]/50 bg-[#C5A880]/10' : 'border-[#E8E2D8] bg-white'
                  }`}
                >
                  {access.status === 'active' ? (
                    <Check className="w-5 h-5 text-[#96754B] shrink-0 mt-0.5" strokeWidth={1.5} />
                  ) : (
                    <Shield className="w-5 h-5 text-[#141414]/40 shrink-0 mt-0.5" strokeWidth={1.5} />
                  )}
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#141414] mb-1">
                      {owned
                        ? 'In your archive'
                        : access.status === 'active'
                          ? `Borrowed — ${access.days_remaining} day${access.days_remaining === 1 ? '' : 's'} remaining`
                          : 'Your rental has lapsed'}
                    </p>
                    {access.loan_type === 'rental' && access.expires_at && (
                      <p className="text-sm text-[#141414]/60 font-light">
                        Access lapses on{' '}
                        {new Date(access.expires_at).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        . Renew from{' '}
                        <Link href="/royal-archive/my-archive" className="text-[#96754B] hover:underline">
                          My Archive
                        </Link>
                        .
                      </p>
                    )}
                    {owned && (
                      <Link
                        href="/royal-archive/my-archive"
                        className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.18em] hover:bg-[#222] transition-colors rounded-xs"
                      >
                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Download
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-4 text-[#141414]/75 font-light leading-[1.85] mb-10">
                {book.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Acquisition */}
              {!owned && (canPurchase || canRent) && (
                <div className="border border-[#E8E2D8] bg-white rounded-xs p-7">
                  <h2 className="text-[10px] uppercase tracking-[0.24em] text-[#141414]/50 mb-6">
                    Acquire this Volume
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {canPurchase && (
                      <button
                        onClick={() => setCheckoutMode('purchase')}
                        className="text-left p-5 border border-[#141414] bg-[#141414] text-[#FAF8F5] hover:bg-[#222] transition-colors rounded-xs"
                      >
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-[#C5A880] mb-2">
                          Perpetual Licence
                        </span>
                        <span className="font-serif-luxury text-2xl mb-1.5 block">
                          {formatPrice(book.purchase_price, book.currency)}
                        </span>
                        <span className="text-xs text-[#FAF8F5]/60 font-light">
                          Yours in perpetuity, delivered as a protected edition.
                        </span>
                      </button>
                    )}

                    {canRent && (
                      <button
                        onClick={() => setCheckoutMode('rental')}
                        className="text-left p-5 border border-[#C5A880] hover:border-[#96754B] hover:bg-[#C5A880]/5 transition-colors rounded-xs"
                      >
                        <span className="block text-[9px] uppercase tracking-[0.2em] text-[#96754B] mb-2">
                          {book.effective_rental_days}-Day Term
                        </span>
                        <span className="font-serif-luxury text-2xl mb-1.5 block text-[#141414]">
                          {formatPrice(book.rental_price, book.currency)}
                        </span>
                        <span className="text-xs text-[#141414]/60 font-light">
                          Reading access for {book.effective_rental_days} days, renewable from your archive.
                        </span>
                      </button>
                    )}
                  </div>

                  {config && (
                    <p className="text-[11px] text-[#141414]/45 font-light leading-relaxed mt-5">
                      {checkoutModeHint(book, config)}
                    </p>
                  )}
                </div>
              )}

              {access?.loan_type === 'rental' && access.status === 'active' && (
                <p className="text-sm text-[#141414]/60 font-light">
                  You already hold this volume on loan.{' '}
                  <Link href="/royal-archive/my-archive" className="text-[#96754B] hover:underline">
                    Manage it in My Archive
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {checkoutMode && book && (
        <CheckoutDialog
          book={book}
          mode={checkoutMode}
          config={config}
          onClose={() => setCheckoutMode(null)}
          onComplete={() => {
            setCheckoutMode(null);
            // Re-fetch so the access banner reflects the new grant.
            api.getBook(slug).then((res) => setBook(res.data)).catch(() => undefined);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

function checkoutModeHint(book: Book, config: LibraryConfig): string {
  if (book.allow_purchase && book.allow_rental) {
    return `Both terms are available. Rentals run ${book.effective_rental_days} days${book.rental_days ? '' : ' (archive default)'} and may be extended from My Archive.`;
  }
  if (book.allow_purchase) {
    return 'This volume is offered on perpetual licence only.';
  }
  if (config.default_rental_days) {
    return `This volume is offered on loan for ${book.effective_rental_days} days.`;
  }
  return '';
}
