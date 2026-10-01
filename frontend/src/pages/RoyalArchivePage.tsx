
import React, { useEffect, useMemo, useState } from 'react';
import Link from '@/components/common/Link';
import { BookOpen, Check, Search, X } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BookCard from '@/components/archive/BookCard';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';
import { Book, BookFormat, LibraryConfig } from '@/types';

interface CollectionOption {
  slug: string;
  name: string;
  books_count: number;
}

export default function RoyalArchivePage() {
  const [config, setConfig] = useState<LibraryConfig | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [collection, setCollection] = useState('');
  const [format, setFormat] = useState<'' | BookFormat>('');
  const [availability, setAvailability] = useState<'' | 'purchase' | 'rental' | 'both'>('');
  const [sort, setSort] = useState('newest');

  const { getPageContent } = useCms();
  const heroContent = getPageContent('page_royal_archive', {
    title: 'The Royal Archive',
    subtitle: 'A private press of first editions, working papers and rare volumes, delivered as protected digital editions.',
    media_url: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=2000&q=85',
  });

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    // The policy is fetched once; the catalogue reloads on every filter change.
    api
      .getLibraryConfig()
      .then((res) => setConfig(res.data))
      .catch((err) => console.error(err));
  }, []);

  // The active filter set doubles as the request key. Results are stored
  // alongside the key they were fetched for, so a pending reload is derived
  // rather than toggled by an effect.
  const queryKey = JSON.stringify([debouncedSearch, collection, format, availability, sort]);
  // `error` is keyed the same way as `result`: a rejected fetch has to resolve
  // the loading state too, or a failed request leaves the skeleton spinning.
  const [result, setResult] = useState<{
    key: string;
    books: Book[];
    collections: CollectionOption[];
    error?: string;
  } | null>(null);
  const loading = result?.key !== queryKey;
  const error = result?.key === queryKey ? result.error : undefined;

  useEffect(() => {
    let cancelled = false;

    api
      .getBooks({
        search: debouncedSearch || undefined,
        collection: collection || undefined,
        format: format || undefined,
        availability: availability || undefined,
        sort: sort as 'newest',
        per_page: 60,
      })
      .then((list) => {
        if (cancelled) return;
        setResult({ key: queryKey, books: list.data || [], collections: list.collections || [] });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setResult({
          key: queryKey,
          books: [],
          collections: [],
          error: err instanceof Error ? err.message : 'The catalogue could not be reached.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [queryKey, debouncedSearch, collection, format, availability, sort]);

  const books = result?.books || [];
  const collections = result?.collections || [];

  const activeFilters = useMemo(
    () => [search, collection, format, availability].filter(Boolean).length,
    [search, collection, format, availability]
  );

  const clearFilters = () => {
    setSearch('');
    setCollection('');
    setFormat('');
    setAvailability('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow">
        {/* Hero */}
        <section className="relative w-full overflow-hidden bg-[#141414] text-[#FAF8F5]">
          {heroContent.media_url && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${heroContent.media_url})` }}
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#141414]" aria-hidden />

          <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-44 pb-24 text-center">
            <span className="inline-block text-[10px] uppercase tracking-[0.42em] text-[#C5A880] mb-6">
              The Private Press
            </span>
            <h1 className="font-serif-luxury text-5xl sm:text-7xl font-light tracking-tight mb-7">
              {heroContent.title || 'The Royal Archive'}
            </h1>
            <p className="text-base sm:text-lg font-light text-[#FAF8F5]/75 leading-relaxed max-w-2xl mx-auto mb-10">
              {heroContent.subtitle ||
                'A private press of first editions, working papers and rare volumes, delivered as protected digital editions.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/royal-archive/my-archive"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#C5A880] text-[#141414] text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#A3855E] transition-colors rounded-xs"
              >
                <BookOpen className="w-4 h-4" strokeWidth={1.5} />
                My Archive
              </Link>
              <a
                href="#catalogue"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#C5A880]/40 text-[#FAF8F5] text-[11px] font-semibold uppercase tracking-[0.2em] hover:border-[#C5A880] transition-colors rounded-xs"
              >
                Browse the Collection
              </a>
            </div>
          </div>
        </section>

        {/* Policy strip */}
        {config && (config.purchase_enabled || config.rental_enabled) && (
          <section className="border-b border-[#E8E2D8] bg-white/60">
            <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {config.purchase_enabled && (
                <div className="flex gap-4">
                  <Check className="w-5 h-5 text-[#96754B] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#141414] font-semibold mb-1.5">
                      Acquire Outright
                    </h3>
                    <p className="text-sm text-[#141414]/65 font-light leading-relaxed">{config.purchase_terms}</p>
                  </div>
                </div>
              )}
              {config.rental_enabled && (
                <div className="flex gap-4">
                  <Check className="w-5 h-5 text-[#96754B] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#141414] font-semibold mb-1.5">
                      Borrow for {config.default_rental_days} Days
                    </h3>
                    <p className="text-sm text-[#141414]/65 font-light leading-relaxed">{config.rental_terms}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Catalogue */}
        <section id="catalogue" className="max-w-7xl mx-auto w-full px-6 md:px-10 pt-16 pb-28">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.32em] text-[#96754B] block mb-3">The Collection</span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-light text-[#141414]">
                {loading
                  ? 'Retrieving volumes...'
                  : error
                    ? 'Catalogue unavailable'
                    : `${books.length} ${books.length === 1 ? 'Volume' : 'Volumes'}`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141414]/35" strokeWidth={1.5} />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, author, ISBN"
                  className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D8] rounded-xs text-sm font-light text-[#141414] placeholder:text-[#141414]/35 focus:outline-none focus:border-[#C5A880] transition-colors"
                />
              </div>

              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as typeof availability)}
                className="px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xs text-sm font-light text-[#141414] focus:outline-none focus:border-[#C5A880] transition-colors"
              >
                <option value="">All access</option>
                <option value="purchase">For purchase</option>
                <option value="rental">For rental</option>
                <option value="both">Both</option>
              </select>

              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as typeof format)}
                className="px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xs text-sm font-light text-[#141414] focus:outline-none focus:border-[#C5A880] transition-colors"
              >
                <option value="">All formats</option>
                <option value="pdf">PDF</option>
                <option value="epub">EPUB</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3.5 py-2.5 bg-white border border-[#E8E2D8] rounded-xs text-sm font-light text-[#141414] focus:outline-none focus:border-[#C5A880] transition-colors"
              >
                <option value="newest">Newest</option>
                <option value="title">Title A–Z</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </div>
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-12">
              <button
                onClick={() => setCollection('')}
                className={`px-4 py-2 text-[10px] uppercase tracking-[0.18em] border rounded-full transition-colors ${
                  !collection
                    ? 'bg-[#141414] text-[#FAF8F5] border-[#141414]'
                    : 'bg-white text-[#141414]/70 border-[#E8E2D8] hover:border-[#C5A880]'
                }`}
              >
                All Collections
              </button>
              {collections.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCollection(collection === c.slug ? '' : c.slug)}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.18em] border rounded-full transition-colors ${
                    collection === c.slug
                      ? 'bg-[#141414] text-[#FAF8F5] border-[#141414]'
                      : 'bg-white text-[#141414]/70 border-[#E8E2D8] hover:border-[#C5A880]'
                  }`}
                >
                  {c.name} ({c.books_count})
                </button>
              ))}
            </div>
          )}

          {activeFilters > 0 && (
            <div className="flex items-center gap-3 mb-8 text-sm text-[#141414]/60">
              <span>Refining the catalogue…</span>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-[#96754B] hover:text-[#785A32] transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                Clear filters
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-[#E8E2D8] bg-white rounded-xs overflow-hidden">
                  <div className="aspect-3/4 bg-[#F4EFEA] animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-2/3 bg-[#F4EFEA] animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-[#F4EFEA] animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-24 border border-dashed border-[#E8E2D8] rounded-xs">
              <BookOpen className="w-10 h-10 text-[#141414]/20 mx-auto mb-5" strokeWidth={1} />
              <h3 className="font-serif-luxury text-2xl font-light text-[#141414] mb-2">
                The catalogue is out of reach
              </h3>
              <p className="text-sm text-[#141414]/55 font-light mb-6 max-w-md mx-auto">{error}</p>
              <button
                onClick={() => setResult(null)}
                className="px-6 py-2.5 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors rounded-xs"
              >
                Try Again
              </button>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#E8E2D8] rounded-xs">
              <BookOpen className="w-10 h-10 text-[#141414]/20 mx-auto mb-5" strokeWidth={1} />
              <h3 className="font-serif-luxury text-2xl font-light text-[#141414] mb-2">No volumes match</h3>
              <p className="text-sm text-[#141414]/55 font-light mb-6">
                The archivists have not catalogued anything under those terms.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[#141414] text-[#FAF8F5] text-[10px] font-semibold uppercase tracking-[0.2em] hover:bg-[#222] transition-colors rounded-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
