import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useListings } from '../../context/ListingsContext';
import type { Listing, ListPageFilters, ListSortOption } from '../../types';
import { computeUnitPrice } from '../../utils/format';
import { CardGridSkeleton, ErrorState } from '../layout/AsyncState';
import { ListingCard } from './ListingCard';
import { EMPTY_FILTERS, FilterPanel } from './FilterPanel';

const SORT_OPTIONS: { value: ListSortOption; label: string }[] = [
  { value: 'newest', label: '最新上架' },
  { value: 'price-asc', label: '總價低到高' },
  { value: 'price-desc', label: '總價高到低' },
  { value: 'unit-price-asc', label: '單價低到高' },
  { value: 'area-desc', label: '坪數大到小' },
];

function sortListings(listings: Listing[], sort: ListSortOption): Listing[] {
  const sorted = [...listings];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    case 'price-asc':
      return sorted.sort((a, b) => a.totalPrice - b.totalPrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.totalPrice - a.totalPrice);
    case 'unit-price-asc':
      return sorted.sort(
        (a, b) =>
          computeUnitPrice(a.totalPrice, a.registeredArea) - computeUnitPrice(b.totalPrice, b.registeredArea),
      );
    case 'area-desc':
      return sorted.sort((a, b) => b.registeredArea - a.registeredArea);
    default:
      return sorted;
  }
}

function countActiveFilters(filters: ListPageFilters): number {
  return Object.values(filters).filter((v) => v !== null && v !== '').length;
}

/**
 * 找房頁的篩選／排序狀態保存在 sessionStorage，從詳情頁返回時能還原。
 * 用 `location.key` 判斷這次進到 /list 是「回到同一個歷史紀錄」（還原狀態）
 * 還是「全新進入」（例如從首頁點快捷或搜尋，這時要用網址參數，不要沿用舊狀態）。
 */
const LIST_STATE_KEY = 'houserental:list-state';
const LIST_STATE_NAV_KEY = 'houserental:list-state-nav-key';

interface StoredListState {
  keyword: string;
  filters: ListPageFilters;
  sort: ListSortOption;
}

function loadStoredListState(navKey: string): StoredListState | null {
  try {
    if (sessionStorage.getItem(LIST_STATE_NAV_KEY) !== navKey) return null;
    const raw = sessionStorage.getItem(LIST_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as StoredListState;
  } catch {
    // sessionStorage 在隱私瀏覽等情境可能不可用，讀不到就當作沒有保存狀態，不影響正常瀏覽。
    return null;
  }
}

function persistListState(navKey: string, state: StoredListState) {
  try {
    sessionStorage.setItem(LIST_STATE_NAV_KEY, navKey);
    sessionStorage.setItem(LIST_STATE_KEY, JSON.stringify(state));
  } catch {
    // 同上，保存失敗就放棄，不影響正常瀏覽。
  }
}

export function ListPage() {
  const { activeListings, loading, error, refetch } = useListings();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const restored = loadStoredListState(location.key);

  const [keyword, setKeyword] = useState(() => restored?.keyword ?? searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<ListPageFilters>(
    () =>
      restored?.filters ?? {
        ...EMPTY_FILTERS,
        city: searchParams.get('city'),
        buildingType: (searchParams.get('type') as ListPageFilters['buildingType']) ?? null,
      },
  );
  const [sort, setSort] = useState<ListSortOption>(() => restored?.sort ?? 'newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    persistListState(location.key, { keyword, filters, sort });
  }, [location.key, keyword, filters, sort]);

  const results = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const filtered = activeListings.filter((listing) => {
      if (kw) {
        const haystack = `${listing.title} ${listing.communityName ?? ''} ${listing.address}`.toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      if (filters.city && listing.city !== filters.city) return false;
      if (filters.district && listing.district !== filters.district) return false;
      if (filters.minTotalPrice !== null && listing.totalPrice < filters.minTotalPrice) return false;
      if (filters.maxTotalPrice !== null && listing.totalPrice > filters.maxTotalPrice) return false;
      if (filters.minArea !== null && listing.registeredArea < filters.minArea) return false;
      if (filters.maxArea !== null && listing.registeredArea > filters.maxArea) return false;
      if (filters.minRooms !== null && listing.layout.rooms < filters.minRooms) return false;
      if (filters.buildingType && listing.buildingType !== filters.buildingType) return false;
      if (filters.maxAge !== null && listing.age > filters.maxAge) return false;
      return true;
    });
    return sortListings(filtered, sort);
  }, [activeListings, keyword, filters, sort]);

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="回首頁" className="flex h-11 w-11 shrink-0 items-center justify-center text-ink-700">
            <ChevronLeft size={22} />
          </Link>
          <div className="flex min-h-[44px] flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3">
            <Search size={16} className="shrink-0 text-ink-300" aria-hidden="true" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜尋標題、社區或地址"
              aria-label="搜尋物件"
              className="w-full min-w-0 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-ink-700"
            aria-label="篩選條件"
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-ink-500">
            {error ? ' ' : loading ? '載入中…' : `共 ${results.length} 筆物件`}
          </p>
          <label className="flex items-center gap-1.5 text-xs text-ink-700">
            排序
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ListSortOption)}
              className="min-h-[44px] rounded-md border border-border bg-white px-2 text-xs text-ink-900 outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="px-4 py-4">
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading ? (
          <CardGridSkeleton />
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-ink-500">找不到符合條件的物件</p>
            <p className="mt-1 text-xs text-ink-300">試著放寬篩選條件或更換關鍵字</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
      )}
    </div>
  );
}
