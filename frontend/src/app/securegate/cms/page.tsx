'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Menu,
  FileText,
  Building,
  RefreshCw,
  Crown,
  Shield,
  HeartHandshake,
  Users,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';
import { CmsBlock, HeaderNavItem, FooterSection, BrandSettings } from '@/types';

export default function SecureGateCmsStudioPage() {
  const { blocks: liveBlocks, refreshCms } = useCms();
  const [activeTab, setActiveTab] = useState<'heroes' | 'royal' | 'legal' | 'brand' | 'menus'>('heroes');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Brand Identity State
  const [brand, setBrand] = useState<BrandSettings>({
    logo_type: 'image',
    logo_text: 'HUDORIAN',
    logo_image_url: '/images/hudorian-seal.png',
    tagline: 'Private Members Club & Global Constellation of Houses',
    concierge_email: 'concierge@hudorian.com',
    concierge_phone: '+234 (0) 1 888 4836',
    office_address: 'HUDORIAN House, 42 Marina, Victoria Island, Lagos, Nigeria',
    currency_symbol: '₦',
  });

  // 2. Navigation Menus State
  const [headerNav, setHeaderNav] = useState<HeaderNavItem[]>([
    { label: 'Houses', href: '/houses', order: 1, is_active: true },
    { label: 'Estates', href: '/estates', order: 2, is_active: true },
    { label: 'Stays', href: '/stays', order: 3, is_active: true },
    { label: 'Experiences', href: '/experiences', order: 4, is_active: true },
    { label: 'Membership', href: '/membership', order: 5, is_active: true },
    { label: 'Journal', href: '/journal', order: 6, is_active: true },
    { label: 'Boutique', href: '/shop', order: 7, is_active: true },
  ]);

  const [footerCopyright, setFooterCopyright] = useState('© 2026 HUDORIAN Private Members Club. All rights reserved.');
  const [footerTagline, setFooterTagline] = useState('An invitation-only assembly of extraordinary spaces and discerning patrons.');

  // 3. Page Heroes & Sanctuaries State
  const [heroes, setHeroes] = useState<Record<string, { title: string; subtitle: string; media_url: string; body?: string; cta_text?: string; cta_link?: string }>>({
    page_home: {
      title: 'A private world of extraordinary places.',
      subtitle: 'Exclusive houses, estates and clubs in the world’s most inspiring destinations. For members only.',
      media_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2400&q=85',
      cta_text: 'Explore Membership',
      cta_link: '/membership',
    },
    page_houses: {
      title: 'Global Constellation of Houses',
      subtitle: 'Six signature sanctuaries designed in harmony with their natural terroir and architectural heritage.',
      media_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
      body: 'From cliffside Mediterranean compounds to quiet historic machiya sanctuaries in Kyoto, discover our private houses.',
    },
    page_estates: {
      title: 'Private Estates & Residencies',
      subtitle: 'Secluded multi-acre domains engineered for absolute privacy, executive retreats, and family gatherings.',
      media_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85',
    },
    page_stays: {
      title: 'Suites & Private Residences',
      subtitle: 'Unmatched architectural craftsmanship, organic linens, and personalized 24/7 butler service.',
      media_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=2000&q=85',
    },
    page_experiences: {
      title: 'Curated Gatherings & Cultural Salons',
      subtitle: 'Intimate dining with world chefs, acoustic evenings under the stars, contemporary art vernissages, and wellness retreats.',
      media_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2000&q=85',
    },
    page_membership: {
      title: 'An Invitation to Belong',
      subtitle: 'A deliberate assembly of patrons, pioneers, and creative visionaries across the globe.',
      media_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85',
      body: 'Membership at HUDORIAN is an invitation to explore our global constellation of Houses, Estates, and Clubs.',
    },
    page_journal: {
      title: 'The HUDORIAN Journal',
      subtitle: 'Dispatches on design, architecture, gastronomy, and contemporary culture from across our houses.',
      media_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=2000&q=85',
    },
    page_shop: {
      title: 'The Boutique Collection',
      subtitle: 'Limited editions, signature house scents, handcrafted ceramics, and bespoke travel goods.',
      media_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85',
    },
  });

  // 4. Royal Houses & Dynastic Allies State
  const [royalHouses, setRoyalHouses] = useState({
    title: 'The Royal Houses of Uzih & Dynastic Allies',
    subtitle: 'The sovereign cadet houses established by the royal children of the Uzih dynasty and the historic allied families standing in eternal fellowship with the realm.',
    media_url: '/images/hudorian-seal.png',
    cadet_houses: [
      {
        id: 'reda-house',
        name: 'Reda House',
        founder: 'Founded by Prince Reda of Uzih',
        role: 'Princely Cadet House & Maritime Domain',
        tagline: 'A sovereign coastal sanctuary championing oceanic stewardship, naval architecture, and seafaring exploration.',
        description: 'Established under royal charter by Prince Reda, eldest royal son of the House of Uzih. Reda House stands atop majestic Mediterranean cliff lines, serving as the international headquarters for royal yachting regattas, deep-ocean ecological research, and high-level diplomatic assemblies.',
        hero_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
        location: 'The Reda Coastal Citadel, Balearic Isles',
        motto: 'Honor, Vision, Endurance',
      },
      {
        id: 'aria-house',
        name: 'Aria House',
        founder: 'Founded by Princess Aria of Uzih',
        role: 'Princely Cadet House of Fine Arts & Wellness',
        tagline: 'An ethereal sanctuary of classical symphony, rare botanical gardens, and restorative mind-body sanctuaries.',
        description: 'Curated under the patronage of Princess Aria, this house merges centuries-old botanical knowledge with acoustic perfection. Featuring an amphitheater carved from native stone and greenhouse conservatories housing endangered Mediterranean and Asian flora.',
        hero_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        location: 'The Aria Botanical Sanctuary, Andalusia',
        motto: 'Grace in Sovereignty',
      },
      {
        id: 'tarek-house',
        name: 'Tarek House',
        founder: 'Founded by Prince Tarek of Uzih',
        role: 'Princely Cadet House & Equestrian Domain',
        tagline: 'The ancestral equestrian seat dedicated to champion thoroughbred breeding, polo heritage, and highland stewardship.',
        description: 'Founded by Prince Tarek, this sprawling country domain is revered worldwide for its champion bloodstock stud, Olympic-standard jumping arenas, and historic hunting lodges set among rolling forested hills.',
        hero_image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80',
        location: 'The Tarek Equestrian Grounds, Sierra Foothills',
        motto: 'Strength Through Integrity',
      },
    ],
    dynastic_allies: [
      {
        id: 'family-of-victors',
        name: 'The Family of Victors',
        dynasty: 'House of Victor',
        alliance_type: 'Sovereign Treaty Alliance & Companions of Honor',
        tagline: 'An illustrious noble dynasty bound to the House of Uzih through generations of mutual covenant and global enterprise.',
        description: 'The Family of Victors represents one of the most storied aristocratic alliances of the realm. United with the Uzih royal dynasty by historic concordats, the Victors command venerable estates, private aviation fleet networks, and pioneering philanthropic foundations across five continents.',
        hero_image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
        seat: 'The Citadel of Victors & Grand Estate',
        motto: 'Invictus in Aeternum (Victorious in Eternity)',
      },
    ],
  });

  // 5. The Royal Family Lineage State
  const [royalFamily, setRoyalFamily] = useState({
    title: 'The Uzih Royal Family',
    subtitle: 'Anchoring the sovereign heritage of HUDORIAN through centuries of noble stewardship, patronages in the arts, and the enduring grace of the House of Uzih.',
    media_url: '/images/hudorian-seal.png',
    royal_head: {
      title: 'His Royal Majesty',
      name: 'Sovereign Head of the Uzih Royal Dynasty',
      role: 'Patriarch & Custodian of the Imperial Lineage',
      bio: 'Guiding the House of Uzih with steadfast honor and timeless wisdom. His Majesty has spearheaded the preservation of ancestral heritage, sovereign patronages in cultural arts, and the modern international expansion of the HUDORIAN sanctuaries across global capitals.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    },
  });

  // 6. Privacy & Legal State
  const [privacy, setPrivacy] = useState({
    title: 'Privacy Policy & Patron Confidentiality',
    subtitle: 'Legal Charter & Data Governance',
    body: 'HUDORIAN Club Limited is committed to unyielding discretion, cryptographic security, and transparency. This policy sets out our rigorous data governance standards under the Nigeria Data Protection Act 2023 (NDPA) and international hospitality data privacy conventions.',
    jurisdiction: 'Federal Republic of Nigeria',
    regulator: 'NDPC (Nigeria Data Protection Commission)',
    effective_date: 'September 2026',
  });

  // 7. Terms & House Rules State
  const [terms, setTerms] = useState({
    title: 'Membership Terms & By-Laws',
    subtitle: 'House Rules & Code of Fellowship',
    body: 'HUDORIAN is conceived as an oasis of creative freedom, privacy, and civil discourse. To preserve the sanctuary character of our Houses and Estates, every candidate and patron agrees to abide by this House Code.',
  });

  // Sync state from live CMS context
  useEffect(() => {
    if (liveBlocks['brand_settings']) {
      const b = liveBlocks['brand_settings'];
      setBrand({
        logo_type: b.payload?.logo_type || 'image',
        logo_text: b.title || b.payload?.logo_text || 'HUDORIAN',
        logo_image_url: b.media_url || b.payload?.logo_image_url || '/images/hudorian-seal.png',
        tagline: b.subtitle || b.payload?.tagline || '',
        concierge_email: b.payload?.concierge_email || 'concierge@hudorian.com',
        concierge_phone: b.payload?.concierge_phone || '+234 (0) 1 888 4836',
        office_address: b.payload?.office_address || '',
        currency_symbol: b.payload?.currency_symbol || '₦',
      });
    }

    if (liveBlocks['navigation_header']?.payload?.items) {
      setHeaderNav(liveBlocks['navigation_header'].payload.items);
    }

    if (liveBlocks['navigation_footer']?.payload) {
      if (liveBlocks['navigation_footer'].payload.copyright) {
        setFooterCopyright(liveBlocks['navigation_footer'].payload.copyright);
      }
      if (liveBlocks['navigation_footer'].payload.tagline) {
        setFooterTagline(liveBlocks['navigation_footer'].payload.tagline);
      }
    }

    // Load page heroes
    const pageKeys = ['page_home', 'page_houses', 'page_estates', 'page_stays', 'page_experiences', 'page_membership', 'page_journal', 'page_shop'];
    setHeroes((prev) => {
      const next = { ...prev };
      pageKeys.forEach((key) => {
        if (liveBlocks[key]) {
          const item = liveBlocks[key];
          next[key] = {
            title: item.title || prev[key]?.title || '',
            subtitle: item.subtitle || prev[key]?.subtitle || '',
            media_url: item.media_url || prev[key]?.media_url || '',
            body: item.body || prev[key]?.body || '',
            cta_text: item.payload?.cta_text || prev[key]?.cta_text || '',
            cta_link: item.payload?.cta_link || prev[key]?.cta_link || '',
          };
        }
      });
      return next;
    });

    // Load Royal Houses
    if (liveBlocks['page_royal_houses']) {
      const rh = liveBlocks['page_royal_houses'];
      setRoyalHouses((prev) => ({
        title: rh.title || prev.title,
        subtitle: rh.subtitle || prev.subtitle,
        media_url: rh.media_url || prev.media_url,
        cadet_houses: rh.payload?.cadet_houses || prev.cadet_houses,
        dynastic_allies: rh.payload?.dynastic_allies || prev.dynastic_allies,
      }));
    }

    // Load Royal Family
    if (liveBlocks['page_royal_family']) {
      const rf = liveBlocks['page_royal_family'];
      setRoyalFamily((prev) => ({
        title: rf.title || prev.title,
        subtitle: rf.subtitle || prev.subtitle,
        media_url: rf.media_url || prev.media_url,
        royal_head: rf.payload?.royal_head || prev.royal_head,
      }));
    }

    // Load Privacy
    if (liveBlocks['page_privacy']) {
      const p = liveBlocks['page_privacy'];
      setPrivacy((prev) => ({
        title: p.title || prev.title,
        subtitle: p.subtitle || prev.subtitle,
        body: p.body || prev.body,
        jurisdiction: p.payload?.jurisdiction || prev.jurisdiction,
        regulator: p.payload?.regulator || prev.regulator,
        effective_date: p.payload?.effective_date || prev.effective_date,
      }));
    }

    // Load Terms
    if (liveBlocks['page_terms']) {
      const t = liveBlocks['page_terms'];
      setTerms((prev) => ({
        title: t.title || prev.title,
        subtitle: t.subtitle || prev.subtitle,
        body: t.body || prev.body,
      }));
    }
  }, [liveBlocks]);

  const handleHeroChange = (pageKey: string, field: string, val: string) => {
    setHeroes((prev) => ({
      ...prev,
      [pageKey]: {
        ...prev[pageKey],
        [field]: val,
      },
    }));
  };

  const handleCadetHouseChange = (idx: number, field: string, val: string) => {
    setRoyalHouses((prev) => {
      const list = [...prev.cadet_houses];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, cadet_houses: list };
    });
  };

  const handleAllyChange = (idx: number, field: string, val: string) => {
    setRoyalHouses((prev) => {
      const list = [...prev.dynastic_allies];
      list[idx] = { ...list[idx], [field]: val };
      return { ...prev, dynastic_allies: list };
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const batchPayload: Partial<CmsBlock>[] = [
        {
          key: 'brand_settings',
          title: brand.logo_text,
          subtitle: brand.tagline,
          media_url: brand.logo_image_url,
          payload: {
            logo_type: brand.logo_type,
            logo_text: brand.logo_text,
            logo_image_url: brand.logo_image_url,
            tagline: brand.tagline,
            concierge_email: brand.concierge_email,
            concierge_phone: brand.concierge_phone,
            office_address: brand.office_address,
            currency_symbol: brand.currency_symbol,
          },
        },
        {
          key: 'navigation_header',
          title: 'Header Navigation Menus',
          payload: {
            items: headerNav,
          },
        },
        {
          key: 'navigation_footer',
          title: 'Footer Navigation Menus & Copyright',
          payload: {
            copyright: footerCopyright,
            tagline: footerTagline,
            sections: liveBlocks['navigation_footer']?.payload?.sections || [],
          },
        },
        {
          key: 'page_royal_houses',
          title: royalHouses.title,
          subtitle: royalHouses.subtitle,
          media_url: royalHouses.media_url,
          payload: {
            cadet_houses: royalHouses.cadet_houses,
            dynastic_allies: royalHouses.dynastic_allies,
          },
        },
        {
          key: 'page_royal_family',
          title: royalFamily.title,
          subtitle: royalFamily.subtitle,
          media_url: royalFamily.media_url,
          payload: {
            royal_head: royalFamily.royal_head,
          },
        },
        {
          key: 'page_privacy',
          title: privacy.title,
          subtitle: privacy.subtitle,
          body: privacy.body,
          payload: {
            jurisdiction: privacy.jurisdiction,
            regulator: privacy.regulator,
            effective_date: privacy.effective_date,
          },
        },
        {
          key: 'page_terms',
          title: terms.title,
          subtitle: terms.subtitle,
          body: terms.body,
        },
      ];

      // Add heroes
      Object.entries(heroes).forEach(([key, val]) => {
        batchPayload.push({
          key,
          title: val.title,
          subtitle: val.subtitle,
          body: val.body,
          media_url: val.media_url,
          payload: {
            cta_text: val.cta_text,
            cta_link: val.cta_link,
          },
        });
      });

      await api.batchUpdateCmsBlocks(batchPayload);
      await refreshCms();
      setSuccessMessage('Sanctuary CMS updates published successfully! Changes reflect on the public site instantly.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish CMS updates.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const pagesConfig = [
    { key: 'page_home', label: 'Home Page Hero & Copy', previewHref: '/' },
    { key: 'page_houses', label: 'Houses Constellation', previewHref: '/houses' },
    { key: 'page_estates', label: 'Private Estates', previewHref: '/estates' },
    { key: 'page_stays', label: 'Sanctuary Stays & Suites', previewHref: '/stays' },
    { key: 'page_experiences', label: 'Cultural Gatherings', previewHref: '/experiences' },
    { key: 'page_membership', label: 'Membership & Application', previewHref: '/membership' },
    { key: 'page_journal', label: 'Editorial Journal', previewHref: '/journal' },
    { key: 'page_shop', label: 'Boutique Collection', previewHref: '/shop' },
  ];

  return (
    <SecureGateLayout
      title="Sanctuary Editorial & CMS Studio"
      subtitle="Complete management of imagery, house lore, cadet branches, dynastic alliances, legal charters, and brand identity."
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#B8976C]/15 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish All Changes</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alerts */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <a
              href="/"
              target="_blank"
              className="font-mono underline text-emerald-200 hover:text-white flex items-center gap-1"
            >
              Inspect Live Sanctuary <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('heroes')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'heroes'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Sanctuary Pages & Heroes</span>
          </button>

          <button
            onClick={() => setActiveTab('royal')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'royal'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Royal Houses, Allies & Lineage</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'legal'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Governance, Privacy & Terms</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'brand'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Brand Identity & Logo</span>
          </button>

          <button
            onClick={() => setActiveTab('menus')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'menus'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Menu className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Navigation & Footers</span>
          </button>
        </div>

        {/* TAB 1: HEROES & SANCTUARY PAGES */}
        {activeTab === 'heroes' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {pagesConfig.map((page) => {
                const item = heroes[page.key] || { title: '', subtitle: '', media_url: '' };
                return (
                  <div
                    key={page.key}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif-luxury text-lg text-white font-medium">
                          {page.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-white/5 text-white/50">
                          {page.key}
                        </span>
                      </div>
                      <a
                        href={page.previewHref}
                        target="_blank"
                        className="text-[11px] font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                      >
                        Preview <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Image URL & Preview */}
                    <div className="space-y-2">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                        Hero Background Image URL
                      </label>
                      <input
                        type="url"
                        value={item.media_url || ''}
                        onChange={(e) => handleHeroChange(page.key, 'media_url', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880] font-mono"
                      />

                      {item.media_url ? (
                        <div className="relative h-36 w-full rounded-xl overflow-hidden border border-white/10 group mt-2">
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-3">
                            <span className="text-xs font-serif-luxury text-white truncate max-w-sm">
                              {item.title}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-24 w-full rounded-xl bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center text-xs text-white/30 font-mono">
                          No Image Configured
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleHeroChange(page.key, 'title', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-serif-luxury text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                        Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.subtitle || ''}
                        onChange={(e) => handleHeroChange(page.key, 'subtitle', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] resize-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ROYAL HOUSES, ALLIES & DYNASTY */}
        {activeTab === 'royal' && (
          <div className="space-y-10">
            {/* 1. Page Header & Overview */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#C5A880]" />
                  <h3 className="font-serif-luxury text-xl text-white">Royal Houses Main Header</h3>
                </div>
                <a
                  href="/royal-houses"
                  target="_blank"
                  className="text-[11px] font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                >
                  Preview Page <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Main Title
                  </label>
                  <input
                    type="text"
                    value={royalHouses.title}
                    onChange={(e) => setRoyalHouses({ ...royalHouses, title: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-sm font-serif-luxury text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Hero Crest / Seal URL
                  </label>
                  <input
                    type="text"
                    value={royalHouses.media_url}
                    onChange={(e) => setRoyalHouses({ ...royalHouses, media_url: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Subtitle Lore
                </label>
                <textarea
                  rows={2}
                  value={royalHouses.subtitle}
                  onChange={(e) => setRoyalHouses({ ...royalHouses, subtitle: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] resize-none"
                />
              </div>
            </div>

            {/* 2. Cadet Houses Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-luxury text-xl text-white">Cadet Branches & Princely Houses</h3>
                  <p className="text-xs text-white/50 font-light">
                    Manage the individual cadet houses (Reda House, Aria House, Tarek House, etc.)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {royalHouses.cadet_houses.map((house, idx) => (
                  <div
                    key={house.id || idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#B8976C]/30 transition space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="font-serif-luxury text-lg text-white font-medium">
                        {house.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#C5A880] px-2 py-0.5 rounded-sm bg-white/5">
                        {house.id}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Hero Photo URL
                      </label>
                      <input
                        type="url"
                        value={house.hero_image}
                        onChange={(e) => handleCadetHouseChange(idx, 'hero_image', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                      {house.hero_image && (
                        <div className="relative h-28 w-full rounded-lg overflow-hidden border border-white/10">
                          <img
                            src={house.hero_image}
                            alt={house.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        House Title & Founder
                      </label>
                      <input
                        type="text"
                        value={house.founder}
                        onChange={(e) => handleCadetHouseChange(idx, 'founder', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Sanctuary Role
                      </label>
                      <input
                        type="text"
                        value={house.role}
                        onChange={(e) => handleCadetHouseChange(idx, 'role', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Territory / Location
                      </label>
                      <input
                        type="text"
                        value={house.location}
                        onChange={(e) => handleCadetHouseChange(idx, 'location', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Motto
                      </label>
                      <input
                        type="text"
                        value={house.motto}
                        onChange={(e) => handleCadetHouseChange(idx, 'motto', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs italic text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Overview Description
                      </label>
                      <textarea
                        rows={3}
                        value={house.description}
                        onChange={(e) => handleCadetHouseChange(idx, 'description', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Dynastic Allies Management */}
            <div className="space-y-4">
              <div>
                <h3 className="font-serif-luxury text-xl text-white">Dynastic Allies (Family of Victors & Fellowships)</h3>
                <p className="text-xs text-white/50 font-light">
                  Manage the historic sovereign allies standing in eternal covenant with the realm.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {royalHouses.dynastic_allies.map((ally, idx) => (
                  <div
                    key={ally.id || idx}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#B8976C]/30 transition space-y-4"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="font-serif-luxury text-lg text-white font-medium">
                        {ally.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#C5A880] px-2 py-0.5 rounded-sm bg-white/5">
                        {ally.dynasty}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Citadel Image URL
                      </label>
                      <input
                        type="url"
                        value={ally.hero_image}
                        onChange={(e) => handleAllyChange(idx, 'hero_image', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                      />
                      {ally.hero_image && (
                        <div className="relative h-28 w-full rounded-lg overflow-hidden border border-white/10">
                          <img
                            src={ally.hero_image}
                            alt={ally.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                          Alliance Type
                        </label>
                        <input
                          type="text"
                          value={ally.alliance_type}
                          onChange={(e) => handleAllyChange(idx, 'alliance_type', e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                          Ancestral Seat
                        </label>
                        <input
                          type="text"
                          value={ally.seat}
                          onChange={(e) => handleAllyChange(idx, 'seat', e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Dynastic Motto
                      </label>
                      <input
                        type="text"
                        value={ally.motto}
                        onChange={(e) => handleAllyChange(idx, 'motto', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs italic text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                        Alliance Chronicle
                      </label>
                      <textarea
                        rows={3}
                        value={ally.description}
                        onChange={(e) => handleAllyChange(idx, 'description', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOVERNANCE, PRIVACY & TERMS */}
        {activeTab === 'legal' && (
          <div className="space-y-8 max-w-4xl">
            {/* Privacy Policy Editor */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#C5A880]" />
                  <h3 className="font-serif-luxury text-xl text-white">Privacy Policy & Data Charter</h3>
                </div>
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-[11px] font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                >
                  Preview Privacy <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Page Headline
                </label>
                <input
                  type="text"
                  value={privacy.title}
                  onChange={(e) => setPrivacy({ ...privacy, title: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-serif-luxury text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                    Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={privacy.jurisdiction}
                    onChange={(e) => setPrivacy({ ...privacy, jurisdiction: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                    Regulatory Authority
                  </label>
                  <input
                    type="text"
                    value={privacy.regulator}
                    onChange={(e) => setPrivacy({ ...privacy, regulator: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/40">
                    Effective Date
                  </label>
                  <input
                    type="text"
                    value={privacy.effective_date}
                    onChange={(e) => setPrivacy({ ...privacy, effective_date: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Data Governance Statement & Pledge
                </label>
                <textarea
                  rows={4}
                  value={privacy.body}
                  onChange={(e) => setPrivacy({ ...privacy, body: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Terms of Membership Editor */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C5A880]" />
                  <h3 className="font-serif-luxury text-xl text-white">House Rules & Membership Terms</h3>
                </div>
                <a
                  href="/terms"
                  target="_blank"
                  className="text-[11px] font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                >
                  Preview Terms <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Page Headline
                </label>
                <input
                  type="text"
                  value={terms.title}
                  onChange={(e) => setTerms({ ...terms, title: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-serif-luxury text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Code of Fellowship Statement
                </label>
                <textarea
                  rows={4}
                  value={terms.body}
                  onChange={(e) => setTerms({ ...terms, body: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BRAND IDENTITY & LOGO */}
        {activeTab === 'brand' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
              <h3 className="font-serif-luxury text-xl text-white">Brand Typography & Logo</h3>

              {/* Logo Display Mode Switcher */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-3">
                  Logo Display Mode
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBrand({ ...brand, logo_type: 'text' })}
                    className={`p-4 rounded-xl border text-left transition ${
                      brand.logo_type === 'text'
                        ? 'border-[#C5A880] bg-[#B8976C]/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                    }`}
                  >
                    <p className="font-serif-luxury text-base tracking-[0.2em] uppercase">Wordmark Text</p>
                    <p className="text-[11px] text-white/40 mt-1">High-craft luxury serif typography</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBrand({ ...brand, logo_type: 'image' })}
                    className={`p-4 rounded-xl border text-left transition ${
                      brand.logo_type === 'image'
                        ? 'border-[#C5A880] bg-[#B8976C]/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                    }`}
                  >
                    <p className="text-sm font-medium">Custom Seal Asset</p>
                    <p className="text-[11px] text-white/40 mt-1">PNG, SVG or WebP high-resolution crest</p>
                  </button>
                </div>
              </div>

              {/* Wordmark */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Logo Brand Name
                </label>
                <input
                  type="text"
                  value={brand.logo_text || ''}
                  onChange={(e) => setBrand({ ...brand, logo_text: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-serif-luxury text-white tracking-[0.2em] uppercase focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Logo Image URL */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Logo Asset URL (SVG / PNG)
                </label>
                <input
                  type="url"
                  value={brand.logo_image_url || ''}
                  onChange={(e) => setBrand({ ...brand, logo_image_url: e.target.value })}
                  placeholder="https://example.com/logo.svg"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />

                {brand.logo_image_url && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mt-2">
                    <img
                      src={brand.logo_image_url}
                      alt="Logo preview"
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Club Philosophy Tagline
                </label>
                <input
                  type="text"
                  value={brand.tagline || ''}
                  onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {/* Concierge Line & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Concierge Enquiries Email
                  </label>
                  <input
                    type="email"
                    value={brand.concierge_email || ''}
                    onChange={(e) => setBrand({ ...brand, concierge_email: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Concierge Private Phone
                  </label>
                  <input
                    type="text"
                    value={brand.concierge_phone || ''}
                    onChange={(e) => setBrand({ ...brand, concierge_phone: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HEADER & FOOTER MENUS */}
        {activeTab === 'menus' && (
          <div className="space-y-8">
            {/* Header Navigation Section */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h3 className="font-serif-luxury text-xl text-white">Top Header Navigation</h3>
                  <p className="text-xs text-white/50 font-light">
                    Manage the links shown in the top navigation bar and mobile directory.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setHeaderNav((prev) => [
                      ...prev,
                      { label: 'New Link', href: '/houses', order: prev.length + 1, is_active: true },
                    ])
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Menu Link</span>
                </button>
              </div>

              <div className="space-y-3">
                {headerNav.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 grow">
                      <div className="md:col-span-4">
                        <label className="block text-[10px] font-mono text-white/40 mb-1">
                          Link Label
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const list = [...headerNav];
                            list[idx] = { ...list[idx], label: e.target.value };
                            setHeaderNav(list);
                          }}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="md:col-span-5">
                        <label className="block text-[10px] font-mono text-white/40 mb-1">
                          Target URL Route
                        </label>
                        <input
                          type="text"
                          value={item.href}
                          onChange={(e) => {
                            const list = [...headerNav];
                            list[idx] = { ...list[idx], href: e.target.value };
                            setHeaderNav(list);
                          }}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                        />
                      </div>

                      <div className="md:col-span-3 flex items-center gap-3">
                        <div>
                          <label className="block text-[10px] font-mono text-white/40 mb-1">
                            Order
                          </label>
                          <input
                            type="number"
                            value={item.order}
                            onChange={(e) => {
                              const list = [...headerNav];
                              list[idx] = { ...list[idx], order: parseInt(e.target.value) || 0 };
                              setHeaderNav(list);
                            }}
                            className="w-16 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>

                        <div className="pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                            <input
                              type="checkbox"
                              checked={item.is_active !== false}
                              onChange={(e) => {
                                const list = [...headerNav];
                                list[idx] = { ...list[idx], is_active: e.target.checked };
                                setHeaderNav(list);
                              }}
                              className="rounded border-white/20 bg-white/5 text-[#C5A880] focus:ring-0"
                            />
                            <span>Active</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setHeaderNav((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 self-end md:self-center transition"
                      title="Remove link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Navigation Section */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-5">
              <h3 className="font-serif-luxury text-xl text-white">Footer Copy & Copyright</h3>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={(e) => setFooterCopyright(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Footer Quote / Motto
                </label>
                <input
                  type="text"
                  value={footerTagline}
                  onChange={(e) => setFooterTagline(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SecureGateLayout>
  );
}
