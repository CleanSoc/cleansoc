import { memo } from 'react';
import {
  ExternalLink,
  Eye,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Play,
  Quote,
  Repeat2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { Post } from '../lib/types';
import { cn, formatDate, formatNumber, mediaGradients } from '../lib/format';
import { Badge, Checkbox } from './ui';

interface PostCardProps {
  post: Post;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
  onPreview?: (post: Post) => void;
  compact?: boolean;
  showSource?: boolean;
}

export const PostCard = memo(function PostCard({
  post,
  selectable,
  selected,
  onToggle,
  onPreview,
  compact,
  showSource,
}: PostCardProps) {
  const deleted = post.isDeleted;
  const media = post.media ?? [];

  return (
    <article
      className={cn(
        'group relative rounded-xl border bg-surface transition-colors',
        selected ? 'border-accent/50 bg-accent-soft/25' : 'border-line hover:border-line-strong',
        deleted && 'opacity-60',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="flex gap-3">
        {selectable && (
          <div className="pt-0.5">
            <Checkbox
              checked={Boolean(selected)}
              onChange={() => onToggle?.(post.id)}
              label={`Select ${post.kind} from ${formatDate(post.createdAt)}`}
              size="sm"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-muted">
            <KindBadge kind={post.kind} isQuote={post.isQuote} />
            <span className="text-line-strong">·</span>
            <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()}>
              {formatDate(post.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
            </time>
            {post.inReplyToUser && (
              <>
                <span className="text-line-strong">·</span>
                <span className="truncate">
                  replying to <span className="text-ink-soft">@{post.inReplyToUser.replace(/^@/, '')}</span>
                </span>
              </>
            )}
            {showSource && post.source === 'archive' && (
              <Badge tone="outline" className="ml-auto">
                Archive
              </Badge>
            )}
            {deleted && (
              <Badge tone="danger" className="ml-auto">
                <Trash2 className="size-3" /> Removed
              </Badge>
            )}
          </div>

          {post.text && (
            <p className={cn('mt-1.5 whitespace-pre-wrap break-words text-ink', compact ? 'text-[13px] leading-5' : 'text-[13.5px] leading-[1.6]')}>
              {post.text}
            </p>
          )}

          {media.length > 0 && <MediaGrid post={post} />}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted">
            <Metric icon={<Heart className="size-3.5" />} value={post.metrics.likes} label="likes" />
            <Metric icon={<MessageCircle className="size-3.5" />} value={post.metrics.replies} label="replies" />
            <Metric icon={<Repeat2 className="size-3.5" />} value={post.metrics.reposts} label="reposts" />
            <Metric icon={<Quote className="size-3.5" />} value={post.metrics.quotes} label="quotes" />
            {post.metrics.impressions > 0 && (
              <Metric icon={<Eye className="size-3.5" />} value={post.metrics.impressions} label="views" />
            )}
            <div className="ml-auto flex items-center gap-2">
              {post.metrics.engagement <= 1 && post.kind !== 'repost' && (
                <span className="hidden items-center gap-1 text-[10.5px] text-warn sm:inline-flex">
                  <Sparkles className="size-3" /> low engagement
                </span>
              )}
              {onPreview && (
                <button
                  onClick={() => onPreview(post)}
                  className="rounded-md px-1.5 py-0.5 text-[11.5px] font-medium text-accent opacity-0 transition-opacity hover:underline focus-visible:opacity-100 group-hover:opacity-100"
                >
                  Cleanup…
                </button>
              )}
              <a
                href={`https://x.com/i/web/status/${post.xPostId}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-[11.5px] text-muted transition-colors hover:text-ink"
                title="Open on X (if it still exists)"
              >
                <ExternalLink className="size-3.5" />
                <span className="sr-only">Open on X</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

function KindBadge({ kind, isQuote }: { kind: string; isQuote: boolean }) {
  if (kind === 'reply') {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
        <MessageCircle className="size-3" /> Reply
      </span>
    );
  }
  if (kind === 'repost') {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
        <Repeat2 className="size-3" /> Repost
      </span>
    );
  }
  if (isQuote) {
    return (
      <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
        <Quote className="size-3" /> Quote
      </span>
    );
  }
  return <span className="font-medium text-ink-soft">Post</span>;
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 tabular" title={`${value.toLocaleString()} ${label}`}>
      {icon}
      {formatNumber(value)}
    </span>
  );
}

function MediaGrid({ post }: { post: Post }) {
  const media = post.media;
  return (
    <div
      className={cn(
        'mt-2.5 grid gap-1.5 overflow-hidden rounded-lg',
        media.length === 1 ? 'max-w-md grid-cols-1' : 'max-w-md grid-cols-2',
      )}
    >
      {media.slice(0, 4).map((item, index) => {
        const src = item.previewUrl ?? item.url;
        return (
          <a
            key={index}
            href={src ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(
              'relative block overflow-hidden rounded-lg border border-line',
              media.length === 1 ? 'aspect-video' : 'aspect-square',
              !src && 'pointer-events-none',
            )}
            style={!src ? { background: mediaGradients[item.gradient ?? index % mediaGradients.length] } : undefined}
          >
            {src ? (
              <img src={src} alt={item.altText ?? 'Post media'} loading="lazy" className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1.5 text-white/85">
                {item.type === 'video' ? <Play className="size-6" /> : <ImageIcon className="size-5" />}
                <span className="text-[10.5px] font-medium uppercase tracking-wider">
                  {item.type === 'animated_gif' ? 'GIF' : item.type}
                </span>
              </div>
            )}
            {item.type !== 'photo' && (
              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                {item.type === 'video' ? 'Video' : 'GIF'}
              </span>
            )}
          </a>
        );
      })}
      {media.length > 4 && (
        <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
          +{media.length - 4}
        </span>
      )}
    </div>
  );
}
