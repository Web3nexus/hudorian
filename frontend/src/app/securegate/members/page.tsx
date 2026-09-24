'use client';

import React, { useEffect, useState } from 'react';
import { Users, ShieldAlert, CheckCircle2, Search, Sliders, ShieldCheck } from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGateMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchMembers = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hudorian_admin_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getAdminMembers()
      .then((res: any) => {
        if (res && res.data) setMembers(res.data);
      })
      .catch((err) => console.warn('Members could not be fetched:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleStatusChange = async (memberId: number, newStatus: string) => {
    setActionMsg(null);
    try {
      await api.updateMemberStatus(memberId, newStatus, `Status updated to ${newStatus} via SecureGate`);
      setActionMsg(`Member record #${memberId} updated to '${newStatus}'.`);
      fetchMembers();
    } catch {
      setActionMsg('Failed to update member status.');
    }
  };

  const filteredMembers = members.filter((m) => {
    const name = `${m.user?.name || ''}`.toLowerCase();
    const email = `${m.user?.email || ''}`.toLowerCase();
    const num = `${m.membership_number || ''}`.toLowerCase();
    const q = filterQuery.toLowerCase();
    return name.includes(q) || email.includes(q) || num.includes(q);
  });

  return (
    <SecureGateLayout
      title="Members Directory"
      subtitle="Directory of active club members, issued membership credentials, tier privileges, and sanctuary clearances."
    >
      <div className="space-y-6">
        {actionMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative grow max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by patron name, email or card number..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Loading member registry...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-16 text-center text-white/50 text-xs font-light">
              No member records matched your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Patron</th>
                    <th className="p-4">Membership Number</th>
                    <th className="p-4">Tier / Access Plan</th>
                    <th className="p-4">Digital Pass Status</th>
                    <th className="p-4">Clearance Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 pl-6 font-medium text-white">
                        {m.user?.name || 'Patron'}
                        <span className="block text-[10px] text-white/40 font-mono">{m.user?.email}</span>
                      </td>
                      <td className="p-4 font-mono text-[#C5A880]">
                        {m.membership_number}
                      </td>
                      <td className="p-4">
                        <span className="font-serif-luxury text-sm text-white">
                          {m.plan?.name || 'Global Access'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          HMAC Active
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                          m.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {m.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(m.id, 'suspended')}
                            className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition"
                          >
                            Suspend Access
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(m.id, 'active')}
                            className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition"
                          >
                            Restore Clearance
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

