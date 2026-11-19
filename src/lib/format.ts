import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  if (Math.abs(value) >= 1_000_000) return `${trim(value / 1_000_000)}M`;
  if (Math.abs(value) >= 10_000) return `${trim(value / 1_000)}k`;
  if (Math.abs(value) >= 1_000) return value.toLocaleString('en-US');
  return String(value);
}

function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, '');
}

export function formatDate(value: string | number | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (value === null || value === undefined) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function relativeTime(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return '';
  const diff = Date.now() - date;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export const categoryLabels: Record<string, string> = {
  all: 'All activity',
  posts: 'Posts',
  replies: 'Replies',
  reposts: 'Reposts',
  media: 'Media',
  quotes: 'Quotes',
};

export const kindLabels: Record<string, string> = {
  original: 'Post',
  reply: 'Reply',
  repost: 'Repost',
};

export function filtersToQuery(filters: Partial<import('./types').ActivityFilters>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === '' || value === false) continue;
    if (key === 'page' && value === 1) continue;
    params.set(key, String(value));
  }
  return params;
}

export function parseFilters(params: URLSearchParams): Partial<import('./types').ActivityFilters> {
  const result: Record<string, unknown> = {};
  const numeric = ['page', 'pageSize', 'minLikes', 'maxLikes', 'minEngagement', 'maxEngagement'];
  for (const [key, value] of params.entries()) {
    if (value === '') continue;
    result[key] = numeric.includes(key) ? Number(value) : value;
  }
  return result as Partial<import('./types').ActivityFilters>;
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const mediaGradients = [
  'linear-gradient(135deg, #0f5f4c -20%, #6fbf9c 120%)',
  'linear-gradient(135deg, #2b3a55 -20%, #9aa9c9 120%)',
  'linear-gradient(135deg, #7a3b2e -20%, #e0a37a 120%)',
  'linear-gradient(135deg, #3a4a2f -20%, #b6cf8a 120%)',
  'linear-gradient(135deg, #4b3050 -20%, #c39ac6 120%)',
  'linear-gradient(135deg, #5c4a12 -20%, #dbc06a 120%)',
  'linear-gradient(135deg, #173a4a -20%, #79b6c9 120%)',
  'linear-gradient(135deg, #4a1f2b -20%, #d98d9e 120%)',
];
