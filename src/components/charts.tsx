import { useId, useMemo, useState } from 'react';
import { monthLabel } from '../lib/format';
import { cn } from '../lib/format';

export interface MonthPoint {
  month: string;
  total: number;
  replies: number;
  reposts: number;
  media: number;
}

export function MonthlyBars({ series, className }: { series: MonthPoint[]; className?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((point) => point.total));
  const ticks = 4;

  if (series.length === 0) {
    return (
      <div className={cn('grid h-52 place-items-center text-[12px] text-muted', className)}>No activity in this window</div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2">
        <div className="flex h-52 w-8 shrink-0 flex-col justify-between pb-5 text-right text-[10px] tabular text-muted">
          {Array.from({ length: ticks + 1 }, (_, index) => {
            const value = Math.round((max / ticks) * (ticks - index));
            return <span key={index}>{value}</span>;
          })}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52">
            {Array.from({ length: ticks + 1 }, (_, index) => (
              <div key={index} className="absolute inset-x-0 border-t border-line/70" style={{ top: `${(index / ticks) * 100}%` }} />
            ))}
          </div>
          <div className="flex h-52 items-end gap-[3px]">
            {series.map((point, index) => {
              const totalHeight = (point.total / max) * 100;
              const repliesShare = point.total ? (point.replies / point.total) * 100 : 0;
              const repostShare = point.total ? (point.reposts / point.total) * 100 : 0;
              const mediaShare = point.total ? (point.media / point.total) * 100 : 0;
              const postsShare = Math.max(0, 100 - repliesShare - repostShare - mediaShare);
              return (
                <div
                  key={point.month}
                  className="group relative flex h-full flex-1 items-end"
                  onMouseEnter={() => setHover(index)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div
                    className="relative w-full overflow-hidden rounded-t-[3px] transition-opacity"
                    style={{ height: `${Math.max(totalHeight, 2)}%`, opacity: hover === null || hover === index ? 1 : 0.45 }}
                  >
                    <div className="flex size-full flex-col-reverse">
                      <Segment share={postsShare} className="bg-accent" />
                      <Segment share={repliesShare} className="bg-accent/55" />
                      <Segment share={repostShare} className="bg-acid" />
                      <Segment share={mediaShare} className="bg-warn/70" />
                    </div>
                  </div>
                  {hover === index && (
                    <div
                      className={cn(
                        'pointer-events-none absolute bottom-full z-10 mb-2 w-40 rounded-lg border border-line bg-surface p-2.5 text-[11px] shadow-float',
                        index > series.length - 4 ? 'right-0' : 'left-0',
                      )}
                    >
                      <p className="font-semibold text-ink">{monthLabel(point.month)}</p>
                      <p className="mt-0.5 text-muted">{point.total} posts</p>
                      <div className="mt-1.5 space-y-0.5 text-[10.5px] text-ink-soft">
                        <Row color="bg-accent" label="Posts" value={Math.round((postsShare / 100) * point.total)} />
                        <Row color="bg-accent/55" label="Replies" value={point.replies} />
                        <Row color="bg-acid" label="Reposts" value={point.reposts} />
                        <Row color="bg-warn/70" label="Media" value={point.media} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            {series
              .map((point, index) => ({ point, index }))
              .filter(({ index }) => index === 0 || index === series.length - 1 || index % Math.ceil(series.length / 6) === 0)
              .map(({ point }) => (
                <span key={point.month}>{monthLabel(point.month)}</span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Segment({ share, className }: { share: number; className: string }) {
  if (share <= 0) return null;
  return <div className={cn('w-full', className)} style={{ height: `${share}%` }} />;
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <p className="flex items-center gap-1.5">
      <span className={cn('size-1.5 rounded-full', color)} />
      <span className="flex-1 text-muted">{label}</span>
      <span className="tabular text-ink">{value}</span>
    </p>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function Donut({ slices, total, label }: { slices: DonutSlice[]; total: number; label?: string }) {
  const gradientId = useId().replace(/:/g, '');
  const sum = useMemo(() => slices.reduce((acc, slice) => acc + slice.value, 0), [slices]);
  const [hover, setHover] = useState<string | null>(null);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative size-[148px] shrink-0">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90" role="img" aria-label={label ?? 'Breakdown'}>
          <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--c-line)" strokeWidth="16" />
          {sum > 0 &&
            slices.map((slice) => {
              const length = (slice.value / sum) * circumference;
              const dash = `${length} ${circumference - length}`;
              const element = (
                <circle
                  key={slice.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={hover === slice.label ? 19 : 16}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  className="transition-all duration-200"
                  onMouseEnter={() => setHover(slice.label)}
                  onMouseLeave={() => setHover(null)}
                />
              );
              offset += length;
              return element;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-ink tabular">
            {hover ? slices.find((slice) => slice.label === hover)?.value.toLocaleString() : total.toLocaleString()}
          </span>
          <span className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted">
            {hover ?? label ?? 'Total'}
          </span>
        </div>
        <span id={gradientId} hidden />
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {slices.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center gap-2 text-[12px]"
            onMouseEnter={() => setHover(slice.label)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="size-2 shrink-0 rounded-[3px]" style={{ backgroundColor: slice.color }} />
            <span className="min-w-0 flex-1 truncate text-ink-soft">{slice.label}</span>
            <span className="tabular text-muted">{slice.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((value, index) => `${(index / (values.length - 1)) * 100},${34 - ((value - min) / range) * 30}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 36" preserveAspectRatio="none" className={cn('h-8 w-full', className)} aria-hidden>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
