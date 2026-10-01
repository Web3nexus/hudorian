'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Eye,
  Pencil,
  ExternalLink,
  X,
  Search,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ScrollText,
  Settings2,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';
import {
  AdminArchiveReference,
  ArchiveLoan,
  Book,
  BookFormat,
  BookStatus,
  LibraryConfig,
  LoanStatus,
  LoanType,
} from '@/types';

type Tab = 'titles' | 'loans' | 'policy';

type FormState = {
  title: string;
  slug: string;
  author: string;
  isbn: string;
  format: BookFormat;
  language: string;
  published_year: string;
  page_count: string;
  short_description: string;
  description: string;
  cover_image: string;
  file_url: string;
  purchase_price: string;
  rental_price: string;
  currency: string;
  rental_days: string;
  collection_id: string;
  allow_purchase: boolean;
  allow_rental: boolean;
  status: BookStatus;
  is_featured: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  author: '',
  isbn: '',
  format: 'pdf',
  language: 'en',
  published_year: '',
  page_count: '',
  short_description: '',
  description: '',
  cover_image: '',
  file_url: '',
  purchase_price: '',
  rental_price: '',
  currency: 'EUR',
  rental_days: '',
  collection_id: '',
  allow_purchase: true,
  allow_rental: true,
  status: 'published',
  is_featured: false,
  sort_order: '0',
};

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-white/5 text-white/50 border-white/10',
  published: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  archived: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

const LOAN_STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  expired: 'bg-white/5 text-white/50 border-white/10',
  revoked: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
};

const inputClass =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#C5A880] transition';
const labelClass = 'block text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5';

/**
 * SecureGateLayout guards what is rendered, not what is mounted, so a page
 * still runs its effects on the way to the clearance screen. Checking the
 * steward token first keeps unauthenticated visits from calling the vault.
 */
const hasClearance = (): boolean =>
  typeof window !== 'undefined' && Boolean(localStorage.getItem('hudorian_admin_token'));

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

function bookToForm(book: Book): FormState {
  return {
    title: book.title || '',
    slug: book.slug || '',
    author: book.author || '',
    isbn: book.isbn || '',
    format: book.format || 'pdf',
    language: book.language || 'en',
    published_year: book.published_year || '',
    page_count: book.page_count != null ? String(book.page_count) : '',
    short_description: book.short_description || '',
    description: book.description || '',
    cover_image: book.cover_image || '',
    file_url: book.file_url || '',
    purchase_price: book.purchase_price != null ? String(book.purchase_price) : '',
    rental_price: book.rental_price != null ? String(book.rental_price) : '',
    currency: book.currency || 'EUR',
    rental_days: book.rental_days != null ? String(book.rental_days) : '',
    collection_id: book.collection_id ? String(book.collection_id) : '',
    allow_purchase: Boolean(book.allow_purchase),
    allow_rental: Boolean(book.allow_rental),
    status: book.status || 'published',
    is_featured: Boolean(book.is_featured),
    sort_order: String(book.sort_order ?? 0),
  };
}

export default function AdminArchivePage() {
  const [tab, setTab] = useState<Tab>('titles');

  // Titles
  const [reference, setReference] = useState<AdminArchiveReference['data'] | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);
  // A second click while the first request is in flight would issue a duplicate
  // delete or revoke, so the confirmation is held until it settles.
  const [confirmPending, setConfirmPending] = useState(false);

  const runConfirm = async () => {
    if (confirmPending || !confirm) return;
    setConfirmPending(true);
    try {
      await confirm.onConfirm();
    } finally {
      setConfirmPending(false);
    }
  };

  // Loans
  const [loanStatus, setLoanStatus] = useState('');
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantForm, setGrantForm] = useState({ book_id: '', user_id: '', loan_type: 'rental' as LoanType, rental_days: '', note: '' });

  // Policy
  const [policy, setPolicy] = useState<LibraryConfig | null>(null);
  const [policySaving, setPolicySaving] = useState(false);

  // The active filter set doubles as the request key, so a pending reload is
  // derived from the key rather than toggled by an effect. The counters are
  // bumped after a mutation to re-read the server.
  const booksKey = JSON.stringify([debouncedSearch, statusFilter]);
  // Both ledgers record failures under their request key: a rejected fetch has
  // to resolve the loading state, or the table stays on its skeleton.
  const [booksResult, setBooksResult] = useState<{ key: string; books: Book[]; error?: string } | null>(
    null
  );
  const [booksRefresh, setBooksRefresh] = useState(0);
  const loading = booksResult?.key !== booksKey;
  const books = booksResult?.key === booksKey ? booksResult.books : [];

  // The grant dialog needs every title, not the Titles tab's filtered view:
  // searching or filtering the ledger must not empty the picker, nor leave it
  // blank while a filtered request is in flight.
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!hasClearance()) return;

    let cancelled = false;

    api
      .getAdminBooks({ per_page: 100 })
      .then((res) => {
        if (!cancelled) setAllBooks(res.data || []);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [booksRefresh]);

  const [loansResult, setLoansResult] = useState<{
    key: string;
    loans: ArchiveLoan[];
    error?: string;
  } | null>(null);
  const [loansRefresh, setLoansRefresh] = useState(0);
  const loansKey = loanStatus;
  const loansLoading = loansResult?.key !== loansKey;
  const loans = loansResult?.key === loansKey ? loansResult.loans : [];

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (!hasClearance()) return;

    api
      .getAdminArchiveReference()
      .then((res) => setReference(res.data))
      .catch((err) => console.error(err));

    api
      .getLibrarySettings()
      .then((res) => setPolicy(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!hasClearance()) return;

    let cancelled = false;
    const key = JSON.stringify([debouncedSearch, statusFilter]);

    api
      .getAdminBooks({
        search: debouncedSearch || undefined,
        status: (statusFilter || undefined) as BookStatus | undefined,
        per_page: 100,
      })
      .then((res) => {
        if (cancelled) return;
        setBooksResult({ key, books: res.data || [] });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setBooksResult({ key, books: [], error: 'The books could not be loaded.' });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, booksRefresh]);

  useEffect(() => {
    if (tab !== 'loans' || !hasClearance()) return;

    let cancelled = false;
    const key = loanStatus;

    api
      .getArchiveLoans({
        status: (key || undefined) as LoanStatus | undefined,
        per_page: 100,
      })
      .then((res) => {
        if (cancelled) return;
        setLoansResult({ key, loans: res.data || [] });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setLoansResult({ key, loans: [], error: 'The loans could not be loaded.' });
      });

    return () => {
      cancelled = true;
    };
  }, [tab, loanStatus, loansRefresh]);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  };

  const update = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setForm(bookToForm(book));
  };

  const handleSave = async () => {
    if (!form) return;

    if (!form.title.trim()) {
      showToast('error', 'A title is required.');
      return;
    }
    if (!form.author.trim()) {
      showToast('error', 'An author is required.');
      return;
    }
    if (!form.description.trim()) {
      showToast('error', 'A description is required.');
      return;
    }

    setSaving(true);
    try {
      const trimmedSlug = form.slug.trim();
      const payload: Partial<Book> = {
        title: form.title.trim(),
        // Left undefined on create so the server generates a slug.
        ...(trimmedSlug ? { slug: trimmedSlug } : {}),
        author: form.author.trim(),
        isbn: form.isbn.trim() || null,
        format: form.format,
        language: form.language.trim() || 'en',
        published_year: form.published_year.trim() || null,
        page_count: form.page_count === '' ? null : Number(form.page_count),
        short_description: form.short_description.trim() || null,
        description: form.description.trim(),
        cover_image: form.cover_image.trim() || null,
        file_url: form.file_url.trim() || null,
        purchase_price: form.purchase_price === '' ? 0 : Number(form.purchase_price),
        rental_price: form.rental_price === '' ? 0 : Number(form.rental_price),
        currency: form.currency.toUpperCase(),
        rental_days: form.rental_days === '' ? null : Number(form.rental_days),
        collection_id: form.collection_id ? Number(form.collection_id) : null,
        allow_purchase: form.allow_purchase,
        allow_rental: form.allow_rental,
        status: form.status,
        is_featured: form.is_featured,
        sort_order: form.sort_order === '' ? 0 : Number(form.sort_order),
      };

      if (editing) {
        await api.updateBook(editing.id, payload);
        showToast('success', 'Title updated.');
      } else {
        await api.createBook(payload);
        showToast('success', 'Title added to the library.');
      }

      setForm(null);
      setEditing(null);
      setBooksRefresh((k) => k + 1);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'The title could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (book: Book) => {
    setConfirm({
      title: 'Remove this title?',
      message: `"${book.title}" will be permanently removed from the archive. Titles with active reader loans must be archived instead.`,
      confirmLabel: 'Remove Title',
      onConfirm: async () => {
        try {
          await api.deleteBook(book.id);
          showToast('success', 'Title removed.');
          setBooksRefresh((k) => k + 1);
        } catch (err) {
          showToast('error', err instanceof Error ? err.message : 'The title could not be removed.');
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  const handleRevoke = (loan: ArchiveLoan) => {
    setConfirm({
      title: 'Revoke this access?',
      message: `${loan.reader?.name || 'This reader'} will immediately lose access to "${loan.book?.title}".`,
      confirmLabel: 'Revoke Access',
      onConfirm: async () => {
        try {
          await api.revokeArchiveAccess(loan.id);
          showToast('success', 'Access revoked.');
          setLoansRefresh((k) => k + 1);
        } catch (err) {
          showToast('error', err instanceof Error ? err.message : 'Access could not be revoked.');
        } finally {
          setConfirm(null);
        }
      },
    });
  };

  const handleGrant = async () => {
    if (!grantForm.book_id || !grantForm.user_id) {
      showToast('error', 'Select both a title and a reader.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.grantArchiveAccess({
        book_id: Number(grantForm.book_id),
        user_id: Number(grantForm.user_id),
        loan_type: grantForm.loan_type,
        rental_days: grantForm.rental_days === '' ? undefined : Number(grantForm.rental_days),
        note: grantForm.note.trim() || undefined,
      });
      showToast('success', res.message);
      setGrantOpen(false);
      setGrantForm({ book_id: '', user_id: '', loan_type: 'rental', rental_days: '', note: '' });
      setLoansRefresh((k) => k + 1);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Access could not be granted.');
    } finally {
      setSaving(false);
    }
  };

  const handlePolicySave = async () => {
    if (!policy) return;
    setPolicySaving(true);
    try {
      const res = await api.updateLibrarySettings(policy);
      setPolicy(res.data);
      showToast('success', 'Archive policy updated.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'The policy could not be saved.');
    } finally {
      setPolicySaving(false);
    }
  };

  return (
    <SecureGateLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h1 className="font-serif-luxury text-3xl text-white">Library</h1>
            <p className="text-xs text-white/40 font-light mt-2 max-w-2xl leading-relaxed">
              Manage the books in the library, track loans, and set the terms on which titles are
              sold and borrowed.
            </p>
          </div>
          {tab === 'titles' && (
            <div className="flex items-center gap-3">
              <Link
                href="/royal-archive"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition text-xs uppercase tracking-wider"
              >
                <ExternalLink className="w-3 h-3" />
                View Public Library
              </Link>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Title
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10">
          {(
            [
              ['titles', 'Titles', BookOpen],
              ['loans', 'Reader Loans', ScrollText],
              ['policy', 'Policy', Settings2],
            ] as [Tab, string, typeof BookOpen][]
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider border-b-2 -mb-px transition ${
                tab === key
                  ? 'border-[#C5A880] text-[#C5A880]'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {toast && (
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border text-xs ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            {toast.message}
          </div>
        )}

        {/* ============ TITLES ============ */}
        {tab === 'titles' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, author, ISBN"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} md:w-48`}
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24 text-white/40">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : booksResult?.key === booksKey && booksResult.error ? (
              <div className="text-center py-24 border border-dashed border-rose-500/25 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-rose-400/60 mx-auto mb-4" strokeWidth={1} />
                <p className="text-sm text-rose-300/80">{booksResult.error}</p>
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
                <BookOpen className="w-10 h-10 text-white/15 mx-auto mb-4" strokeWidth={1} />
                <p className="text-sm text-white/40">No books in the library yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {books.map((book) => (
                  <article
                    key={book.id}
                    className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition"
                  >
                    <div className="flex gap-4 p-5">
                      <div className="w-20 shrink-0 aspect-3/4 rounded-lg overflow-hidden bg-white/5">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white/15" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 grow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-wider ${
                              STATUS_STYLES[book.status] || STATUS_STYLES.draft
                            }`}
                          >
                            {book.status}
                          </span>
                          {book.is_featured && (
                            <span className="px-2 py-0.5 rounded-full border border-[#C5A880]/30 bg-[#C5A880]/10 text-[#C5A880] text-[9px] font-mono uppercase tracking-wider">
                              Featured
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif-luxury text-base text-white leading-snug line-clamp-2 mb-1">
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-white/40 line-clamp-1 mb-2">{book.author}</p>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-white/40">
                          <span className="uppercase">{book.format}</span>
                          {book.allow_purchase && <span>Sell {book.purchase_price}</span>}
                          {book.allow_rental && <span>Rent {book.rental_price}</span>}
                          <span>
                            {book.rental_days ? `${book.rental_days}d` : `${book.effective_rental_days}d default`}
                          </span>
                          <span>{book.loans_count ?? 0} loans</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-5 py-3 border-t border-white/5">
                      <Link
                        href={`/royal-archive/${book.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 transition"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                      <button
                        onClick={() => openEdit(book)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ LOANS ============ */}
        {tab === 'loans' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <select
                value={loanStatus}
                onChange={(e) => setLoanStatus(e.target.value)}
                className={`${inputClass} md:w-48`}
              >
                <option value="">All loans</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
              <button
                onClick={() => setGrantOpen(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Grant Access
              </button>
            </div>

            {loansLoading ? (
              <div className="flex items-center justify-center py-24 text-white/40">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : loansResult?.key === loansKey && loansResult.error ? (
              <div className="text-center py-24 border border-dashed border-rose-500/25 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-rose-400/60 mx-auto mb-4" strokeWidth={1} />
                <p className="text-sm text-rose-300/80">{loansResult.error}</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
                <ScrollText className="w-10 h-10 text-white/15 mx-auto mb-4" strokeWidth={1} />
                <p className="text-sm text-white/40">No loans recorded against these filters.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:border-white/20 transition"
                  >
                    <div className="grow min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase tracking-wider ${
                            LOAN_STATUS_STYLES[loan.status] || LOAN_STATUS_STYLES.expired
                          }`}
                        >
                          {loan.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/50 text-[9px] font-mono uppercase tracking-wider">
                          {loan.loan_type === 'purchase' ? 'Owned' : 'Rental'}
                        </span>
                        {loan.loan_type === 'rental' && (
                          <span className="text-[10px] font-mono text-white/35">
                            {loan.status === 'active'
                              ? `${loan.days_remaining}d left`
                              : loan.expires_at
                                ? `lapsed ${new Date(loan.expires_at).toLocaleDateString()}`
                                : 'no expiry'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white line-clamp-1">{loan.book?.title}</p>
                      <p className="text-[11px] text-white/40">
                        {loan.reader?.name} · {loan.reader?.email} · {loan.download_count} download
                        {loan.download_count === 1 ? '' : 's'}
                      </p>
                    </div>

                    {loan.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(loan)}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer self-start"
                      >
                        <Trash2 className="w-3 h-3" />
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ POLICY ============ */}
        {tab === 'policy' && policy && (
          <div className="max-w-3xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 px-5 py-4 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.purchase_enabled}
                  onChange={(e) => setPolicy({ ...policy, purchase_enabled: e.target.checked })}
                  className="w-4 h-4 accent-[#C5A880]"
                />
                <span>
                  <span className="block text-xs text-white">Permit outright acquisition</span>
                  <span className="block text-[10px] text-white/40">
                    Readers may buy perpetual licences to any priced title.
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-3 px-5 py-4 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={policy.rental_enabled}
                  onChange={(e) => setPolicy({ ...policy, rental_enabled: e.target.checked })}
                  className="w-4 h-4 accent-[#C5A880]"
                />
                <span>
                  <span className="block text-xs text-white">Permit rental terms</span>
                  <span className="block text-[10px] text-white/40">
                    Readers may borrow titles for a fixed period.
                  </span>
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Default Rental Term (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={policy.default_rental_days}
                  onChange={(e) => setPolicy({ ...policy, default_rental_days: Number(e.target.value) })}
                  className={inputClass}
                />
                <p className="text-[10px] text-white/30 mt-1.5">
                  Applies to any title that does not set its own term.
                </p>
              </div>

              <div>
                <label className={labelClass}>Maximum Permitted Term (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={policy.max_rental_days}
                  onChange={(e) => setPolicy({ ...policy, max_rental_days: Number(e.target.value) })}
                  className={inputClass}
                />
                <p className="text-[10px] text-white/30 mt-1.5">
                  Longest loan an administrator can grant manually.
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Purchase Terms</label>
              <textarea
                rows={3}
                value={policy.purchase_terms}
                onChange={(e) => setPolicy({ ...policy, purchase_terms: e.target.value })}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className={labelClass}>Rental Terms</label>
              <textarea
                rows={3}
                value={policy.rental_terms}
                onChange={(e) => setPolicy({ ...policy, rental_terms: e.target.value })}
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              onClick={handlePolicySave}
              disabled={policySaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition"
            >
              {policySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Policy
            </button>
          </div>
        )}
      </div>

      {/* ============ TITLE MODAL ============ */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-8">
          <div className="bg-[#121212] border border-[#2A2620] rounded-2xl w-full max-w-3xl text-white shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A880]/10 border border-[#C5A880]/25 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">
                    {editing ? 'Edit Title' : 'Add to the library'}
                  </h3>
                  <p className="text-[10px] text-white/35 font-mono uppercase tracking-wider">
                    {editing ? editing.slug : 'New book entry'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setForm(null);
                  setEditing(null);
                }}
                className="text-white/40 hover:text-white transition p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) =>
                        prev
                          ? {
                              ...prev,
                              title: value,
                              // Only auto-slug while creating, so edits never
                              // silently change a live URL.
                              slug: editing ? prev.slug : toSlug(value),
                            }
                          : prev
                      );
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Author</label>
                  <input value={form.author} onChange={(e) => update('author', e.target.value)} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>ISBN</label>
                  <input value={form.isbn} onChange={(e) => update('isbn', e.target.value)} className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => update('slug', toSlug(e.target.value))}
                    placeholder="auto-generated"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Collection</label>
                  <select
                    value={form.collection_id}
                    onChange={(e) => update('collection_id', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Uncollected</option>
                    {reference?.collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Short Description</label>
                <input
                  value={form.short_description}
                  onChange={(e) => update('short_description', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Format</label>
                  <select
                    value={form.format}
                    onChange={(e) => update('format', e.target.value as BookFormat)}
                    className={inputClass}
                  >
                    <option value="pdf">PDF</option>
                    <option value="epub">EPUB</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Year</label>
                  <input
                    value={form.published_year}
                    onChange={(e) => update('published_year', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Pages</label>
                  <input
                    type="number"
                    min={1}
                    value={form.page_count}
                    onChange={(e) => update('page_count', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Sort Order</label>
                  <input
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={(e) => update('sort_order', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Commercial terms */}
              <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl space-y-4">
                <p className="text-[10px] font-mono text-white/35 uppercase tracking-wider">Acquisition Terms</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Purchase Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.purchase_price}
                      onChange={(e) => update('purchase_price', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Rental Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.rental_price}
                      onChange={(e) => update('rental_price', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <input
                      value={form.currency}
                      onChange={(e) => update('currency', e.target.value.toUpperCase().slice(0, 3))}
                      maxLength={3}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Rental Term Override (days)</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={form.rental_days}
                      onChange={(e) => update('rental_days', e.target.value)}
                      placeholder={policy ? `default ${policy.default_rental_days}` : 'library default'}
                      className={inputClass}
                    />
                    <p className="text-[10px] text-white/30 mt-1.5">
                      Leave blank to use the library default.
                    </p>
                  </div>

                  <div className="flex flex-col justify-end gap-3 pb-6">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allow_purchase}
                        onChange={(e) => update('allow_purchase', e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#C5A880]"
                      />
                      <span className="text-xs text-white/70">Offer for purchase</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allow_rental}
                        onChange={(e) => update('allow_rental', e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#C5A880]"
                      />
                      <span className="text-xs text-white/70">Offer for rental</span>
                    </label>
                  </div>
                </div>

                <p className="text-[10px] text-white/30 leading-relaxed">
                  A pricing option with no price is hidden from the catalog automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Cover Image URL</label>
                  <input
                    value={form.cover_image}
                    onChange={(e) => update('cover_image', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Protected File URL</label>
                  <input
                    value={form.file_url}
                    onChange={(e) => update('file_url', e.target.value)}
                    placeholder="https://cdn.example.com/…"
                    className={inputClass}
                  />
                  <p className="text-[10px] text-white/30 mt-1.5">
                    Never exposed publicly; released only through a signed link.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => update('status', e.target.value as BookStatus)}
                    className={inputClass}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <label className="flex items-center gap-2.5 pt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => update('is_featured', e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#C5A880]"
                  />
                  <span className="text-xs text-white/70">Feature on the catalog</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setForm(null);
                  setEditing(null);
                }}
                className="px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editing ? 'Save Changes' : 'Add to Library'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ GRANT MODAL ============ */}
      {grantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#121212] border border-[#2A2620] rounded-2xl w-full max-w-lg text-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C5A880]/10 border border-[#C5A880]/25 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#C5A880]" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Grant Access</h3>
                  <p className="text-[10px] text-white/35 font-mono uppercase tracking-wider">
                    Complimentary copy or extension
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGrantOpen(false)}
                className="text-white/40 hover:text-white transition p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <select
                  value={grantForm.book_id}
                  onChange={(e) => setGrantForm({ ...grantForm, book_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select a title…</option>
                  {allBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Reader</label>
                <select
                  value={grantForm.user_id}
                  onChange={(e) => setGrantForm({ ...grantForm, user_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select a reader…</option>
                  {reference?.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Basis</label>
                  <select
                    value={grantForm.loan_type}
                    onChange={(e) => setGrantForm({ ...grantForm, loan_type: e.target.value as LoanType })}
                    className={inputClass}
                  >
                    <option value="rental">Rental</option>
                    <option value="purchase">Perpetual</option>
                  </select>
                </div>
                {grantForm.loan_type === 'rental' && (
                  <div>
                    <label className={labelClass}>Term (days)</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={grantForm.rental_days}
                      onChange={(e) => setGrantForm({ ...grantForm, rental_days: e.target.value })}
                      placeholder={policy ? String(policy.default_rental_days) : '14'}
                      className={inputClass}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Note</label>
                <textarea
                  rows={2}
                  value={grantForm.note}
                  onChange={(e) => setGrantForm({ ...grantForm, note: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setGrantOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGrant}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CONFIRM ============ */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121212] border border-[#2A2620] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">{confirm.title}</h3>
                  <p className="text-xs text-white/50">Admin action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="text-white/40 hover:text-white transition p-1 cursor-pointer"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{confirm.message}</p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                disabled={confirmPending}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runConfirm}
                disabled={confirmPending}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {confirmPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {confirmPending ? 'Working' : confirm.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SecureGateLayout>
  );
}
