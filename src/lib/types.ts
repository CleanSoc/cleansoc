export type Category = 'all' | 'posts' | 'replies' | 'reposts' | 'media' | 'quotes';
export type SortOption = 'newest' | 'oldest' | 'engagement' | 'engagement_asc';
export type MediaKind = 'photo' | 'video' | 'animated_gif';

export interface MediaItem {
  type: MediaKind;
  url: string | null;
  previewUrl: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  durationMs?: number | null;
  gradient?: number;
}

export interface Post {
  id: string;
  xPostId: string;
  kind: 'original' | 'reply' | 'repost';
  text: string;
  lang: string | null;
  source: 'api' | 'archive';
  isQuote: boolean;
  inReplyToId: string | null;
  inReplyToUser: string | null;
  repostOfId: string | null;
  quoteOfId: string | null;
  metrics: {
    likes: number;
    replies: number;
    reposts: number;
    quotes: number;
    impressions: number;
    engagement: number;
  };
  media: MediaItem[];
  urls: string[];
  author: { username: string | null; name: string | null };
  hasMedia: boolean;
  mediaCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  timestamp: number;
}

export interface Account {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isDemo: boolean;
  connectedAt: string;
  lastSyncedAt: string | null;
  lastSyncStatus: string;
  lastSyncError: string | null;
  lastSyncCount: number;
  hasWriteScope: boolean;
  scopes: string[];
  tokenExpiresAt: string | null;
  totalPosts: number;
  deletedPosts: number;
}

export interface Session {
  authenticated: boolean;
  user?: { id: string };
  accounts?: Account[];
  activeAccountId?: string;
  demoMode: boolean;
  oauthConfigured: boolean;
}

export interface ActivityFilters {
  category: Category;
  q: string;
  from: string | null;
  to: string | null;
  mediaType: 'any' | MediaKind;
  minLikes: number | null;
  maxLikes: number | null;
  minEngagement: number | null;
  maxEngagement: number | null;
  source: 'any' | 'api' | 'archive';
  sort: SortOption;
  page: number;
  pageSize: number;
  includeDeleted: boolean;
}

export const defaultFilters: ActivityFilters = {
  category: 'all',
  q: '',
  from: null,
  to: null,
  mediaType: 'any',
  minLikes: null,
  maxLikes: null,
  minEngagement: null,
  maxEngagement: null,
  source: 'any',
  sort: 'newest',
  page: 1,
  pageSize: 50,
  includeDeleted: false,
};

export interface ActivityResponse {
  accountId: string;
  items: Post[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: ActivityFilters;
  facets: Record<Category, number>;
  limits: { maxJobItems: number };
}

export interface DashboardData {
  stats: {
    total: number;
    originals: number;
    replies: number;
    reposts: number;
    quotes: number;
    media: number;
    mediaPhotos: number;
    deleted: number;
    archived: number;
    likes: number;
    engagement: number;
    oldestAt: string | null;
    newestAt: string | null;
  };
  series: Array<{ month: string; total: number; replies: number; reposts: number; media: number }>;
  opportunities: Array<{
    key: string;
    title: string;
    description: string;
    tone: string;
    count: number;
    filters: Partial<ActivityFilters>;
  }>;
  recentJobs: Job[];
  recentPosts: Post[];
  limits: { maxJobItems: number };
  demoMode: boolean;
}

export type JobStatus = 'queued' | 'running' | 'paused' | 'completed' | 'completed_with_errors' | 'cancelled' | 'failed';

export interface Job {
  id: string;
  accountId: string;
  name: string;
  action: 'delete' | 'unrepost' | 'mixed';
  status: JobStatus;
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  pending: number;
  progress: number;
  criteria: Record<string, unknown> & { description?: string };
  error: string | null;
  resumeAt: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  isDemo: boolean;
}

export interface JobDetail extends Job {
  failedItems: Array<{ id: string; xPostId: string; kind: string; errorCode: string | null; error: string | null; attempts: number }>;
  recentItems: Array<{ id: string; xPostId: string; kind: string; status: string; error: string | null; processedAt: string | null }>;
  pendingSample: Array<{ id: string; xPostId: string; kind: string }>;
}

export interface PreviewResult {
  total: number;
  deletable: number;
  reposts: number;
  posts: number;
  willProcess: number;
  truncated: boolean;
  maxItems: number;
  simulated?: boolean;
  estimatedMinutes: number;
  sample: Post[];
  description: string;
  filters: ActivityFilters;
  warning: string;
}

export interface Rule {
  id: string;
  name: string;
  filters: Partial<ActivityFilters>;
  createdAt: string;
}

export interface ArchiveImport {
  id: string;
  accountId: string;
  filename: string;
  status: 'processing' | 'complete' | 'failed';
  postsFound: number;
  inserted: number;
  updated: number;
  skipped: number;
  mediaCount: number;
  oldestAt: string | null;
  newestAt: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
}

export interface ArchiveResponse {
  stats: {
    archivedPosts: number;
    apiPosts: number;
    mediaPosts: number;
    oldestAt: string | null;
    newestAt: string | null;
  };
  imports: ArchiveImport[];
  coverage: {
    apiTimelineLimit: number;
    apiMentionsLimit: number;
    archiveProvidesFullHistory: boolean;
    note: string;
  };
}

export interface HistoryResponse {
  jobs: Job[];
  activity: Array<{ id: string; action: string; detail: Record<string, unknown>; createdAt: string }>;
  overview?: { deleted: number; failed: number; jobs: number; reviewed: number };
}
