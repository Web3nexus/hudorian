'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Sliders,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Building,
  Landmark,
  ArrowUpRight,
  FileText,
  Check,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGatePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Modals
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Manual Transfer Review Modal
  const [reviewPayment, setReviewPayment] = useState<any | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

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
    const params: { status?: string; provider?: string } = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (providerFilter !== 'all') params.provider = providerFilter;

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
      fetchPayments();
    } catch {
      setActionMsg({ type: 'error', text: 'Failed to process refund.' });
    }
  };

  return (
    <SecureGateLayout
      title="Financial Ledger & Vault"
      subtitle="Audited record of membership contributions, suite bookings, and private event admissions."
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/50 font-mono mr-1">Status:</span>
            {['all', 'paid', 'pending', 'rejected', 'refunded'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition ${
                  statusFilter === st
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={fetchPayments}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
              title="Refresh ledger"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/30 text-amber-300 text-xs font-medium transition"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Configure Gateways
            </button>
          </div>
        </div>

        {actionMsg && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
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

        {/* Payments Table */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Loading financial transactions...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center text-white/50 text-xs font-light">
              No transactions matching the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Transaction Ref</th>
                    <th className="p-4">Member / Candidate</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Gateway / Method</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {payments.map((p) => {
                    const isManual = p.provider === 'manual_transfer';
                    const isFlutterwave = p.provider === 'flutterwave';
                    const isPaystack = p.provider === 'paystack';

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6 font-mono text-white">
                          <span className="block font-medium">{p.transaction_id || `TX-HUD-${p.id}`}</span>
                          {p.metadata?.transfer_reference && (
                            <span className="text-[10px] text-amber-400/80 font-mono block">
                              Ref: {p.metadata.transfer_reference}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-white">{p.user?.name || p.metadata?.user_name || 'Anonymous Patron'}</div>
                          <div className="text-[11px] text-white/50 font-mono">{p.user?.email || p.metadata?.user_email || '—'}</div>
                        </td>
                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                          {p.currency === 'EUR' ? '€' : p.currency + ' '}
                          {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 font-mono">
                          {isFlutterwave && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px]">
                              Flutterwave
                            </span>
                          )}
                          {isPaystack && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px]">
                              Paystack
                            </span>
                          )}
                          {isManual && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                              <Landmark className="w-3 h-3" /> Manual Wire
                            </span>
                          )}
                          {!isFlutterwave && !isPaystack && !isManual && (
                            <span className="text-white/60 text-[11px] capitalize">{p.provider || 'Vault Card'}</span>
                          )}
                        </td>
                        <td className="p-4 text-white/60 font-mono text-[11px]">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono capitalize ${
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
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          {p.status === 'pending' && isManual && (
                            <button
                              onClick={() => setReviewPayment(p)}
                              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition"
                            >
                              Review & Clear
                            </button>
                          )}
                          {p.status === 'pending' && !isManual && (
                            <button
                              onClick={() => {
                                api.verifyPayment({
                                  gateway: isFlutterwave ? 'flutterwave' : 'paystack',
                                  reference: p.transaction_id,
                                  transaction_id: p.transaction_id,
                                }).then(() => {
                                  setActionMsg({ type: 'success', text: 'Transaction status re-verified.' });
                                  fetchPayments();
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition"
                            >
                              Verify
                            </button>
                          )}
                          {p.status === 'paid' && (
                            <button
                              onClick={() => handleRefund(p.id)}
                              className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition"
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

      {/* Manual Wire Review Modal */}
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
                <span className="text-white font-sans">{reviewPayment.user?.name || reviewPayment.metadata?.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Email:</span>
                <span className="text-white">{reviewPayment.user?.email || reviewPayment.metadata?.user_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Amount:</span>
                <span className="text-amber-400 font-serif-luxury text-sm">€{Number(reviewPayment.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Wire Reference:</span>
                <span className="text-amber-300 font-bold">{reviewPayment.metadata?.transfer_reference || reviewPayment.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Sender Bank:</span>
                <span className="text-white">{reviewPayment.metadata?.sender_bank || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Sender Account Name:</span>
                <span className="text-white">{reviewPayment.metadata?.sender_account_name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Transfer Date:</span>
                <span className="text-white">{reviewPayment.metadata?.transfer_date || 'Recent'}</span>
              </div>
              {reviewPayment.metadata?.proof_notes && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-white/40 block mb-1">Patron Notes / Memo:</span>
                  <p className="text-white/90 font-sans italic">{reviewPayment.metadata.proof_notes}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-white/50 font-mono block mb-1">
                Treasury Verification Notes (Optional)
              </label>
              <input
                type="text"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="e.g. Confirmed on Barclays statement line #482"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-hidden focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={processingAction}
                onClick={() => handleReject(reviewPayment.id)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium transition disabled:opacity-50"
              >
                Reject Wire
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewPayment(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processingAction}
                  onClick={() => handleApprove(reviewPayment.id)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-semibold shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
                >
                  {processingAction ? 'Activating Member...' : 'Approve & Issue Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Configuration Drawer / Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif-luxury text-xl text-white">Payment Gateway Configuration</h3>
                <p className="text-xs text-white/50">Manage Flutterwave, Paystack, and Manual Wire credentials.</p>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-white/50 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* Flutterwave Card */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-400" />
                    <h4 className="text-sm font-semibold text-white">Flutterwave</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={settings.flutterwave_enabled}
                      onChange={(e) => setSettings({ ...settings, flutterwave_enabled: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Enable Gateway</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Public Key</label>
                    <input
                      type="text"
                      placeholder="FLWPUBK_TEST-..."
                      value={settings.flutterwave_public_key}
                      onChange={(e) => setSettings({ ...settings, flutterwave_public_key: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Secret Key</label>
                    <div className="relative">
                      <input
                        type={showSecrets ? 'text' : 'password'}
                        placeholder="FLWSECK_TEST-..."
                        value={settings.flutterwave_secret_key}
                        onChange={(e) => setSettings({ ...settings, flutterwave_secret_key: e.target.value })}
                        className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Encryption Key (Optional)</label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      placeholder="FLWSECK_ENCR-..."
                      value={settings.flutterwave_encryption_key}
                      onChange={(e) => setSettings({ ...settings, flutterwave_encryption_key: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Webhook Secret Hash</label>
                    <input
                      type="text"
                      placeholder="e.g. hudorian_flw_secret"
                      value={settings.flutterwave_webhook_secret}
                      onChange={(e) => setSettings({ ...settings, flutterwave_webhook_secret: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Paystack Card */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">Paystack</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={settings.paystack_enabled}
                      onChange={(e) => setSettings({ ...settings, paystack_enabled: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Enable Gateway</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Public Key</label>
                    <input
                      type="text"
                      placeholder="pk_test_... or pk_live_..."
                      value={settings.paystack_public_key}
                      onChange={(e) => setSettings({ ...settings, paystack_public_key: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Secret Key</label>
                    <input
                      type={showSecrets ? 'text' : 'password'}
                      placeholder="sk_test_... or sk_live_..."
                      value={settings.paystack_secret_key}
                      onChange={(e) => setSettings({ ...settings, paystack_secret_key: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-white/50 font-mono block mb-1">Webhook Secret (Optional)</label>
                    <input
                      type="text"
                      placeholder="Secret for signature verification"
                      value={settings.paystack_webhook_secret}
                      onChange={(e) => setSettings({ ...settings, paystack_webhook_secret: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Manual Bank Wire Card */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-semibold text-white">Manual Bank Wire Details</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={settings.manual_enabled}
                      onChange={(e) => setSettings({ ...settings, manual_enabled: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span>Enable Manual Wire</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={settings.manual_bank_name}
                      onChange={(e) => setSettings({ ...settings, manual_bank_name: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Account Beneficiary Name</label>
                    <input
                      type="text"
                      value={settings.manual_account_name}
                      onChange={(e) => setSettings({ ...settings, manual_account_name: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Account Number</label>
                    <input
                      type="text"
                      value={settings.manual_account_number}
                      onChange={(e) => setSettings({ ...settings, manual_account_number: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">IBAN</label>
                    <input
                      type="text"
                      value={settings.manual_iban}
                      onChange={(e) => setSettings({ ...settings, manual_iban: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      value={settings.manual_swift_bic}
                      onChange={(e) => setSettings({ ...settings, manual_swift_bic: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 font-mono block mb-1">Sort Code / Routing Number</label>
                    <input
                      type="text"
                      value={settings.manual_sort_code}
                      onChange={(e) => setSettings({ ...settings, manual_sort_code: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-xs focus:border-amber-500/50"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-white/50 font-mono block mb-1">Wire Transfer Instructions</label>
                    <textarea
                      rows={2}
                      value={settings.manual_instructions}
                      onChange={(e) => setSettings({ ...settings, manual_instructions: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Secrets Toggle & Action */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition"
                >
                  {showSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showSecrets ? 'Hide API Secrets' : 'Reveal API Secrets'}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSettingsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-semibold shadow-lg shadow-amber-950/40 transition disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving...' : 'Save Configurations'}
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
