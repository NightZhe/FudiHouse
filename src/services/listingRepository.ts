import type { Listing } from '../types';
import { DEMO_LISTINGS } from '../data/demoListings';

/**
 * 物件資料存取層。
 *
 * 第一版資料存在瀏覽器 localStorage，首次載入時以內建示範資料播種。
 * 之後要換成真正的後端 API，只需要改這個檔案（例如把 localStorage 讀寫換成 fetch），
 * 呼叫端（`App.tsx` 與各頁面元件）的介面不需要變動。
 */

const STORAGE_KEY = 'fudi_listings_v2';

/** 讀取物件清單；若瀏覽器尚無資料，以示範資料播種並寫回。 */
export function loadListings(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      persistListings(DEMO_LISTINGS);
      return DEMO_LISTINGS;
    }
    const parsed = JSON.parse(raw) as Listing[];
    if (!Array.isArray(parsed)) throw new Error('stored listings is not an array');
    return parsed;
  } catch {
    persistListings(DEMO_LISTINGS);
    return DEMO_LISTINGS;
  }
}

/** 將完整物件清單寫回 localStorage。 */
export function persistListings(listings: Listing[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

/** 重置為內建示範資料（後台「重置示範資料」用）。 */
export function resetListingsToDemoData(): Listing[] {
  persistListings(DEMO_LISTINGS);
  return DEMO_LISTINGS;
}

/**
 * 產生新物件 id。用 `crypto.randomUUID()` 而非「目前筆數 +1」推算，
 * 避免刪除物件後重新整理再新增時算出已存在過的編號而撞號。
 */
export function createListingId(): string {
  return `L-${crypto.randomUUID()}`;
}
