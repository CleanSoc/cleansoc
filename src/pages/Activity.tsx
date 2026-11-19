import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Filter,
  ListChecks,
  RotateCcw,
  SearchX,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import { get, post } from '../lib/api';
import type { ActivityFilters, ActivityResponse, Category, Post } from '../lib/types';
import { defaultFilters } from '../lib/types';
import { categoryLabels, cn, formatNumber, parseFilters } from '../lib/format';
import { Badge, Button, Callout, Checkbox, EmptyState, Field, IconButton, Input, Modal, Skeleton, useToast } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { FilterPanel } from '../components/FilterPanel';
import { PostCard } from '../components/PostCard';
import { CleanupDialog } from '../components/CleanupDialog';

const categories: Category[] = ['all', 'posts', 'replies', 'reposts', 'media', 'quotes'];

export function ActivityPage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const filters = useMemo<ActivityFilters>(() => {
    const parsed = parseFilters(params);
    return { ...defaultFilters, ...parsed } as ActivityFilters;
  }, [params]);

  const queryString = params.toString();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<{ open: boolean; filters?: ActivityFilters; postIds?: string[] }>({ open: false });
  const [filterOpen, setFilterOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');

  useEffect(() => {
    setSelected(new Set());
  }, [queryString]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['activity', queryString],
    queryFn: () => get<ActivityResponse>(`/api/activity?${queryString}`),
    placeholderData: (previous) => previous,
  });

  const update = useCallback(
    (next: Partial<ActivityFilters>) => {
      const merged: ActivityFilters = { ...filters, ...next };
      if (!('page' in next)) merged.page = 1;
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(merged)) {
        if (value === null || value === undefined || value === '' || value === false) continue;
        if (key === 'page' && value === 1) continue;
        if ((defaultFilters as unknown as Record<string, unknown>)[key] === value) continue;
        search.set(key, String(value));
      }
      setParams(search, { replace: true });
    },
    [filters, setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  const items = data?.items ?? [];
  const pageIds = items.map((item) => item.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = pageIds.some((id) => selected.has(id));

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const selectAllMatching = useMutation({
    mutationFn: () => post<{ ids: string[]; total: number; capped: boolean; maxItems: number }>('/api/activity/ids', { filters }),
    onSuccess: (result) => {
      setSelected(new Set(result.ids));
      if (result.capped) {
        notify(
          `Selected the first ${result.maxItems.toLocaleString()} of ${result.total.toLocaleString()} matches`,
          'info',
          'A single job is capped. Run it again afterwards for the remainder.',
        );
      } else {
        notify(`Selected ${result.total.toLocaleString()} matching posts`, 'success');
      }
    },
    onError: (err: Error) => notify(err.message, 'error'),
  });

  const saveRule = useMutation({
    mutationFn: () => post('/api/rules', { name: ruleName.trim(), filters }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rules'] });
      setSaveOpen(false);
      setRuleName('');
      notify('Rule saved', 'success', 'You can apply it again from Saved rules.');
    },
    onError: (err: Error) => notify(err.message, 'error'),
  });

  const openFilteredCleanup = () => setDialog({ open: true, filters });
  const openSelectionCleanup = () => setDialog({ open: true, postIds: [...selected] });

  const autoOpened = useRef(false);
  useEffect(() => {
    if (params.get('cleanup') === '1' && data && !autoOpened.current) {
      autoOpened.current = true;
      setDialog({ open: true, filters });
    }
  }, [params, data, filters]);

  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const to = Math.min(filters.page * filters.pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Explore"
        title="Activity explorer"
        description="Every indexed post, reply and repost. Use filters to find a slice, then preview a cleanup before anything is touched."
        actions={
          <>
            <Button
              variant="ghost"
              icon={<BookmarkPlus className="size-4" />}
              onClick={() => setSaveOpen(true)}
              className="hidden sm:inline-flex"
            >
              Save as rule
            </Button>
            <Button variant="secondary" size="md" onClick={() => setFilterOpen(true)} icon={<Filter className="size-4" />} className="lg:hidden">
              Filters
            </Button>
            <Button variant="primary" icon={<Eraser className="size-4" />} onClick={openFilteredCleanup} disabled={total === 0}>
              Clean this view
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-5 lg:flex-row">
        <aside className="hidden w-[264px] shrink-0 lg:block">
          <div className="sticky top-[84px] card max-h-[calc(100vh-108px)] overflow-y-auto p-4">
            <FilterPanel
              filters={filters}
              facets={data?.facets}
              onChange={update}
              onReset={reset}
              showCategory={false}
              footer={
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setSaveOpen(true)} icon={<BookmarkPlus className="size-3.5" />}>
                  Save these filters
                </Button>
              }
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex gap-1 overflow-x-auto no-scrollbar">
            {categories.map((category) => {
              const active = filters.category === category;
              return (
                <button
                  key={category}
                  onClick={() => update({ category, page: 1 })}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                    active ? 'bg-accent text-accent-ink' : 'text-ink-soft hover:bg-raised hover:text-ink',
                  )}
                  aria-pressed={active}
                >
                  {categoryLabels[category]}
                  <span className={cn('tabular text-[10.5px]', active ? 'text-accent-ink/70' : 'text-muted')}>
                    {formatNumber(data?.facets?.[category] ?? 0)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
            <Checkbox
              checked={allPageSelected}
              indeterminate={!allPageSelected && somePageSelected}
              onChange={togglePage}
              label="Select every post on this page"
              size="sm"
            />
            <span className="text-[12px] text-ink-soft">
              {selected.size > 0 ? (
                <>
                  <span className="font-semibold text-ink">{selected.size.toLocaleString()}</span> selected
                </>
              ) : (
                <>
                  {total > 0 ? (
                    <>
                      <span className="font-semibold text-ink">{from.toLocaleString()}–{to.toLocaleString()}</span> of{' '}
                      {total.toLocaleString()}
                    </>
                  ) : (
                    'No results'
                  )}
                </>
              )}
            </span>
            {selected.size === 0 && total > 0 && (
              <button
                onClick={() => selectAllMatching.mutate()}
                disabled={selectAllMatching.isPending}
                className="text-[11.5px] font-medium text-accent hover:underline disabled:opacity-50"
              >
                {selectAllMatching.isPending ? 'Selecting…' : `Select all ${total.toLocaleString()} matching`}
              </button>
            )}
            <div className="ml-auto flex items-center gap-1.5">
              {isFetching && <span className="text-[10.5px] text-muted">Updating…</span>}
              <Button variant="ghost" size="sm" onClick={() => setSaveOpen(true)} icon={<BookmarkPlus className="size-3.5" />} className="sm:hidden">
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="size-3.5" />}>
                Reset
              </Button>
            </div>
          </div>

          {isError && (
            <Callout tone="danger" title="Could not load activity" className="mb-3">
              {(error as Error).message}{' '}
              <button onClick={() => refetch()} className="font-medium underline">
                Retry
              </button>
            </Callout>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[132px] rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<SearchX className="size-5" />}
                title="Nothing matches these filters"
                description="Try widening the date range, clearing the search, or switching category. Filters apply to already-indexed posts."
                action={
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={reset} icon={<RotateCcw className="size-3.5" />}>
                      Reset filters
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setFilterOpen(true)} className="lg:hidden">
                      Edit filters
                    </Button>
                  </div>
                }
              />
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {items.map((post: Post) => (
                  <li key={post.id}>
                    <PostCard
                      post={post}
                      selectable
                      selected={selected.has(post.id)}
                      onToggle={toggle}
                      onPreview={(item) => setDialog({ open: true, postIds: [item.id] })}
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2">
                <p className="text-[11.5px] text-muted">
                  Page {filters.page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <IconButton
                    label="Previous page"
                    onClick={() => update({ page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page <= 1}
                  >
                    <ChevronLeft className="size-4" />
                  </IconButton>
                  <span className="px-2 text-[11.5px] tabular text-ink-soft">
                    {from}–{to}
                  </span>
                  <IconButton
                    label="Next page"
                    onClick={() => update({ page: Math.min(totalPages, filters.page + 1) })}
                    disabled={!data?.hasMore}
                  >
                    <ChevronRight className="size-4" />
                  </IconButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 lg:pl-64">
          <div className="pointer-events-auto flex w-full max-w-2xl animate-fade-up items-center gap-3 rounded-xl border border-line bg-surface/95 px-4 py-3 shadow-float backdrop-blur">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <ListChecks className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-ink">{selected.size.toLocaleString()} selected</p>
              <p className="text-[11px] text-muted">Hand-picked items only. Filters are ignored for this action.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 className="size-3.5" />} onClick={openSelectionCleanup}>
              Review
            </Button>
          </div>
        </div>
      )}

      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[320px] max-w-[92vw] animate-fade-up flex-col border-l border-line bg-surface shadow-float">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <SlidersHorizontal className="size-4" /> Filters
              </p>
              <IconButton label="Close filters" onClick={() => setFilterOpen(false)}>
                <X className="size-4" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel filters={filters} facets={data?.facets} onChange={update} onReset={reset} />
            </div>
            <div className="border-t border-line p-3">
              <Button variant="primary" className="w-full" onClick={() => setFilterOpen(false)}>
                Show {total.toLocaleString()} results
              </Button>
            </div>
          </div>
        </div>
      )}

      <CleanupDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        filters={dialog.postIds ? undefined : dialog.filters ?? filters}
        postIds={dialog.postIds}
      />

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save this view as a rule"
        description="Rules store your filters so you can reapply them later. They never delete anything automatically."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={saveRule.isPending}
              disabled={!ruleName.trim()}
              onClick={() => saveRule.mutate()}
            >
              Save rule
            </Button>
          </div>
        }
      >
        <Field label="Rule name" hint="e.g. Old replies before 2022, or Low-engagement posts">
          <Input
            autoFocus
            value={ruleName}
            onChange={(event) => setRuleName(event.target.value)}
            placeholder="Name this filter set"
            maxLength={80}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && ruleName.trim()) saveRule.mutate();
            }}
          />
        </Field>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge tone="outline">{categoryLabels[filters.category]}</Badge>
          {filters.q && <Badge tone="outline">“{filters.q}”</Badge>}
          {filters.from && <Badge tone="outline">from {filters.from}</Badge>}
          {filters.to && <Badge tone="outline">to {filters.to}</Badge>}
          {filters.minEngagement !== null && <Badge tone="outline">min eng. {filters.minEngagement}</Badge>}
          {filters.maxEngagement !== null && <Badge tone="outline">max eng. {filters.maxEngagement}</Badge>}
        </div>
      </Modal>
    </div>
  );
}
