import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadFavoriteIds, persistFavoriteIds } from '../services/favoritesRepository';

interface FavoritesContextValue {
  favoriteIds: string[];
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (listingId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => loadFavoriteIds());

  useEffect(() => {
    persistFavoriteIds(favoriteIds);
  }, [favoriteIds]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds,
      isFavorite: (listingId: string) => favoriteIds.includes(listingId),
      toggleFavorite: (listingId: string) =>
        setFavoriteIds((prev) =>
          prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId],
        ),
    }),
    [favoriteIds],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites 必須在 FavoritesProvider 內使用');
  return ctx;
}
