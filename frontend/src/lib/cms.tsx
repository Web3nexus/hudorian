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
  { label: 'Houses', href: '/houses', order: 1, is_active: true },
  { label: 'Estates', href: '/estates', order: 2, is_active: true },
  { label: 'Stays', href: '/stays', order: 3, is_active: true },
  { label: 'Experiences', href: '/experiences', order: 4, is_active: true },
  { label: 'Membership', href: '/membership', order: 5, is_active: true },
  { label: 'Journal', href: '/journal', order: 6, is_active: true },
  { label: 'Boutique', href: '/shop', order: 7, is_active: true },
];

const defaultFooterNav = {
  copyright: '© 2026 HUDORIAN Private Members Club. All rights reserved.',
  tagline: 'An invitation-only assembly of extraordinary spaces and discerning patrons.',
  sections: [
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
        { label: 'SecureGate Access', href: '/securegate/login' },
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

  const headerNav: HeaderNavItem[] =
    blocks['navigation_header']?.payload?.items && Array.isArray(blocks['navigation_header'].payload.items)
      ? blocks['navigation_header'].payload.items
      : defaultHeaderNav;

  const footerNav = {
    copyright: blocks['navigation_footer']?.payload?.copyright || defaultFooterNav.copyright,
    tagline: blocks['navigation_footer']?.payload?.tagline || defaultFooterNav.tagline,
    sections: blocks['navigation_footer']?.payload?.sections && Array.isArray(blocks['navigation_footer'].payload.sections)
      ? blocks['navigation_footer'].payload.sections
      : defaultFooterNav.sections,
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

