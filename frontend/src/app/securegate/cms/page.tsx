'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
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
  X,
  Sparkles,
  ChevronRight,
  Eye,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';
import { useCms } from '@/lib/cms';
import { CmsBlock, HeaderNavItem, BrandSettings } from '@/types';

interface CadetHouseItem {
  id: string;
  name: string;
  founder: string;
  role: string;
  tagline: string;
  description: string;
  hero_image: string;
  location: string;
  motto: string;
}

interface DynasticAllyItem {
  id: string;
  name: string;
  dynasty: string;
  alliance_type: string;
  tagline: string;
  description: string;
  hero_image: string;
  seat: string;
  motto: string;
}

interface RoyalHeadItem {
  title: string;
  name: string;
  role: string;
  heraldry: string;
  bio: string;
  image: string;
}

interface QueenItem {
  id?: string;
  title: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  seat: string;
  patronages?: string[] | string;
}

interface RoyalChildItem {
  id?: string;
  name: string;
  title: string;
  role: string;
  age_desc?: string;
  bio: string;
  image: string;
  house: string;
  house_link: string;
  emblem: string;
}

interface PageHeroItem {
  title: string;
  subtitle: string;
  media_url: string;
  body?: string;
  cta_text?: string;
  cta_link?: string;
}

const defaultCadetHouses: CadetHouseItem[] = [
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
];

const defaultDynasticAllies: DynasticAllyItem[] = [
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
];

const defaultRoyalHead: RoyalHeadItem = {
  title: 'His Royal Majesty',
  name: 'Sovereign Head of the Uzih Royal Dynasty',
  role: 'Patriarch & Custodian of the Imperial Lineage',
  heraldry: 'Lion Crest with Sovereign Solar Radiance',
  bio: 'Guiding the House of Uzih with steadfast honor and timeless wisdom. His Majesty has spearheaded the preservation of ancestral heritage, sovereign patronages in cultural arts, and the modern international expansion of the HUDORIAN sanctuaries across global capitals.',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
};

const defaultQueens: QueenItem[] = [
  {
    id: 'queen-aisha',
    title: 'Her Royal Majesty',
    name: 'Queen Consort Aisha of Uzih',
    role: 'First Lady of the Realm & Patroness of Fine Arts',
    bio: 'Renowned for grace, cultural intellect, and devotion to dynastic traditions. Her Majesty directs the Uzih Royal Foundation for the Arts, commissioning classical music pavilions and restorative botanical conservatories across the royal properties.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    patronages: ['Royal Arts Foundation', 'Maternal Health Endowment', 'Botanical Conservation'],
    seat: 'The Emerald Pavilion, Marbella Domain',
  },
  {
    id: 'queen-soraya',
    title: 'Her Royal Highness',
    name: 'Queen Consort Soraya of Uzih',
    role: 'Custodian of Royal Archives & Sovereign Philanthropist',
    bio: 'A distinguished scholar of international diplomacy and classical history. Her Highness oversees the imperial library, rare manuscript preservation, and educational fellowships empowering extraordinary young minds worldwide.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
    patronages: ['Imperial Library & Archives', 'Global Youth Fellowships', 'Equestrian Heritage'],
    seat: 'The Cedarwood Sanctuary, Kyoto',
  },
];

const defaultChildren: RoyalChildItem[] = [
  {
    id: 'prince-reda',
    name: 'Prince Reda of Uzih',
    title: 'Founder & Heir to Reda House',
    role: 'Crown Prince & Maritime Patron',
    age_desc: 'Eldest Royal Son',
    bio: 'Educated in architecture and international trade. Prince Reda established Reda House as a beacon of maritime exploration, sustainable sanctuary design, and high-seas sailing fellowships.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
    house: 'Reda House',
    house_link: '/royal-houses#reda-house',
    emblem: 'Golden Falcon over Azure Crest',
  },
  {
    id: 'princess-aria',
    name: 'Princess Aria of Uzih',
    title: 'Founder of Aria House',
    role: 'Royal Daughter & Cultural Envoy',
    age_desc: 'Eldest Royal Daughter',
    bio: 'Champion of contemporary aesthetics and classical symphony. Princess Aria curates the international cultural salon at HUDORIAN houses, bridging ancestral heritage with forward-looking artistic expression.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
    house: 'Aria House',
    house_link: '/royal-houses#aria-house',
    emblem: 'Silver Lotus over Silk Champagne',
  },
  {
    id: 'prince-tarek',
    name: 'Prince Tarek of Uzih',
    title: 'Founder of Tarek House',
    role: 'Princely Son & Equestrian Steward',
    age_desc: 'Cadet Prince',
    bio: 'Distinguished equestrian champion and steward of land conservation. Prince Tarek oversees the thoroughbred breeding stud and multi-generational agrarian sanctuaries of the family estates.',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1000&q=80',
    house: 'Tarek House',
    house_link: '/royal-houses#tarek-house',
    emblem: 'Black Stallion over Platinum Shield',
  },
];

export default function SecureGateCmsStudioPage() {
  const { blocks: liveBlocks, refreshCms } = useCms();
  const [activeTab, setActiveTab] = useState<'heroes' | 'royal' | 'legal' | 'brand' | 'menus'>('royal');
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
  const [heroes, setHeroes] = useState<Record<string, PageHeroItem>>({
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
    cadet_houses: defaultCadetHouses,
    dynastic_allies: defaultDynasticAllies,
  });

  // 5. The Royal Family Lineage State
  const [royalFamily, setRoyalFamily] = useState({
    title: 'The Uzih Royal Family',
    subtitle: 'Anchoring the sovereign heritage of HUDORIAN through centuries of noble stewardship, patronages in the arts, and the enduring grace of the House of Uzih.',
    media_url: '/images/hudorian-seal.png',
    royal_head: defaultRoyalHead,
    queens: defaultQueens,
    children: defaultChildren,
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

  // --- MODAL DIALOG STATES ---
  const [editCadetModal, setEditCadetModal] = useState<{
    isOpen: boolean;
    index: number | null;
    isNew: boolean;
    data: CadetHouseItem;
  }>({
    isOpen: false,
    index: null,
    isNew: false,
    data: {
      id: '',
      name: '',
      founder: '',
      role: '',
      tagline: '',
      description: '',
      hero_image: '',
      location: '',
      motto: '',
    },
  });

  const [editAllyModal, setEditAllyModal] = useState<{
    isOpen: boolean;
    index: number | null;
    isNew: boolean;
    data: DynasticAllyItem;
  }>({
    isOpen: false,
    index: null,
    isNew: false,
    data: {
      id: '',
      name: '',
      dynasty: '',
      alliance_type: '',
      tagline: '',
      description: '',
      hero_image: '',
      seat: '',
      motto: '',
    },
  });

  const [editRoyalHeadModal, setEditRoyalHeadModal] = useState<{
    isOpen: boolean;
    data: RoyalHeadItem;
  }>({
    isOpen: false,
    data: defaultRoyalHead,
  });

  const [editQueenModal, setEditQueenModal] = useState<{
    isOpen: boolean;
    index: number | null;
    isNew: boolean;
    data: QueenItem;
  }>({
    isOpen: false,
    index: null,
    isNew: false,
    data: {
      id: '',
      title: 'Her Royal Majesty',
      name: '',
      role: '',
      bio: '',
      image: '',
      seat: '',
      patronages: '',
    },
  });

  const [editChildModal, setEditChildModal] = useState<{
    isOpen: boolean;
    index: number | null;
    isNew: boolean;
    data: RoyalChildItem;
  }>({
    isOpen: false,
    index: null,
    isNew: false,
    data: {
      id: '',
      name: '',
      title: '',
      role: '',
      age_desc: '',
      bio: '',
      image: '',
      house: '',
      house_link: '',
      emblem: '',
    },
  });

  const [editPageModal, setEditPageModal] = useState<{
    isOpen: boolean;
    pageKey: string;
    label: string;
    previewHref: string;
    data: PageHeroItem;
  }>({
    isOpen: false,
    pageKey: '',
    label: '',
    previewHref: '',
    data: { title: '', subtitle: '', media_url: '', body: '', cta_text: '', cta_link: '' },
  });

  // Custom Luxury Confirmation Modal (replaces browser confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const [editCharterModal, setEditCharterModal] = useState<{
    isOpen: boolean;
    type: 'privacy' | 'terms';
    title: string;
    subtitle: string;
    body: string;
    jurisdiction?: string;
    regulator?: string;
    effective_date?: string;
  }>({
    isOpen: false,
    type: 'privacy',
    title: '',
    subtitle: '',
    body: '',
  });

  const [editMenuModal, setEditMenuModal] = useState<{
    isOpen: boolean;
    index: number | null;
    isNew: boolean;
    data: HeaderNavItem;
  }>({
    isOpen: false,
    index: null,
    isNew: false,
    data: { label: '', href: '', order: 1, is_active: true },
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
        cadet_houses: rh.payload?.cadet_houses?.length ? rh.payload.cadet_houses : prev.cadet_houses,
        dynastic_allies: rh.payload?.dynastic_allies?.length ? rh.payload.dynastic_allies : prev.dynastic_allies,
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
        queens: rf.payload?.queens?.length ? rf.payload.queens : prev.queens,
        children: rf.payload?.children?.length ? rf.payload.children : prev.children,
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

  // --- SAVE ALL CMS BLOCKS IN ONE TRANSACTION ---
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
            queens: royalFamily.queens,
            children: royalFamily.children,
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
      setSuccessMessage('Executive Sanctuary changes published successfully! Changes reflect across all public pages immediately.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish CMS updates.';
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- CADET HOUSES CRUD HANDLERS ---
  const handleSaveCadetHouse = (e: React.FormEvent) => {
    e.preventDefault();
    const item = editCadetModal.data;
    if (!item.name.trim()) return;

    const id = item.id.trim() || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const preparedItem = { ...item, id };

    setRoyalHouses((prev) => {
      const list = [...prev.cadet_houses];
      if (editCadetModal.isNew || editCadetModal.index === null) {
        list.push(preparedItem);
      } else {
        list[editCadetModal.index] = preparedItem;
      }
      return { ...prev, cadet_houses: list };
    });

    setEditCadetModal({ ...editCadetModal, isOpen: false });
  };

  const handleDeleteCadetHouse = (index: number) => {
    const item = royalHouses.cadet_houses[index];
    setConfirmModal({
      isOpen: true,
      title: 'Remove Princely Cadet House',
      message: `Are you sure you wish to remove '${item.name}' from the Princely Cadet Houses register?`,
      confirmLabel: 'Remove House',
      onConfirm: () => {
        setRoyalHouses((prev) => ({
          ...prev,
          cadet_houses: prev.cadet_houses.filter((_, i) => i !== index),
        }));
        setConfirmModal(null);
      },
    });
  };

  // --- DYNASTIC ALLIES CRUD HANDLERS ---
  const handleSaveAlly = (e: React.FormEvent) => {
    e.preventDefault();
    const item = editAllyModal.data;
    if (!item.name.trim()) return;

    const id = item.id.trim() || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const preparedItem = { ...item, id };

    setRoyalHouses((prev) => {
      const list = [...prev.dynastic_allies];
      if (editAllyModal.isNew || editAllyModal.index === null) {
        list.push(preparedItem);
      } else {
        list[editAllyModal.index] = preparedItem;
      }
      return { ...prev, dynastic_allies: list };
    });

    setEditAllyModal({ ...editAllyModal, isOpen: false });
  };

  const handleDeleteAlly = (index: number) => {
    const item = royalHouses.dynastic_allies[index];
    setConfirmModal({
      isOpen: true,
      title: 'Remove Dynastic Ally',
      message: `Are you sure you wish to remove '${item.name}' from the Dynastic Allies ledger?`,
      confirmLabel: 'Remove Ally',
      onConfirm: () => {
        setRoyalHouses((prev) => ({
          ...prev,
          dynastic_allies: prev.dynastic_allies.filter((_, i) => i !== index),
        }));
        setConfirmModal(null);
      },
    });
  };

  // --- SOVEREIGN HEAD HANDLER ---
  const handleSaveRoyalHead = (e: React.FormEvent) => {
    e.preventDefault();
    setRoyalFamily((prev) => ({
      ...prev,
      royal_head: editRoyalHeadModal.data,
    }));
    setEditRoyalHeadModal({ ...editRoyalHeadModal, isOpen: false });
  };

  // --- QUEENS CRUD HANDLERS ---
  const handleSaveQueen = (e: React.FormEvent) => {
    e.preventDefault();
    const item = editQueenModal.data;
    if (!item.name.trim()) return;

    const id = item.id?.trim() || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const preparedItem = { ...item, id };

    setRoyalFamily((prev) => {
      const list = [...(prev.queens || [])];
      if (editQueenModal.isNew || editQueenModal.index === null) {
        list.push(preparedItem);
      } else {
        list[editQueenModal.index] = preparedItem;
      }
      return { ...prev, queens: list };
    });

    setEditQueenModal({ ...editQueenModal, isOpen: false });
  };

  const handleDeleteQueen = (index: number) => {
    const item = royalFamily.queens[index];
    setConfirmModal({
      isOpen: true,
      title: 'Remove Consort Record',
      message: `Are you sure you wish to remove '${item.name}' from the Queens & Consorts register?`,
      confirmLabel: 'Remove Record',
      onConfirm: () => {
        setRoyalFamily((prev) => ({
          ...prev,
          queens: prev.queens.filter((_, i) => i !== index),
        }));
        setConfirmModal(null);
      },
    });
  };

  // --- ROYAL HEIRS CRUD HANDLERS ---
  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    const item = editChildModal.data;
    if (!item.name.trim()) return;

    const id = item.id?.trim() || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const preparedItem = { ...item, id };

    setRoyalFamily((prev) => {
      const list = [...(prev.children || [])];
      if (editChildModal.isNew || editChildModal.index === null) {
        list.push(preparedItem);
      } else {
        list[editChildModal.index] = preparedItem;
      }
      return { ...prev, children: list };
    });

    setEditChildModal({ ...editChildModal, isOpen: false });
  };

  const handleDeleteChild = (index: number) => {
    const item = royalFamily.children[index];
    setConfirmModal({
      isOpen: true,
      title: 'Remove Royal Lineage Entry',
      message: `Are you sure you wish to remove '${item.name}' from the Royal Lineage?`,
      confirmLabel: 'Remove Entry',
      onConfirm: () => {
        setRoyalFamily((prev) => ({
          ...prev,
          children: prev.children.filter((_, i) => i !== index),
        }));
        setConfirmModal(null);
      },
    });
  };

  // --- PAGE HERO SAVE HANDLER ---
  const handleSavePageHero = (e: React.FormEvent) => {
    e.preventDefault();
    const key = editPageModal.pageKey;
    setHeroes((prev) => ({
      ...prev,
      [key]: editPageModal.data,
    }));
    setEditPageModal({ ...editPageModal, isOpen: false });
  };

  // --- CHARTER SAVE HANDLER ---
  const handleSaveCharter = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCharterModal.type === 'privacy') {
      setPrivacy({
        title: editCharterModal.title,
        subtitle: editCharterModal.subtitle,
        body: editCharterModal.body,
        jurisdiction: editCharterModal.jurisdiction || privacy.jurisdiction,
        regulator: editCharterModal.regulator || privacy.regulator,
        effective_date: editCharterModal.effective_date || privacy.effective_date,
      });
    } else {
      setTerms({
        title: editCharterModal.title,
        subtitle: editCharterModal.subtitle,
        body: editCharterModal.body,
      });
    }
    setEditCharterModal({ ...editCharterModal, isOpen: false });
  };

  // --- MENU ITEM SAVE HANDLER ---
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    const item = editMenuModal.data;
    if (!item.label.trim()) return;

    setHeaderNav((prev) => {
      const list = [...prev];
      if (editMenuModal.isNew || editMenuModal.index === null) {
        list.push(item);
      } else {
        list[editMenuModal.index] = item;
      }
      return list;
    });

    setEditMenuModal({ ...editMenuModal, isOpen: false });
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
      title="Executive Sanctuary CMS & Heritage Studio"
      subtitle="Structured table governance for cadet houses, sovereign lineage, dynastic covenants, and sanctuary editorial."
      actions={
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#B8976C]/15 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Publishing Vault...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Publish All Changes</span>
            </>
          )}
        </button>
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

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white/[0.03] border border-white/5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('royal')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'royal'
                ? 'bg-white/10 text-white font-semibold shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Royal Houses, Allies & Lineage</span>
          </button>

          <button
            onClick={() => setActiveTab('heroes')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'heroes'
                ? 'bg-white/10 text-white font-semibold shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Sanctuary Pages & Heroes</span>
          </button>

          <button
            onClick={() => setActiveTab('legal')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'legal'
                ? 'bg-white/10 text-white font-semibold shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Governance & Charters</span>
          </button>

          <button
            onClick={() => setActiveTab('brand')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'brand'
                ? 'bg-white/10 text-white font-semibold shadow-xs'
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
                ? 'bg-white/10 text-white font-semibold shadow-xs'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Menu className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Navigation & Footers</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ROYAL HOUSES, ALLIES & DYNASTIC LINEAGE          */}
        {/* ======================================================== */}
        {activeTab === 'royal' && (
          <div className="space-y-10">
            {/* 1. Sovereign Royal Head Stewardship Card / Table */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C5A880]/15 flex items-center justify-center text-[#C5A880]">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-lg text-white">The Sovereign Royal Head</h3>
                    <p className="text-xs text-white/50 font-light">
                      Supreme Patriarch & Custodian of the Uzih Royal Dynasty
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/royal-family"
                    target="_blank"
                    className="text-xs font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                  >
                    Public Page <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setEditRoyalHeadModal({
                        isOpen: true,
                        data: { ...royalFamily.royal_head },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Edit Sovereign Head</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-stone-900 shadow-md">
                    <img
                      src={royalFamily.royal_head.image || '/images/hudorian-seal.png'}
                      alt={royalFamily.royal_head.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5 grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/20">
                        {royalFamily.royal_head.title || 'His Royal Majesty'}
                      </span>
                      <h4 className="font-serif-luxury text-xl text-white font-medium">
                        {royalFamily.royal_head.name}
                      </h4>
                    </div>

                    <p className="text-xs text-white/70 font-light">
                      <span className="font-semibold text-white/90">Role:</span> {royalFamily.royal_head.role}
                    </p>

                    <p className="text-xs text-white/50 font-light line-clamp-2 max-w-3xl">
                      {royalFamily.royal_head.bio}
                    </p>

                    <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-[#C5A880]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Heraldry: {royalFamily.royal_head.heraldry || 'Lion Crest with Sovereign Solar Radiance'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Cadet Branches Table (Princely Houses) */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Princely Cadet Houses (Branches)</h3>
                  <p className="text-xs text-white/50 font-light">
                    Sovereign cadet branches established by the royal children of Uzih
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="/royal-houses"
                    target="_blank"
                    className="text-xs font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                  >
                    Public Houses <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setEditCadetModal({
                        isOpen: true,
                        index: null,
                        isNew: true,
                        data: {
                          id: '',
                          name: '',
                          founder: '',
                          role: 'Princely Cadet House',
                          tagline: '',
                          description: '',
                          hero_image: '',
                          location: '',
                          motto: '',
                        },
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Add Princely House</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4 pl-6">Hero / Crest</th>
                      <th className="p-4">Cadet House</th>
                      <th className="p-4">Founder & Role</th>
                      <th className="p-4">Location / Territory</th>
                      <th className="p-4">Ancestral Motto</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {royalHouses.cadet_houses.map((house, idx) => (
                      <tr key={house.id || idx} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6">
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 bg-stone-900 shrink-0">
                            {house.hero_image ? (
                              <img src={house.hero_image} alt={house.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 font-mono">No Img</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                          {house.name}
                          <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">#{house.id}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white/90 font-medium block">{house.founder}</span>
                          <span className="text-[11px] text-white/50 block">{house.role}</span>
                        </td>
                        <td className="p-4 text-white/70">{house.location || '—'}</td>
                        <td className="p-4 font-serif-luxury italic text-[#C5A880]">{house.motto || '—'}</td>
                        <td className="p-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditCadetModal({
                                  isOpen: true,
                                  index: idx,
                                  isNew: false,
                                  data: { ...house },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer flex items-center gap-1"
                              title="Edit House"
                            >
                              <Edit2 className="w-3 h-3 text-[#C5A880]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCadetHouse(idx)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Delete House"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Dynastic Allies Table */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Dynastic Allies (Sovereign Treaties)</h3>
                  <p className="text-xs text-white/50 font-light">
                    Allied families standing in eternal fellowship and reciprocal covenant
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditAllyModal({
                      isOpen: true,
                      index: null,
                      isNew: true,
                      data: {
                        id: '',
                        name: '',
                        dynasty: '',
                        alliance_type: 'Sovereign Treaty Alliance',
                        tagline: '',
                        description: '',
                        hero_image: '',
                        seat: '',
                        motto: '',
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Add Dynastic Ally</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4 pl-6">Citadel Image</th>
                      <th className="p-4">Ally Name & Dynasty</th>
                      <th className="p-4">Alliance Covenant</th>
                      <th className="p-4">Ancestral Seat</th>
                      <th className="p-4">Dynastic Motto</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {royalHouses.dynastic_allies.map((ally, idx) => (
                      <tr key={ally.id || idx} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6">
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 bg-stone-900 shrink-0">
                            {ally.hero_image ? (
                              <img src={ally.hero_image} alt={ally.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 font-mono">No Img</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                          {ally.name}
                          <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">{ally.dynasty}</span>
                        </td>
                        <td className="p-4 text-white/80 font-medium">{ally.alliance_type}</td>
                        <td className="p-4 text-white/70">{ally.seat || '—'}</td>
                        <td className="p-4 font-serif-luxury italic text-[#C5A880]">{ally.motto || '—'}</td>
                        <td className="p-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditAllyModal({
                                  isOpen: true,
                                  index: idx,
                                  isNew: false,
                                  data: { ...ally },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer flex items-center gap-1"
                              title="Edit Ally"
                            >
                              <Edit2 className="w-3 h-3 text-[#C5A880]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAlly(idx)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Delete Ally"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Queens & Consorts Table */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Queens & Consorts of the Realm</h3>
                  <p className="text-xs text-white/50 font-light">
                    Sovereign consorts, guardians of culture, foundation chairs, and royal pavilions
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditQueenModal({
                      isOpen: true,
                      index: null,
                      isNew: true,
                      data: {
                        id: '',
                        title: 'Her Royal Majesty',
                        name: '',
                        role: '',
                        bio: '',
                        image: '',
                        seat: '',
                        patronages: '',
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Add Queen / Consort</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4 pl-6">Portrait</th>
                      <th className="p-4">Title & Name</th>
                      <th className="p-4">Role & Pavilion Seat</th>
                      <th className="p-4">Biography Lore</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {royalFamily.queens.map((queen, idx) => (
                      <tr key={queen.id || idx} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6">
                          <div className="w-12 h-14 rounded-lg overflow-hidden border border-white/10 bg-stone-900 shrink-0">
                            {queen.image ? (
                              <img src={queen.image} alt={queen.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 font-mono">No Img</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                          {queen.name}
                          <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">{queen.title}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white/90 font-medium block">{queen.role}</span>
                          <span className="text-[11px] text-white/50 block">{queen.seat}</span>
                        </td>
                        <td className="p-4 text-white/60 line-clamp-2 max-w-md">{queen.bio}</td>
                        <td className="p-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditQueenModal({
                                  isOpen: true,
                                  index: idx,
                                  isNew: false,
                                  data: { ...queen },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer flex items-center gap-1"
                              title="Edit Queen"
                            >
                              <Edit2 className="w-3 h-3 text-[#C5A880]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQueen(idx)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Delete Queen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Princely Heirs & Royal Children Table */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Princely Heirs & Royal Children</h3>
                  <p className="text-xs text-white/50 font-light">
                    The royal sons and daughters of Uzih and their designated cadet houses
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditChildModal({
                      isOpen: true,
                      index: null,
                      isNew: true,
                      data: {
                        id: '',
                        name: '',
                        title: '',
                        role: '',
                        age_desc: '',
                        bio: '',
                        image: '',
                        house: '',
                        house_link: '',
                        emblem: '',
                      },
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Add Royal Heir</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4 pl-6">Portrait</th>
                      <th className="p-4">Name & Title</th>
                      <th className="p-4">Designation & Role</th>
                      <th className="p-4">Associated Cadet House</th>
                      <th className="p-4">Emblem & Crest</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {royalFamily.children.map((child, idx) => (
                      <tr key={child.id || idx} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6">
                          <div className="w-12 h-14 rounded-lg overflow-hidden border border-white/10 bg-stone-900 shrink-0">
                            {child.image ? (
                              <img src={child.image} alt={child.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 font-mono">No Img</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                          {child.name}
                          <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">{child.title}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white/90 font-medium block">{child.role}</span>
                          <span className="text-[10px] text-white/50 block font-mono">{child.age_desc || 'Royal Lineage'}</span>
                        </td>
                        <td className="p-4 font-serif-luxury text-white/80">
                          {child.house}
                          {child.house_link && (
                            <span className="block text-[10px] font-mono text-white/40">{child.house_link}</span>
                          )}
                        </td>
                        <td className="p-4 text-white/70 text-[11px]">{child.emblem || '—'}</td>
                        <td className="p-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditChildModal({
                                  isOpen: true,
                                  index: idx,
                                  isNew: false,
                                  data: { ...child },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer flex items-center gap-1"
                              title="Edit Heir"
                            >
                              <Edit2 className="w-3 h-3 text-[#C5A880]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteChild(idx)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Delete Heir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: SANCTUARY PAGES & HEROES (EXECUTIVE TABLE)        */}
        {/* ======================================================== */}
        {activeTab === 'heroes' && (
          <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-lg text-white">Sanctuary Pages & Editorial Registry</h3>
                <p className="text-xs text-white/50 font-light">
                  Edit headlines, subtitles, media, and calls-to-action for all public sanctuary routes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Hero Preview</th>
                    <th className="p-4">Sanctuary Page</th>
                    <th className="p-4">Headline / Hero Title</th>
                    <th className="p-4">Subtitle Lore</th>
                    <th className="p-4">Live Route</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {pagesConfig.map((page) => {
                    const item = heroes[page.key] || { title: '', subtitle: '', media_url: '' };
                    return (
                      <tr key={page.key} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6">
                          <div className="w-20 h-12 rounded-lg overflow-hidden border border-white/10 bg-stone-900 shrink-0">
                            {item.media_url ? (
                              <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 font-mono">No Image</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                          {page.label}
                          <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">{page.key}</span>
                        </td>
                        <td className="p-4 text-white/90 font-medium max-w-xs truncate">{item.title}</td>
                        <td className="p-4 text-white/60 line-clamp-2 max-w-sm">{item.subtitle}</td>
                        <td className="p-4">
                          <a
                            href={page.previewHref}
                            target="_blank"
                            className="font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                          >
                            <span>{page.previewHref}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setEditPageModal({
                                isOpen: true,
                                pageKey: page.key,
                                label: page.label,
                                previewHref: page.previewHref,
                                data: { ...item },
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-[#C5A880]" />
                            <span>Edit Page</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: GOVERNANCE, PRIVACY & CHARTERS (EXECUTIVE TABLE)  */}
        {/* ======================================================== */}
        {activeTab === 'legal' && (
          <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-lg text-white">Governance, Privacy & House Code Charters</h3>
                <p className="text-xs text-white/50 font-light">
                  Statutory charters, NDPA compliance, and sanctuary membership codes of fellowship.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Charter Document</th>
                    <th className="p-4">Regulatory Authority</th>
                    <th className="p-4">Jurisdiction</th>
                    <th className="p-4">Effective Date</th>
                    <th className="p-4">Live Link</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  <tr className="hover:bg-white/[0.02] transition">
                    <td className="p-4 pl-6 font-serif-luxury text-sm text-white font-medium">
                      {privacy.title}
                      <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">page_privacy</span>
                    </td>
                    <td className="p-4 text-white/80">{privacy.regulator}</td>
                    <td className="p-4 text-white/80">{privacy.jurisdiction}</td>
                    <td className="p-4 font-mono text-[#C5A880]">{privacy.effective_date}</td>
                    <td className="p-4">
                      <a href="/privacy" target="_blank" className="font-mono text-[#C5A880] hover:underline flex items-center gap-1">
                        /privacy <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setEditCharterModal({
                            isOpen: true,
                            type: 'privacy',
                            title: privacy.title,
                            subtitle: privacy.subtitle,
                            body: privacy.body,
                            jurisdiction: privacy.jurisdiction,
                            regulator: privacy.regulator,
                            effective_date: privacy.effective_date,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-[#C5A880]" />
                        <span>Edit Charter</span>
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-white/[0.02] transition">
                    <td className="p-4 pl-6 font-serif-luxury text-sm text-white font-medium">
                      {terms.title}
                      <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">page_terms</span>
                    </td>
                    <td className="p-4 text-white/80">HUDORIAN Sanctuary Governance Council</td>
                    <td className="p-4 text-white/80">Global Sanctuaries & Estates</td>
                    <td className="p-4 font-mono text-[#C5A880]">Perpetual / 2026</td>
                    <td className="p-4">
                      <a href="/terms" target="_blank" className="font-mono text-[#C5A880] hover:underline flex items-center gap-1">
                        /terms <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setEditCharterModal({
                            isOpen: true,
                            type: 'terms',
                            title: terms.title,
                            subtitle: terms.subtitle,
                            body: terms.body,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-[#C5A880]" />
                        <span>Edit Charter</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: BRAND IDENTITY & LOGO (EXECUTIVE TABLE / PANEL)   */}
        {/* ======================================================== */}
        {activeTab === 'brand' && (
          <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-lg text-white">Brand Typography & Seal Assets</h3>
                <p className="text-xs text-white/50 font-light">
                  Configure brand wordmark typography, crest seal imagery, and concierge coordinates.
                </p>
              </div>
            </div>

            <div className="p-6 divide-y divide-white/5 text-xs">
              <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 text-white/50 font-mono uppercase tracking-wider">Logo Display Mode</div>
                <div className="md:col-span-8 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setBrand({ ...brand, logo_type: 'image' })}
                    className={`px-4 py-2 rounded-xl border text-xs transition cursor-pointer ${
                      brand.logo_type === 'image'
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-white font-medium'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                    }`}
                  >
                    Custom Seal Crest Asset (PNG / SVG)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrand({ ...brand, logo_type: 'text' })}
                    className={`px-4 py-2 rounded-xl border text-xs transition cursor-pointer ${
                      brand.logo_type === 'text'
                        ? 'border-[#C5A880] bg-[#C5A880]/15 text-white font-medium'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white'
                    }`}
                  >
                    Wordmark Typography Text
                  </button>
                </div>
              </div>

              <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 text-white/50 font-mono uppercase tracking-wider">Wordmark Brand Name</div>
                <div className="md:col-span-8">
                  <input
                    type="text"
                    value={brand.logo_text || ''}
                    onChange={(e) => setBrand({ ...brand, logo_text: e.target.value })}
                    className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-serif-luxury text-white tracking-[0.2em] uppercase focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 text-white/50 font-mono uppercase tracking-wider">Seal Asset URL</div>
                <div className="md:col-span-8 space-y-2">
                  <input
                    type="text"
                    value={brand.logo_image_url || ''}
                    onChange={(e) => setBrand({ ...brand, logo_image_url: e.target.value })}
                    className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                  />
                  {brand.logo_image_url && (
                    <div className="w-16 h-16 p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                      <img src={brand.logo_image_url} alt="Logo Seal" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 text-white/50 font-mono uppercase tracking-wider">Philosophy Tagline</div>
                <div className="md:col-span-8">
                  <input
                    type="text"
                    value={brand.tagline || ''}
                    onChange={(e) => setBrand({ ...brand, tagline: e.target.value })}
                    className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-4 text-white/50 font-mono uppercase tracking-wider">Concierge Coordinates</div>
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1">Email</label>
                    <input
                      type="email"
                      value={brand.concierge_email || ''}
                      onChange={(e) => setBrand({ ...brand, concierge_email: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-white/40 mb-1">Phone Line</label>
                    <input
                      type="text"
                      value={brand.concierge_phone || ''}
                      onChange={(e) => setBrand({ ...brand, concierge_phone: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: NAVIGATION & FOOTERS (EXECUTIVE TABLE)            */}
        {/* ======================================================== */}
        {activeTab === 'menus' && (
          <div className="space-y-8">
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">Header Navigation Links</h3>
                  <p className="text-xs text-white/50 font-light">
                    Manage the public top navbar directory links, sorting order, and active visibility.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditMenuModal({
                      isOpen: true,
                      index: null,
                      isNew: true,
                      data: { label: '', href: '/', order: headerNav.length + 1, is_active: true },
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Add Menu Link</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4 pl-6 w-20">Order</th>
                      <th className="p-4">Menu Label</th>
                      <th className="p-4">Target Route URL</th>
                      <th className="p-4">Visibility</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {headerNav.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 pl-6 font-mono text-[#C5A880]">{item.order}</td>
                        <td className="p-4 font-serif-luxury text-sm text-white font-medium">{item.label}</td>
                        <td className="p-4 font-mono text-white/70">{item.href}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                              item.is_active !== false
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : 'bg-stone-500/10 text-stone-400 border border-stone-500/20'
                            }`}
                          >
                            {item.is_active !== false ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditMenuModal({
                                  isOpen: true,
                                  index: idx,
                                  isNew: false,
                                  data: { ...item },
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer flex items-center gap-1"
                              title="Edit Link"
                            >
                              <Edit2 className="w-3 h-3 text-[#C5A880]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Remove Navigation Item',
                                  message: `Are you sure you want to remove '${item.label}' from the header navigation menu?`,
                                  confirmLabel: 'Remove Link',
                                  onConfirm: () => {
                                    setHeaderNav((prev) => prev.filter((_, i) => i !== idx));
                                    setConfirmModal(null);
                                  },
                                });
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Delete Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Copy Table / Panel */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl p-6 space-y-4">
              <h3 className="font-serif-luxury text-lg text-white">Footer Copyright & Epilogue</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Copyright Notice
                  </label>
                  <input
                    type="text"
                    value={footerCopyright}
                    onChange={(e) => setFooterCopyright(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50">
                    Tagline / Epilogue Motto
                  </label>
                  <input
                    type="text"
                    value={footerTagline}
                    onChange={(e) => setFooterTagline(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SOVEREIGN ROYAL HEAD EDIT MODAL                 */}
      {/* ======================================================== */}
      {editRoyalHeadModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">Edit Sovereign Royal Head</h3>
              </div>
              <button
                onClick={() => setEditRoyalHeadModal({ ...editRoyalHeadModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoyalHead} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Royal Title</label>
                  <input
                    type="text"
                    value={editRoyalHeadModal.data.title}
                    onChange={(e) =>
                      setEditRoyalHeadModal({
                        ...editRoyalHeadModal,
                        data: { ...editRoyalHeadModal.data, title: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Sovereign Name</label>
                  <input
                    type="text"
                    value={editRoyalHeadModal.data.name}
                    onChange={(e) =>
                      setEditRoyalHeadModal({
                        ...editRoyalHeadModal,
                        data: { ...editRoyalHeadModal.data, name: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Sovereign Role</label>
                <input
                  type="text"
                  value={editRoyalHeadModal.data.role}
                  onChange={(e) =>
                    setEditRoyalHeadModal({
                      ...editRoyalHeadModal,
                      data: { ...editRoyalHeadModal.data, role: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Heraldry / Crest Lore</label>
                <input
                  type="text"
                  value={editRoyalHeadModal.data.heraldry}
                  onChange={(e) =>
                    setEditRoyalHeadModal({
                      ...editRoyalHeadModal,
                      data: { ...editRoyalHeadModal.data, heraldry: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-white/40">Portrait Image URL</label>
                <input
                  type="url"
                  value={editRoyalHeadModal.data.image}
                  onChange={(e) =>
                    setEditRoyalHeadModal({
                      ...editRoyalHeadModal,
                      data: { ...editRoyalHeadModal.data, image: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
                {editRoyalHeadModal.data.image && (
                  <div className="h-32 w-28 rounded-xl overflow-hidden border border-white/10 mt-1">
                    <img src={editRoyalHeadModal.data.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Sovereign Biography</label>
                <textarea
                  rows={4}
                  value={editRoyalHeadModal.data.bio}
                  onChange={(e) =>
                    setEditRoyalHeadModal({
                      ...editRoyalHeadModal,
                      data: { ...editRoyalHeadModal.data, bio: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditRoyalHeadModal({ ...editRoyalHeadModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  Update Sovereign Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CADET HOUSE CREATE / EDIT MODAL                 */}
      {/* ======================================================== */}
      {editCadetModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">
                  {editCadetModal.isNew ? 'Add Princely Cadet House' : 'Edit Cadet House'}
                </h3>
              </div>
              <button
                onClick={() => setEditCadetModal({ ...editCadetModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCadetHouse} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">House Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reda House"
                    value={editCadetModal.data.name}
                    onChange={(e) =>
                      setEditCadetModal({
                        ...editCadetModal,
                        data: { ...editCadetModal.data, name: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Slug Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. reda-house"
                    value={editCadetModal.data.id}
                    onChange={(e) =>
                      setEditCadetModal({
                        ...editCadetModal,
                        data: { ...editCadetModal.data, id: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Founder & Heritage</label>
                  <input
                    type="text"
                    placeholder="Founded by Prince..."
                    value={editCadetModal.data.founder}
                    onChange={(e) =>
                      setEditCadetModal({
                        ...editCadetModal,
                        data: { ...editCadetModal.data, founder: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Sanctuary Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Princely Cadet House & Maritime Domain"
                    value={editCadetModal.data.role}
                    onChange={(e) =>
                      setEditCadetModal({
                        ...editCadetModal,
                        data: { ...editCadetModal.data, role: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Territory / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. The Reda Coastal Citadel, Balearic Isles"
                    value={editCadetModal.data.location}
                    onChange={(e) =>
                      setEditCadetModal({
                        ...editCadetModal,
                        data: { ...editCadetModal.data, location: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Ancestral Motto</label>
                  <input
                    type="text"
                    placeholder="e.g. Honor, Vision, Endurance"
                    value={editCadetModal.data.motto}
                    onChange={(e) =>
                      setEditCadetModal({
                        ...editCadetModal,
                        data: { ...editCadetModal.data, motto: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs italic text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-white/40">Hero Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editCadetModal.data.hero_image}
                  onChange={(e) =>
                    setEditCadetModal({
                      ...editCadetModal,
                      data: { ...editCadetModal.data, hero_image: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
                {editCadetModal.data.hero_image && (
                  <div className="h-28 w-full rounded-xl overflow-hidden border border-white/10 mt-1">
                    <img src={editCadetModal.data.hero_image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Overview Description</label>
                <textarea
                  rows={3}
                  value={editCadetModal.data.description}
                  onChange={(e) =>
                    setEditCadetModal({
                      ...editCadetModal,
                      data: { ...editCadetModal.data, description: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditCadetModal({ ...editCadetModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  {editCadetModal.isNew ? 'Create Cadet House' : 'Save House Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DYNASTIC ALLY CREATE / EDIT MODAL               */}
      {/* ======================================================== */}
      {editAllyModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">
                  {editAllyModal.isNew ? 'Add Dynastic Ally' : 'Edit Dynastic Ally'}
                </h3>
              </div>
              <button
                onClick={() => setEditAllyModal({ ...editAllyModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlly} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Ally Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Family of Victors"
                    value={editAllyModal.data.name}
                    onChange={(e) =>
                      setEditAllyModal({
                        ...editAllyModal,
                        data: { ...editAllyModal.data, name: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Dynasty House</label>
                  <input
                    type="text"
                    placeholder="e.g. House of Victor"
                    value={editAllyModal.data.dynasty}
                    onChange={(e) =>
                      setEditAllyModal({
                        ...editAllyModal,
                        data: { ...editAllyModal.data, dynasty: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Alliance Covenant</label>
                  <input
                    type="text"
                    placeholder="e.g. Sovereign Treaty Alliance & Companions of Honor"
                    value={editAllyModal.data.alliance_type}
                    onChange={(e) =>
                      setEditAllyModal({
                        ...editAllyModal,
                        data: { ...editAllyModal.data, alliance_type: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Ancestral Seat</label>
                  <input
                    type="text"
                    placeholder="e.g. The Citadel of Victors & Grand Estate"
                    value={editAllyModal.data.seat}
                    onChange={(e) =>
                      setEditAllyModal({
                        ...editAllyModal,
                        data: { ...editAllyModal.data, seat: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Dynastic Motto</label>
                <input
                  type="text"
                  placeholder="e.g. Invictus in Aeternum"
                  value={editAllyModal.data.motto}
                  onChange={(e) =>
                    setEditAllyModal({
                      ...editAllyModal,
                      data: { ...editAllyModal.data, motto: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs italic text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-white/40">Citadel Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editAllyModal.data.hero_image}
                  onChange={(e) =>
                    setEditAllyModal({
                      ...editAllyModal,
                      data: { ...editAllyModal.data, hero_image: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
                {editAllyModal.data.hero_image && (
                  <div className="h-28 w-full rounded-xl overflow-hidden border border-white/10 mt-1">
                    <img src={editAllyModal.data.hero_image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Alliance Chronicle</label>
                <textarea
                  rows={3}
                  value={editAllyModal.data.description}
                  onChange={(e) =>
                    setEditAllyModal({
                      ...editAllyModal,
                      data: { ...editAllyModal.data, description: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditAllyModal({ ...editAllyModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  {editAllyModal.isNew ? 'Create Dynastic Ally' : 'Save Ally Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: QUEEN / CONSORT CREATE / EDIT MODAL             */}
      {/* ======================================================== */}
      {editQueenModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">
                  {editQueenModal.isNew ? 'Add Queen / Consort' : 'Edit Queen / Consort'}
                </h3>
              </div>
              <button
                onClick={() => setEditQueenModal({ ...editQueenModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQueen} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Her Royal Majesty"
                    value={editQueenModal.data.title}
                    onChange={(e) =>
                      setEditQueenModal({
                        ...editQueenModal,
                        data: { ...editQueenModal.data, title: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Queen Consort Aisha of Uzih"
                    value={editQueenModal.data.name}
                    onChange={(e) =>
                      setEditQueenModal({
                        ...editQueenModal,
                        data: { ...editQueenModal.data, name: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Role & Dignity</label>
                  <input
                    type="text"
                    placeholder="e.g. First Lady of the Realm & Patroness of Fine Arts"
                    value={editQueenModal.data.role}
                    onChange={(e) =>
                      setEditQueenModal({
                        ...editQueenModal,
                        data: { ...editQueenModal.data, role: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Pavilion Seat</label>
                  <input
                    type="text"
                    placeholder="e.g. The Emerald Pavilion, Marbella Domain"
                    value={editQueenModal.data.seat}
                    onChange={(e) =>
                      setEditQueenModal({
                        ...editQueenModal,
                        data: { ...editQueenModal.data, seat: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-white/40">Portrait Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editQueenModal.data.image}
                  onChange={(e) =>
                    setEditQueenModal({
                      ...editQueenModal,
                      data: { ...editQueenModal.data, image: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
                {editQueenModal.data.image && (
                  <div className="h-28 w-24 rounded-xl overflow-hidden border border-white/10 mt-1">
                    <img src={editQueenModal.data.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Biography Lore</label>
                <textarea
                  rows={3}
                  value={editQueenModal.data.bio}
                  onChange={(e) =>
                    setEditQueenModal({
                      ...editQueenModal,
                      data: { ...editQueenModal.data, bio: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditQueenModal({ ...editQueenModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  {editQueenModal.isNew ? 'Create Queen Record' : 'Save Queen Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: ROYAL HEIR / CHILD CREATE / EDIT MODAL          */}
      {/* ======================================================== */}
      {editChildModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">
                  {editChildModal.isNew ? 'Add Princely Heir / Royal Child' : 'Edit Royal Heir'}
                </h3>
              </div>
              <button
                onClick={() => setEditChildModal({ ...editChildModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChild} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Royal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prince Reda of Uzih"
                    value={editChildModal.data.name}
                    onChange={(e) =>
                      setEditChildModal({
                        ...editChildModal,
                        data: { ...editChildModal.data, name: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Title & Status</label>
                  <input
                    type="text"
                    placeholder="e.g. Founder & Heir to Reda House"
                    value={editChildModal.data.title}
                    onChange={(e) =>
                      setEditChildModal({
                        ...editChildModal,
                        data: { ...editChildModal.data, title: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Role & Envoy</label>
                  <input
                    type="text"
                    placeholder="e.g. Crown Prince & Maritime Patron"
                    value={editChildModal.data.role}
                    onChange={(e) =>
                      setEditChildModal({
                        ...editChildModal,
                        data: { ...editChildModal.data, role: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Age / Lineage Rank</label>
                  <input
                    type="text"
                    placeholder="e.g. Eldest Royal Son"
                    value={editChildModal.data.age_desc || ''}
                    onChange={(e) =>
                      setEditChildModal({
                        ...editChildModal,
                        data: { ...editChildModal.data, age_desc: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Associated Cadet House</label>
                  <input
                    type="text"
                    placeholder="e.g. Reda House"
                    value={editChildModal.data.house}
                    onChange={(e) =>
                      setEditChildModal({
                        ...editChildModal,
                        data: { ...editChildModal.data, house: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Cadet House Anchor Link</label>
                  <input
                    type="text"
                    placeholder="/royal-houses#reda-house"
                    value={editChildModal.data.house_link}
                    onChange={(e) =>
                      setEditChildModal({
                        ...editChildModal,
                        data: { ...editChildModal.data, house_link: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Emblem & Heraldic Crest</label>
                <input
                  type="text"
                  placeholder="e.g. Golden Falcon over Azure Crest"
                  value={editChildModal.data.emblem}
                  onChange={(e) =>
                    setEditChildModal({
                      ...editChildModal,
                      data: { ...editChildModal.data, emblem: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#C5A880] focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-white/40">Portrait Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editChildModal.data.image}
                  onChange={(e) =>
                    setEditChildModal({
                      ...editChildModal,
                      data: { ...editChildModal.data, image: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
                {editChildModal.data.image && (
                  <div className="h-28 w-24 rounded-xl overflow-hidden border border-white/10 mt-1">
                    <img src={editChildModal.data.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Biography Lore</label>
                <textarea
                  rows={3}
                  value={editChildModal.data.bio}
                  onChange={(e) =>
                    setEditChildModal({
                      ...editChildModal,
                      data: { ...editChildModal.data, bio: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditChildModal({ ...editChildModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  {editChildModal.isNew ? 'Create Heir Record' : 'Save Heir Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: SANCTUARY PAGE EDIT MODAL                       */}
      {/* ======================================================== */}
      {editPageModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif-luxury text-lg text-white">Edit {editPageModal.label}</h3>
                <span className="text-[10px] font-mono text-[#C5A880]">{editPageModal.pageKey}</span>
              </div>
              <button
                onClick={() => setEditPageModal({ ...editPageModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePageHero} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Page Headline *</label>
                <input
                  type="text"
                  required
                  value={editPageModal.data.title}
                  onChange={(e) =>
                    setEditPageModal({
                      ...editPageModal,
                      data: { ...editPageModal.data, title: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm font-serif-luxury text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Subtitle / Tagline</label>
                <textarea
                  rows={2}
                  value={editPageModal.data.subtitle}
                  onChange={(e) =>
                    setEditPageModal({
                      ...editPageModal,
                      data: { ...editPageModal.data, subtitle: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-mono uppercase text-white/40">Hero Background Media URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editPageModal.data.media_url}
                  onChange={(e) =>
                    setEditPageModal({
                      ...editPageModal,
                      data: { ...editPageModal.data, media_url: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
                {editPageModal.data.media_url && (
                  <div className="h-36 w-full rounded-xl overflow-hidden border border-white/10 mt-1">
                    <img src={editPageModal.data.media_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Sanctuary Body Text / Manifesto</label>
                <textarea
                  rows={3}
                  value={editPageModal.data.body || ''}
                  onChange={(e) =>
                    setEditPageModal({
                      ...editPageModal,
                      data: { ...editPageModal.data, body: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">CTA Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Explore Membership"
                    value={editPageModal.data.cta_text || ''}
                    onChange={(e) =>
                      setEditPageModal({
                        ...editPageModal,
                        data: { ...editPageModal.data, cta_text: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">CTA Button Route Link</label>
                  <input
                    type="text"
                    placeholder="e.g. /membership"
                    value={editPageModal.data.cta_link || ''}
                    onChange={(e) =>
                      setEditPageModal({
                        ...editPageModal,
                        data: { ...editPageModal.data, cta_link: e.target.value },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditPageModal({ ...editPageModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  Save Page Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: LEGAL CHARTER EDIT MODAL                        */}
      {/* ======================================================== */}
      {editCharterModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">
                  Edit {editCharterModal.type === 'privacy' ? 'Privacy Policy Charter' : 'Membership Terms Charter'}
                </h3>
              </div>
              <button
                onClick={() => setEditCharterModal({ ...editCharterModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCharter} className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Charter Title *</label>
                <input
                  type="text"
                  required
                  value={editCharterModal.title}
                  onChange={(e) =>
                    setEditCharterModal({ ...editCharterModal, title: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm font-serif-luxury text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Subtitle</label>
                <input
                  type="text"
                  value={editCharterModal.subtitle}
                  onChange={(e) =>
                    setEditCharterModal({ ...editCharterModal, subtitle: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              {editCharterModal.type === 'privacy' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-white/40">Jurisdiction</label>
                    <input
                      type="text"
                      value={editCharterModal.jurisdiction || ''}
                      onChange={(e) =>
                        setEditCharterModal({ ...editCharterModal, jurisdiction: e.target.value })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-white/40">Regulator</label>
                    <input
                      type="text"
                      value={editCharterModal.regulator || ''}
                      onChange={(e) =>
                        setEditCharterModal({ ...editCharterModal, regulator: e.target.value })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono uppercase text-white/40">Effective Date</label>
                    <input
                      type="text"
                      value={editCharterModal.effective_date || ''}
                      onChange={(e) =>
                        setEditCharterModal({ ...editCharterModal, effective_date: e.target.value })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Charter Statutory Body</label>
                <textarea
                  rows={6}
                  value={editCharterModal.body}
                  onChange={(e) =>
                    setEditCharterModal({ ...editCharterModal, body: e.target.value })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/80 focus:outline-none focus:border-[#C5A880] leading-relaxed resize-none"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditCharterModal({ ...editCharterModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  Save Charter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 8: MENU ITEM CREATE / EDIT MODAL                   */}
      {/* ======================================================== */}
      {editMenuModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-serif-luxury text-base text-white">
                {editMenuModal.isNew ? 'Add Navigation Link' : 'Edit Navigation Link'}
              </h3>
              <button
                onClick={() => setEditMenuModal({ ...editMenuModal, isOpen: false })}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Link Label *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Estates"
                  value={editMenuModal.data.label}
                  onChange={(e) =>
                    setEditMenuModal({
                      ...editMenuModal,
                      data: { ...editMenuModal.data, label: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase text-white/40">Target URL Route *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /estates"
                  value={editMenuModal.data.href}
                  onChange={(e) =>
                    setEditMenuModal({
                      ...editMenuModal,
                      data: { ...editMenuModal.data, href: e.target.value },
                    })
                  }
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase text-white/40">Sorting Order</label>
                  <input
                    type="number"
                    value={editMenuModal.data.order}
                    onChange={(e) =>
                      setEditMenuModal({
                        ...editMenuModal,
                        data: { ...editMenuModal.data, order: parseInt(e.target.value) || 0 },
                      })
                    }
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#C5A880]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                    <input
                      type="checkbox"
                      checked={editMenuModal.data.is_active !== false}
                      onChange={(e) =>
                        setEditMenuModal({
                          ...editMenuModal,
                          data: { ...editMenuModal.data, is_active: e.target.checked },
                        })
                      }
                      className="rounded border-white/20 bg-white/5 text-[#C5A880] focus:ring-0"
                    />
                    <span>Visible in Nav</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditMenuModal({ ...editMenuModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Luxury Custom Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#121212] border border-[#2A2620] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg text-white">{confirmModal.title}</h3>
                  <p className="text-xs text-white/50">Irreversible steward action</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="text-white/40 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
              >
                {confirmModal.confirmLabel || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SecureGateLayout>
  );
}
