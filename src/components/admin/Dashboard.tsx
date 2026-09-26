import { useListings } from '../../context/ListingsContext';
import { computeUnitPrice } from '../../utils/format';
import { ErrorState, RowSkeleton } from '../layout/AsyncState';

interface DashboardProps {
  onNavigateListings: () => void;
  onNavigateAdd: () => void;
}

export function Dashboard({ onNavigateListings, onNavigateAdd }: DashboardProps) {
  const { listings, loading, error, refetch } = useListings();

  const total = listings.length;
  const live = listings.filter((l) => l.status === '上架').length;
  const off = listings.filter((l) => l.status === '下架').length;
  const sold = listings.filter((l) => l.status === '已成交').length;
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);

  const liveListings = listings.filter((l) => l.status === '上架');
  const avgUnitPrice =
    liveListings.length === 0
      ? 0
      : liveListings.reduce((sum, l) => sum + computeUnitPrice(l.totalPrice, l.registeredArea), 0) / liveListings.length;

  return (
    <div className="px-5 py-5">
      <h1 className="text-lg font-black text-ink-900">後台總覽</h1>
      <p className="mt-1 text-xs text-ink-500">物件數據與快速操作</p>

      {error ? (
        <div className="mt-4">
          <ErrorState message={error} onRetry={refetch} />
        </div>
      ) : loading ? (
        <div className="mt-4">
          <RowSkeleton count={3} />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatCard label="物件總數" value={total.toLocaleString('zh-Hant-TW')} />
          <StatCard label="總瀏覽數" value={totalViews.toLocaleString('zh-Hant-TW')} />
          <StatCard label="上架中" value={live.toLocaleString('zh-Hant-TW')} tone="live" />
          <StatCard label="已下架" value={off.toLocaleString('zh-Hant-TW')} tone="off" />
          <StatCard label="已成交" value={sold.toLocaleString('zh-Hant-TW')} tone="sold" />
          <StatCard label="上架平均單價" value={`${avgUnitPrice.toFixed(1)} 萬/坪`} />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onNavigateAdd}
          className="min-h-[44px] rounded-xl bg-brand-700 text-sm font-bold text-white active:scale-[0.98]"
        >
          新增上架物件
        </button>
        <button
          type="button"
          onClick={onNavigateListings}
          className="min-h-[44px] rounded-xl border border-border bg-white text-sm font-semibold text-ink-700 active:scale-[0.98]"
        >
          前往物件管理
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'live' | 'off' | 'sold' }) {
  const toneClass =
    tone === 'live'
      ? 'text-status-live'
      : tone === 'off'
        ? 'text-status-off'
        : tone === 'sold'
          ? 'text-status-sold'
          : 'text-ink-900';
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs text-ink-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}
