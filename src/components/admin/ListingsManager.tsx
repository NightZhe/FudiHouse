import { useState } from 'react';
import { AlertCircle, Edit2, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useListings } from '../../context/ListingsContext';
import type { Listing, ListingStatus } from '../../types';
import { formatTotalPrice } from '../../utils/format';
import { ConfirmDialog } from './ConfirmDialog';

interface ListingsManagerProps {
  onEdit: (listing: Listing) => void;
  onAdd: () => void;
}

const STATUS_FILTERS: { value: ListingStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: '上架', label: '上架' },
  { value: '下架', label: '下架' },
  { value: '已成交', label: '已成交' },
];

/** 狀態下拉本身要能看出目前狀態顏色，所以不另外放狀態徽章。 */
const statusSelectStyle: Record<ListingStatus, string> = {
  上架: 'border-status-live bg-status-live-bg text-status-live',
  下架: 'border-status-off bg-status-off-bg text-status-off',
  已成交: 'border-status-sold bg-status-sold-bg text-status-sold',
};

export function ListingsManager({ onEdit, onAdd }: ListingsManagerProps) {
  const { listings, setListingStatus, deleteListing } = useListings();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  const filtered = listings.filter((listing) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || `${listing.title} ${listing.communityName ?? ''}`.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-5 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-ink-900">物件管理</h1>
          <p className="mt-0.5 text-xs text-ink-500">共 {listings.length} 筆物件</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-sm font-bold text-white active:scale-95"
        >
          <PlusCircle size={16} />
          新增
        </button>
      </div>

      <div className="mb-3 flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search size={16} className="shrink-0 text-ink-300" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜尋物件標題或社區"
          aria-label="搜尋物件"
          className="w-full min-w-0 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`min-h-[44px] rounded-full border px-3 py-1.5 text-xs font-semibold ${
              statusFilter === opt.value ? 'border-brand-700 bg-brand-700 text-white' : 'border-border bg-white text-ink-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <AlertCircle size={36} className="mb-3 text-ink-300" />
          <p className="text-sm font-medium text-ink-500">找不到符合條件的物件</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => (
            <div key={listing.id} className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="flex gap-3 p-3">
                <img
                  src={listing.photos[0]}
                  alt=""
                  className="h-20 w-24 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink-900">{listing.title}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {listing.city}
                    {listing.district}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-black text-brand-700">{formatTotalPrice(listing.totalPrice)} 萬</span>
                    <span className="text-xs text-ink-300">{listing.views.toLocaleString('zh-Hant-TW')} 次瀏覽</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-border px-3 py-2">
                <label className="sr-only" htmlFor={`status-${listing.id}`}>
                  變更狀態
                </label>
                <select
                  id={`status-${listing.id}`}
                  value={listing.status}
                  onChange={(e) => setListingStatus(listing.id, e.target.value as ListingStatus)}
                  className={`min-h-[44px] flex-1 rounded-lg border px-2 text-xs font-bold outline-none ${statusSelectStyle[listing.status]}`}
                >
                  <option value="上架">上架</option>
                  <option value="下架">下架</option>
                  <option value="已成交">已成交</option>
                </select>
                <button
                  type="button"
                  onClick={() => onEdit(listing)}
                  className="flex min-h-[44px] items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-brand-700"
                >
                  <Edit2 size={13} />
                  編輯
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(listing)}
                  className="flex min-h-[44px] items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-danger-600"
                >
                  <Trash2 size={13} />
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget ? `刪除「${deleteTarget.title}」？` : '刪除物件？'}
        description="刪除後無法復原，前台也會立即看不到這筆物件。"
        confirmLabel="確認刪除"
        danger
        onConfirm={() => {
          if (deleteTarget) deleteListing(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
