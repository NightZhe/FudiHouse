import { useState, type FormEvent, type ReactNode } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import type { BuildingType, Listing, ListingDraft, ParkingType } from '../../types';
import { computeUnitPrice } from '../../utils/format';
import { CITIES, CITY_DISTRICTS } from '../../data/regions';

const BUILDING_TYPES: BuildingType[] = ['電梯大樓', '華廈', '公寓', '透天厝', '套房', '店面'];
const PARKING_TYPES: ParkingType[] = ['無', '坡道平面', '機械', '其他'];

interface ListingFormProps {
  initialListing: Listing | null;
  onDone: () => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  communityName: string;
  city: string;
  district: string;
  address: string;
  totalPrice: string;
  registeredArea: string;
  mainArea: string;
  rooms: string;
  livingRooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  age: string;
  buildingType: BuildingType;
  parking: ParkingType;
  managementFee: string;
  facing: string;
  tags: string[];
  description: string;
  photos: string[];
  contactName: string;
  contactPhone: string;
  contactLineId: string;
  featured: boolean;
}

function toFormState(listing: Listing | null): FormState {
  if (!listing) {
    return {
      title: '',
      communityName: '',
      city: '',
      district: '',
      address: '',
      totalPrice: '',
      registeredArea: '',
      mainArea: '',
      rooms: '',
      livingRooms: '',
      bathrooms: '',
      floor: '',
      totalFloors: '',
      age: '',
      buildingType: '電梯大樓',
      parking: '無',
      managementFee: '',
      facing: '',
      tags: [],
      description: '',
      photos: [],
      contactName: '',
      contactPhone: '',
      contactLineId: '',
      featured: false,
    };
  }
  return {
    title: listing.title,
    communityName: listing.communityName ?? '',
    city: listing.city,
    district: listing.district,
    address: listing.address,
    totalPrice: String(listing.totalPrice),
    registeredArea: String(listing.registeredArea),
    mainArea: String(listing.mainArea),
    rooms: String(listing.layout.rooms),
    livingRooms: String(listing.layout.livingRooms),
    bathrooms: String(listing.layout.bathrooms),
    floor: String(listing.floor),
    totalFloors: String(listing.totalFloors),
    age: String(listing.age),
    buildingType: listing.buildingType,
    parking: listing.parking,
    managementFee: listing.managementFee ? String(listing.managementFee) : '',
    facing: listing.facing ?? '',
    tags: listing.tags,
    description: listing.description,
    photos: listing.photos,
    contactName: listing.contact.name,
    contactPhone: listing.contact.phone,
    contactLineId: listing.contact.lineId ?? '',
    featured: listing.featured,
  };
}

const inputClass =
  'min-h-[44px] w-full rounded-lg border border-border bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500';
const labelClass = 'mb-1.5 block text-xs font-semibold text-ink-700';

export function ListingForm({ initialListing, onDone, onCancel }: ListingFormProps) {
  const { addListing, updateListing } = useListings();
  const [form, setForm] = useState<FormState>(() => toFormState(initialListing));
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [tagInput, setTagInput] = useState('');
  const [photoInput, setPhotoInput] = useState('');

  const isEditing = initialListing !== null;
  const districts = form.city ? CITY_DISTRICTS[form.city] ?? [] : [];

  const totalPriceNum = Number(form.totalPrice) || 0;
  const registeredAreaNum = Number(form.registeredArea) || 0;
  const unitPricePreview =
    totalPriceNum > 0 && registeredAreaNum > 0 ? computeUnitPrice(totalPriceNum, registeredAreaNum) : null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || form.tags.includes(value)) return;
    update('tags', [...form.tags, value]);
    setTagInput('');
  };

  const addPhoto = () => {
    const value = photoInput.trim();
    if (!value) return;
    update('photos', [...form.photos, value]);
    setPhotoInput('');
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<string, string>> = {};
    if (!form.title.trim()) nextErrors.title = '請輸入標題';
    if (!form.city) nextErrors.city = '請選擇縣市';
    if (!form.district.trim()) nextErrors.district = '請選擇或輸入行政區';
    if (!(Number(form.totalPrice) > 0)) nextErrors.totalPrice = '請輸入總價';
    if (!(Number(form.registeredArea) > 0)) nextErrors.registeredArea = '請輸入權狀坪數';
    if (!nextErrors.district) {
      const validDistricts = form.city ? CITY_DISTRICTS[form.city] : undefined;
      if (validDistricts && !validDistricts.includes(form.district.trim())) {
        nextErrors.district = '行政區與所選縣市不符，請重新選擇';
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const draft: ListingDraft = {
      title: form.title.trim(),
      communityName: form.communityName.trim() || undefined,
      city: form.city,
      district: form.district.trim(),
      address: form.address.trim(),
      totalPrice: Number(form.totalPrice),
      registeredArea: Number(form.registeredArea),
      mainArea: Number(form.mainArea) || 0,
      layout: {
        rooms: Number(form.rooms) || 0,
        livingRooms: Number(form.livingRooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
      },
      floor: Number(form.floor) || 0,
      totalFloors: Number(form.totalFloors) || 0,
      age: Number(form.age) || 0,
      buildingType: form.buildingType,
      parking: form.parking,
      managementFee: form.managementFee ? Number(form.managementFee) : undefined,
      facing: form.facing.trim() || undefined,
      tags: form.tags,
      description: form.description.trim(),
      photos: form.photos,
      contact: {
        name: form.contactName.trim(),
        phone: form.contactPhone.trim(),
        lineId: form.contactLineId.trim() || undefined,
      },
      status: initialListing?.status ?? '上架',
      featured: form.featured,
    };

    if (isEditing && initialListing) {
      updateListing(initialListing.id, draft);
    } else {
      addListing(draft);
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="pb-24">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-white px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          aria-label="取消"
          className="flex h-11 w-11 items-center justify-center text-ink-700"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-base font-bold text-ink-900">{isEditing ? '編輯物件' : '新增物件'}</h1>
      </header>

      <div className="space-y-6 px-5 py-5">
        <Section title="基本資料">
          <Field label="標題" error={errors.title} required>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} className={inputClass} />
          </Field>
          <Field label="社區名稱">
            <input value={form.communityName} onChange={(e) => update('communityName', e.target.value)} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="縣市" error={errors.city} required>
              <select
                value={form.city}
                onChange={(e) => {
                  const nextCity = e.target.value;
                  setForm((prev) => ({ ...prev, city: nextCity, district: '' }));
                }}
                className={inputClass}
              >
                <option value="">請選擇</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="行政區" error={errors.district} required>
              {districts.length > 0 ? (
                <select value={form.district} onChange={(e) => update('district', e.target.value)} className={inputClass}>
                  <option value="">請選擇</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.district}
                  onChange={(e) => update('district', e.target.value)}
                  placeholder="請先選擇縣市"
                  className={inputClass}
                />
              )}
            </Field>
          </div>
          <Field label="路段地址（只到路／段，不寫門牌）">
            <input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
          </Field>
        </Section>

        <Section title="價格與坪數">
          <div className="grid grid-cols-2 gap-3">
            <Field label="總價（萬元）" error={errors.totalPrice} required>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={form.totalPrice}
                onChange={(e) => update('totalPrice', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="權狀坪數" error={errors.registeredArea} required>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={form.registeredArea}
                onChange={(e) => update('registeredArea', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="主建物坪數">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={form.mainArea}
                onChange={(e) => update('mainArea', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="單價（萬/坪，自動計算）">
              <div className="flex min-h-[44px] items-center rounded-lg bg-surface-alt px-3 text-sm font-semibold text-ink-700">
                {unitPricePreview !== null ? `${unitPricePreview.toFixed(1)} 萬/坪` : '請先輸入總價與坪數'}
              </div>
            </Field>
          </div>
        </Section>

        <Section title="格局與樓層">
          <div className="grid grid-cols-3 gap-3">
            <Field label="房">
              <input type="number" inputMode="numeric" min={0} value={form.rooms} onChange={(e) => update('rooms', e.target.value)} className={inputClass} />
            </Field>
            <Field label="廳">
              <input type="number" inputMode="numeric" min={0} value={form.livingRooms} onChange={(e) => update('livingRooms', e.target.value)} className={inputClass} />
            </Field>
            <Field label="衛">
              <input type="number" inputMode="numeric" min={0} value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="所在樓層">
              <input type="number" inputMode="numeric" min={0} value={form.floor} onChange={(e) => update('floor', e.target.value)} className={inputClass} />
            </Field>
            <Field label="總樓層">
              <input type="number" inputMode="numeric" min={0} value={form.totalFloors} onChange={(e) => update('totalFloors', e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="屋齡（年）">
            <input type="number" inputMode="numeric" min={0} value={form.age} onChange={(e) => update('age', e.target.value)} className={inputClass} />
          </Field>
        </Section>

        <Section title="其他條件">
          <div className="grid grid-cols-2 gap-3">
            <Field label="型態">
              <select value={form.buildingType} onChange={(e) => update('buildingType', e.target.value as BuildingType)} className={inputClass}>
                {BUILDING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="車位">
              <select value={form.parking} onChange={(e) => update('parking', e.target.value as ParkingType)} className={inputClass}>
                {PARKING_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="管理費（元/月，可空）">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={form.managementFee}
                onChange={(e) => update('managementFee', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="朝向（可空）">
              <input value={form.facing} onChange={(e) => update('facing', e.target.value)} className={inputClass} />
            </Field>
          </div>
          <label className="flex min-h-[44px] items-center gap-2 text-sm font-medium text-ink-700">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update('featured', e.target.checked)}
              className="h-5 w-5 rounded border-border accent-brand-700"
            />
            設為精選物件（顯示於首頁精選區塊）
          </label>
        </Section>

        <Section title="特色標籤">
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="例如：近捷運"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addTag}
              aria-label="新增標籤"
              className="flex min-h-[44px] w-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white"
            >
              <Plus size={18} />
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-accent-100 py-1 pl-3 pr-2 text-xs font-semibold text-accent-700">
                  {tag}
                  <button
                    type="button"
                    onClick={() => update('tags', form.tags.filter((t) => t !== tag))}
                    aria-label={`移除標籤 ${tag}`}
                    className="flex h-5 w-5 items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="描述">
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500"
          />
        </Section>

        <Section title="照片網址">
          <div className="flex gap-2">
            <input
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPhoto();
                }
              }}
              placeholder="貼上圖片網址"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addPhoto}
              aria-label="新增照片"
              className="flex min-h-[44px] w-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-white"
            >
              <Plus size={18} />
            </button>
          </div>
          {form.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {form.photos.map((url, i) => (
                <div key={url + i} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update('photos', form.photos.filter((_, idx) => idx !== i))}
                    aria-label="移除照片"
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="聯絡人">
          <Field label="姓名">
            <input value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className={inputClass} />
          </Field>
          <Field label="電話">
            <input value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className={inputClass} />
          </Field>
          <Field label="LINE ID（可空）">
            <input value={form.contactLineId} onChange={(e) => update('contactLineId', e.target.value)} className={inputClass} />
          </Field>
        </Section>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl gap-3 border-t border-border bg-white px-5 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <button type="button" onClick={onCancel} className="min-h-[44px] flex-1 rounded-xl border border-border text-sm font-semibold text-ink-700">
          取消
        </button>
        <button type="submit" className="min-h-[44px] flex-1 rounded-xl bg-brand-700 text-sm font-bold text-white">
          {isEditing ? '儲存變更' : '新增物件'}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-danger-600">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-danger-600">{error}</p>}
    </div>
  );
}
