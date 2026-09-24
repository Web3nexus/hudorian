'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  CreditCard,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sliders,
  X,
  ExternalLink,
  Eye,
  Building,
  Landmark,
  ArrowUpRight,
  FileText,
  Check,
  Search,
  Download,
  Copy,
  Clock,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

export default function SecureGatePaymentsPage() {
  const { currency, setCurrency, formatPrice, availableCurrencies } = useCurrency();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Manual Transfer Review Modal
  const [reviewPayment, setReviewPayment] = useState<any | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Inspect Transaction Modal
  const [inspectPayment, setInspectPayment] = useState<any | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    flutterwave_enabled: false,
    flutterwave_public_key: '',
    flutterwave_secret_key: '',
    flutterwave_encryption_key: '',
    flutterwave_webhook_secret: '',

    paystack_enabled: false,
    paystack_public_key: '',
    paystack_secret_key: '',
    paystack_webhook_secret: '',

    manual_enabled: true,
    manual_bank_name: 'Coutts & Co / Barclays Private Bank',
    manual_account_name: 'HUDORIAN SANCTUARY LIMITED',
    manual_account_number: '88291048',
    manual_iban: 'GB29BARC20000088291048',
    manual_swift_bic: 'BARCGB22',
    manual_sort_code: '20-00-00',
    manual_instructions: 'Please quote your Full Name or Membership Dossier Reference as the wire transfer reference.',

    default_currency: 'EUR',
  });

  const fetchPayments = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hudorian_admin_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params: { status?: string; provider?: string; search?: string } = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (providerFilter !== 'all') params.provider = providerFilter;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    api.getAdminPayments(params)
      .then((res: any) => {
        if (res && res.data) {
          setPayments(Array.isArray(res.data) ? res.data : res.data.data || []);
        }
      })
      .catch((err) => console.warn('Payments could not be fetched:', err))
      .finally(() => setLoading(false));
  };

  const fetchSettings = () => {
    api.getAdminPaymentSettings()
      .then((res: any) => {
        if (res && res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
        }
      })
      .catch((err) => console.warn('Payment settings fetch failed:', err));
  };

  useEffect(() => {
    fetchPayments();
    fetchSettings();
  }, [statusFilter, providerFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setActionMsg(null);
    try {
      await api.updateAdminPaymentSettings(settings);
      setActionMsg({ type: 'success', text: 'Payment gateways and manual bank coordinates updated successfully.' });
      setSettingsModalOpen(false);
      fetchSettings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment settings';
      setActionMsg({ type: 'error', text: msg });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleApprove = async (paymentId: number) => {
    setProcessingAction(true);
    setActionMsg(null);
    try {
      await api.approveManualPayment(paymentId, approvalNotes || 'Approved via SecureGate Admin Treasury');
      setActionMsg({ type: 'success', text: `Payment #${paymentId} confirmed. Official invoice issued and membership activated.` });
      setReviewPayment(null);
      setInspectPayment(null);
      setApprovalNotes('');
      fetchPayments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve payment';
      setActionMsg({ type: 'error', text: msg });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async (paymentId: number) => {
    const reason = prompt('Please enter the reason for rejecting this payment (e.g. Reference not found on bank statement):');
    if (!reason) return;
    setProcessingAction(true);
    setActionMsg(null);
    try {
      await api.rejectManualPayment(paymentId, reason);
      setActionMsg({ type: 'success', text: `Payment #${paymentId} has been rejected.` });
      setReviewPayment(null);
      setInspectPayment(null);
      fetchPayments();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject payment';
      setActionMsg({ type: 'error', text: msg });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRefund = async (paymentId: number) => {
    if (!confirm('Are you sure you wish to process a refund for this transaction?')) return;
    setActionMsg(null);
    try {
      await api.refundPayment(paymentId, 'Refund authorized via SecureGate Admin');
      setActionMsg({ type: 'success', text: `Refund transaction initiated for payment #${paymentId}.` });
      setInspectPayment(null);
      fetchPayments();
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to process refund.' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Payments (Client Search Fallback)
  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter((p) => {
      const ref = (p.transaction_id || `TX-HUD-${p.id}`).toLowerCase();
      const userName = (p.user?.name || p.metadata?.user_name || '').toLowerCase();
      const userEmail = (p.user?.email || p.metadata?.user_email || '').toLowerCase();
      const wireRef = (p.metadata?.transfer_reference || '').toLowerCase();
      return ref.includes(q) || userName.includes(q) || userEmail.includes(q) || wireRef.includes(q);
    });
  }, [payments, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalVol = 0;
    let paidVol = 0;
    let pendingVol = 0;
    let pendingCount = 0;
    let refundedVol = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      totalVol += amt;
      if (p.status === 'paid') paidVol += amt;
      if (p.status === 'pending') {
        pendingVol += amt;
        pendingCount += 1;
      }
      if (p.status === 'refunded') refundedVol += amt;
    });

    return { totalVol, paidVol, pendingVol, pendingCount, refundedVol };
  }, [payments]);

  // Export to CSV Function
  const handleExportCsv = () => {
    if (filteredPayments.length === 0) {
      alert('No transactions available to export.');
      return;
    }

    const headers = [
      'Transaction ID',
      'Transaction Ref',
      'Patron Name',
      'Patron Email',
      'Amount',
      'Currency',
      'Status',
      'Gateway / Method',
      'Wire Reference',
      'Date & Time',
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      `"${p.transaction_id || `TX-HUD-${p.id}`}"`,
      `"${(p.user?.name || p.metadata?.user_name || 'Guest / Candidate').replace(/"/g, '""')}"`,
      `"${(p.user?.email || p.metadata?.user_email || '—').replace(/"/g, '""')}"`,
      Number(p.amount || 0).toFixed(2),
      p.currency || 'EUR',
      p.status || 'unknown',
      p.provider || 'manual',
      `"${(p.metadata?.transfer_reference || '—').replace(/"/g, '""')}"`,
      `"${p.created_at ? new Date(p.created_at).toISOString() : '—'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hudorian-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SecureGateLayout
      title="Transactions & Treasury Ledger"
      subtitle="Audited financial ledger of membership contributions, suite bookings, gateway settlements, and bank wires."
      actions={
        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
            {availableCurrencies.map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  currency === c.code
                    ? 'bg-[#C5A880] text-black font-semibold shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {c.symbol} {c.code}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer border border-white/10"
            title="Download CSV export"
          >
            <Download className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Export CSV</span>
          </button>

          {/* Gateway Settings */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer shadow-lg shadow-[#B8976C]/10"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Gateways</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Volume */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-mono uppercase tracking-wider">Total Volume</span>
              <CreditCard className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div className="font-serif-luxury text-2xl text-white font-medium">
              {formatPrice(metrics.totalVol)}
            </div>
            <div className="text-[11px] font-mono text-white/40">
              {filteredPayments.length} transactions recorded
            </div>
          </div>

          {/* Settled & Paid */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-mono uppercase tracking-wider">Settled & Verified</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-serif-luxury text-2xl text-emerald-400 font-medium">
              {formatPrice(metrics.paidVol)}
            </div>
            <div className="text-[11px] font-mono text-emerald-400/80">
              Cleared into vault
            </div>
          </div>

          {/* Pending Verification */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-mono uppercase tracking-wider">Pending Verification</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-serif-luxury text-2xl text-amber-300 font-medium">
              {formatPrice(metrics.pendingVol)}
            </div>
            <div className="text-[11px] font-mono text-amber-400/80 flex items-center gap-1">
              <span>{metrics.pendingCount} awaiting steward clearance</span>
            </div>
          </div>

          {/* Refunded / Returns */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-white/50">
              <span className="text-xs font-mono uppercase tracking-wider">Refunds & Adjustments</span>
              <Landmark className="w-4 h-4 text-purple-400" />
            </div>
            <div className="font-serif-luxury text-2xl text-purple-300 font-medium">
              {formatPrice(metrics.refundedVol)}
            </div>
            <div className="text-[11px] font-mono text-white/40">
              Authorized reversals
            </div>
          </div>
        </div>

        {/* Action Message Alert */}
        {actionMsg && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
              actionMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {actionMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMsg.text}</span>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/40 font-mono mr-1">Status:</span>
            {['all', 'paid', 'pending', 'rejected', 'refunded'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 font-medium'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {st === 'paid' ? 'Paid / Settled' : st}
              </button>
            ))}

            <span className="text-xs text-white/40 font-mono ml-3 mr-1">Gateway:</span>
            {['all', 'flutterwave', 'paystack', 'manual_transfer'].map((pv) => (
              <button
                key={pv}
                onClick={() => setProviderFilter(pv)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize transition cursor-pointer ${
                  providerFilter === pv
                    ? 'bg-[#C5A880]/20 text-[#C5A880] border border-[#C5A880]/40 font-medium'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {pv === 'all'
                  ? 'All'
                  : pv === 'manual_transfer'
                  ? 'Manual Wire'
                  : pv === 'flutterwave'
                  ? 'Flutterwave'
                  : 'Paystack'}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative grow lg:w-72">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ref, patron, or email..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A880]"
              />
            </div>
            <button
              type="button"
              onClick={fetchPayments}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Executive Transactions Table */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Loading financial transactions from SecureGate vault...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-16 text-center text-white/50 text-xs font-light">
              No transactions matching the selected filters or search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Transaction Ref</th>
                    <th className="p-4">Patron / Candidate</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Gateway / Method</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredPayments.map((p) => {
                    const isManual = p.provider === 'manual_transfer' || p.provider === 'manual';
                    const isFlutterwave = p.provider === 'flutterwave';
                    const isPaystack = p.provider === 'paystack';
                    const refString = p.transaction_id || `TX-HUD-${p.id}`;

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6 font-mono text-white">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-white/90">{refString}</span>
                            <button
                              onClick={() => copyToClipboard(refString)}
                              className="text-white/30 hover:text-[#C5A880] transition"
                              title="Copy reference"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedId === refString && (
                              <span className="text-[10px] text-emerald-400 font-mono">Copied</span>
                            )}
                          </div>
                          {p.metadata?.transfer_reference && (
                            <span className="text-[10px] text-amber-400/90 font-mono block mt-0.5">
                              Wire Ref: {p.metadata.transfer_reference}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-white">
                            {p.user?.name || p.metadata?.user_name || 'Guest / Candidate'}
                          </div>
                          <div className="text-[11px] text-white/50 font-mono">
                            {p.user?.email || p.metadata?.user_email || '—'}
                          </div>
                        </td>

                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                          {formatPrice(Number(p.amount))}
                          <span className="text-[10px] font-mono text-white/40 block">
                            Orig: {p.currency} {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td className="p-4 font-mono">
                          {isFlutterwave && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px]">
                              Flutterwave
                            </span>
                          )}
                          {isPaystack && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px]">
                              Paystack
                            </span>
                          )}
                          {isManual && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                              <Landmark className="w-3 h-3" /> Manual Wire
                            </span>
                          )}
                          {!isFlutterwave && !isPaystack && !isManual && (
                            <span className="text-white/60 text-[11px] capitalize">{p.provider || 'Vault Card'}</span>
                          )}
                        </td>

                        <td className="p-4 text-white/60 font-mono text-[11px]">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '—'}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                              p.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : p.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse'
                                : p.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : p.status === 'refunded'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-white/10 text-white/70'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{p.status === 'paid' ? 'Paid / Settled' : p.status}</span>
                          </span>
                        </td>

                        <td className="p-4 pr-6 text-right space-x-1.5">
                          {/* Inspect Modal Trigger */}
                          <button
                            onClick={() => setInspectPayment(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer"
                            title="Inspect dossier"
                          >
                            <Eye className="w-3 h-3 text-[#C5A880]" />
                            <span>Inspect</span>
                          </button>

                          {/* Quick Manual Review */}
                          {p.status === 'pending' && isManual && (
                            <button
                              onClick={() => setReviewPayment(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition cursor-pointer"
                            >
                              Review & Clear
                            </button>
                          )}

                          {/* Quick Gateway Verify */}
                          {p.status === 'pending' && !isManual && (
                            <button
                              onClick={() => {
                                api.verifyPayment({
                                  gateway: isFlutterwave ? 'flutterwave' : 'paystack',
                                  reference: p.transaction_id,
                                  transaction_id: p.transaction_id,
                                }).then(() => {
                                  setActionMsg({ type: 'success', text: 'Transaction status re-verified from gateway.' });
                                  fetchPayments();
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition cursor-pointer"
                            >
                              Verify
                            </button>
                          )}

                          {/* Quick Refund */}
                          {p.status === 'paid' && (
                            <button
                              onClick={() => handleRefund(p.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: INSPECT TRANSACTION DOSSIER MODAL               */}
      {/* ======================================================== */}
      {inspectPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121215] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#C5A880]" />
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Transaction Dossier</h3>
                  <p className="text-[10px] font-mono text-white/40">
                    ID #{inspectPayment.id} • Ref: {inspectPayment.transaction_id || `TX-HUD-${inspectPayment.id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectPayment(null)}
                className="text-white/50 hover:text-white transition p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs">
              {/* Status Header Bar */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Settlement Status</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono capitalize mt-1 ${
                      inspectPayment.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : inspectPayment.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{inspectPayment.status === 'paid' ? 'Paid / Settled' : inspectPayment.status}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-white/40 uppercase block">Total Amount</span>
                  <div className="font-serif-luxury text-2xl text-white font-medium">
                    {formatPrice(Number(inspectPayment.amount))}
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    {inspectPayment.currency} {Number(inspectPayment.amount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Patron & Purpose Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Patron Details</span>
                  <p className="font-medium text-white text-sm">
                    {inspectPayment.user?.name || inspectPayment.metadata?.user_name || 'Guest / Candidate'}
                  </p>
                  <p className="font-mono text-white/50 text-[11px]">
                    {inspectPayment.user?.email || inspectPayment.metadata?.user_email || '—'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Gateway & Channel</span>
                  <p className="font-mono text-white text-sm capitalize">
                    {inspectPayment.provider || 'manual_transfer'}
                  </p>
                  <p className="font-mono text-[#C5A880] text-[11px]">
                    Method: {inspectPayment.payment_method || 'Bank Transfer / Card'}
                  </p>
                </div>
              </div>

              {/* Wire Reference / Metadata */}
              {inspectPayment.metadata?.transfer_reference && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-amber-300 uppercase">Bank Wire Transfer Reference</span>
                  <p className="font-mono text-white text-sm font-semibold">
                    {inspectPayment.metadata.transfer_reference}
                  </p>
                  {inspectPayment.metadata.notes && (
                    <p className="text-white/70 text-xs italic mt-1">
                      Notes: {inspectPayment.metadata.notes}
                    </p>
                  )}
                </div>
              )}

              {/* Timestamps */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-white/60 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Initiated:</span>
                  <span className="text-white">{new Date(inspectPayment.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-white">{new Date(inspectPayment.updated_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(inspectPayment, null, 2))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition text-xs font-mono"
                >
                  Copy JSON Log
                </button>

                <div className="flex items-center gap-2">
                  {inspectPayment.status === 'pending' && (inspectPayment.provider === 'manual_transfer' || inspectPayment.provider === 'manual') && (
                    <>
                      <button
                        onClick={() => handleReject(inspectPayment.id)}
                        disabled={processingAction}
                        className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(inspectPayment.id)}
                        disabled={processingAction}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition cursor-pointer"
                      >
                        Clear & Activate
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setInspectPayment(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: MANUAL WIRE REVIEW MODAL                        */}
      {/* ======================================================== */}
      {reviewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-luxury text-lg text-white">Manual Wire Transfer Clearance</h3>
              </div>
              <button
                onClick={() => setReviewPayment(null)}
                className="text-white/50 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 text-xs text-white/80 font-mono">
              <div className="flex justify-between">
                <span className="text-white/40">Patron:</span>
                <span className="text-white">{reviewPayment.user?.name || reviewPayment.metadata?.user_name || 'Guest / Candidate'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Amount:</span>
                <span className="text-[#C5A880] font-semibold">{formatPrice(Number(reviewPayment.amount))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Wire Reference:</span>
                <span className="text-amber-300 font-bold">{reviewPayment.metadata?.transfer_reference || 'None provided'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-white/50 font-mono">Steward Verification Notes (Optional)</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="e.g. Verified on Barclays Private Bank ledger at 14:30 UTC"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C5A880] resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleReject(reviewPayment.id)}
                disabled={processingAction}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition cursor-pointer"
              >
                Reject Wire
              </button>
              <button
                onClick={() => handleApprove(reviewPayment.id)}
                disabled={processingAction}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 hover:from-emerald-500/40 hover:to-emerald-600/40 border border-emerald-500/50 text-emerald-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Clear & Issue Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: GATEWAY & BANKING CONFIGURATION MODAL          */}
      {/* ======================================================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-lg text-white">Payment Gateway & Treasury Settings</h3>
                <p className="text-xs text-white/50">Manage Flutterwave, Paystack, and Manual Wire bank accounts.</p>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-white/50 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Flutterwave Section */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="font-semibold text-white">Flutterwave Gateway</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.flutterwave_enabled}
                      onChange={(e) => setSettings({ ...settings, flutterwave_enabled: e.target.checked })}
                      className="rounded border-white/20 bg-white/5 text-[#C5A880] focus:ring-0"
                    />
                    <span className="text-white/70">Enabled</span>
                  </label>
                </div>

                {settings.flutterwave_enabled && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">Public Key</label>
                      <input
                        type="text"
                        value={settings.flutterwave_public_key}
                        onChange={(e) => setSettings({ ...settings, flutterwave_public_key: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">Secret Key</label>
                      <input
                        type={showSecrets ? 'text' : 'password'}
                        value={settings.flutterwave_secret_key}
                        onChange={(e) => setSettings({ ...settings, flutterwave_secret_key: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Paystack Section */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-semibold text-white">Paystack Gateway</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.paystack_enabled}
                      onChange={(e) => setSettings({ ...settings, paystack_enabled: e.target.checked })}
                      className="rounded border-white/20 bg-white/5 text-[#C5A880] focus:ring-0"
                    />
                    <span className="text-white/70">Enabled</span>
                  </label>
                </div>

                {settings.paystack_enabled && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">Public Key</label>
                      <input
                        type="text"
                        value={settings.paystack_public_key}
                        onChange={(e) => setSettings({ ...settings, paystack_public_key: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">Secret Key</label>
                      <input
                        type={showSecrets ? 'text' : 'password'}
                        value={settings.paystack_secret_key}
                        onChange={(e) => setSettings({ ...settings, paystack_secret_key: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Bank Wire Section */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-white">Direct Wire Transfer Coordinates</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.manual_enabled}
                      onChange={(e) => setSettings({ ...settings, manual_enabled: e.target.checked })}
                      className="rounded border-white/20 bg-white/5 text-[#C5A880] focus:ring-0"
                    />
                    <span className="text-white/70">Enabled</span>
                  </label>
                </div>

                {settings.manual_enabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">Bank Institution Name</label>
                      <input
                        type="text"
                        value={settings.manual_bank_name}
                        onChange={(e) => setSettings({ ...settings, manual_bank_name: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">Account Name</label>
                      <input
                        type="text"
                        value={settings.manual_account_name}
                        onChange={(e) => setSettings({ ...settings, manual_account_name: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">IBAN / Account Number</label>
                      <input
                        type="text"
                        value={settings.manual_iban || settings.manual_account_number}
                        onChange={(e) => setSettings({ ...settings, manual_iban: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/40 mb-1 font-mono text-[10px]">SWIFT / BIC</label>
                      <input
                        type="text"
                        value={settings.manual_swift_bic}
                        onChange={(e) => setSettings({ ...settings, manual_swift_bic: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="text-xs text-white/40 hover:text-white transition font-mono"
                >
                  {showSecrets ? 'Hide API Secrets' : 'Reveal API Secrets'}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSettingsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg cursor-pointer"
                  >
                    {savingSettings ? 'Saving...' : 'Save Coordinates'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </SecureGateLayout>
  );
}
