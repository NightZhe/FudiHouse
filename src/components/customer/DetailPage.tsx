import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Heart, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import { useFavorites } from '../../context/FavoritesContext';
import { ErrorState } from '../layout/AsyncState';
import {
  buildGoogleMapsUrl,
  buildLineUrl,
  buildTelUrl,
  formatArea,
  formatFloor,
  formatLayout,
  formatTotalPrice,
  formatUnitPrice,
} from '../../utils/format';
import type { Listing } from '../../types';

/** 同一 session 同一物件只加一次瀏覽數（sessionStorage，避免 React StrictMode 重複觸發 effect）。 */
const VIEWED_STORAGE_KEY = 'fudi_viewed_listings_v1';

function hasMarkedViewed(id: string): boolean {
  try {
    const raw = sessionStorage.getItem(VIEWED_STORAGE_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return ids.includes(id);
  } catch {
    return false;
  }
}

function markViewed(id: string): void {
  try {
    const raw = sessionStorage.getItem(VIEWED_STORAGE_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    if (!ids.includes(id)) {
      sessionStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify([...ids, id]));
    }
  } catch {
    // sessionStorage 不可用（例如隱私瀏覽）就放棄記錄，頂多重複計一次瀏覽數，不影響瀏覽本身。
  }
}

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getListingById, loading: listingsLoading, incrementViews } = useListings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const contextListing = id ? getListingById(id) : undefined;

  // 清單裡沒有這筆（例如直接用網址進來，或員工分享連結給還沒載入清單的客戶）時，單獨讀一筆。
  const [fetchedListing, setFetchedListing] = useState<Listing | null>(null);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [retryTick, setRetryTick] = useState(0);
  const { fetchListingById } = useListings();

  useEffect(() => {
    if (!id || contextListing || listingsLoading) return;
    let cancelled = false;
    setFetchStatus('loading');
    fetchListingById(id)
      .then((result) => {
        if (cancelled) return;
        setFetchedListing(result);
        setFetchStatus('idle');
      })
      .catch(() => {
        if (!cancelled) setFetchStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [id, contextListing, listingsLoading, fetchListingById, retryTick]);

  const listing = contextListing ?? fetchedListing ?? undefined;
  const isViewable = listing?.status === '上架';

  useEffect(() => {
    if (!listing || !isViewable) return;
    if (hasMarkedViewed(listing.id)) return;
    markViewed(listing.id);
    incrementViews(listing.id).catch((err) => {
      // 瀏覽數更新失敗不影響瀏覽體驗，記錄下來即可。
      console.error('瀏覽數更新失敗', err);
    });
  }, [listing, isViewable, incrementViews]);

  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setPhotoIndex(index);
  };

  const mapsUrl = useMemo(() => (listing ? buildGoogleMapsUrl(listing) : ''), [listing]);

  // 有上一頁（例如從找房頁點進來）就回上一頁保留篩選狀態；直接輸入網址進來時沒有上一頁，就回找房頁。
  const canGoBack = location.key !== 'default';
  const goBack = () => (canGoBack ? navigate(-1) : navigate('/list'));

  const isLoading = !listing && (listingsLoading || fetchStatus === 'loading');

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col">
        <div className="aspect-[4/3] w-full animate-pulse bg-surface-alt" />
        <div className="space-y-3 px-5 py-5">
          <div className="h-5 w-2/3 animate-pulse rounded bg-surface-alt" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-alt" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-surface-alt" />
        </div>
      </div>
    );
  }

  if (fetchStatus === 'error') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <ErrorState message="讀取物件失敗，請檢查網路後重試" onRetry={() => setRetryTick((n) => n + 1)} />
      </div>
    );
  }

  if (!listing || !isViewable) {
    const message = !listing ? '找不到這個物件' : listing.status === '已成交' ? '此物件已成交' : '此物件已下架';
    const hint = !listing ? '物件可能已下架或不存在' : '此物件目前無法瀏覽，歡迎看看其他物件';
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-medium text-ink-700">{message}</p>
        <p className="text-xs text-ink-300">{hint}</p>
        <Link
          to="/list"
          className="mt-2 flex min-h-[44px] items-center rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white"
        >
          回到找房
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(listing.id);

  return (
    <div className="pb-24">
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
        >
          {listing.photos.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt={`${listing.title} 照片 ${i + 1}`}
              loading={i === 0 ? undefined : 'lazy'}
              className="aspect-[4/3] w-full shrink-0 snap-start bg-surface-alt object-cover"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goBack}
          aria-label="返回上一頁"
          className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
        >
          <ChevronLeft size={22} />
        </button>

        {listing.photos.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
            {photoIndex + 1} / {listing.photos.length}
          </span>
        )}
      </div>

      <div className="space-y-5 px-5 py-5">
        <div>
          <h1 className="break-words text-lg font-black text-ink-900">{listing.title}</h1>
          <p className="mt-1 break-words text-sm text-ink-500">
            {listing.city}
            {listing.district}
            {listing.communityName ? ` · ${listing.communityName}` : ''}
          </p>
        </div>

        <div className="rounded-xl bg-brand-50 p-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-brand-700">{formatTotalPrice(listing.totalPrice)}</span>
            <span className="text-sm font-semibold text-brand-700">萬</span>
          </div>
          <p className="mt-1 whitespace-nowrap text-sm text-ink-500">
            單價 {formatUnitPrice(listing.totalPrice, listing.registeredArea)} 萬/坪
          </p>
        </div>

        {listing.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-border p-4 text-sm">
          <SpecItem label="格局" value={formatLayout(listing.layout)} />
          <SpecItem label="權狀坪數" value={formatArea(listing.registeredArea)} />
          <SpecItem label="主建物坪數" value={formatArea(listing.mainArea)} />
          <SpecItem label="樓層" value={formatFloor(listing.floor, listing.totalFloors)} nowrap />
          <SpecItem label="屋齡" value={`${listing.age} 年`} />
          <SpecItem label="型態" value={listing.buildingType} />
          <SpecItem label="車位" value={listing.parking} />
          <SpecItem label="管理費" value={listing.managementFee ? `${listing.managementFee.toLocaleString('zh-Hant-TW')} 元/月` : '無'} />
          <SpecItem label="朝向" value={listing.facing ?? '未提供'} />
          <SpecItem label="瀏覽次數" value={`${listing.views.toLocaleString('zh-Hant-TW')} 次`} />
        </dl>

        <div>
          <h2 className="mb-2 text-sm font-bold text-ink-900">物件描述</h2>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-ink-700">{listing.description}</p>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-ink-700"
        >
          <MapPin size={18} className="shrink-0 text-brand-700" />
          <span className="min-w-0 flex-1 break-words">
            {listing.city}
            {listing.district}
            {listing.address}
          </span>
          <span className="shrink-0 text-xs text-brand-700">在 Google 地圖開啟</span>
        </a>

        <div className="rounded-xl border border-border p-4">
          <h2 className="mb-1 text-sm font-bold text-ink-900">聯絡人</h2>
          <p className="text-sm text-ink-700">{listing.contact.name}</p>
          <p className="text-base font-bold text-brand-700">{listing.contact.phone}</p>
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-2xl items-center gap-3 border-t border-border bg-white px-5 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <button
          type="button"
          onClick={() => toggleFavorite(listing.id)}
          aria-pressed={favorite}
          aria-label={favorite ? '取消收藏' : '加入收藏'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border"
        >
          <Heart size={20} style={{ fill: favorite ? '#ef4444' : 'transparent', color: favorite ? '#ef4444' : '#3f4a48' }} />
        </button>
        <a
          href={buildTelUrl(listing.contact.phone)}
          className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-bold text-white active:scale-[0.98]"
        >
          <Phone size={16} />
          撥打電話
        </a>
        {listing.contact.lineId && (
          <a
            href={buildLineUrl(listing.contact.lineId)}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-status-live text-sm font-bold text-white active:scale-[0.98]"
          >
            <MessageCircle size={16} />
            LINE 詢問
          </a>
        )}
      </div>
    </div>
  );
}

function SpecItem({ label, value, nowrap = false }: { label: string; value: string; nowrap?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-ink-300">{label}</dt>
      <dd className={`mt-0.5 font-medium text-ink-900 ${nowrap ? 'whitespace-nowrap' : ''}`}>{value}</dd>
    </div>
  );
}
