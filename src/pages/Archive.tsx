import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Archive as ArchiveIcon,
  CheckCircle2,
  Clock3,
  Download,
  FileArchive,
  HardDriveDownload,
  Info,
  Loader2,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { get, uploadArchive } from '../lib/api';
import type { ArchiveImport, ArchiveResponse } from '../lib/types';
import { formatDate, formatDateTime, formatNumber, relativeTime } from '../lib/format';
import { Badge, Button, Callout, EmptyState, ProgressBar, Skeleton, useToast } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { useSessionQuery } from '../components/AppShell';

export function ArchivePage() {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const session = useSessionQuery();
  const account = session.data?.accounts?.find((item) => item.id === session.data?.activeAccountId);
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const archive = useQuery({
    queryKey: ['archive'],
    queryFn: () => get<ArchiveResponse>('/api/archive'),
    refetchInterval: (query) =>
      query.state.data?.imports.some((item) => item.status === 'processing') ? 2000 : false,
  });

  const importing = archive.data?.imports.some((item) => item.status === 'processing') ?? false;

  useEffect(() => {
    if (!importing && uploading) {
      setUploading(false);
      setFile(null);
      setProgress(0);
      notify('Archive processed', 'success', 'Older posts are now searchable in the activity explorer.');
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importing]);

  const upload = useCallback(
    async (selected: File) => {
      if (!account) return;
      setUploading(true);
      setUploadError(null);
      setProgress(0);
      try {
        await uploadArchive(selected, account.id, setProgress);
        notify('Archive uploaded', 'info', 'Parsing data/tweets.js in the background.');
        await archive.refetch();
      } catch (error) {
        setUploadError((error as Error).message);
        setUploading(false);
        setFile(null);
      }
    },
    [account, archive, notify],
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) acceptFile(dropped);
  };

  const acceptFile = (selected: File) => {
    setUploadError(null);
    if (!/\.zip$/i.test(selected.name)) {
      setUploadError('Choose the .zip file from X. Extracted folders are not supported.');
      return;
    }
    if (selected.size > 512 * 1024 * 1024) {
      setUploadError('That file is larger than the 512 MB limit.');
      return;
    }
    setFile(selected);
  };

  const demo = account?.isDemo;

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Historical data"
        title="Import your X archive"
        description="The X API stops at your 3,200 most recent posts. Your downloadable archive contains everything older, and CleanSoc can index it so you can clean up the full history."
        actions={
          <a href="https://x.com/settings/download_your_data" target="_blank" rel="noreferrer noopener">
            <Button variant="secondary" icon={<Download className="size-4" />}>
              Request archive from X
            </Button>
          </a>
        }
      />

      {demo ? (
        <Callout tone="warn" className="mb-5" title="Archive import is disabled in the demo">
          The demo account uses synthetic data. Connect a real X account to import an official archive. The parsing and
          indexing pipeline is fully implemented and will run for real accounts.
        </Callout>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Posts from archive" value={archive.data?.stats.archivedPosts ?? 0} icon={<ArchiveIcon className="size-4" />} />
        <Stat label="Posts from API" value={archive.data?.stats.apiPosts ?? 0} icon={<UploadCloud className="size-4" />} />
        <Stat label="Posts with media" value={archive.data?.stats.mediaPosts ?? 0} icon={<FileArchive className="size-4" />} />
        <Stat
          label="Oldest indexed"
          value={archive.data?.stats.oldestAt ? formatDate(archive.data.stats.oldestAt, { month: 'short', year: 'numeric' }) : '—'}
          icon={<Clock3 className="size-4" />}
          raw
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <section className="card p-5">
          <h2 className="text-[14px] font-semibold text-ink">Upload the ZIP</h2>
          <p className="mt-0.5 text-[11.5px] text-muted">
            X emails a download link when your archive is ready — usually within 24 hours. Keep the ZIP intact.
          </p>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging ? 'border-accent bg-accent-soft/40' : 'border-line bg-raised/40'
            } ${demo || uploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-accent">
              <HardDriveDownload className="size-5" />
            </span>
            <p className="mt-3 text-[13px] font-medium text-ink">
              {file ? file.name : 'Drop your archive .zip here'}
            </p>
            <p className="mt-1 text-[11.5px] text-muted">
              {file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB selected` : 'or choose a file · up to 512 MB'}
            </p>
            <input
              ref={fileInput}
              type="file"
              accept=".zip,application/zip"
              className="sr-only"
              disabled={demo || uploading}
              onChange={(event) => {
                const selected = event.target.files?.[0];
                if (selected) acceptFile(selected);
                event.target.value = '';
              }}
            />
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()} disabled={uploading}>
                Choose file
              </Button>
              {file && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => void upload(file)}
                  disabled={uploading || demo || importing}
                  loading={uploading}
                  icon={<UploadCloud className="size-3.5" />}
                >
                  {importing ? 'Import running…' : 'Start import'}
                </Button>
              )}
              {file && !uploading && (
                <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[11px] text-muted">
                <span>{progress < 100 ? 'Uploading…' : 'Parsing and indexing in the background…'}</span>
                <span className="tabular">{progress}%</span>
              </div>
              <ProgressBar value={progress} animated={progress >= 100} />
            </div>
          )}

          {uploadError && (
            <Callout tone="danger" className="mt-4" title="Import could not start">
              {uploadError}
            </Callout>
          )}

          <div className="mt-5 space-y-2.5 border-t border-line pt-4">
            {[
              'Open X → Settings → Your account → Download an archive of your data.',
              'Wait for the email, then download the ZIP (keep it zipped).',
              'Upload it here. CleanSoc reads data/tweets.js only.',
              'Duplicates are merged; media metadata is added to posts already synced via the API.',
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
                  {index + 1}
                </span>
                <p className="text-[11.5px] leading-4 text-ink-soft">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <Info className="size-4 text-muted" /> What the API can and cannot do
            </h2>
            <dl className="mt-3 space-y-3 text-[11.5px]">
              <CoverageRow label="Timeline via API" value="3,200 most recent posts" ok="partial" />
              <CoverageRow label="Mentions via API" value="800 most recent" ok="partial" />
              <CoverageRow label="Archived history" value="Manual ZIP import only" ok="manual" />
              <CoverageRow label="Official archive API" value="Does not exist" ok="no" />
              <CoverageRow label="Delete rate" value="~50 per 15 minutes" ok="limit" />
              <CoverageRow label="Restore deleted post" value="Not possible" ok="no" />
            </dl>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-4 text-muted">
              CleanSoc never presents capabilities X does not offer. Archive upload is a convenience for your own data,
              not a backdoor into the API.
            </p>
          </section>

          <Callout tone="info" title="Why not fetch the archive automatically?">
            X does not expose a public API to download someone's archive, and third-party apps cannot request it on your
            behalf. Uploading the ZIP yourself is the only compliant path.
          </Callout>

          {archive.data?.stats.newestAt && (
            <p className="flex items-center gap-1.5 px-1 text-[10.5px] text-muted">
              <CheckCircle2 className="size-3 text-success" /> Indexed through{' '}
              {formatDate(archive.data.stats.newestAt)}
            </p>
          )}
        </div>
      </div>

      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-ink">Import history</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">Each upload is parsed independently and merged into your posts.</p>
          </div>
          {importing && (
            <Badge tone="accent">
              <Loader2 className="size-3 animate-spin" /> Processing
            </Badge>
          )}
        </div>

        {archive.isLoading ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !archive.data || archive.data.imports.length === 0 ? (
          <EmptyState
            icon={<ArchiveIcon className="size-5" />}
            title="No imports yet"
            description="Upload the ZIP from X to add posts older than the API window."
            className="py-10"
          />
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {archive.data.imports.map((item) => (
              <ImportRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ImportRow({ item }: { item: ArchiveImport }) {
  const tone = item.status === 'complete' ? 'success' : item.status === 'failed' ? 'danger' : 'accent';
  return (
    <li className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
          item.status === 'complete'
            ? 'bg-success-soft text-success'
            : item.status === 'failed'
              ? 'bg-danger-soft text-danger'
              : 'bg-accent-soft text-accent'
        }`}
      >
        {item.status === 'complete' ? (
          <CheckCircle2 className="size-4" />
        ) : item.status === 'failed' ? (
          <XCircle className="size-4" />
        ) : (
          <Loader2 className="size-4 animate-spin" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-ink">{item.filename}</p>
        <p className="mt-0.5 text-[11px] text-muted">
          {item.status === 'processing' && `${formatNumber(item.postsFound)} posts found so far · `}
          {item.status === 'complete' &&
            `${formatNumber(item.inserted)} inserted · ${formatNumber(item.updated)} merged · ${formatNumber(item.skipped)} skipped · `}
          {item.status === 'failed' ? item.error ?? 'Import failed' : relativeTime(item.createdAt)}
        </p>
        {item.oldestAt && (
          <p className="text-[10.5px] text-muted">
            Covers {formatDate(item.oldestAt, { month: 'short', year: 'numeric' })} –{' '}
            {formatDate(item.newestAt, { month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
      <Badge tone={tone}>{item.status}</Badge>
    </li>
  );
}

function Stat({
  label,
  value,
  icon,
  raw,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  raw?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-muted">
        <span className="text-[10.5px] font-medium">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-[22px] font-semibold leading-none tracking-[-0.02em] tabular text-ink">
        {raw ? value : formatNumber(Number(value))}
      </p>
    </div>
  );
}

function CoverageRow({ label, value, ok }: { label: string; value: string; ok: 'partial' | 'manual' | 'no' | 'limit' }) {
  const tone =
    ok === 'partial'
      ? 'text-warn bg-warn-soft'
      : ok === 'manual'
        ? 'text-accent bg-accent-soft'
        : ok === 'limit'
          ? 'text-warn bg-warn-soft'
          : 'text-danger bg-danger-soft';
  const icon =
    ok === 'no' ? <XCircle className="size-3" /> : ok === 'manual' ? <ShieldCheck className="size-3" /> : <AlertTriangle className="size-3" />;
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd>
        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium ${tone}`}>
          {icon}
          {value}
        </span>
      </dd>
    </div>
  );
}
