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
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';
import { CmsBlock, HeaderNavItem, FooterSection, BrandSettings } from '@/types';

export default function SecureGateCmsStudioPage() {
  const { blocks: liveBlocks, refreshCms } = useCms();
  const [activeTab, setActiveTab] = useState<'brand' | 'menus' | 'heroes' | 'story'>('heroes');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable States
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

  // Sync state from CMS context when loaded
  useEffect(() => {
    if (liveBlocks['brand_settings']) {
      const b = liveBlocks['brand_settings'];
      setBrand({
        logo_type: b.payload?.logo_type || 'text',
        logo_text: b.title || b.payload?.logo_text || 'HUDORIAN',
        logo_image_url: b.media_url || b.payload?.logo_image_url || '',
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

    // Load page hero blocks
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
  }, [liveBlocks]);

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
      setSuccessMessage('CMS changes published successfully! Public pages updated in real time.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish CMS updates.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAddNavItem = () => {
    setHeaderNav((prev) => [
      ...prev,
      {
        label: 'New Link',
        href: '/houses',
        order: prev.length + 1,
        is_active: true,
      },
    ]);
  };

  const handleRemoveNavItem = (idx: number) => {
    setHeaderNav((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNavItemChange = (idx: number, field: keyof HeaderNavItem, value: any) => {
    setHeaderNav((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleHeroChange = (key: string, field: string, val: string) => {
    setHeroes((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
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
      title="Dynamic CMS Studio"
      subtitle="Full control over brand identity, page heroes, images, copy, and top/footer navigation menus."
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#B8976C]/15 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Publish CMS Changes</span>
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
              Inspect Public Site <ExternalLink className="w-3 h-3" />
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
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'heroes'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Page Heroes & Images</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
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
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'menus'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Menu className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Header & Footer Menus</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'story'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Manifesto & Texts</span>
          </button>
        </div>

        {/* TAB 1: HEROES & IMAGES */}
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

                    {/* Image Preview & URL */}
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

                      {/* Live Image Preview Banner */}
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
                          No Hero Image Configured
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                        Hero Headline
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
                        Hero Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={item.subtitle || ''}
                        onChange={(e) => handleHeroChange(page.key, 'subtitle', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] resize-none"
                      />
                    </div>

                    {/* Extra fields if home page */}
                    {page.key === 'page_home' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                            CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={item.cta_text || ''}
                            onChange={(e) => handleHeroChange(page.key, 'cta_text', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                            CTA Target Link
                          </label>
                          <input
                            type="text"
                            value={item.cta_link || ''}
                            onChange={(e) => handleHeroChange(page.key, 'cta_link', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: BRAND IDENTITY & LOGO */}
        {activeTab === 'brand' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
              <h3 className="font-serif-luxury text-xl text-white">Brand Typography & Logo</h3>

              {/* Logo Type Switcher */}
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
                    <p className="text-sm font-medium">Custom Logo Image</p>
                    <p className="text-[11px] text-white/40 mt-1">PNG, SVG or WebP high-resolution asset</p>
                  </button>
                </div>
              </div>

              {/* Wordmark Text */}
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

        {/* TAB 3: HEADER & FOOTER MENUS */}
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
                  onClick={handleAddNavItem}
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
                          onChange={(e) => handleNavItemChange(idx, 'label', e.target.value)}
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
                          onChange={(e) => handleNavItemChange(idx, 'href', e.target.value)}
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
                            onChange={(e) => handleNavItemChange(idx, 'order', parseInt(e.target.value) || 0)}
                            className="w-16 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                          />
                        </div>

                        <div className="pt-4">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70">
                            <input
                              type="checkbox"
                              checked={item.is_active !== false}
                              onChange={(e) => handleNavItemChange(idx, 'is_active', e.target.checked)}
                              className="rounded border-white/20 bg-white/5 text-[#C5A880] focus:ring-0"
                            />
                            <span>Active</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveNavItem(idx)}
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

        {/* TAB 4: MANIFESTO & TEXTS */}
        {activeTab === 'story' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
              <h3 className="font-serif-luxury text-xl text-white">Club Narrative & Manifesto</h3>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Homepage Manifesto Quote
                </label>
                <input
                  type="text"
                  value={heroes.page_home?.body || ''}
                  onChange={(e) => handleHeroChange('page_home', 'body', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                  Membership Manifesto Statement
                </label>
                <textarea
                  rows={4}
                  value={heroes.page_membership?.body || ''}
                  onChange={(e) => handleHeroChange('page_membership', 'body', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </SecureGateLayout>
  );
}

