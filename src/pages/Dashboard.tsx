import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  Eraser,
  Image as ImageIcon,
  Layers,
  MessageCircle,
  Repeat2,
  Rows3,
  Sparkles,
} from 'lucide-react';
import { get } from '../lib/api';
import type { DashboardData, Post } from '../lib/types';
import { cn, filtersToQuery, formatNumber, relativeTime } from '../lib/format';
import { Badge, Button, Callout, EmptyState, Skeleton } from '../components/ui';
import { PageHeader, SectionHeading } from '../components/PageHeader';
import { Donut, MonthlyBars } from '../components/charts';
import { PostCard } from '../components/PostCard';
import { actionLabel, JobProgress, JobStatusBadge } from '../components/JobBits';

const toneMap: Record<string, { dot: string; chip: string; icon: React.ReactNode }> = {
  amber: { dot: 'bg-warn', chip: 'bg-warn-soft text-warn', icon: <MessageCircle className="size-4" /> },
  slate: { dot: 'bg-muted', chip: 'bg-raised text-muted', icon: <Sparkles className="size-4" /> },
  teal: { dot: 'bg-accent', chip: 'bg-accent-soft text-accent', icon: <Layers className="size-4" /> },
  rose: { dot: 'bg-danger', chip: 'bg-danger-soft text-danger', icon: <ImageIcon className="size-4" /> },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => get<DashboardData>('/api/dashboard'),
  });

  if (isLoading || !data) return <DashboardSkeleton />;

  const { stats, series, opportunities } = data;
  const greeting = greetingForHour(new Date().getHours());
  const totalOpportunity = opportunities.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="animate-fade-up">
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        title={
          <>
            {greeting}. <span className="text-muted">Let's tidy up.</span>
          </>
        }
        description={
          stats.total === 0
            ? 'Nothing indexed yet. Run a sync to pull your recent posts from X.'
            : `${stats.total.toLocaleString()} posts indexed, ${stats.deleted.toLocaleString()} removed so far. ${totalOpportunity} posts match your cleanup suggestions.`
        }
        actions={
          <>
            <Button variant="secondary" icon={<Download className="size-4" />} onClick={() => navigate('/app/settings')}>
              Export data
            </Button>
            <Button variant="primary" icon={<Eraser className="size-4" />} onClick={() => navigate('/app/activity')}>
              Start a cleanup
            </Button>
          </>
        }
      />

      {data.demoMode && (
        <Callout tone="info" className="mb-5" title="You are in the demo workspace">
          This account is seeded with synthetic posts so you can try the full cleanup flow. Deletions are simulated
          locally and never sent to X.
        </Callout>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatTile label="Active posts" value={stats.total} sub="currently indexed" icon={<Rows3 className="size-4" />} accent />
        <StatTile label="Originals" value={stats.originals} sub={`${stats.quotes} quotes`} icon={<Layers className="size-4" />} />
        <StatTile label="Replies" value={stats.replies} sub="most common clutter" icon={<MessageCircle className="size-4" />} />
        <StatTile label="Reposts" value={stats.reposts} sub="undoable, not deletable" icon={<Repeat2 className="size-4" />} />
        <StatTile label="Media posts" value={stats.media} sub={`${stats.mediaPhotos} with photos`} icon={<ImageIcon className="size-4" />} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                <BarChart3 className="size-4 text-muted" /> Posting history
              </h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Monthly output over the last two years, stacked by kind.</p>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-muted">
              <Legend color="bg-accent" label="Posts" />
              <Legend color="bg-accent/55" label="Replies" />
              <Legend color="bg-acid" label="Reposts" />
              <Legend color="bg-warn/70" label="Media" />
            </div>
          </div>
          <MonthlyBars series={series} className="mt-5" />
          {stats.oldestAt && (
            <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[11px] text-muted">
              <CalendarDays className="size-3.5" />
              Indexed history spans {new Date(stats.oldestAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to{' '}
              {new Date(stats.newestAt ?? Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {stats.archived > 0 && ` · ${stats.archived.toLocaleString()} from archive`}
            </p>
          )}
        </section>

        <section className="card p-5">
          <h2 className="text-[14px] font-semibold text-ink">What's in your timeline</h2>
          <p className="mt-0.5 text-[11.5px] text-muted">Composition of live posts by category.</p>
          <div className="mt-5">
            <Donut
              total={stats.total}
              label="Active"
              slices={[
                { label: 'Posts', value: Math.max(0, stats.originals - stats.quotes), color: 'var(--c-accent)' },
                { label: 'Quotes', value: stats.quotes, color: 'var(--c-acid)' },
                { label: 'Replies', value: stats.replies, color: 'var(--c-warn)' },
                { label: 'Reposts', value: stats.reposts, color: 'var(--c-muted)' },
              ]}
            />
          </div>
          <div className="mt-5 space-y-2 border-t border-line pt-4">
            <MiniStat label="Likes received" value={formatNumber(stats.likes)} />
            <MiniStat label="Total engagement" value={formatNumber(stats.engagement)} />
            <MiniStat label="Already removed" value={formatNumber(stats.deleted)} />
          </div>
        </section>
      </div>

      <section className="mt-6">
        <SectionHeading
          title="Cleanup suggestions"
          description="Filters applied to your live posts. Each one opens a preview — nothing is deleted from here."
          action={
            <Link to="/app/activity" className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline">
              Open activity explorer <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {opportunities.map((item) => {
            const tone = toneMap[item.tone] ?? toneMap.slate;
            return (
              <Link
                key={item.key}
                to={`/app/activity?${filtersToQuery(item.filters)}`}
                className="group card flex flex-col p-4 transition-all hover:border-line-strong hover:shadow-card"
              >
                <div className="flex items-start justify-between">
                  <span className={cn('flex size-8 items-center justify-center rounded-lg', tone.chip)}>{tone.icon}</span>
                  <ArrowUpRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-3 text-[26px] font-semibold leading-none tracking-[-0.03em] text-ink tabular">
                  {item.count.toLocaleString()}
                </p>
                <p className="mt-1 text-[12.5px] font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-[11.5px] leading-4 text-muted">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="card p-5">
          <SectionHeading
            title="Recent cleanup runs"
            action={
              <Link to="/app/history" className="text-[11.5px] font-medium text-accent hover:underline">
                View history
              </Link>
            }
          />
          {data.recentJobs.length === 0 ? (
            <EmptyState
              icon={<Eraser className="size-5" />}
              title="No cleanup runs yet"
              description="Start from the activity explorer, choose filters, preview the result, then confirm."
              className="py-10"
              action={
                <Button variant="secondary" size="sm" onClick={() => navigate('/app/activity')}>
                  Browse activity
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-line">
              {data.recentJobs.map((job) => (
                <div key={job.id} className="py-3 first:pt-0 last:pb-0">
                  <Link to={`/app/cleanup/${job.id}`} className="group block">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-medium text-ink group-hover:text-accent">{job.name}</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                          {actionLabel(job.action)} · created {relativeTime(job.createdAt)}
                          {job.failed > 0 && ` · ${job.failed} failed`}
                        </p>
                      </div>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <JobProgress job={job} className="mt-2" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <SectionHeading
            title="Newest posts"
            action={
              <Link to="/app/activity?sort=newest" className="text-[11.5px] font-medium text-accent hover:underline">
                See all
              </Link>
            }
          />
          <div className="space-y-2">
            {data.recentPosts.length === 0 && (
              <p className="py-8 text-center text-[12px] text-muted">No posts indexed yet.</p>
            )}
            {data.recentPosts.map((post: Post) => (
              <PostCard key={post.id} post={post} compact />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-raised/60 px-3 py-2.5">
            <div>
              <p className="text-[11.5px] font-medium text-ink">API coverage</p>
              <p className="text-[10.5px] text-muted">Timeline reads stop at 3,200 posts.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/archive')}>
              Import archive
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={cn('card p-4', accent && 'bg-accent text-accent-ink')}>
      <div className="flex items-center justify-between">
        <span className={cn('text-[11px] font-medium', accent ? 'text-accent-ink/75' : 'text-muted')}>{label}</span>
        <span className={cn(accent ? 'text-accent-ink/70' : 'text-muted')}>{icon}</span>
      </div>
      <p className={cn('mt-2 text-[27px] font-semibold leading-none tracking-[-0.03em] tabular', accent ? 'text-accent-ink' : 'text-ink')}>
        {value.toLocaleString()}
      </p>
      <p className={cn('mt-1 text-[10.5px]', accent ? 'text-accent-ink/65' : 'text-muted')}>{sub}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11.5px]">
      <span className="text-muted">{label}</span>
      <span className="font-medium tabular text-ink">{value}</span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('size-2 rounded-[2px]', color)} />
      {label}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-2xl" />
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Skeleton className="h-[304px] rounded-2xl" />
        <Skeleton className="h-[304px] rounded-2xl" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[148px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function greetingForHour(hour: number): string {
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
