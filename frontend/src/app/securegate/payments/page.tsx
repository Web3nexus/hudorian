'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGatePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchPayments = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hudorian_admin_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getAdminPayments()
      .then((res: any) => {
        if (res && res.data) setPayments(res.data);
      })
      .catch((err) => console.warn('Payments could not be fetched:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async (paymentId: number) => {
    if (!confirm('Are you sure you wish to process a refund for this transaction?')) return;
    setActionMsg(null);
    try {
      await api.refundPayment(paymentId, 'Refund authorized via SecureGate Admin');
      setActionMsg(`Refund transaction initiated for payment #${paymentId}.`);
      fetchPayments();
    } catch {
      setActionMsg('Failed to process refund.');
    }
  };

  return (
    <SecureGateLayout
      title="Financial Ledger & Vault"
      subtitle="Audited record of membership contributions, suite bookings, and private event admissions."
    >
      <div className="space-y-6">
        {actionMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Loading financial transactions...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center text-white/50 text-xs font-light">
              No transactions recorded in vault.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Transaction ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method / Provider</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 pl-6 font-mono text-white">
                        {p.transaction_id || `TX-HUD-${p.id}`}
                      </td>
                      <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                        €{Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 font-mono text-white/60">
                        {p.payment_method || 'Vault Card'} ({p.provider || 'hudorian_vault'})
                      </td>
                      <td className="p-4 text-white/60 font-mono text-[11px]">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                          p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          p.status === 'refunded' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-white/10 text-white/70'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SecureGateLayout>
  );
}

