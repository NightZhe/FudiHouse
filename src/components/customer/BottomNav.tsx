import { NavLink } from 'react-router-dom';
import { Home, Search, Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useListings } from '../../context/ListingsContext';

const linkBase =
  'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors min-h-[44px]';

export function BottomNav() {
  const { favoriteIds } = useFavorites();
  const { activeListings } = useListings();
  // 徽章只算「上架中」的收藏：物件下架後仍留在 favoriteIds 裡，但前台看不到、也不該計入數字。
  const activeFavoriteCount = activeListings.filter((l) => favoriteIds.includes(l.id)).length;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl border-t border-border bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="主要導覽"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${linkBase} ${isActive ? 'text-brand-700' : 'text-ink-500'}`}
      >
        <Home size={22} strokeWidth={2} />
        首頁
      </NavLink>
      <NavLink
        to="/list"
        className={({ isActive }) => `${linkBase} ${isActive ? 'text-brand-700' : 'text-ink-500'}`}
      >
        <Search size={22} strokeWidth={2} />
        找房
      </NavLink>
      <NavLink
        to="/favorites"
        className={({ isActive }) => `${linkBase} ${isActive ? 'text-brand-700' : 'text-ink-500'}`}
        aria-label={activeFavoriteCount > 0 ? `收藏，${activeFavoriteCount} 筆` : '收藏'}
      >
        <Heart size={22} strokeWidth={2} />
        收藏{activeFavoriteCount > 0 ? `（${activeFavoriteCount}）` : ''}
      </NavLink>
    </nav>
  );
}
