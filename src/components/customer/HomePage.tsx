import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import { Logo } from '../layout/Logo';
import { CardGridSkeleton, ErrorState } from '../layout/AsyncState';
import { ListingCard } from './ListingCard';

const CITY_SHORTCUTS = ['台北市', '新北市', '桃園市', '台中市'];
const TYPE_SHORTCUTS = ['電梯大樓', '華廈', '公寓', '透天厝', '套房', '店面'];

/** 縣市快捷與型態快捷共用同一套樣式，維持視覺統一；橫向捲動單行以節省首屏高度。 */
const shortcutChipClass =
  'flex min-h-[44px] shrink-0 items-center rounded-full border border-border bg-white px-4 text-sm font-medium text-ink-700 active:scale-95';

export function HomePage() {
  const { activeListings, loading, error, refetch } = useListings();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    navigate(`/list${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const featured = activeListings.filter((l) => l.featured).slice(0, 6);
  const latest = [...activeListings]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 8);

  return (
    <div>
      <header className="bg-brand-800 px-5 pb-5 pt-5">
        <Logo variant="full" tone="inverted" />
        <p className="mt-3 text-sm text-white/70">富地嚴選物件，值得信賴的購屋夥伴。</p>
        <form onSubmit={handleSearch} className="mt-3 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5">
          <Search size={18} className="shrink-0 text-ink-300" aria-hidden="true" />
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜尋標題、社區或地址"
            aria-label="搜尋物件"
            className="w-full min-w-0 text-sm text-ink-900 outline-none placeholder:text-ink-300"
          />
          <button
            type="submit"
            className="flex min-h-[44px] shrink-0 items-center rounded-lg bg-brand-700 px-3.5 text-sm font-semibold text-white active:scale-95"
          >
            搜尋
          </button>
        </form>
      </header>

      <section className="px-5 pb-3 pt-4">
        <h2 className="mb-2 text-sm font-bold text-ink-700">縣市快捷</h2>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar">
          {CITY_SHORTCUTS.map((city) => (
            <Link key={city} to={`/list?city=${encodeURIComponent(city)}`} className={shortcutChipClass}>
              {city}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pb-4">
        <h2 className="mb-2 text-sm font-bold text-ink-700">型態快捷</h2>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar">
          {TYPE_SHORTCUTS.map((type) => (
            <Link key={type} to={`/list?type=${encodeURIComponent(type)}`} className={shortcutChipClass}>
              {type}
            </Link>
          ))}
        </div>
      </section>

      {error ? (
        <section className="px-5 py-5">
          <ErrorState message={error} onRetry={refetch} />
        </section>
      ) : loading ? (
        <section className="px-5 py-5">
          <CardGridSkeleton />
        </section>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="px-5 py-5">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="text-base font-bold text-ink-900">精選物件</h2>
              </div>
              <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 no-scrollbar">
                {featured.map((listing) => (
                  <div key={listing.id} className="w-64 shrink-0">
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="px-5 py-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-bold text-ink-900">最新上架</h2>
              <Link to="/list" className="text-xs font-medium text-brand-700">
                查看全部
              </Link>
            </div>
            {latest.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {latest.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <footer className="px-5 pb-10 pt-4 text-center">
        <Link to="/admin" className="text-xs text-ink-300 underline underline-offset-2">
          物件管理後台
        </Link>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-14 text-center">
      <p className="text-sm font-medium text-ink-500">目前尚無上架物件</p>
      <p className="mt-1 text-xs text-ink-300">請稍後再回來看看</p>
    </div>
  );
}
