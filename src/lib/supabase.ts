import { createClient } from '@supabase/supabase-js';

/**
 * 全站唯一的 Supabase client。環境變數缺漏時直接丟出清楚的中文錯誤，
 * 不要讓後續程式碼在 undefined url/key 的情況下呼叫出一堆難懂的 fetch 錯誤。
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '缺少 Supabase 環境變數：請確認 .env.local 有設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_PUBLISHABLE_KEY（可參考專案根目錄的 .env.example）。',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
