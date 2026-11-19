import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const features = [
  {
    t: 'Categories',
    d: 'Separate posts, replies, reposts, media, and quote posts so you can target exactly what you want to review.',
    detail: 'Each category is a filtered view of your cached timeline. Switching tabs recomputes counts instantly without re-fetching from X.',
  },
  {
    t: 'Filters',
    d: 'Narrow by keyword, date range, media type, engagement, and data source.',
    detail: 'Combine multiple filters to find, for example, low-engagement replies from 2021, or media posts from 2023. Filters are saved as rules for reuse.',
  },
  {
    t: 'Bulk select',
    d: 'Select individual posts, select all on a page, or select all matching a filter set.',
    detail: 'Selections are capped by a configurable maximum (default 1,000) to protect against accidental mass deletion. A preview shows exactly what will be processed.',
  },
  {
    t: 'Background worker',
    d: 'Deletions run server-side with progress, retry, and automatic pause/resume on X rate limits.',
    detail: 'Each job snapshots the matching post IDs, then processes them sequentially. Rate limits (50 deletes per 15 minutes) are respected automatically.',
  },
  {
    t: 'Saved rules',
    d: 'Save filter combinations as named rules and re-run them later.',
    detail: 'Rules are stored per account. Re-running a rule re-evaluates the current dataset, so newly synced posts are included.',
  },
  {
    t: 'History',
    d: 'Activity log and per-job success/failure reports.',
    detail: 'Every job records which items succeeded, failed, or were skipped, with error codes. Export results for your records.',
  },
  {
    t: 'Archive import',
    d: 'Import an X data archive to access posts older than the API limit.',
    detail: 'X only exposes the 3,200 most recent posts via the API. Archive import parses your downloaded ZIP and merges older posts into the same workspace.',
  },
  {
    t: 'Export',
    d: 'Export your cached data and job history as JSON.',
    detail: 'Includes posts, metrics, media metadata, and job summaries. Useful for backups or migrating workspaces.',
  },
];

export function FeaturesPage() {
  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Features</h1>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">
        Everything CleanSoc can do today. Each feature is designed to make reviewing and cleaning your X account
        predictable, safe, and reversible-by-you.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <Card key={f.t}>
            <CardHeader>
              <CardTitle>{f.t}</CardTitle>
              <CardDescription>{f.d}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[12.5px] leading-5 text-ink-soft">{f.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
