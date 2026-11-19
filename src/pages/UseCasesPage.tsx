const cases = [
  {
    title: 'Refreshing a professional image',
    body: 'You are applying for a new role and want to remove old replies and hot takes that no longer reflect you. Filter by date and engagement, review samples, then delete in a controlled batch.',
  },
  {
    title: 'Pruning low-value content',
    body: 'Years of low-engagement posts clutter your timeline. Sort by engagement ascending, set a date cutoff, and remove posts that never resonated.',
  },
  {
    title: 'Undoing reposts in bulk',
    body: 'You reposted threads you no longer endorse. Filter to reposts, select all matching, and undo them in one job.',
  },
  {
    title: 'Cleaning up media before a launch',
    body: 'You are about to launch a product and want to review media posts for outdated screenshots or drafts. Filter to media, preview each, and keep what still works.',
  },
  {
    title: 'Recovering older history',
    body: 'Your account is older than the API limit. Import your X data archive to bring in years of posts, then clean them up like any other.',
  },
  {
    title: 'Recurring maintenance',
    body: 'Save filter rules such as "replies older than a year with zero likes" and re-run them periodically to keep your timeline tidy.',
  },
];

export function UseCasesPage() {
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Use cases</h1>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">
        Practical situations where CleanSoc helps you take back your timeline.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cases.map((c) => (
          <div key={c.title} className="card p-5">
            <h2 className="text-[15px] font-semibold text-ink">{c.title}</h2>
            <p className="mt-2 text-[13px] leading-6 text-ink-soft">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
