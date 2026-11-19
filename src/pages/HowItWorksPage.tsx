const steps = [
  {
    n: '1',
    t: 'Connect',
    d: 'Sign in with X using OAuth 2.0. We never see or store your password. Tokens are encrypted at rest.',
  },
  {
    n: '2',
    t: 'Sync',
    d: 'We index your recent timeline — up to 3,200 posts — including metrics and media. Older posts can be added via archive import.',
  },
  {
    n: '3',
    t: 'Review',
    d: 'Filter by date, keyword, media type, engagement, or source. Inspect samples before selecting.',
  },
  {
    n: '4',
    t: 'Select',
    d: 'Select individual posts, all on a page, or all matching a filter. A preview shows exactly what will be processed.',
  },
  {
    n: '5',
    t: 'Confirm',
    d: 'Type DELETE and acknowledge irreversibility. Nothing runs without this step.',
  },
  {
    n: '6',
    t: 'Process',
    d: 'A background worker deletes posts one at a time, respecting X rate limits, with progress and retry.',
  },
  {
    n: '7',
    t: 'Report',
    d: 'A detailed success/failure report is produced. Failed items can be retried.',
  },
];

export function HowItWorksPage() {
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">How it works</h1>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">
        From sign-in to a cleaner timeline, in seven clear steps.
      </p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <li key={s.n} className="card p-5">
            <div className="text-[11px] font-semibold text-accent">{s.n}</div>
            <div className="mt-1 text-[15px] font-semibold text-ink">{s.t}</div>
            <p className="mt-1 text-[12.5px] leading-5 text-muted">{s.d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 max-w-3xl space-y-4 text-[13.5px] leading-6 text-ink-soft">
        <h2 className="text-[18px] font-semibold text-ink">Safety and control</h2>
        <p>
          Deletion is permanent and cannot be undone by CleanSoc or X. Every job requires explicit confirmation, and a
          preview shows the exact posts that will be processed. Jobs run in the background so you can continue using the
          app; progress and results are available on the job detail page.
        </p>
        <p>
          Rate limits are handled automatically: when X signals a limit, the job pauses and resumes when the window
          resets. Failed items are reported with error codes and can be retried.
        </p>
        <h2 className="text-[18px] font-semibold text-ink">Data access</h2>
        <p>
          The X API exposes up to 3,200 recent posts. For older content, download your X data archive and import it
          into CleanSoc; archived posts are merged into the same workspace and can be filtered and deleted like any other.
        </p>
      </div>
    </div>
  );
}
