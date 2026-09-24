'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText, CheckCircle2, Globe, Building2, UserCheck, ArrowRight } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { useCms } from '@/lib/cms';

export default function PrivacyPolicyPage() {
  const { getPageContent } = useCms();
  const cmsContent = getPageContent('page_privacy', {
    title: 'Privacy Policy & Patron Confidentiality',
    subtitle: 'Legal Charter & Data Governance',
    body: 'HUDORIAN Club Limited is committed to unyielding discretion, cryptographic security, and transparency. This policy sets out our rigorous data governance standards under the Nigeria Data Protection Act 2023 (NDPA) and international hospitality data privacy conventions.',
    payload: {
      jurisdiction: 'Federal Republic of Nigeria',
      regulator: 'NDPC (Nigeria Data Protection Commission)',
      effective_date: 'September 2026',
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
      <Navbar />

      <main className="grow pt-36 pb-28">
        {/* Editorial Header */}
        <section className="max-w-4xl mx-auto px-6 md:px-10 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#96754B]/10 text-[#96754B] text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            {cmsContent.subtitle || 'Legal Charter & Data Governance'}
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-6xl text-[#141414] font-light tracking-tight leading-[1.1] mb-6">
            {cmsContent.title || 'Privacy Policy & Patron Confidentiality'}
          </h1>

          <p className="text-base sm:text-lg text-black/70 font-light leading-relaxed mb-6">
            {cmsContent.body || 'HUDORIAN Club Limited is committed to unyielding discretion, cryptographic security, and transparency. This policy sets out our rigorous data governance standards under the Nigeria Data Protection Act 2023 (NDPA) and international hospitality data privacy conventions.'}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-black/50 border-t border-b border-[#E8E2D8] py-3 font-mono">
            <span>Jurisdiction: {cmsContent.payload?.jurisdiction || 'Federal Republic of Nigeria'}</span>
            <span>•</span>
            <span>Regulator: {cmsContent.payload?.regulator || 'NDPC (Nigeria Data Protection Commission)'}</span>
            <span>•</span>
            <span>Effective Date: {cmsContent.payload?.effective_date || 'September 2026'}</span>
          </div>
        </section>

        {/* Content Body */}
        <section className="max-w-4xl mx-auto px-6 md:px-10 space-y-16 text-sm text-black/80 font-light leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#96754B] block">
              01. DATA CONTROLLER & PRINCIPLES
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Data Controller Identity & Constitutional Pledge
            </h2>
            <p>
              The data controller for all personal information gathered via HUDORIAN sanctuaries, digital passes, application dossiers, and concierge communications is <strong className="font-medium text-black">HUDORIAN Club Limited</strong>, a company duly incorporated under the laws of the Federal Republic of Nigeria, with registered head offices at Victoria Island, Lagos, Nigeria.
            </p>
            <p>
              In accordance with Section 24 of the Nigeria Data Protection Act (NDPA 2023), our processing of personal data is founded upon the cardinal tenets of lawfulness, transparency, purpose limitation, data minimization, cryptographic accuracy, storage integrity, and strict accountability.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#96754B] block">
              02. INFORMATION COLLECTED
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Patron & Candidate Dossier Information
            </h2>
            <p>
              To maintain the bespoke intimacy and safety of our private estate constellation, we collect and process only strictly relevant data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-white border border-[#E8E2D8] rounded-xs space-y-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-black">Candidacy & KYC Verification</h3>
                <p className="text-xs text-black/60 leading-normal">
                  Full legal name, contact telephone (+234 or international), physical residence, professional discipline, portfolio references, and committee evaluation notes.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E8E2D8] rounded-xs space-y-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-black">Hospitality & Concierge Profiling</h3>
                <p className="text-xs text-black/60 leading-normal">
                  Private dietary preferences, arrival logistics, suite temperature specifications, sommelier preferences, and wellness requests.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E8E2D8] rounded-xs space-y-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-black">Digital Membership Pass & Access</h3>
                <p className="text-xs text-black/60 leading-normal">
                  Rotating HMAC cryptographic pass tokens, house check-in timestamps, and gated physical access records.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E8E2D8] rounded-xs space-y-2">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-black">Financial Ledger & Billing</h3>
                <p className="text-xs text-black/60 leading-normal">
                  Encrypted tokenized payment references (NGN/USD/EUR/GBP), VAT invoice records, and annual patronage settlement proofs.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#96754B] block">
              03. UNCOMPROMISING HOUSE DISCRETION
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Patron Anonymity & No-Commercialization Rule
            </h2>
            <div className="p-6 bg-[#141414] text-white rounded-xs space-y-3" id="house-discretion">
              <div className="flex items-center gap-2 text-[#C5A880] text-xs uppercase tracking-widest font-semibold">
                <Lock className="w-4 h-4" />
                The HUDORIAN Sanctuary Rule
              </div>
              <p className="text-sm font-light text-white/85 leading-relaxed">
                HUDORIAN does not sell, lease, syndicate, monetize, or disclose member data, guest lists, or booking details to any third-party marketing network. The identities of our members and candidates remain strictly confidential.
              </p>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                Within all Houses and private Estates, photography in communal areas is restricted to safeguard the tranquility of visiting patrons.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#96754B] block">
              04. LEGAL BASES FOR PROCESSING
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Lawful Grounds under NDPA 2023
            </h2>
            <p>
              We process personal information under the following lawful conditions established in Part V of the Nigeria Data Protection Act:
            </p>
            <ul className="space-y-3 list-disc pl-5 text-black/75">
              <li>
                <strong className="text-black font-medium">Contractual Performance:</strong> Fulfilling membership privileges, room reservations, dining curations, and digital concierge services.
              </li>
              <li>
                <strong className="text-black font-medium">Consent:</strong> Where candidates voluntarily transmit personal dossiers and cultural interests during membership application.
              </li>
              <li>
                <strong className="text-black font-medium">Legal Obligation:</strong> Compliance with Nigerian anti-money laundering (AML), fiscal accounting, and guest safety regulations.
              </li>
              <li>
                <strong className="text-black font-medium">Legitimate Sanctuary Interests:</strong> Safeguarding the physical and digital perimeter security of our sanctuaries.
              </li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#96754B] block">
              05. PATRON RIGHTS
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Your Statutory Rights under NDPA
            </h2>
            <p>
              As a data subject under Nigerian law, you possess inviolable rights regarding your information:
            </p>
            <div className="space-y-3 divide-y divide-[#E8E2D8]">
              <div className="pt-3 flex justify-between gap-4">
                <span className="font-medium text-black">Right of Access</span>
                <span className="text-black/60 text-right">Obtain confirmation of your stored records and a copy of your dossier.</span>
              </div>
              <div className="pt-3 flex justify-between gap-4">
                <span className="font-medium text-black">Right to Rectification</span>
                <span className="text-black/60 text-right">Update inaccurate phone numbers, names, or addresses in real time via the Member Portal.</span>
              </div>
              <div className="pt-3 flex justify-between gap-4">
                <span className="font-medium text-black">Right to Erasure (&ldquo;Right to be Forgotten&rdquo;)</span>
                <span className="text-black/60 text-right">Request permanent scrubbing of your profile upon resignation from the club.</span>
              </div>
              <div className="pt-3 flex justify-between gap-4">
                <span className="font-medium text-black">Right to Data Portability</span>
                <span className="text-black/60 text-right">Receive your reservation ledger and historical transactions in structured format.</span>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#96754B] block">
              06. DATA PROTECTION OFFICER (DPO) CONTACT
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-[#141414]">
              Contacting Our Privacy & Compliance Office
            </h2>
            <p>
              For inquiries regarding this charter, to exercise any statutory rights, or to submit a compliance request to our Data Protection Officer:
            </p>

            <div className="p-6 bg-white border border-[#E8E2D8] rounded-xs space-y-2">
              <p className="font-semibold text-black">Office of the Data Protection Officer (DPO)</p>
              <p className="text-xs text-black/70">HUDORIAN Club Limited</p>
              <p className="text-xs text-black/70">HUDORIAN House, 42 Marina & Ozumba Mbadiwe Way</p>
              <p className="text-xs text-black/70">Victoria Island, Lagos, Nigeria</p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-[#96754B]">
                <span>Telephone: +234 (0) 1 888 4836</span>
                <span>•</span>
                <span>Direct Email: privacy@hudorian.com</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/privacy/data"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#96754B] hover:text-black transition"
              >
                Inspect Technical Data Security Architecture <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

