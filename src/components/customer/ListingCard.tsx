import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Listing } from '../../types';
import { formatArea, formatFloor, formatLayout, formatTotalPrice, formatUnitPrice } from '../../utils/format';
import { getResizedImageUrl } from '../../utils/image';
import { useFavorites } from '../../context/FavoritesContext';

/** 卡片縮圖用較小寬度，避免下載跟詳情頁一樣大的原圖 */
const CARD_IMAGE_WIDTH = 720;

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(listing.id);

  return (
    <Link
      to={`/house/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-alt">
        <img
          src={getResizedImageUrl(listing.photos[0], CARD_IMAGE_WIDTH)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {listing.featured && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-accent-600 px-2.5 py-1 text-[11px] font-bold text-white">
            精選
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(listing.id);
          }}
          aria-pressed={favorite}
          aria-label={favorite ? '取消收藏' : '加入收藏'}
          className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur transition-transform active:scale-90">
            <Heart
              size={16}
              className="transition-colors"
              style={{ fill: favorite ? '#ef4444' : 'transparent', color: favorite ? '#ef4444' : 'white' }}
            />
          </span>
        </button>
      </div>
      <div className="space-y-1.5 p-3.5">
        <h3 className="truncate text-[15px] font-bold text-ink-900">{listing.title}</h3>
        <p className="truncate text-xs text-ink-500">
          {listing.district}
          {listing.communityName ? ` · ${listing.communityName}` : ''}
        </p>
        <p className="text-xs text-ink-500">
          {formatLayout(listing.layout)} ｜ {formatArea(listing.registeredArea)} ｜{' '}
          <span className="whitespace-nowrap">{formatFloor(listing.floor, listing.totalFloors)}</span>
        </p>
        <div className="pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-brand-700">{formatTotalPrice(listing.totalPrice)}</span>
            <span className="text-xs font-medium text-ink-500">萬</span>
          </div>
          <span className="mt-0.5 block whitespace-nowrap text-xs text-ink-500">
            單價 {formatUnitPrice(listing.totalPrice, listing.registeredArea)} 萬/坪
          </span>
        </div>
        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {listing.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
