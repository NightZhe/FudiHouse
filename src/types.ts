/** 物件型態 */
export type BuildingType = '電梯大樓' | '華廈' | '公寓' | '透天厝' | '套房' | '店面';

/** 車位種類 */
export type ParkingType = '無' | '坡道平面' | '機械' | '其他';

/** 上架狀態 */
export type ListingStatus = '上架' | '下架' | '已成交';

export interface ListingLayout {
  rooms: number;
  livingRooms: number;
  bathrooms: number;
}

export interface ListingContact {
  name: string;
  phone: string;
  lineId?: string;
}

/** 出售物件 */
export interface Listing {
  id: string;
  title: string;
  communityName?: string;
  city: string;
  district: string;
  /** 只到路／段，不寫門牌 */
  address: string;
  /** 總價，單位：萬元 */
  totalPrice: number;
  /** 權狀坪數 */
  registeredArea: number;
  /** 主建物坪數 */
  mainArea: number;
  layout: ListingLayout;
  floor: number;
  totalFloors: number;
  /** 屋齡（年） */
  age: number;
  buildingType: BuildingType;
  parking: ParkingType;
  /** 管理費，元/月 */
  managementFee?: number;
  facing?: string;
  tags: string[];
  description: string;
  /** 照片網址陣列 */
  photos: string[];
  contact: ListingContact;
  status: ListingStatus;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

/** 新增物件時由使用者填寫的欄位（id／views／時間戳由 repository 產生） */
export type ListingDraft = Omit<Listing, 'id' | 'views' | 'createdAt' | 'updatedAt'>;

export interface ListPageFilters {
  city: string | null;
  district: string | null;
  minTotalPrice: number | null;
  maxTotalPrice: number | null;
  minArea: number | null;
  maxArea: number | null;
  minRooms: number | null;
  buildingType: BuildingType | null;
  maxAge: number | null;
}

export type ListSortOption =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'unit-price-asc'
  | 'area-desc';
