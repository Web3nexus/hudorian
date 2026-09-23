'use client';

import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, Search, Database } from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGateAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hudorian_admin_token') : null;
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getAdminAuditLogs() as any;
        if (res && res.data) setLogs(res.data);
      } catch (err) {
        console.warn('Audit logs could not be fetched:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const str = `${log.action || ''} ${log.actor_name || ''} ${log.ip_address || ''}`.toLowerCase();
    return str.includes(filterQuery.toLowerCase());
  });

  return (
    <SecureGateLayout
      title="Immutable Audit Ledger"
      subtitle="Cryptographically sealed log of administrative state mutations, membership approvals, and CMS updates."
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative grow max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by action, administrator or IP..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Loading cryptographic audit trail...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center text-white/50 text-xs font-light">
              No audit log entries matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Administrator</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4 pr-6">Details / Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 pl-6 font-mono text-[11px] text-white/50">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#B8976C]/10 text-[#C5A880] border border-[#B8976C]/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">
                        {log.actor_name || 'System / Auto'}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-white/60">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="p-4 pr-6 font-mono text-[10px] text-white/60 max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
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

