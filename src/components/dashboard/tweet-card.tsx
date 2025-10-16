'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Tweet } from '@/domain/entities';
import { Heart, MessageCircle, Repeat, Share2 } from 'lucide-react';

export type SerializableTweet = Omit<Tweet, 'createdAt'> & { createdAt: string };

type Props = {
  tweet: SerializableTweet;
};

export function TweetCard({ tweet }: Props) {
  const media = tweet.media[0];
  const createdAt = new Date(tweet.createdAt);
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(createdAt);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50 shadow transition hover:border-brand/60">
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
        {media?.type === 'photo' && media.url ? (
          <Image
            src={media.url}
            alt={tweet.text.slice(0, 140) || 'Média du tweet'}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : media?.type !== 'photo' && media?.url ? (
          <video
            src={media.url}
            controls
            muted
            playsInline
            poster={media.previewImageUrl ?? undefined}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">
            Média non disponible
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-neutral-900/80 px-2 py-1 text-xs text-neutral-200 backdrop-blur">
          <span>@{tweet.author?.username ?? tweet.authorId}</span>
          {tweet.author?.verified ? <span className="text-brand">✔︎</span> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-3 text-sm text-neutral-100">{tweet.text}</p>
        <div className="flex flex-wrap gap-2 text-xs text-brand">
          {tweet.hashtags.map((tag) => (
            <Link key={tag} href={`/dashboard?q=${encodeURIComponent(`#${tag}`)}`}>
              #{tag}
            </Link>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-neutral-400">
          <time dateTime={createdAt.toISOString()}>{formattedDate}</time>
          <div className="flex items-center gap-4 text-neutral-300">
            <Metric icon={<Heart size={14} />} label={tweet.metrics.likeCount} />
            <Metric icon={<Repeat size={14} />} label={tweet.metrics.retweetCount} />
            <Metric icon={<MessageCircle size={14} />} label={tweet.metrics.replyCount} />
            <Metric icon={<Share2 size={14} />} label={tweet.metrics.quoteCount} />
          </div>
        </div>
        <Link
          href={tweet.permalink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-brand/40 bg-brand/20 px-3 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/30"
        >
          Ouvrir sur X
        </Link>
      </div>
    </article>
  );
}

function Metric({ icon, label }: { icon: React.ReactNode; label: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {label.toLocaleString('fr-FR')}
    </span>
  );
}
