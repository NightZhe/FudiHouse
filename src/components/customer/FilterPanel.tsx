import { X } from 'lucide-react';
import type { BuildingType, ListPageFilters } from '../../types';
import { CITIES, CITY_DISTRICTS } from '../../data/regions';

const BUILDING_TYPES: BuildingType[] = ['電梯大樓', '華廈', '公寓', '透天厝', '套房', '店面'];
const ROOM_OPTIONS = [1, 2, 3, 4];

interface FilterPanelProps {
  filters: ListPageFilters;
  onChange: (next: ListPageFilters) => void;
  onClose: () => void;
  onReset: () => void;
}

const fieldLabel = 'mb-2 block text-xs font-semibold text-ink-700';
const numberInput =
  'min-h-[44px] w-full rounded-lg border border-border bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-500';
const chipBase = 'min-h-[44px] rounded-full border px-3.5 py-2 text-sm font-medium transition-colors';

export function FilterPanel({ filters, onChange, onClose, onReset }: FilterPanelProps) {
  const districts = filters.city ? CITY_DISTRICTS[filters.city] ?? [] : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" role="dialog" aria-modal="true" aria-label="篩選條件">
      <div className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">篩選條件</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉篩選"
            className="flex h-11 w-11 items-center justify-center text-ink-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <span className={fieldLabel}>縣市</span>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, city: filters.city === city ? null : city, district: null })
                  }
                  className={`${chipBase} ${
                    filters.city === city ? 'border-brand-700 bg-brand-700 text-white' : 'border-border bg-white text-ink-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {districts.length > 0 && (
            <div>
              <span className={fieldLabel}>行政區</span>
              <div className="flex flex-wrap gap-2">
                {districts.map((district) => (
                  <button
                    key={district}
                    type="button"
                    onClick={() =>
                      onChange({ ...filters, district: filters.district === district ? null : district })
                    }
                    className={`${chipBase} ${
                      filters.district === district
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-border bg-white text-ink-700'
                    }`}
                  >
                    {district}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className={fieldLabel}>總價（萬元）</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="不限"
                aria-label="最低總價"
                value={filters.minTotalPrice ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, minTotalPrice: e.target.value === '' ? null : Number(e.target.value) })
                }
                className={numberInput}
              />
              <span className="text-ink-300">至</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="不限"
                aria-label="最高總價"
                value={filters.maxTotalPrice ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, maxTotalPrice: e.target.value === '' ? null : Number(e.target.value) })
                }
                className={numberInput}
              />
            </div>
          </div>

          <div>
            <span className={fieldLabel}>權狀坪數</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="不限"
                aria-label="最小坪數"
                value={filters.minArea ?? ''}
                onChange={(e) => onChange({ ...filters, minArea: e.target.value === '' ? null : Number(e.target.value) })}
                className={numberInput}
              />
              <span className="text-ink-300">至</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="不限"
                aria-label="最大坪數"
                value={filters.maxArea ?? ''}
                onChange={(e) => onChange({ ...filters, maxArea: e.target.value === '' ? null : Number(e.target.value) })}
                className={numberInput}
              />
            </div>
          </div>

          <div>
            <span className={fieldLabel}>房數</span>
            <div className="flex flex-wrap gap-2">
              {ROOM_OPTIONS.map((rooms) => (
                <button
                  key={rooms}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, minRooms: filters.minRooms === rooms ? null : rooms })
                  }
                  className={`${chipBase} ${
                    filters.minRooms === rooms ? 'border-brand-700 bg-brand-700 text-white' : 'border-border bg-white text-ink-700'
                  }`}
                >
                  {rooms}房以上
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={fieldLabel}>型態</span>
            <div className="flex flex-wrap gap-2">
              {BUILDING_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, buildingType: filters.buildingType === type ? null : type })
                  }
                  className={`${chipBase} ${
                    filters.buildingType === type
                      ? 'border-brand-700 bg-brand-700 text-white'
                      : 'border-border bg-white text-ink-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className={fieldLabel}>屋齡上限（年）</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="不限"
              aria-label="屋齡上限"
              value={filters.maxAge ?? ''}
              onChange={(e) => onChange({ ...filters, maxAge: e.target.value === '' ? null : Number(e.target.value) })}
              className={numberInput}
            />
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-border bg-white pt-4">
          <button
            type="button"
            onClick={onReset}
            className="min-h-[44px] flex-1 rounded-lg border border-border text-sm font-semibold text-ink-700"
          >
            清除條件
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] flex-1 rounded-lg bg-brand-700 text-sm font-semibold text-white"
          >
            套用篩選
          </button>
        </div>
      </div>
    </div>
  );
}

export const EMPTY_FILTERS: ListPageFilters = {
  city: null,
  district: null,
  minTotalPrice: null,
  maxTotalPrice: null,
  minArea: null,
  maxArea: null,
  minRooms: null,
  buildingType: null,
  maxAge: null,
};
