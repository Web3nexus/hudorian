'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Eye,
  Pencil,
  ExternalLink,
  X,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Star,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import SecureGateLayout from '@/components/securegate/SecureGateLayout';
import { api } from '@/lib/api';
import type { HousePayload } from '@/lib/api';
import { Amenity, Estate, House, Location } from '@/types';

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  location_id: string;
  estate_id: string;
  house_type: string;
  status: string;
  is_featured: boolean;
  sort_order: string;
  address: string;
  latitude: string;
  longitude: string;
  short_description: string;
  description: string;
  hero_image: string;
  hero_video: string;
  amenities: number[];
};

const EMPTY_FORM: FormState = {
  name: '',
  slug: '',
  tagline: '',
  location_id: '',
  estate_id: '',
  house_type: 'house',
  status: 'active',
  is_featured: false,
  sort_order: '0',
  address: '',
  latitude: '',
  longitude: '',
  short_description: '',
  description: '',
  hero_image: '',
  hero_video: '',
  amenities: [],
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  coming_soon: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  members_only: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  archived: 'bg-white/5 text-white/50 border-white/10',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  coming_soon: 'Coming Soon',
  members_only: 'Members Only',
  archived: 'Archived',
};

const TYPE_LABELS: Record<string, string> = {
  house: 'House',
  estate: 'Estate',
  club: 'Club',
  retreat: 'Retreat',
  villa: 'Villa',
  city_house: 'City House',
};

const inputClass =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#C5A880] transition';
const labelClass = 'block text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1.5';

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

function houseToForm(house: House): FormState {
  return {
    name: house.name || '',
    slug: house.slug || '',
    tagline: house.tagline || '',
    location_id: house.location_id ? String(house.location_id) : '',
    estate_id: house.estate_id ? String(house.estate_id) : '',
    house_type: house.house_type || 'house',
    status: house.status || 'active',
    is_featured: Boolean(house.is_featured),
    sort_order: String(house.sort_order ?? 0),
    address: house.address || '',
    latitude: house.latitude != null ? String(house.latitude) : '',
    longitude: house.longitude != null ? String(house.longitude) : '',
    short_description: house.short_description || '',
    description: house.description || '',
    hero_image: house.hero_image || '',
    hero_video: house.hero_video || '',
    amenities: (house.amenities || []).map((a) => a.id),
  };
}

function formToPayload(form: FormState): HousePayload {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || null,
    location_id: form.location_id ? Number(form.location_id) : '',
    estate_id: form.estate_id ? Number(form.estate_id) : null,
    tagline: form.tagline.trim() || null,
    house_type: form.house_type,
    status: form.status,
    is_featured: form.is_featured,
    sort_order: form.sort_order === '' ? 0 : Number(form.sort_order),
    address: form.address.trim(),
    latitude: form.latitude === '' ? null : Number(form.latitude),
    longitude: form.longitude === '' ? null : Number(form.longitude),
    short_description: form.short_description.trim() || null,
    description: form.description.trim(),
    hero_image: form.hero_image.trim() || null,
    hero_video: form.hero_video.trim() || null,
    amenities: form.amenities,
  };
}

type Flash = { type: 'success' | 'error'; text: string };

type HouseReference = {
  locations: Location[];
  estates: Estate[];
  amenities: Amenity[];
  house_types: string[];
  statuses: string[];
};

const DEFAULT_REFERENCE: HouseReference = {
  locations: [],
  estates: [],
  amenities: [],
  house_types: ['house', 'estate', 'club', 'retreat', 'villa', 'city_house'],
  statuses: ['active', 'coming_soon', 'members_only', 'archived'],
};

async function fetchAdminHouses(handlers: {
  onLoading: (loading: boolean) => void;
  onHouses: (houses: House[]) => void;
  onFlash: (flash: Flash) => void;
  withSpinner?: boolean;
}): Promise<void> {
  if (handlers.withSpinner) handlers.onLoading(true);
  try {
    const res = await api.getAdminHouses();
    handlers.onHouses(res.data || []);
  } catch (err) {
    console.warn('Could not load houses:', err);
    handlers.onFlash({ type: 'error', text: 'Unable to sync the sanctuary inventory from the SecureGate vault.' });
  } finally {
    handlers.onLoading(false);
  }
}

async function fetchHouseReference(onReference: (reference: HouseReference) => void): Promise<void> {
  try {
    const res = await api.getAdminHouseReference();
    onReference({
      locations: res.data.locations || [],
      estates: res.data.estates || [],
      amenities: res.data.amenities || [],
      house_types: res.data.house_types || DEFAULT_REFERENCE.house_types,
      statuses: res.data.statuses || DEFAULT_REFERENCE.statuses,
    });
  } catch (err) {
    console.warn('Could not load house reference data:', err);
    onReference(DEFAULT_REFERENCE);
  }
}

export default function SecureGateHousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [reference, setReference] = useState<HouseReference>(DEFAULT_REFERENCE);
  const { locations, estates, amenities, house_types: houseTypes, statuses } = reference;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inspectHouse, setInspectHouse] = useState<House | null>(null);
  const [flash, setFlash] = useState<Flash | null>(null);

  const [editor, setEditor] = useState<{ isOpen: boolean; isNew: boolean; id: number | null; form: FormState }>({
    isOpen: false,
    isNew: true,
    id: null,
    form: EMPTY_FORM,
  });
  const [formError, setFormError] = useState('');
  // Stores the URL that failed to load so the preview self-heals as the URL is edited.
  const [failedHeroUrl, setFailedHeroUrl] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  useEffect(() => {
    fetchAdminHouses({ onLoading: setLoading, onHouses: setHouses, onFlash: setFlash });
    fetchHouseReference(setReference);
  }, []);

  const filteredHouses = useMemo(
    () =>
      houses.filter((h) => {
        if (statusFilter !== 'all' && h.status !== statusFilter) return false;
        const q = filterQuery.toLowerCase();
        if (!q) return true;
        const name = `${h.name || ''}`.toLowerCase();
        const loc = `${h.location?.name || h.address || ''} ${h.location?.country || ''}`.toLowerCase();
        const type = `${h.house_type || ''}`.toLowerCase();
        const status = `${h.status || ''}`.toLowerCase();
        return name.includes(q) || loc.includes(q) || type.includes(q) || status.includes(q);
      }),
    [houses, filterQuery, statusFilter]
  );

  const openCreate = () => {
    setFormError('');
    setFailedHeroUrl('');
    setEditor({ isOpen: true, isNew: true, id: null, form: { ...EMPTY_FORM, location_id: locations[0] ? String(locations[0].id) : '' } });
  };

  const openEdit = (house: House) => {
    setFormError('');
    setFailedHeroUrl('');
    setEditor({ isOpen: true, isNew: false, id: house.id, form: houseToForm(house) });
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setEditor((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));

  const availableEstates = useMemo(() => {
    if (!editor.form.location_id) return estates;
    return estates.filter((estate) => String(estate.location_id) === editor.form.location_id);
  }, [estates, editor.form.location_id]);

  const amenitiesByCategory = useMemo(() => {
    return amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
      const key = a.category || 'general';
      (acc[key] ||= []).push(a);
      return acc;
    }, {});
  }, [amenities]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!editor.form.name.trim()) {
      setFormError('A sanctuary name is required.');
      return;
    }
    if (!editor.form.location_id) {
      setFormError('Please select a location for this sanctuary.');
      return;
    }
    if (!editor.form.address.trim()) {
      setFormError('A physical address is required.');
      return;
    }
    if (!editor.form.description.trim()) {
      setFormError('An architectural description is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(editor.form);
      if (editor.isNew) {
        await api.createHouse(payload);
        setFlash({ type: 'success', text: `Sanctuary "${payload.name}" was added to the portfolio.` });
      } else {
        await api.updateHouse(editor.id as number, payload);
        setFlash({ type: 'success', text: `Sanctuary "${payload.name}" was updated.` });
      }
      setEditor((prev) => ({ ...prev, isOpen: false }));
      await fetchAdminHouses({ onLoading: setLoading, onHouses: setHouses, onFlash: setFlash });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'The sanctuary could not be saved.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (house: House) => {
    setConfirmModal({
      isOpen: true,
      title: 'Retire Sanctuary',
      message: `This will permanently remove "${house.name}" and detach its configured suites, amenities and media from the portfolio. This action cannot be undone.`,
      confirmLabel: 'Delete Sanctuary',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.deleteHouse(house.id);
          setFlash({ type: 'success', text: `Sanctuary "${house.name}" was deleted.` });
          await fetchAdminHouses({ onLoading: setLoading, onHouses: setHouses, onFlash: setFlash });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'The sanctuary could not be deleted.';
          setFlash({ type: 'error', text: message });
        }
      },
    });
  };

  const toggleAmenity = (id: number) => {
    setEditor((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        amenities: prev.form.amenities.includes(id)
          ? prev.form.amenities.filter((a) => a !== id)
          : [...prev.form.amenities, id],
      },
    }));
  };

  const suitesCount = (house: House) => house.rooms_count || (house.rooms ? house.rooms.length : 0);

  return (
    <SecureGateLayout
      title="Sanctuaries & Houses Portfolio"
      subtitle="Executive ledger of physical sanctuaries, private estates, and architectural suites across global capitals."
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Sanctuary</span>
          </button>
          <Link
            href="/securegate/cms"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition flex items-center gap-2"
          >
            <span>Manage Editorial Lore in CMS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Flash notice */}
        {flash && (
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border text-xs animate-fade-in ${
              flash.type === 'success'
                ? 'bg-emerald-500/[0.07] border-emerald-500/20 text-emerald-200'
                : 'bg-rose-500/[0.07] border-rose-500/20 text-rose-200'
            }`}
          >
            {flash.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <p className="font-light leading-relaxed grow">{flash.text}</p>
            <button
              type="button"
              onClick={() => setFlash(null)}
              className="text-white/40 hover:text-white transition cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative grow max-w-md">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by sanctuary name, country or type..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C5A880]"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10">
            {['all', ...statuses].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#C5A880] text-black font-semibold'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>
        </div>

        {/* Executive Houses Table */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Synchronizing global sanctuary inventory from SecureGate vault...
            </div>
          ) : filteredHouses.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <p className="text-white/50 text-xs font-light">
                {houses.length === 0
                  ? 'No sanctuaries have been recorded yet. Add the first property to the portfolio.'
                  : 'No sanctuary properties matched your filter criteria.'}
              </p>
              {houses.length === 0 && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                >
                  Add First Sanctuary
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Sanctuary</th>
                    <th className="p-4">House Name & Key</th>
                    <th className="p-4">Terroir & Location</th>
                    <th className="p-4">Sanctuary Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Suites Configured</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {filteredHouses.map((house) => (
                    <tr key={house.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 pl-6">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 bg-stone-900 shrink-0">
                          {house.hero_image ? (
                            <img src={house.hero_image} alt={house.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                              <Building2 className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-serif-luxury text-sm text-white font-medium">
                        <span className="flex items-center gap-1.5">
                          {house.name}
                          {house.is_featured && <Star className="w-3 h-3 text-[#C5A880] fill-[#C5A880]" />}
                        </span>
                        {house.tagline && <span className="block text-[10px] text-white/40 font-sans mt-0.5">{house.tagline}</span>}
                        <span className="block text-[10px] text-[#C5A880] font-mono mt-0.5">/{house.slug}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                          <span>
                            {house.location?.name || house.address || 'Global'}, {house.location?.country || ''}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-[#C5A880] border border-white/10">
                          {TYPE_LABELS[house.house_type] || house.house_type || 'House'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                            STATUS_STYLES[house.status] || STATUS_STYLES.archived
                          }`}
                        >
                          {STATUS_LABELS[house.status] || house.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-white/70">{suitesCount(house)} Suites</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectHouse(house)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer"
                            title="Inspect Sanctuary"
                          >
                            <Eye className="w-3 h-3 text-[#C5A880]" />
                            <span>Inspect</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(house)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#C5A880]/10 hover:bg-[#C5A880]/20 text-[#C5A880] text-xs transition cursor-pointer"
                            title="Edit Sanctuary"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <Link
                            href={`/houses/${house.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                            title="Open Public Sanctuary Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(house)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                            title="Delete Sanctuary"
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
          )}
        </div>
      </div>

      {/* Sanctuary Editor Modal */}
      {editor.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">
                  {editor.isNew ? 'Register New Sanctuary' : `Edit ${editor.form.name || 'Sanctuary'}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditor((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition cursor-pointer"
                aria-label="Close editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col min-h-0">
              <div className="p-6 space-y-5 overflow-y-auto grow">
                {formError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-light leading-relaxed">{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="house-name">
                      Sanctuary Name *
                    </label>
                    <input
                      id="house-name"
                      className={inputClass}
                      value={editor.form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setEditor((prev) => ({
                          ...prev,
                          form: {
                            ...prev.form,
                            name,
                            slug: prev.isNew && !prev.form.slug ? toSlug(name) : prev.form.slug,
                          },
                        }));
                      }}
                      placeholder="e.g. Mayfair Manor"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="house-slug">
                      Public Key (slug)
                    </label>
                    <input
                      id="house-slug"
                      className={`${inputClass} font-mono`}
                      value={editor.form.slug}
                      onChange={(e) => setField('slug', e.target.value)}
                      placeholder="auto-generated from name"
                    />
                    <p className="mt-1.5 text-[10px] font-mono text-white/30">Public route: /houses/{editor.form.slug || toSlug(editor.form.name) || '…'}</p>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="house-tagline">
                    Tagline
                  </label>
                  <input
                    id="house-tagline"
                    className={inputClass}
                    value={editor.form.tagline}
                    onChange={(e) => setField('tagline', e.target.value)}
                    placeholder="A short editorial hook shown beneath the name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="house-location">
                      Location *
                    </label>
                    <select
                      id="house-location"
                      className={inputClass}
                      value={editor.form.location_id}
                      onChange={(e) => {
                        const locationId = e.target.value;
                        setEditor((prev) => {
                          // Check against the newly chosen location, not the
                          // previous one that `availableEstates` was built from.
                          const stillValid = prev.form.estate_id
                            ? estates.some(
                                (estate) =>
                                  String(estate.id) === prev.form.estate_id &&
                                  (!locationId || String(estate.location_id) === locationId)
                              )
                            : false;
                          return {
                            ...prev,
                            form: {
                              ...prev.form,
                              location_id: locationId,
                              estate_id: stillValid ? prev.form.estate_id : '',
                            },
                          };
                        });
                      }}
                    >
                      <option value="">Select a territory...</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                          {loc.country ? ` — ${loc.country}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="house-estate">
                      Parent Estate
                    </label>
                    <select
                      id="house-estate"
                      className={inputClass}
                      value={editor.form.estate_id}
                      onChange={(e) => setField('estate_id', e.target.value)}
                    >
                      <option value="">Standalone property</option>
                      {availableEstates.map((estate) => (
                        <option key={estate.id} value={estate.id}>
                          {estate.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="house-type">
                      Sanctuary Type *
                    </label>
                    <select
                      id="house-type"
                      className={inputClass}
                      value={editor.form.house_type}
                      onChange={(e) => setField('house_type', e.target.value)}
                    >
                      {houseTypes.map((type) => (
                        <option key={type} value={type}>
                          {TYPE_LABELS[type] || type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="house-status">
                      Status *
                    </label>
                    <select
                      id="house-status"
                      className={inputClass}
                      value={editor.form.status}
                      onChange={(e) => setField('status', e.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status] || status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="house-order">
                      Sort Order
                    </label>
                    <input
                      id="house-order"
                      type="number"
                      className={inputClass}
                      value={editor.form.sort_order}
                      onChange={(e) => setField('sort_order', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="house-address">
                    Physical Address *
                  </label>
                  <textarea
                    id="house-address"
                    rows={2}
                    className={inputClass}
                    value={editor.form.address}
                    onChange={(e) => setField('address', e.target.value)}
                    placeholder="Street, district, city"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-2">
                    <label className={labelClass} htmlFor="house-lat">
                      Latitude
                    </label>
                    <input
                      id="house-lat"
                      type="number"
                      step="any"
                      className={inputClass}
                      value={editor.form.latitude}
                      onChange={(e) => setField('latitude', e.target.value)}
                      placeholder="51.5072"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <label className={labelClass} htmlFor="house-lng">
                      Longitude
                    </label>
                    <input
                      id="house-lng"
                      type="number"
                      step="any"
                      className={inputClass}
                      value={editor.form.longitude}
                      onChange={(e) => setField('longitude', e.target.value)}
                      placeholder="-0.1276"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="house-short">
                    Short Description <span className="normal-case text-white/25">(max 500 characters)</span>
                  </label>
                  <textarea
                    id="house-short"
                    rows={2}
                    maxLength={500}
                    className={inputClass}
                    value={editor.form.short_description}
                    onChange={(e) => setField('short_description', e.target.value)}
                    placeholder="A concise summary used on listing cards"
                  />
                  <p className="mt-1.5 text-[10px] font-mono text-white/30 text-right">
                    {editor.form.short_description.length}/500
                  </p>
                </div>

                <div>
                  <label className={labelClass} htmlFor="house-description">
                    Architectural Description *
                  </label>
                  <textarea
                    id="house-description"
                    rows={6}
                    className={inputClass}
                    value={editor.form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Describe the estate, its provenance and the experience it offers"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="house-hero">
                      Hero Image URL
                    </label>
                    <input
                      id="house-hero"
                      className={inputClass}
                      value={editor.form.hero_image}
                      onChange={(e) => setField('hero_image', e.target.value)}
                      placeholder="https://…"
                    />
                    {editor.form.hero_image && failedHeroUrl !== editor.form.hero_image && (
                      <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-white/10 bg-stone-900">
                        <img
                          src={editor.form.hero_image}
                          alt="Hero preview"
                          className="w-full h-full object-cover"
                          onError={() => setFailedHeroUrl(editor.form.hero_image)}
                        />
                      </div>
                    )}
                    {editor.form.hero_image && failedHeroUrl === editor.form.hero_image && (
                      <p className="mt-2 text-[10px] font-mono text-rose-300/80">
                        Could not load this image URL — it will be saved as entered.
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass} htmlFor="house-video">
                        Hero Video URL
                      </label>
                      <input
                        id="house-video"
                        className={inputClass}
                        value={editor.form.hero_video}
                        onChange={(e) => setField('hero_video', e.target.value)}
                        placeholder="https://…"
                      />
                    </div>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer transition hover:border-[#C5A880]/40">
                      <input
                        type="checkbox"
                        checked={editor.form.is_featured}
                        onChange={(e) => setField('is_featured', e.target.checked)}
                        className="w-4 h-4 accent-[#C5A880] cursor-pointer"
                      />
                      <span className="text-xs text-white/80">Feature on the public portfolio</span>
                      <Star className="w-3.5 h-3.5 text-[#C5A880] ml-auto" />
                    </label>
                  </div>
                </div>

                {amenities.length > 0 && (
                  <div className="space-y-3">
                    <span className={labelClass}>Configured Amenities</span>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {Object.entries(amenitiesByCategory).map(([category, items]) => (
                        <div key={category} className="space-y-2">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#C5A880]/70">{category}</p>
                          <div className="flex flex-wrap gap-2">
                            {items.map((amenity) => {
                              const active = editor.form.amenities.includes(amenity.id);
                              return (
                                <button
                                  key={amenity.id}
                                  type="button"
                                  onClick={() => toggleAmenity(amenity.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition cursor-pointer ${
                                    active
                                      ? 'bg-[#C5A880]/15 border-[#C5A880]/40 text-[#C5A880]'
                                      : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white hover:bg-white/[0.06]'
                                  }`}
                                >
                                  {amenity.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-white/10 flex items-center justify-between shrink-0 bg-[#121212]">
                <span className="text-[11px] font-mono text-white/30">
                  {editor.isNew ? 'New record — audit trail will log house.created' : `Editing record #${editor.id}`}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditor((prev) => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{saving ? 'Saving' : editor.isNew ? 'Register Sanctuary' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect House Modal */}
      {inspectHouse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">{inspectHouse.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectHouse(null)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition cursor-pointer"
                aria-label="Close inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {inspectHouse.hero_image && (
                <div className="h-52 w-full rounded-xl overflow-hidden border border-white/10 relative">
                  <img src={inspectHouse.hero_image} alt={inspectHouse.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                    {TYPE_LABELS[inspectHouse.house_type] || inspectHouse.house_type || 'House'}
                  </div>
                </div>
              )}

              {inspectHouse.tagline && (
                <p className="font-serif-luxury text-base text-[#C5A880] italic">{inspectHouse.tagline}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Location & Address</span>
                  <p className="text-xs text-white font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                    {inspectHouse.location?.name || inspectHouse.address}, {inspectHouse.location?.country}
                  </p>
                  {inspectHouse.address && (
                    <p className="text-[11px] text-white/50 font-light">{inspectHouse.address}</p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Accommodation Suites</span>
                  <p className="text-xs text-white font-medium">{suitesCount(inspectHouse)} Suites Configured</p>
                  <p className="text-[11px] text-white/50 font-light">
                    {STATUS_LABELS[inspectHouse.status] || inspectHouse.status}
                    {inspectHouse.is_featured ? ' · Featured' : ''}
                    {inspectHouse.estate ? ` · ${inspectHouse.estate.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 uppercase">Architectural Description</span>
                <p className="text-xs text-white/70 leading-relaxed font-light whitespace-pre-line">
                  {inspectHouse.description || inspectHouse.short_description || 'No detailed lore recorded.'}
                </p>
              </div>

              {inspectHouse.amenities && inspectHouse.amenities.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Configured Amenities</span>
                  <div className="flex flex-wrap gap-2">
                    {inspectHouse.amenities.map((amenity) => (
                      <span
                        key={amenity.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/5 border border-white/10 text-[#C5A880]"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {amenity.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] font-mono text-[#C5A880]">Public Route: /houses/{inspectHouse.slug}</span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInspectHouse(null)}
                    className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const target = inspectHouse;
                      setInspectHouse(null);
                      if (target) openEdit(target);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <Link
                    href={`/houses/${inspectHouse.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition"
                  >
                    <span>View Live House</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
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
                aria-label="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{confirmModal.message}</p>
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
