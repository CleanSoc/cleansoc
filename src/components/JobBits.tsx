import { AlertTriangle, CheckCircle2, CircleDashed, Clock3, PauseCircle, XCircle } from 'lucide-react';
import type { Job, JobStatus } from '../lib/types';
import { Badge } from './ui';

const statusMap: Record<
  JobStatus,
  { label: string; tone: 'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'outline'; icon: React.ReactNode }
> = {
  queued: { label: 'Queued', tone: 'outline', icon: <Clock3 className="size-3" /> },
  running: { label: 'Running', tone: 'accent', icon: <CircleDashed className="size-3 animate-spin" /> },
  paused: { label: 'Paused', tone: 'warn', icon: <PauseCircle className="size-3" /> },
  completed: { label: 'Completed', tone: 'success', icon: <CheckCircle2 className="size-3" /> },
  completed_with_errors: { label: 'Completed with errors', tone: 'warn', icon: <AlertTriangle className="size-3" /> },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: <XCircle className="size-3" /> },
  failed: { label: 'Failed', tone: 'danger', icon: <XCircle className="size-3" /> },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusMap[status] ?? statusMap.queued;
  return (
    <Badge tone={config.tone}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

export function actionLabel(action: Job['action']): string {
  if (action === 'unrepost') return 'Undo reposts';
  if (action === 'mixed') return 'Delete & unrepost';
  return 'Delete posts';
}

export function JobRow({ job, onOpen }: { job: Job; onOpen?: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-raised"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-ink">{job.name}</p>
        <p className="mt-0.5 text-[11px] text-muted">
          {actionLabel(job.action)} · {job.processed.toLocaleString()} of {job.total.toLocaleString()} processed
        </p>
      </div>
      <JobStatusBadge status={job.status} />
    </button>
  );
}

export function JobProgress({ job, className }: { job: Job; className?: string }) {
  const done = job.status === 'completed' || job.status === 'completed_with_errors';
  const tone = job.failed > 0 && done ? 'warn' : 'accent';
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
        <span>
          {job.processed.toLocaleString()} / {job.total.toLocaleString()}
        </span>
        <span className="tabular">{job.progress}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            tone === 'warn' ? 'bg-warn' : 'bg-accent'
          } ${job.status === 'running' ? 'progress-stripes' : ''}`}
          style={{ width: `${Math.max(job.progress, job.status === 'running' ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
