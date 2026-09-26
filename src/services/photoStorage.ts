import { supabase } from '../lib/supabase';

/**
 * 物件照片的儲存層：瀏覽器端縮圖後上傳到 Supabase Storage 的 `listing-photos` bucket
 * （公開讀取，只有 `public.staff` 名單內的帳號能寫入，見 `supabase/01_schema.sql`）。
 */

const BUCKET = 'listing-photos';
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;

/**
 * 用 `createImageBitmap` + canvas 把圖片縮到長邊最多 `maxDimension`、轉成 JPEG。
 * 選 `createImageBitmap` 是因為 Safari 會用系統解碼器讀圖，iPhone 直接拍的 HEIC
 * 也能正確解出來，不需要額外的 HEIC 轉檔套件。
 */
export async function resizeImageToJpeg(
  file: File | Blob,
  maxDimension = MAX_DIMENSION,
  quality = JPEG_QUALITY,
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('無法讀取這張圖片，請確認檔案格式（支援 JPEG／PNG／HEIC 等常見照片格式）');
  }

  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('瀏覽器不支援圖片處理（無法取得 canvas 2d context）');
    ctx.drawImage(bitmap, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('圖片轉檔失敗'))),
        'image/jpeg',
        quality,
      );
    });
  } finally {
    bitmap.close();
  }
}

function buildPhotoPath(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yyyy}/${mm}/${crypto.randomUUID()}.jpg`;
}

/** 縮圖後上傳一張照片，回傳公開網址。 */
export async function uploadListingPhoto(file: File): Promise<string> {
  const jpeg = await resizeImageToJpeg(file);
  const path = buildPhotoPath();

  const { error } = await supabase.storage.from(BUCKET).upload(path, jpeg, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(`照片上傳失敗：${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${BUCKET}/`;

/** 從公開網址反推 bucket 內的路徑；不是自己 bucket 的網址（例如 Unsplash 示範照）回傳 null。 */
function extractListingPhotoPath(url: string): string | null {
  const idx = url.indexOf(PUBLIC_URL_MARKER);
  if (idx === -1) return null;
  return url.slice(idx + PUBLIC_URL_MARKER.length);
}

/** 刪除一張照片物件；外部網址（非本專案 bucket）直接略過，不當作錯誤。 */
export async function deleteListingPhoto(url: string): Promise<void> {
  const path = extractListingPhotoPath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`照片刪除失敗：${error.message}`);
}

/** 批次刪除（例如刪除整筆物件時一併清掉照片）；單張失敗不影響其他張，只記錄警告。 */
export async function deleteListingPhotos(urls: string[]): Promise<void> {
  const results = await Promise.allSettled(urls.map((url) => deleteListingPhoto(url)));
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('刪除照片失敗（已略過，不影響物件本身的刪除）', result.reason);
    }
  });
}
