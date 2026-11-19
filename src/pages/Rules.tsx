import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpRight, BookmarkPlus, Eraser, ListFilter, Trash2 } from 'lucide-react';
import { del, get } from '../lib/api';
import type { Rule } from '../lib/types';
import { categoryLabels, filtersToQuery, formatDate } from '../lib/format';
import { Badge, Button, EmptyState, Skeleton, useToast } from '../components/ui';
import { PageHeader } from '../components/PageHeader';

export function RulesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: () => get<{ rules: Rule[] }>('/api/rules'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del(`/api/rules/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['rules'] });
      notify('Rule deleted', 'info');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Automation"
        title="Saved rules"
        description="Reusable filter sets. Applying a rule opens a preview — rules never delete anything on their own."
        actions={
          <Button variant="primary" icon={<BookmarkPlus className="size-4" />} onClick={() => navigate('/app/activity')}>
            Create from filters
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : !data || data.rules.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<ListFilter className="size-5" />}
            title="No saved rules yet"
            description="Set up a filter in the activity explorer, then choose “Save as rule”. Useful for recurring cleanups like old replies or zero-engagement posts."
            action={
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/activity')}>
                Open activity explorer
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.rules.map((rule) => (
            <article key={rule.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-semibold text-ink">{rule.name}</h2>
                  <p className="mt-0.5 text-[11px] text-muted">Saved {formatDate(rule.createdAt)}</p>
                </div>
                <Badge tone="accent">{categoryLabels[rule.filters.category ?? 'all']}</Badge>
              </div>

              <div className="mt-3 flex flex-1 flex-wrap content-start gap-1.5">
                {describe(rule).map((chip) => (
                  <span
                    key={chip}
                    className="rounded-md border border-line bg-raised px-2 py-1 text-[10.5px] font-medium text-ink-soft"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <button
                  onClick={() => remove.mutate(rule.id)}
                  disabled={remove.isPending && remove.variables === rule.id}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] text-muted transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
                <div className="flex gap-2">
                  <Link to={`/app/activity?${filtersToQuery(rule.filters)}`}>
                    <Button variant="secondary" size="sm" icon={<ArrowUpRight className="size-3.5" />}>
                      Review
                    </Button>
                  </Link>
                  <Link to={`/app/activity?${filtersToQuery(rule.filters)}&cleanup=1`}>
                    <Button variant="primary" size="sm" icon={<Eraser className="size-3.5" />}>
                      Clean
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function describe(rule: Rule): string[] {
  const filters = rule.filters ?? {};
  const chips: string[] = [];
  if (filters.q) chips.push(`“${filters.q}”`);
  if (filters.from) chips.push(`from ${filters.from}`);
  if (filters.to) chips.push(`to ${filters.to}`);
  if (filters.mediaType && filters.mediaType !== 'any') chips.push(`${filters.mediaType.replace('_', ' ')} only`);
  if (filters.minLikes !== null && filters.minLikes !== undefined) chips.push(`≥ ${filters.minLikes} likes`);
  if (filters.maxLikes !== null && filters.maxLikes !== undefined) chips.push(`≤ ${filters.maxLikes} likes`);
  if (filters.minEngagement !== null && filters.minEngagement !== undefined) chips.push(`≥ ${filters.minEngagement} eng.`);
  if (filters.maxEngagement !== null && filters.maxEngagement !== undefined) chips.push(`≤ ${filters.maxEngagement} eng.`);
  if (filters.source && filters.source !== 'any') chips.push(`${filters.source} data`);
  if (filters.sort && filters.sort !== 'newest') chips.push(`sorted by ${filters.sort.replace('_', ' ')}`);
  if (chips.length === 0) chips.push('No extra filters');
  return chips;
}
