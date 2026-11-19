import { cn } from '../lib/format';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-8', className)} aria-hidden>
      <rect width="64" height="64" rx="15" fill="currentColor" className="text-accent" />
      <path
        d="M20 24h24M27 24v-4h10v4M24 24l2 22h12l2-22"
        stroke="var(--c-accent-ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M30 31v9M34 31v9" stroke="var(--c-acid)" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink">
        Clean<span className="text-accent">Soc</span>
      </span>
    </span>
  );
}
