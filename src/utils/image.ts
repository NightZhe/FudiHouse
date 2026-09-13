/**
 * 把圖片網址（目前是 Unsplash）裡的 `w=` 寬度參數換成指定寬度，用來讓小尺寸的卡片縮圖
 * 不用下載跟詳情頁一樣大的原圖。網址若沒有 `w=` 參數或不是合法網址，原樣傳回。
 *
 * 注意：圖片網址本身（`src/data/photoLibrary.ts`）不是這個檔案管的範圍，這裡只處理顯示端的轉寬。
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
