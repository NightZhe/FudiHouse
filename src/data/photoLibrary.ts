/**
 * 示範照片對照表。
 *
 * 每一張都是 images.unsplash.com 的真實照片，網址於建置時以 `curl -sI` 逐張確認回傳 200，
 * 並下載縮圖以 Read 工具檢視內容，確認為住宅／店面室內或建築外觀（非人像、非歐美郊區
 * 別墅或泳池）後才收錄。key 對應下方 demoListings.ts 的 `photos` 陣列。
 */

function unsplash(id: string, w = 1400): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;
}

/** 將既有的 unsplash 圖片網址換成指定寬度（例如卡片縮圖用較小寬度）。 */
export function photoUrl(url: string, width: number): string {
  return url.replace(/([?&]w=)\d+/, `$1${width}`);
}

export interface PhotoEntry {
  url: string;
  description: string;
}

export const PHOTO_LIBRARY = {
  // 建築外觀
  extTower: { url: unsplash('1545324418-cc1a3fa10c00'), description: '集合住宅大樓外觀，仰角拍攝，陽台整齊排列' },
  extDuskGreen: { url: unsplash('1494526585095-c41746248156'), description: '雙層住宅外觀，黃昏亮燈，附車庫' },
  extAngularModern: { url: unsplash('1600585154340-be6161a56a0c'), description: '現代造型獨棟住宅外觀，黃昏庭院大樹、大片玻璃窗' },
  extNavyNight: { url: unsplash('1600585154526-990dced4db0d'), description: '深色鋁料立面獨棟住宅外觀，夜間玄關與木格柵亮燈' },
  extStorefront: { url: unsplash('1773156191860-e351c137da47'), description: '街邊店面，黑色鋁框玻璃門窗，臨街現代店面外觀' },
  extStorefrontAlt: { url: unsplash('1777632609446-c13a0d0ce10c'), description: '街邊二層店面，鐵捲門招牌與遮陽棚，臨路老屋改建店面' },

  // 客廳
  livBright: { url: unsplash('1493809842364-78817add7ffb'), description: '明亮客廳，木地板與大片採光窗' },
  livFireplace: { url: unsplash('1584622781564-1d987f7333c1'), description: '客廳一景，壁爐與灰藍色主牆、弓形採光窗' },
  livGalleryWall: { url: unsplash('1616486338812-3dadae4b4ace'), description: '客廳一景，淺灰主牆與相框、時鐘裝飾，米色沙發' },
  livDeerDecor: { url: unsplash('1615873968403-89e068629265'), description: '客廳一景，深青色主牆與動物頭裝飾，棕褐色皮沙發' },
  livRedChair: { url: unsplash('1522708323590-d24dbb6b0267'), description: '小坪數客餐廳，紅色單椅與開放式廚房一景' },
  livSageSofa: { url: unsplash('1554995207-c18c203602cb'), description: '客廳與開放式廚房連通格局，灰綠色主牆、棕褐色皮沙發，挑高天窗' },
  livWhitePlants: { url: unsplash('1600210492486-724fe5c67fb0'), description: '明亮客廳，白色系家具、相框牆與綠植' },
  livCofferCeiling: { url: unsplash('1598928506311-c55ded91a20c'), description: '客廳一景，格柵天花板與壁爐、對稱書櫃' },
  livOpenKitchen: { url: unsplash('1560185127-6ed189bf02f4'), description: '客廳與開放式廚房連通格局' },
  livSofaArt: { url: unsplash('1505691938895-1758d7feb511'), description: '客廳一景，米色沙發與掛畫' },
  livDining: { url: unsplash('1560185009-5bf9f2849488'), description: '客餐廳連通格局，木地板與大窗採光' },
  livBookshelf: { url: unsplash('1502672260266-1c1ef2d93688'), description: '明亮客廳一角，書牆植栽與沙發、木地板採光' },
  livWoodPanel: { url: unsplash('1600607687939-ce8a6c25118c'), description: '客廳一景，木紋電視主牆與淺灰沙發，鄰接開放式廚房' },

  // 廚房
  kitIsland: { url: unsplash('1484154218962-a197022b5858'), description: '白色系開放廚房，黑色壁面與中島吧檯' },
  kitMinimal: { url: unsplash('1750764484555-58d055fdd2c7'), description: '極簡風廚房中島，白色櫃體與吧檯椅' },
  kitMarble: { url: unsplash('1722605090433-41d1183a792d'), description: '白色系廚房，大理石檯面與中島' },

  // 衛浴
  bathGlassShower: { url: unsplash('1584622650111-993a426fbf0a'), description: '衛浴一景，玻璃淋浴間與木質鏡框' },
  bathTub: { url: unsplash('1620626011761-996317b8d101'), description: '衛浴一景，獨立浴缸與大理石盆檯' },

  // 臥室
  bedArtwork: { url: unsplash('1540518614846-7eded433c457'), description: '主臥室一景，雙人床與掛畫' },
  bedWarmLamp: { url: unsplash('1522771739844-6a9f6d5f14af'), description: '臥室一景，床頭燈與木質床頭櫃' },
  bedTufted: { url: unsplash('1505693416388-ac5ce068fe85'), description: '主臥室一景，軟包床頭與對稱床頭櫃' },
  bedHotelStyle: { url: unsplash('1631049307264-da0ec9d70304'), description: '臥室一景，灰色床頭板與落地窗景' },
  bedMinimal: { url: unsplash('1595526114035-0d45ed16cfbf'), description: '臥室一景，簡約風格與窗邊單椅' },

  staircaseInterior: { url: unsplash('1502005229762-cf1b2da7c5d6'), description: '住宅室內樓梯與掛畫牆面' },
} as const satisfies Record<string, PhotoEntry>;

export type PhotoKey = keyof typeof PHOTO_LIBRARY;

export function photo(key: PhotoKey, width?: number): string {
  const url = PHOTO_LIBRARY[key].url;
  return width ? photoUrl(url, width) : url;
}
