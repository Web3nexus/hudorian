'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { CmsBlock, BrandSettings, HeaderNavItem, FooterSection } from '../types';

export interface PageContent {
  title?: string;
  subtitle?: string;
  body?: string;
  media_url?: string;
  payload?: Record<string, any>;
}

interface CmsContextType {
  blocks: Record<string, CmsBlock>;
  brand: BrandSettings;
  headerNav: HeaderNavItem[];
  footerNav: {
    copyright: string;
    tagline: string;
    sections: FooterSection[];
  };
  getPageContent: (key: string, fallback?: PageContent) => PageContent;
  refreshCms: () => Promise<void>;
  isLoading: boolean;
}

const defaultBrand: BrandSettings = {
  logo_type: 'image',
  logo_text: 'HUDORIAN',
  logo_image_url: '/images/hudorian-seal.png',
  tagline: 'Private Members Club & Global Constellation of Houses',
  concierge_email: 'concierge@hudorian.com',
  concierge_phone: '+44 (0) 20 7946 0912',
  office_address: '7 Berkeley Square, Mayfair, London W1J 6ES',
  currency_symbol: '€',
};

const defaultHeaderNav: HeaderNavItem[] = [
  { label: 'The Royal Family', href: '/royal-family', order: 1, is_active: true },
  { label: 'Royal Houses', href: '/royal-houses', order: 2, is_active: true },
  { label: 'Houses', href: '/houses', order: 3, is_active: true },
  { label: 'Estates', href: '/estates', order: 4, is_active: true },
  { label: 'Stays', href: '/stays', order: 5, is_active: true },
  { label: 'Experiences', href: '/experiences', order: 6, is_active: true },
  { label: 'Membership', href: '/membership', order: 7, is_active: true },
  { label: 'Journal', href: '/journal', order: 8, is_active: true },
  { label: 'Boutique', href: '/shop', order: 9, is_active: true },
];

const defaultFooterNav = {
  copyright: '© 2026 HUDORIAN Private Members Club. All rights reserved.',
  tagline: 'An invitation-only assembly of extraordinary spaces and discerning patrons.',
  sections: [
    {
      title: 'The Uzih Dynasty',
      links: [
        { label: 'The Royal Family', href: '/royal-family' },
        { label: 'Royal Houses & Heirs', href: '/royal-houses' },
        { label: 'Reda House', href: '/royal-houses#reda-house' },
        { label: 'The Family of Victors', href: '/royal-houses#family-of-victors' },
      ],
    },
    {
      title: 'Houses & Sanctuaries',
      links: [
        { label: 'Global Houses', href: '/houses' },
        { label: 'Private Estates', href: '/estates' },
        { label: 'Suites & Stays', href: '/stays' },
        { label: 'Curated Gatherings', href: '/experiences' },
      ],
    },
    {
      title: 'Membership',
      links: [
        { label: 'Tiers & Privileges', href: '/membership' },
        { label: 'Apply for Membership', href: '/membership/apply' },
        { label: 'Member Portal', href: '/member' },
      ],
    },
    {
      title: 'The Gazette',
      links: [
        { label: 'Editorial Journal', href: '/journal' },
        { label: 'Boutique Collection', href: '/shop' },
        { label: 'Concierge & Privacy', href: '/membership' },
      ],
    },
  ],
};

const CmsContext = createContext<CmsContextType>({
  blocks: {},
  brand: defaultBrand,
  headerNav: defaultHeaderNav,
  footerNav: defaultFooterNav,
  getPageContent: () => ({}),
  refreshCms: async () => {},
  isLoading: true,
});

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blocks, setBlocks] = useState<Record<string, CmsBlock>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await api.getCmsBlocks();
      if (res && res.data) {
        setBlocks(res.data);
      }
    } catch {
      // Graceful fallback to default in-memory state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const brand: BrandSettings = {
    ...defaultBrand,
    ...(blocks['brand_settings']?.payload || {}),
    logo_type: blocks['brand_settings']?.payload?.logo_type || defaultBrand.logo_type,
    logo_text: blocks['brand_settings']?.title || blocks['brand_settings']?.payload?.logo_text || defaultBrand.logo_text,
    logo_image_url: blocks['brand_settings']?.media_url || blocks['brand_settings']?.payload?.logo_image_url || defaultBrand.logo_image_url,
    tagline: blocks['brand_settings']?.subtitle || blocks['brand_settings']?.payload?.tagline || defaultBrand.tagline,
  };

  const rawHeaderItems = blocks['navigation_header']?.payload?.items;
  let resolvedHeaderNav: HeaderNavItem[] =
    Array.isArray(rawHeaderItems) && rawHeaderItems.length > 0
      ? rawHeaderItems
      : defaultHeaderNav;

  // Guarantee 'The Royal Family' is never lost after API load
  if (!resolvedHeaderNav.some((item) => item.href === '/royal-family')) {
    resolvedHeaderNav = [
      { label: 'The Royal Family', href: '/royal-family', order: 1, is_active: true },
      ...resolvedHeaderNav,
    ];
  }

  const rawFooterSections = blocks['navigation_footer']?.payload?.sections;
  let resolvedFooterSections: FooterSection[] =
    Array.isArray(rawFooterSections) && rawFooterSections.length > 0
      ? rawFooterSections
      : defaultFooterNav.sections;

  // Guarantee 'The Uzih Dynasty' section is never lost after API load
  if (!resolvedFooterSections.some((s) => s.title.toLowerCase().includes('uzih') || s.title.toLowerCase().includes('royal'))) {
    resolvedFooterSections = [
      defaultFooterNav.sections[0],
      ...resolvedFooterSections,
    ];
  }

  const headerNav: HeaderNavItem[] = resolvedHeaderNav;

  const footerNav = {
    copyright: blocks['navigation_footer']?.payload?.copyright || defaultFooterNav.copyright,
    tagline: blocks['navigation_footer']?.payload?.tagline || defaultFooterNav.tagline,
    sections: resolvedFooterSections,
  };

  const getPageContent = (key: string, fallback?: PageContent): PageContent => {
    const block = blocks[key];
    if (!block) return fallback || {};
    return {
      title: block.title ?? fallback?.title,
      subtitle: block.subtitle ?? fallback?.subtitle,
      body: block.body ?? fallback?.body,
      media_url: block.media_url ?? fallback?.media_url,
      payload: { ...(fallback?.payload || {}), ...(block.payload || {}) },
    };
  };

  return (
    <CmsContext.Provider
      value={{
        blocks,
        brand,
        headerNav,
        footerNav,
        getPageContent,
        refreshCms: fetchBlocks,
        isLoading,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => useContext(CmsContext);

