import { AlertTriangle, RefreshCcw } from 'lucide-react';

/** 讀取失敗的共用畫面（前台／後台共用），一定要能重試，不能讓使用者卡在空白頁。 */
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <AlertTriangle size={36} className="text-danger-600" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex min-h-[44px] items-center gap-1.5 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white active:scale-95"
      >
        <RefreshCcw size={14} />
        重新載入
      </button>
    </div>
  );
}

/** 兩欄卡片骨架（首頁、找房、收藏共用）。 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="aspect-[4/3] animate-pulse bg-surface-alt" />
          <div className="space-y-2 p-3.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-alt" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-alt" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-surface-alt" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 橫向列表骨架（後台物件管理用）。 */
export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-alt" />
      ))}
    </div>
  );
}
