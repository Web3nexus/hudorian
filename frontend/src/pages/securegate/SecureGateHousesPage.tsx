
import React, { useEffect, useMemo, useState } from 'react';
import Link from '@/components/common/Link';
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

/** Typing a name on a brand new house fills the web address for you. */
function applyName(form: FormState, name: string, isNew: boolean): FormState {
  return { ...form, name, slug: isNew && !form.slug ? toSlug(name) : form.slug };
}

/** Changing location can invalidate the chosen estate, so re-check it against the new location. */
function applyLocation(form: FormState, locationId: string, allEstates: Estate[]): FormState {
  const stillValid = form.estate_id
    ? allEstates.some(
        (estate) => String(estate.id) === form.estate_id && (!locationId || String(estate.location_id) === locationId)
      )
    : false;
  return { ...form, location_id: locationId, estate_id: stillValid ? form.estate_id : '' };
}

function toggleInList(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

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

type HouseFieldContext = {
  form: FormState;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  setNameAndSlug: (name: string) => void;
  setLocation: (locationId: string) => void;
  toggleAmenity: (id: number) => void;
  setFailedHeroUrl: (url: string) => void;
  amenitiesByCategory: Record<string, Amenity[]>;
  failedHeroUrl: string;
  locations: Location[];
  availableEstates: Estate[];
  houseTypes: string[];
  statuses: string[];
  idPrefix: string;
};

/**
 * The house fields, shared by the add/edit dialog and the inline editor on the
 * details view so both stay in sync.
 */
function HouseFields({ ctx }: { ctx: HouseFieldContext }) {
  const {
    form,
    setField,
    setNameAndSlug,
    setLocation,
    toggleAmenity,
    setFailedHeroUrl,
    amenitiesByCategory,
    failedHeroUrl,
    locations,
    availableEstates,
    houseTypes,
    statuses,
    idPrefix,
  } = ctx;
  const uid = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor={uid('name')}>
            House name *
          </label>
          <input
            id={uid('name')}
            className={inputClass}
            value={form.name}
            onChange={(e) => setNameAndSlug(e.target.value)}
            placeholder="e.g. Mayfair Manor"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={uid('slug')}>
            Web address
          </label>
          <input
            id={uid('slug')}
            className={`${inputClass} font-mono`}
            value={form.slug}
            onChange={(e) => setField('slug', e.target.value)}
            placeholder="made from the name"
          />
          <p className="mt-1.5 text-[10px] text-white/40">
            Page address: /houses/{form.slug || toSlug(form.name) || '…'}
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={uid('tagline')}>
          Short tagline
        </label>
        <input
          id={uid('tagline')}
          className={inputClass}
          value={form.tagline}
          onChange={(e) => setField('tagline', e.target.value)}
          placeholder="A short line shown under the name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor={uid('location')}>
            Location *
          </label>
          <select
            id={uid('location')}
            className={inputClass}
            value={form.location_id}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Select a location…</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
                {loc.country ? ` — ${loc.country}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor={uid('estate')}>
            Estate
          </label>
          <select
            id={uid('estate')}
            className={inputClass}
            value={form.estate_id}
            onChange={(e) => setField('estate_id', e.target.value)}
          >
            <option value="">Not part of an estate</option>
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
          <label className={labelClass} htmlFor={uid('type')}>
            Property type *
          </label>
          <select
            id={uid('type')}
            className={inputClass}
            value={form.house_type}
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
          <label className={labelClass} htmlFor={uid('status')}>
            Status *
          </label>
          <select
            id={uid('status')}
            className={inputClass}
            value={form.status}
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
          <label className={labelClass} htmlFor={uid('order')}>
            Display order
          </label>
          <input
            id={uid('order')}
            type="number"
            className={inputClass}
            value={form.sort_order}
            onChange={(e) => setField('sort_order', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={uid('address')}>
          Address *
        </label>
        <textarea
          id={uid('address')}
          rows={2}
          className={inputClass}
          value={form.address}
          onChange={(e) => setField('address', e.target.value)}
          placeholder="Street, area, city"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor={uid('lat')}>
            Latitude
          </label>
          <input
            id={uid('lat')}
            type="number"
            step="any"
            className={inputClass}
            value={form.latitude}
            onChange={(e) => setField('latitude', e.target.value)}
            placeholder="51.5072"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={uid('lng')}>
            Longitude
          </label>
          <input
            id={uid('lng')}
            type="number"
            step="any"
            className={inputClass}
            value={form.longitude}
            onChange={(e) => setField('longitude', e.target.value)}
            placeholder="-0.1276"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={uid('short')}>
          Short description <span className="normal-case text-white/40">(up to 500 characters)</span>
        </label>
        <textarea
          id={uid('short')}
          rows={2}
          maxLength={500}
          className={inputClass}
          value={form.short_description}
          onChange={(e) => setField('short_description', e.target.value)}
          placeholder="A short summary used on listing cards"
        />
        <p className="mt-1.5 text-[10px] text-white/40 text-right">{form.short_description.length}/500</p>
      </div>

      <div>
        <label className={labelClass} htmlFor={uid('description')}>
          Description *
        </label>
        <textarea
          id={uid('description')}
          rows={6}
          className={inputClass}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Describe the house, its history and what it offers"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor={uid('hero')}>
            Main image URL
          </label>
          <input
            id={uid('hero')}
            className={inputClass}
            value={form.hero_image}
            onChange={(e) => setField('hero_image', e.target.value)}
            placeholder="https://…"
          />
          {form.hero_image && failedHeroUrl !== form.hero_image && (
            <div className="mt-2 h-28 w-full rounded-xl overflow-hidden border border-white/10 bg-stone-900">
              <img
                src={form.hero_image}
                alt="Main image preview"
                className="w-full h-full object-cover"
                onError={() => setFailedHeroUrl(form.hero_image)}
              />
            </div>
          )}
          {form.hero_image && failedHeroUrl === form.hero_image && (
            <p className="mt-2 text-[10px] text-rose-300/80">
              This image could not be loaded. It will still be saved as you typed it.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor={uid('video')}>
              Video URL
            </label>
            <input
              id={uid('video')}
              className={inputClass}
              value={form.hero_video}
              onChange={(e) => setField('hero_video', e.target.value)}
              placeholder="https://…"
            />
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer transition hover:border-[#C5A880]/40">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setField('is_featured', e.target.checked)}
              className="w-4 h-4 accent-[#C5A880] cursor-pointer"
            />
            <span className="text-xs text-white/80">Show on the home page</span>
            <Star className="w-3.5 h-3.5 text-[#C5A880] ml-auto" />
          </label>
        </div>
      </div>

      {Object.keys(amenitiesByCategory).length > 0 && (
        <div className="space-y-3">
          <span className={labelClass}>Amenities</span>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {Object.entries(amenitiesByCategory).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[#C5A880]/70">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((amenity) => {
                    const active = form.amenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] border transition cursor-pointer ${
                          active
                            ? 'bg-[#C5A880]/15 border-[#C5A880]/40 text-[#C5A880]'
                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]'
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
    </>
  );
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
    handlers.onFlash({ type: 'error', text: 'Could not load your houses. Check your connection and try again.' });
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
  const [detailEditing, setDetailEditing] = useState(false);
  const [detailForm, setDetailForm] = useState<FormState>(EMPTY_FORM);
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

  // Opening the details view always starts in read mode; editing is a deliberate action.
  const openDetails = (house: House) => {
    setFormError('');
    setFailedHeroUrl('');
    setDetailForm(houseToForm(house));
    setDetailEditing(false);
    setInspectHouse(house);
  };

  const closeDetails = () => {
    setInspectHouse(null);
    setDetailEditing(false);
    setFormError('');
  };

  const cancelDetailEdit = () => {
    // Discard unsaved changes and fall back to the last saved values.
    if (inspectHouse) setDetailForm(houseToForm(inspectHouse));
    setDetailEditing(false);
    setFormError('');
    setFailedHeroUrl('');
  };

  const saveDetail = async () => {
    if (!inspectHouse) return;
    setFormError('');

    if (!detailForm.name.trim()) {
      setFormError('A house name is required.');
      return;
    }
    if (!detailForm.location_id) {
      setFormError('Please choose a location.');
      return;
    }
    if (!detailForm.address.trim()) {
      setFormError('An address is required.');
      return;
    }
    if (!detailForm.description.trim()) {
      setFormError('A description is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(detailForm);
      await api.updateHouse(inspectHouse.id, payload);
      setFlash({ type: 'success', text: `"${payload.name}" was saved.` });
      await fetchAdminHouses({ onLoading: setLoading, onHouses: setHouses, onFlash: setFlash });
      // Re-read from the server so the details view shows what was actually stored.
      const refreshedList = await api.getAdminHouses();
      const refreshed = (refreshedList.data || []).find((h: House) => h.id === inspectHouse.id);
      setHouses(refreshedList.data || []);
      if (refreshed) {
        setInspectHouse(refreshed);
        setDetailForm(houseToForm(refreshed));
      }
      setDetailEditing(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'This house could not be saved.');
    } finally {
      setSaving(false);
    }
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
      setFormError('Enter a house name.');
      return;
    }
    if (!editor.form.location_id) {
      setFormError('Choose a location.');
      return;
    }
    if (!editor.form.address.trim()) {
      setFormError('Enter the address.');
      return;
    }
    if (!editor.form.description.trim()) {
      setFormError('Enter a description.');
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(editor.form);
      if (editor.isNew) {
        await api.createHouse(payload);
        setFlash({ type: 'success', text: `"${payload.name}" was added.` });
      } else {
        await api.updateHouse(editor.id as number, payload);
        setFlash({ type: 'success', text: `"${payload.name}" was saved.` });
      }
      setEditor((prev) => ({ ...prev, isOpen: false }));
      await fetchAdminHouses({ onLoading: setLoading, onHouses: setHouses, onFlash: setFlash });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'This house could not be saved.';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (house: House) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete house',
      message: `This will permanently delete "${house.name}", including its rooms, amenities and images. This cannot be undone.`,
      confirmLabel: 'Delete house',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await api.deleteHouse(house.id);
          setFlash({ type: 'success', text: `"${house.name}" was deleted.` });
          await fetchAdminHouses({ onLoading: setLoading, onHouses: setHouses, onFlash: setFlash });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'This house could not be deleted.';
          setFlash({ type: 'error', text: message });
        }
      },
    });
  };

  const toggleAmenity = (id: number) => {
    setEditor((prev) => ({
      ...prev,
      form: { ...prev.form, amenities: toggleInList(prev.form.amenities, id) },
    }));
  };

  const roomsCount = (house: House) => house.rooms_count || (house.rooms ? house.rooms.length : 0);

  const baseFieldContext = {
    setFailedHeroUrl,
    amenitiesByCategory,
    failedHeroUrl,
    locations,
    houseTypes,
    statuses,
  };

  const editorFields: HouseFieldContext = {
    ...baseFieldContext,
    form: editor.form,
    availableEstates,
    idPrefix: 'house',
    setField,
    setNameAndSlug: (name: string) => setEditor((prev) => ({ ...prev, form: applyName(prev.form, name, prev.isNew) })),
    setLocation: (locationId: string) =>
      setEditor((prev) => ({ ...prev, form: applyLocation(prev.form, locationId, estates) })),
    toggleAmenity,
  };

  const detailAvailableEstates = useMemo(() => {
    if (!detailForm.location_id) return estates;
    return estates.filter((estate) => String(estate.location_id) === detailForm.location_id);
  }, [estates, detailForm.location_id]);

  const detailFields: HouseFieldContext = {
    ...baseFieldContext,
    form: detailForm,
    availableEstates: detailAvailableEstates,
    idPrefix: 'detail',
    setField: (key, value) => setDetailForm((prev) => ({ ...prev, [key]: value })),
    setNameAndSlug: (name: string) => setDetailForm((prev) => applyName(prev, name, false)),
    setLocation: (locationId: string) => setDetailForm((prev) => applyLocation(prev, locationId, estates)),
    toggleAmenity: (id: number) => setDetailForm((prev) => ({ ...prev, amenities: toggleInList(prev.amenities, id) })),
  };

  return (
    <SecureGateLayout
      title="Houses"
      subtitle="Add and update the houses, rooms and details shown on your website."
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add house</span>
          </button>
          <Link
            href="/securegate/cms"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition flex items-center gap-2"
          >
            <span>Edit page content</span>
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
              placeholder="Search by name, country or type"
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

        {/* House list */}
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 text-center text-xs text-white/40 font-mono">
              Loading houses…
            </div>
          ) : filteredHouses.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <p className="text-white/50 text-xs font-light">
                {houses.length === 0
                  ? 'No houses yet. Add your first one to get started.'
                  : 'No houses match your search.'}
              </p>
              {houses.length === 0 && (
                <button
                  type="button"
                  onClick={openCreate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition cursor-pointer"
                >
                  Add your first house
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 font-mono uppercase tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Image</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Rooms</th>
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
                      <td className="p-4 text-white/70">{roomsCount(house)} rooms</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openDetails(house)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs transition cursor-pointer"
                            title="View house details"
                          >
                            <Eye className="w-3 h-3 text-[#C5A880]" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(house)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#C5A880]/10 hover:bg-[#C5A880]/20 text-[#C5A880] text-xs transition cursor-pointer"
                            title="Edit house"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <Link
                            href={`/houses/${house.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
                            title="Open this house on the website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(house)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                            title="Delete house"
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

      {/* Add / edit house dialog */}
      {editor.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif-luxury text-lg text-white">
                  {editor.isNew ? 'Add a house' : `Edit ${editor.form.name || 'house'}`}
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

                <HouseFields ctx={editorFields} />
              </div>

              <div className="p-5 border-t border-white/10 flex items-center justify-between shrink-0 bg-[#121212]">
                <span className="text-[11px] font-mono text-white/30">
                  {editor.isNew ? 'New house' : 'Changes are saved when you click Save' }
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
                    <span>{saving ? 'Saving' : editor.isNew ? 'Add house' : 'Save changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* House details, viewable and editable in place */}
      {inspectHouse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
              className={`bg-[#121212] border border-white/10 rounded-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in ${
                detailEditing ? 'max-w-3xl' : 'max-w-2xl'
              }`}
            >
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

            <div className="p-6 space-y-5 overflow-y-auto grow">
              {formError && detailEditing && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>
              )}

              {detailEditing ? (
                <div className="space-y-5">
                  <p className="text-xs text-white/50">
                    Change anything you need, then choose <span className="text-white/80">Save changes</span> at the
                    bottom. Nothing is saved until you do.
                  </p>
                  <HouseFields ctx={detailFields} />
                </div>
              ) : (
                <>
                  {inspectHouse.hero_image && (
                    <div className="h-52 w-full rounded-xl overflow-hidden border border-white/10 relative">
                      <img
                        src={inspectHouse.hero_image}
                        alt={inspectHouse.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-white border border-white/10">
                        {TYPE_LABELS[inspectHouse.house_type] || inspectHouse.house_type || 'House'}
                      </div>
                    </div>
                  )}

                  {inspectHouse.tagline && <p className="text-base text-[#C5A880] italic">{inspectHouse.tagline}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[10px] text-white/50">Location and address</span>
                      <p className="text-xs text-white font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                        {inspectHouse.location?.name || inspectHouse.address}, {inspectHouse.location?.country}
                      </p>
                      {inspectHouse.address && (
                        <p className="text-[11px] text-white/60">{inspectHouse.address}</p>
                      )}
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[10px] text-white/50">Rooms</span>
                      <p className="text-xs text-white font-medium">{roomsCount(inspectHouse)} rooms</p>
                      <p className="text-[11px] text-white/60">
                        {STATUS_LABELS[inspectHouse.status] || inspectHouse.status}
                        {inspectHouse.is_featured ? ' · Shown on home page' : ''}
                        {inspectHouse.estate ? ` · Part of ${inspectHouse.estate.name}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-white/50">Description</span>
                    <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line">
                      {inspectHouse.description || inspectHouse.short_description || 'No description yet.'}
                    </p>
                  </div>

                  {inspectHouse.short_description && inspectHouse.description && (
                    <div className="space-y-1">
                      <span className="text-[10px] text-white/50">Short description</span>
                      <p className="text-xs text-white/70 leading-relaxed whitespace-pre-line">
                        {inspectHouse.short_description}
                      </p>
                    </div>
                  )}

                  {inspectHouse.amenities && inspectHouse.amenities.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-white/50">Amenities</span>
                      <div className="flex flex-wrap gap-2">
                        {inspectHouse.amenities.map((amenity) => (
                          <span
                            key={amenity.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] bg-white/5 border border-white/10 text-[#C5A880]"
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            {amenity.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap shrink-0">
              <span className="text-[11px] text-white/50">
                {detailEditing ? 'Unsaved changes' : `Website address: /houses/${inspectHouse.slug}`}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white transition cursor-pointer"
                  disabled={saving}
                >
                  Close
                </button>

                {detailEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelDetailEdit}
                      className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white transition cursor-pointer"
                      disabled={saving}
                    >
                      Cancel changes
                    </button>
                    <button
                      type="button"
                      onClick={saveDetail}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A3855E] text-black font-semibold text-xs hover:opacity-90 transition disabled:opacity-60 cursor-pointer"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{saving ? 'Saving' : 'Save changes'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDetailEditing(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C5A880]/15 hover:bg-[#C5A880]/25 text-[#C5A880] font-medium text-xs transition cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit details</span>
                    </button>
                    <Link
                      href={`/houses/${inspectHouse.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition cursor-pointer"
                    >
                      <span>View on website</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
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
                  <p className="text-xs text-white/50">This cannot be undone</p>
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
                {confirmModal.confirmLabel || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SecureGateLayout>
  );
}
