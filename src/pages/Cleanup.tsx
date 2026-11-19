import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eraser,
  Loader2,
  PauseCircle,
  Repeat2,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { get, post } from '../lib/api';
import type { ActivityFilters, Job, PreviewResult } from '../lib/types';
import { defaultFilters } from '../lib/types';
import { formatNumber, pluralize, relativeTime } from '../lib/format';
import { Badge, Button, Callout, EmptyState, ProgressBar, Skeleton, useToast } from '../components/ui';
import { PageHeader, SectionHeading } from '../components/PageHeader';
import { FilterPanel } from '../components/FilterPanel';
import { PostCard } from '../components/PostCard';
import { CleanupDialog } from '../components/CleanupDialog';
import { actionLabel, JobStatusBadge } from '../components/JobBits';

const activeStatuses = ['queued', 'running', 'paused'];

export function CleanupPage() {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [filters, setFilters] = useState<ActivityFilters>({ ...defaultFilters, category: 'all', sort: 'oldest' });
  const [debounced, setDebounced] = useState(filters);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(filters), 350);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const previewKey = useMemo(
    () =>
      JSON.stringify({
        category: debounced.category,
        q: debounced.q,
        from: debounced.from,
        to: debounced.to,
        mediaType: debounced.mediaType,
        minLikes: debounced.minLikes,
        maxLikes: debounced.maxLikes,
        minEngagement: debounced.minEngagement,
        maxEngagement: debounced.maxEngagement,
        source: debounced.source,
        sort: debounced.sort,
      }),
    [debounced],
  );

  const preview = useQuery({
    queryKey: ['cleanup', 'preview', previewKey],
    queryFn: () => post<PreviewResult>('/api/cleanup/preview', { filters: debounced }),
    placeholderData: (previous) => previous,
  });

  const jobs = useQuery({
    queryKey: ['cleanup', 'jobs'],
    queryFn: () => get<{ jobs: Job[] }>('/api/cleanup/jobs'),
    refetchInterval: (query) =>
      query.state.data?.jobs.some((job) => activeStatuses.includes(job.status)) ? 2500 : false,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => post<Job>(`/api/cleanup/jobs/${id}/cancel`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cleanup'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notify('Job cancelled', 'info', 'Pending items were skipped. Already-deleted posts stay deleted.');
    },
    onError: (err: Error) => notify(err.message, 'error'),
  });

  const retry = useMutation({
    mutationFn: (id: string) => post<Job>(`/api/cleanup/jobs/${id}/retry-failed`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cleanup'] });
      notify('Retrying failed items', 'info');
    },
    onError: (err: Error) => notify(err.message, 'error'),
  });

  const data = preview.data;
  const activeJobs = (jobs.data?.jobs ?? []).filter((job) => activeStatuses.includes(job.status));
  const finishedJobs = (jobs.data?.jobs ?? []).filter((job) => !activeStatuses.includes(job.status)).slice(0, 10);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Cleanup studio"
        title="Clean up a slice of your timeline"
        description="Choose what to target, check the live count, and launch a job that runs in the background. You can pause by cancelling at any moment."
        actions={
          <Link to="/app/activity">
            <Button variant="secondary" icon={<ArrowRight className="size-4" />}>
              Explore individually
            </Button>
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Step index="01" title="Choose filters" body="Category, date range, keyword or engagement. Reposts are undone rather than deleted." />
        <Step index="02" title="Preview, then confirm" body="The exact snapshot is locked when the job starts. Nothing changes while you review." />
        <Step index="03" title="Let the worker run" body="X allows ~50 deletions per 15 minutes. Jobs pause and resume automatically." />
      </div>

      {activeJobs.length > 0 && (
        <div className="mb-5 space-y-2">
          {activeJobs.map((job) => (
            <ActiveJobCard
              key={job.id}
              job={job}
              onCancel={() => cancel.mutate(job.id)}
              cancelling={cancel.isPending && cancel.variables === job.id}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-5 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-[280px]">
          <div className="card lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto p-4">
            <FilterPanel
              filters={filters}
              onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
              onReset={() => setFilters({ ...defaultFilters, category: 'all', sort: 'oldest' })}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-raised/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-danger-soft text-danger">
                  <Eraser className="size-4" />
                </span>
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">Live preview</p>
                  <p className="text-[11px] text-muted">Updates as you adjust filters · nothing is deleted</p>
                </div>
              </div>
              {preview.isFetching && <span className="text-[10.5px] text-muted">Counting…</span>}
            </div>

            <div className="p-5">
              {preview.isError && (
                <Callout tone="danger" title="Preview failed">
                  {(preview.error as Error).message}
                </Callout>
              )}

              {!data && preview.isPending && (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-40" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-20 w-full" />
                </div>
              )}

              {data && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Posts matching</p>
                      <p className="mt-1 text-[44px] font-semibold leading-none tracking-[-0.04em] text-ink tabular">
                        {formatNumber(data.total)}
                      </p>
                      <p className="mt-1.5 text-[12px] text-muted">{data.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <PreviewStat label="Posts" value={data.posts} />
                      <PreviewStat label="Reposts" value={data.reposts} icon={<Repeat2 className="size-3 text-muted" />} />
                      <PreviewStat label="Est. time" value={data.simulated ? 'Instant' : `~${data.estimatedMinutes}m`} raw />
                    </div>
                  </div>

                  {data.total === 0 ? (
                    <Callout tone="info" className="mt-4">
                      No posts match these filters. Widen the date range or clear the keyword.
                    </Callout>
                  ) : (
                    <>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Button
                          variant="danger"
                          icon={<Trash2 className="size-4" />}
                          onClick={() => setDialogOpen(true)}
                        >
                          Review and start cleanup
                        </Button>
                        <span className="text-[11px] text-muted">
                          Processed in batches of {data.maxItems.toLocaleString()} max per job
                        </span>
                      </div>

                      {data.truncated && (
                        <Callout tone="warn" className="mt-4" title="Larger than one job">
                          Only the first {data.maxItems.toLocaleString()} matches will be included. Run again afterwards for
                          the rest.
                        </Callout>
                      )}

                      <div className="mt-5">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                          Sample ({Math.min(data.sample.length, 3)} of {data.willProcess.toLocaleString()})
                        </p>
                        <div className="space-y-2">
                          {data.sample.slice(0, 3).map((item) => (
                            <PostCard key={item.id} post={item} compact />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </section>

          <section className="card p-5">
            <SectionHeading
              title="Recent runs"
              description="Every run keeps its own snapshot, report and failure list."
              action={
                <Link to="/app/history" className="text-[11.5px] font-medium text-accent hover:underline">
                  Full history
                </Link>
              }
            />
            {jobs.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : finishedJobs.length === 0 ? (
              <EmptyState
                icon={<Eraser className="size-5" />}
                title="No runs yet"
                description="Your first cleanup will appear here with a full report."
                className="py-8"
              />
            ) : (
              <ul className="divide-y divide-line">
                {finishedJobs.map((job) => (
                  <li key={job.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <Link to={`/app/cleanup/${job.id}`} className="truncate text-[12.5px] font-medium text-ink hover:text-accent">
                        {job.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {actionLabel(job.action)} · {job.succeeded.toLocaleString()} done
                        {job.failed > 0 ? ` · ${job.failed} failed` : ''} · {relativeTime(job.createdAt)}
                      </p>
                    </div>
                    <JobStatusBadge status={job.status} />
                    <div className="w-24">
                      <ProgressBar value={job.progress} tone={job.failed > 0 ? 'warn' : 'accent'} />
                    </div>
                    {job.failed > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => retry.mutate(job.id)} loading={retry.isPending && retry.variables === job.id}>
                        <RotateCcw className="size-3.5" /> Retry
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Callout tone="warn" title="What the X API does and does not allow" icon={<ShieldAlert className="size-4" />}>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] leading-4">
              <li>Deletes are limited to roughly 50 per 15 minutes per account. Long jobs pause and resume automatically.</li>
              <li>Only posts owned by the connected account can be removed through the API.</li>
              <li>Removing a repost uses the un-repost endpoint; the original post is never touched.</li>
              <li>Deleted posts cannot be restored by CleanSoc or by X.</li>
            </ul>
          </Callout>
        </div>
      </div>

      <CleanupDialog open={dialogOpen} onClose={() => setDialogOpen(false)} filters={filters} />
    </div>
  );
}

function Step({ index, title, body }: { index: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="font-display text-[18px] leading-none text-accent">{index}</span>
        <p className="text-[12.5px] font-semibold text-ink">{title}</p>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-4 text-muted">{body}</p>
    </div>
  );
}

function PreviewStat({ label, value, icon, raw }: { label: string; value: number | string; icon?: React.ReactNode; raw?: boolean }) {
  return (
    <div>
      <p className="text-[10.5px] text-muted">{label}</p>
      <p className="mt-0.5 flex items-center justify-center gap-1 text-[16px] font-semibold tabular text-ink">
        {icon}
        {raw ? value : Number(value).toLocaleString()}
      </p>
    </div>
  );
}

function ActiveJobCard({ job, onCancel, cancelling }: { job: Job; onCancel: () => void; cancelling: boolean }) {
  return (
    <div className="card border-accent/30 bg-accent-soft/25 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-ink">
          {job.status === 'paused' ? <PauseCircle className="size-4" /> : <Loader2 className="size-4 animate-spin" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/app/cleanup/${job.id}`} className="truncate text-[13px] font-semibold text-ink hover:text-accent">
              {job.name}
            </Link>
            <JobStatusBadge status={job.status} />
            {job.isDemo && <Badge tone="warn">Simulated</Badge>}
          </div>
          <p className="mt-0.5 text-[11px] text-muted">
            {job.processed.toLocaleString()} of {job.total.toLocaleString()} processed
            {job.failed > 0 && ` · ${job.failed} failed`}
            {job.resumeAt && ` · resumes ${new Date(job.resumeAt).toLocaleTimeString()}`}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} loading={cancelling}>
          Cancel
        </Button>
        <Button variant="secondary" size="sm" onClick={() => window.location.assign(`/app/cleanup/${job.id}`)}>
          Details
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={job.progress} animated={job.status === 'running'} className="flex-1" />
        <span className="text-[11px] tabular text-muted">{job.progress}%</span>
      </div>
      {job.error && <p className="mt-2 text-[11px] text-warn">{job.error}</p>}
      {job.status === 'paused' && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
          <Clock3 className="size-3.5" /> X rate limit or authorization pause. It resumes on its own when possible.
        </p>
      )}
      {job.status === 'running' && job.succeeded > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
          <CheckCircle2 className="size-3.5 text-success" /> {job.succeeded.toLocaleString()} {pluralize(job.succeeded, 'item')} removed so far
        </p>
      )}
      <span className="hidden">
        <CalendarClock />
      </span>
    </div>
  );
}
