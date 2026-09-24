'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, Eye, Clock, ShieldCheck, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';

export default function SecureGateApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchApps = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('hudorian_admin_token') : null;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getAdminApplications()
      .then((res: any) => {
        if (res && res.data) setApplications(res.data);
      })
      .catch((err) => console.warn('Applications could not be fetched:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleDecision = async (appId: number, decision: 'approved' | 'rejected' | 'under_review') => {
    setActionMsg(null);
    try {
      await api.reviewApplication(appId, decision, reviewNotes);
      setActionMsg(`Application for candidate #${appId} marked as '${decision}'.`);
      setSelectedApp(null);
      setReviewNotes('');
      fetchApps();
    } catch {
      setActionMsg('Failed to process committee decision.');
    }
  };

  return (
    <SecureGateLayout
      title="Membership Applications"
      subtitle="Review prospective candidate dossiers, assess committee alignment, and issue membership admissions clearances."
    >
      <div className="space-y-6">
        {actionMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Applications Table Card */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Synchronizing applicant records from SecureGate vault...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-16 text-center text-white/50 text-xs font-light">
              No applicant dossiers pending review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Candidate</th>
                    <th className="p-4">Profession & Studio</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Requested Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Committee Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 pl-6 font-medium text-white">
                        {app.first_name} {app.last_name}
                        <span className="block text-[10px] text-white/40 font-mono">{app.email}</span>
                      </td>
                      <td className="p-4">
                        {app.profession}
                        {app.company && <span className="block text-[10px] text-white/40">{app.company}</span>}
                      </td>
                      <td className="p-4 text-white/70">{app.city}, {app.country}</td>
                      <td className="p-4">
                        <span className="font-mono text-[#C5A880]">
                          {app.plan?.name || 'Global Access'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono capitalize ${
                          app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#B8976C] hover:text-black text-white/80 transition text-xs font-medium border border-white/10"
                        >
                          Examine Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Candidate Detail Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#121216] max-w-xl w-full rounded-2xl border border-white/10 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A880] block mb-1">
                    CANDIDATE DOSSIER // #{selectedApp.id}
                  </span>
                  <h3 className="font-serif-luxury text-2xl text-white">
                    {selectedApp.first_name} {selectedApp.last_name}
                  </h3>
                  <p className="text-xs text-white/50">{selectedApp.email} • {selectedApp.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-white/40 uppercase tracking-wider block font-mono text-[10px] mb-1">Location</span>
                  <p className="text-white/90">{selectedApp.city}, {selectedApp.country}</p>
                </div>

                <div>
                  <span className="text-white/40 uppercase tracking-wider block font-mono text-[10px] mb-1">Vocation & Practice</span>
                  <p className="text-white/90">{selectedApp.profession} {selectedApp.company && `at ${selectedApp.company}`}</p>
                </div>

                <div>
                  <span className="text-white/40 uppercase tracking-wider block font-mono text-[10px] mb-1">Personal Statement / Bio</span>
                  <p className="text-white/80 bg-white/[0.02] p-3 rounded-xl border border-white/5 leading-relaxed font-light">
                    {selectedApp.bio || 'No candidate statement submitted.'}
                  </p>
                </div>

                {selectedApp.interests && (
                  <div>
                    <span className="text-white/40 uppercase tracking-wider block font-mono text-[10px] mb-2">Stated Interests</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(selectedApp.interests) ? selectedApp.interests : []).map((int: string) => (
                        <span key={int} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px]">
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApp.social_profile_url && (
                  <div>
                    <span className="text-white/40 uppercase tracking-wider block font-mono text-[10px] mb-1">Social Footprint</span>
                    <a href={selectedApp.social_profile_url} target="_blank" rel="noreferrer" className="text-[#C5A880] hover:underline">
                      {selectedApp.social_profile_url}
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                    Committee Decision Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Document alignment criteria, referral background..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C5A880] resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleDecision(selectedApp.id, 'rejected')}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-xs transition"
                >
                  Decline Candidate
                </button>
                <button
                  onClick={() => handleDecision(selectedApp.id, 'approved')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  Authorize Admission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SecureGateLayout>
  );
}

