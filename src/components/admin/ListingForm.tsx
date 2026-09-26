import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, ChevronLeft, ChevronsLeft, ChevronsRight, ImagePlus, Loader2, Plus, RotateCcw, X } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import { deleteListingPhoto, uploadListingPhoto } from '../../services/photoStorage';
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
  contactName: string;
  contactPhone: string;
  contactLineId: string;
  featured: boolean;
  description: string;
}

/** 照片項目：上傳中／完成／失敗三態，`key` 是穩定識別碼（與最終網址無關，方便重試與排序）。 */
interface PhotoItem {
  key: string;
  /** 縮圖顯示用網址：上傳中是本機 object URL，完成後是 Supabase 公開網址。 */
  previewUrl: string;
  /** 上傳完成後的公開網址；只有這個欄位有值的項目才會被送出表單。 */
  url: string | null;
  status: 'uploading' | 'done' | 'error';
  error?: string;
  file?: File;
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
      contactName: '',
      contactPhone: '',
      contactLineId: '',
      featured: false,
      description: '',
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
    contactName: listing.contact.name,
    contactPhone: listing.contact.phone,
    contactLineId: listing.contact.lineId ?? '',
    featured: listing.featured,
    description: listing.description,
  };
}

function toInitialPhotos(listing: Listing | null): PhotoItem[] {
  if (!listing) return [];
  return listing.photos.map((url) => ({
    key: url,
    previewUrl: url,
    url,
    status: 'done',
  }));
}

const inputClass =
  'min-h-[44px] w-full rounded-lg border border-border bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500';
const labelClass = 'mb-1.5 block text-xs font-semibold text-ink-700';

export function ListingForm({ initialListing, onDone, onCancel }: ListingFormProps) {
  const { addListing, updateListing } = useListings();
  const [form, setForm] = useState<FormState>(() => toFormState(initialListing));
  const [photos, setPhotos] = useState<PhotoItem[]>(() => toInitialPhotos(initialListing));
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const startUpload = (item: PhotoItem) => {
    if (!item.file) return;
    setPhotos((prev) => prev.map((p) => (p.key === item.key ? { ...p, status: 'uploading', error: undefined } : p)));
    uploadListingPhoto(item.file)
      .then((url) => {
        setPhotos((prev) => prev.map((p) => (p.key === item.key ? { ...p, url, previewUrl: url, status: 'done' } : p)));
      })
      .catch((err: unknown) => {
        setPhotos((prev) =>
          prev.map((p) =>
            p.key === item.key
              ? { ...p, status: 'error', error: err instanceof Error ? err.message : '上傳失敗' }
              : p,
          ),
        );
      });
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const items: PhotoItem[] = Array.from(fileList).map((file) => ({
      key: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      url: null,
      status: 'uploading',
      file,
    }));
    setPhotos((prev) => [...prev, ...items]);
    items.forEach(startUpload);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (key: string) => {
    const target = photos.find((p) => p.key === key);
    setPhotos((prev) => prev.filter((p) => p.key !== key));
    if (target?.status === 'done' && target.url) {
      // 刪除自己 bucket 的檔案；示範資料的外部網址（例如 Unsplash）在 photoStorage 裡會被自動略過。
      deleteListingPhoto(target.url).catch((err) => {
        console.error('移除照片後清理儲存空間失敗（不影響本次編輯）', err);
      });
    }
  };

  const movePhoto = (index: number, direction: -1 | 1) => {
    setPhotos((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const uploadingCount = photos.filter((p) => p.status === 'uploading').length;
  const errorCount = photos.filter((p) => p.status === 'error').length;

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
    if (uploadingCount > 0) nextErrors.photos = '照片上傳中，請稍候再送出';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
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
      photos: photos.filter((p) => p.status === 'done' && p.url).map((p) => p.url as string),
      contact: {
        name: form.contactName.trim(),
        phone: form.contactPhone.trim(),
        lineId: form.contactLineId.trim() || undefined,
      },
      status: initialListing?.status ?? '上架',
      featured: form.featured,
    };

    setSaving(true);
    try {
      if (isEditing && initialListing) {
        await updateListing(initialListing.id, draft);
      } else {
        await addListing(draft);
      }
      onDone();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
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

        <Section title="物件照片">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="hidden"
            id="photo-upload-input"
          />
          <label
            htmlFor="photo-upload-input"
            className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-white text-sm font-semibold text-brand-700"
          >
            <ImagePlus size={18} />
            拍照或從相簿選擇照片
          </label>

          {errors.photos && <p className="text-xs font-medium text-danger-600">{errors.photos}</p>}
          {errorCount > 0 && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-danger-600">
              <AlertCircle size={13} />
              {errorCount} 張上傳失敗，可點擊縮圖上的重試按鈕，或移除後重新選擇
            </p>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((item, i) => (
                <div key={item.key} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-alt">
                  <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />

                  {i === 0 && item.status === 'done' && (
                    <span className="absolute left-1 top-1 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white">
                      封面
                    </span>
                  )}

                  {item.status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 size={20} className="animate-spin text-white" />
                    </div>
                  )}

                  {item.status === 'error' && (
                    <button
                      type="button"
                      onClick={() => startUpload(item)}
                      aria-label="重試上傳"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-danger-600/80 text-white"
                    >
                      <RotateCcw size={16} />
                      <span className="text-[10px] font-semibold">重試</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removePhoto(item.key)}
                    aria-label="移除照片"
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
                  >
                    <X size={14} />
                  </button>

                  {photos.length > 1 && item.status !== 'uploading' && (
                    <div className="absolute inset-x-1 bottom-1 flex justify-between">
                      <button
                        type="button"
                        onClick={() => movePhoto(i, -1)}
                        disabled={i === 0}
                        aria-label="往前移動"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30"
                      >
                        <ChevronsLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePhoto(i, 1)}
                        disabled={i === photos.length - 1}
                        aria-label="往後移動"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white disabled:opacity-30"
                      >
                        <ChevronsRight size={14} />
                      </button>
                    </div>
                  )}
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

        {submitError && (
          <p className="rounded-lg border border-danger-600/30 bg-danger-bg px-3 py-2 text-xs font-medium text-danger-600">
            {submitError}
          </p>
        )}
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl gap-3 border-t border-border bg-white px-5 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <button type="button" onClick={onCancel} className="min-h-[44px] flex-1 rounded-xl border border-border text-sm font-semibold text-ink-700">
          取消
        </button>
        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] flex-1 rounded-xl bg-brand-700 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? '儲存中…' : isEditing ? '儲存變更' : '新增物件'}
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
