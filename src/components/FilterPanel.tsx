import { useEffect, useState } from 'react';
import { CalendarRange, ChevronDown, Filter, RotateCcw, Search, X } from 'lucide-react';
import type { ActivityFilters, Category } from '../lib/types';
import { cn, categoryLabels } from '../lib/format';
import { Badge, Button, Field, Input, Select } from './ui';

const categories: Category[] = ['all', 'posts', 'replies', 'reposts', 'media', 'quotes'];

interface FilterPanelProps {
  filters: ActivityFilters;
  facets?: Record<Category, number>;
  onChange: (next: Partial<ActivityFilters>) => void;
  onReset: () => void;
  showCategory?: boolean;
  dense?: boolean;
  footer?: React.ReactNode;
}

export function FilterPanel({
  filters,
  facets,
  onChange,
  onReset,
  showCategory = true,
  dense,
  footer,
}: FilterPanelProps) {
  const [search, setSearch] = useState(filters.q);

  useEffect(() => {
    setSearch(filters.q);
  }, [filters.q]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== filters.q) onChange({ q: search, page: 1 });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [search, filters.q, onChange]);

  const activeCount = countActive(filters);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink">
          <Filter className="size-3.5 text-muted" />
          Filters
          {activeCount > 0 && <Badge tone="accent">{activeCount}</Badge>}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11.5px] text-muted transition-colors hover:text-ink"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search post text…"
          className="h-9 pl-9 text-[12.5px]"
          aria-label="Search post text"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
            aria-label="Clear search"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {showCategory && (
        <div>
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Category</span>
          <div className={cn('flex flex-wrap gap-1.5', dense && 'gap-1')}>
            {categories.map((category) => {
              const active = filters.category === category;
              return (
                <button
                  key={category}
                  onClick={() => onChange({ category, page: 1 })}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors',
                    active
                      ? 'border-accent/40 bg-accent-soft text-accent'
                      : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink',
                  )}
                  aria-pressed={active}
                >
                  {categoryLabels[category]}
                  {facets && (
                    <span className={cn('tabular text-[10.5px]', active ? 'text-accent/80' : 'text-muted')}>
                      {facets[category] ?? 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <span className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          <CalendarRange className="size-3" /> Date range
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Field label="From">
            <Input
              type="date"
              value={filters.from ?? ''}
              max={filters.to ?? undefined}
              onChange={(event) => onChange({ from: event.target.value || null, page: 1 })}
              className="h-9 text-[12.5px]"
            />
          </Field>
          <Field label="To">
            <Input
              type="date"
              value={filters.to ?? ''}
              min={filters.from ?? undefined}
              onChange={(event) => onChange({ to: event.target.value || null, page: 1 })}
              className="h-9 text-[12.5px]"
            />
          </Field>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {datePresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange({ ...preset.range(), page: 1 })}
              className="rounded-md border border-line bg-surface px-2 py-1 text-[10.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Engagement</span>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Min">
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minEngagement ?? ''}
              onChange={(event) =>
                onChange({ minEngagement: event.target.value === '' ? null : Number(event.target.value), page: 1 })
              }
              className="h-9 text-[12.5px]"
            />
          </Field>
          <Field label="Max">
            <Input
              type="number"
              min={0}
              placeholder="Any"
              value={filters.maxEngagement ?? ''}
              onChange={(event) =>
                onChange({ maxEngagement: event.target.value === '' ? null : Number(event.target.value), page: 1 })
              }
              className="h-9 text-[12.5px]"
            />
          </Field>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            { label: 'Zero', value: { minEngagement: 0, maxEngagement: 0 } },
            { label: '< 5', value: { minEngagement: 0, maxEngagement: 4 } },
            { label: '10+', value: { minEngagement: 10, maxEngagement: null } },
            { label: '100+', value: { minEngagement: 100, maxEngagement: null } },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange({ ...preset.value, page: 1 })}
              className="rounded-md border border-line bg-surface px-2 py-1 text-[10.5px] font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Media">
          <Select
            value={filters.mediaType}
            onChange={(event) => onChange({ mediaType: event.target.value as ActivityFilters['mediaType'], page: 1 })}
            className="h-9 text-[12.5px]"
          >
            <option value="any">Any</option>
            <option value="photo">Photos</option>
            <option value="video">Video</option>
            <option value="animated_gif">GIFs</option>
          </Select>
        </Field>
        <Field label="Source">
          <Select
            value={filters.source}
            onChange={(event) => onChange({ source: event.target.value as ActivityFilters['source'], page: 1 })}
            className="h-9 text-[12.5px]"
          >
            <option value="any">Any</option>
            <option value="api">API sync</option>
            <option value="archive">Archive</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Sort by">
          <Select
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value as ActivityFilters['sort'], page: 1 })}
            className="h-9 text-[12.5px]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="engagement">Most engagement</option>
            <option value="engagement_asc">Least engagement</option>
          </Select>
        </Field>
        <Field label="Show">
          <Select
            value={filters.includeDeleted ? 'all' : 'live'}
            onChange={(event) => onChange({ includeDeleted: event.target.value === 'all', page: 1 })}
            className="h-9 text-[12.5px]"
          >
            <option value="live">Live only</option>
            <option value="all">Include removed</option>
          </Select>
        </Field>
      </div>

      <details className="group rounded-lg border border-line bg-raised/50">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[11.5px] font-medium text-ink-soft">
          Like count range
          <ChevronDown className="size-3.5 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <Field label="Min likes">
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minLikes ?? ''}
              onChange={(event) => onChange({ minLikes: event.target.value === '' ? null : Number(event.target.value), page: 1 })}
              className="h-9 text-[12.5px]"
            />
          </Field>
          <Field label="Max likes">
            <Input
              type="number"
              min={0}
              placeholder="Any"
              value={filters.maxLikes ?? ''}
              onChange={(event) => onChange({ maxLikes: event.target.value === '' ? null : Number(event.target.value), page: 1 })}
              className="h-9 text-[12.5px]"
            />
          </Field>
        </div>
      </details>

      {footer}
    </div>
  );
}

function countActive(filters: ActivityFilters): number {
  let count = 0;
  if (filters.category !== 'all') count += 1;
  if (filters.q) count += 1;
  if (filters.from) count += 1;
  if (filters.to) count += 1;
  if (filters.mediaType !== 'any') count += 1;
  if (filters.minLikes !== null) count += 1;
  if (filters.maxLikes !== null) count += 1;
  if (filters.minEngagement !== null) count += 1;
  if (filters.maxEngagement !== null) count += 1;
  if (filters.source !== 'any') count += 1;
  if (filters.includeDeleted) count += 1;
  if (filters.sort !== 'newest') count += 1;
  return count;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const datePresets = [
  {
    label: 'This year',
    range: () => ({ from: `${new Date().getUTCFullYear()}-01-01`, to: iso(new Date()) }),
  },
  {
    label: 'Last year',
    range: () => {
      const year = new Date().getUTCFullYear() - 1;
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    },
  },
  {
    label: 'Older than 2y',
    range: () => {
      const date = new Date();
      date.setUTCFullYear(date.getUTCFullYear() - 2);
      return { from: null, to: iso(date) };
    },
  },
  {
    label: 'Last 90 days',
    range: () => {
      const date = new Date(Date.now() - 90 * 86_400_000);
      return { from: iso(date), to: iso(new Date()) };
    },
  },
];
