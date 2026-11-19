import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  Clock3,
  ListChecks,
  Loader2,
  Repeat2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { post } from '../lib/api';
import type { ActivityFilters, Job, PreviewResult } from '../lib/types';
import { formatNumber, pluralize } from '../lib/format';
import { Badge, Button, Callout, Checkbox, Input, Modal, useToast } from './ui';

interface CleanupDialogProps {
  open: boolean;
  onClose: () => void;
  filters?: ActivityFilters;
  postIds?: string[];
  accountId?: string;
}

export function CleanupDialog({ open, onClose, filters, postIds, accountId }: CleanupDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setAcknowledged(false);
      setConfirmation('');
      setName('');
    }
  }, [open]);

  const preview = useMutation({
    mutationFn: () =>
      post<PreviewResult>('/api/cleanup/preview', {
        accountId,
        filters,
        postIds,
      }),
  });

  useEffect(() => {
    if (open) preview.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, accountId]);

  const create = useMutation({
    mutationFn: () =>
      post<Job>('/api/cleanup/jobs', {
        accountId,
        filters,
        postIds,
        name: name.trim() || undefined,
        confirmation,
        acknowledgeIrreversible: acknowledged,
      }),
    onSuccess: async (job) => {
      await queryClient.invalidateQueries({ queryKey: ['cleanup'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      notify('Cleanup job queued', 'success', `${job.total.toLocaleString()} items will be processed in the background.`);
      onClose();
      navigate(`/app/cleanup/${job.id}`);
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const data = preview.data;
  const canSubmit = Boolean(data && data.total > 0 && acknowledged && confirmation === 'DELETE' && !create.isPending);

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!create.isPending) onClose();
      }}
      size="lg"
      dismissible={!create.isPending}
      title={
        <span className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-danger-soft text-danger">
            <Trash2 className="size-4" />
          </span>
          Review cleanup
        </span>
      }
      description="This is a preview. Nothing happens until you type DELETE and confirm."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-4 text-muted">
            A background job performs the calls. You can cancel or retry failed items at any time.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={create.isPending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => create.mutate()}
              disabled={!canSubmit}
              loading={create.isPending}
              icon={<Trash2 className="size-4" />}
            >
              {data ? `Delete ${formatNumber(data.willProcess)} ${pluralize(data.willProcess, 'item')}` : 'Delete'}
            </Button>
          </div>
        </div>
      }
    >
      {preview.isPending && (
        <div className="flex flex-col items-center justify-center py-14 text-muted">
          <Loader2 className="size-6 animate-spin text-accent" />
          <p className="mt-3 text-[12.5px]">Counting matching posts…</p>
        </div>
      )}

      {preview.isError && (
        <Callout tone="danger" title="Could not build a preview">
          {(preview.error as Error).message}
        </Callout>
      )}

      {data && (
        <div className="space-y-5">
          <div className="rounded-xl border border-line bg-raised/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Selection</p>
            <p className="mt-1 text-[14px] font-medium text-ink">{data.description}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Matches" value={data.total} />
              <Metric label="Will process" value={data.willProcess} accent />
              <Metric label="Posts" value={data.posts} />
              <Metric label="Reposts" value={data.reposts} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5" />{' '}
              {data.simulated ? 'Simulated · finishes in seconds' : `~${data.estimatedMinutes} min of API calls`}
            </span>
            {data.reposts > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Repeat2 className="size-3.5" /> Reposts are undone, not deleted
              </span>
            )}
            <Badge tone="outline">Max {data.maxItems.toLocaleString()} per job</Badge>
          </div>

          {data.simulated && (
            <Callout tone="info" title="Demo workspace">
              This is synthetic data. The deletion worker will simulate each call locally and never contact X.
            </Callout>
          )}

          {data.truncated && (
            <Callout tone="warn" title="This job is capped">
              {data.total.toLocaleString()} posts match, but a single job processes at most {data.maxItems.toLocaleString()}.
              The oldest-in-sort order is used first. Run the cleanup again afterwards to continue.
            </Callout>
          )}

          {data.sample.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
                <ListChecks className="size-3.5" /> Sample of what will be affected
              </p>
              <ul className="space-y-1.5">
                {data.sample.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2">
                    <Badge tone={item.kind === 'repost' ? 'neutral' : item.kind === 'reply' ? 'outline' : 'accent'}>
                      {item.kind === 'repost' ? 'Repost' : item.kind === 'reply' ? 'Reply' : 'Post'}
                    </Badge>
                    <span className="line-clamp-2 min-w-0 flex-1 text-[11.5px] leading-4 text-ink-soft">
                      {item.text || <span className="italic text-muted">No text</span>}
                    </span>
                    <span className="shrink-0 text-[10.5px] text-muted">
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </li>
                ))}
              </ul>
              {data.sample.length < data.willProcess && (
                <p className="mt-1.5 text-[10.5px] text-muted">…and {(data.willProcess - data.sample.length).toLocaleString()} more.</p>
              )}
            </div>
          )}

          <Callout tone="danger" title="This cannot be undone" icon={<AlertOctagon className="size-4" />}>
            X has no restore endpoint. Once a post is deleted it is gone, including its replies and media. Reposts are
            removed by undoing the repost.
          </Callout>

          <div className="space-y-3 rounded-xl border border-line p-4">
            <div>
              <label htmlFor="job-name" className="mb-1.5 block text-[11.5px] font-medium text-ink-soft">
                Name this run <span className="font-normal text-muted">(optional)</span>
              </label>
              <Input
                id="job-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={data.description.slice(0, 60)}
                maxLength={120}
                className="h-9 text-[12.5px]"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-2.5">
              <Checkbox
                checked={acknowledged}
                onChange={setAcknowledged}
                label="Acknowledge that deleted posts cannot be restored"
                size="sm"
                className="mt-0.5"
              />
              <span className="text-[12px] leading-5 text-ink-soft">
                I understand that {data.willProcess.toLocaleString()} of my posts will be permanently deleted from X and
                cannot be recovered.
              </span>
            </label>

            <div>
              <label htmlFor="confirm-delete" className="mb-1.5 block text-[11.5px] font-medium text-ink-soft">
                Type <span className="rounded bg-danger-soft px-1 py-0.5 font-mono text-[11px] text-danger">DELETE</span> to
                confirm
              </label>
              <Input
                id="confirm-delete"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="DELETE"
                autoComplete="off"
                spellCheck={false}
                className="h-9 max-w-[200px] font-mono text-[12.5px] tracking-wider"
              />
            </div>
          </div>

          {create.isError && (
            <Callout tone="danger" title="Job could not be created">
              {(create.error as Error).message}
            </Callout>
          )}
        </div>
      )}
    </Modal>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10.5px] text-muted">{label}</p>
      <p className={`mt-0.5 text-[18px] font-semibold leading-none tabular ${accent ? 'text-danger' : 'text-ink'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
