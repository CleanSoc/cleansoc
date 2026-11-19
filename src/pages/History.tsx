import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  Eraser,
  MinusCircle,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { get, post } from '../lib/api';
import type { HistoryResponse } from '../lib/types';
import { downloadJson, formatDateTime, formatNumber, relativeTime } from '../lib/format';
import { Badge, Button, EmptyState, Skeleton, useToast } from '../components/ui';
import { PageHeader, SectionHeading } from '../components/PageHeader';
import { actionLabel, JobProgress, JobStatusBadge } from '../components/JobBits';

export function HistoryPage() {
  const history = useQuery({
    queryKey: ['history'],
    queryFn: () => get<HistoryResponse>('/api/history'),
  });
  const overview = useQuery({
    queryKey: ['history', 'overview'],
    queryFn: () => get<{ deleted: number; failed: number; jobs: number; reviewed: number }>('/api/history/overview'),
  });

  if (history.isLoading) {
    return (
      <div>
        <Skeleton className="mb-6 h-10 w-64" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-5 h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (history.isError) {
    return (
      <div className="card p-6">
        <p className="text-[13px] text-danger">{(history.error as Error).message}</p>
      </div>
    );
  }

  const jobs = history.data?.jobs ?? [];
  const activity = history.data?.activity ?? [];

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Audit trail"
        title="Cleanup history"
        description="Every run, its outcome, and every action taken in this workspace. The activity log is append-only."
        actions={
          <Link to="/app/settings">
            <Button variant="secondary" icon={<Download className="size-4" />}>
              Export data
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <OverviewTile label="Posts removed" value={overview.data?.deleted ?? 0} icon={<Trash2 className="size-4" />} tone="success" />
        <OverviewTile label="Failed items" value={overview.data?.failed ?? 0} icon={<XCircle className="size-4" />} tone="danger" />
        <OverviewTile label="Cleanup runs" value={overview.data?.jobs ?? 0} icon={<Eraser className="size-4" />} tone="accent" />
        <OverviewTile label="Posts reviewed" value={overview.data?.reviewed ?? 0} icon={<ShieldCheck className="size-4" />} tone="neutral" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <section className="card p-5">
          <SectionHeading title="Runs" description="Newest first. Open a run for its detailed failure report." />
          {jobs.length === 0 ? (
            <EmptyState
              icon={<Eraser className="size-5" />}
              title="No cleanup runs yet"
              description="Start from the activity explorer or the cleanup studio."
              className="py-10"
            />
          ) : (
            <ul className="divide-y divide-line">
              {jobs.map((job) => (
                <li key={job.id} className="py-3 first:pt-0 last:pb-0">
                  <Link to={`/app/cleanup/${job.id}`} className="group block">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-ink group-hover:text-accent">
                        {job.name}
                      </p>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {actionLabel(job.action)} · {job.total.toLocaleString()} items · {formatDateTime(job.createdAt)}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <JobProgress job={job} className="flex-1" />
                      <div className="flex shrink-0 gap-1.5 text-[10.5px] tabular">
                        <span className="text-success">{job.succeeded.toLocaleString()} ok</span>
                        {job.failed > 0 && <span className="text-danger">{job.failed.toLocaleString()} failed</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <SectionHeading title="Activity log" description="Append-only record of actions in this workspace." />
          {activity.length === 0 ? (
            <EmptyState icon={<Activity className="size-5" />} title="No activity yet" className="py-10" />
          ) : (
            <ol className="relative space-y-3 border-l border-line pl-4">
              {activity.slice(0, 40).map((entry) => (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full border-2 border-surface bg-line-strong" />
                  <p className="text-[12px] font-medium text-ink">{actionLabelFor(entry.action)}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted">{detailFor(entry.action, entry.detail)}</p>
                  <p className="mt-0.5 text-[10px] text-muted/80">{formatDateTime(entry.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <p className="text-[11.5px] text-muted">
          Need a portable copy? Export includes every cached post, job and status as JSON.
        </p>
        <Link to="/app/settings">
          <Button variant="secondary" size="sm" icon={<Download className="size-3.5" />}>
            Export from settings
          </Button>
        </Link>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-muted">
        <Clock3 className="size-3" /> Times are shown in your local timezone. Log entries cannot be edited or deleted
        individually.
        {jobs.length > 0 && (
          <>
            <span className="text-line-strong">·</span>
            <ArrowUpRight className="size-3" /> Oldest run {relativeTime(jobs[jobs.length - 1].createdAt)}
          </>
        )}
      </p>
    </div>
  );
}

function OverviewTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'success' | 'danger' | 'accent' | 'neutral';
}) {
  const tones = {
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    accent: 'bg-accent-soft text-accent',
    neutral: 'bg-raised text-muted',
  };
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10.5px] text-muted">{label}</p>
        <p className="text-[19px] font-semibold leading-tight tabular text-ink">{formatNumber(value)}</p>
      </div>
    </div>
  );
}

function actionLabelFor(action: string): string {
  const map: Record<string, string> = {
    'auth.demo': 'Demo workspace created',
    'auth.logout': 'Signed out',
    'account.connected': 'X account connected',
    'account.disconnected': 'Account disconnected',
    'account.switched': 'Active account changed',
    'sync.started': 'Timeline sync started',
    'sync.completed': 'Timeline sync completed',
    'cleanup.started': 'Cleanup run started',
    'cleanup.previewed': 'Cleanup confirmed',
    'cleanup.completed': 'Cleanup run finished',
    'cleanup.cancelled': 'Cleanup run cancelled',
    'cleanup.retry': 'Failed items retried',
    'rules.saved': 'Filter rule saved',
    'rules.deleted': 'Filter rule deleted',
    'archive.imported': 'X archive imported',
    'archive.failed': 'Archive import failed',
    'data.exported': 'Data exported',
    'data.deleted': 'Workspace data deleted',
  };
  return map[action] ?? action.replace(/[._]/g, ' ');
}

function detailFor(action: string, detail: Record<string, unknown>): string {
  if (!detail) return '';
  if (typeof detail.description === 'string') return detail.description;
  if (typeof detail.username === 'string') return `@${detail.username}`;
  if (typeof detail.name === 'string') return detail.name;
  if (action === 'cleanup.completed') {
    if (typeof detail.failed === 'number') {
      return detail.failed > 0 ? `${detail.failed} item${detail.failed === 1 ? '' : 's'} failed` : 'All items processed successfully';
    }
    return '';
  }
  if (action === 'archive.imported') {
    return `${detail.inserted ?? 0} inserted, ${detail.updated ?? 0} updated`;
  }
  if (typeof detail.total === 'number') return `${detail.total} items`;
  return '';
}
