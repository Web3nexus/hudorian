'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Download, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';

export default function MemberPaymentsPage() {
  const { formatPrice } = useCurrency();
  const [payments, setPayments] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMemberPayments()
      .then((res) => {
        if (res.data) setPayments(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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

        <div className="border-b border-[#E8E2D8] pb-6 mb-12">
          <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#96754B] block mb-2">
            FINANCIAL LEDGER
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-5xl text-[#141414]">
            Membership Dues & Receipts
          </h1>
        </div>

        <div className="bg-white rounded-xs border border-[#E8E2D8] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#E8E2D8] flex items-center justify-between">
            <h2 className="font-serif-luxury text-2xl text-[#141414]">Payment History</h2>
            <span className="text-xs text-black/50">Protected by HUDORIAN Pay Vault</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-black/50">Loading ledger...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-black/60 font-light">
              No transactions currently recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-black/60 uppercase tracking-wider border-b border-[#E8E2D8]">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D8]">
                  {payments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-stone-50">
                      <td className="p-4 font-mono font-medium text-black">{p.transaction_id}</td>
                      <td className="p-4 font-serif-luxury text-base text-black">{formatPrice(Number(p.amount))}</td>
                      <td className="p-4 uppercase text-[11px] text-black/70">{p.provider}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-black/60">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => alert(`Official VAT Invoice downloaded for transaction ${p.transaction_id}`)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#96754B] font-semibold hover:underline"
                        >
                          <Download className="w-3 h-3" /> PDF Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

