import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  PauseCircle,
  Play,
  Repeat2,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { get, post } from '../lib/api';
import type { JobDetail } from '../lib/types';
import { cn, formatDateTime, formatNumber, relativeTime } from '../lib/format';
import { Badge, Button, Callout, EmptyState, ProgressBar, Skeleton, useToast } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { actionLabel, JobStatusBadge } from '../components/JobBits';

const activeStatuses = ['queued', 'running', 'paused'];

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();

  const query = useQuery({
    queryKey: ['cleanup', 'job', jobId],
    queryFn: () => get<JobDetail>(`/api/cleanup/jobs/${jobId}`),
    enabled: Boolean(jobId),
    refetchInterval: (q) => (q.state.data && activeStatuses.includes(q.state.data.status) ? 2000 : false),
  });

  const job = query.data;

  const cancel = useMutation({
    mutationFn: () => post<JobDetail>(`/api/cleanup/jobs/${jobId}/cancel`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cleanup'] });
      notify('Job cancelled', 'info');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const retry = useMutation({
    mutationFn: () => post<JobDetail>(`/api/cleanup/jobs/${jobId}/retry-failed`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cleanup'] });
      notify('Retrying failed items', 'info');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const resume = useMutation({
    mutationFn: () => post<JobDetail>(`/api/cleanup/jobs/${jobId}/resume`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cleanup'] });
      notify('Job resumed', 'success');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (query.isError || !job) {
    return (
      <div className="card">
        <EmptyState
          icon={<XCircle className="size-5" />}
          title="Cleanup run not found"
          description="It may belong to another workspace, or the link is wrong."
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate('/app/history')}>
              Back to history
            </Button>
          }
        />
      </div>
    );
  }

  const active = activeStatuses.includes(job.status);
  const finished = job.status === 'completed' || job.status === 'completed_with_errors';
  const canCancel = job.status === 'queued' || job.status === 'running' || job.status === 'paused';
  const canRetry = job.failed > 0 && !active;
  const canResume = job.status === 'paused';

  return (
    <div className="animate-fade-up">
      <Link
        to="/app/history"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Cleanup history
      </Link>

      <PageHeader
        eyebrow="Cleanup run"
        title={job.name}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <JobStatusBadge status={job.status} />
            <span>{actionLabel(job.action)}</span>
            <span className="text-line-strong">·</span>
            <span>Started {job.startedAt ? relativeTime(job.startedAt) : 'queued'}</span>
            {job.isDemo && <Badge tone="warn">Simulated on demo data</Badge>}
          </span>
        }
        actions={
          <>
            {canResume && (
              <Button variant="secondary" icon={<Play className="size-4" />} onClick={() => resume.mutate()} loading={resume.isPending}>
                Resume now
              </Button>
            )}
            {canRetry && (
              <Button variant="secondary" icon={<RotateCcw className="size-4" />} onClick={() => retry.mutate()} loading={retry.isPending}>
                Retry {job.failed} failed
              </Button>
            )}
            {canCancel && (
              <Button variant="dangerOutline" icon={<XCircle className="size-4" />} onClick={() => cancel.mutate()} loading={cancel.isPending}>
                Cancel job
              </Button>
            )}
          </>
        }
      />

      {job.pending > 0 && !active && job.status !== 'cancelled' && (
        <Callout tone="info" className="mb-4" title="This report is still being written">
          {job.pending.toLocaleString()} items remain. Refresh in a moment.
        </Callout>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Progress</h2>
                <p className="mt-0.5 text-[11.5px] text-muted">
                  {job.processed.toLocaleString()} of {job.total.toLocaleString()} items processed
                </p>
              </div>
              <span className="text-[28px] font-semibold leading-none tracking-[-0.03em] tabular text-ink">
                {job.progress}%
              </span>
            </div>
            <ProgressBar
              value={job.progress}
              animated={job.status === 'running'}
              tone={job.failed > 0 && !active ? 'warn' : 'accent'}
              className="mt-4"
            />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <CountTile label="Removed" value={job.succeeded} tone="success" icon={<CheckCircle2 className="size-3.5" />} />
              <CountTile label="Failed" value={job.failed} tone="danger" icon={<XCircle className="size-3.5" />} />
              <CountTile label="Skipped" value={job.skipped} tone="muted" icon={<Clock3 className="size-3.5" />} />
              <CountTile label="Pending" value={job.pending} tone="muted" icon={<Loader2 className="size-3.5" />} />
            </div>

            {job.status === 'paused' && (
              <Callout tone="warn" className="mt-4" icon={<PauseCircle className="size-4" />} title="Paused">
                {job.error ?? 'Waiting to resume.'}
                {job.resumeAt && ` Scheduled for ${formatDateTime(job.resumeAt)}.`} The worker resumes automatically when
                X's rate-limit window resets. You can also press Resume now.
              </Callout>
            )}

            {job.status === 'running' && (
              <p className="mt-4 flex items-center gap-2 text-[11.5px] text-muted">
                <Loader2 className="size-3.5 animate-spin text-accent" />
                {job.isDemo
                  ? 'Simulating deletions locally. No requests are sent to X.'
                  : 'Processing sequentially. X allows roughly 50 deletions per 15 minutes, so larger jobs take a while.'}
              </p>
            )}

            {job.error && job.status !== 'paused' && (
              <Callout tone="danger" className="mt-4" title="Last error">
                {job.error}
              </Callout>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-[13px] font-semibold text-ink">Failure report</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              Failures never block the rest of the run. Retry once the cause is resolved.
            </p>
            {job.failedItems.length === 0 ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-raised/60 px-3 py-3 text-[12px] text-muted">
                <CheckCircle2 className="size-4 text-success" /> No failures recorded.
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {job.failedItems.slice(0, 20).map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-2.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-danger-soft text-danger">
                      <XCircle className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-ink">
                        {item.kind === 'repost' ? 'Repost' : item.kind === 'reply' ? 'Reply' : 'Post'}{' '}
                        <span className="font-mono text-[11px] text-muted">{item.xPostId}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] leading-4 text-muted">{item.error ?? 'Unknown error'}</p>
                    </div>
                    <Badge tone="outline">{item.attempts} {item.attempts === 1 ? 'try' : 'tries'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-[13px] font-semibold text-ink">Recent items</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">The last processed items, newest first.</p>
            {job.recentItems.length === 0 ? (
              <p className="mt-4 text-[12px] text-muted">Nothing processed yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {job.recentItems.slice(0, 20).map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2 text-[11.5px]">
                    <ItemStatus status={item.status} />
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">{item.xPostId}</span>
                    <span className="text-muted">{item.processedAt ? relativeTime(item.processedAt) : '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-[13px] font-semibold text-ink">Run details</h2>
            <dl className="mt-3 space-y-2.5 text-[11.5px]">
              <Detail label="Job ID" value={<span className="font-mono text-[10.5px]">{job.id}</span>} />
              <Detail label="Action" value={actionLabel(job.action)} />
              <Detail label="Created" value={formatDateTime(job.createdAt)} />
              <Detail label="Started" value={job.startedAt ? formatDateTime(job.startedAt) : 'Not yet'} />
              <Detail label="Finished" value={job.finishedAt ? formatDateTime(job.finishedAt) : 'In progress'} />
              <Detail label="Total" value={formatNumber(job.total)} />
              <Detail
                label="Selection"
                value={typeof job.criteria.description === 'string' ? job.criteria.description : 'Custom selection'}
              />
            </dl>
          </section>

          {finished && (
            <section
              className={cn(
                'card p-5',
                job.failed > 0 ? 'border-warn/35 bg-warn-soft/30' : 'border-success/30 bg-success-soft/30',
              )}
            >
              <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                {job.failed > 0 ? (
                  <AlertTriangle className="size-4 text-warn" />
                ) : (
                  <CheckCircle2 className="size-4 text-success" />
                )}
                Summary
              </h2>
              <p className="mt-2 text-[12.5px] leading-5 text-ink-soft">
                {job.succeeded.toLocaleString()} {job.succeeded === 1 ? 'item was' : 'items were'} removed
                {job.skipped > 0 && `, ${job.skipped.toLocaleString()} skipped`}
                {job.failed > 0 ? `, and ${job.failed.toLocaleString()} failed.` : '.'}
                {job.failed > 0
                  ? ' Review the failure report, then retry when ready.'
                  : ' The deletion is final on X.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/app/activity?includeDeleted=true&sort=newest">
                  <Button variant="secondary" size="sm">
                    View removed posts
                  </Button>
                </Link>
                <Link to="/app/cleanup">
                  <Button variant="ghost" size="sm">
                    Start another run
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {job.isDemo && (
            <Callout tone="info" title="Demo simulation">
              This run used synthetic data. Each item was simulated locally with a deterministic failure rate; no requests
              were sent to X.
            </Callout>
          )}

          <Callout tone="warn" title="Irreversible" icon={<Trash2 className="size-4" />}>
            CleanSoc cannot restore deleted posts, and neither can X. Reposts are removed by undoing them, which leaves the
            original post intact.
          </Callout>
        </div>
      </div>
    </div>
  );
}

function CountTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: 'success' | 'danger' | 'muted';
  icon: React.ReactNode;
}) {
  const tones = {
    success: 'text-success bg-success-soft',
    danger: 'text-danger bg-danger-soft',
    muted: 'text-muted bg-raised',
  };
  return (
    <div className="rounded-lg border border-line px-3 py-2.5">
      <span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium', tones[tone])}>
        {icon}
        {label}
      </span>
      <p className="mt-1.5 text-[19px] font-semibold leading-none tabular text-ink">{value.toLocaleString()}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-ink-soft">{value}</dd>
    </div>
  );
}

function ItemStatus({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle2 className="size-3.5 shrink-0 text-success" />;
  if (status === 'failed') return <XCircle className="size-3.5 shrink-0 text-danger" />;
  if (status === 'skipped') return <Clock3 className="size-3.5 shrink-0 text-muted" />;
  return <Repeat2 className="size-3.5 shrink-0 text-muted" />;
}
