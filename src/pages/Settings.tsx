import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  KeyRound,
  Laptop,
  LogOut,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
  Unplug,
  UserRound,
} from 'lucide-react';
import { api, get, post } from '../lib/api';
import { API_BASE } from '../lib/api';
import { useTheme } from '../lib/theme';
import { cn, formatDateTime, relativeTime } from '../lib/format';
import { Badge, Button, Callout, Checkbox, Field, Input, Modal, Skeleton, useToast } from '../components/ui';
import { PageHeader } from '../components/PageHeader';
import { AccountAvatar, useSessionQuery } from '../components/AppShell';

interface SettingsResponse {
  account: {
    id: string;
    username: string;
    displayName: string;
    isDemo: boolean;
    connectedAt: string;
    lastSyncedAt: string | null;
    lastSyncStatus: string;
    scopes: string[];
    tokenExpiresAt: string | null;
    hasWriteScope: boolean;
  };
  server: {
    demoMode: boolean;
    oauthConfigured: boolean;
    maxJobItems: number;
    syncMaxPages: number;
    maxArchiveBytes: number;
    sessionTtlDays: number;
    tokenEncryption: string;
  };
  privacy: {
    passwordsStored: boolean;
    tokenStorage: string;
    deletionModel: string;
    dataRetention: string;
  };
  xApi: {
    timelineLimit: number;
    mentionsLimit: number;
    deleteRateLimit: string;
    repostUndoEndpoint: string;
    deleteEndpoint: string;
    archiveNote: string;
  };
}

export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const session = useSessionQuery();
  const { mode, setMode } = useTheme();
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  const settings = useQuery({
    queryKey: ['settings'],
    queryFn: () => get<SettingsResponse>('/api/settings'),
  });

  const account = settings.data?.account;
  const activeAccount = session.data?.accounts?.find((item) => item.id === session.data?.activeAccountId);

  const sync = useMutation({
    mutationFn: () => post(`/api/accounts/${account?.id}/sync`),
    onSuccess: async () => {
      notify('Sync started', 'info');
      window.setTimeout(() => queryClient.invalidateQueries({ queryKey: ['settings'] }), 2000);
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const disconnect = useMutation({
    mutationFn: () =>
      api<{ ok: boolean; signedOut: boolean }>(`/api/accounts/${account?.id}?confirm=DELETE`, { method: 'DELETE' }),
    onSuccess: async (result) => {
      setDisconnectOpen(false);
      queryClient.clear();
      if (result.signedOut) {
        navigate('/welcome');
      } else {
        await queryClient.invalidateQueries();
        notify('X account disconnected', 'info', 'Its cached posts and tokens were removed.');
      }
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const deleteData = useMutation({
    mutationFn: () => api<{ ok: boolean }>('/api/me/data', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.clear();
      navigate('/welcome');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const closeDisconnect = () => {
    setDisconnectOpen(false);
    setConfirmText('');
    setAcknowledged(false);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setConfirmText('');
    setAcknowledged(false);
  };

  if (settings.isLoading) {
    return (
      <div className="animate-fade-up">
        <Skeleton className="mb-6 h-10 w-48" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Account connection, data controls, and an honest summary of what the X API allows."
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-muted" />
              <h2 className="text-[14px] font-semibold text-ink">Connected account</h2>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-raised/50 p-4">
              <AccountAvatar account={activeAccount} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold text-ink">{account?.displayName ?? '—'}</p>
                  {account?.isDemo && <Badge tone="warn">Demo</Badge>}
                  {account?.hasWriteScope ? (
                    <Badge tone="success">Write access</Badge>
                  ) : (
                    <Badge tone="danger">Read only</Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[11.5px] text-muted">@{account?.username ?? '—'}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw className="size-3.5" />}
                  onClick={() => sync.mutate()}
                  loading={sync.isPending}
                  disabled={account?.isDemo}
                >
                  Sync
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Unplug className="size-3.5" />}
                  onClick={() => setDisconnectOpen(true)}
                >
                  Disconnect
                </Button>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Row label="Connected" value={account ? formatDateTime(account.connectedAt) : '—'} />
              <Row
                label="Last sync"
                value={
                  account?.isDemo
                    ? 'Demo dataset'
                    : account?.lastSyncedAt
                      ? relativeTime(account.lastSyncedAt)
                      : 'Never'
                }
              />
              <Row label="OAuth scopes" value={account?.scopes.length ? account.scopes.join(' · ') : '—'} mono />
              <Row
                label="Token expires"
                value={account?.tokenExpiresAt ? formatDateTime(account.tokenExpiresAt) : account?.isDemo ? 'N/A' : 'Refresh token'}
              />
            </dl>

            {!account?.isDemo && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <a href={`/api/accounts/${account?.id}/export`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm" icon={<Download className="size-3.5" />}>
                    Export cached data (JSON)
                  </Button>
                </a>
                <a href={API_BASE ? `${API_BASE}/api/auth/x/start` : '/api/auth/x/start'}>
                  <Button variant="ghost" size="sm">
                    Connect another account
                  </Button>
                </a>
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Sun className="size-4 text-muted" />
              <h2 className="text-[14px] font-semibold text-ink">Appearance</h2>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {[
                { key: 'light' as const, label: 'Light', icon: <Sun className="size-4" />, hint: 'Paper' },
                { key: 'dark' as const, label: 'Dark', icon: <Moon className="size-4" />, hint: 'Ink' },
                { key: 'system' as const, label: 'System', icon: <Laptop className="size-4" />, hint: 'Match device' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setMode(option.key)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                    mode === option.key
                      ? 'border-accent/50 bg-accent-soft/50'
                      : 'border-line bg-surface hover:border-line-strong',
                  )}
                  aria-pressed={mode === option.key}
                >
                  <span className={cn('flex size-8 items-center justify-center rounded-lg', mode === option.key ? 'bg-accent text-accent-ink' : 'bg-raised text-muted')}>
                    {option.icon}
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-medium text-ink">{option.label}</span>
                    <span className="block text-[10.5px] text-muted">{option.hint}</span>
                  </span>
                  {mode === option.key && <Check className="ml-auto size-4 text-accent" />}
                </button>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-muted" />
              <h2 className="text-[14px] font-semibold text-ink">Data controls</h2>
            </div>
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                <div>
                  <p className="text-[12.5px] font-medium text-ink">Export everything</p>
                  <p className="mt-0.5 text-[11px] text-muted">Posts, media metadata, jobs and statuses as JSON.</p>
                </div>
                <a href={`/api/accounts/${account?.id}/export`} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm" icon={<Download className="size-3.5" />}>
                    Download
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/25 bg-danger-soft/25 p-4">
                <div>
                  <p className="text-[12.5px] font-medium text-ink">Delete workspace</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Removes your session, cached posts, jobs and tokens. This does not delete anything on X.
                  </p>
                </div>
                <Button variant="dangerOutline" size="sm" icon={<Trash2 className="size-3.5" />} onClick={() => setDeleteOpen(true)}>
                  Delete data
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted" />
              <h2 className="text-[14px] font-semibold text-ink">Security</h2>
            </div>
            <div className="mt-3 space-y-2.5 text-[11.5px]">
              <Row label="Passwords stored" value="Never" />
              <Row label="Token encryption" value={settings.data?.server.tokenEncryption ?? 'AES-256-GCM'} />
              <Row label="Token storage" value="Server-side only" />
              <Row label="Session lifetime" value={`${settings.data?.server.sessionTtlDays ?? 30} days`} />
              <Row label="Session cookie" value="httpOnly · SameSite=Lax" />
              <Row label="OAuth flow" value="Authorization Code + PKCE" />
            </div>
            <div className="mt-3 rounded-lg border border-line bg-raised/60 p-3 text-[11px] leading-4 text-muted">
              {settings.data?.privacy.deletionModel ??
                'Deletion is performed by a server-side worker after explicit confirmation.'}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-muted" />
              <h2 className="text-[14px] font-semibold text-ink">X API limits</h2>
            </div>
            <dl className="mt-3 space-y-2.5 text-[11.5px]">
              <Row label="Timeline" value={`${settings.data?.xApi.timelineLimit.toLocaleString() ?? '3,200'} most recent`} />
              <Row label="Mentions" value={`${settings.data?.xApi.mentionsLimit.toLocaleString() ?? '800'} most recent`} />
              <Row label="Deletes" value={settings.data?.xApi.deleteRateLimit ?? '50 / 15 minutes'} />
              <Row label="Max per job" value={(settings.data?.server.maxJobItems ?? 1000).toLocaleString()} />
              <Row label="Sync pages" value={String(settings.data?.server.syncMaxPages ?? '—')} />
            </dl>
            <div className="mt-3 space-y-1.5 border-t border-line pt-3 font-mono text-[10.5px] text-muted">
              <p>{settings.data?.xApi.deleteEndpoint ?? 'DELETE /2/tweets/:id'}</p>
              <p>{settings.data?.xApi.repostUndoEndpoint ?? 'DELETE /2/users/:id/retweets/:source_tweet_id'}</p>
            </div>
          </section>

          <Callout tone="info" title="Deployment note">
            {settings.data?.server.oauthConfigured
              ? 'OAuth is configured. Real accounts can connect and deletions call X directly.'
              : 'OAuth is not configured on this server. Only the demo workspace is available until X_CLIENT_ID and X_CLIENT_SECRET are set.'}
          </Callout>

          <Button
            variant="secondary"
            className="w-full"
            icon={<LogOut className="size-4" />}
            onClick={async () => {
              await post('/api/auth/logout');
              queryClient.clear();
              navigate('/welcome');
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <Modal
        open={disconnectOpen}
        onClose={closeDisconnect}
        title="Disconnect this X account?"
        description="Cached posts, jobs and encrypted tokens for this account are deleted."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeDisconnect}>
              Keep connected
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== 'DELETE' || !acknowledged}
              loading={disconnect.isPending}
              onClick={() => disconnect.mutate()}
            >
              Disconnect account
            </Button>
          </div>
        }
      >
        <Callout tone="warn" title="This does not delete posts on X" icon={<AlertTriangle className="size-4" />}>
          Disconnecting only removes CleanSoc's local copy. Any cleanup jobs still queued will stop.
        </Callout>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox checked={acknowledged} onChange={setAcknowledged} label="Acknowledge disconnection" size="sm" className="mt-0.5" />
            <span className="text-[12px] leading-5 text-ink-soft">I understand the cached data and tokens will be deleted.</span>
          </label>
          <Field label="Type DELETE to confirm">
            <Input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="DELETE" autoComplete="off" className="max-w-[180px] font-mono" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={closeDelete}
        title="Delete this workspace?"
        description="Everything CleanSoc stores for you will be erased permanently."
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== 'DELETE' || !acknowledged}
              loading={deleteData.isPending}
              onClick={() => deleteData.mutate()}
            >
              Delete everything
            </Button>
          </div>
        }
      >
        <Callout tone="danger" title="Irreversible" icon={<AlertTriangle className="size-4" />}>
          Your session, cached posts, cleanup history, saved rules and encrypted tokens are removed. Posts already deleted
          on X stay deleted; this cannot be undone either way.
        </Callout>
        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox checked={acknowledged} onChange={setAcknowledged} label="Acknowledge workspace deletion" size="sm" className="mt-0.5" />
            <span className="text-[12px] leading-5 text-ink-soft">I understand this cannot be reversed.</span>
          </label>
          <Field label="Type DELETE to confirm">
            <Input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="DELETE" autoComplete="off" className="max-w-[180px] font-mono" />
          </Field>
        </div>
      </Modal>
      <div className="mt-8 border-t border-line pt-4 text-[11.5px] text-muted">
        <Link to="/terms" className="hover:text-ink">Terms of Service</Link>
        <span className="mx-2 text-line-strong">·</span>
        <Link to="/privacy" className="hover:text-ink">Privacy Policy</Link>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={cn('min-w-0 break-words text-right text-ink-soft', mono && 'font-mono text-[10.5px]')}>{value}</dd>
    </div>
  );
}
