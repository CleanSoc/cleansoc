import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListFilter,
  Menu,
  Moon,
  Rows3,
  Search,
  Settings,
  Sun,
  Archive as ArchiveIcon,
  History as HistoryIcon,
  Eraser,
  X,
  LogOut,
  ChevronDown,
  Check,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { api, get, post } from '../lib/api';
import { API_BASE } from '../lib/api';
import { useTheme } from '../lib/theme';
import { cn, initials, relativeTime } from '../lib/format';
import type { Account, Session } from '../lib/types';
import { Logo } from './Logo';
import { Badge, Button, IconButton, Spinner } from './ui';
import { useToast } from './ui';

const navItems = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/activity', label: 'Activity', icon: Rows3 },
  { to: '/app/cleanup', label: 'Cleanup', icon: Eraser },
  { to: '/app/rules', label: 'Saved rules', icon: ListFilter },
  { to: '/app/history', label: 'History', icon: HistoryIcon },
  { to: '/app/archive', label: 'Archive', icon: ArchiveIcon },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function useSessionQuery() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => get<Session>('/api/auth/session'),
    staleTime: 30_000,
  });
}

export function AppShell({ session, children }: { session: Session; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const location = window.location.pathname;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useToast();
  const activeAccount = session.accounts?.find((account) => account.id === session.activeAccountId) ?? session.accounts?.[0];

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const switchAccount = useMutation({
    mutationFn: (accountId: string) => post(`/api/accounts/${accountId}/activate`),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      notify('Account switched');
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const signOut = useMutation({
    mutationFn: () => post('/api/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/welcome';
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  const title = pageTitle(location);

  return (
    <div className="min-h-full bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface/70 backdrop-blur-xl lg:flex">
        <SidebarContent session={session} activeAccount={activeAccount} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[280px] animate-fade-up flex-col border-r border-line bg-surface shadow-float">
            <div className="absolute right-3 top-3">
              <IconButton label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="size-4" />
              </IconButton>
            </div>
            <SidebarContent session={session} activeAccount={activeAccount} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-muted hover:bg-raised hover:text-ink lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <Logo className="lg:hidden" markClassName="size-7" />

            <div className="hidden min-w-0 lg:block">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Workspace</p>
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
              <SearchButton />
              <ThemeButton />
              {activeAccount && <SyncPill account={activeAccount} />}
              <div className="relative">
                <button
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-line-strong"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                >
                  <AccountAvatar account={activeAccount} size="sm" />
                  <div className="hidden text-left sm:block">
                    <p className="max-w-[110px] truncate text-[12px] font-medium leading-4 text-ink">
                      {activeAccount?.displayName ?? 'Account'}
                    </p>
                    <p className="max-w-[110px] truncate text-[10.5px] leading-3 text-muted">
                      @{activeAccount?.username ?? 'unknown'}
                    </p>
                  </div>
                  <ChevronDown className="size-3.5 text-muted" />
                </button>

                {accountOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                    <div className="absolute right-0 top-12 z-20 w-72 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-float">
                      <div className="border-b border-line px-3 py-2.5">
                        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">Connected accounts</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5">
                        {session.accounts?.map((account) => (
                          <button
                            key={account.id}
                            onClick={() => {
                              if (account.id !== activeAccount?.id) switchAccount.mutate(account.id);
                              setAccountOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-raised"
                          >
                            <AccountAvatar account={account} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[12.5px] font-medium text-ink">{account.displayName}</p>
                              <p className="truncate text-[11px] text-muted">@{account.username}</p>
                            </div>
                            {account.isDemo && <Badge tone="warn">Demo</Badge>}
                            {account.id === activeAccount?.id && <Check className="size-4 text-accent" />}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-line p-1.5">
                        <a
                          href={API_BASE ? `${API_BASE}/api/auth/x/start` : '/api/auth/x/start'}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] text-ink-soft transition-colors hover:bg-raised"
                        >
                          <Plus className="size-4 text-muted" /> Connect another X account
                        </a>
                        <button
                          onClick={() => signOut.mutate()}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] text-ink-soft transition-colors hover:bg-raised"
                        >
                          <LogOut className="size-4 text-muted" /> Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ session, activeAccount }: { session: Session; activeAccount?: Account }) {
  const path = window.location.pathname;
  const { mode, setMode } = useTheme();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center px-5">
        <a href="/app" aria-label="CleanSoc home">
          <Logo />
        </a>
      </div>

      <div className="px-3">
        <div className="rounded-xl border border-line bg-raised/70 p-3">
          <div className="flex items-center gap-2.5">
            <AccountAvatar account={activeAccount} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{activeAccount?.displayName ?? 'No account'}</p>
              <p className="truncate text-[11px] text-muted">@{activeAccount?.username ?? '—'}</p>
            </div>
            {activeAccount?.isDemo && <Badge tone="warn" className="ml-auto">Demo</Badge>}
          </div>
          <div className="mt-2.5 flex items-center gap-3 border-t border-line pt-2.5 text-[11px] text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-success" />
              {activeAccount ? `${activeAccount.totalPosts.toLocaleString()} indexed` : '—'}
            </span>
            <span className="text-line-strong">·</span>
            <span>{activeAccount?.deletedPosts ?? 0} removed</span>
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Main navigation">
        <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Manage</p>
        {navItems.map((item) => {
          const active = item.end ? path === item.to : path.startsWith(item.to);
          return (
            <a
              key={item.to}
              href={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                active
                  ? 'bg-accent-soft text-accent'
                  : 'text-ink-soft hover:bg-raised hover:text-ink',
              )}
            >
              <item.icon className={cn('size-[17px]', active ? 'text-accent' : 'text-muted group-hover:text-ink-soft')} strokeWidth={1.9} />
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-accent" />}
            </a>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-line p-4">
        <div className="rounded-xl border border-line bg-raised/60 p-3">
          <p className="text-[11px] font-semibold text-ink">X API coverage</p>
          <p className="mt-1 text-[11px] leading-4 text-muted">
            The API exposes your 3,200 most recent posts. Import your archive for the rest.
          </p>
          <a
            href="/app/archive"
            className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline"
          >
            Import archive <span aria-hidden>→</span>
          </a>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Theme">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setMode(option)}
                className={cn(
                  'rounded-md px-2 py-1.5 transition-colors',
                  mode === option ? 'bg-raised text-ink shadow-sm' : 'text-muted hover:text-ink',
                )}
                aria-label={`${option} theme`}
                aria-pressed={mode === option}
                title={`${option[0].toUpperCase()}${option.slice(1)} theme`}
              >
                {option === 'light' ? <Sun className="size-3.5" /> : option === 'dark' ? <Moon className="size-3.5" /> : <span className="text-[10px] font-semibold">A</span>}
              </button>
            ))}
          </div>
          <span className="text-[10.5px] text-muted">v1.0 MVP</span>
        </div>

        {session.accounts && session.accounts.length > 0 && (
          <p className="flex items-center gap-1.5 text-[10.5px] text-muted">
            <span className="size-1.5 rounded-full bg-success" /> Session encrypted · OAuth 2.0
          </p>
        )}
      </div>
    </>
  );
}

export function AccountAvatar({ account, size = 'md' }: { account?: Account; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'size-7 text-[10px]', md: 'size-9 text-[12px]', lg: 'size-12 text-[15px]' };
  const colors = [
    'bg-[#0f5f4c] text-[#eafff6]',
    'bg-[#3d3a6b] text-[#ecebff]',
    'bg-[#7a3b2e] text-[#ffede8]',
    'bg-[#3f5330] text-[#f0ffe4]',
  ];
  const color = colors[(account?.username.charCodeAt(0) ?? 0) % colors.length];
  if (account?.avatarUrl) {
    return <img src={account.avatarUrl} alt="" className={cn(sizes[size], 'shrink-0 rounded-full object-cover')} />;
  }
  return (
    <div className={cn(sizes[size], 'flex shrink-0 items-center justify-center rounded-full font-semibold', color)}>
      {initials(account?.displayName ?? account?.username ?? 'CS')}
    </div>
  );
}

function ThemeButton() {
  const { resolved, toggle } = useTheme();
  return (
    <IconButton label={resolved === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle}>
      {resolved === 'dark' ? <Sun className="size-[17px]" /> : <Moon className="size-[17px]" />}
    </IconButton>
  );
}

function SearchButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const submit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const query = value.trim();
      if (!query) return;
      navigate(`/app/activity?q=${encodeURIComponent(query)}`);
      setOpen(false);
      setValue('');
    },
    [navigate, value],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-ink sm:flex"
        aria-label="Search activity"
      >
        <Search className="size-3.5" />
        <span>Search</span>
        <kbd className="ml-3 rounded border border-line bg-raised px-1.5 py-0.5 font-sans text-[10px] text-muted">/</kbd>
      </button>
      <IconButton label="Search activity" onClick={() => setOpen(true)} className="sm:hidden">
        <Search className="size-[17px]" />
      </IconButton>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/30 px-4 pt-[12vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form
            onSubmit={submit}
            className="w-full max-w-xl animate-scale-in overflow-hidden rounded-xl border border-line bg-surface shadow-float"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-muted" />
              <input
                autoFocus
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Search your posts, replies, and reposts…"
                className="h-12 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
                aria-label="Search your activity"
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 text-[11.5px] text-muted">
              <span>Full-text search across the indexed posts in this workspace.</span>
              <button type="submit" className="font-medium text-accent hover:underline">Search</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function SyncPill({ account }: { account: Account }) {
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const sync = useMutation({
    mutationFn: () => post(`/api/accounts/${account.id}/sync`),
    onSuccess: () => {
      notify('Sync started', 'info', 'New posts will appear as they are fetched.');
      window.setTimeout(() => queryClient.invalidateQueries(), 2500);
    },
    onError: (error: Error) => notify(error.message, 'error'),
  });

  if (account.isDemo) {
    return <Badge tone="outline" className="hidden md:inline-flex">Demo workspace</Badge>;
  }

  const syncing = account.lastSyncStatus === 'syncing';
  const limited = account.lastSyncStatus === 'rate_limited';
  const error = account.lastSyncStatus === 'error';

  return (
    <div className="hidden items-center gap-1.5 md:flex">
      <Badge tone={error ? 'danger' : limited ? 'warn' : syncing ? 'accent' : 'outline'} dot={!syncing}>
        {syncing ? (
          <>
            <Spinner className="size-3" /> Syncing
          </>
        ) : limited ? (
          'Rate limited'
        ) : error ? (
          'Sync error'
        ) : account.lastSyncedAt ? (
          `Synced ${relativeTime(account.lastSyncedAt)}`
        ) : (
          'Not synced'
        )}
      </Badge>
      <IconButton
        label="Sync account"
        onClick={() => sync.mutate()}
        disabled={syncing || sync.isPending}
        className="size-8"
      >
        <RefreshCw className={cn('size-3.5', syncing && 'animate-spin')} />
      </IconButton>
    </div>
  );
}

function pageTitle(path: string): string {
  if (path.startsWith('/app/activity')) return 'Activity explorer';
  if (path.startsWith('/app/cleanup/')) return 'Cleanup run';
  if (path.startsWith('/app/cleanup')) return 'Cleanup studio';
  if (path.startsWith('/app/rules')) return 'Saved rules';
  if (path.startsWith('/app/history')) return 'Cleanup history';
  if (path.startsWith('/app/archive')) return 'Archive import';
  if (path.startsWith('/app/settings')) return 'Settings';
  return 'Overview';
}
