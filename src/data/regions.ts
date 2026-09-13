/** 示範資料涵蓋的縣市與行政區（用於篩選下拉選單）。 */
export const CITY_DISTRICTS: Record<string, string[]> = {
  台北市: ['大安區', '信義區', '內湖區', '士林區', '文山區', '松山區'],
  新北市: ['板橋區', '新莊區', '中和區', '淡水區', '三重區', '林口區'],
  桃園市: ['桃園區', '中壢區', '龜山區', '蘆竹區'],
  台中市: ['西屯區', '北屯區', '南屯區', '太平區'],
};

export const CITIES = Object.keys(CITY_DISTRICTS);
