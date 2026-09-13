import type { Listing } from '../types';

/** 總價（萬元）→ 千分位字串，例如 1280 -> "1,280" */
export function formatTotalPrice(totalPriceWan: number): string {
  return totalPriceWan.toLocaleString('zh-Hant-TW');
}

/** 單價（萬/坪）＝總價 ÷ 權狀坪數，四捨五入到小數 1 位 */
export function computeUnitPrice(totalPriceWan: number, registeredArea: number): number {
  if (registeredArea <= 0) return 0;
  return Math.round((totalPriceWan / registeredArea) * 10) / 10;
}

export function formatUnitPrice(totalPriceWan: number, registeredArea: number): string {
  const unitPrice = computeUnitPrice(totalPriceWan, registeredArea);
  return unitPrice.toFixed(1);
}

export function formatArea(ping: number): string {
  return `${ping % 1 === 0 ? ping.toFixed(0) : ping.toFixed(1)} 坪`;
}

/** 統一用「數字＋空格＋單位」的寫法，與 formatArea（例如「38.2 坪」）一致 */
export function formatLayout(layout: Listing['layout']): string {
  return `${layout.rooms} 房 ${layout.livingRooms} 廳 ${layout.bathrooms} 衛`;
}

export function formatFloor(floor: number, totalFloors: number): string {
  return `${floor}／${totalFloors} 樓`;
}

export function formatViews(views: number): string {
  return views.toLocaleString('zh-Hant-TW');
}

const relativeTimeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
];

const rtf = new Intl.RelativeTimeFormat('zh-Hant-TW', { numeric: 'auto' });

/** 相對時間，例如「3 天前」，供「最新上架」使用 */
export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.parse(isoDate) - Date.now();
  for (const [unit, ms] of relativeTimeUnits) {
    if (Math.abs(diffMs) >= ms || unit === 'minute') {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return rtf.format(0, 'minute');
}

export function buildGoogleMapsUrl(listing: Pick<Listing, 'city' | 'district' | 'address'>): string {
  const query = encodeURIComponent(`${listing.city}${listing.district}${listing.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildTelUrl(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}

/**
 * LINE 官方帳號 ID（`@` 開頭）要用 `https://line.me/R/ti/p/@xxx`，`@` 不能被編碼成 `%40`；
 * 一般個人 ID 維持既有的 `~id` 格式。
 */
export function buildLineUrl(lineId: string): string {
  const trimmed = lineId.trim();
  if (trimmed.startsWith('@')) {
    return `https://line.me/R/ti/p/@${encodeURIComponent(trimmed.slice(1))}`;
  }
  return `https://line.me/R/ti/p/~${encodeURIComponent(trimmed)}`;
}
