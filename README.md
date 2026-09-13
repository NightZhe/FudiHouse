# 富地房產

行動版優先的房產出售平台。客戶可以瀏覽、搜尋、收藏富地房產的出售物件；公司人員在後台管理物件，變更會即時反映到前台。

- 線上網址：https://nightzhe.github.io/HouseRental/
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
| `#/admin` | 登入 → 儀表板（物件數、各狀態數、總瀏覽、平均單價、重置示範資料） |
| `#/admin/listings` 物件管理 | 搜尋、狀態篩選、切換上架／下架／已成交、編輯、刪除（對話框確認） |
| `#/admin/new`、`#/admin/edit/:id` | 完整欄位表單、必填驗證、單價自動計算 |

**後台示範密碼：`fudi2026`**（定義於 `src/services/authRepository.ts`）

## 技術棧

- React 19、TypeScript、Vite 6
- react-router-dom（`HashRouter`，GitHub Pages 重新整理不會 404）
- Tailwind CSS v4、lucide-react
- 資料：瀏覽器 `localStorage`，首次載入使用 `src/data/demoListings.ts` 的 20 筆虛構示範物件

## 專案結構

```
src/
├── App.tsx                 # 路由：前台 / 後台
├── types.ts                # Listing 等型別
├── components/
│   ├── customer/           # 前台頁面與元件
│   ├── admin/              # 後台頁面與元件
│   └── layout/Logo.tsx     # 富地房產 logo
├── context/                # 物件清單、收藏的 React Context
├── services/               # 資料存取層（之後換後端 API 只改這裡）
│   ├── listingRepository.ts
│   ├── favoritesRepository.ts
│   └── authRepository.ts
├── data/                   # 示範物件、照片對照表、縣市行政區
└── utils/format.ts         # 價格、坪數格式化
```

### 儲存鍵名

| 鍵名 | 位置 | 用途 |
|------|------|------|
| `fudi_listings_v2` | localStorage | 物件清單 |
| `fudi_favorites_v1` | localStorage | 收藏物件 ID |
| `fudi_admin_authed` | sessionStorage | 後台登入狀態 |



## 本地開發

需求：Node.js 20 以上。

```bash
npm install
npm run dev
```

開啟 http://localhost:5173/HouseRental/

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發模式 |
| `npm run build` | 型別檢查＋建置到 `dist/` |
| `npm run preview` | 預覽建置結果（http://localhost:4173/HouseRental/） |
| `npm run lint` | 只跑 TypeScript 型別檢查 |

## 部署

```bash
npm run deploy
```

會先 build，再把 `dist/` 推到 `gh-pages` 分支（GitHub Pages 的來源），約 1 分鐘後生效。推 `main` 不會自動部署，要手動跑這個指令。
`vite.config.ts` 的 `base` 必須與 repo 名稱一致（目前是 `/HouseRental/`），改 repo 名稱時要一起改。

`.github/deploy.yml.disabled` 是 GitHub Actions 自動部署設定，目前停用：gh 登入缺 `workflow` 權限時推不上去。
要改成自動部署，先跑 `gh auth refresh -h github.com -s workflow`，再把檔案移回 `.github/workflows/deploy.yml`，並把 Pages 來源改回 GitHub Actions。

## 已知限制（第一版刻意接受）

- **後台密碼只是前端示範**：寫在公開 repo 裡，任何人都看得到，不具安全性。正式營運前要接後端認證。
- **後台改動只存在操作者自己的瀏覽器**：客戶看到的永遠是內建示範資料。要讓後台改動真正發布給所有客戶，需要後端與資料庫（改 `src/services/` 即可接上）。
- 示範照片來自 Unsplash，物件資料皆為虛構。
