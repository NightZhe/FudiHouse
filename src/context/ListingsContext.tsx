import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Listing, ListingDraft, ListingStatus } from '../types';
import * as listingRepository from '../services/listingRepository';

interface ListingsContextValue {
  /** 目前這個瀏覽器 session 讀得到的物件（RLS 決定範圍：客戶只有「上架」，員工是全部）。 */
  listings: Listing[];
  /** 只有「上架」的物件，前台顯示用；員工登入時 `listings` 含全部，這裡仍過濾。 */
  activeListings: Listing[];
  /** 第一次載入中。 */
  loading: boolean;
  /** 載入失敗訊息；成功後會被清空。 */
  error: string | null;
  /** 重新讀取整份清單（給錯誤狀態的「重試」按鈕用）。 */
  refetch: () => Promise<void>;
  getListingById: (id: string) => Listing | undefined;
  /** 目前清單裡沒有時，單獨讀一筆（例如從網址直接進詳情頁，或員工分享的連結）。 */
  fetchListingById: (id: string) => Promise<Listing | null>;
  addListing: (draft: ListingDraft) => Promise<Listing>;
  updateListing: (id: string, draft: ListingDraft) => Promise<Listing>;
  setListingStatus: (id: string, status: ListingStatus) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await listingRepository.fetchListings();
      setListings(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取物件清單失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const value = useMemo<ListingsContextValue>(
    () => ({
      listings,
      activeListings: listings.filter((l) => l.status === '上架'),
      loading,
      error,
      refetch,
      getListingById: (id) => listings.find((l) => l.id === id),
      fetchListingById: (id) => listingRepository.fetchListingById(id),
      addListing: async (draft) => {
        const listing = await listingRepository.createListing(draft);
        setListings((prev) => [listing, ...prev]);
        return listing;
      },
      updateListing: async (id, draft) => {
        const listing = await listingRepository.updateListing(id, draft);
        setListings((prev) => prev.map((l) => (l.id === id ? listing : l)));
        return listing;
      },
      setListingStatus: async (id, status) => {
        const listing = await listingRepository.setListingStatus(id, status);
        setListings((prev) => prev.map((l) => (l.id === id ? listing : l)));
        return listing;
      },
      deleteListing: async (id) => {
        await listingRepository.deleteListing(id);
        setListings((prev) => prev.filter((l) => l.id !== id));
      },
      incrementViews: async (id) => {
        await listingRepository.incrementListingViews(id);
        setListings((prev) => prev.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l)));
      },
    }),
    [listings, loading, error, refetch],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings(): ListingsContextValue {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings 必須在 ListingsProvider 內使用');
  return ctx;
}
