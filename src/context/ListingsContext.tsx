import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Listing, ListingDraft, ListingStatus } from '../types';
import {
  createListingId,
  loadListings,
  persistListings,
  resetListingsToDemoData,
} from '../services/listingRepository';

interface ListingsContextValue {
  /** 所有物件（含上架／下架／已成交），後台管理用。 */
  listings: Listing[];
  /** 只有「上架」的物件，前台顯示用。 */
  activeListings: Listing[];
  getListingById: (id: string) => Listing | undefined;
  addListing: (draft: ListingDraft) => Listing;
  updateListing: (id: string, draft: ListingDraft) => void;
  setListingStatus: (id: string, status: ListingStatus) => void;
  deleteListing: (id: string) => void;
  incrementViews: (id: string) => void;
  resetDemoData: () => void;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(() => loadListings());

  useEffect(() => {
    persistListings(listings);
  }, [listings]);

  const value = useMemo<ListingsContextValue>(() => {
    const now = () => new Date().toISOString();

    return {
      listings,
      activeListings: listings.filter((l) => l.status === '上架'),
      getListingById: (id) => listings.find((l) => l.id === id),
      addListing: (draft) => {
        const listing: Listing = {
          ...draft,
          id: createListingId(),
          views: 0,
          createdAt: now(),
          updatedAt: now(),
        };
        setListings((prev) => [listing, ...prev]);
        return listing;
      },
      updateListing: (id, draft) => {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, ...draft, id, updatedAt: now() } : l)),
        );
      },
      setListingStatus: (id, status) => {
        setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status, updatedAt: now() } : l)));
      },
      deleteListing: (id) => {
        setListings((prev) => prev.filter((l) => l.id !== id));
      },
      incrementViews: (id) => {
        setListings((prev) => prev.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l)));
      },
      resetDemoData: () => {
        setListings(resetListingsToDemoData());
      },
    };
  }, [listings]);

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings(): ListingsContextValue {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings 必須在 ListingsProvider 內使用');
  return ctx;
}
