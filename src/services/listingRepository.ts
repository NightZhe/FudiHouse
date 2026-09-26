import { supabase } from '../lib/supabase';
import type { BuildingType, Listing, ListingDraft, ListingStatus, ParkingType } from '../types';

/**
 * 物件資料存取層（Supabase）。
 *
 * 資料表 schema 見 `supabase/01_schema.sql`：snake_case 欄位，`layout` 拆成
 * rooms/living_rooms/bathrooms 三欄，`contact` 拆成 contact_name/contact_phone/contact_line_id。
 * RLS 決定讀取範圍：未登入或非員工的呼叫只會拿到 `status = '上架'` 的物件；員工（`public.staff`
 * 名單內）拿到全部。資料列 ↔ `Listing` 的轉換集中在本檔（`fromRow` / `toWriteRow`），
 * 呼叫端（context、頁面元件）一律只看得到 `Listing`。
 */

interface ListingRow {
  id: string;
  title: string;
  community_name: string | null;
  city: string;
  district: string;
  address: string;
  total_price: number;
  registered_area: number;
  main_area: number;
  rooms: number;
  living_rooms: number;
  bathrooms: number;
  floor: number;
  total_floors: number;
  age: number;
  building_type: BuildingType;
  parking: ParkingType;
  management_fee: number | null;
  facing: string | null;
  tags: string[];
  description: string;
  photos: string[];
  contact_name: string;
  contact_phone: string;
  contact_line_id: string | null;
  status: ListingStatus;
  featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

const LISTINGS_TABLE = 'listings';

function fromRow(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    communityName: row.community_name ?? undefined,
    city: row.city,
    district: row.district,
    address: row.address,
    totalPrice: Number(row.total_price),
    registeredArea: Number(row.registered_area),
    mainArea: Number(row.main_area),
    layout: {
      rooms: row.rooms,
      livingRooms: row.living_rooms,
      bathrooms: row.bathrooms,
    },
    floor: row.floor,
    totalFloors: row.total_floors,
    age: row.age,
    buildingType: row.building_type,
    parking: row.parking,
    managementFee: row.management_fee ?? undefined,
    facing: row.facing ?? undefined,
    tags: row.tags ?? [],
    description: row.description,
    photos: row.photos ?? [],
    contact: {
      name: row.contact_name,
      phone: row.contact_phone,
      lineId: row.contact_line_id ?? undefined,
    },
    status: row.status,
    featured: row.featured,
    views: row.views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** `ListingDraft`（新增／編輯共用的可寫欄位）→ 資料列欄位（不含 id/views/created_at/updated_at）。 */
function toWriteRow(draft: ListingDraft) {
  return {
    title: draft.title,
    community_name: draft.communityName ?? null,
    city: draft.city,
    district: draft.district,
    address: draft.address,
    total_price: draft.totalPrice,
    registered_area: draft.registeredArea,
    main_area: draft.mainArea,
    rooms: draft.layout.rooms,
    living_rooms: draft.layout.livingRooms,
    bathrooms: draft.layout.bathrooms,
    floor: draft.floor,
    total_floors: draft.totalFloors,
    age: draft.age,
    building_type: draft.buildingType,
    parking: draft.parking,
    management_fee: draft.managementFee ?? null,
    facing: draft.facing ?? null,
    tags: draft.tags,
    description: draft.description,
    photos: draft.photos,
    contact_name: draft.contact.name,
    contact_phone: draft.contact.phone,
    contact_line_id: draft.contact.lineId ?? null,
    status: draft.status,
    featured: draft.featured,
  };
}

function describeError(action: string, message: string): Error {
  return new Error(`${action}失敗：${message}`);
}

/** 讀取物件清單；RLS 決定範圍（未登入或非員工只看得到「上架」，員工看得到全部）。 */
export async function fetchListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw describeError('讀取物件清單', error.message);
  return (data as ListingRow[]).map(fromRow);
}

/** 讀取單筆物件；不存在或被 RLS 擋下都回傳 null，呼叫端自行決定要顯示什麼狀態。 */
export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase.from(LISTINGS_TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw describeError('讀取物件', error.message);
  return data ? fromRow(data as ListingRow) : null;
}

export async function createListing(draft: ListingDraft): Promise<Listing> {
  const { data, error } = await supabase.from(LISTINGS_TABLE).insert(toWriteRow(draft)).select('*').single();
  if (error) throw describeError('新增物件', error.message);
  return fromRow(data as ListingRow);
}

export async function updateListing(id: string, draft: ListingDraft): Promise<Listing> {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .update(toWriteRow(draft))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw describeError('更新物件', error.message);
  return fromRow(data as ListingRow);
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<Listing> {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw describeError('變更物件狀態', error.message);
  return fromRow(data as ListingRow);
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from(LISTINGS_TABLE).delete().eq('id', id);
  if (error) throw describeError('刪除物件', error.message);
}

/** 瀏覽數 +1；走 RPC 是因為客戶端沒有 update 權限，且該函式只對「上架」物件生效。 */
export async function incrementListingViews(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_listing_views', { listing_id: id });
  if (error) throw describeError('更新瀏覽數', error.message);
}
