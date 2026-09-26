/**
 * 收藏清單存取層（瀏覽器 localStorage，key 為 listing id）。
 *
 * key 版本在改用 Supabase 時升到 v2：舊版 localStorage 裡存的是 `L0001` 這種自建 id，
 * 換成 Supabase 的 uuid 之後舊 id 全部失效，用新 key 讓舊收藏清單直接作廢，不會顯示
 * 「收藏了卻找不到物件」的空指標情況。
 */

const STORAGE_KEY = 'fudi_favorites_v2';

export function loadFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistFavoriteIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
