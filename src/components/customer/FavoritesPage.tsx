import { Heart } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import { useFavorites } from '../../context/FavoritesContext';
import { ListingCard } from './ListingCard';

export function FavoritesPage() {
  const { activeListings } = useListings();
  const { favoriteIds } = useFavorites();

  // 前台只顯示「上架」物件：若收藏的物件已下架／成交，會從這裡消失（與其他前台頁面一致）。
  const favoriteListings = activeListings.filter((l) => favoriteIds.includes(l.id));

  return (
    <div className="px-5 py-5">
      <h1 className="text-lg font-black text-ink-900">我的收藏</h1>
      <p className="mt-1 text-xs text-ink-500">{favoriteListings.length} 筆物件</p>

      {favoriteListings.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Heart size={40} className="mb-3 text-ink-300" />
          <p className="text-sm font-medium text-ink-500">尚無收藏物件</p>
          <p className="mt-1 text-xs text-ink-300">瀏覽物件時點擊愛心即可收藏</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {favoriteListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
