/**
 * 把圖片網址（例如示範資料殘留的 Unsplash 網址）裡的 `w=` 寬度參數換成指定寬度，
 * 用來讓小尺寸的卡片縮圖不用下載跟詳情頁一樣大的原圖。網址若沒有 `w=` 參數
 * （例如 Supabase Storage 的公開網址）或不是合法網址，原樣傳回。
 */
export function getResizedImageUrl(url: string, width: number): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('w')) return url;
    parsed.searchParams.set('w', String(Math.round(width)));
    return parsed.toString();
  } catch {
    return url;
  }
}
