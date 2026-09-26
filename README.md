# 富地房屋

行動版優先的房產出售平台。客戶可以瀏覽、搜尋、收藏富地房屋的出售物件；公司人員在後台管理物件，變更會即時反映到所有客戶（同一份 Supabase 資料庫）。

- 線上網址：https://nightzhe.github.io/FudiHouse/
- 規格與驗收條件：[`SPEC.md`](SPEC.md)

## 功能

### 前台（客戶）

| 路由 | 說明 |
|------|------|
| `#/` 首頁 | 搜尋列、縣市與型態快捷、精選物件、最新上架 |
| `#/list` 找房 | 縣市／行政區、總價、坪數、房數、型態、屋齡篩選；五種排序 |
| `#/house/:id` 物件詳情 | 照片輪播、總價與單價、基本資料、特色、地圖連結、撥號與 LINE 聯絡、收藏 |
| `#/favorites` 收藏 | 收藏清單（存在瀏覽器） |

前台只顯示狀態為「上架」的物件。

### 後台（公司人員）

| 路由 | 說明 |
|------|------|
| `#/admin` | Email + 密碼登入（Supabase Auth）→ 儀表板（物件數、各狀態數、總瀏覽、平均單價） |
| `#/admin/listings` 物件管理 | 搜尋、狀態篩選、切換上架／下架／已成交、編輯、刪除（對話框確認） |
| `#/admin/new`、`#/admin/edit/:id` | 完整欄位表單、必填驗證、單價自動計算、多張照片上傳（拍照或選相簿） |

只有在 `public.staff` 名單內的帳號能進入後台；登入成功但不在名單內會顯示「此帳號沒有後台權限」並自動登出。

## 技術棧

- React 19、TypeScript、Vite 6
- react-router-dom（`HashRouter`，GitHub Pages 重新整理不會 404）
- Tailwind CSS v4、lucide-react
- **Supabase**：PostgreSQL（含 Row Level Security）＋ Auth（email/密碼）＋ Storage（物件照片）
- 資料存取層在 `src/services/`，元件一律透過 `Listing`／`ListingDraft` 型別溝通，不直接碰資料庫欄位

## 架構

```
src/
├── App.tsx                 # 路由：前台 / 後台
├── types.ts                # Listing 等型別（camelCase，畫面用這套）
├── lib/supabase.ts          # Supabase client（缺環境變數會丟出中文錯誤）
├── components/
│   ├── customer/           # 前台頁面與元件
│   ├── admin/              # 後台頁面與元件
│   └── layout/             # Logo、共用的 loading／error 狀態元件
├── context/                # 物件清單、收藏的 React Context（含 loading/error）
├── services/               # 資料存取層，唯一知道 Supabase schema 長相的地方
│   ├── listingRepository.ts # 物件 CRUD；資料列（snake_case）↔ Listing 的轉換集中於此
│   ├── photoStorage.ts      # 照片縮圖＋上傳到 Storage、刪除
│   ├── authRepository.ts    # 後台登入／登出／session
│   └── favoritesRepository.ts
├── data/regions.ts          # 縣市／行政區資料（篩選用，非資料庫內容）
└── utils/                  # 格式化、圖片網址處理
```

資料表 schema、RLS 規則、Storage bucket 設定都在 `supabase/01_schema.sql`（唯一權威版本，欄位名稱以它為準）。

### 儲存鍵名（瀏覽器端）

| 鍵名 | 位置 | 用途 |
|------|------|------|
| `fudi_favorites_v2` | localStorage | 收藏物件 ID（v2：改用 Supabase 的 uuid 後舊 id 失效，版號升級讓舊收藏作廢） |
| `fudi_viewed_listings_v1` | sessionStorage | 本次瀏覽已計過瀏覽數的物件 id，避免重複 +1 |

## 首次設定（換一個新的 Supabase 專案時）

1. 到 [Supabase Dashboard](https://supabase.com/dashboard) 建立專案，記下 Project URL 與 `anon`／`publishable` key。
2. **依序**在 Dashboard → SQL Editor 執行：
   1. `supabase/01_schema.sql`（資料表、RLS、`listing-photos` storage bucket）
   2. `supabase/02_seed.sql`（20 筆示範物件，資料表已有資料時會自動略過）
3. 到 Dashboard → Authentication → Users → **Add user**，建立員工帳號（勾選 *Auto Confirm User*，否則要先驗證信箱才能登入）。
4. 編輯 `supabase/03_add_staff.sql`，把 email 換成剛建立的帳號，執行它，把帳號加進 `public.staff` 名單（後台的存取權限判斷完全依賴這張表，不在名單內的帳號登入 Auth 會成功但進不了後台）。
5. 到 Dashboard → Authentication → Settings，**關閉「Enable email signups」**（或等效的公開註冊選項）——後台帳號只由員工手動建立，不開放自助註冊。
6. 複製 `.env.example` 為 `.env.local`，填入該專案的 URL 與 publishable key。

## 環境變數

| 變數 | 說明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 專案的 API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` 格式的新版 anon key |

`.env.local` 不進版控（見 `.gitignore`），`.env.example` 是佔位範本。

## 本地開發

需求：Node.js 20 以上、已設定好 `.env.local`。

```bash
npm install
npm run dev
```

開啟 http://localhost:5173/FudiHouse/

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發模式 |
| `npm run build` | 型別檢查＋建置到 `dist/` |
| `npm run preview` | 預覽建置結果（http://localhost:4173/FudiHouse/） |
| `npm run lint` | 只跑 TypeScript 型別檢查 |

## 部署

```bash
npm run deploy
```

會先 build，再把 `dist/` 推到 `gh-pages` 分支（GitHub Pages 的來源），約 1 分鐘後生效。推 `main` 不會自動部署，要手動跑這個指令。
`vite.config.ts` 的 `base` 必須與 repo 名稱一致（目前是 `/FudiHouse/`），改 repo 名稱時要一起改。

`.github/deploy.yml.disabled` 是 GitHub Actions 自動部署設定，目前停用：gh 登入缺 `workflow` 權限時推不上去。
要改成自動部署，先跑 `gh auth refresh -h github.com -s workflow`，再把檔案移回 `.github/workflows/deploy.yml`，並把 Pages 來源改回 GitHub Actions。

部署時記得同步在 GitHub Pages 的環境（或建置流程）注入 `VITE_SUPABASE_URL`／`VITE_SUPABASE_PUBLISHABLE_KEY`，否則線上版會直接因為缺環境變數丟錯（見 `src/lib/supabase.ts`）。

## 已知限制（目前刻意接受）

- **沒有審核流程**：員工存檔即上架，上架就對所有客戶公開，沒有草稿／送審機制。
- **員工名單只能靠 SQL 手動維護**：新增／移除員工要進 Supabase Dashboard 執行 `supabase/03_add_staff.sql`，沒有後台介面可以管理帳號。
- **照片沒有大小上限提示**：Storage bucket 限制單檔 10MB，前端縮圖後通常遠低於此，但選到超大原圖時要等縮圖完成才知道會不會失敗。
- **瀏覽數可被刷**：`increment_listing_views` 沒有防重放機制（只在瀏覽器端用 sessionStorage 擋同一 session 重複計數），清 sessionStorage 或換瀏覽器就能再加。
- 示範照片（`02_seed.sql`）來自 Unsplash，物件資料皆為虛構；示範照片不在 `listing-photos` bucket 裡，刪除示範物件不會嘗試刪除這些外部網址。
